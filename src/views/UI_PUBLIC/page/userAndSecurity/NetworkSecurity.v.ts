/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:41:51
 * @Description: 网络安全
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const NETWORK_CARD_MAPPING: Record<string, string> = {
            bond0: Translate('IDCS_NETWORK_FAULT_TOLERANCE'),
            eth0: Translate('IDCS_ETH0_NAME'),
            eth1: Translate('IDCS_ETH1_NAME'),
            ppp0: Translate('IDCS_PPPOE'),
        }

        const tableData = ref<UserNetworkSecurityForm[]>([])
        const watchEdit = useWatchEditData(tableData)

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryArpCfg()

            closeLoading()
            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/nicConfigs/item').map((item) => {
                    const $item = queryXml(item.element)
                    const autoGetGatewayMac = $item('autoGetGatewayMac').text().bool()
                    const gatewayMac = item.attr('gatewayMac')
                    const manualInputGatewayMac = $item('manualInputGatewayMac').text()
                    return {
                        id: item.attr('id'),
                        gateway: item.attr('gateway'),
                        gatewayMac, // 存放自动网关mac地址信息，不能被修改
                        arpSwitch: $item('arpSwitch').text().bool(),
                        autoGetGatewayMac,
                        manualInputGatewayMac,
                        preventDetection: $item('preventDetection').text().bool(),
                        getGatewayMac: $item('manualInputGatewayMac').text(),
                    }
                })
                watchEdit.listen()
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            if (!verification()) {
                return
            }

            openLoading()

            const sendXml = rawXml`
                <content>
                    <nicConfigs type='list'>
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        <arpSwitch>${item.arpSwitch}</arpSwitch>
                                        <gateway>${item.gateway}</gateway>
                                        <autoGetGatewayMac>${item.autoGetGatewayMac}</autoGetGatewayMac>
                                        <getGatewayMac>${item.getGatewayMac}</getGatewayMac>
                                        <manualInputGatewayMac>${item.manualInputGatewayMac}</manualInputGatewayMac>
                                        <preventDetection>${item.preventDetection}</preventDetection>
                                    </item>
                                `
                            })
                            .join('')}
                    </nicConfigs>
                </content>
            `
            const result = await editArpCfg(sendXml)

            closeLoading()
            commSaveResponseHandler(result)
            watchEdit.update()
        }

        const verification = () => {
            const macReg = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/
            const isGatewayMacInvalid = tableData.value.some((item) => {
                if (!item.arpSwitch) {
                    return false
                }

                return item.getGatewayMac === DEFAULT_EMPTY_MAC || !macReg.test(item.getGatewayMac)
            })

            if (isGatewayMacInvalid) {
                openMessageBox(Translate('IDCS_PROMPT_MACADDRESS_INVALID'))
                return false
            }

            return true
        }

        /**
         * @description 格式化网关名称
         * @param {string} value
         */
        const formatNetworkCardName = (value: string) => {
            return NETWORK_CARD_MAPPING[value] || Translate(value)
        }

        /**
         * @description 自动获取网关MAC时, 赋值gatewayMac；否组赋值manualInputGatewayMac
         * @param {UserNetworkSecurityForm} row
         */
        const changeAutoGetGatewayMac = (row: UserNetworkSecurityForm) => {
            if (row.autoGetGatewayMac) {
                row.getGatewayMac = row.gatewayMac
                if (!row.gatewayMac) {
                    openMessageBox(Translate('IDCS_ERROR_GET_GATEWAY_MAC'))
                }
            } else {
                row.getGatewayMac = row.manualInputGatewayMac
            }
        }

        /**
         * @description 手动输入Mac地址时，同步更新getGatewayMac和mannualGatewayMac字段
         * @param {UserNetworkSecurityForm} row
         * @param {number} index
         */
        const changeMannualGatewayMac = (row: UserNetworkSecurityForm) => {
            row.manualInputGatewayMac = row.getGatewayMac
        }

        onMounted(() => {
            getData()
        })

        return {
            tableData,
            setData,
            watchEdit,
            formatNetworkCardName,
            changeAutoGetGatewayMac,
            changeMannualGatewayMac,
        }
    },
})
