/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:32
 * @Description: 周界防范/人车检测
 */
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'
import TripwirePanel from './TripwirePanel.vue'
import PeaPanel from './PeaPanel.vue'
import AreaEnterPanel from './AreaEnterPanel.vue'
import AreaLeavePanel from './AreaLeavePanel.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
        TripwirePanel,
        PeaPanel,
        AreaEnterPanel,
        AreaLeavePanel,
        AlarmBaseErrorPanel,
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
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            // 不支持功能提示页面是否展示
            notSupport: false,
        })

        const chlData = computed(() => {
            return pageData.value.chlCaps[pageData.value.currChlId] || new AlarmChlDto()
        })

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

            if (!pageData.value.onlineChannelIdList.length) {
                pageData.value.notSupport = true
            }
        }

        /**
         * @description 获取通道数据
         */
        const getChannelData = async () => {
            const result = await getChlList({
                requireField: [
                    'ip',
                    'supportInvokeEventTypeConfig',
                    'supportTripwire',
                    'supportPea',
                    'supportPeaTrigger',
                    'supportAOIEntry',
                    'supportAOILeave',
                    'supportVfd',
                    'supportHeatMap',
                    'supportVehiclePlate',
                    'supportVideoMetadata',
                    'supportCrowdGathering',
                    'supportBinocularCountConfig',
                    'supportLoitering',
                    'supportFire',
                    'supportPassLine',
                    'supportCpc',
                    'supportOsc',
                    'supportCdd',
                    'supportASD',
                    'supportAvd',
                    'supportTemperature',
                    'supportPvd',
                    'supportIpd',
                    'supportAutoTrack',
                    'supportRegionStatistics',
                    'protocolType',
                    'supportAudioAlarmOut',
                    'supportWhiteLightAlarmOut',
                    // 如果IPC支持的分辨率没有能支持后侦测的分辨率，就不能支持后侦测。是否支持后侦测能力集
                    'supportLocalVfd',
                    'supportLocalTripwire',
                    'supportLocalInvade',
                    'supportLocalAOIEntry',
                    'supportLocalAOILeave',
                    'supportPtz',
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
                        const supportTemperature = $item('supportTemperature').text().bool()
                        const supportVideoMetadata = $item('supportVideoMetadata').text().bool()
                        const supportLocalVfd = $item('supportLocalVfd').text().bool()
                        const supportLocalTripwire = $item('supportLocalTripwire').text().bool()
                        const supportLocalInvade = $item('supportLocalInvade').text().bool()
                        const supportLocalAOIEntry = $item('supportLocalAOIEntry').text().bool()
                        const supportLocalAOILeave = $item('supportLocalAOILeave').text().bool()

                        let supportBackVfd = false
                        let supportBackTripwire = false
                        let supportBackPea = false
                        let supportBackAOIEntry = false
                        let supportBackAOILeave = false
                        if (!!systemCaps.localFaceDectMaxCount) {
                            // 支持人脸后侦测且人脸前侦测为false，才算支持人脸后侦测
                            supportBackVfd = supportLocalVfd
                        }

                        if (!!systemCaps.localTargetDectMaxCount) {
                            supportBackTripwire = supportLocalTripwire
                            supportBackPea = supportLocalInvade
                            supportBackAOIEntry = supportLocalAOIEntry
                            supportBackAOILeave = supportLocalAOILeave
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
                                supportLoitering: false,
                                supportPvd: false,
                                supportRegionStatistics: false,
                                supportASD: false,
                                supportHeatMap: false,
                                supportCrowdGathering: false,
                                supportBinocularCountConfig: false,
                            }
                        }
                    }
                })

                if (history.state.chlId) {
                    if (pageData.value.chlCaps[history.state.chlId]) {
                        pageData.value.tab = history.state.type
                        pageData.value.currChlId = history.state.chlId
                    }
                    delete history.state.type
                    delete history.state.chlId
                }

                if (!pageData.value.currChlId) {
                    pageData.value.currChlId = pageData.value.onlineChannelList[0].id
                }
            }
        }

        /**
         * @description 获取音频列表
         */
        const getVoiceList = async () => {
            if (systemCaps.supportAlarmAudioConfig) {
                pageData.value.voiceList = await buildAudioList()
            }
        }

        /**
         * @description 切换通道操作
         */
        const changeChannel = () => {
            pageData.value.notSupport = false
            if (chlData.value.supportTripwire || chlData.value.supportBackTripwire || chlData.value.supportPeaTrigger) {
                pageData.value.tab = 'Tripwire'
            } else if (chlData.value.supportPea || chlData.value.supportBackPea || chlData.value.supportPeaTrigger) {
                pageData.value.tab = 'Pea'
            } else if (chlData.value.supportAOIEntry || chlData.value.supportBackAOIEntry) {
                pageData.value.tab = 'AreaEnter'
            } else if (chlData.value.supportAOILeave || chlData.value.supportBackAOILeave) {
                pageData.value.tab = 'AreaLeave'
            } else {
                pageData.value.notSupport = true
                pageData.value.tab = ''
            }
        }

        onMounted(async () => {
            await getOnlineChannel()
            await getChannelData()
            await getVoiceList()
            changeChannel()
        })

        return {
            pageData,
            changeChannel,
            chlData,
        }
    },
})
