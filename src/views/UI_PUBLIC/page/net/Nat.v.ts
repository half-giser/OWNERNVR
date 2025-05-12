/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 09:40:19
 * @Description: Nat配置
 */
import { type UserCheckAuthForm } from '@/types/apiType/user'
import QRCode from 'qrcode'
import { type QRCodeToDataURLOptions } from 'qrcode'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()

        // NAT状态与显示文本的映射
        const STATUS_MAPPING: Record<string, string> = {
            success: Translate('IDCS_SUCCESS'),
            fail: Translate('IDCS_FAILED'),
            '': Translate('IDCS_FAILED'),
        }

        const formData = ref(new NetNatForm())
        const pageData = ref({
            // NAT类型选项
            natServerTypeOptions: [] as SelectOption<number, string>[],
            // 二维码base64字符串
            snCode: '',
            // 二维码文本
            snText: '',
            // 是否打开云更新
            cloudSwitch: false,
            // 访问地址
            visitAddress: '',
            // NAT状态
            natServerState: '',
            // NAT开启
            natSwitch: false,
            // 是否显示“安全访问”配置
            showSecurityAccessCfg: false,
            securityAccessSwitch: false,
            editable: false,
            isShowSecurityCode: false,
            securityCode: '',
            currentIndex: 1,
            isCheckAuthPop: false,
        })

        // 定时获取NAT状态
        const timer = useRefreshTimer(() => {
            getP2pStatus()
        })

        /**
         * @description 获取云更新配置
         */
        const getCloudUpgradeConfig = async () => {
            const result = await queryCloudUpgradeCfg()
            const $ = queryXml(result)
            pageData.value.cloudSwitch = $('content/cloudUpgrade/nvrItem/upgradeType').text() !== 'close'
        }

        /**
         * @description 根据字符串生成二维码
         * @param {string} str
         * @returns
         */
        const makeQRCode = (str: string) => {
            const options: QRCodeToDataURLOptions = {
                errorCorrectionLevel: 'M',
                width: 230,
                margin: 0,
            }
            return new Promise((resolve: (url: string) => void) => {
                QRCode.toDataURL(str, options, (err, url) => {
                    if (err) resolve('')
                    else resolve(url)
                })
            })
        }

        /**
         * @description 获取二维码 并生成二维码
         */
        const getBasicConfig = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            pageData.value.snCode = await makeQRCode($('content/qrCodeContent').text() || ' ')
            pageData.value.snText = $('content/sn').text()
        }

        /**
         * @description 获取NAT状态
         */
        const getP2pStatus = async () => {
            const result = await queryP2PCfg()
            const $ = queryXml(result)
            pageData.value.natServerState = STATUS_MAPPING[$('content/natServerState').text()]
            timer.repeat()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryP2PCfg()
            const $ = queryXml(result)
            pageData.value.natServerTypeOptions = $('types/natServerType/enum').map((item) => {
                pageData.value.visitAddress = item.attr('visitAddress')
                const index = item.attr('index').num()
                const defaultLabel = index === 0 ? Translate('IDCS_TAG_P2P1') : Translate('IDCS_TAG_P2P2')
                return {
                    value: index,
                    label: systemCaps.showNatServerAddress ? `${defaultLabel}(${item.text()})` : defaultLabel,
                }
            })
            formData.value.natSwitch = $('content/switch').text().bool()
            formData.value.index = $('content/switch').attr('index').num()

            pageData.value.editable = $('content/editable').text().bool()
            pageData.value.natServerState = STATUS_MAPPING[$('content/natServerState').text()]
            pageData.value.natSwitch = formData.value.natSwitch
            pageData.value.showSecurityAccessCfg = formData.value.natSwitch && formData.value.index === 1
            pageData.value.currentIndex = formData.value.index
        }

        const getSecurityAccess = async () => {
            const result = await querySecurityAccess()
            const $ = queryXml(result)

            formData.value.securityAccessSwitch = $('content/switch').text().bool()
            pageData.value.securityAccessSwitch = formData.value.securityAccessSwitch
        }

        const getSecurityCode = async (e?: UserCheckAuthForm) => {
            const sendXml = e
                ? rawXml`
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                `
                : ''
            const result = await querySecurityCode(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const securityVer = $('content/securityCode').attr('securityVer')
                const ciphertextCode = $('content/securityCode').text()
                if (securityVer === '1') {
                    pageData.value.securityCode = AES_decrypt(ciphertextCode, userSession.sesionKey)
                } else {
                    pageData.value.securityCode = base64Decode(ciphertextCode)
                }
                pageData.value.isCheckAuthPop = false
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR_NO_USER:
                        openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        openMessageBox(Translate('IDCS_NO_AUTH'))
                        break
                    default:
                        if (e) {
                            openMessageBox(Translate('IDCS_QUERY_DATA_FAIL'))
                        }
                        break
                }
            }
        }

        const toggleSecurityCode = async () => {
            if (pageData.value.isShowSecurityCode) {
                pageData.value.isShowSecurityCode = false
            } else {
                if (pageData.value.securityCode) {
                    pageData.value.isShowSecurityCode = true
                } else {
                    await getSecurityCode()
                    if (pageData.value.securityCode) {
                        pageData.value.isShowSecurityCode = true
                    }
                }
            }
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <switch index="${formData.value.index}">${formData.value.natSwitch}</switch>
                </content>
            `
            const result = await editP2PCfg(sendXml)

            if (pageData.value.showSecurityAccessCfg) {
                const sendXml = rawXml`
                    <content>
                        <switch>${formData.value.securityAccessSwitch}</switch>
                    </content>
                `
                const result2 = await editSecurityAccess(sendXml)
                commMutiSaveResponseHandler([result, result2])
            } else {
                commSaveResponseHandler(result)
            }

            closeLoading()
            await getData()
            if (pageData.value.showSecurityAccessCfg) {
                await getSecurityAccess()
            }
        }

        /**
         * @description 启用NAT 提交表单
         */
        const openNat = () => {
            formData.value.natSwitch = true
            setData()
        }

        const changeSecurityAccessSwitch = () => {
            if (formData.value.securityAccessSwitch) {
                openMessageBox(Translate('IDCS_SECURITY_ACCESS_TIP'))
            }
        }

        /**
         * @description 提交表单
         */
        const apply = () => {
            if (!formData.value.natSwitch && pageData.value.cloudSwitch && systemCaps.showCloudUpgrade) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_CLOSE_NAT2_TIP'),
                })
                    .then(() => {
                        setData()
                    })
                    .catch(() => {
                        formData.value.natSwitch = true
                    })
                return
            }

            // 启用了云升级和nat2.0
            if (formData.value.index === 0 && formData.value.natSwitch && pageData.value.cloudSwitch && systemCaps.showCloudUpgrade) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_NAT2_CLOSE_TIP'),
                })
                    .then(() => {
                        setData()
                    })
                    .catch(() => {
                        formData.value.index = 1
                    })
                return
            }
            setData()
        }

        onMounted(async () => {
            openLoading()

            await getBasicConfig()
            await getCloudUpgradeConfig()
            await getData()
            if (pageData.value.showSecurityAccessCfg) {
                await getSecurityAccess()
            }
            await getSecurityCode()
            timer.repeat()

            closeLoading()
        })

        return {
            apply,
            openNat,
            formData,
            pageData,
            systemCaps,
            toggleSecurityCode,
            getSecurityCode,
            changeSecurityAccessSwitch,
        }
    },
})
