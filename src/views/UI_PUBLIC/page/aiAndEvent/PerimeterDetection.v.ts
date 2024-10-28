/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:32
 * @Description: 周界防范/人车检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 15:58:10
 */
import { type TabsPaneContext } from 'element-plus'
import { type chlCaps } from '@/types/apiType/aiAndEvent'
import Tripwire from './Tripwire.vue'
import Pea from './Pea.vue'
export default defineComponent({
    components: {
        Tripwire,
        Pea,
    },
    setup() {
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 当前选中的通道
            currChlId: '',
            // 在线通道id列表
            onlineChannelIdList: [] as string[],
            // 在线通道列表
            onlineChannelList: [] as { id: string; ip: string; name: string; accessType: string }[],
            // 当前选择通道数据
            chlData: {} as chlCaps,
            // 通道能力集
            chlCaps: {} as Record<string, chlCaps>,
            // 当前选择的功能
            chosenFunction: 'Tripwire',
            tabKey: 0,
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            // 是否支持声音设置
            supportAlarmAudioConfig: true,

            // 筛选出第一个支持人脸的通道
            checkFirstFaceChlId: '',
            // 筛选出第一个支持车辆的通道
            checkFirstVehicleChlId: '',
            // 保存所有支持人车非周界的通道
            boundaryChlCapsObj: [],
            // 保存所有支持更多分类的通道
            moreChlCapsObj: [],

            // 设备能力集
            localFaceDectEnabled: false,
            localTargetDectEnabled: false,
            faceMatchLimitMaxChlNum: 0,
            supportFaceMatch: false,
            supportPlateMatch: false,
            showAIReourceDetail: false,

            // 支持越界检测的通道id
            tripwireCaps: [] as string[],
            //支持区域入侵的通道id
            peaCaps: [] as string[],

            count: 0,
            isTriggerPage: false,
            // 总ai资源占用率
            totalResourceOccupancy: '0.00',

            // 是否允许越界检测tab跳转
            tripwireDisable: false,
            // 是否允许区域入侵检测tab跳转
            peaDisable: false,
            // 不支持功能提示页面是否展示
            // notSupportTipShow: false,
            // AI详情弹窗
            aiResourcePopOpen: false,
            // apply按钮是否可用
            applyDisable: true,

            // 排程管理
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],

            // record数据源
            recordSource: [] as SelectOption<string, string>[],
            // alarmOut数据源
            alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
        })
        // 获取在线通道
        const getOnlineChannel = async () => {
            const res = await queryOnlineChlList()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                $('//content/item').forEach((item) => {
                    const id = item.attr('id')
                    pageData.value.onlineChannelIdList.push(id ? id : '')
                })
            }

            if (pageData.value.onlineChannelIdList.length == 0) {
                pageData.value.chosenFunction = ''
                pageData.value.tripwireDisable = true
                pageData.value.peaDisable = true
            }
        }

        // 获取通道数据
        const getChannelData = async () => {
            pageData.value.localFaceDectEnabled = systemCaps.localFaceDectMaxCount != 0
            pageData.value.localTargetDectEnabled = systemCaps.localTargetDectMaxCount != 0
            pageData.value.faceMatchLimitMaxChlNum = systemCaps.faceMatchLimitMaxChlNum
            pageData.value.supportFaceMatch = systemCaps.supportFaceMatch
            pageData.value.supportPlateMatch = systemCaps.supportPlateMatch
            pageData.value.showAIReourceDetail = systemCaps.showAIReourceDetail

            const resb = await getChlList({
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
                    'supportAudioAlarmOut',
                    'supportTemperature',
                    'protocolType',
                    'supportVideoMetadata',
                ],
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((element) => {
                    const $item = queryXml(element.element)
                    const protocolType = $item('protocolType').text()
                    const factoryName = $item('productModel').attr('factoryName')
                    if (factoryName === 'Recorder') return
                    const curChlId = element.attr('id')
                    if (protocolType !== 'RTSP' && pageData.value.onlineChannelIdList.some((item) => item === curChlId)) {
                        const id = element.attr('id')!
                        const name = $item('name').text()
                        const ip = $item('ip').text()
                        const chlType = $item('chlType').text()
                        const accessType = $item('AccessType').text()
                        const supportOsc = $item('supportOsc').text() == 'true'
                        const supportCdd = $item('supportCdd').text() == 'true'
                        const supportVfd = $item('supportVfd').text() == 'true'
                        const supportAvd = $item('supportAvd').text() == 'true'
                        const supportPea = $item('supportPea').text() == 'true'
                        const supportPeaTrigger = $item('supportPeaTrigger').text() == 'true' // NT-9829
                        const supportIpd = $item('supportIpd').text() == 'true'
                        const supportTripwire = $item('supportTripwire').text() == 'true'
                        const supportAOIEntry = $item('supportAOIEntry').text() == 'true'
                        const supportAOILeave = $item('supportAOILeave').text() == 'true'
                        const supportVehiclePlate = $item('supportVehiclePlate').text() == 'true'
                        const supportPassLine = $item('supportPassLine').text() == 'true'
                        const supportCpc = $item('supportCpc').text() == 'true'
                        const supportAudio = $item('supportAudioAlarmOut').text() == 'true'
                        const supportWhiteLight = $item('supportWhiteLightAlarmOut').text() == 'true'
                        const supportAutoTrack = $item('supportAutoTrack').text() == 'true'
                        const supportFire = $item('supportFire').text() == 'true'
                        const supportTemperature = $item('supportTemperature').text() == 'true'
                        const supportVideoMetadata = $item('supportVideoMetadata').text() == 'true'
                        let supportBackVfd = false
                        let supportBackTripwire = false
                        let supportBackPea = false
                        let supportBackAOIEntry = false
                        let supportBackAOILeave = false
                        if (pageData.value.localFaceDectEnabled) {
                            // 支持人脸后侦测且人脸前侦测为false，才算支持人脸后侦测
                            supportBackVfd = !supportVfd
                        }

                        if (pageData.value.localTargetDectEnabled) {
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
                            pageData.value.localTargetDectEnabled,
                            supportVideoMetadata,
                        ]
                        if (allCapsArr.includes(true)) {
                            if (pageData.value.checkFirstFaceChlId == '') {
                                if (supportVfd || supportBackVfd) {
                                    pageData.value.checkFirstFaceChlId = id
                                }
                            }

                            if (pageData.value.checkFirstVehicleChlId == '' && supportVehiclePlate) {
                                pageData.value.checkFirstVehicleChlId = id
                            }
                            // 保存人车非周界的能力集，用于筛选出第一个支持的通道
                            // 保存能力集为true的通道
                            // 区域入侵界面包含了区域进入和离开
                            const areaIntellCfg = [supportPea, supportBackPea, supportPeaTrigger, supportAOIEntry, supportBackAOIEntry, supportAOILeave, supportBackAOILeave]
                            supportTripwire || supportBackTripwire || supportPeaTrigger ? pageData.value.tripwireCaps.push(id) : pageData.value.tripwireCaps
                            areaIntellCfg.includes(true) ? pageData.value.peaCaps.push(id) : pageData.value.peaCaps
                            // 更多模块 其他页面用
                            // supportOsc ? oscCaps.push(id) : oscCaps
                            // supportCdd ? cddCaps.push(id) : cddCaps
                            // supportPassLine || supportCpc ? passLinecaps.push(id) : passLinecaps
                            // supportAvd ? avdCaps.push(id) : avdCaps
                            // supportFire ? fireCaps.push(id) : fireCaps
                            // supportTemperature ? temperatureCaps.push(id) : temperatureCaps

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
                                showAIReourceDetail: pageData.value.showAIReourceDetail,
                                faceMatchLimitMaxChlNum: pageData.value.faceMatchLimitMaxChlNum,
                            }
                        }
                    }
                })
                pageData.value.currChlId = pageData.value.onlineChannelList[0].id
                pageData.value.chlData = pageData.value.chlCaps[pageData.value.currChlId]
            }
        }

        // 获取音频列表
        const getVoiceList = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAlarmAudioConfig == true) {
                pageData.value.voiceList = await buildAudioList()
            }
        }

        // 切换通道操作
        const handleChangeChannel = async () => {
            pageData.value.chlData = pageData.value.chlCaps[pageData.value.currChlId]
            pageData.value.tabKey += 1
            initPageData()
        }

        // 大tab点击事件,切换功能 Tripwire/Pea
        const handleTabClick = async (pane: TabsPaneContext) => {
            pageData.value.chosenFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            pageData.value.tabKey += 1
        }

        // 切换通道及初始化时判断tab是否可用，若不可用则切换到可用的tab，都不可用再显示提示
        const isTabDisabled = () => {
            pageData.value.tripwireDisable = pageData.value.chlData.supportTripwire || pageData.value.chlData.supportBackTripwire || pageData.value.chlData.supportPeaTrigger ? false : true
            pageData.value.peaDisable = pageData.value.chlData.supportPea || pageData.value.chlData.supportBackPea || pageData.value.chlData.supportPeaTrigger ? false : true
            if (pageData.value.tripwireDisable == true && pageData.value.peaDisable == false) {
                pageData.value.chosenFunction = 'pea'
            } else if (pageData.value.tripwireDisable == false && pageData.value.peaDisable == true) {
                pageData.value.chosenFunction = 'tripwire'
            } else if (pageData.value.tripwireDisable == true && pageData.value.peaDisable == true) {
                // pageData.value.notSupportTipShow = true
                pageData.value.chosenFunction = ''
            }
            // pageData.value.chosenFunction = ''
        }

        // 初始化页面数据
        const initPageData = async () => {
            isTabDisabled()
        }
        onMounted(async () => {
            await getOnlineChannel()
            await getChannelData()
            await getVoiceList()
            await initPageData()
            pageData.value.tabKey += 1
        })
        return {
            pageData,
            handleChangeChannel,
            handleTabClick,
            Tripwire,
            Pea,
        }
    },
})
