/*
 * @Description: AI 事件——事件启用
 * @Author: luoyiming a11593@tvt.net.cn
 * @Date: 2025-05-20 10:52:47
 */
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
    },
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 当前选中的通道
            currChlId: '',
            // 在线通道id列表
            onlineChannelIdList: [] as string[],
            // 支持事件启用的在线通道列表
            intelligentModeChlList: [] as AlarmOnlineChlDto[],
            // 当前通道开启的（选中的）的智能模式
            enableEventType: '',
            // 记录初始开启的（选中的）的智能模式
            originalEventType: '',
            // 当前通道的智能模式列表
            intelligentModeList: [] as AlarmIntelligentModeEventTypeDto[],
            // 当前通道的智能模式列表-按顺序（与设备端保持一致）
            intelligentModeSortList: ['faceEvent', 'vehicleEvent', 'structedAnalysis', 'structedEvent', 'highFalling', 'structedEventAndAnalysis'],
            // 不支持功能提示页面是否展示
            notSupport: false,
            // 是否禁用应用按钮
            applyDisabled: true,
        })

        // 事件类型与信息的映射
        const eventTypeMapping: Record<string, AlarmIntelligentModeEventTypeDto> = {
            faceEvent: {
                // 人脸事件
                event: 'faceEvent',
                title: Translate('IDCS_FACE_EVENT'),
                iconFile: 'face',
            },
            vehicleEvent: {
                // 车牌事件
                event: 'vehicleEvent',
                title: Translate('IDCS_VEHICLE_PLATE_EVENT'),
                iconFile: 'licensePlate',
            },
            structedAnalysis: {
                // 结构化分析
                event: 'structedAnalysis',
                title: Translate('IDCS_STRUCTURED_ANALYSE'),
                iconFile: 'structured',
            },
            structedEvent: {
                // 智能检测
                event: 'structedEvent',
                title: Translate('IDCS_INTELLIGENT_DETECTION'),
                iconFile: 'intellect',
            },
            highFalling: {
                // 高空抛物
                event: 'highFalling',
                title: Translate('IDCS_HIGH_DROP'),
                iconFile: 'parabolic',
            },
            structedEventAndAnalysis: {
                // 智能检测+视频结构化
                event: 'structedEventAndAnalysis',
                title: Translate('IDCS_INTELLIGENT_AND_STRUCTURED_EVENT'),
                iconFile: 'structedEventAndAnalysis',
            },
        }

        /**
         * @description 获取在线通道
         */
        const getOnlineChannel = async () => {
            const res = await queryOnlineChlList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.onlineChannelIdList = $('content/item').map((item) => {
                    return item.attr('id')
                })
            }
        }

        /**
         * @description 获取通道数据
         */
        const getChannelData = async () => {
            const result = await getChlList({
                requireField: ['ip', 'supportInvokeEventTypeConfig'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((element) => {
                    const $item = queryXml(element.element)
                    const protocolType = $item('protocolType').text()
                    const factoryName = $item('productModel').attr('factoryName')
                    if (factoryName === 'Recorder') return
                    const curChlId = element.attr('id')
                    if (protocolType !== 'RTSP' && pageData.value.onlineChannelIdList.some((item) => item === curChlId)) {
                        const id = element.attr('id')
                        const name = $item('name').text()
                        const ip = $item('ip').text()
                        const accessType = $item('AccessType').text()
                        const supportInvokeEventTypeConfig = $item('supportInvokeEventTypeConfig').text().bool()
                        // 保存当前通道的所有能力集，若全部为false，则过滤掉该通道
                        const allCapsArr = [supportInvokeEventTypeConfig]
                        if (allCapsArr.includes(true)) {
                            // intelligentModeChlList只保存支持智能模式的通道
                            pageData.value.intelligentModeChlList.push({
                                id: id,
                                ip: ip,
                                name: name,
                                accessType: accessType,
                            })
                        }
                    }
                })
                if (!pageData.value.intelligentModeChlList.length) {
                    pageData.value.notSupport = true
                    return
                }

                if (!pageData.value.currChlId) {
                    pageData.value.currChlId = pageData.value.intelligentModeChlList[0].id
                }
            }
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            if (!pageData.value.currChlId) {
                return
            }
            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await queryInvokeEventTypeConfig(sendXml)
            commLoadResponseHandler(result, ($) => {
                // 当前通道开启的智能模式
                pageData.value.enableEventType = $('content/chl/enableEventType').text()
                pageData.value.originalEventType = $('content/chl/enableEventType').text()
                // 当前通道的智能模式列表（根据intelligentModeSortList的顺序保存当前通道支持的智能模式）
                pageData.value.intelligentModeList = []
                pageData.value.intelligentModeSortList.forEach(function (intelligentMode) {
                    $('types/eventType/enum').forEach((element) => {
                        if (element.text() === intelligentMode) {
                            pageData.value.intelligentModeList.push(eventTypeMapping[intelligentMode])
                        }
                    })
                })
            })
        }

        const applyData = async () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_IPC_MODIFY_REBOOT_TIPS').formatForLang(Translate('IDCS_EVENT_ENABLEMENT')),
            }).then(async () => {
                const sendXml = rawXml`
                <content>
                    <chl id=${pageData.value.currChlId}>
                        <enableEventType type="eventType">${pageData.value.enableEventType}</enableEventType>
                    </chl>
                </content>
            `
                const result = await editInvokeEventTypeConfig(sendXml)
                commSaveResponseHandler(result)
                pageData.value.applyDisabled = true
            })
        }

        /**
         * @description 切换通道操作
         */
        const changeChannel = async () => {
            await getData()
            pageData.value.applyDisabled = true
        }

        const selectIntelligentMode = (event: string) => {
            if (event !== pageData.value.enableEventType) {
                pageData.value.enableEventType = event
            }
        }
        watch(
            () => pageData.value.enableEventType,
            (value) => {
                if (value !== pageData.value.originalEventType) {
                    pageData.value.applyDisabled = false
                } else {
                    pageData.value.applyDisabled = true
                }
            },
        )
        onMounted(async () => {
            await getOnlineChannel()
            await getChannelData()
            changeChannel()
        })

        return {
            pageData,
            changeChannel,
            applyData,
            selectIntelligentMode,
        }
    },
})
