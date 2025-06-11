/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:49:04
 * @Description: 系统升级
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import UpgradeBackUpPop from './UpgradeBackUpPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        UpgradeBackUpPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        // 用户鉴权表单数据
        const userCheckAuthForm = new UserCheckAuthForm()

        let file: File

        const pageData = ref({
            isUploadDisabled: false,
            isUpgradeDisabled: true,
            isBackUpAndUpgradeDisabled: true,
            isEncryptPwd: false,
            isCheckAuth: false,
            isUpgradeBackUp: false,
            checkAuthType: 'upgrade',
            currentRunningSystem: '',
            systemList: [
                {
                    id: 'main',
                    label: `${Translate('IDCS_MAIN_SYSTEM').formatForLang(1)} :`,
                    value: '',
                },
                {
                    id: 'backup',
                    label: `${Translate('IDCS_MAIN_SYSTEM').formatForLang(2)} :`,
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
            uploadReboot: Translate('IDCS_SYSTEM_UPGRADING_S') + Translate('IDCS_SYSTEM_UPGRADING_TIP'),
        }

        let clickFlag = false
        let uploadTimer: NodeJS.Timeout | 0 = 0

        const plugin = usePlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    plugin.ExecuteCmd(sendXML)
                }

                if (mode.value === 'h5' && isHttpsLogin()) {
                    // 无插件https访问时，提示不支持升级
                    openNotify(formatHttpsTips(Translate('IDCS_UPGRADE')))
                    pageData.value.isUploadDisabled = true
                }
            },
            onMessage: ($, stateType) => {
                // 升级进度/备份进度
                if (systemCaps.devSystemType === 1) {
                    if (stateType === 'FileNetTransportProgress') {
                        const progress = $('statenotify/progress').text()
                        if ($('statenotify/action').text() === 'Export') {
                            if (progress === '100%' && clickFlag) {
                                upgrade()
                                clickFlag = false
                            }
                            closeLoading()
                        } else {
                            if (progress === '100%') {
                                pageData.value.upgradeNote = TRANS_MAPPING.uploadReboot
                                openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                                //发送升级指令，但不一定会收到应答，需要延时检测重启
                                uploadTimer = reconnect()
                            } else {
                                pageData.value.upgradeNote = TRANS_MAPPING.uploading + '  ' + progress
                            }
                        }
                    }

                    //网络断开
                    if (stateType === 'FileNetTransport') {
                        closeLoading()
                        if ($('statenotify/errorCode').length) {
                            const errorCode = $('statenotify/errorCode').text().num()
                            handleErrorMsg(errorCode)
                        }
                    }

                    // 升级文件校验
                    if (stateType === 'UploadUpgradeCheckFileBase64') {
                        const fileHeadBase64 = $('statenotify/base64').text()
                        // 若插件返回的升级包校验头内容为空，说明插件读取升级包失败。（可能是由于升级包文件被占用,另一web客户端正在升级）NVRUSS78-226
                        if (!fileHeadBase64) {
                            closeLoading()
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
                            const errorCode = $$('content/errorCode').text().num()
                            if ($$('status').text() === 'success') {
                                if (errorCode !== 0) handleErrorMsg(errorCode)
                            }
                            // 若errorCode为0，即正常低升高版本
                            if (errorCode === 0) upgrade(true)
                            closeLoading()
                        })
                    }
                } else {
                    if (stateType === 'FileNetTransportProgress') {
                        const progress = $('statenotify/progress').text()
                        closeLoading()
                        pageData.value.isCheckAuth = false

                        if (progress === '100%') {
                            pageData.value.upgradeNote = TRANS_MAPPING.uploadReboot
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                            //发送升级指令，但不一定会收到应答，需要延时检测重启
                            uploadTimer = reconnect()
                        } else {
                            pageData.value.upgradeNote = TRANS_MAPPING.uploading + '  ' + progress
                        }
                    }

                    if (stateType === 'FileNetTransport') {
                        closeLoading()
                        const errorCode = $('statenotify/errorCode').text().num()
                        if (errorCode !== 0) handleErrorMsg(errorCode)
                    }
                }
            },
        })

        const isSupportH5 = computed(() => {
            return plugin.IsSupportH5()
        })

        /**
         * @description 获取系统信息
         */
        const getSystemStatus = async () => {
            const result = await queryDoubleSystemInfo()
            const $ = queryXml(result)
            pageData.value.currentRunningSystem = $('content/curRunSystem').text()
            pageData.value.systemList[0].value = SYSTEM_STATUS_MAPPING[$('content/mainSystemStatus').text()]
            pageData.value.systemList[1].value = SYSTEM_STATUS_MAPPING[$('content/backupSystemStatus').text()]
        }

        /**
         * @description 点击上传（OCX）
         */
        const handleOCXUpload = () => {
            pageData.value.upgradeNote = ''
            const sendXML = systemCaps.devSystemType === 1 ? OCX_XML_OpenFileBrowser('OPEN_FILE', 'pkg') : OCX_XML_OpenFileBrowser('OPEN_FILE', 'fls')
            plugin.AsynQueryInfo(sendXML, (result) => {
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

            if (files && files.length) {
                const name = files[0].name

                file = files[0]

                if (systemCaps.devSystemType === 1) {
                    // 只能选择.pkg后缀的文件
                    if (name.indexOf('.pkg') === -1) {
                        openMessageBox(Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('.pkg'))
                        return
                    }
                } else {
                    // 只能选择.fls后缀的文件
                    if (name.indexOf('.fls') === -1) {
                        openMessageBox(Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('.fls'))
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
            pageData.value.checkAuthType = 'upgrade'
        }

        /**
         * @description 点击备份与更新，打开鉴权弹窗
         */
        const handleBackupAndUpgrade = () => {
            pageData.value.isCheckAuth = true
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

            if (pageData.value.checkAuthType === 'upgrade') {
                upgrade()
            } else {
                confirmBackUpAndUpgrade()
            }
        }

        /**
         * @description 密码加密弹窗确认回调
         * @param {UserInputEncryptPwdForm} e
         */
        const confirmBackUpAndUpgrade = async () => {
            openLoading()

            clickFlag = true

            const sendXml = rawXml`
                <networkConfigSwitch>true</networkConfigSwitch>
                <encryptionConfigSwitch>true</encryptionConfigSwitch>
            `
            const result = await exportConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()
            if ($('status').text() === 'success') {
                pageData.value.isCheckAuth = false
                if (isSupportH5.value) {
                    WebsocketDownload({
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
                const errorCode = $('errorCode').text().num()
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
            }
            openLoading()
            const sendXML = OCX_XML_FileNetTransport('Export', param)
            plugin.ExecuteCmd(sendXML)
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

            if (systemCaps.devSystemType === 1) {
                pageData.value.isCheckAuth = false
            }

            if (isSupportH5.value) {
                const obj: CmdUploadFileOpenOption = {
                    file_id: 'upgrade_file',
                    size: file.size,
                    sign_method: 'MD5',
                    param: {
                        user_name: userCheckAuthForm.userName,
                        password: userCheckAuthForm.hexHash,
                        // secPassword: userInputEncryptPwdForm.password, // 加密密码
                        token: userSession.token,
                    },
                }
                if (noCheckversion) obj.checkversion = false // checkversion为false, 则启动降级升级
                WebsocketUpload({
                    file: file,
                    config: obj,
                    progress: (step) => {
                        if (systemCaps.devSystemType !== 1) {
                            pageData.value.isCheckAuth = false
                        }
                        pageData.value.upgradeNote = `${TRANS_MAPPING.uploading}  ${step}%`
                        closeLoading()
                        if (step === 100) {
                            pageData.value.upgradeNote = TRANS_MAPPING.uploadReboot
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                        }
                    },
                    success: () => {
                        uploadTimer = reconnect()
                    },
                    error: (errorCode) => {
                        closeLoading()
                        pageData.value.upgradeNote = ''
                        handleErrorMsg(errorCode)
                    },
                })
            } else {
                if (systemCaps.devSystemType !== 1 || noCheckversion) {
                    const param = {
                        filePath: formData.value.filePath,
                        version: 'SmallMemory',
                        authName: userCheckAuthForm.userName,
                        authPwd: userCheckAuthForm.password,
                        token: userSession.token,
                    }

                    const sendXML = OCX_XML_FileNetTransport('Upgrade', param)
                    plugin.ExecuteCmd(sendXML)
                } else {
                    openLoading()
                    const sendXML = OCX_XML_CheckUpgradeFile('ImportUpgradeCheckFile', 5120, formData.value.filePath)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 错误信息弹窗
         * @param {string} message
         */
        const showMessage = (message: string) => {
            openMessageBox(message)
        }

        /**
         * @description 错误信息处理
         * @param {number} errorCode
         */
        const handleErrorMsg = (errorCode: number) => {
            switch (errorCode) {
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
                // NTA1-2121 1.4.x不支持降级升级，所以错误码536871017提示“文件校验失败”即可，下面那个错误码536871017的不兼容提示可以不用管
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
                    openMessageBox(Translate('IDCS_LOGIN_OVERTIME')).finally(() => {
                        Logout()
                    })
                    break
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

        onMounted(() => {
            if (systemCaps.devSystemType === 1) {
                getSystemStatus()
            }
        })

        onBeforeUnmount(() => {
            clearTimeout(uploadTimer)
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
            systemCaps,
        }
    },
})
