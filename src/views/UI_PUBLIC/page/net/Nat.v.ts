/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 09:40:19
 * @Description: Nat配置
 */
import QRCode from 'qrcode'
import { type QRCodeToDataURLOptions } from 'qrcode'
import { NetNatForm } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        // NAT状态与显示文本的映射
        const STATUS_MAPPING: Record<string, string> = {
            success: Translate('IDCS_SUCCESS'),
            fail: Translate('IDCS_FAILED'),
            '': Translate('IDCS_FAILED'),
        }

        const formData = ref(new NetNatForm())
        const pageData = ref({
            // NAT类型选项
            natServerTypeOptions: [] as SelectOption<string, string>[],
            // 二维码base64字符串
            snCode: '',
            // 二维码文本
            snText: '',
            // 是否打开云更新
            cloudSwitch: false,
            // 访问地址
            visitAddress: '',
            // 是否用户模式
            isBindUser: false,
            // NAT状态
            natServerState: '',
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
            pageData.value.cloudSwitch = $('//content/cloudUpgrade/nvrItem/upgradeType').text() !== 'close'
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
            pageData.value.snCode = await makeQRCode($('//content/qrCodeContent').text())
            pageData.value.snText = $('//content/sn').text()
        }

        /**
         * @description 获取NAT状态
         */
        const getP2pStatus = async () => {
            const result = await queryP2PCfg()
            const $ = queryXml(result)
            pageData.value.natServerState = STATUS_MAPPING[$('//content/natServerState').text()]
            timer.repeat()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryP2PCfg()
            const $ = queryXml(result)
            pageData.value.natServerTypeOptions = $('//types/natServerType/enum').map((item) => {
                pageData.value.visitAddress = item.attr('visitAddress')!
                const index = item.attr('index')!
                const defaultLabel = index === '0' ? Translate('IDCIDCS_NATS_TAG_P2P1') : Translate('IDCS_NAT')
                return {
                    value: index,
                    label: systemCaps.showNatServerAddress ? `${Translate('IDCS_NAT')}(${item.text()})` : defaultLabel,
                }
            })
            formData.value.natSwitch = $('//content/switch').text().toBoolean()
            formData.value.index = $('//content/switch').attr('index')
            pageData.value.isBindUser = $('//content/mode').text() === 'user'
            pageData.value.natServerState = STATUS_MAPPING[$('//content/natServerState').text()]
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
            commSaveResponseHadler(result)

            closeLoading()
            getData()
        }

        /**
         * @description 启用NAT 提交表单
         */
        const openNat = () => {
            formData.value.natSwitch = true
            setData()
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
            if (formData.value.index === '0' && formData.value.natSwitch && pageData.value.cloudSwitch && systemCaps.showCloudUpgrade) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_NAT2_CLOSE_TIP'),
                })
                    .then(() => {
                        setData()
                    })
                    .catch(() => {
                        formData.value.index = '1'
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
            timer.repeat()

            closeLoading()
        })

        return {
            apply,
            openNat,
            formData,
            pageData,
            systemCaps,
        }
    },
})
