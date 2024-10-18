/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 08:56:08
 * @Description: UPnP配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 15:38:53
 */
import { NetUPnPForm, type NetUPnPPortDto } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const theme = getUiAndTheme()

        // 显示文本映射
        const TRANS_MAPPING: Record<string, string> = {
            HTTP: Translate('IDCS_HTTP_PORT'),
            HTTPS: Translate('IDCS_HTTPS_PORT'),
            RTSP: Translate('IDCS_RTSP_PORT'),
            SERVICE: Translate('IDCS_SERVE_PORT'),
            effective: Translate('IDCS_UPNP_VALID'),
            ineffective: Translate('IDCS_UPNP_INVALID'),
            notReady: Translate('IDCS_UPNP_NOT_READY'),
        }

        const formData = ref(new NetUPnPForm())
        const tableData = ref<NetUPnPPortDto[]>([])
        const pageData = ref({
            // 映射类型选项
            mapTypeOptions: [
                {
                    value: 'auto',
                    label: Translate('IDCS_AUTO'),
                },
                {
                    value: 'manually',
                    label: Translate('IDCS_MANUAL'),
                },
            ] as SelectOption<string, string>[],
            // 是否开启无线
            wirelessSwitch: false,
            // 是否开启PPPoE
            pppoeSwitch: false,
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryUPnPCfg()
            const $ = queryXml(result)
            formData.value.switch = $('//content/switch').text().toBoolean()
            formData.value.mappingType = $('//content/mappingType').text()

            tableData.value = $('//content/ports/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    portType: $item('portType').text(),
                    externalPort: Number($item('externalPort').text()),
                    externalIP: $item('externalIP').text(),
                    localPort: $item('localPort').text(),
                    status: TRANS_MAPPING[$item('status').text()],
                }
            })
        }

        /**
         * @description 获取无线配置
         */
        const getWirelessNetworkData = async () => {
            const result = await queryWirelessNetworkCfg()
            const $ = queryXml(result)
            pageData.value.wirelessSwitch = $('//content/switch').text().toBoolean()
        }

        /**
         * @description 获取PPPoE配置
         */
        const getPPPoEData = async () => {
            const result = await queryPPPoECfg()
            const $ = queryXml(result)
            pageData.value.pppoeSwitch = $('//content/switch').text().toBoolean()
        }

        /**
         * @description 显示端口类型文本
         * @param {string} str
         * @returns {string}
         */
        const displayPortType = (str: string) => {
            return TRANS_MAPPING[str]
        }

        const PORT_ERROR_MAPPING: [string, string, string][] = [
            ['HTTP', 'SERVICE', 'IDCS_PROMPT_HTTP_DATA_THE_SAME_PORT'],
            ['HTTP', 'RTSP', 'IDCS_PROMPT_HTTP_RTSP_THE_SAME_PORT'],
            ['SERVICE', 'RTSP', 'IDCS_PROMPT_DATA_RTSP_THE_SAME_PORT'],
            ['HTTP', 'posPort', 'IDCS_POS_DATA_HTTP_THE_SAME_PORT'],
            ['HTTPS', 'posPort', 'IDCS_POS_DATA_HTTPS_THE_SAME_PORT'],
            ['SERVICE', 'posPort', 'IDCS_POS_DATA_PROMPT_THE_SAME_PORT'],
            ['RTSP', 'posPort', 'IDCS_POS_DATA_RTSP_THE_SAME_PORT'],
            ['HTTP', 'HTTPS', 'IDCS_PROMPT_HTTPS_HTTP_THE_SAME_PORT'],
            ['HTTPS', 'SERVICE', 'IDCS_PROMPT_HTTPS_DATA_THE_SAME_PORT'],
            ['HTTPS', 'RTSP', 'IDCS_PROMPT_HTTPS_RTSP_THE_SAME_PORT'],
        ]

        /**
         * @description 验证是否有相同的端口
         * @returns {string}
         */
        const hasSamePort = () => {
            const portValue: [string, number][] = tableData.value.map((item) => {
                return [item.portType, item.externalPort]
            })
            let errorInfo = ''
            portValue.some(([param, value]) => {
                const findSamePort = portValue.find((port) => port[1] === value && port[0] !== param)
                if (findSamePort) {
                    const errorText = PORT_ERROR_MAPPING.find((item) => {
                        return (item[0] === findSamePort[0] && item[1] === param) || (item[0] === param && item[1] === findSamePort[0])
                    })
                    if (errorText) {
                        errorInfo = Translate(errorText[2])
                        return true
                    } else {
                        return false
                    }
                }
            })
            return errorInfo
        }

        /**
         * @description 提交表单
         */
        const setData = async () => {
            const isHasSamePort = hasSamePort()
            if (isHasSamePort) {
                openMessageTipBox({
                    type: 'info',
                    message: isHasSamePort,
                })
                return
            }

            openLoading()

            const portsXml = tableData.value
                .map((item) => {
                    return rawXml`
                    <item>
                        <portType>${item.portType}</portType>
                        <externalPort>${item.externalPort.toString()}</externalPort>
                    </item>
                `
                })
                .join('')
            const sendXml = rawXml`
                <types>
                    <mappingType>${wrapEnums(pageData.value.mapTypeOptions)}</mappingType>
                    <portType>${wrapEnums(['HTTP', 'HTTPS', 'RTSP', 'SERVICE'])}</portType>
                    <statusType>${wrapEnums(['effective', 'ineffective'])}</statusType>
                </types>
                <content>
                    <switch>${formData.value.switch.toString()}</switch>
                    <mappingType>${formData.value.mappingType}</mappingType>
                    <ports type="list">${portsXml}</ports>
                </content>
            `
            const result = await editUPnPCfg(sendXml)
            commSaveResponseHadler(result)

            closeLoading()
        }

        /**
         * @description 表格行禁用状态
         * @returns {stirng}
         */
        const handleRowClassName = () => {
            if (!formData.value.switch || formData.value.mappingType === 'auto') {
                return 'disabled'
            }
            return ''
        }

        /**
         * @description Map Type为自动时，外部端口重置为本地端口
         */
        const changeMappingType = () => {
            if (formData.value.mappingType === 'auto') {
                tableData.value.forEach((item) => {
                    item.externalPort = Number(item.localPort)
                })
            }
        }

        onMounted(async () => {
            openLoading()

            await getWirelessNetworkData()
            await getPPPoEData()
            await getData()

            closeLoading()
        })

        return {
            formData,
            pageData,
            tableData,
            displayPortType,
            changeMappingType,
            setData,
            getData,
            theme,
            handleRowClassName,
        }
    },
})
