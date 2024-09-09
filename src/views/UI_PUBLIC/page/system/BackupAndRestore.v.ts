/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:50:06
 * @Description: 备份与恢复
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:25:44
 */
import BaseCheckAuthPop, { UserCheckAuthForm } from '../../components/auth/BaseCheckAuthPop.vue'
import BaseInputEncryptPwdPop, { UserInputEncryptPwdForm } from '../../components/auth/BaseInputEncryptPwdPop.vue'
import WebsocketUpload from '@/utils/websocket/websocketUpload'
import WebsocketDownload from '@/utils/websocket/websocketDownload'
import { SystemRestoreForm, SystemBackUpForm } from '@/types/apiType/system'
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        BaseInputEncryptPwdPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()
        const Plugin = inject('Plugin') as PluginType
        const browserInfo = getBrowserInfo()

        let file: File
        let importTimer: NodeJS.Timeout | number = 0

        const pageData = ref({
            isUploadDisabled: true,
            isImportDisabled: true,
            // isBrowseDisabled: true,
            isExportDisabled: true,
            importNote: '',
            exportNote: '',
            notifications: [] as string[],
            isCheckAuth: false,
            checkAuthTip: '',
            checkAuthType: 'import',
            isEncryptPwd: false,
            encryptPwdTitle: '',
            encryptPwdDecryptFlag: false,
        })

        const importFormData = ref(new SystemRestoreForm())

        const exportFormData = ref(new SystemBackUpForm())

        // 用户鉴权表单数据
        const userCheckAuthForm = new UserCheckAuthForm()
        // 用户密码加密表单数据
        const userInputEncryptPwdForm = new UserInputEncryptPwdForm()

        const TRANS_MAPPING = {
            uploading: Translate('IDCS_UPLOADING_FILE'),
            uploadReboot: Translate('IDCS_UPLOAD_REBOOT'),
            downloading: Translate('IDCS_EXPORTING_INFO'),
            downloadComplete: Translate('IDCS_EXPORT_SUCCESS'),
        }

        const isSupportH5 = computed(() => {
            return Plugin.IsSupportH5()
        })

        /**
         * @description H5方式上传
         * @param {Event} e
         */
        const handleH5Upload = (e: Event) => {
            pageData.value.importNote = ''
            const files = (e.target as HTMLInputElement).files
            if (files && files.length) {
                importFormData.value.filePath = files[0].name
                pageData.value.isImportDisabled = false
                file = files[0]
            } else {
                importFormData.value.filePath = ''
                pageData.value.isImportDisabled = true
            }
        }

        /**
         * @description OCX方式上传
         */
        const handleOCXUpload = () => {
            const sendXML = OCX_XML_OpenFileBrowser('OPEN_FILE')
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    importFormData.value.filePath = path
                    pageData.value.isImportDisabled = false
                } else {
                    importFormData.value.filePath = ''
                    pageData.value.isImportDisabled = true
                }
            })
        }

        /**
         * @description 点击导入，打开鉴权弹窗
         */
        const handleImport = () => {
            pageData.value.isCheckAuth = true
            pageData.value.checkAuthType = 'import'
            pageData.value.checkAuthTip = Translate('IDCS_RESTORE_CONFIG_QUESTION')
        }

        /**
         * @description OCX打开文件浏览
         */
        const handleBrowse = () => {
            pageData.value.exportNote = ''
            const sendXML = OCX_XML_OpenFileBrowser('SAVE_FILE', '', 'ConfigurationBackupFile')
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    exportFormData.value.filePath = path
                    pageData.value.isExportDisabled = false
                } else {
                    exportFormData.value.filePath = ''
                    pageData.value.isExportDisabled = true
                }
            })
        }

        /**
         * @description 点击导出，打开鉴权弹窗
         */
        const handleExport = () => {
            pageData.value.isCheckAuth = true
            pageData.value.checkAuthType = 'export'
            pageData.value.checkAuthTip = ''
        }

        /**
         * @description 鉴权弹窗确认回调
         * @param {UserCheckAuthForm} e
         */
        const confirmCheckAuth = (e: UserCheckAuthForm) => {
            userCheckAuthForm.userName = e.userName
            userCheckAuthForm.hexHash = e.hexHash
            userCheckAuthForm.password = e.password
            userInputEncryptPwdForm.password = ''

            if (pageData.value.checkAuthType === 'import') {
                pageData.value.isEncryptPwd = true
                pageData.value.encryptPwdTitle = Translate('IDCS_IMPORT')
                pageData.value.encryptPwdDecryptFlag = true
            } else {
                pageData.value.isEncryptPwd = true
                pageData.value.encryptPwdTitle = Translate('IDCS_EXPORT')
                pageData.value.encryptPwdDecryptFlag = false
            }
        }

        /**
         * @description 密码加密弹窗确认回调
         * @param {UserInputEncryptPwdForm} e
         */
        const confirmInputEncryptPwd = (e: UserInputEncryptPwdForm) => {
            userInputEncryptPwdForm.password = e.password

            if (pageData.value.checkAuthType === 'import') {
                pageData.value.isEncryptPwd = false
                importFile()
            } else {
                exportFile()
            }
        }

        /**
         * @description 导入
         */
        const importFile = () => {
            if (isSupportH5.value) {
                openLoading(LoadingTarget.FullScreen)
                new WebsocketUpload({
                    file: file,
                    config: {
                        file_id: 'config_file',
                        size: file.size,
                        sign_method: 'MD5',
                        param: {
                            user_name: userCheckAuthForm.userName, // 二次鉴权用户名
                            password: userCheckAuthForm.hexHash, // 二次鉴权密码
                            secPassword: userInputEncryptPwdForm.password, // 加密密码
                            token: userSession.token,
                        },
                    },
                    progress: (step) => {
                        closeLoading(LoadingTarget.FullScreen)
                        pageData.value.isCheckAuth = false
                        pageData.value.importNote = `${TRANS_MAPPING['uploading']}&nbsp;&nbsp;${step}%`
                        if (step === 100) {
                            pageData.value.importNote = TRANS_MAPPING['uploadReboot']
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING['uploadReboot'])
                            importTimer = reconnect()
                        }
                    },
                    error: (errorCode) => {
                        closeLoading(LoadingTarget.FullScreen)
                        pageData.value.importNote = ''
                        handleErrorMsg(errorCode)
                    },
                })
            } else {
                // 插件密码使用明文交互
                const param = {
                    filePath: importFormData.value.filePath,
                    version: '500',
                    authName: userCheckAuthForm.userName,
                    authPwd: userCheckAuthForm.password,
                    secPassword: userInputEncryptPwdForm.password,
                }
                const sendXML = OCX_XML_FileNetTransport('Import', param)
                openLoading(LoadingTarget.FullScreen)
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 导出
         */
        const exportFile = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <networkConfigSwitch>${String(exportFormData.value.isIncludeNetworkConfig)}</networkConfigSwitch>
                <encryptionConfigSwitch>${String(exportFormData.value.isIncludeDataEncryptPwd)}</encryptionConfigSwitch>
                <auth>
                    <userName>${userCheckAuthForm.userName}</userName>
                    <password>${userCheckAuthForm.hexHash}</password>
                    <secPassword>${userInputEncryptPwdForm.password}</secPassword>
                </auth>
            `
            const result = await exportConfig(sendXml)
            const $ = queryXml(result)

            pageData.value.isEncryptPwd = false

            if ($('//status').text() === 'success') {
                if (isSupportH5.value) {
                    new WebsocketDownload({
                        config: {
                            file_id: 'config_file',
                            param: {
                                user_name: userCheckAuthForm.userName, // 二次鉴权用户名
                                password: userCheckAuthForm.hexHash, // 二次鉴权密码
                                secPassword: userInputEncryptPwdForm.password, // 加密密码
                                token: userSession.token,
                            },
                        },
                        fileName: 'ConfigurationBackupFile',
                        success: () => {
                            closeLoading(LoadingTarget.FullScreen)
                            pageData.value.isCheckAuth = false

                            pageData.value.exportNote = TRANS_MAPPING['downloadComplete']
                            if (browserInfo.type === 'firefox') {
                                // 兼容H5 火狐显示 NVR145-142
                                pageData.value.exportNote = Translate('IDCS_UPGRADE_DOWN_FINISHED')
                            }
                        },
                        error: (errorCode) => {
                            closeLoading(LoadingTarget.FullScreen)
                            handleErrorMsg(errorCode)
                        },
                    })
                } else {
                    // 插件密码使用明文交互
                    const param = {
                        filePath: exportFormData.value.filePath,
                        version: '500',
                        authName: userCheckAuthForm.userName,
                        authPwd: userCheckAuthForm.password,
                        secPassword: userInputEncryptPwdForm.password,
                    }
                    const sendXML = OCX_XML_FileNetTransport('Export', param)
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            } else {
                closeLoading(LoadingTarget.FullScreen)
                const errorCode = Number($('//errorCode').text())
                handleErrorMsg(errorCode)
            }
        }

        /**
         * @description 提示框
         * @param {string} message
         */
        const showMsg = (message: string) => {
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
            // NT2-3236 导入配置文件提示用户无权限后，页面按钮被置灰
            if (![ErrorCode.USER_ERROR_PWD_ERR, ErrorCode.USER_ERROR_NO_USER].includes(errorCode)) {
                pageData.value.isCheckAuth = false
            }
            switch (errorCode) {
                case ErrorCode.USER_ERROR_PWD_ERR:
                case ErrorCode.USER_ERROR_NO_USER:
                    // 用户名/密码错误
                    pageData.value.isCheckAuth = true
                    showMsg(Translate('IDCS_DEVICE_PWD_ERROR'))
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    // 鉴权账号无相关权限
                    showMsg(Translate('IDCS_NO_AUTH'))
                    break
                case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                    showMsg(Translate('IDCS_OCX_NET_DISCONNECT'))
                    break
                case ErrorCode.USER_ERROR_DEVICE_BUSY:
                    showMsg(Translate('IDCS_DEVICE_BUSY'))
                    break
                case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_LOGIN_OVERTIME'),
                    }).finally(() => {
                        Logout()
                    })
                    break
                case ErrorCode.USER_ERROR_NO_PARENT_AREA_AUTH:
                case ErrorCode.USER_ERROR_FILE_TYPE_ERROR:
                case ErrorCode.USER_ERROR_FAIL:
                default:
                    showMsg(Translate('IDCS_RESTORE_CONFIG_FAIL'))
                    break
            }
        }

        /**
         * @description OCX数据响应侦听
         * @param {Function} $
         */
        const notify = ($: XMLQuery) => {
            //导入或导出进度
            if ($("/statenotify[@type='FileNetTransportProgress']").length > 0) {
                const progress = $("/statenotify[@type='FileNetTransportProgress']/progress").text()
                switch ($("/statenotify[@type='FileNetTransportProgress']/action").text()) {
                    case 'Import':
                        closeLoading(LoadingTarget.FullScreen)
                        pageData.value.isCheckAuth = false
                        pageData.value.isEncryptPwd = false
                        if (progress == '100%') {
                            pageData.value.importNote = TRANS_MAPPING['uploadReboot']
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING['uploadReboot'])
                            //发送升级指令，但不一定会收到应答，需要延时检测重启
                            //延时检测重启
                            importTimer = reconnect()
                        } else {
                            pageData.value.importNote = `${TRANS_MAPPING['uploading']}&nbsp;&nbsp;${progress}`
                        }
                        break
                    case 'Export':
                        closeLoading(LoadingTarget.FullScreen)
                        pageData.value.isCheckAuth = false
                        pageData.value.isEncryptPwd = false
                        if (progress == '100%') {
                            pageData.value.exportNote = TRANS_MAPPING['downloadComplete']
                        } else {
                            pageData.value.exportNote = `${TRANS_MAPPING['downloading']}&nbsp;&nbsp;${progress}`
                        }
                        break
                }
            }
            //连接成功
            else if ($("/statenotify[@type='connectstate']").length > 0) {
            }
            //网络断开
            else if ($("/statenotify[@type='FileNetTransport']").length > 0) {
                closeLoading(LoadingTarget.FullScreen)
                pageData.value.isEncryptPwd = false
                if ($("/statenotify[@type='FileNetTransport']/errorCode").length > 0) {
                    const errorCode = Number($("/statenotify[@type='FileNetTransport']/errorCode").text())
                    handleErrorMsg(errorCode)
                }
            }
        }

        watch(
            isSupportH5,
            (newVal) => {
                if (!newVal && !Plugin.IsPluginAvailable) {
                    Plugin.SetPluginNoResponse()
                    Plugin.ShowPluginNoResponse()
                }

                if (newVal && isHttpsLogin()) {
                    pageData.value.notifications.push(formatHttpsTips(Translate('IDCS_BACKUP_AND_RESTORE_SET')))
                    pageData.value.isUploadDisabled = true
                } else {
                    pageData.value.isUploadDisabled = false
                }

                if (!newVal) {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    if (!exportFormData.value.filePath) {
                        pageData.value.isExportDisabled = true
                    }
                } else {
                    pageData.value.isExportDisabled = false
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            Plugin.SetPluginNotice('#layout2Content')
            Plugin.VideoPluginNotifyEmitter.addListener(notify)
        })

        onBeforeUnmount(() => {
            clearTimeout(importTimer)
            Plugin.VideoPluginNotifyEmitter.removeListener(notify)
        })

        return {
            isSupportH5,
            importFormData,
            exportFormData,
            pageData,
            handleH5Upload,
            handleOCXUpload,
            handleImport,
            confirmCheckAuth,
            confirmInputEncryptPwd,
            handleBrowse,
            handleExport,
            BaseCheckAuthPop,
            BaseInputEncryptPwdPop,
        }
    },
})
