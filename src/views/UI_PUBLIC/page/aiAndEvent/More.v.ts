/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-10 17:50:35
 * @Description: 更多功能页面的框架
 */
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'
import FireDetectionPanel from './FireDetectionPanel.vue'
import TemperatureDetectionPanel from './TemperatureDetectionPanel.vue'
import ObjectLeftPanel from './ObjectLeftPanel.vue'
import PassLinePanel from './PassLinePanel.vue'
import AbnormalDisposePanel from './AbnormalDisposePanel.vue'
import CddPanel from './CddPanel.vue'
import AreaStatisPanel from './AreaStatisPanel.vue'
import AsdPanel from './AsdPanel.vue'
import HeatMapPanel from './HeatMapPanel.vue'
import CrowdGatherPanel from './CrowdGatherPanel.vue'
import BinocularCountPanel from './BinocularCountPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
        FireDetectionPanel,
        AreaStatisPanel,
        PassLinePanel,
        TemperatureDetectionPanel,
        ObjectLeftPanel,
        AbnormalDisposePanel,
        CddPanel,
        AsdPanel,
        HeatMapPanel,
        CrowdGatherPanel,
        BinocularCountPanel,
    },
    setup() {
        const systemCaps = useCababilityStore()
        const pageData = ref({
            // 当前选中的通道
            currChlId: '',
            // 在线通道id列表
            onlineChannelIdList: [] as string[],
            // 在线通道列表
            onlineChannelList: [] as AlarmOnlineChlDto[],
            // 通道能力集
            chlCaps: {} as Record<string, AlarmChlDto>,
            // 当前选择的功能
            tab: '',
            notSupport: false,
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
        })

        const chlData = computed(() => {
            return pageData.value.chlCaps[pageData.value.currChlId] || new AlarmChlDto()
        })

        // 切换通道
        const changeChannel = () => {
            const tabList: [string, boolean][] = [
                ['loiter', chlData.value.supportLoitering],
                ['pvd', chlData.value.supportPvd],
                ['fireDetection', chlData.value.supportFire],
                ['areaStatis', chlData.value.supportRegionStatistics],
                ['passLine', chlData.value.supportPassLine || chlData.value.supportCpc],
                ['cdd', chlData.value.supportCdd],
                ['temperatureDetection', chlData.value.supportTemperature],
                ['objectLeft', chlData.value.supportOsc],
                ['asd', chlData.value.supportASD],
                ['heatMap', chlData.value.supportHeatMap],
                ['sbc', chlData.value.supportBinocularCountConfig],
                ['avd', chlData.value.supportAvd],
                ['cgd', chlData.value.supportCrowdGathering],
            ]

            tabList.some((item) => {
                if (item[1]) {
                    pageData.value.tab = item[0]
                }
                return item[1]
            })

            // 若都不可用，则显示提示
            if (!pageData.value.tab) {
                pageData.value.notSupport = true
            } else {
                pageData.value.notSupport = false
            }
        }

        // 获取在线通道
        const getOnlineChannel = async () => {
            const res = await queryOnlineChlList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.onlineChannelIdList = $('content/item').map((item) => {
                    return item.attr('id')
                })
            }

            if (!pageData.value.onlineChannelIdList.length) {
                pageData.value.notSupport = true
            }
        }

        // 获取通道数据
        const getChannelData = async () => {
            const result = await getChlList({
                requireField: [
                    'ip',
                    'supportVfd',
                    'supportVehiclePlate',
                    'supportAOIEntry',
                    'supportAOILeave',
                    'supportTripwire',
                    'supportPea',
                    'supportPeaTrigger',
                    'supportIpd',
                    'supportAvd',
                    'supportCdd',
                    'supportOsc',
                    'supportCpc',
                    'supportPassLine',
                    'supportAudioAlarmOut',
                    'supportAutoTrack',
                    'supportFire',
                    'supportWhiteLightAlarmOut',
                    'supportTemperature',
                    'protocolType',
                    'supportVideoMetadata',
                    'supportLoitering',
                    'supportPvd',
                    'supportRegionStatistics',
                    'supportASD',
                    'supportHeatMap',
                    'supportCrowdGathering',
                    'supportBinocularCountConfig',
                ],
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
                        const chlType = $item('chlType').text()
                        const accessType = $item('AccessType').text()
                        const supportOsc = $item('supportOsc').text().bool()
                        const supportCdd = $item('supportCdd').text().bool()
                        const supportVfd = $item('supportVfd').text().bool()
                        const supportAvd = $item('supportAvd').text().bool()
                        const supportPvd = $item('supportPvd').text().bool()
                        const supportPea = $item('supportPea').text().bool()
                        const supportPeaTrigger = $item('supportPeaTrigger').text().bool() // NT-9829
                        const supportIpd = $item('supportIpd').text().bool()
                        const supportTripwire = $item('supportTripwire').text().bool()
                        const supportAOIEntry = $item('supportAOIEntry').text().bool()
                        const supportAOILeave = $item('supportAOILeave').text().bool()
                        const supportVehiclePlate = $item('supportVehiclePlate').text().bool()
                        const supportPassLine = $item('supportPassLine').text().bool()
                        const supportCpc = $item('supportCpc').text().bool()
                        const supportAudio = $item('supportAudioAlarmOut').text().bool()
                        const supportWhiteLight = $item('supportWhiteLightAlarmOut').text().bool()
                        const supportAutoTrack = $item('supportAutoTrack').text().bool()
                        const supportFire = $item('supportFire').text().bool()
                        const supportLoitering = $item('supportLoitering').text().bool()
                        const supportTemperature = $item('supportTemperature').text().bool()
                        const supportVideoMetadata = $item('supportVideoMetadata').text().bool()
                        const supportRegionStatistics = $item('supportRegionStatistics').text().bool()
                        const supportASD = $item('supportASD').text().bool()
                        const supportHeatMap = $item('supportHeatMap').text().bool()
                        const supportCrowdGathering = $item('supportCrowdGathering').text().bool()
                        const supportBinocularCountConfig = $item('supportBinocularCountConfig').text().bool()
                        let supportBackVfd = false
                        let supportBackTripwire = false
                        let supportBackPea = false
                        let supportBackAOIEntry = false
                        let supportBackAOILeave = false

                        if (!!systemCaps.localFaceDectMaxCount) {
                            // 支持人脸后侦测且人脸前侦测为false，才算支持人脸后侦测
                            supportBackVfd = !supportVfd
                        }

                        if (!!systemCaps.localTargetDectMaxCount) {
                            supportBackTripwire = !supportTripwire
                            supportBackPea = !supportPea
                            supportBackAOIEntry = !supportAOIEntry
                            supportBackAOILeave = !supportAOILeave
                        }

                        // 热成像通道（火点检测/温度检测）不支持后侦测
                        if (supportFire || supportTemperature) {
                            supportBackVfd = false
                            supportBackTripwire = false
                            supportBackPea = false
                            supportBackAOIEntry = false
                            supportBackAOILeave = false
                        }
                        // 保存当前通道的所有能力集，若全部为false，则过滤掉该通道
                        const allCapsArr = [
                            supportOsc,
                            supportCdd,
                            supportVfd,
                            supportAvd,
                            supportPea,
                            supportPeaTrigger,
                            supportIpd,
                            supportTripwire,
                            supportAOIEntry,
                            supportAOILeave,
                            supportVehiclePlate,
                            supportPassLine,
                            supportCpc,
                            supportFire,
                            supportTemperature,
                            supportBackVfd,
                            supportVideoMetadata,
                            supportLoitering,
                            supportPvd,
                            supportRegionStatistics,
                            supportASD,
                            supportHeatMap,
                            supportCrowdGathering,
                            supportBinocularCountConfig,
                        ]
                        if (allCapsArr.includes(true)) {
                            pageData.value.onlineChannelList.push({
                                id: id,
                                ip: ip,
                                name: name,
                                accessType: accessType,
                            })
                            pageData.value.chlCaps[id] = {
                                id: id,
                                ip: ip,
                                name: name,
                                accessType: accessType,
                                chlType: chlType,
                                supportOsc: supportOsc,
                                supportCdd: supportCdd,
                                supportVfd: supportVfd,
                                supportBackVfd: supportBackVfd,
                                supportAvd: supportAvd,
                                supportPea: supportPea,
                                supportPeaTrigger: supportPeaTrigger,
                                supportIpd: supportIpd,
                                supportTripwire: supportTripwire,
                                supportAOIEntry: supportAOIEntry,
                                supportAOILeave: supportAOILeave,
                                supportBackTripwire: supportBackTripwire,
                                supportBackPea: supportBackPea,
                                supportBackAOIEntry: supportBackAOIEntry,
                                supportBackAOILeave: supportBackAOILeave,
                                supportVehiclePlate: supportVehiclePlate,
                                supportPassLine: supportPassLine,
                                supportCpc: supportCpc,
                                supportAudio: supportAudio,
                                supportWhiteLight: supportWhiteLight,
                                supportAutoTrack: supportAutoTrack,
                                supportFire: supportFire,
                                supportTemperature: supportTemperature,
                                supportVideoMetadata: supportVideoMetadata,
                                supportLoitering: supportLoitering,
                                supportPvd: supportPvd,
                                supportRegionStatistics: supportRegionStatistics,
                                supportASD: supportASD,
                                supportHeatMap: supportHeatMap,
                                supportCrowdGathering: supportCrowdGathering,
                                supportBinocularCountConfig: supportBinocularCountConfig,
                            }
                        }
                    }
                })

                pageData.value.currChlId = pageData.value.onlineChannelList[0].id
            }
        }

        // 获取音频列表
        const getVoiceList = async () => {
            if (systemCaps.supportAlarmAudioConfig) {
                pageData.value.voiceList = await buildAudioList()
            }
        }

        onMounted(async () => {
            await getOnlineChannel()
            await getChannelData()
            await getVoiceList()
            changeChannel()
        })

        return {
            chlData,
            pageData,
            changeChannel,
        }
    },
})
