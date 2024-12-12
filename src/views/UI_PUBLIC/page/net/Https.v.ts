/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:19:55
 * @Description: HTTPS
 */
import WebsocketUpload from '@/utils/websocket/websocketUpload'
import WebsocketDownload from '@/utils/websocket/websocketDownload'
import { type NetHTTPSCertPasswordForm } from '@/types/apiType/net'
import HttpsCertPasswordPop from './HttpsCertPasswordPop.vue'
import HttpsCreateCertPop from './HttpsCreateCertPop.vue'

export default defineComponent({
    components: {
        HttpsCertPasswordPop,
        HttpsCreateCertPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const { openNotify } = useNotification()
        const userSession = useUserSessionStore()

        const pageData = ref({
            // 启用HTTPS复选框是否禁用
            httpSwitchDisabled: true,
            // 是否启用https
            cacheHttpsSwitch: false,
            // 是否有证书
            hasCert: false,
            // 证书选项
            certOptions: [
                {
                    value: 0,
                    label: Translate('IDCS_CREATE_PRIVATE_CERT'),
                },
                {
                    value: 1,
                    label: Translate('IDCS_INSTALL_DIRECTLY'),
                },
                {
                    value: 2,
                    label: Translate('IDCS_CREATE_CERT_REQUEST'),
                },
            ] as SelectOption<number, string>[],
            // 是否显示创建证书弹窗
            isCreateCertPop: false,
            // 是否禁用删除证书
            isDeleteCertDisabled: true,
            // 是否禁用浏览导入证书路径
            isBrowserImportCertDirectDisabled: false,
            // 是否禁用导入证书
            isImportCertDirectDisabled: true,
            // 是否显示输入密码弹窗
            isCertPasswordPop: false,
            // 是否禁用创建证书请求
            isCreateCertReqDisabled: false,
            // 是否禁用浏览导出证书请求路径
            isBrowseExportCertReqDisabled: false,
            // 是否禁用导出证书请求
            isExportCertReqDisabled: true,
            // 是否禁用删除证书请求
            isDeleteCertReqDisabled: true,
            // 是否禁用导入证书请求
            isImportCertReqDisabled: true,
        })

        const formData = ref({
            httpsSwitch: false,
            cert: pageData.value.certOptions[0].value,
        })

        // 证书详情
        const certFormData = ref({
            countryName: '',
            content: '',
        })

        // 私有证书
        const privateCertFormData = ref({})

        // 直接安装证书 表单
        const directCertFormData = ref({
            importFileName: '',
        })
        let directFile: File

        // 证书请求 表单
        const reqCertFormData = ref({
            exportFileName: '',
            importFileName: '',
            reqFileName: '',
        })
        let reqFile: File

        const plugin = setupPlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    plugin.ExecuteCmd(sendXML)
                }
            },
            onMessage: ($) => {
                //导入或导出进度
                if ($("statenotify[@type='FileNetTransportProgress']").length) {
                    const progress = $('statenotify/progress').text()
                    const action = $('statenotify/action').text()
                    if (progress === '100%') {
                        if (action === 'ImportCert') {
                            importCert().then((result) => {
                                const $res = queryXml(result)
                                if ($res('status').text() === 'success') {
                                    commSaveResponseHandler(result)
                                    getCertificate()
                                } else {
                                    closeLoading()
                                    openMessageBox({
                                        type: 'info',
                                        message: Translate('IDCS_IMPORT_FAIL'),
                                    })
                                }
                            })
                        } else {
                            closeLoading()
                        }
                    }
                }
                //连接成功
                else if ($("statenotify[@type='connectstate']").length) {
                    const status = $('statenotify').text().trim()
                    if (status === 'success') {
                        pageData.value.isBrowserImportCertDirectDisabled = false
                    }
                }
                //网络断开
                else if ($("statenotify[@type='FileNetTransport']").length) {
                    closeLoading()
                    handleErrorMsg($('statenotify/errorCode').text().num())
                }
            },
        })

        const isSupportH5 = computed(() => {
            return plugin.IsSupportH5()
        })

        /**
         * @description 获取网络配置，查询是否开启HTTPS
         */
        const getNetPortConfig = async () => {
            const result = await queryNetPortCfg()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                formData.value.httpsSwitch = $('content/httpsSwitch').text().bool()
                pageData.value.cacheHttpsSwitch = formData.value.httpsSwitch
                pageData.value.isDeleteCertDisabled = formData.value.httpsSwitch ? true : false
            }
        }

        /**
         * @description 开启/关闭HTTPS
         */
        const setNetPortConfig = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <httpsSwitch>${formData.value.httpsSwitch}</httpsSwitch>
                </content>
            `
            const result = await editNetPortCfg(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.isDeleteCertDisabled = formData.value.httpsSwitch ? true : false
                if (formData.value.httpsSwitch !== pageData.value.cacheHttpsSwitch) {
                    Logout()
                }
            }
        }

        /**
         * @description 获取证书
         */
        const getCertificate = async () => {
            const result = await queryCert()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                formData.value.cert = 0

                pageData.value.hasCert = true
                pageData.value.httpSwitchDisabled = false

                certFormData.value.countryName = 'C=' + $('content/DN/countryName').text()
                certFormData.value.content = [
                    [Translate('IDCS_ISSUED_TO'), $('content/DN/commonName').text()],
                    [Translate('IDCS_ISSUER'), $('content/DN/issuerCommonName').text()],
                    [Translate('IDCS_VALIDITY_PERIOD') + ': ', $('content/startDate').text() + '~' + $('content/endDate').text()],
                ]
                    .map((item) => {
                        return `${item[0]}${item[1]}`
                    })
                    .join('\r\n')
            } else {
                pageData.value.httpSwitchDisabled = true
                pageData.value.hasCert = false
            }
        }

        /**
         * @description 删除证书
         */
        const deleteCertificate = async () => {
            openLoading()

            const result = await delCert()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                formData.value.cert = pageData.value.certOptions[0].value

                pageData.value.hasCert = false

                certFormData.value.countryName = ''
                certFormData.value.content = ''
            }

            closeLoading()
        }

        /**
         * @description 创建私有证书/证书请求
         */
        const createCertificate = () => {
            pageData.value.isCreateCertPop = true
        }

        /**
         * @description 私有正式/证书请求创建成功回调
         */
        const confirmCreateCertificate = () => {
            pageData.value.isCreateCertPop = false

            if (formData.value.cert === 0) {
                getCertificate()
            } else {
                getCertificateRequest()
            }
        }

        /**
         * @description 获取证书请求
         */
        const getCertificateRequest = async () => {
            const result = await queryCertReq()
            const $ = queryXml(result)
            const countryName = $('content/DN/countryName').text()
            if ($('status').text() === 'success' && countryName) {
                if ($('content/DN/commonName').text()) {
                    formData.value.cert = pageData.value.certOptions[2].value

                    pageData.value.hasCert = true
                    pageData.value.httpSwitchDisabled = false

                    certFormData.value.countryName = 'C=' + countryName
                    certFormData.value.content = [
                        [Translate('IDCS_ISSUED_TO'), countryName],
                        [Translate('IDCS_ISSUER'), countryName],
                    ]
                        .map((item) => {
                            return `${item[0]}${item[1]}`
                        })
                        .join('\r\n')
                } else {
                    pageData.value.httpSwitchDisabled = true
                    pageData.value.isCreateCertReqDisabled = true
                    pageData.value.isExportCertReqDisabled = false
                    pageData.value.isBrowseExportCertReqDisabled = false
                    pageData.value.isDeleteCertReqDisabled = false

                    reqCertFormData.value.reqFileName = 'C=' + countryName
                }
            } else {
                pageData.value.isCreateCertReqDisabled = false
                pageData.value.isExportCertReqDisabled = true
                pageData.value.isBrowseExportCertReqDisabled = true
                pageData.value.isDeleteCertReqDisabled = true

                reqCertFormData.value.reqFileName = ''
            }
        }

        /**
         * @description 删除请求证书
         */
        const deleteCertificateRequest = async () => {
            openLoading()

            const result = await delCertReq()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.isCreateCertReqDisabled = false
                pageData.value.isExportCertReqDisabled = true
                pageData.value.isDeleteCertReqDisabled = true

                reqCertFormData.value.reqFileName = ''
            }

            closeLoading()
        }

        /**
         * @description 处理OCX导入
         */
        const handleOCXImport = () => {
            const sendXML = OCX_XML_OpenFileBrowser('OPEN_FILE', 'crt/*')
            plugin.AsynQueryInfo(sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()

                if (path) {
                    // 安装生成的证书 导入文件
                    if (formData.value.cert === 1) {
                        directCertFormData.value.importFileName = path
                        pageData.value.isImportCertDirectDisabled = false
                    }
                    // 安装已签名证书 导入文件
                    else {
                        reqCertFormData.value.importFileName = path
                        pageData.value.isImportCertReqDisabled = false
                    }
                } else {
                    if (formData.value.cert === 1) {
                        pageData.value.isImportCertDirectDisabled = false
                    } else {
                        pageData.value.isImportCertReqDisabled = false
                    }
                }
            })
        }

        /**
         * @description 无插件https访问时，提示不支持证书安装
         */
        const preventH5Import = () => {
            if (isSupportH5.value && isHttpsLogin()) {
                // 无插件https访问时，提示不支持证书安装
                openNotify(formatHttpsTips(Translate('IDCS_CERT_INSTALLATION')), true)
                return false
            }
        }

        /**
         * @description 处理H5导入
         * @param e
         */
        const handleH5Import = (e: Event) => {
            const files = (e.target as HTMLInputElement).files
            if (files && files.length) {
                // 安装生成的证书 导入文件
                if (formData.value.cert === 1) {
                    directFile = files[0]
                    directCertFormData.value.importFileName = files[0].name
                    pageData.value.isImportCertDirectDisabled = false
                }
                // 安装已签名证书 导入文件
                else {
                    reqFile = files[0]
                    reqCertFormData.value.importFileName = files[0].name
                    pageData.value.isImportCertReqDisabled = false
                }
            } else {
                if (formData.value.cert === 1) {
                    pageData.value.isImportCertDirectDisabled = false
                } else {
                    pageData.value.isImportCertReqDisabled = false
                }
            }
        }

        /**
         * @description 打开输入证书密码弹窗
         */
        const inputCertPassword = () => {
            pageData.value.isCertPasswordPop = true
        }

        /**
         * @description 导入证书文件
         */
        const importCertFile = (param?: NetHTTPSCertPasswordForm) => {
            openLoading()

            if (isSupportH5.value) {
                const file = formData.value.cert === 1 ? directFile : reqFile
                if (file.size === 0) {
                    closeLoading()

                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_FILE_NO_EXISTS'),
                    })
                }
                new WebsocketUpload({
                    file: file,
                    config: {
                        file_id: 'cert_file',
                        size: file.size,
                        sign_method: 'MD5',
                        param: param?.password
                            ? {
                                  security_ver: Number(userSession.securityVer),
                                  phrase: AES_encrypt(param.password, userSession.securityVer),
                              }
                            : {},
                    },
                    success: () => {
                        closeLoading()
                        getCertificate()
                    },
                    error: (errorCode) => {
                        closeLoading()
                        handleErrorMsg(errorCode)
                    },
                })
            } else {
                const params = {
                    filePath: formData.value.cert === 1 ? directCertFormData.value.importFileName : reqCertFormData.value.importFileName,
                    version: '500',
                    checkPassword: param?.password || undefined,
                }
                const sendXML = OCX_XML_FileNetTransport('ImportCert', params)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 浏览证书请求下载路径
         */
        const browseExportCertificateRequest = () => {
            const sendXML = OCX_XML_OpenFileBrowser('SAVE_FILE', undefined, 'downloadCertReq.csr')
            plugin.AsynQueryInfo(sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    reqCertFormData.value.exportFileName = path
                    pageData.value.isExportCertReqDisabled = false
                } else {
                    pageData.value.isExportCertReqDisabled = true
                }
            })
        }

        /**
         * @description 证书请求下载
         */
        const exportCertificateRequest = () => {
            pageData.value.isExportCertReqDisabled = true
            if (isSupportH5.value) {
                if (isHttpsLogin()) {
                    openNotify(formatHttpsTips(Translate('IDCS_EXPORT_CERT_FILE')), true)
                    return
                }
                new WebsocketDownload({
                    config: {
                        file_id: 'cert_file',
                    },
                    fileName: 'downloadCertReq.csr',
                    success: () => {
                        pageData.value.isExportCertReqDisabled = false
                    },
                    error: () => {
                        pageData.value.isExportCertReqDisabled = false
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_EXPORT_FAIL'),
                        })
                    },
                })
            } else {
                openLoading()
                const param = {
                    filePath: reqCertFormData.value.exportFileName,
                    version: '500',
                }
                const sendXML = OCX_XML_FileNetTransport('ExportCert', param)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 错误信息处理
         * @param {number} errorCode
         */
        const handleErrorMsg = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_FILE_TYPE_ERROR:
                    errorInfo = Translate('IDCS_FILE_NOT_AVAILABLE')
                    break
                case 536871064:
                    errorInfo = Translate('IDCS_CHECK_FILE_ERROR')
                    break
                case 536871065:
                    errorInfo = Translate('IDCS_PASSWORD_NOT_CORRENT')
                    break
                case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                    errorInfo = Translate('IDCS_OCX_NET_DISCONNECT')
                    break
                case ErrorCode.USER_ERROR_OPEN_FILE_ERROR:
                    // 拔出U盘，点击导入按钮提示NT2-680
                    errorInfo = Translate('IDCS_FILE_NO_EXISTS')
                    break
                case ErrorCode.USER_ERROR_FILE_NO_EXISTED:
                    errorInfo = Translate('IDCS_IMPORT_FAIL')
                    break
                default:
                    errorInfo = Translate('IDCS_IMPORT_FAIL')
                    break
            }
            openMessageBox({
                type: 'info',
                message: errorInfo,
            })
        }

        onMounted(async () => {
            openLoading()

            await getNetPortConfig()
            await getCertificate()
            await getCertificateRequest()

            closeLoading()
        })

        return {
            isSupportH5,
            setNetPortConfig,
            pageData,
            formData,
            certFormData,
            privateCertFormData,
            directCertFormData,
            reqCertFormData,
            createCertificate,
            confirmCreateCertificate,
            deleteCertificate,
            deleteCertificateRequest,
            browseExportCertificateRequest,
            exportCertificateRequest,
            handleOCXImport,
            handleH5Import,
            preventH5Import,
            inputCertPassword,
            importCertFile,
        }
    },
})
