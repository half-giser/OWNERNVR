/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:50:06
 * @Description: 备份与恢复
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
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
            isCheckAuth: false,
            configSwitchOptions: [
                {
                    label: Translate('IDCS_INCLUDE_NETWORK'),
                    value: 'network',
                },
                {
                    label: Translate('IDCS_INCLUDE_DATA_ENCRYPT_PASSWORD'),
                    value: 'encryption',
                },
            ],
        })

        const plugin = usePlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'h5' && isHttpsLogin()) {
                    openNotify(formatHttpsTips(Translate('IDCS_BACKUP_AND_RESTORE_SET')), true)
                    pageData.value.isUploadDisabled = true
                } else {
                    pageData.value.isUploadDisabled = false
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    plugin.ExecuteCmd(sendXML)
                    if (!exportFormData.value.filePath) {
                        pageData.value.isExportDisabled = true
                    }
                } else {
                    pageData.value.isExportDisabled = false
                }
            },
            onMessage: ($, stateType) => {
                //导入或导出进度
                if (stateType === 'FileNetTransportProgress') {
                    const progress = $('statenotify/progress').text()
                    switch ($('statenotify/action').text()) {
                        case 'Import':
                            closeLoading()
                            pageData.value.isCheckAuth = false
                            if (progress === '100%') {
                                pageData.value.importNote = TRANS_MAPPING.uploadReboot
                                openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                                //发送升级指令，但不一定会收到应答，需要延时检测重启
                                //延时检测重启
                                importTimer = reconnect()
                            } else {
                                pageData.value.importNote = `${TRANS_MAPPING.uploading}  ${progress}`
                            }
                            break
                        case 'Export':
                            if (progress === '100%') {
                                pageData.value.exportNote = TRANS_MAPPING.downloadComplete
                            } else {
                                pageData.value.exportNote = `${TRANS_MAPPING.downloading}  ${progress}`
                            }
                            break
                    }
                }

                //连接成功
                if (stateType === 'connectstate') {
                }

                //网络断开
                else if (stateType === 'FileNetTransport') {
                    closeLoading()
                    if ($('statenotify/errorCode').length) {
                        const errorCode = $('statenotify/errorCode').text().num()
                        // handleErrorMsg(errorCode)
                        switch (errorCode) {
                            case ErrorCode.USER_ERROR_PWD_ERR:
                            case ErrorCode.USER_ERROR_NO_USER:
                                // 用户名/密码错误
                                pageData.value.isCheckAuth = true
                                openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                                break
                            case ErrorCode.USER_ERROR_NO_AUTH:
                                // 鉴权账号无相关权限
                                openMessageBox(Translate('IDCS_NO_AUTH'))
                                break
                            case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                                openMessageBox(Translate('IDCS_OCX_NET_DISCONNECT'))
                                break
                            case ErrorCode.USER_ERROR_DEVICE_BUSY:
                                openMessageBox(Translate('IDCS_DEVICE_BUSY'))
                                break
                            case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                                openMessageBox(Translate('IDCS_LOGIN_OVERTIME')).finally(() => {
                                    Logout()
                                })
                                break
                            case ErrorCode.USER_ERROR_NO_PARENT_AREA_AUTH:
                            case ErrorCode.USER_ERROR_FILE_TYPE_ERROR:
                            case ErrorCode.USER_ERROR_FAIL:
                            default:
                                openMessageBox(Translate('IDCS_RESTORE_CONFIG_FAIL'))
                                break
                        }
                    }
                }
            },
        })

        const importFormData = ref(new SystemRestoreForm())

        const exportFormData = ref(new SystemBackUpForm())

        // 用户鉴权表单数据
        const userCheckAuthForm = new UserCheckAuthForm()
        // 用户密码加密表单数据
        // const userInputEncryptPwdForm = new UserInputEncryptPwdForm()

        const TRANS_MAPPING = {
            uploading: Translate('IDCS_UPLOADING_FILE'),
            uploadReboot: Translate('IDCS_UPLOAD_REBOOT'),
            downloading: Translate('IDCS_EXPORTING_INFO'),
            downloadComplete: Translate('IDCS_EXPORT_SUCCESS'),
        }

        const isSupportH5 = computed(() => {
            return plugin.IsSupportH5()
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
            plugin.AsynQueryInfo(sendXML, (result) => {
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
        }

        /**
         * @description OCX打开文件浏览
         */
        const handleBrowse = () => {
            pageData.value.exportNote = ''
            const sendXML = OCX_XML_OpenFileBrowser('SAVE_FILE', '', 'ConfigurationBackupFile')
            plugin.AsynQueryInfo(sendXML, (result) => {
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
         * @description 导入
         */
        const importFile = (e: UserCheckAuthForm) => {
            if (isSupportH5.value) {
                openLoading()
                WebsocketUpload({
                    file: file,
                    config: {
                        file_id: 'config_file',
                        size: file.size,
                        sign_method: 'MD5',
                        param: {
                            user_name: e.userName, // 二次鉴权用户名
                            password: e.hexHash, // 二次鉴权密码
                            token: userSession.token,
                        },
                    },
                    progress: (step) => {
                        pageData.value.isCheckAuth = false
                        pageData.value.importNote = `${TRANS_MAPPING.uploading}  ${step}%`
                        if (step === 100) {
                            pageData.value.importNote = TRANS_MAPPING.uploadReboot
                            openLoading(LoadingTarget.FullScreen, TRANS_MAPPING.uploadReboot)
                            importTimer = reconnect()
                        } else {
                            closeLoading()
                        }
                    },
                    error: (errorCode) => {
                        closeLoading()
                        pageData.value.importNote = ''
                        if (errorCode === 536870948 || errorCode === 536870947) {
                            // 用户名/密码错误
                            openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                        } else if (errorCode === 536870953) {
                            // 鉴权账号无相关权限
                            openMessageBox(Translate('IDCS_NO_AUTH'))
                        } else if (errorCode === 536870931) {
                            openMessageBox(Translate('IDCS_OCX_NET_DISCONNECT'))
                        } else if (errorCode === 536870945) {
                            // 设备忙
                            openMessageBox(Translate('IDCS_DEVICE_BUSY'))
                        } else {
                            openMessageBox(Translate('IDCS_RESTORE_CONFIG_FAIL'))
                        }
                    },
                })
            } else {
                // 插件密码使用明文交互
                const param = {
                    filePath: importFormData.value.filePath,
                    version: '500',
                    authName: e.userName,
                    authPwd: e.password,
                }
                const sendXML = OCX_XML_FileNetTransport('Import', param)
                openLoading()
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 导出
         */
        const exportFile = async () => {
            openLoading()

            const sendXml = rawXml`
                <networkConfigSwitch>${exportFormData.value.configSwitch.includes('network')}</networkConfigSwitch>
                <encryptionConfigSwitch>${exportFormData.value.configSwitch.includes('encryption')}</encryptionConfigSwitch>
            `
            await exportConfig(sendXml)

            closeLoading()

            if (isSupportH5.value) {
                WebsocketDownload({
                    config: {
                        file_id: 'config_file',
                        param: {
                            user_name: userCheckAuthForm.userName, // 二次鉴权用户名
                            password: userCheckAuthForm.hexHash, // 二次鉴权密码
                            token: userSession.token,
                        },
                    },
                    fileName: 'ConfigurationBackupFile',
                    success: () => {
                        pageData.value.exportNote = TRANS_MAPPING.downloadComplete
                        if (browserInfo.type === 'firefox') {
                            // 兼容H5 火狐显示 NVR145-142
                            pageData.value.exportNote = Translate('IDCS_UPGRADE_DOWN_FINISHED')
                        }
                    },
                    error: () => {},
                })
            } else {
                // 插件密码使用明文交互
                const param = {
                    filePath: exportFormData.value.filePath,
                    version: '500',
                }
                const sendXML = OCX_XML_FileNetTransport('Export', param)
                plugin.ExecuteCmd(sendXML)
            }
        }

        onBeforeUnmount(() => {
            clearTimeout(importTimer)
        })

        return {
            isSupportH5,
            importFormData,
            exportFormData,
            pageData,
            handleH5Upload,
            handleOCXUpload,
            handleImport,
            importFile,
            exportFile,
            handleBrowse,
        }
    },
})
