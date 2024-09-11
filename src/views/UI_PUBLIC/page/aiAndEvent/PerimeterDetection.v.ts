/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:32
 * @Description: 周界防范/人车检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-11 14:58:19
 */
import { ArrowDown } from '@element-plus/icons-vue'
import { ElDivider, type TabsPaneContext } from 'element-plus'
import { useLangStore } from '@/stores/lang'
import { buildScheduleList } from '@/utils/tools'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import { type chlCaps, type aiResourceRow } from '@/types/apiType/aiAndEvent'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { cloneDeep } from 'lodash'
import SetPresetPop from './SetPresetPop.vue'
import { peaPageData, type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import CanvasPassline from '@/utils/canvas/canvasPassline'
import { queryAIResourceDetail } from '@/api/aiAndEvent'
export default defineComponent({
    components: {
        ArrowDown,
        ElDivider,
        ScheduleManagPop,
        ChannelPtzCtrlPanel,
        BaseTransferDialog,
        SetPresetPop,
    },
    setup() {
        type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const aiResourceTableData = ref<aiResourceRow[]>([])
        const moreDropDownRef = ref()
        const tripwireplayerRef = ref<PlayerInstance>()
        const peaplayerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        // 绘制的Canvas
        let tripwireDrawer: CanvasPassline
        let peaDrawer: CanvasPolygon
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
            chosenFunction: 'tripwire',
            // 声音列表
            voiceList: [] as { value: string; label: string }[],
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 默认声音id
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',

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
            notSupportTipShow: false,
            // AI详情弹窗
            aiResourcePopOpen: false,
            // apply按钮是否可用
            applyDisable: true,

            // 排程管理
            scheduleManagePopOpen: false,
            scheduleDefaultId: '{00000000-0000-0000-0000-000000000000}',
            scheduleList: [] as SelectOption<string, string>[],

            // record数据源
            recordSource: [] as { value: string; label: string }[],
            // alarmOut数据源
            alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
            eventTypeMapping: {
                faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
                faceMatch: Translate('IDCS_FACE_RECOGNITION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
            } as Record<string, string>,
            closeTip: {
                cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'),
                cpc: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                ipd: Translate('IDCS_INVADE_DETECTION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                osc: Translate('IDCS_WATCH_DETECTION'),
                avd: Translate('IDCS_ABNORMAL_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
                vfd: Translate('IDCS_FACE_DETECTION'),
                aoientry: Translate('IDCS_INVADE_DETECTION'),
                aoileave: Translate('IDCS_INVADE_DETECTION'),
                passlinecount: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                vehicle: Translate('IDCS_PLATE_DETECTION'),
                fire: Translate('IDCS_FIRE_POINT_DETECTION'),
                vsd: Translate('IDCS_VSD_DETECTION'),
            } as Record<string, string>,
            directionTypeTip: {
                none: 'A<->B',
                rightortop: 'A->B',
                leftorbotton: 'A<-B',
            } as Record<string, string>,
        })
        // 越界检测页面数据
        const tripwireData: { [key: string]: any } = ref({
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang('IPC'),
            // 选择的功能:tripwire_param,tripwire_target,tripwire_trigger
            tripwireFunction: 'tripwire_param',
            // 播放器相关
            // 通知列表
            notification: [] as string[],
            // 排程
            tripwire_schedule: '',
            // 请求失败显示提示
            requireDataFail: false,

            // 持续时间
            holdTime: 0,
            holdTimeList: [] as { value: number; label: string }[],
            // 警戒面
            alertSurface: '',
            // 选择的警戒面
            chosenSurfaceIndex: 0,
            lineInfo: [] as { direction: string; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[],
            // 方向
            direction: '',
            // 方向列表
            directionList: [] as { value: string; label: string }[],

            // 是否显示全部区域绑定值
            isShowAllArea: false,

            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: false,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: false,
            // mutex
            mutexList: [] as { object: string; status: boolean }[],
            mutexListEx: [] as { object: string; status: boolean }[],
            // 目标类型只支持人
            tripwire_onlyPreson: false,
            // 只支持人的灵敏度
            onlyPersonSensitivity: 0,
            // 云台speed
            tripWirespeed: 0,
            // 云台锁定状态
            lockStatus: false,
            // 联动追踪
            hasAutoTrack: false,
            autoTrack: false,
            // 是否支持SD卡存储
            pictureAvailable: false,
            // SD卡原图存储
            saveTargetPicture: false,
            // SD卡目标图存储
            saveSourcePicture: false,

            // 检测目标
            hasObj: false,
            objectFilter: {
                person: false,
                car: false,
                motorcycle: false,
                personSensitivity: 0,
                carSensitivity: 0,
                motorSensitivity: 0,
            },
            triggerSwitch: false,
            snapSwitch: false,
            msgPushSwitch: false,
            buzzerSwitch: false,
            popVideoSwitch: false,
            emailSwitch: false,
            // 音频联动
            audioSuport: false,
            triggerAudio: false,
            // 白光联动
            lightSuport: false,
            triggerWhiteLight: false,
            sysAudio: '',
            record: {
                switch: false,
                chls: [] as { value: string; label: string }[],
            },
            // 选中的record id
            recordList: [] as string[],
            recordIsShow: false,
            recordHeaderTitle: 'IDCS_TRIGGER_CHANNEL_RECORD',
            recordSourceTitle: 'IDCS_CHANNEL',
            recordTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // recordSource: [] as { value: string; label: string }[],
            recordType: 'record',

            alarmOut: {
                switch: false,
                chls: [] as { value: string; label: string }[],
            },
            // 选中的alarmOut id
            alarmOutList: [] as string[],
            alarmOutIsShow: false,
            alarmOutHeaderTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutSourceTitle: 'IDCS_ALARM_OUT',
            alarmOutTargetTitle: 'IDCS_TRIGGER_ALARM_OUT',
            // alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
            alarmOutType: 'alarmOut',

            preset: {
                switch: false,
                presets: [] as PresetItem[],
            },
            presetSource: [] as PresetList[],
            initComplete: false,
            drawInitCount: 0,
        })

        const tripwireTriggerData = ref<{ value: boolean; label: string; property: string }[]>([])
        let tripwirePlayer: PlayerInstance['player']
        let tripwirePlugin: PlayerInstance['plugin']
        // tripwire播放模式
        const tripwiremode = computed(() => {
            if (!tripwireplayerRef.value) {
                return ''
            }
            return tripwireplayerRef.value.mode
        })

        const tripwireReady = computed(() => {
            return tripwireplayerRef.value?.ready || false
        })
        const tripWirehandlePlayerReady = () => {
            tripwirePlayer = tripwireplayerRef.value!.player
            tripwirePlugin = tripwireplayerRef.value!.plugin

            if (tripwiremode.value === 'h5') {
                if (tripwireplayerRef.value) {
                    const canvas = tripwireplayerRef.value.player.getDrawbordCanvas(0)
                    tripwireDrawer = new CanvasPassline({
                        el: canvas,
                        enableOSD: true,
                        enableShowAll: false,
                        onchange: tripwireChange,
                    })
                }
                if (isHttpsLogin()) {
                    tripwireData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }
            if (tripwiremode.value === 'ocx') {
                if (!tripwirePlugin.IsInstallPlugin()) {
                    tripwirePlugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!tripwirePlugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    tripwirePlugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }
        /**
         * @description 播放视频
         */
        const tripwirePlay = () => {
            const { id, name } = pageData.value.chlData
            if (tripwiremode.value === 'h5') {
                tripwirePlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else if (tripwiremode.value === 'ocx') {
                tripwirePlugin.RetryStartChlView(id, name)
            }
        }
        // 首次加载成功 播放tripwire视频
        const tripwirestopWatchFirstPlay = watchEffect(() => {
            if (tripwireReady.value && pageData.value.chlData && tripwireData.value.initComplete) {
                nextTick(() => {
                    tripwirePlay()
                    setTripwireOcxData()
                })
                tripwirestopWatchFirstPlay()
            }
        })
        // 修改越界播放器速度
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setTripWireSpeed = (speed: number) => {
            tripwireData.value.tripWirespeed = speed
        }
        // 区域入侵页面数据
        const peaData = ref({
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(pageData.value.chlData['supportTripwire'] ? 'IPC' : 'NVR'),
            // 选择的功能:pea_param,pea_target,pea_trigger
            peaFunction: 'pea_param',
            // activity_type 1:perimeter 2:entry 3:leave
            activity_type: 'perimeter',
            // 选择的警戒面index
            chosenWarnAreaIndex: 0,
            // 支持的活动类型列表
            supportList: [] as string[],
            // 请求失败显示提示
            requireDataFail: false,

            // 云台锁定状态
            lockStatus: false,
            // 云台speed
            peaspeed: 0,
            // 排程
            pea_schedule: '',
            // 通知列表
            notification: [] as string[],

            // 是否显示全部区域绑定值
            isShowAllArea: false,

            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: true,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: true,

            // 区域活动
            areaActive: '',
            // 区域活动列表
            areaActiveList: [] as { value: string; label: string }[],
            // 方向
            direction: '',
            // 方向列表
            directionList: [] as { value: string; label: string }[],
            // 区域活动禁用
            areaActiveDisable: false,
            // 方向禁用
            directionDisable: false,
            // 多层结构数据无法通过areaCfgData读取到，所以单独存储
            // 三种类型的数据
            areaCfgData: {
                perimeter: {} as peaPageData,
                entry: {} as peaPageData,
                leave: {} as peaPageData,
            } as Record<string, peaPageData>,

            // 画图相关
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域
            currAreaType: 'detectionArea' as CanvasPolygonAreaType,
            initComplete: false,
            drawerInitCount: 0,
        })
        let peaPlayer: PlayerInstance['player']
        let peaPlugin: PlayerInstance['plugin']
        const peamode = computed(() => {
            if (!peaplayerRef.value) {
                return ''
            }
            return peaplayerRef.value.mode
        })

        const peaReady = computed(() => {
            return peaplayerRef.value?.ready || false
        })
        const peahandlePlayerReady = () => {
            peaPlayer = peaplayerRef.value!.player
            peaPlugin = peaplayerRef.value!.plugin

            if (peamode.value === 'h5') {
                if (peaplayerRef.value && peaData.value.initComplete) {
                    const canvas = peaplayerRef.value.player.getDrawbordCanvas(0)
                    const regulation = peaData.value.currentRegulation
                    peaDrawer = new CanvasPolygon({
                        el: canvas,
                        regulation: regulation,
                        onchange: peaChange,
                        closePath: peaClosePath,
                        forceClosePath: peaForceClosePath,
                        clearCurrentArea: peaClearCurrentArea,
                    })
                }
                if (isHttpsLogin()) {
                    peaData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }
            if (peamode.value === 'ocx') {
                if (!peaPlugin.IsInstallPlugin()) {
                    peaPlugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!peaPlugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    peaPlugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }
        /**
         * @description 播放视频
         */
        const peaPlay = () => {
            const { id, name } = pageData.value.chlData
            if (peamode.value === 'h5') {
                peaPlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else if (peamode.value === 'ocx') {
                peaPlugin.RetryStartChlView(id, name)
            }
        }
        // 首次加载成功 播放pea视频
        const peastopWatchFirstPlay = watchEffect(() => {
            if (peaReady.value && pageData.value.chlData && peaData.value) {
                nextTick(() => {
                    peaPlay()
                    setPeaOcxData()
                })
                peastopWatchFirstPlay()
            }
        })
        // 跳转至tripwire时，设置ocx数据
        watchEffect(() => {
            if (tripwireData.value.initComplete && pageData.value.chosenFunction === 'tripwire' && tripwireData.value.drawerInitCount === 0) {
                if (tripwiremode.value === 'h5') {
                    if (tripwireplayerRef.value) {
                        const canvas = tripwireplayerRef.value.player.getDrawbordCanvas(0)
                        tripwireDrawer = new CanvasPassline({
                            el: canvas,
                            enableOSD: true,
                            enableShowAll: false,
                            onchange: tripwireChange,
                        })
                    }
                    if (isHttpsLogin()) {
                        tripwireData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                    }
                }
                if (tripwiremode.value === 'ocx') {
                    if (!tripwirePlugin.IsInstallPlugin()) {
                        tripwirePlugin.SetPluginNotice('#layout2Content')
                        return
                    }
                    if (!tripwirePlugin.IsPluginAvailable()) {
                        pluginStore.showPluginNoResponse = true
                        tripwirePlugin.ShowPluginNoResponse()
                    }
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                tripwireData.value.drawerInitCount++
                tripwireDrawer.clear()
                setTripwireOcxData()
            }
        })
        // 跳转至pea时，设置ocx数据
        watchEffect(() => {
            if (peaData.value.initComplete && pageData.value.chosenFunction === 'pea' && peaData.value.drawerInitCount === 0) {
                if (peamode.value === 'h5') {
                    if (peaplayerRef.value) {
                        const canvas = peaplayerRef.value.player.getDrawbordCanvas(0)
                        const regulation = peaData.value.currentRegulation
                        peaDrawer = new CanvasPolygon({
                            el: canvas,
                            regulation: regulation,
                            onchange: peaChange,
                            closePath: peaClosePath,
                            forceClosePath: peaForceClosePath,
                            clearCurrentArea: peaClearCurrentArea,
                        })
                    }
                    if (isHttpsLogin()) {
                        peaData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                    }
                }
                if (peamode.value === 'ocx') {
                    if (!peaPlugin.IsInstallPlugin()) {
                        peaPlugin.SetPluginNotice('#layout2Content')
                        return
                    }
                    if (!peaPlugin.IsPluginAvailable()) {
                        pluginStore.showPluginNoResponse = true
                        peaPlugin.ShowPluginNoResponse()
                    }
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                peaData.value.drawerInitCount++
                peaDrawer.clear()
                setPeaOcxData()
            }
        })
        // 修改区域入侵播放器速度
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setPeaSpeed = (speed: number) => {
            peaData.value.peaspeed = speed
        }
        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.scheduleList.map((item) => {
                item.value = item.value != '' ? item.value : pageData.value.scheduleDefaultId
            })
        }
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
                queryAlarmAudioCfg().then(async (resb) => {
                    pageData.value.voiceList = []
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        res('//content/audioList/item').forEach((item: any) => {
                            const $item = queryXml(item.element)
                            pageData.value.voiceList.push({
                                value: item.attr('id'),
                                label: $item('name').text(),
                            })
                        })
                        pageData.value.voiceList.push({ value: pageData.value.defaultAudioId, label: '<' + Translate('IDCS_NULL') + '>' })
                    }
                })
            }
        }
        // 获取AI资源请求
        const getAIResourceData = async (isEdit: boolean) => {
            let sendXml = ''
            if (isEdit) {
                sendXml = rawXml`<content>
                                    <chl>
                                        <item id="${pageData.value.currChlId}">
                                            <eventType>tripwire</eventType>
                                            <switch>${tripwireData.value.detectionEnable}</switch>
                                        </item>
                                    </chl>
                                </content>`
            }
            const res = await queryAIResourceDetail(sendXml)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                const tempResourceOccupancy = Number($('//content/totalResourceOccupancy').text())
                if (tempResourceOccupancy * 1 <= 100) {
                    aiResourceTableData.value = []
                    pageData.value.totalResourceOccupancy = tempResourceOccupancy.toFixed(2)
                    $('//content/chl/item').forEach((element: any) => {
                        const $item = queryXml(element.element)
                        const id = element.attr('id')
                        let name = $item('name').text()
                        // 通道是否在线
                        const connectState = $item('connectState').text() == 'true'
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'
                        $item('resource/item').forEach((ele: any) => {
                            const eventType: string[] = ele.attr('eventType') ? ele.attr('eventType').split(',') : ''
                            const eventTypeText = eventType
                                .map((item) => {
                                    return pageData.value.eventTypeMapping[item]
                                })
                                .join('+')
                            const percent = ele.text() + '%'
                            const decodeResource = ele.attr('occupyDecodeCapPercent')
                                ? ele.attr('occupyDecodeCapPercent') == 'notEnough'
                                    ? Translate('IDCS_NO_DECODE_RESOURCE')
                                    : ele.attr('occupyDecodeCapPercent') + '%'
                                : '--'
                            aiResourceTableData.value.push({
                                id: id ? id : '',
                                name: name,
                                eventType: eventType,
                                eventTypeText: eventTypeText,
                                percent: percent,
                                decodeResource: decodeResource,
                            })
                        })
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_NO_RESOURCE'),
                    })
                    // 资源占用率超过100
                    tripwireData.value.detectionEnable = false
                    peaData.value.detectionEnable = false
                }
            }
        }
        // 删除AI资源请求
        const deleteAIResource = async (row: aiResourceRow) => {
            let sendXml = rawXml`<content>
                                    <chl id="${row.id}">
                                        <param>`
            row.eventType.forEach((item) => {
                sendXml += rawXml`<item>${item}</item>`
            })
            sendXml += rawXml`</param>
                            </chl>
                        </content>`
            openLoading(LoadingTarget.FullScreen)
            const res = await freeAIOccupyResource(sendXml)
            closeLoading(LoadingTarget.FullScreen)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                aiResourceTableData.value.splice(aiResourceTableData.value.indexOf(row), 1)
            }
        }
        // 点击释放AI资源
        const handleAIResourceDel = async (row: aiResourceRow) => {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                deleteAIResource(row)
                pageData.value.applyDisable = false
            })
        }
        // 获取越界检测数据
        const getTripwireData = async () => {
            if (!pageData.value.chlData['supportTripwire'] && !pageData.value.chlData['supportBackTripwire'] && pageData.value.chlData['supportPeaTrigger']) {
                const sendXML = rawXml` <condition>
                                            <chlId>${pageData.value.currChlId}</chlId>
                                        </condition>
                                        <requireField>
                                            <trigger/>
                                        </requireField>`
                const res = await queryTripwire(sendXML)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    pageData.value.applyDisable = true
                    const schedule = $('//content/chl').attr('scheduleGuid')
                    tripwireData.value.tripwire_schedule = schedule
                        ? pageData.value.scheduleList.some((item) => item.value == schedule)
                            ? schedule
                            : pageData.value.scheduleDefaultId
                        : pageData.value.scheduleDefaultId
                    $('//content/chl/trigger').forEach((item) => {
                        const $item = queryXml(item.element)
                        tripwireData.value.snapSwitch = $item('snapSwitch').text() == 'true'
                        tripwireData.value.msgPushSwitch = $item('msgPushSwitch').text() == 'true'
                        tripwireData.value.buzzerSwitch = $item('buzzerSwitch').text() == 'true'
                        tripwireData.value.popVideoSwitch = $item('popVideoSwitch').text() == 'true'
                        tripwireData.value.emailSwitch = $item('emailSwitch').text() == 'true'
                        tripwireData.value.sysAudio = $item('sysAudio').attr('id') ? $item('sysAudio').attr('id') : ''
                        tripwireData.value.record = {
                            switch: $item('sysRec/switch').text() == 'true',
                            chls: $item('sysRec/chls/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.recordList = tripwireData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.alarmOut = {
                            switch: $item('alarmOut/switch').text() == 'true',
                            chls: $item('alarmOut/alarmOuts/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.alarmOutList = tripwireData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.preset = {
                            switch: $item('preset/switch').text() == 'true',
                            presets: $item('preset/presets/item').map((item: any) => {
                                const $item = queryXml(item.element)
                                return {
                                    index: $item('index').text(),
                                    name: $item('name').text(),
                                    chl: {
                                        value: $item('chl').attr('id'),
                                        label: $item('chl').text(),
                                    },
                                }
                            }),
                        }
                    })
                    tripwireTriggerData.value = [
                        { value: tripwireData.value.snapSwitch, label: 'IDCS_SNAP', property: 'snapSwitch' },
                        { value: tripwireData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
                        { value: tripwireData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
                        { value: tripwireData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
                        { value: tripwireData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
                    ]
                } else {
                    tripwireData.value.requireDataFail = true
                }
            } else {
                const sendXML = rawXml` <condition>
                                            <chlId>${pageData.value.currChlId}</chlId>
                                        </condition>
                                        <requireField>
                                            <param/>
                                            <trigger/>
                                        </requireField>`
                const res = await queryTripwire(sendXML)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    pageData.value.applyDisable = true
                    const schedule = $('//content/chl').attr('scheduleGuid')
                    tripwireData.value.tripwire_schedule = schedule
                        ? pageData.value.scheduleList.some((item) => item.value == schedule)
                            ? schedule
                            : pageData.value.scheduleDefaultId
                        : pageData.value.scheduleDefaultId
                    tripwireData.value.directionList = $('//types/direction/enum').map((item) => {
                        return { value: item.text(), label: pageData.value.directionTypeTip[item.text()] }
                    })
                    tripwireData.value.mutexList = $('//content/chl/param/mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                    })
                    const mutexListEx = $('//content/chl/param/mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                    })
                    tripwireData.value.mutexListEx = mutexListEx ? mutexListEx : []
                    const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                    tripwireData.value.holdTimeList = formatHoldTime(holdTimeArr)
                    tripwireData.value.holdTime = Number($('//content/chl/param/alarmHoldTime').text())
                    if (!holdTimeArr.includes(tripwireData.value.holdTime.toString())) {
                        holdTimeArr.push(tripwireData.value.holdTime.toString())
                        tripwireData.value.holdTimeList = formatHoldTime(holdTimeArr)
                    }
                    tripwireData.value.lineInfo = $('//content/chl/param/line/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            direction: $item('direction').text(),
                            startPoint: { X: Number($item('startPoint/X').text()), Y: Number($item('startPoint/Y').text()) },
                            endPoint: { X: Number($item('endPoint/X').text()), Y: Number($item('endPoint/Y').text()) },
                            configured: false,
                        }
                    })
                    tripwireData.value.direction = tripwireData.value.lineInfo[tripwireData.value.chosenSurfaceIndex].direction
                    tripwireData.value.detectionEnable = $('//content/chl/param/switch').text() == 'true'
                    tripwireData.value.originalEnable = tripwireData.value.detectionEnable
                    tripwireData.value.audioSuport = $('//content/chl/param/triggerAudio').text() == '' ? false : true
                    tripwireData.value.triggerAudio = $('//content/chl/param/triggerAudio').text() == 'true'
                    tripwireData.value.lightSuport = $('//content/chl/param/triggerWhiteLight').text() == '' ? false : true
                    tripwireData.value.triggerWhiteLight = $('//content/chl/param/triggerWhiteLight').text() == 'true'
                    tripwireData.value.hasAutoTrack = $('//content/chl/param/autoTrack').text() == '' ? false : true
                    tripwireData.value.autoTrack = $('//content/chl/param/autoTrack').text() == 'true'
                    tripwireData.value.pictureAvailable = $('//content/chl/param/saveTargetPicture').text() == '' ? false : true
                    // tripwireData.value.pictureAvailable = true
                    tripwireData.value.saveTargetPicture = $('//content/chl/param/saveTargetPicture').text() == 'true'
                    tripwireData.value.saveSourcePicture = $('//content/chl/param/saveSourcePicture').text() == 'true'
                    tripwireData.value.tripwire_onlyPreson = $('//content/chl/param/sensitivity').text() == '' ? false : true
                    // tripwireData.value.tripwire_onlyPreson = true
                    // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                    tripwireData.value.onlyPersonSensitivity = tripwireData.value.tripwire_onlyPreson ? Number($('//content/chl/param/sensitivity').text()) : 0
                    tripwireData.value.hasObj = $('//content/chl/param/objectFilter').text() == '' ? false : true
                    if (tripwireData.value.hasObj) {
                        const car = $('//content/chl/param/objectFilter/car/switch').text() == 'true'
                        const person = $('//content/chl/param/objectFilter/person/switch').text() == 'true'
                        const motorcycle = $('//content/chl/param/objectFilter/motor/switch').text() == 'true'
                        const personSensitivity = Number($('//content/chl/param/objectFilter/person/sensitivity').text())
                        const carSensitivity = Number($('//content/chl/param/objectFilter/car/sensitivity').text())
                        const motorSensitivity = Number($('//content/chl/param/objectFilter/motor/sensitivity').text())
                        tripwireData.value.objectFilter = {
                            car: car,
                            person: person,
                            motorcycle: motorcycle,
                            personSensitivity: personSensitivity,
                            carSensitivity: carSensitivity,
                            motorSensitivity: motorSensitivity,
                        }
                    }
                    $('//content/chl/trigger').forEach((item) => {
                        const $item = queryXml(item.element)
                        tripwireData.value.snapSwitch = $item('snapSwitch').text() == 'true'
                        tripwireData.value.msgPushSwitch = $item('msgPushSwitch').text() == 'true'
                        tripwireData.value.buzzerSwitch = $item('buzzerSwitch').text() == 'true'
                        tripwireData.value.popVideoSwitch = $item('popVideoSwitch').text() == 'true'
                        tripwireData.value.emailSwitch = $item('emailSwitch').text() == 'true'
                        tripwireData.value.sysAudio = $item('sysAudio').attr('id') ? $item('sysAudio').attr('id') : ''
                        tripwireData.value.record = {
                            switch: $item('sysRec/switch').text() == 'true',
                            chls: $item('sysRec/chls/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.recordList = tripwireData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.alarmOut = {
                            switch: $item('alarmOut/switch').text() == 'true',
                            chls: $item('alarmOut/alarmOuts/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.alarmOutList = tripwireData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.preset = {
                            switch: $item('preset/switch').text() == 'true',
                            presets: $item('preset/presets/item').map((item: any) => {
                                const $item = queryXml(item.element)
                                return {
                                    index: $item('index').text(),
                                    name: $item('name').text(),
                                    chl: {
                                        value: $item('chl').attr('id'),
                                        label: $item('chl').text(),
                                    },
                                }
                            }),
                        }
                    })
                    tripwireTriggerData.value = [
                        { value: tripwireData.value.snapSwitch, label: 'IDCS_SNAP', property: 'snapSwitch' },
                        { value: tripwireData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
                        { value: tripwireData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
                        { value: tripwireData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
                        { value: tripwireData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
                    ]
                    if (tripwireData.value.audioSuport && pageData.value.chlData['supportAudio']) {
                        tripwireTriggerData.value.push({ value: tripwireData.value.triggerAudio, label: 'IDCS_AUDIO', property: 'triggerAudio' })
                    }
                    if (tripwireData.value.lightSuport && pageData.value.chlData['supportWhiteLight']) {
                        tripwireTriggerData.value.push({ value: tripwireData.value.triggerWhiteLight, label: 'IDCS_LIGHT', property: 'triggerWhiteLight' })
                    }
                } else {
                    tripwireData.value.requireDataFail = true
                }
            }
            getPresetList('tripwire')
        }
        // 获取区域入侵检测数据
        const getPeaData = async () => {
            peaData.value.supportList = []
            peaData.value.areaActiveList = []
            peaData.value.directionList = []
            const sendXML = rawXml` <condition>
                                        <chlId>${pageData.value.currChlId}</chlId>
                                    </condition>
                                    <requireField>
                                        <param/>
                                        <trigger/>
                                    </requireField>`
            const res = await queryIntelAreaConfig(sendXML)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                pageData.value.applyDisable = true
                const schedule = $('//content/chl').attr('scheduleGuid')
                peaData.value.pea_schedule = schedule
                    ? pageData.value.scheduleList.some((item) => item.value == schedule)
                        ? schedule
                        : pageData.value.scheduleDefaultId
                    : pageData.value.scheduleDefaultId
                getPeaActivityData('perimeter', res)
                getPeaActivityData('entry', res)
                getPeaActivityData('leave', res)
                getPresetList('pea')
                peaData.value.activity_type = peaData.value.supportList[0]
                if (peaData.value.supportList.includes('perimeter')) {
                    peaData.value.areaActiveList.push({ value: 'perimeter', label: Translate('IDCS_APPEAR') })
                }
                if (peaData.value.supportList.includes('entry') || peaData.value.supportList.includes('leave')) {
                    peaData.value.areaActiveList.push({ value: 'crossing', label: Translate('IDCS_CROSSING') })
                    peaData.value.directionList.push({ value: 'entry', label: Translate('IDCS_ENTRANCE') })
                    peaData.value.directionList.push({ value: 'leave', label: Translate('IDCS_LEAVE') })
                } else {
                    peaData.value.directionDisable = true
                    peaData.value.directionList = []
                }
                peaData.value.areaActive = peaData.value.areaActiveList[0]['value']
                if (peaData.value.areaActive == 'perimeter') {
                    peaData.value.activity_type = 'perimeter'
                    peaData.value.direction = peaData.value.directionList[0]['value']
                    peaData.value.directionDisable = true
                } else if (peaData.value.areaActive == 'crossing') {
                    peaData.value.activity_type = peaData.value.directionList[0]['value']
                    peaData.value.direction = peaData.value.directionList[0]['value']
                    peaData.value.directionDisable = false
                }
                peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activity_type].regulation
                peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            } else {
                peaData.value.requireDataFail = true
            }
        }
        // 获取区域活动数据 perimeter/entry/leave
        const getPeaActivityData = (activity_type: string, res: XMLDocument | Element) => {
            const $ = queryXml(res)
            if ($(`//content/chl/${activity_type}/param`).text() !== '') {
                peaData.value.supportList.push(activity_type)
                peaData.value.areaCfgData[activity_type].mutexList = $(`//content/chl/${activity_type}/param/mutexList/item`).map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                })
                const mutexListEx = $(`//content/chl/${activity_type}/param/mutexListEx/item`).map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                })
                peaData.value.areaCfgData[activity_type].mutexListEx = mutexListEx ? mutexListEx : []
                peaData.value.areaCfgData[activity_type].detectionEnable = $(`//content/chl/${activity_type}/param/switch`).text() == 'true'
                peaData.value.areaCfgData[activity_type].originalEnable = peaData.value.areaCfgData[activity_type].detectionEnable
                if (peaData.value.areaCfgData[activity_type].detectionEnable) {
                    peaData.value.activity_type = activity_type
                }
                const holdTimeArr = $(`//content/chl/${activity_type}/param/holdTimeNote`).text().split(',')
                peaData.value.areaCfgData[activity_type].holdTimeList = formatHoldTime(holdTimeArr)
                peaData.value.areaCfgData[activity_type].holdTime = Number($(`//content/chl/${activity_type}/param/alarmHoldTime`).text())
                if (!holdTimeArr.includes(peaData.value.areaCfgData[activity_type].holdTime.toString())) {
                    holdTimeArr.push(peaData.value.areaCfgData[activity_type].holdTime.toString())
                    peaData.value.areaCfgData[activity_type].holdTimeList = formatHoldTime(holdTimeArr)
                }
                peaData.value.areaCfgData[activity_type].regulation = $(`//content/chl/${activity_type}/param/boundary`).attr('regulation') == '1'
                const boundaryInfo = [] as { point: { X: number; Y: number; isClosed: boolean }[]; maxCount: number; configured: boolean }[]
                const regionInfo = [] as { X1: number; Y1: number; X2: number; Y2: number }[]
                $(`//content/chl/${activity_type}/param/boundary/item`).forEach((element) => {
                    const $ = queryXml(element.element)
                    const boundary = {
                        point: [] as { X: number; Y: number; isClosed: boolean }[],
                        maxCount: Number($('point').attr('maxCount')),
                        configured: false,
                    }
                    const region = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
                    $('point/item').forEach((element, index) => {
                        const $ = queryXml(element.element)
                        boundary['point'].push({ X: Number($('X').text()), Y: Number($('Y').text()), isClosed: true })
                        getRegion(index, element, region)
                    })
                    boundaryInfo.push(boundary)
                    regionInfo.push(region)
                })
                peaData.value.areaCfgData[activity_type].boundaryInfo = boundaryInfo
                peaData.value.areaCfgData[activity_type].regionInfo = regionInfo
                peaData.value.areaCfgData[activity_type].audioSuport = $(`//content/chl/${activity_type}/param/triggerAudio`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].triggerAudio = $(`//content/chl/${activity_type}/param/triggerAudio`).text() == 'true'
                peaData.value.areaCfgData[activity_type].lightSuport = $(`//content/chl/${activity_type}/param/triggerWhiteLight`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].triggerWhiteLight = $(`//content/chl/${activity_type}/param/triggerWhiteLight`).text() == 'true'
                peaData.value.areaCfgData[activity_type].hasAutoTrack = $(`//content/chl/${activity_type}/param/autoTrack`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].autoTrack = $(`//content/chl/${activity_type}/param/autoTrack`).text() == 'true'
                peaData.value.areaCfgData[activity_type].pictureAvailable = $(`//content/chl/${activity_type}/param/saveTargetPicture`).text() == '' ? false : true
                // peaData.value.areaCfgData[activity_type].pictureAvailable = true
                peaData.value.areaCfgData[activity_type].saveTargetPicture = $(`//content/chl/${activity_type}/param/saveTargetPicture`).text() == 'true'
                peaData.value.areaCfgData[activity_type].saveSourcePicture = $(`//content/chl/${activity_type}/param/saveSourcePicture`).text() == 'true'
                peaData.value.areaCfgData[activity_type].pea_onlyPreson = $(`//content/chl/${activity_type}/param/sensitivity`).text() == '' ? false : true
                // peaData.value.areaCfgData[activity_type].pea_onlyPreson = true
                // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                peaData.value.areaCfgData[activity_type].onlyPersonSensitivity = peaData.value.areaCfgData[activity_type].pea_onlyPreson
                    ? Number($(`//content/chl/${activity_type}/param/sensitivity`).text())
                    : 0
                peaData.value.areaCfgData[activity_type].hasObj = $(`//content/chl/${activity_type}/param/objectFilter`).text() == '' ? false : true
                if (peaData.value.areaCfgData[activity_type].hasObj) {
                    const car = $(`//content/chl/${activity_type}/param/objectFilter/car/switch`).text() == 'true'
                    const person = $(`//content/chl/${activity_type}/param/objectFilter/person/switch`).text() == 'true'
                    const motorcycle = $(`//content/chl/${activity_type}/param/objectFilter/motor/switch`).text() == 'true'
                    const personSensitivity = Number($(`//content/chl/${activity_type}/param/objectFilter/person/sensitivity`).text())
                    const carSensitivity = Number($(`//content/chl/${activity_type}/param/objectFilter/car/sensitivity`).text())
                    const motorSensitivity = Number($(`//content/chl/${activity_type}/param/objectFilter/motor/sensitivity`).text())
                    peaData.value.areaCfgData[activity_type].car = car
                    peaData.value.areaCfgData[activity_type].person = person
                    peaData.value.areaCfgData[activity_type].motorcycle = motorcycle
                    peaData.value.areaCfgData[activity_type].personSensitivity = personSensitivity
                    peaData.value.areaCfgData[activity_type].carSensitivity = carSensitivity
                    peaData.value.areaCfgData[activity_type].motorSensitivity = motorSensitivity
                }
                $(`//content/chl/${activity_type}/trigger`).forEach((item) => {
                    const $item = queryXml(item.element)
                    peaData.value.areaCfgData[activity_type].snapSwitch = $item('snapSwitch').text() == 'true'
                    peaData.value.areaCfgData[activity_type].msgPushSwitch = $item('msgPushSwitch').text() == 'true'
                    peaData.value.areaCfgData[activity_type].buzzerSwitch = $item('buzzerSwitch').text() == 'true'
                    peaData.value.areaCfgData[activity_type].popVideoSwitch = $item('popVideoSwitch').text() == 'true'
                    peaData.value.areaCfgData[activity_type].emailSwitch = $item('emailSwitch').text() == 'true'
                    peaData.value.areaCfgData[activity_type].sysAudio = $item('sysAudio').attr('id') ? $item('sysAudio').attr('id') : ''
                    peaData.value.areaCfgData[activity_type].recordSwitch = $item('sysRec/switch').text() == 'true'
                    if ($item('sysRec/chls/item').text() != '') {
                        peaData.value.areaCfgData[activity_type].recordChls = $item('sysRec/chls/item').map((item: any) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        })
                    } else {
                        peaData.value.areaCfgData[activity_type].recordChls = []
                    }
                    peaData.value.areaCfgData[activity_type].recordList = peaData.value.areaCfgData[activity_type].recordChls.map((item: { value: string; label: string }) => item.value)
                    peaData.value.areaCfgData[activity_type].alarmOutSwitch = $item('alarmOut/switch').text() == 'true'
                    if ($item('alarmOut/alarmOuts/item').text() != '') {
                        peaData.value.areaCfgData[activity_type].alarmOutChls = $item('alarmOut/alarmOuts/item').map((item: any) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        })
                    } else {
                        peaData.value.areaCfgData[activity_type].alarmOutChls = []
                    }
                    peaData.value.areaCfgData[activity_type].alarmOutList = peaData.value.areaCfgData[activity_type].alarmOutChls.map((item: { value: string; label: string }) => item.value)
                    peaData.value.areaCfgData[activity_type].presetSwitch = $item('preset/switch').text() == 'true'
                    if ($item('preset/presets/item').text() != '') {
                        peaData.value.areaCfgData[activity_type].presets = $item('preset/presets/item').map((item: any) => {
                            const $item = queryXml(item.element)
                            return {
                                index: $item('index').text(),
                                name: $item('name').text(),
                                chl: {
                                    value: $item('chl').attr('id'),
                                    label: $item('chl').text(),
                                },
                            }
                        })
                    } else {
                        peaData.value.areaCfgData[activity_type].presets = []
                    }
                })
                peaData.value.areaCfgData[activity_type].peaTriggerData = [
                    { value: peaData.value.areaCfgData[activity_type].snapSwitch, label: 'IDCS_SNAP', property: 'snapSwitch' },
                    { value: peaData.value.areaCfgData[activity_type].msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
                    { value: peaData.value.areaCfgData[activity_type].buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
                    { value: peaData.value.areaCfgData[activity_type].popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
                    { value: peaData.value.areaCfgData[activity_type].emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
                ]
                if (peaData.value.areaCfgData[activity_type].audioSuport && pageData.value.chlData['supportAudio']) {
                    peaData.value.areaCfgData[activity_type].peaTriggerData.push({
                        value: peaData.value.areaCfgData[activity_type].triggerAudio,
                        label: 'IDCS_AUDIO',
                        property: 'triggerAudio',
                    })
                }
                if (peaData.value.areaCfgData[activity_type].lightSuport && pageData.value.chlData['supportWhiteLight']) {
                    peaData.value.areaCfgData[activity_type].peaTriggerData.push({
                        value: peaData.value.areaCfgData[activity_type].triggerWhiteLight,
                        label: 'IDCS_LIGHT',
                        property: 'triggerWhiteLight',
                    })
                }
            }
        }
        // 保存越界检测数据
        const saveTripwireData = async () => {
            let sendXml = rawXml`<content>
                                        <chl id="${pageData.value.currChlId}" scheduleGuid="${tripwireData.value['tripwire_schedule']}">
                                    `
            if (pageData.value.chlData['supportTripwire'] || pageData.value.chlData['supportBackTripwire']) {
                sendXml += rawXml`
                                <param>
                                    <switch>${tripwireData.value['detectionEnable']}</switch>
                                    <alarmHoldTime unit="s">${tripwireData.value['holdTime']}</alarmHoldTime>`
                if (tripwireData.value['tripwire_onlyPreson']) {
                    sendXml += rawXml`<sensitivity>${tripwireData.value['onlyPersonSensitivity']}</sensitivity>`
                }
                if (tripwireData.value['hasObj']) {
                    sendXml += rawXml`
                                    <objectFilter>
                                        <car>
                                            <switch>${tripwireData.value['objectFilter'].car}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter'].carSensitivity}</sensitivity>
                                        </car>
                                        <person>
                                            <switch>${tripwireData.value['objectFilter'].person}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter'].personSensitivity}</sensitivity>
                                        </person>`
                    if (pageData.value.chlData['accessType'] == '0') {
                        sendXml += rawXml`
                                        <motor>
                                            <switch>${tripwireData.value['objectFilter']['motorcycle']}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter']['motorSensitivity']}</sensitivity>
                                        </motor>
                                            `
                    }
                    sendXml += rawXml`</objectFilter>`
                }
                if (tripwireData.value['hasAutoTrack']) {
                    sendXml += rawXml`
                                    <autoTrack>${tripwireData.value['autoTrack']}</autoTrack>
                    `
                }
                sendXml += rawXml`
                                <line type="list" count="${tripwireData.value['lineInfo'].length}">
                                    <itemType>
                                        <direction type="direction"/>
                                    </itemType>
                            `
                tripwireData.value['lineInfo'].forEach((element: { direction: string; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }) => {
                    sendXml += rawXml`
                                    <item>
                                        <direction type="direction">${element['direction']}</direction>
                                        <startPoint>
                                            <X>${element['startPoint']['X'].toString()}</X>
                                            <Y>${element['startPoint']['Y'].toString()}</Y>
                                        </startPoint>
                                        <endPoint>
                                            <X>${element['endPoint']['X'].toString()}</X>
                                            <Y>${element['endPoint']['Y'].toString()}</Y>
                                        </endPoint>
                                    </item>
                                `
                })
                sendXml += rawXml`</line>`
                if (tripwireData.value.audioSuport && pageData.value.chlData['supportAudio']) {
                    sendXml += rawXml`<triggerAudio>${tripwireData.value['triggerAudio']}</triggerAudio>`
                }
                if (tripwireData.value.lightSuport && pageData.value.chlData['supportWhiteLight']) {
                    sendXml += rawXml`<triggerWhiteLight>${tripwireData.value['triggerWhiteLight']}</triggerWhiteLight>`
                }
                if (tripwireData.value['pictureAvailable']) {
                    sendXml += rawXml`
                        <saveSourcePicture>${tripwireData.value['saveSourcePicture']}</saveSourcePicture>
                        <saveTargetPicture>${tripwireData.value['saveTargetPicture']}</saveTargetPicture>
                    `
                }
                sendXml += rawXml`</param>`
            }
            sendXml += rawXml`
                            <trigger>
                                <sysRec>
                                    <chls type="list">
                                        ${tripwireData.value['record'].chls
                                            .map(
                                                (element: { value: string; label: string }) => `
                                            <item id="${element['value']}">
                                                <![CDATA[${element['label']}]]>
                                            </item>
                                        `,
                                            )
                                            .join('')}
                                    </chls>
                                </sysRec>
                                <alarmOut>
                                    <alarmOuts type="list">
                                        ${tripwireData.value['alarmOut'].chls
                                            .map(
                                                (element: { value: string; label: string }) => `
                                            <item id="${element['value']}">
                                                <![CDATA[${element['label']}]]>
                                            </item>
                                        `,
                                            )
                                            .join('')}
                                    </alarmOuts>
                                </alarmOut>
                                <preset>
                                    <presets type="list">
                                        ${tripwireData.value['presetSource']
                                            .map((element: PresetList) =>
                                                element['preset']['value']
                                                    ? `
                                            <item>
                                                <index>${element['preset']['value']}</index>
                                                <name><![CDATA[${element['preset']['label']}]]></name>
                                                <chl id="${element['id']}">
                                                    <![CDATA[${element['name']}]]>
                                                </chl>
                                            </item>
                                        `
                                                    : '',
                                            )
                                            .join('')}
                                    </presets>
                                </preset>
                                <snapSwitch>${tripwireData.value['snapSwitch']}</snapSwitch>
                                <msgPushSwitch>${tripwireData.value['msgPushSwitch']}</msgPushSwitch>
                                <buzzerSwitch>${tripwireData.value['buzzerSwitch']}</buzzerSwitch>
                                <popVideoSwitch>${tripwireData.value['popVideoSwitch']}</popVideoSwitch>
                                <emailSwitch>${tripwireData.value['emailSwitch']}</emailSwitch>
                                <sysAudio id='${tripwireData.value['sysAudio']}'></sysAudio>
                            </trigger>
                            </chl>
                        </content>`
            openLoading(LoadingTarget.FullScreen)
            const $ = await editTripwire(sendXml)
            const res = queryXml($)
            closeLoading(LoadingTarget.FullScreen)
            if (res('status').text() == 'success') {
                if (tripwireData.value.detectionEnable) {
                    tripwireData.value.originalEnable = true
                }
                pageData.value.applyDisable = true
                tripwireRefreshInitPage()
            }
        }
        // 执行保存tripwire数据
        const handleTripwireApply = function () {
            if (!pageData.value.chlData['supportTripwire'] && !pageData.value.chlData['supportBackTripwire'] && pageData.value.chlData['supportPeaTrigger']) {
                saveTripwireData()
            } else {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []
                if (tripwireData['enabledSwitch'] && tripwireData['enabledSwitch'] != tripwireData['originalSwitch']) {
                    isSwitchChange = true
                }
                const mutexChlNameObj = getMutexChlNameObj()
                tripwireData.value['mutexList'].forEach((ele: { object: string; status: boolean }) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })
                tripwireData.value['mutexListEx'].forEach((ele: { object: string; status: boolean }) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })
                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageTipBox({
                        type: 'question',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_SIMPLE_TRIPWIRE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + pageData.value.chlData['name'], switchChangeType),
                    }).then(() => {
                        saveTripwireData()
                    })
                } else {
                    saveTripwireData()
                }
            }
        }
        // 保存区域入侵检测数据
        const savePeaData = async () => {
            let sendXml = rawXml`<content>
                                        <chl id="${pageData.value.currChlId}" scheduleGuid="${peaData.value['pea_schedule']}">
                                    `
            peaData.value.supportList.forEach((type: string) => {
                if (type != peaData.value.activity_type) {
                    peaData.value.areaCfgData[type]['detectionEnable'] = false
                }
                sendXml += rawXml`
                            <${type}>
                                <param>
                                    <switch>${peaData.value.areaCfgData[type]['detectionEnable'].toString()}</switch>
                                    <alarmHoldTime unit="s">${peaData.value.areaCfgData[type]['holdTime'].toString()}</alarmHoldTime>
                                    <boundary type="list" count="${peaData.value.areaCfgData[type]['boundaryInfo'].length.toString()}">
                                        <itemType>
                                            <point type="list"/>
                                        </itemType>
                        `
                peaData.value.areaCfgData[type]['boundaryInfo'].forEach((element: { point: { X: number; Y: number; isClosed?: boolean }[]; maxCount: number }) => {
                    sendXml += rawXml`<item>
                                        <point type="list" maxCount="${element.maxCount.toString()}" count="${element.point.length.toString()}">`
                    element.point.forEach((point: { X: number; Y: number; isClosed?: boolean }) => {
                        sendXml += rawXml`
                                            <item>
                                                <X>${Math.round(point.X).toString()}</X>
                                                <Y>${Math.round(point.Y).toString()}</Y>
                                            </item>s
                                        `
                    })
                    sendXml += rawXml`</point>
                                    </item>`
                })
                sendXml += rawXml`</boundary>`
                if (peaData.value.areaCfgData[type]['audioSuport'] && pageData.value.chlData['supportAudio']) {
                    sendXml += rawXml`<triggerAudio>${peaData.value.areaCfgData[type]['triggerAudio'].toString()}</triggerAudio>`
                }
                if (peaData.value.areaCfgData[type]['lightSuport'] && pageData.value.chlData['supportWhiteLight']) {
                    sendXml += rawXml`<triggerWhiteLight>${peaData.value.areaCfgData[type]['triggerWhiteLight'].toString()}</triggerWhiteLight>`
                }
                if (peaData.value.areaCfgData[type]['pictureAvailable']) {
                    sendXml += rawXml`
                        <saveSourcePicture>${peaData.value.areaCfgData[type]['saveSourcePicture'].toString()}</saveSourcePicture>
                        <saveTargetPicture>${peaData.value.areaCfgData[type]['saveTargetPicture'].toString()}</saveTargetPicture>
                    `
                }
                if (peaData.value.areaCfgData[type].hasAutoTrack) {
                    sendXml += rawXml`<autoTrack>${peaData.value.areaCfgData[type]['autoTrack'].toString()}</autoTrack>`
                }
                if (peaData.value.areaCfgData[type].pea_onlyPreson) {
                    sendXml += rawXml`<sensitivity>${peaData.value.areaCfgData[type]['onlyPersonSensitivity'].toString()}</sensitivity>`
                }
                if (peaData.value.areaCfgData[type].hasObj) {
                    sendXml += rawXml`
                                        <objectFilter>
                                            <car>
                                                <switch>${peaData.value.areaCfgData[type]['car'].toString()}</switch>
                                                <sensitivity>${peaData.value.areaCfgData[type]['carSensitivity'].toString()}</sensitivity>
                                            </car>
                                            <person>
                                                <switch>${peaData.value.areaCfgData[type]['person'].toString()}</switch>
                                                <sensitivity>${peaData.value.areaCfgData[type]['personSensitivity'].toString()}</sensitivity>
                                            </person>
                                            ${
                                                pageData.value.chlData['accessType'] == '0'
                                                    ? `
                                            <motor>
                                                <switch>${peaData.value.areaCfgData[type]['motorcycle'].toString()}</switch>
                                                <sensitivity>${peaData.value.areaCfgData[type]['motorSensitivity'].toString()}</sensitivity>
                                            </motor>
                                            `
                                                    : ''
                                            }
                                        </objectFilter>
                                    `
                }
                sendXml += rawXml`</param>
                            <trigger>
                                <sysRec>
                                    <chls type="list">`
                sendXml += peaData.value.areaCfgData[type]['recordChls']
                    .map(
                        (element: { value: string; label: string }) => rawXml`
                                            <item id="${element['value']}">
                                                <![CDATA[${element['label']}]]>
                                            </item>
                                        `,
                    )
                    .join('')
                sendXml += rawXml`</chls>
                                </sysRec>
                                <alarmOut>
                                    <alarmOuts type="list">`
                sendXml += peaData.value.areaCfgData[type]['alarmOutChls']
                    .map(
                        (element: { value: string; label: string }) => rawXml`
                                            <item id="${element['value']}">
                                                <![CDATA[${element['label']}]]>
                                            </item>
                                        `,
                    )
                    .join('')
                sendXml += rawXml`</alarmOuts>
                                </alarmOut>
                                <preset>
                                    <presets type="list">`
                peaData.value.areaCfgData[type]['presetSource'].forEach((element: PresetList) => {
                    if (element['preset']['value']) {
                        sendXml += rawXml`
                                            <item>
                                                <index>${element['preset']['value']}</index>
                                                <name><![CDATA[${element['preset']['label']}]]></name>
                                                <chl id="${element['id']}">
                                                    <![CDATA[${element['name']}]]>
                                                </chl>
                                            </item>
                                        `
                    }
                })
                sendXml += rawXml`</presets>
                                </preset>
                                <snapSwitch>${peaData.value.areaCfgData[type]['snapSwitch'].toString()}</snapSwitch>
                                <msgPushSwitch>${peaData.value.areaCfgData[type]['msgPushSwitch'].toString()}</msgPushSwitch>
                                <buzzerSwitch>${peaData.value.areaCfgData[type]['buzzerSwitch'].toString()}</buzzerSwitch>
                                <popVideoSwitch>${peaData.value.areaCfgData[type]['popVideoSwitch'].toString()}</popVideoSwitch>
                                <emailSwitch>${peaData.value.areaCfgData[type]['emailSwitch'].toString()}</emailSwitch>
                                <sysAudio id='${peaData.value.areaCfgData[type]['sysAudio']}'></sysAudio>
                            </trigger>
                        </${type}>
                    `
            })
            sendXml += rawXml`
                            </chl>
                        </content>`
            openLoading(LoadingTarget.FullScreen)
            const $ = await editIntelAreaConfig(sendXml)
            const res = queryXml($)
            closeLoading(LoadingTarget.FullScreen)
            if (res('status').text() == 'success') {
                pageData.value.applyDisable = true
                if (peaData.value.areaCfgData[peaData.value.activity_type].detectionEnable) {
                    peaData.value.areaCfgData['perimeter'].originalEnable = true
                    peaData.value.areaCfgData['entry'].originalEnable = true
                    peaData.value.areaCfgData['leave'].originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面） TODO
                // setPeaOcxData()
                peaRefreshInitPage()
            } else {
                const errorCode = res('errorCode').text()
                if (errorCode == '536871053') {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                }
            }
        }
        // 执行保存pea数据
        const handlePeaApply = async () => {
            if (!verification()) return
            let isSwitchChange = false
            const switchChangeTypeArr: string[] = []
            const data = peaData.value.areaCfgData[peaData.value.activity_type]
            if (data.detectionEnable && data.detectionEnable != data.originalEnable) {
                isSwitchChange = true
            }
            const mutexChlNameObj = getMutexChlNameObj()
            data.mutexList.forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                    const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            data.mutexListEx.forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                    const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SIMPLE_INVADE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + pageData.value.chlData['name'], switchChangeType),
                }).then(async () => {
                    await savePeaData()
                })
            } else {
                await savePeaData()
            }
        }
        // 获取recordList TODO添加pea部分
        const getRecordList = async () => {
            pageData.value.recordSource = []
            const resb = await getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item: any) => {
                    const $item = queryXml(item.element)
                    pageData.value.recordSource.push({
                        value: item.attr('id'),
                        label: $item('name').text(),
                    })
                })
            }
        }
        // 获取alarmOutList
        const getAlarmOutList = async () => {
            pageData.value.alarmOutSource = []
            const resb = await getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item: any) => {
                    const $item = queryXml(item.element)
                    let name = $item('name').text()
                    if ($item('devDesc').text()) {
                        name = $item('devDesc').text() + '-' + name
                    }
                    pageData.value.alarmOutSource.push({
                        value: item.attr('id'),
                        label: name,
                        device: {
                            value: $item('device').attr('id'),
                            label: $item('device').text(),
                        },
                    })
                })
            }
        }
        // 获取preset
        const getPresetList = async (func: string) => {
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <chlType/>
                </requireField>
                <condition>
                    <supportPtz/>
                </condition>
            `
            const result = await queryNodeList(getXmlWrapData(sendXml))

            let rowData = [] as PresetList[]
            commLoadResponseHandler(result, async ($) => {
                rowData = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                        chlType: $item('chlType').text(),
                        preset: { value: '', label: Translate('IDCS_NULL') },
                        presetList: [{ value: '', label: Translate('IDCS_NULL') }],
                    }
                })
                if (func == 'tripwire') {
                    rowData.forEach((row) => {
                        tripwireData.value.preset.presets.forEach((item: PresetItem) => {
                            if (row.id == item.chl.value) {
                                row.preset = { value: item.index, label: item.name }
                            }
                        })
                    })

                    for (let i = rowData.length - 1; i >= 0; i--) {
                        //预置点里过滤掉recorder通道
                        if (rowData[i].chlType == 'recorder') {
                            rowData.splice(i, 1)
                        } else {
                            await getPresetById(rowData[i])
                            rowData[i].presetList.push({ value: '', label: Translate('IDCS_NULL') })
                        }
                    }

                    tripwireData.value.presetSource = rowData
                } else if (func == 'pea') {
                    peaData.value.supportList.forEach(async (type: string) => {
                        const rows = cloneDeep(rowData)
                        rows.forEach((row) => {
                            peaData.value.areaCfgData[type].presets.forEach((item: PresetItem) => {
                                if (row.id == item.chl.value) {
                                    row.preset = { value: item.index, label: item.name }
                                }
                            })
                        })

                        for (let i = rows.length - 1; i >= 0; i--) {
                            //预置点里过滤掉recorder通道
                            if (rows[i].chlType == 'recorder') {
                                rows.splice(i, 1)
                            } else {
                                await getPresetById(rows[i])
                                rows[i].presetList.push({ value: '', label: Translate('IDCS_NULL') })
                            }
                        }
                        peaData.value.areaCfgData[type].presetSource = rows
                    })
                }
            })
        }
        // 获取预置点
        const getPresetById = async (row: PresetList) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.id}</chlId>
                </condition>
            `
            row.presetList = []
            const result = await queryChlPresetList(sendXml)
            commLoadResponseHandler(result, ($) => {
                $('/response/content/presets/item').forEach((item) => {
                    row.presetList.push({
                        value: item.attr('index')!,
                        label: item.text(),
                    })
                })
            })
        }

        // 获取mutexobj
        const getMutexChlNameObj = function () {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = pageData.value.chlData['ip']
            pageData.value.onlineChannelList.forEach((chl) => {
                if (chl['ip'] == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl['accessType'] == '1') {
                        thermalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
                    } else {
                        normalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
                    }
                })
            }
            return {
                normalChlName: normalChlName,
                thermalChlName: thermalChlName,
            }
        }
        // 翻译key值拼接添加空格（排除简体中文、繁体中文）
        const joinSpaceForLang = function (str: string) {
            if (!str) return ''
            const langTypeList = ['zh-cn', 'zh-tw']
            const currLangType = useLangStore().getLangType || 'en-us'
            const isInclude = !langTypeList.includes(currLangType)
            str = isInclude ? str : str + ' '
            return str
        }
        // 获取区域
        const getRegion = function (index: number, element: any, region: { X1: number; Y1: number; X2: number; Y2: number }) {
            const $ = queryXml(element.element)
            if (index == 0) {
                region.X1 = Number($('X').text())
                region.Y1 = Number($('Y').text())
            }
            if (index == 1) {
                region.X2 = Number($('X').text())
            }
            if (index == 2) {
                region.Y2 = Number($('Y').text())
            }
        }
        // 获取矩形区域点列表
        const getRegionPoints = function (points: { X1: number; Y1: number; X2: number; Y2: number }) {
            const pointList = []
            pointList.push({ X: points.X1, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y2, isClosed: true })
            pointList.push({ X: points.X1, Y: points.Y2, isClosed: true })
            return pointList
        }
        // pea检验区域合法性
        const verification = function () {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            if (!peaData.value.currentRegulation) {
                const allRegionList: { X: number; Y: number; isClosed?: boolean }[][] = []
                const type = peaData.value.activity_type
                const boundaryInfoList = peaData.value.areaCfgData[type].boundaryInfo
                boundaryInfoList.forEach((ele) => {
                    allRegionList.push(ele.point)
                })
                for (const i in allRegionList) {
                    const count = allRegionList[i].length
                    if (count > 0 && count < 4) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                        })
                        return false
                    } else if (count > 0 && !peaDrawer.judgeAreaCanBeClosed(allRegionList[i])) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_INTERSECT'),
                        })
                        return false
                    }
                }
            }
            return true
        }

        // 切换通道操作
        const handleChangeChannel = async () => {
            pageData.value.chlData = pageData.value.chlCaps[pageData.value.currChlId]
            await initPageData()
            peaPlay()
            tripwirePlay()
        }
        // 大tab点击事件,切换功能 tripwire/pea
        const handleTabClick = (pane: TabsPaneContext) => {
            pageData.value.chosenFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            initPageData()
            // if (pageData.value.chosenFunction == 'pea') {
            //     peaPlay()
            //     setPeaOcxData()
            //     // setTripwireOcxData()
            // }
            // if (pageData.value.chosenFunction == 'tripwire') {
            //     tripwirePlay()
            //     setPeaOcxData()
            // }
        }
        // tripwire tab点击事件
        const handleTripwireFunctionTabClick = async (pane: TabsPaneContext) => {
            tripwireData.value.tripwireFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (tripwireData.value.tripwireFunction == 'tripwire_param') {
                if (tripwiremode.value === 'h5') {
                    setTripwireOcxData()
                    tripwireDrawer.setEnable('line', true)
                } else {
                    const surface = tripwireData.value.chosenSurfaceIndex
                    const sendXML1 = OCX_XML_SetTripwireLine(tripwireData['lineInfo'][surface])
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }
                if (tripwireData.value.isShowAllArea) {
                    showAllTripwireArea(true)
                }
            } else if (tripwireData.value.tripwireFunction == 'tripwire_target') {
                showAllTripwireArea(false)
                if (tripwiremode.value === 'h5') {
                    tripwireDrawer.clear()
                    tripwireDrawer.setEnable('line', false)
                } else {
                    const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }
            }
        }
        // pea tab点击事件
        const handlePeaFunctionTabClick = async (pane: TabsPaneContext) => {
            peaData.value.peaFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (peaData.value.peaFunction == 'pea_param') {
                const type = peaData.value.activity_type
                const area = peaData.value.chosenWarnAreaIndex
                const boundaryInfo = peaData.value.areaCfgData[type]['boundaryInfo']
                if (peamode.value === 'h5') {
                    setPeaOcxData()
                    peaDrawer.setEnable(true)
                } else {
                    setTimeout(function () {
                        const sendXML1 = OCX_XML_SetPeaArea(boundaryInfo[area]['point'], peaData.value.currentRegulation)
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                    }, 100)
                }
                if (peaData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
            } else if (peaData.value.peaFunction == 'pea_target') {
                showAllPeaArea(false)
                if (peamode.value === 'h5') {
                    peaDrawer.clear()
                    peaDrawer.setEnable(false)
                } else {
                    setTimeout(function () {
                        const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                    }, 100)
                }
            }
        }
        // 切换通道及初始化时判断tab是否可用，若不可用则切换到可用的tab，都不可用再显示提示
        const isTabDisabled = () => {
            pageData.value.tripwireDisable = pageData.value.chlData['supportTripwire'] || pageData.value.chlData['supportBackTripwire'] || pageData.value.chlData['supportPeaTrigger'] ? false : true
            pageData.value.peaDisable = pageData.value.chlData['supportPea'] || pageData.value.chlData['supportBackPea'] || pageData.value.chlData['supportPeaTrigger'] ? false : true
            if (pageData.value.tripwireDisable == true && pageData.value.peaDisable == false) {
                pageData.value.chosenFunction = 'pea'
            } else if (pageData.value.tripwireDisable == false && pageData.value.peaDisable == true) {
                pageData.value.chosenFunction = 'tripwire'
            } else if (pageData.value.tripwireDisable == true && pageData.value.peaDisable == true) {
                pageData.value.notSupportTipShow = true
                pageData.value.chosenFunction = ''
            }
        }
        // tripwire刷新页面数据
        const tripwireRefreshInitPage = () => {
            // 区域状态
            const lineInfoList: { direction: string; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[] = tripwireData.value['lineInfo']
            lineInfoList.forEach((lineInfo, surface) => {
                if (lineInfo && lineInfo['startPoint'].X == 0 && lineInfo['startPoint'].Y == 0 && lineInfo['endPoint'].X == 0 && lineInfo['endPoint'].Y == 0) {
                    tripwireData.value['lineInfo'][surface].configured = false
                } else {
                    tripwireData.value['lineInfo'][surface].configured = true
                }
            })
            if (tripwireData.value['lineInfo'].length > 1) {
                tripwireData.value['showAllAreaVisible'] = true
                tripwireData.value['clearAllVisible'] = true
            } else {
                tripwireData.value['showAllAreaVisible'] = false
                tripwireData.value['clearAllVisible'] = false
            }
        }
        // pea刷新页面数据
        const peaRefreshInitPage = () => {
            const type = peaData.value.activity_type
            if (peaData.value.currentRegulation) {
                // 画矩形
                const regionInfoList = peaData.value.areaCfgData[type].regionInfo
                regionInfoList.forEach((ele, idx) => {
                    if (ele.X1 != 0 || ele.Y1 != 0 || ele.X2 != 0 || ele.Y2 != 0) {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = true
                    } else {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = false
                    }
                })
                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (regionInfoList && regionInfoList.length > 1) {
                    peaData.value.showAllAreaVisible = true
                    peaData.value.clearAllVisible = true
                } else {
                    peaData.value.showAllAreaVisible = false
                    peaData.value.clearAllVisible = false
                }
            } else {
                // 画点
                const boundaryInfoList = peaData.value.areaCfgData[type].boundaryInfo
                boundaryInfoList.forEach((ele, idx) => {
                    if (ele.point && ele.point.length > 0) {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = true
                    } else {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = false
                    }
                })
                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (boundaryInfoList && boundaryInfoList.length > 1) {
                    peaData.value.showAllAreaVisible = true
                    peaData.value.clearAllVisible = true
                } else {
                    peaData.value.showAllAreaVisible = false
                    peaData.value.clearAllVisible = false
                }
            }
        }
        // 初始化页面数据
        const initPageData = async () => {
            isTabDisabled()
            // setTripwireOcxData()
            // setPeaOcxData()
            if (pageData.value.chosenFunction === 'tripwire') {
                tripwireData.value.initComplete = false
                if (
                    pageData.value.chlData['supportTripwire'] ||
                    pageData.value.chlData['supportAOIEntry'] ||
                    pageData.value.chlData['supportAOILeave'] ||
                    pageData.value.chlData['supportBackTripwire'] ||
                    pageData.value.chlData['supportBackAOIEntry'] ||
                    pageData.value.chlData['supportBackAOILeave']
                ) {
                    tripwireData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(pageData.value.chlData['supportTripwire'] ? 'IPC' : 'NVR')
                    await getTripwireData()
                    // 是否显示控制全部区域按钮
                    tripwireRefreshInitPage()
                    tripwireData.value.initComplete = true
                    if (pageData.value.chlData.supportAutoTrack) {
                        getPTZLockStatus()
                    }
                    setTripwireOcxData()
                } else {
                    pageData.value.notSupportTipShow = true
                }
            } else if (pageData.value.chosenFunction === 'pea') {
                peaData.value.initComplete = false
                peaData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(pageData.value.chlData['supportTripwire'] ? 'IPC' : 'NVR')
                await getPeaData()
                peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activity_type].regulation
                peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                peaRefreshInitPage()
                peaData.value.initComplete = true
                if (pageData.value.chlData.supportAutoTrack) {
                    getPTZLockStatus()
                }
                if (peamode.value === 'h5') {
                    peaDrawer.setEnable(true)
                } else {
                    const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                setPeaOcxData()
            }
        }

        // 变更detectionEnable操作
        const handleDectionChange = async () => {
            pageData.value.applyDisable = false
            if (!pageData.value.chlData['supportTripwire']) {
                await getAIResourceData(true)
            }
        }
        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList: { value: number; label: string }[] = []
            holdTimeList.forEach((ele) => {
                const element = Number(ele)
                const itemText = element == 60 ? '1 ' + Translate('IDCS_MINUTE') : element > 60 ? element / 60 + ' ' + Translate('IDCS_MINUTES') : element + ' ' + Translate('IDCS_SECONDS')
                timeList.push({ value: element, label: itemText })
            })
            return timeList
        }
        // tripwire执行是否显示全部区域
        const handleTripwireShowAllAreaChange = () => {
            tripwireDrawer.setEnableShowAll(tripwireData.value.isShowAllArea)
            showAllTripwireArea(tripwireData.value.isShowAllArea)
        }
        // pea执行是否显示全部区域
        const handlePeaShowAllAreaChange = () => {
            peaDrawer.setEnableShowAll(peaData.value.isShowAllArea)
            showAllPeaArea(peaData.value.isShowAllArea)
        }
        // tripWire选择警戒面
        const handleSurfaceChange = (index: number) => {
            tripwireData.value.chosenSurfaceIndex = index
            tripwireData.value.direction = tripwireData.value.lineInfo[index].direction
            setTripwireOcxData()
        }
        // tripwire选择方向
        const handleTripwireDirectionChange = () => {
            tripwireData.value.lineInfo[tripwireData.value.chosenSurfaceIndex].direction = tripwireData.value.direction
            setTripwireOcxData()
        }
        // pea切换区域活动操作
        const handleAreaActiveChange = async () => {
            if (peaData.value.areaActive == 'perimeter') {
                peaData.value.activity_type = 'perimeter'
                peaData.value.directionDisable = true
            } else {
                peaData.value.activity_type = peaData.value.directionList[0].value
                peaData.value.direction = peaData.value.directionList[0].value
                peaData.value.directionDisable = false
            }
            // 初始化区域活动的数据
            peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activity_type].regulation
            peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            peaRefreshInitPage()
            setPeaOcxData()
        }
        // pea切换方向操作
        const handlePeaDirectionChange = async () => {
            peaData.value.activity_type = peaData.value.direction
            // 初始化区域活动的数据
            peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activity_type].regulation
            peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            peaRefreshInitPage()
            setPeaOcxData()
        }
        // pea选择警戒区域
        const handleWarnAreaChange = (index: number) => {
            peaData.value.chosenWarnAreaIndex = index
            setPeaOcxData()
        }
        // 通用获取云台锁定状态
        const getPTZLockStatus = async () => {
            const sendXML = rawXml`<condition>
                                    <chlId>${pageData.value.currChlId}</chlId>
                                </condition>`
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                tripwireData.value.lockStatus = $('//content/chl/param/PTZLock').text() == 'true'
                peaData.value.lockStatus = $('//content/chl/param/PTZLock').text() == 'true'
            }
        }
        // 通用修改云台锁定状态
        const editLockStatus = () => {
            const sendXML = rawXml`<content>
                                        <chl id='${pageData.value.currChlId}'>
                                            <param>
                                                <PTZLock>${pageData.value.chosenFunction == 'tripwire' ? (!tripwireData.value.lockStatus).toString() : (!peaData.value.lockStatus).toString()}</PTZLock>
                                            </param>
                                        </chl>
                                    </content>`
            openLoading(LoadingTarget.FullScreen)
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    closeLoading(LoadingTarget.FullScreen)
                    tripwireData.value.lockStatus = !tripwireData.value.lockStatus
                    peaData.value.lockStatus = !peaData.value.lockStatus
                }
            })
            pageData.value.applyDisable = false
        }

        // tripwire常规联动全选/全不选
        const handleTripwireTriggerSwitch = () => {
            pageData.value.applyDisable = false
            if (tripwireData.value.triggerSwitch) {
                tripwireTriggerData.value.forEach((item) => {
                    item.value = true
                    const property = item.property
                    if (property in tripwireData.value) {
                        tripwireData.value[property] = true
                    }
                })
            } else {
                tripwireTriggerData.value.forEach((item) => {
                    item.value = false
                    const property = item.property
                    if (property in tripwireData.value) {
                        tripwireData.value[property] = false
                    }
                })
            }
        }
        // pea常规联动全选/全不选
        const handlePeaTriggerSwitch = () => {
            pageData.value.applyDisable = false
            if (peaData.value.areaCfgData[peaData.value.activity_type].triggerSwitch) {
                peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.forEach((item) => {
                    item.value = true
                    const property = item.property
                    if (property in peaPageData) {
                        peaData.value.areaCfgData[peaData.value.activity_type][property] = true
                    }
                })
            } else {
                peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.forEach((item) => {
                    item.value = false
                    const property = item.property
                    if (property in peaPageData) {
                        peaData.value.areaCfgData[peaData.value.activity_type][property] = false
                    }
                })
            }
        }
        // tripwire单个联动选择
        const handleTripwireTrigger = (item: { value: boolean; label: string; property: string }) => {
            pageData.value.applyDisable = false
            const property = item.property
            if (property in tripwireData.value) {
                tripwireData.value[property] = item.value
            }
            const triggerSwitch = tripwireTriggerData.value.every((item) => item.value)
            tripwireData.value.triggerSwitch = triggerSwitch
        }
        // pea单个联动选择
        const handlePeaTrigger = (item: { value: boolean; label: string; property: string }) => {
            pageData.value.applyDisable = false
            const property = item.property
            peaData.value.areaCfgData[peaData.value.activity_type][property] = item.value
            const triggerSwitch = peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.every((item) => item.value)
            peaData.value.areaCfgData[peaData.value.activity_type].triggerSwitch = triggerSwitch
        }
        // 设置record
        const recordConfirm = (e: { value: string; label: string }[]) => {
            pageData.value.applyDisable = false
            if (pageData.value.chosenFunction == 'tripwire') {
                if (e.length !== 0) {
                    tripwireData.value.record.chls = cloneDeep(e)
                    const chls = tripwireData.value.record.chls
                    tripwireData.value.recordList = chls.map((item: { value: string; label: string }) => item.value)
                } else {
                    tripwireData.value.record.chls = []
                    tripwireData.value.recordList = []
                    tripwireData.value.record.switch = false
                }
                tripwireData.value.recordIsShow = false
            } else {
                if (e.length !== 0) {
                    peaData.value.areaCfgData[peaData.value.activity_type].recordChls = cloneDeep(e)
                    const chls = peaData.value.areaCfgData[peaData.value.activity_type].recordChls
                    peaData.value.areaCfgData[peaData.value.activity_type].recordList = chls.map((item: { value: string; label: string }) => item.value)
                } else {
                    peaData.value.areaCfgData[peaData.value.activity_type].recordChls = []
                    peaData.value.areaCfgData[peaData.value.activity_type].recordList = []
                    peaData.value.areaCfgData[peaData.value.activity_type].recordSwitch = false
                }
                peaData.value.areaCfgData[peaData.value.activity_type].recordIsShow = false
            }
        }
        // record弹窗关闭
        const recordClose = () => {
            if (pageData.value.chosenFunction == 'tripwire') {
                if (!tripwireData.value.record.chls.length) {
                    tripwireData.value.record.chls = []
                    tripwireData.value.recordList = []
                    tripwireData.value.record.switch = false
                }
                tripwireData.value.recordIsShow = false
            } else {
                if (!peaData.value.areaCfgData[peaData.value.activity_type].recordChls.length) {
                    peaData.value.areaCfgData[peaData.value.activity_type].recordChls = []
                    peaData.value.areaCfgData[peaData.value.activity_type].recordList = []
                    peaData.value.areaCfgData[peaData.value.activity_type].recordSwitch = false
                }
                peaData.value.areaCfgData[peaData.value.activity_type].recordIsShow = false
            }
        }
        // 设置alarmOut
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            pageData.value.applyDisable = false
            if (pageData.value.chosenFunction == 'tripwire') {
                if (e.length !== 0) {
                    tripwireData.value.alarmOut.chls = cloneDeep(e)
                    const chls = tripwireData.value.alarmOut.chls
                    tripwireData.value.alarmOutList = chls.map((item: { value: string; label: string }) => item.value)
                } else {
                    tripwireData.value.alarmOut.chls = []
                    tripwireData.value.alarmOutList = []
                    tripwireData.value.alarmOut.switch = false
                }
                tripwireData.value.alarmOutIsShow = false
            } else {
                if (e.length !== 0) {
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls = cloneDeep(e)
                    const chls = peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutList = chls.map((item: { value: string; label: string }) => item.value)
                } else {
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls = []
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutList = []
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutSwitch = false
                }
                peaData.value.areaCfgData[peaData.value.activity_type].alarmOutIsShow = false
            }
        }
        // alarmOut弹窗关闭
        const alarmOutClose = () => {
            if (pageData.value.chosenFunction == 'tripwire') {
                if (!tripwireData.value.alarmOut.chls.length) {
                    tripwireData.value.alarmOut.chls = []
                    tripwireData.value.alarmOutList = []
                    tripwireData.value.alarmOut.switch = false
                }
                tripwireData.value.alarmOutIsShow = false
            } else {
                if (!peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls.length) {
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls = []
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutList = []
                    peaData.value.areaCfgData[peaData.value.activity_type].alarmOutSwitch = false
                }
                peaData.value.areaCfgData[peaData.value.activity_type].alarmOutIsShow = false
            }
        }

        // 下列为绘图相关方法

        // tripwire
        // tripwire绘图
        const tripwireChange = function (passline: { startX: number; startY: number; endX: number; endY: number }) {
            const surface = tripwireData.value.chosenSurfaceIndex
            tripwireData.value['lineInfo'][surface]['startPoint'] = {
                X: passline.startX,
                Y: passline.startY,
            }
            tripwireData.value['lineInfo'][surface]['endPoint'] = {
                X: passline.endX,
                Y: passline.endY,
            }
            if (tripwireData.value.isShowAllArea) {
                showAllTripwireArea(true)
            }
            tripwireRefreshInitPage()
            pageData.value.applyDisable = false
        }
        // tripwire是否显示所有区域
        const showAllTripwireArea = function (isShowAll: boolean) {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(isShowAll)
            if (isShowAll) {
                const lineInfoList = tripwireData.value.lineInfo
                const currentSurface = tripwireData.value.chosenSurfaceIndex
                if (tripwiremode.value === 'h5') {
                    tripwireDrawer.setCurrentSurfaceOrAlarmLine(currentSurface)
                    tripwireDrawer.drawAllPassline(lineInfoList, currentSurface)
                } else {
                    const pluginLineInfoList = JSON.parse(JSON.stringify(lineInfoList))
                    pluginLineInfoList.splice(currentSurface, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: pluginLineInfoList }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, true)
                    if (sendXML) {
                        tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (tripwiremode.value !== 'h5') {
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                    if (sendXML) {
                        tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
                setTripwireOcxData()
            }
        }
        // tripwire显示
        const setTripwireOcxData = function () {
            if (tripwireData.value.tripwireFunction == 'tripwire_param') {
                const surface = tripwireData.value.chosenSurfaceIndex
                if (tripwireData.value.lineInfo.length > 0) {
                    if (tripwiremode.value === 'h5') {
                        tripwireDrawer.setCurrentSurfaceOrAlarmLine(surface)
                        tripwireDrawer.setDirection(tripwireData.value.lineInfo[surface]['direction'])
                        tripwireDrawer.setPassline({
                            startX: tripwireData.value.lineInfo[surface]['startPoint'].X,
                            startY: tripwireData.value.lineInfo[surface]['startPoint'].Y,
                            endX: tripwireData.value.lineInfo[surface]['endPoint'].X,
                            endY: tripwireData.value.lineInfo[surface]['endPoint'].Y,
                        })
                    } else {
                        const sendXML = OCX_XML_SetTripwireLine(tripwireData.value.lineInfo[surface])
                        if (sendXML) {
                            tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }
                if (tripwireData.value.isShowAllArea) {
                    showAllTripwireArea(true)
                }
            }
        }
        // 清空当前区域
        const clearTripwireArea = function () {
            const surface = tripwireData.value.chosenSurfaceIndex
            tripwireData.value.lineInfo[surface].startPoint = { X: 0, Y: 0 }
            tripwireData.value.lineInfo[surface].endPoint = { X: 0, Y: 0 }
            tripwireData.value.lineInfo[surface].configured = false
            tripwireDrawer.clear()
            // setTripwireOcxData()
            pageData.value.applyDisable = false
        }
        // 清空所有区域
        const clearAllTripwireArea = function () {
            tripwireData.value.lineInfo.forEach((lineInfo: { direction: string; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }) => {
                lineInfo.startPoint = { X: 0, Y: 0 }
                lineInfo.endPoint = { X: 0, Y: 0 }
                lineInfo.configured = false
            })
            if (tripwiremode.value === 'h5') {
                tripwireDrawer.clear()
            } else {
                const sendXML1 = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, tripwireData.value.isShowAllArea)
                if (sendXML1) {
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                }
                const sendXML2 = OCX_XML_SetTripwireLineAction('NONE')
                if (sendXML2) {
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }
            }
            if (tripwireData.value.isShowAllArea) {
                showAllTripwireArea(true)
            }
            pageData.value.applyDisable = false
        }

        // pea
        // pea绘图
        const peaChange = function (
            points:
                | {
                      X1: number
                      Y1: number
                      X2: number
                      Y2: number
                  }
                | {
                      X: number
                      Y: number
                      isClosed?: boolean
                  }[],
        ) {
            const type = peaData.value.activity_type
            const area = peaData.value.chosenWarnAreaIndex
            if (peaData.value.areaCfgData[type].regulation) {
                if (!Array.isArray(points)) {
                    peaData.value.areaCfgData[type].boundaryInfo[area]['point'] = getRegionPoints(points)
                    peaData.value.areaCfgData[type].regionInfo[area] = points
                }
            } else {
                if (Array.isArray(points)) {
                    peaData.value.areaCfgData[type].boundaryInfo[area]['point'] = points
                }
            }
            if (peaData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            peaRefreshInitPage()
            pageData.value.applyDisable = false
        }
        // pea是否显示所有区域
        const showAllPeaArea = function (isShowAll: boolean) {
            peaDrawer && peaDrawer.setEnableShowAll(isShowAll)
            if (isShowAll) {
                const type = peaData.value.activity_type
                const index = peaData.value.chosenWarnAreaIndex
                if (peaData.value.currentRegulation) {
                    // 画矩形
                    const regionInfoList = peaData.value.areaCfgData[type]['regionInfo']
                    if (peamode.value === 'h5') {
                        peaDrawer.setCurrAreaIndex(index, peaData.value.currAreaType)
                        peaDrawer.drawAllRegion(regionInfoList, index)
                    } else {
                        const pluginRegionInfoList = JSON.parse(JSON.stringify(regionInfoList))
                        pluginRegionInfoList.splice(index, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                        const sendXML = OCX_XML_SetAllArea({ regionInfoList: pluginRegionInfoList }, 'Rectangle', 'TYPE_PEA_DETECTION', undefined, true)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                } else {
                    // 画点
                    const boundaryInfo: { X: number; Y: number; isClosed?: boolean }[][] = []
                    const boundaryInfoList = peaData.value.areaCfgData[type]['boundaryInfo']
                    boundaryInfoList.forEach(function (ele, idx) {
                        boundaryInfo[idx] = ele.point.map((item: { X: number; Y: number; isClosed?: boolean }) => {
                            return { X: item.X, Y: item.Y, isClosed: item.isClosed }
                        })
                    })
                    if (peamode.value === 'h5') {
                        peaDrawer.setCurrAreaIndex(index, peaData.value.currAreaType)
                        peaDrawer.drawAllPolygon(boundaryInfo, {}, peaData.value.currAreaType, index, true)
                    } else {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: boundaryInfo }, 'IrregularPolygon', 'TYPE_PEA_DETECTION', undefined, true)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }
            } else {
                if (peamode.value !== 'h5') {
                    if (peaData.value.currentRegulation) {
                        // 画矩形
                        const sendXML = OCX_XML_SetAllArea({ regionInfoList: [] }, 'Rectangle', 'TYPE_PEA_DETECTION', undefined, false)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    } else {
                        // 画点
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: undefined }, 'IrregularPolygon', 'TYPE_PEA_DETECTION', undefined, false)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }
                setPeaOcxData()
            }
        }
        // pea显示
        const setPeaOcxData = function () {
            if (peaData.value.peaFunction == 'pea_param') {
                const type = peaData.value.activity_type
                const area = peaData.value.chosenWarnAreaIndex
                const boundaryInfo = peaData.value.areaCfgData[type]['boundaryInfo']
                const regionInfo = peaData.value.areaCfgData[type]['regionInfo']
                if (boundaryInfo && boundaryInfo.length > 0) {
                    if (peamode.value === 'h5') {
                        peaDrawer.setCurrAreaIndex(area, peaData.value.currAreaType)
                        if (peaData.value.currentRegulation) {
                            // 画矩形
                            peaDrawer.setArea(regionInfo[area])
                        } else {
                            // 画点
                            peaDrawer.setPointList(boundaryInfo[area]['point'])
                        }
                    } else {
                        const sendXML = OCX_XML_SetPeaArea(boundaryInfo[area]['point'], peaData.value.currentRegulation)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }
                if (peaData.value.isShowAllArea == true) {
                    showAllPeaArea(true)
                }
            }
        }
        // 区域关闭
        const peaClosePath = function (
            points: {
                X: number
                Y: number
                isClosed?: boolean
            }[],
        ) {
            const currType = peaData.value.activity_type
            const area = peaData.value.chosenWarnAreaIndex
            peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'] = points
            peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'].forEach((ele) => {
                ele.isClosed = true
            })
        }
        // 提示区域关闭
        const peaForceClosePath = function (canBeClosed: boolean) {
            if (!canBeClosed) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }
        // 清空当前区域对话框
        const peaClearCurrentArea = function () {
            const currType = peaData.value.activity_type
            const area = peaData.value.chosenWarnAreaIndex
            // const length = cloneDeep(peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'].length)
            // if (length == 6) {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'] = []
                if (peamode.value === 'h5') {
                    peaDrawer && peaDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    if (sendXML) {
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
                peaData.value.areaCfgData[currType]['boundaryInfo'][area]['configured'] = false
                if (peaData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
                pageData.value.applyDisable = false
            })
            // }
        }
        // 清空当前区域按钮
        const peaClearCurrentAreaBtn = function () {
            const currType = peaData.value.activity_type
            const area = peaData.value.chosenWarnAreaIndex
            peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'] = []
            peaData.value.areaCfgData[currType]['boundaryInfo'][area]['configured'] = false
            peaData.value.areaCfgData[currType]['regionInfo'][area] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
            if (peamode.value === 'h5') {
                peaDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                if (sendXML) {
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            if (peaData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            pageData.value.applyDisable = false
        }
        // 清空所有区域
        const clearAllPeaArea = function () {
            const type = peaData.value.activity_type
            const regionInfoList = peaData.value.areaCfgData[type]['regionInfo']
            const boundaryInfoList = peaData.value.areaCfgData[type]['boundaryInfo']
            if (peaData.value.currentRegulation) {
                // 画矩形
                regionInfoList.forEach((ele) => {
                    ele.X1 = 0
                    ele.Y1 = 0
                    ele.X2 = 0
                    ele.Y2 = 0
                })
            } else {
                // 画点
                boundaryInfoList.forEach((ele) => {
                    ele.point = []
                    ele.configured = false
                })
            }
            if (peamode.value === 'h5') {
                peaDrawer.clear()
            } else {
                if (peaData.value.currentRegulation) {
                    // 画矩形
                    const sendXML = OCX_XML_SetAllArea({ regionInfoList: [] }, 'Rectangle', 'TYPE_PEA_DETECTION', undefined, peaData.value.isShowAllArea)
                    if (sendXML) {
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                } else {
                    // 画点
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PEA_DETECTION', undefined, peaData.value.isShowAllArea)
                    if (sendXML) {
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                if (sendXML) {
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            if (peaData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            pageData.value.applyDisable = false
        }
        onMounted(async () => {
            await getScheduleList()
            await getOnlineChannel()
            await getChannelData()
            await getVoiceList()
            await getAIResourceData(false)
            await getRecordList()
            await getAlarmOutList()
            await initPageData()
        })
        onBeforeUnmount(() => {
            if (tripwirePlugin?.IsPluginAvailable() && tripwiremode.value === 'ocx' && tripwireReady.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            if (peaPlugin?.IsPluginAvailable() && peamode.value === 'ocx' && peaReady.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })
        return {
            buildScheduleList,
            Translate,
            aiResourceTableData,
            moreDropDownRef,
            tripwireplayerRef,
            peaplayerRef,
            pageData,
            tripwireData,
            tripwireTriggerData,
            peaData,
            handleAIResourceDel,
            handleChangeChannel,
            tripWirehandlePlayerReady,
            peahandlePlayerReady,
            handleTripwireShowAllAreaChange,
            handlePeaShowAllAreaChange,
            handleSurfaceChange,
            handleTripwireDirectionChange,
            handleWarnAreaChange,
            handleAreaActiveChange,
            handlePeaDirectionChange,
            handleTabClick,
            handleTripwireFunctionTabClick,
            handlePeaFunctionTabClick,
            setTripWireSpeed,
            setPeaSpeed,
            editLockStatus,
            handleDectionChange,
            handleTripwireApply,
            handlePeaApply,
            handleTripwireTriggerSwitch,
            handlePeaTriggerSwitch,
            handleTripwireTrigger,
            handlePeaTrigger,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            clearTripwireArea,
            clearAllTripwireArea,
            peaClearCurrentAreaBtn,
            clearAllPeaArea,
        }
    },
})
