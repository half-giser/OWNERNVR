/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:36:26
 * @Description: 区域入侵
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-19 17:26:16
 */
import { ArrowDown } from '@element-plus/icons-vue'
import { type chlCaps, type aiResourceRow } from '@/types/apiType/aiAndEvent'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import { ElDivider, type TabsPaneContext } from 'element-plus'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { cloneDeep } from 'lodash'
import { type XmlResult } from '@/utils/xmlParse'
import { type peaPageData, type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    components: {
        ArrowDown,
        ElDivider,
        ScheduleManagPop,
        BaseTransferDialog,
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
        type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        const aiResourceTableData = ref<aiResourceRow[]>([])
        const peaplayerRef = ref<PlayerInstance>()
        const moreDropDownRef = ref()
        let peaDrawer: CanvasPolygon
        const peaData = ref({
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
            // 选择的功能:pea_param,pea_target,pea_trigger
            peaFunction: 'pea_param',

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
            // activity_type 1:perimeter 2:entry 3:leave
            activity_type: 'perimeter',
            // 选择的警戒面index
            chosenWarnAreaIndex: 0,
            // 支持的活动类型列表
            supportList: [] as string[],

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

            recordSource: [] as { value: string; label: string }[],
            alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
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
                peaPlugin.AddPluginMoveEvent(document.getElementById('peaplayer')!)
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'PeaConfig' : 'ReadOnly', 'Live')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                peaPlugin.DisplayOCX(true)
            }
        }
        /**
         * @description 播放视频
         */
        const peaPlay = () => {
            const { id, name } = peaData.value.chlData
            if (peamode.value === 'h5') {
                peaPlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [id],
                        chlNameList: [name],
                        streamType: 'sub',
                        chlIndexList: [peaData.value.chlData['id']],
                        chlTypeList: [peaData.value.chlData['chlType']],
                    })
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                if (peamode.value === 'ocx') {
                    peaPlugin.RetryStartChlView(id, name)
                }
            }
        }
        // 首次加载成功 播放pea视频
        const peastopWatchFirstPlay = watchEffect(() => {
            if (peaReady.value && peaData.value.initComplete) {
                nextTick(() => {
                    peaPlay()
                    setPeaOcxData()
                })
                peastopWatchFirstPlay()
            }
        })
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setPeaSpeed = (speed: number) => {
            peaData.value.peaspeed = speed
        }
        // 对sheduleList进行处理
        const getScheduleList = async () => {
            peaData.value.scheduleList = await buildScheduleList()
            peaData.value.scheduleList.map((item) => {
                item.value = item.value != '' ? item.value : peaData.value.scheduleDefaultId
            })
        }
        // 获取AI资源请求
        const getAIResourceData = async (isEdit: boolean) => {
            let sendXml = ''
            if (isEdit) {
                sendXml = rawXml`<content>
                                    <chl>
                                        <item id="${peaData.value.currChlId}">
                                            <eventType>tripwire</eventType>
                                            <switch>${peaData.value.detectionEnable.toString()}</switch>
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
                    peaData.value.totalResourceOccupancy = tempResourceOccupancy.toFixed(2)
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
                                    return peaData.value.eventTypeMapping[item]
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
                peaData.value.applyDisable = false
            })
        }
        // 获取区域入侵检测数据
        const getPeaData = async () => {
            peaData.value.supportList = []
            peaData.value.areaActiveList = []
            peaData.value.directionList = []
            const sendXML = rawXml` <condition>
                                        <chlId>${peaData.value.currChlId}</chlId>
                                    </condition>
                                    <requireField>
                                        <param/>
                                        <trigger/>
                                    </requireField>`
            const res = await queryIntelAreaConfig(sendXML)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                peaData.value.applyDisable = true
                const schedule = $('//content/chl').attr('scheduleGuid')
                peaData.value.pea_schedule =
                    schedule != '' ? (peaData.value.scheduleList.some((item) => item.value == schedule) ? schedule : peaData.value.scheduleDefaultId) : peaData.value.scheduleDefaultId
                getPeaActivityData('perimeter', res)
                getPeaActivityData('entry', res)
                getPeaActivityData('leave', res)
                getPresetList()
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
                    peaData.value.direction = peaData.value.directionList.length > 0 ? peaData.value.directionList[0]['value'] : ''
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
                const regulation = $(`//content/chl/${activity_type}/param/boundary`).attr('regulation') == '1'
                peaData.value.areaCfgData[activity_type].regulation = regulation
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
                if (regulation) {
                    regionInfo.forEach((ele, idx) => {
                        if (ele.X1 != 0 || ele.Y1 != 0 || ele.X2 != 0 || ele.Y2 != 0) {
                            boundaryInfo[idx].configured = true
                        } else {
                            boundaryInfo[idx].configured = false
                        }
                    })
                } else {
                    boundaryInfo.forEach((ele) => {
                        if (ele.point.length > 0) {
                            ele.configured = true
                        } else {
                            ele.configured = false
                        }
                    })
                }

                peaData.value.areaCfgData[activity_type].boundaryInfo = boundaryInfo
                peaData.value.areaCfgData[activity_type].regionInfo = regionInfo
                peaData.value.areaCfgData[activity_type].audioSuport = $(`//content/chl/${activity_type}/param/triggerAudio`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].triggerAudio = $(`//content/chl/${activity_type}/param/triggerAudio`).text() == 'true'
                peaData.value.areaCfgData[activity_type].lightSuport = $(`//content/chl/${activity_type}/param/triggerWhiteLight`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].triggerWhiteLight = $(`//content/chl/${activity_type}/param/triggerWhiteLight`).text() == 'true'
                peaData.value.areaCfgData[activity_type].hasAutoTrack = $(`//content/chl/${activity_type}/param/autoTrack`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].autoTrack = $(`//content/chl/${activity_type}/param/autoTrack`).text() == 'true'
                peaData.value.areaCfgData[activity_type].pictureAvailable = $(`//content/chl/${activity_type}/param/saveTargetPicture`).text() == '' ? false : true
                peaData.value.areaCfgData[activity_type].saveTargetPicture = $(`//content/chl/${activity_type}/param/saveTargetPicture`).text() == 'true'
                peaData.value.areaCfgData[activity_type].saveSourcePicture = $(`//content/chl/${activity_type}/param/saveSourcePicture`).text() == 'true'
                peaData.value.areaCfgData[activity_type].pea_onlyPreson = $(`//content/chl/${activity_type}/param/sensitivity`).text() == '' ? false : true
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
                if (peaData.value.areaCfgData[activity_type].audioSuport && peaData.value.chlData['supportAudio']) {
                    peaData.value.areaCfgData[activity_type].peaTriggerData.push({
                        value: peaData.value.areaCfgData[activity_type].triggerAudio,
                        label: 'IDCS_AUDIO',
                        property: 'triggerAudio',
                    })
                }
                if (peaData.value.areaCfgData[activity_type].lightSuport && peaData.value.chlData['supportWhiteLight']) {
                    peaData.value.areaCfgData[activity_type].peaTriggerData.push({
                        value: peaData.value.areaCfgData[activity_type].triggerWhiteLight,
                        label: 'IDCS_LIGHT',
                        property: 'triggerWhiteLight',
                    })
                }
            }
        }
        // 保存区域入侵检测数据
        const savePeaData = async () => {
            let sendXml = rawXml`<content>
                                        <chl id="${peaData.value.currChlId}" scheduleGuid="${peaData.value['pea_schedule']}">
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
                peaData.value.areaCfgData[type]['boundaryInfo'].forEach((element: { point: { X: number; Y: number; isClosed?: boolean }[]; maxCount: number; configured: boolean }) => {
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
                if (peaData.value.areaCfgData[type]['audioSuport'] && peaData.value.chlData['supportAudio']) {
                    sendXml += rawXml`<triggerAudio>${peaData.value.areaCfgData[type]['triggerAudio'].toString()}</triggerAudio>`
                }
                if (peaData.value.areaCfgData[type]['lightSuport'] && peaData.value.chlData['supportWhiteLight']) {
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
                                                peaData.value.chlData['accessType'] == '0'
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
                peaData.value.applyDisable = true
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
                    const showInfo = prefixName ? prefixName + peaData.value.closeTip[ele['object']].toLowerCase() : peaData.value.closeTip[ele['object']]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            data.mutexListEx.forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                    const showInfo = prefixName ? prefixName + peaData.value.closeTip[ele['object']].toLowerCase() : peaData.value.closeTip[ele['object']]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SIMPLE_INVADE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + peaData.value.chlData['name'], switchChangeType),
                }).then(async () => {
                    await savePeaData()
                })
            } else {
                await savePeaData()
            }
        }
        // 获取recordList
        const getRecordList = async () => {
            peaData.value.recordSource = []
            const resb = await getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item: any) => {
                    const $item = queryXml(item.element)
                    peaData.value.recordSource.push({
                        value: item.attr('id'),
                        label: $item('name').text(),
                    })
                })
            }
        }
        // 获取alarmOutList
        const getAlarmOutList = async () => {
            peaData.value.alarmOutSource = []
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
                    peaData.value.alarmOutSource.push({
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
            const chlIp = peaData.value.chlData['ip']
            props.onlineChannelList.forEach((chl) => {
                if (chl['ip'] == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl['accessType'] == '1') {
                        thermalChlName = chl['name'] == peaData.value.chlData['name'] ? '' : chl['name']
                    } else {
                        normalChlName = chl['name'] == peaData.value.chlData['name'] ? '' : chl['name']
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

        // pea tab点击事件
        const handlePeaFunctionTabClick = async (pane: TabsPaneContext) => {
            peaData.value.peaFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (peaData.value.peaFunction == 'pea_param') {
                const type = peaData.value.activity_type
                const area = peaData.value.chosenWarnAreaIndex
                const boundaryInfo = peaData.value.areaCfgData[type]['boundaryInfo']
                if (peamode.value === 'h5') {
                    peaDrawer.setEnable(true)
                    setPeaOcxData()
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
                    if (ele.point.length > 0) {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = true
                    } else {
                        peaData.value.areaCfgData[type].boundaryInfo[idx].configured = false
                    }
                })
                // console.log(peaData.value.areaCfgData[type].boundaryInfo)
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
        // 初始化数据
        const initPageData = async () => {
            peaData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            peaData.value.currChlId = props.currChlId
            peaData.value.chlData = props.chlData
            peaData.value.voiceList = props.voiceList
            peaData.value.initComplete = false
            const pageTimer = setTimeout(async () => {
                // 临时方案-NVRUSS44-79（页面快速切换时。。。）
                const peaPlugin = peaplayerRef.value?.plugin
                if (peamode.value !== 'h5') {
                    peaPlugin?.VideoPluginNotifyEmitter.addListener(peaLiveNotify2Js)
                }
                peaData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(peaData.value.chlData['supportPea'] ? 'IPC' : 'NVR')
                await getPeaData()
                peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activity_type].regulation
                peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                peaRefreshInitPage()
                peaData.value.initComplete = true
                if (peaData.value.chlData.supportAutoTrack) {
                    getPTZLockStatus()
                }
                if (peamode.value === 'h5') {
                    peaDrawer.setEnable(true)
                } else {
                    const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                    peaPlugin?.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                // setPeaOcxData()
                clearTimeout(pageTimer)
            }, 250)
        }

        // 变更detectionEnable操作
        const handleDectionChange = async () => {
            peaData.value.applyDisable = false
            if (!peaData.value.chlData['supportTripwire']) {
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
        // pea执行是否显示全部区域
        const handlePeaShowAllAreaChange = () => {
            peaDrawer.setEnableShowAll(peaData.value.isShowAllArea)
            showAllPeaArea(peaData.value.isShowAllArea)
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
                                    <chlId>${peaData.value.currChlId}</chlId>
                                </condition>`
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                peaData.value.lockStatus = $('//content/chl/param/PTZLock').text() == 'true'
                peaData.value.lockStatus = $('//content/chl/param/PTZLock').text() == 'true'
            }
        }
        // 通用修改云台锁定状态
        const editLockStatus = () => {
            const sendXML = rawXml`<content>
                                        <chl id='${peaData.value.currChlId}'>
                                            <param>
                                                <PTZLock>${(!peaData.value.lockStatus).toString()}</PTZLock>
                                            </param>
                                        </chl>
                                    </content>`
            openLoading(LoadingTarget.FullScreen)
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    closeLoading(LoadingTarget.FullScreen)
                    peaData.value.lockStatus = !peaData.value.lockStatus
                    peaData.value.lockStatus = !peaData.value.lockStatus
                }
            })
            peaData.value.applyDisable = false
        }

        // pea常规联动全选/全不选
        const handlePeaTriggerSwitch = () => {
            peaData.value.applyDisable = false
            if (peaData.value.areaCfgData[peaData.value.activity_type].triggerSwitch) {
                peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.forEach((item) => {
                    item.value = true
                    const property = item.property
                    peaData.value.areaCfgData[peaData.value.activity_type][property] = true
                })
            } else {
                peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.forEach((item) => {
                    item.value = false
                    const property = item.property
                    peaData.value.areaCfgData[peaData.value.activity_type][property] = false
                })
            }
        }
        // pea单个联动选择
        const handlePeaTrigger = (item: { value: boolean; label: string; property: string }) => {
            peaData.value.applyDisable = false
            const property = item.property
            peaData.value.areaCfgData[peaData.value.activity_type][property] = item.value
            const triggerSwitch = peaData.value.areaCfgData[peaData.value.activity_type].peaTriggerData.every((item) => item.value)
            peaData.value.areaCfgData[peaData.value.activity_type].triggerSwitch = triggerSwitch
        }
        // 设置record
        const recordConfirm = (e: { value: string; label: string }[]) => {
            peaData.value.applyDisable = false
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
        // record弹窗关闭
        const recordClose = () => {
            if (!peaData.value.areaCfgData[peaData.value.activity_type].recordChls.length) {
                peaData.value.areaCfgData[peaData.value.activity_type].recordChls = []
                peaData.value.areaCfgData[peaData.value.activity_type].recordList = []
                peaData.value.areaCfgData[peaData.value.activity_type].recordSwitch = false
            }
            peaData.value.areaCfgData[peaData.value.activity_type].recordIsShow = false
        }
        // 设置alarmOut
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            peaData.value.applyDisable = false
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
        // alarmOut弹窗关闭
        const alarmOutClose = () => {
            if (!peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls.length) {
                peaData.value.areaCfgData[peaData.value.activity_type].alarmOutChls = []
                peaData.value.areaCfgData[peaData.value.activity_type].alarmOutList = []
                peaData.value.areaCfgData[peaData.value.activity_type].alarmOutSwitch = false
            }
            peaData.value.areaCfgData[peaData.value.activity_type].alarmOutIsShow = false
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
            peaData.value.applyDisable = false
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
            // if (peaData.value.peaFunction == 'pea_param') {
            const type = peaData.value.activity_type
            const area = peaData.value.chosenWarnAreaIndex
            const boundaryInfo = peaData.value.areaCfgData[type]['boundaryInfo']
            const regionInfo = peaData.value.areaCfgData[type]['regionInfo']
            if (boundaryInfo.length > 0) {
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
            // }
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
                peaData.value.applyDisable = false
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
            peaData.value.applyDisable = false
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
            peaData.value.applyDisable = false
        }

        const peaLiveNotify2Js = ($: (path: string) => XmlResult) => {
            // 区域入侵
            // const $xmlPea = $("statenotify[type='PeaArea']")
            const $points = $("statenotify[type='PeaArea']/points")
            const errorCode = $("statenotify[type='PeaArea']/errorCode").text()
            // 绘制点线
            if ($points.length > 0) {
                const currType = peaData.value.activity_type
                const points: { X: number; Y: number }[] = []
                $('statenotify/points/item').forEach((element) => {
                    const X = parseInt(element.attr('X')!)
                    const Y = parseInt(element.attr('Y')!)
                    points.push({ X: X, Y: Y })
                })
                const area = peaData.value.chosenWarnAreaIndex
                if (peaData.value.currentRegulation) {
                    peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'] = points
                    peaData.value.areaCfgData[currType]['regionInfo'][area] = {
                        X1: points[0]['X'],
                        Y1: points[0]['Y'],
                        X2: points[1]['X'],
                        Y2: points[2]['Y'],
                    }
                } else {
                    peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'] = points
                }
                peaData.value.applyDisable = false
            }
            // 处理错误码
            if (errorCode == '517') {
                // 517-区域已闭合
                peaClearCurrentArea()
            } else if (errorCode == '515') {
                // 515-区域有相交直线，不可闭合
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_INTERSECT'),
                })
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
            if (peaPlugin?.IsPluginAvailable() && peamode.value === 'ocx' && peaReady.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })
        return {
            aiResourceTableData,
            moreDropDownRef,
            peaData,
            peaplayerRef,
            peahandlePlayerReady,
            setPeaSpeed,
            handleAIResourceDel,
            handlePeaApply,
            handlePeaFunctionTabClick,
            handleDectionChange,
            handlePeaShowAllAreaChange,
            handleAreaActiveChange,
            handlePeaDirectionChange,
            handleWarnAreaChange,
            handlePeaTriggerSwitch,
            editLockStatus,
            handlePeaTrigger,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            peaClearCurrentAreaBtn,
            clearAllPeaArea,
        }
    },
})
