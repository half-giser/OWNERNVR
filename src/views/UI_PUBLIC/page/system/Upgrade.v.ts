/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:49:04
 * @Description: 系统升级
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 10:09:21
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import BaseInputEncryptPwdPop from '../../components/auth/BaseInputEncryptPwdPop.vue'
import UpgradeBackUpPop from './UpgradeBackUpPop.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import type WebsocketPlugin from '@/utils/websocket/websocketPlugin'
import WebsocketUpload from '@/utils/websocket/websocketUpload'
import WebsocketDownload from '@/utils/websocket/websocketDownload'
import { type CmdUploadFileOpenOption } from '@/utils/websocket/websocketCmd'
import { SystemUpgradeForm } from '@/types/apiType/system'
import { UserCheckAuthForm, UserInputEncryptPwdForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        BaseInputEncryptPwdPop,
        UpgradeBackUpPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, closeAllLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()
        const Plugin = inject('Plugin') as PluginType
        const userSession = useUserSessionStore()
        // 用户鉴权表单数据
        const userCheckAuthForm = new UserCheckAuthForm()
        // 用户密码加密表单数据
        const userInputEncryptPwdForm = new UserInputEncryptPwdForm()

        let file: File

        const pageData = ref({
            notifications: [] as string[],
            isUploadDisabled: false,
            isUpgradeDisabled: true,
            isBackUpAndUpgradeDisabled: true,
            isEncryptPwd: false,
            isCheckAuth: false,
            isUpgradeBackUp: false,
            checkAuthTip: '',
            checkAuthType: 'upgrade',
            currentRunningSystem: '',
            systemList: [
                {
                    id: 'main',
                    label: `${Translate('IDCS_MAIN_SYSTEM').formatForLang('1')} :`,
                    value: '',
                },
                {
                    id: 'backup',
                    label: `${Translate('IDCS_MAIN_SYSTEM').formatForLang('2')} :`,
                    value: '',
                },
            ],
            accept: systemCaps.devSystemType === 1 ? '.pkg' : '.fls',
            upgradeNote: '',
        })

        const formData = ref(new SystemUpgradeForm())

        const SYSTEM_STATUS_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_NORMAL'),
            upgradeStart: Translate('IDCS_SYSTEM_UPGRADING'),
            upgradeSuccess: Translate('IDCS_SYSTEM_STATUS_UPGRADE_SUCCESS'),
            upgradeFailed: Translate('IDCS_UPGRADE_FAIL_TIP'),
            runWatch: Translate('IDCS_SYSTEM_STATUS_RUN_WATCH'),
            runWatchFailed: Translate('IDCS_UPGRADE_FAIL_TIP'),
            runWatchFailedReserve: Translate('IDCS_UPGRADE_FAIL_TIP'),
            upgradeSync: Translate('IDCS_SYSTEM_STATUS_UPGRADE_SYNC'),
            upgradeSyncFailed: Translate('IDCS_UPGRADE_FAIL_TIP'),
            upgradeRollbackSync: Translate('IDCS_SYSTEM_STATUS_UPGRADE_BACK_SYNC'),
            upgradeRollbackSyncFailed: Translate('IDCS_UPGRADE_FAIL_TIP'),
            selfSync: Translate('IDCS_SYSTEM_STATUS_SELF_HEAL_SYNC'),
            selfSyncFailed: Translate('IDCS_SYSTEM_STATUS_SELF_HEAL_SYNC_FAILED'),
        }

        const TRANS_MAPPING = {
            uploading: Translate('IDCS_UPLOADING_FILE'),
            uploadReboot: Translate('IDCS_UPLOAD_REBOOT'),
        }

        const isSupportH5 = computed(() => {
            return Plugin.IsSupportH5()
        })

        let clickFlag = false
        let uploadTimer: NodeJS.Timeout | 0 = 0

        /**
         * @description OCX通知回调
         * @param {Function} $
         */
        const notify = ($: XMLQuery) => {
            // 升级进度/备份进度
            if ($("/statenotify[@type='FileNetTransportProgress']").length) {
                const progress = $("/statenotify[@type='FileNetTransportProgress']/progress").text()
                pageData.value.isCheckAuth = false
                if ($("/statenotify[@type='FileNetTransportProgress']/action").text() == 'Export') {
                    if (progress == '100%' && clickFlag) {
                        upgrade()
                        clickFlag = false
                    }
                    closeAllLoading()
                } else {
                    if (progress == '100%') {
                        pageData.value.upgradeNote = TRANS_MAPPING.uploadReboot
                        openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                        //发送升级指令，但不一定会收到应答，需要延时检测重启
                        uploadTimer = reconnect()
                    } else {
                        closeAllLoading()
                        pageData.value.upgradeNote = TRANS_MAPPING.uploading + '&nbsp;&nbsp;' + progress
                    }
                }
            }
            //网络断开
            else if ($("/statenotify[@type='FileNetTransport']").length) {
                closeAllLoading()
                if ($("/statenotify[@type='FileNetTransport']/errorCode").length) {
                    const errorCode = Number($("/statenotify[@type='FileNetTransport']/errorCode").text())
                    handleErrorMsg(errorCode)
                }
            }
            // 升级文件校验
            else if ($("/statenotify[@type='UploadUpgradeCheckFileBase64']").length) {
                const fileHeadBase64 = $("/statenotify[@type='UploadUpgradeCheckFileBase64']/base64").text()
                // 若插件返回的升级包校验头内容为空，说明插件读取升级包失败。（可能是由于升级包文件被占用,另一web客户端正在升级）NVRUSS78-226
                if (!fileHeadBase64) {
                    closeAllLoading()
                    showMessage(Translate('IDCS_DEVICE_NOT_ALLOW_UPGRADE'))
                    return
                }
                const sendXml = rawXml`
                    <content>
                        <filehead>${fileHeadBase64}</filehead>
                    </content>
                `
                queryUpgradeFileHead(sendXml).then((result) => {
                    const $$ = queryXml(result)
                    const errorCode = Number($$('/content/errorCode').text())
                    if ($$('//status').text() === 'success') {
                        if (errorCode !== 0) handleErrorMsg(errorCode)
                    }
                    // 若errorCode为0，即正常低升高版本
                    if (errorCode == 0) upgrade(true)
                })
            }
        }

        /**
         * @description 获取系统信息
         */
        const getSystemStatus = async () => {
            const result = await queryDoubleSystemInfo()
            const $ = queryXml(result)
            pageData.value.currentRunningSystem = $('//content/curRunSystem').text()
            pageData.value.systemList[0].value = SYSTEM_STATUS_MAPPING[$('//content/mainSystemStatus').text()]
            pageData.value.systemList[1].value = SYSTEM_STATUS_MAPPING[$('//content/backupSystemStatus').text()]
        }

        /**
         * @description 点击上传（OCX）
         */
        const handleOCXUpload = () => {
            pageData.value.upgradeNote = ''
            const sendXML = systemCaps.devSystemType === 1 ? OCX_XML_OpenFileBrowser('OPEN_FILE', 'pkg') : OCX_XML_OpenFileBrowser('OPEN_FILE', 'fls')
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin() as WebsocketPlugin, sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.filePath = path
                    pageData.value.isUpgradeDisabled = false
                    pageData.value.isBackUpAndUpgradeDisabled = false
                } else {
                    formData.value.filePath = ''
                    pageData.value.isUpgradeDisabled = true
                    pageData.value.isBackUpAndUpgradeDisabled = true
                }
            })
        }

        /**
         * @description 点击上传（H5）
         * @param {Event} e
         */
        const handleH5Upload = (e: Event) => {
            pageData.value.upgradeNote = ''

            const files = (e.target as HTMLInputElement).files

            if (files && files.length > 0) {
                const name = files[0].name

                file = files[0]

                if (systemCaps.devSystemType === 1) {
                    // 只能选择.pkg后缀的文件
                    if (name.indexOf('.pkg') === -1) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('.pkg'),
                        })
                        return
                    }
                } else {
                    // 只能选择.fls后缀的文件
                    if (name.indexOf('.fls') === -1) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('.fls'),
                        })
                        return
                    }
                }
                formData.value.filePath = name
                pageData.value.isUpgradeDisabled = false
                pageData.value.isBackUpAndUpgradeDisabled = false
            } else {
                formData.value.filePath = ''
                pageData.value.isUpgradeDisabled = true
                pageData.value.isBackUpAndUpgradeDisabled = true
            }
        }

        /**
         * @description 点击更新，打开鉴权弹窗
         */
        const handleUpgrade = () => {
            pageData.value.isCheckAuth = true
            pageData.value.checkAuthTip = Translate('IDCS_SYSTEM_UPGRADE_QUESTION')
            pageData.value.checkAuthType = 'upgrade'
        }

        /**
         * @description 点击备份与更新，打开鉴权弹窗
         */
        const handleBackupAndUpgrade = () => {
            pageData.value.isCheckAuth = true
            pageData.value.checkAuthTip = Translate('IDCS_BACKUP_AND_UPGRADE_WARNING')
            pageData.value.checkAuthType = 'backupAndUpgrade'
        }

        /**
         * @description 鉴权弹窗确认回调
         * @param {UserCheckAuthForm} e
         */
        const confirmUpgrade = (e: UserCheckAuthForm) => {
            userCheckAuthForm.userName = e.userName
            userCheckAuthForm.hexHash = e.hexHash
            userCheckAuthForm.password = e.password
            userInputEncryptPwdForm.password = ''

            if (pageData.value.checkAuthType === 'upgrade') {
                upgrade()
            } else {
                // pageData.value.isCheckAuth = false
                pageData.value.isEncryptPwd = true
            }
        }

        /**
         * @description 密码加密弹窗确认回调
         * @param {UserInputEncryptPwdForm} e
         */
        const confirmBackUpAndUpgrade = async (e: UserInputEncryptPwdForm) => {
            openLoading()

            pageData.value.isEncryptPwd = false
            userInputEncryptPwdForm.password = e.password
            clickFlag = true

            const sendXml = rawXml`
                <networkConfigSwitch>true</networkConfigSwitch>
                <encryptionConfigSwitch>true</encryptionConfigSwitch>
                <auth>
                    <userName>${userCheckAuthForm.userName}</userName>
                    <password>${userCheckAuthForm.hexHash}</password>
                    <secPassword>${userInputEncryptPwdForm.password}</secPassword>
                </auth>
            `
            const result = await exportConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()
            if ($('//status').text() === 'success') {
                pageData.value.isCheckAuth = false
                if (isSupportH5.value) {
                    new WebsocketDownload({
                        config: {
                            file_id: 'config_file',
                        },
                        fileName: 'ConfigurationBackupFile',
                        success: () => {
                            upgrade()
                        },
                    })
                } else {
                    pageData.value.isUpgradeBackUp = true
                }
            } else {
                const errorCode = Number($('//errorCode').text())
                handleErrorMsg(errorCode)
            }
        }

        /**
         * @description OCX备份导出路径弹窗确认回调
         * @param {string} filePath
         */
        const confirmOCXBackUp = (filePath: string) => {
            pageData.value.isUpgradeBackUp = false
            const param = {
                filePath: filePath,
                version: '500',
                authName: userCheckAuthForm.userName,
                authPwd: userCheckAuthForm.password,
                secPassword: userInputEncryptPwdForm.password, // 加密密码
            }
            openLoading()
            const sendXML = OCX_XML_FileNetTransport('Export', param)
            Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
        }

        /**
         * @description 直接关闭密码加码弹窗回调
         */
        const closeBackUpAndUpgrade = () => {
            pageData.value.isEncryptPwd = false
            upgrade()
        }

        /**
         * @description 系统更新
         * @param {boolean} noCheckversion
         */
        const upgrade = (noCheckversion = false) => {
            openLoading()

            if (isSupportH5.value) {
                const obj: CmdUploadFileOpenOption = {
                    file_id: 'upgrade_file',
                    size: file.size,
                    sign_method: 'MD5',
                    param: {
                        user_name: userCheckAuthForm.userName,
                        password: userCheckAuthForm.hexHash,
                        secPassword: userInputEncryptPwdForm.password, // 加密密码
                        token: userSession.token,
                    },
                }
                if (noCheckversion) obj.checkversion = false // checkversion为false, 则启动降级升级
                new WebsocketUpload({
                    file: file,
                    config: obj,
                    progress: (step) => {
                        pageData.value.isCheckAuth = false
                        pageData.value.upgradeNote = `${TRANS_MAPPING.uploading}&nbsp;&nbsp;${step}%`
                        if (step === 100) {
                            pageData.value.upgradeNote = TRANS_MAPPING.uploadReboot
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                            uploadTimer = reconnect()
                        } else {
                            closeLoading()
                        }
                    },
                    success: () => {
                        closeLoading()
                    },
                    error: (errorCode) => {
                        closeLoading()
                        pageData.value.upgradeNote = ''
                        handleErrorMsg(errorCode)
                    },
                })
            } else {
                if (noCheckversion) {
                    const param = {
                        filePath: formData.value.filePath,
                        version: 'SmallMemory',
                        authName: userCheckAuthForm.userName,
                        authPwd: userCheckAuthForm.password,
                        secPassword: userInputEncryptPwdForm.password,
                        token: userSession.token,
                    }
                    const sendXML = OCX_XML_FileNetTransport('Upgrade', param)
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    openLoading()
                    const sendXML = OCX_XML_CheckUpgradeFile('ImportUpgradeCheckFile', 5120, formData.value.filePath)
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 错误信息弹窗
         * @param {string} message
         */
        const showMessage = (message: string) => {
            openMessageTipBox({
                type: 'info',
                message,
            })
        }

        /**
         * @description 错误信息处理
         * @param {number} errorCode
         */
        const handleErrorMsg = (errorCode: number) => {
            if (![ErrorCode.USER_ERROR_PWD_ERR, ErrorCode.USER_ERROR_NO_USER].includes(errorCode)) {
                pageData.value.isCheckAuth = false
            }

            switch (Number(errorCode)) {
                case ErrorCode.USER_ERROR_PWD_ERR:
                case ErrorCode.USER_ERROR_NO_USER:
                    showMessage(Translate('IDCS_DEVICE_PWD_ERROR'))
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    showMessage(Translate('IDCS_NO_AUTH'))
                    break
                case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                    showMessage(Translate('IDCS_OCX_NET_DISCONNECT'))
                    break
                case ErrorCode.USER_ERROR_FILE_TYPE_ERROR:
                    showMessage(Translate('IDCS_FILE_TYPE_ERROR'))
                    break
                case ErrorCode.USER_ERROR_NO_PARENT_AREA_AUTH:
                    showMessage(Translate('IDCS_CHECK_FILE_ERROR'))
                    break
                case ErrorCode.USER_ERROR_NO_AUTH_EDIT_SAMERIGHT:
                    showMessage(Translate('IDCS_UPGRADE_SAME_VERSION'))
                    break
                case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    showMessage(Translate('IDCS_NO_DISK'))
                    break
                case ErrorCode.USER_ERROR_OPEN_FILE_ERROR:
                    showMessage(Translate('IDCS_OPEN_FILE_ERROR'))
                    break
                case ErrorCode.USER_ERROR_DEVICE_BUSY:
                    showMessage(Translate('IDCS_DEVICE_BUSY'))
                    break
                case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_LOGIN_OVERTIME'),
                    }).finally(() => {
                        Logout()
                    })
                    break
                // 原项目中 536871017 这个errorcode出现了两次，此处不会执行到
                // case ErrorCode.USER_ERROR_NO_PARENT_AREA_AUTH:
                //     // 校验升级包是低版本
                //     openMessageTipBox({
                //         type: 'question',
                //         message: Translate('IDCS_UPGRADE_INCOMPATIBLE_VERSION_CONFIRM'),
                //     }).then(() => {
                //         upgrade(true)
                //     })
                //     break
                case ErrorCode.USER_ERROR_UNSUPPORTED_CMD:
                case 536871060:
                    showMessage(Translate('IDCS_DEVICE_NOT_ALLOW_UPGRADE'))
                    break
                case ErrorCode.USER_ERROR_FILE_NO_EXISTED:
                    break
                default:
                    showMessage(Translate('IDCS_SYSTEM_UPGRADE_FAIL'))
                    break
            }
        }

        watch(
            isSupportH5,
            (newVal) => {
                if (!newVal && !Plugin.IsPluginAvailable()) {
                    Plugin.SetPluginNoResponse()
                    Plugin.ShowPluginNoResponse()
                }

                if (newVal && isHttpsLogin()) {
                    // 无插件https访问时，提示不支持升级
                    pageData.value.notifications.push(formatHttpsTips(Translate('IDCS_UPGRADE')))
                    pageData.value.isUploadDisabled = true
                }

                if (!newVal) {
                    // 设置OCX模式
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            Plugin.VideoPluginNotifyEmitter.addListener(notify)
            Plugin.SetPluginNotice('#layout2Content')

            getSystemStatus()
        })

        onBeforeUnmount(() => {
            clearTimeout(uploadTimer)

            Plugin.VideoPluginNotifyEmitter.removeListener(notify)
        })

        return {
            isSupportH5,
            formData,
            pageData,
            handleOCXUpload,
            handleH5Upload,
            handleUpgrade,
            confirmUpgrade,
            handleBackupAndUpgrade,
            confirmBackUpAndUpgrade,
            closeBackUpAndUpgrade,
            confirmOCXBackUp,
            BaseCheckAuthPop,
            BaseInputEncryptPwdPop,
            UpgradeBackUpPop,
        }
    },
})
