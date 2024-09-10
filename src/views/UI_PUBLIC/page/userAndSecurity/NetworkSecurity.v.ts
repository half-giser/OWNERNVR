/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:41:51
 * @Description: 网络安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 13:42:25
 */
import { type UserNetworkSecurityForm } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const tableData = ref<UserNetworkSecurityForm[]>([])

        const pageData = ref({
            submitDisabled: true,
            mounted: false,
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryArpCfg()

            closeLoading(LoadingTarget.FullScreen)
            commLoadResponseHandler(result, ($) => {
                tableData.value = []
                $('//content/nicConfigs/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const autoGetGatewayMac = $item('autoGetGatewayMac').text().toBoolean()
                    const gatewayMac = item.attr('gatewayMac') as string
                    const manualInputGatewayMac = $item('manualInputGatewayMac').text()
                    tableData.value.push({
                        id: item.attr('id') as string,
                        gateway: item.attr('gateway') as string,
                        gatewayMac,
                        arpSwitch: $item('arpSwitch').text().toBoolean(),
                        autoGetGatewayMac,
                        manualInputGatewayMac,
                        preventDetection: $item('preventDetection').text().toBoolean(),
                        getGatewayMac: autoGetGatewayMac ? gatewayMac : manualInputGatewayMac,
                    })
                })
                nextTick(() => {
                    pageData.value.mounted = true
                })
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const table = tableData.value
                .map((item) => {
                    return rawXml`
                    <item id="${item.id}">
                        <arpSwitch>${String(item.arpSwitch)}</arpSwitch>
                        <gateway>${item.gateway}</gateway>
                        <autoGetGatewayMac>${String(item.autoGetGatewayMac)}</autoGetGatewayMac>
                        <getGatewayMac>${item.getGatewayMac}</getGatewayMac>
                        <manualInputGatewayMac>${item.manualInputGatewayMac}</manualInputGatewayMac>
                        <preventDetection>${String(item.preventDetection)}</preventDetection>
                    </item>
                `
                })
                .join('')
            const sendXml = rawXml`
                <content>
                    <nicConfigs type='list'>
                        ${table}
                    </nicConfigs>
                </content>
            `
            const result = await editArpCfg(sendXml)

            closeLoading(LoadingTarget.FullScreen)
            commSaveResponseHadler(result)
        }

        /**
         * @description 格式化网关名称
         * @param {string} value
         */
        const formatNetworkCardName = (value: string) => {
            switch (value) {
                case 'bond0':
                    return Translate('IDCS_NETWORK_FAULT_TOLERANCE')
                case 'eth0':
                    return Translate('IDCS_ETH0_NAME')
                case 'eth1':
                    return Translate('IDCS_ETH1_NAME')
                case 'ppp0':
                    return Translate('IDCS_PPPOE')
                default:
                    return Translate(value)
            }
        }

        /**
         * @description 自动获取网关MAC时, 赋值gatewayMac；否组赋值manualInputGatewayMac
         * @param {UserNetworkSecurityForm} row
         * @param {number} index
         */
        const handleChangeAutoGetGatewayMac = (row: UserNetworkSecurityForm, index: number) => {
            if (row.autoGetGatewayMac) {
                tableData.value[index].getGatewayMac = row.gatewayMac || '00:00:00:00:00:00'
            } else {
                tableData.value[index].getGatewayMac = row.manualInputGatewayMac || '00:00:00:00:00:00'
            }
        }

        /**
         * @description 手动输入Mac地址时，同步更新getGatewayMac和mannualGatewayMac字段
         * @param {UserNetworkSecurityForm} row
         * @param {number} index
         */
        const handleChangeMannualGatewayMac = (row: UserNetworkSecurityForm, index: number) => {
            tableData.value[index].manualInputGatewayMac = row.getGatewayMac
        }

        const stopTableDataWatch = watch(
            tableData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.submitDisabled = false
                    stopTableDataWatch()
                }
            },
            {
                deep: true,
            },
        )

        onMounted(() => {
            getData()
        })

        return {
            tableData,
            setData,
            pageData,
            formatNetworkCardName,
            handleChangeAutoGetGatewayMac,
            handleChangeMannualGatewayMac,
        }
    },
})
