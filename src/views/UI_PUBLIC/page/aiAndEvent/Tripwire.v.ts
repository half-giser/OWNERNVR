/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:16:22
 * @Description: 周界防范/人车检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 17:21:25
 */
import { type chlCaps, type aiResourceRow, type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPassline from '@/utils/canvas/canvasPassline'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import { cloneDeep } from 'lodash-es'
import { type XmlResult } from '@/utils/xmlParse'
export default defineComponent({
    components: {
        ScheduleManagPop,
        ChannelPtzCtrlPanel,
    },
    props: {
        /**
         * @property 选中的通道
         */
        currChlId: {
            type: String,
            required: true,
        },
        chlData: {
            type: Object as PropType<chlCaps>,
            required: true,
        },
        voiceList: {
            type: Array as PropType<{ value: string; label: string }[]>,
            required: true,
        },
        onlineChannelList: {
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
            required: true,
        },
    },
    setup(props) {
        type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'
        const { openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        const aiResourceTableData = ref<aiResourceRow[]>([])
        const tripwireplayerRef = ref<PlayerInstance>()
        let tripwireDrawer: CanvasPassline
        const tripwireData: { [key: string]: any } = ref({
            // 当前选中的通道
            currChlId: '',
            // 当前选择通道数据
            chlData: {} as chlCaps,
            // 声音列表
            voiceList: [] as { value: string; label: string }[],
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 默认声音id
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            // 不支持功能提示页面是否展示
            notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // 排程管理
            scheduleManagePopOpen: false,
            scheduleDefaultId: '{00000000-0000-0000-0000-000000000000}',
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:tripwire_param,tripwire_target,tripwire_trigger
            tripwireFunction: 'tripwire_param',

            // 总ai资源占用率
            totalResourceOccupancy: '0.00',
            // AI详情弹窗
            aiResourcePopOpen: false,
            // apply按钮是否可用
            applyDisable: true,

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

            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData['supportTripwire'] ? 'IPC' : 'NVR'),
            // 播放器相关
            // 通知列表
            notification: [] as string[],
            // 排程
            tripwire_schedule: '',

            // 持续时间
            holdTime: 0,
            holdTimeList: [] as { value: number; label: string }[],
            // 警戒面
            alertSurface: '',
            // 选择的警戒面
            chosenSurfaceIndex: 0,
            lineInfo: [] as { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[],
            // 方向
            direction: '' as CanvasPasslineDirection,
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
            // record数据源
            recordSource: [] as { value: string; label: string }[],
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
            // alarmOut数据源
            alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
            alarmOutType: 'alarmOut',

            preset: {
                switch: false,
                presets: [] as PresetItem[],
            },
            presetSource: [] as PresetList[],
            initComplete: false,
            moreDropDown: false,
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
                tripwirePlugin.AddPluginMoveEvent(document.getElementById('tripwireplayer')!)
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'TripwireConfig' : 'ReadOnly', 'Live')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                tripwirePlugin.DisplayOCX(true)
            }
        }
        /**
         * @description 播放视频
         */
        const tripwirePlay = () => {
            const { id, name } = tripwireData.value.chlData
            if (tripwiremode.value === 'h5') {
                tripwirePlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                    // TODO index
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [id],
                        chlNameList: [name],
                        streamType: 'sub',
                        chlIndexList: [tripwireData.value.chlData['id']],
                        chlTypeList: [tripwireData.value.chlData['chlType']],
                    })
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    tripwirePlugin.RetryStartChlView(id, name)
                }
            }
        }
        // 首次加载成功 播放tripwire视频
        const tripwirestopWatchFirstPlay = watchEffect(() => {
            if (tripwireReady.value && tripwireData.value.initComplete) {
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
        // 获取AI资源请求
        const getAIResourceData = async (isEdit: boolean) => {
            let sendXml = ''
            if (isEdit) {
                sendXml = rawXml`<content>
                                    <chl>
                                        <item id="${tripwireData.value.currChlId}">
                                            <eventType>tripwire</eventType>
                                            <switch>${tripwireData.value.detectionEnable.toString()}</switch>
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
                    tripwireData.value.totalResourceOccupancy = tempResourceOccupancy.toFixed(2)
                    $('//content/chl/item').forEach((element) => {
                        const $item = queryXml(element.element)
                        const id = element.attr('id')
                        let name = $item('name').text()
                        // 通道是否在线
                        const connectState = $item('connectState').text() == 'true'
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'
                        $item('resource/item').forEach((ele) => {
                            const eventType: string[] = ele.attr('eventType') ? ele.attr('eventType')!.split(',') : []
                            const eventTypeText = eventType
                                .map((item) => {
                                    return tripwireData.value.eventTypeMapping[item]
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
                        message: Translate('IDCS_NO_RESOURCE'),
                    })
                    // 资源占用率超过100
                    tripwireData.value.detectionEnable = false
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
            openLoading()
            const res = await freeAIOccupyResource(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                aiResourceTableData.value.splice(aiResourceTableData.value.indexOf(row), 1)
            }
        }
        // 点击释放AI资源
        const handleAIResourceDel = async (row: aiResourceRow) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                deleteAIResource(row)
                tripwireData.value.applyDisable = false
            })
        }
        // 获取越界检测数据
        const getTripwireData = async () => {
            openLoading()
            if (!tripwireData.value.chlData['supportTripwire'] && !tripwireData.value.chlData['supportBackTripwire'] && tripwireData.value.chlData['supportPeaTrigger']) {
                const sendXML = rawXml` <condition>
                                            <chlId>${tripwireData.value.currChlId}</chlId>
                                        </condition>
                                        <requireField>
                                            <trigger/>
                                        </requireField>`
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    tripwireData.value.applyDisable = true
                    const schedule = $('//content/chl').attr('scheduleGuid')
                    tripwireData.value.tripwire_schedule =
                        schedule != ''
                            ? tripwireData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                                ? schedule
                                : tripwireData.value.scheduleDefaultId
                            : tripwireData.value.scheduleDefaultId
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
                            chls: $item('sysRec/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.recordList = tripwireData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.alarmOut = {
                            switch: $item('alarmOut/switch').text() == 'true',
                            chls: $item('alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.alarmOutList = tripwireData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.preset = {
                            switch: $item('preset/switch').text() == 'true',
                            presets: $item('preset/presets/item').map((item) => {
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
                                            <chlId>${tripwireData.value.currChlId}</chlId>
                                        </condition>
                                        <requireField>
                                            <param/>
                                            <trigger/>
                                        </requireField>`
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    tripwireData.value.applyDisable = true
                    const schedule = $('//content/chl').attr('scheduleGuid')
                    tripwireData.value.tripwire_schedule =
                        schedule == ''
                            ? tripwireData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                                ? schedule
                                : tripwireData.value.scheduleDefaultId
                            : tripwireData.value.scheduleDefaultId
                    tripwireData.value.directionList = $('//types/direction/enum').map((item) => {
                        return { value: item.text(), label: tripwireData.value.directionTypeTip[item.text()] }
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
                            direction: $item('direction').text() as CanvasPasslineDirection,
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
                            chls: $item('sysRec/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.recordList = tripwireData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.alarmOut = {
                            switch: $item('alarmOut/switch').text() == 'true',
                            chls: $item('alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        tripwireData.value.alarmOutList = tripwireData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                        tripwireData.value.preset = {
                            switch: $item('preset/switch').text() == 'true',
                            presets: $item('preset/presets/item').map((item) => {
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
                    if (tripwireData.value.audioSuport && tripwireData.value.chlData['supportAudio']) {
                        tripwireTriggerData.value.push({ value: tripwireData.value.triggerAudio, label: 'IDCS_AUDIO', property: 'triggerAudio' })
                    }
                    if (tripwireData.value.lightSuport && tripwireData.value.chlData['supportWhiteLight']) {
                        tripwireTriggerData.value.push({ value: tripwireData.value.triggerWhiteLight, label: 'IDCS_LIGHT', property: 'triggerWhiteLight' })
                    }
                } else {
                    tripwireData.value.requireDataFail = true
                }
            }
            getPresetList()
        }
        // 保存越界检测数据
        const saveTripwireData = async () => {
            let sendXml = rawXml`<content>
                                        <chl id="${tripwireData.value.currChlId}" scheduleGuid="${tripwireData.value['tripwire_schedule']}">
                                    `
            if (tripwireData.value.chlData['supportTripwire'] || tripwireData.value.chlData['supportBackTripwire']) {
                sendXml += rawXml`
                                <param>
                                    <switch>${tripwireData.value['detectionEnable'].toString()}</switch>
                                    <alarmHoldTime unit="s">${tripwireData.value['holdTime'].toString()}</alarmHoldTime>`
                if (tripwireData.value['tripwire_onlyPreson']) {
                    sendXml += rawXml`<sensitivity>${tripwireData.value['onlyPersonSensitivity'].toString()}</sensitivity>`
                }
                if (tripwireData.value['hasObj']) {
                    sendXml += rawXml`
                                    <objectFilter>
                                        <car>
                                            <switch>${tripwireData.value['objectFilter'].car.toString()}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter'].carSensitivity.toString()}</sensitivity>
                                        </car>
                                        <person>
                                            <switch>${tripwireData.value['objectFilter'].person.toString()}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter'].personSensitivity.toString()}</sensitivity>
                                        </person>`
                    if (tripwireData.value.chlData['accessType'] == '0') {
                        sendXml += rawXml`
                                        <motor>
                                            <switch>${tripwireData.value['objectFilter']['motorcycle'].toString()}</switch>
                                            <sensitivity>${tripwireData.value['objectFilter']['motorSensitivity'].toString()}</sensitivity>
                                        </motor>
                                            `
                    }
                    sendXml += rawXml`</objectFilter>`
                }
                if (tripwireData.value['hasAutoTrack']) {
                    sendXml += rawXml`
                                    <autoTrack>${tripwireData.value['autoTrack'].toString()}</autoTrack>
                    `
                }
                sendXml += rawXml`
                                <line type="list" count="${tripwireData.value['lineInfo'].length.toString()}">
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
                if (tripwireData.value.audioSuport && tripwireData.value.chlData['supportAudio']) {
                    sendXml += rawXml`<triggerAudio>${tripwireData.value['triggerAudio'].toString()}</triggerAudio>`
                }
                if (tripwireData.value.lightSuport && tripwireData.value.chlData['supportWhiteLight']) {
                    sendXml += rawXml`<triggerWhiteLight>${tripwireData.value['triggerWhiteLight'].toString()}</triggerWhiteLight>`
                }
                if (tripwireData.value['pictureAvailable']) {
                    sendXml += rawXml`
                        <saveSourcePicture>${tripwireData.value['saveSourcePicture'].toString()}</saveSourcePicture>
                        <saveTargetPicture>${tripwireData.value['saveTargetPicture'].toString()}</saveTargetPicture>
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
                                                (element: { value: string; label: string }) => rawXml`
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
                                                (element: { value: string; label: string }) => rawXml`
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
                                                    ? rawXml`
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
                                <snapSwitch>${tripwireData.value['snapSwitch'].toString()}</snapSwitch>
                                <msgPushSwitch>${tripwireData.value['msgPushSwitch'].toString()}</msgPushSwitch>
                                <buzzerSwitch>${tripwireData.value['buzzerSwitch'].toString()}</buzzerSwitch>
                                <popVideoSwitch>${tripwireData.value['popVideoSwitch'].toString()}</popVideoSwitch>
                                <emailSwitch>${tripwireData.value['emailSwitch'].toString()}</emailSwitch>
                                <sysAudio id='${tripwireData.value['sysAudio'].toString()}'></sysAudio>
                            </trigger>
                            </chl>
                        </content>`
            openLoading()
            const $ = await editTripwire(sendXml)
            const res = queryXml($)
            closeLoading()
            if (res('status').text() == 'success') {
                if (tripwireData.value.detectionEnable) {
                    tripwireData.value.originalEnable = true
                }
                tripwireData.value.applyDisable = true
                tripwireRefreshInitPage()
            }
        }
        // 执行保存tripwire数据
        const handleTripwireApply = () => {
            if (!tripwireData.value.chlData['supportTripwire'] && !tripwireData.value.chlData['supportBackTripwire'] && tripwireData.value.chlData['supportPeaTrigger']) {
                saveTripwireData()
            } else {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []
                if (tripwireData.value['detectionEnable'] && tripwireData.value['detectionEnable'] != tripwireData.value['originalEnable']) {
                    isSwitchChange = true
                }
                const mutexChlNameObj = getMutexChlNameObj()
                tripwireData.value['mutexList'].forEach((ele: { object: string; status: boolean }) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                        const showInfo = prefixName ? prefixName + tripwireData.value.closeTip[ele['object']].toLowerCase() : tripwireData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })
                tripwireData.value['mutexListEx'].forEach((ele: { object: string; status: boolean }) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                        const showInfo = prefixName ? prefixName + tripwireData.value.closeTip[ele['object']].toLowerCase() : tripwireData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })
                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageTipBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_TRIPWIRE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + tripwireData.value.chlData['name'], switchChangeType),
                    }).then(() => {
                        saveTripwireData()
                    })
                } else {
                    saveTripwireData()
                }
            }
        }
        // 对sheduleList进行处理
        const getScheduleList = async () => {
            tripwireData.value.scheduleList = await buildScheduleList()
            tripwireData.value.scheduleList.map((item: any) => {
                item.value = item.value != '' ? item.value : tripwireData.value.scheduleDefaultId
            })
        }
        // 获取recordList
        const getRecordList = async () => {
            tripwireData.value.recordSource = []
            const resb = await getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    tripwireData.value.recordSource.push({
                        value: item.attr('id')!,
                        label: $item('name').text(),
                    })
                })
            }
        }
        // 获取alarmOutList
        const getAlarmOutList = async () => {
            tripwireData.value.alarmOutSource = []
            const resb = await getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    let name = $item('name').text()
                    if ($item('devDesc').text()) {
                        name = $item('devDesc').text() + '-' + name
                    }
                    tripwireData.value.alarmOutSource.push({
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
        const getPresetList = async () => {
            const result = await getChlList({
                isSupportPtz: true,
            })

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
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = tripwireData.value.chlData['ip']
            props.onlineChannelList.forEach((chl) => {
                if (chl['ip'] == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl['accessType'] == '1') {
                        thermalChlName = chl['name'] == tripwireData.value.chlData['name'] ? '' : chl['name']
                    } else {
                        normalChlName = chl['name'] == tripwireData.value.chlData['name'] ? '' : chl['name']
                    }
                })
            }
            return {
                normalChlName: normalChlName,
                thermalChlName: thermalChlName,
            }
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
                    const sendXML1 = OCX_XML_SetTripwireLine(tripwireData.value['lineInfo'][surface])
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
        const initPageData = async () => {
            tripwireData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            tripwireData.value.currChlId = props.currChlId
            tripwireData.value.chlData = props.chlData
            tripwireData.value.voiceList = props.voiceList
            tripwireData.value.initComplete = false
            if (
                tripwireData.value.chlData['supportTripwire'] ||
                tripwireData.value.chlData['supportAOIEntry'] ||
                tripwireData.value.chlData['supportAOILeave'] ||
                tripwireData.value.chlData['supportBackTripwire'] ||
                tripwireData.value.chlData['supportBackAOIEntry'] ||
                tripwireData.value.chlData['supportBackAOILeave']
            ) {
                const pageTimer = setTimeout(async () => {
                    // 临时方案-NVRUSS44-79（页面快速切换时。。。）
                    const tripwirePlugin = tripwireplayerRef.value?.plugin
                    if (tripwiremode.value !== 'h5') {
                        tripwirePlugin?.VideoPluginNotifyEmitter.addListener(tripwireLiveNotify2Js)
                    }
                    tripwireData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(tripwireData.value.chlData['supportTripwire'] ? 'IPC' : 'NVR')
                    await getTripwireData()
                    // 是否显示控制全部区域按钮
                    tripwireRefreshInitPage()
                    tripwireData.value.initComplete = true
                    if (tripwireData.value.chlData.supportAutoTrack) {
                        getPTZLockStatus()
                    }
                    if (tripwiremode.value === 'h5') {
                        tripwireDrawer.setEnable('line', true)
                    } else {
                        const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        tripwirePlugin?.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                    // setTripwireOcxData()
                    clearTimeout(pageTimer)
                }, 250)
            } else {
                tripwireData.value.notSupportTipShow = true
            }
        }

        // 变更detectionEnable操作
        const handleDectionChange = async () => {
            tripwireData.value.applyDisable = false
            if (!tripwireData.value.chlData['supportTripwire']) {
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
            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }
        // tripwire执行是否显示全部区域
        const handleTripwireShowAllAreaChange = () => {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(tripwireData.value.isShowAllArea)
            showAllTripwireArea(tripwireData.value.isShowAllArea)
        }
        // tripWire选择警戒面
        const handleSurfaceChange = () => {
            // tripwireData.value.chosenSurfaceIndex = index
            tripwireData.value.direction = tripwireData.value.lineInfo[tripwireData.value.chosenSurfaceIndex].direction
            setTripwireOcxData()
        }
        // tripwire选择方向
        const handleTripwireDirectionChange = () => {
            tripwireData.value.lineInfo[tripwireData.value.chosenSurfaceIndex].direction = tripwireData.value.direction
            setTripwireOcxData()
        }
        // 通用获取云台锁定状态
        const getPTZLockStatus = async () => {
            const sendXML = rawXml`<condition>
                                    <chlId>${tripwireData.value.currChlId}</chlId>
                                </condition>`
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                tripwireData.value.lockStatus = $('//content/chl/param/PTZLock').text() == 'true'
            }
        }
        // 通用修改云台锁定状态
        const editLockStatus = () => {
            const sendXML = rawXml`<content>
                                        <chl id='${tripwireData.value.currChlId}'>
                                            <param>
                                                <PTZLock>${(!tripwireData.value.lockStatus).toString()}</PTZLock>
                                            </param>
                                        </chl>
                                    </content>`
            openLoading()
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    closeLoading()
                    tripwireData.value.lockStatus = !tripwireData.value.lockStatus
                }
            })
            tripwireData.value.applyDisable = false
        }
        // tripwire常规联动全选/全不选
        const handleTripwireTriggerSwitch = () => {
            tripwireData.value.applyDisable = false
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
        // tripwire单个联动选择
        const handleTripwireTrigger = (item: { value: boolean; label: string; property: string }) => {
            tripwireData.value.applyDisable = false
            const property = item.property
            if (property in tripwireData.value) {
                tripwireData.value[property] = item.value
            }
            const triggerSwitch = tripwireTriggerData.value.every((item) => item.value)
            tripwireData.value.triggerSwitch = triggerSwitch
        }
        // 设置record
        const recordConfirm = (e: { value: string; label: string }[]) => {
            tripwireData.value.applyDisable = false
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
        }
        // record弹窗关闭
        const recordClose = () => {
            if (!tripwireData.value.record.chls.length) {
                tripwireData.value.record.chls = []
                tripwireData.value.recordList = []
                tripwireData.value.record.switch = false
            }
            tripwireData.value.recordIsShow = false
        }
        // 设置alarmOut
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            tripwireData.value.applyDisable = false
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
        }
        // alarmOut弹窗关闭
        const alarmOutClose = () => {
            if (!tripwireData.value.alarmOut.chls.length) {
                tripwireData.value.alarmOut.chls = []
                tripwireData.value.alarmOutList = []
                tripwireData.value.alarmOut.switch = false
            }
            tripwireData.value.alarmOutIsShow = false
        }

        // tripwire绘图
        const tripwireChange = (passline: { startX: number; startY: number; endX: number; endY: number }) => {
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
            tripwireData.value.applyDisable = false
        }
        // tripwire是否显示所有区域
        const showAllTripwireArea = (isShowAll: boolean) => {
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
        const setTripwireOcxData = () => {
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
        const clearTripwireArea = () => {
            if (tripwiremode.value === 'h5') {
                tripwireDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            const surface = tripwireData.value.chosenSurfaceIndex
            tripwireData.value.lineInfo[surface].startPoint = { X: 0, Y: 0 }
            tripwireData.value.lineInfo[surface].endPoint = { X: 0, Y: 0 }
            tripwireData.value.lineInfo[surface].configured = false
            tripwireDrawer.clear()
            tripwireData.value.applyDisable = false
        }
        // 清空所有区域
        const clearAllTripwireArea = () => {
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
            tripwireData.value.applyDisable = false
        }
        const tripwireLiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($('/statenotify[@type="TripwireLine"]').length > 0) {
                const surface = tripwireData.value.chosenSurfaceIndex
                tripwireData.value['lineInfo'][surface]['startPoint'] = {
                    X: parseInt($('/statenotify/startPoint').attr('X')),
                    Y: parseInt($('/statenotify/startPoint').attr('Y')),
                }
                tripwireData.value['lineInfo'][surface]['endPoint'] = {
                    X: parseInt($('/statenotify/endPoint').attr('X')),
                    Y: parseInt($('/statenotify/endPoint').attr('Y')),
                }
                tripwireRefreshInitPage()
                tripwireData.value.applyDisable = false
            }
        }
        onMounted(async () => {
            await getScheduleList()
            await getAIResourceData(false)
            await getRecordList()
            await getAlarmOutList()
            await initPageData()
        })
        onBeforeUnmount(() => {
            if (tripwirePlugin?.IsPluginAvailable() && tripwiremode.value === 'ocx' && tripwireReady.value) {
                tripwirePlugin.VideoPluginNotifyEmitter.removeListener(tripwireLiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendAllAreaXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendAllAreaXML!)
                const sendXML = OCX_XML_StopPreview('ALL')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                tripwirePlugin.CloseCurPlugin(document.getElementById('tripwireplayer'))
            }
            if (tripwiremode.value === 'h5') {
                tripwirePlayer.destroy()
            }
        })
        return {
            aiResourceTableData,
            tripwireplayerRef,
            tripwireData,
            tripwireTriggerData,
            tripWirehandlePlayerReady,
            setTripWireSpeed,
            handleAIResourceDel,
            handleTripwireApply,
            handleTripwireFunctionTabClick,
            handleDectionChange,
            handleTripwireShowAllAreaChange,
            handleSurfaceChange,
            handleTripwireDirectionChange,
            editLockStatus,
            handleTripwireTriggerSwitch,
            handleTripwireTrigger,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            clearTripwireArea,
            clearAllTripwireArea,
            ScheduleManagPop,
            ChannelPtzCtrlPanel,
        }
    },
})
