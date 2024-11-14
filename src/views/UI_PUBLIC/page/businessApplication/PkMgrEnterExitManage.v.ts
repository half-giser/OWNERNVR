/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:34
 * @Description: 业务应用-停车场管理-出入口
 */
import { type PkMgrEnterExitManageList } from '@/types/apiType/business'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const cababilityStore = useCababilityStore()

        // 方向-Map
        const DIRECTION_MAPPING: Record<string, string> = {
            no: Translate('IDCS_CLOSE'),
            out: Translate('IDCS_APPEARANCE'),
            in: Translate('IDCS_APPROACH'),
        }

        // LED屏-Map
        const SCREEN_MAPPING: Record<string, string> = {
            JiaXun: Translate('IDCS_JIAXUN_LED_SCREEN'),
        }

        const tableData = ref<PkMgrEnterExitManageList[]>([])

        const pageData = ref({
            // 方向-List
            directionList: [] as SelectOption<string, string>[],
            // LED屏-List
            screenList: [] as SelectOption<string, string>[],
            // 在线通道列表
            onlineChlList: [] as string[],
            // 是否获取数据成功
            mounted: false,
            // 是否可提交
            btnDisabled: true,
        })

        /**
         * @description 获取数据-更新页面初始数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryParkingLotConfig()
            const $ = queryXml(result)

            closeLoading()

            tableData.value = $('//content/entryLeaveConfig/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    channelName: $item('channelName').text(),
                    direction: $item('direction').text(),
                    ip: $item('ip').text(),
                    ipc: `${$item('channelName').text()} ( ${$item('ip').text()} ) `,
                    enableLEDScreen: $item('enableLEDScreen').text().bool(),
                    enableLEDScreenValid: $item('enableLEDScreen').length > 0 && cababilityStore.supportParkingLotLEDVisible,
                    LEDScreenType: $item('LEDScreenType').text() || '',
                    LEDScreenTypeValid: $item('LEDScreenType').length > 0 && cababilityStore.supportParkingLotLEDVisible,
                }
            })

            pageData.value.screenList = $('//types/LEDScreenType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: SCREEN_MAPPING[item.text()],
                }
            })

            pageData.value.directionList = $('//types/directionType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: DIRECTION_MAPPING[item.text()],
                }
            })

            nextTick(() => {
                pageData.value.mounted = true
            })
        }

        // 通道树状态刷新定时器
        const chlStatusRefreshTimer = useRefreshTimer(() => {
            getOnlineChlList()
        }, 5000)

        /**
         * @description 获取数据-更新在线通道数据
         */
        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)

            pageData.value.onlineChlList = $('//content/item').map((item) => item.attr('id')!)
            chlStatusRefreshTimer.repeat()
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = async () => {
            const sendXml = rawXml`
                <content>
                    <entryLeaveConfig>
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        <channelName>${item.channelName}</channelName>
                                        <direction>${item.direction}</direction>
                                        <ip>${item.ip}</ip>
                                        ${ternary(item.enableLEDScreenValid, `<enableLEDScreen>${item.enableLEDScreen}</enableLEDScreen>`)}
                                        ${ternary(item.LEDScreenTypeValid, `<LEDScreenType>${item.LEDScreenType}</LEDScreenType>`)}
                                    </item>
                                `
                            })
                            .join('')}
                    </entryLeaveConfig>
                </content>
            `

            openLoading()

            const result = await editParkingLotConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                const errorCode = $('//errorCode').text().num()
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorMsg = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox({
                    type: 'info',
                    message: errorMsg,
                })
            }
        }

        /**
         * @description 通道在线离线状态
         * @param {string} id
         * @returns {string}
         */
        const getChlStatus = (id: string) => {
            return pageData.value.onlineChlList.includes(id) ? 'online' : 'offline'
        }

        watch(
            tableData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.btnDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        onMounted(async () => {
            await getData()
            chlStatusRefreshTimer.repeat(true)
        })

        return {
            pageData,
            tableData,
            apply,
            getChlStatus,
        }
    },
})
