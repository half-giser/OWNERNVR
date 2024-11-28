/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:36:26
 * @Description: 区域入侵
 */
import { type AlarmChlDto, AlarmPeaDto } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { cloneDeep } from 'lodash-es'
import { type XmlElement, type XmlResult } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        ChannelPtzCtrlPanel,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseResourceData,
    },
    props: {
        /**
         * @property 选中的通道
         */
        currChlId: {
            type: String,
            required: true,
        },
        /**
         * @property {AlarmChlDto} 通道数据
         */
        chlData: {
            type: Object as PropType<AlarmChlDto>,
            required: true,
        },
        /**
         * @property {Array} 声音选项
         */
        voiceList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        /**
         * @property {Array} 在线通道列表
         */
        onlineChannelList: {
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
            required: true,
        },
    },
    setup(props) {
        type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"
        const { openLoading, closeLoading } = useLoading()
        const openMessageBox = useMessageBox().openMessageBox
        const { openNotify } = useNotification()
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const osType = getSystemInfo().platform
        const peaplayerRef = ref<PlayerInstance>()
        let peaDrawer = new CanvasPolygon({
            el: document.createElement('canvas'),
        })

        const AREA_TYPE_MAPPING: Record<string, string> = {
            perimeter: 'perimeter',
            entry: 'aoientry',
            leave: 'aoileave',
        }

        const peaData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 不支持功能提示页面是否展示
            // notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // 排程管理
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:pea_param,pea_target,pea_trigger
            peaFunction: 'pea_param',
            // apply按钮是否可用
            applyDisable: true,
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportTripwire ? 'IPC' : 'NVR'),
            // activityType 1:perimeter 2:entry 3:leave
            activityType: 'perimeter',
            // 选择的警戒面index
            chosenWarnAreaIndex: 0,
            // 支持的活动类型列表
            supportList: [] as string[],
            // 云台锁定状态
            lockStatus: false,
            // 云台speed
            peaspeed: 0,
            // 排程
            schedule: '',
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: true,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: true,
            // 区域活动
            areaActive: '',
            // 区域活动列表
            areaActiveList: [] as SelectOption<string, string>[],
            // 方向
            direction: '',
            // 方向列表
            directionList: [] as SelectOption<string, string>[],
            // 区域活动禁用
            areaActiveDisable: false,
            // 方向禁用
            directionDisable: false,
            // 三种类型的数据
            areaCfgData: {
                perimeter: new AlarmPeaDto(),
                entry: new AlarmPeaDto(),
                leave: new AlarmPeaDto(),
            } as Record<string, AlarmPeaDto>,
            // 画图相关
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域
            currAreaType: 'detectionArea' as CanvasPolygonAreaType,
            initComplete: false,
            moreDropDown: false,
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

        const areaType = computed(() => {
            return AREA_TYPE_MAPPING[peaData.value.activityType]
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
                    openNotify(formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`))
                }
            }

            if (peamode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'PeaConfig' : 'ReadOnly', 'Live')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const peaPlay = () => {
            const { id, name } = props.chlData
            if (peamode.value === 'h5') {
                peaPlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else {
                if (osType === 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [id],
                    //     chlNameList: [name],
                    //     streamType: 'sub',
                    //     chlIndexList: [peaData.value.chlData.id],
                    //     chlTypeList: [peaData.value.chlData.chlType],
                    // })
                    // peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
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

        // 关闭排程管理后刷新排程列表
        const handleSchedulePopClose = async () => {
            peaData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            peaData.value.scheduleList = await buildScheduleList()
        }

        // 获取区域入侵检测数据
        const getPeaData = async () => {
            peaData.value.supportList = []
            peaData.value.areaActiveList = []
            peaData.value.directionList = []
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            openLoading()
            const res = await queryIntelAreaConfig(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                peaData.value.applyDisable = true
                const schedule = $('content/chl').attr('scheduleGuid')
                peaData.value.schedule = schedule !== '' ? (peaData.value.scheduleList.some((item) => item.value === schedule) ? schedule : DEFAULT_EMPTY_ID) : DEFAULT_EMPTY_ID
                getPeaActivityData('perimeter', res)
                getPeaActivityData('entry', res)
                getPeaActivityData('leave', res)
                // getPresetList()
                peaData.value.activityType = peaData.value.supportList[0]
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
                peaData.value.areaActive = peaData.value.areaActiveList[0].value
                if (peaData.value.areaActive === 'perimeter') {
                    peaData.value.activityType = 'perimeter'
                    peaData.value.direction = peaData.value.directionList.length > 0 ? peaData.value.directionList[0].value : ''
                    peaData.value.directionDisable = true
                } else if (peaData.value.areaActive === 'crossing') {
                    peaData.value.activityType = peaData.value.directionList[0].value
                    peaData.value.direction = peaData.value.directionList[0].value
                    peaData.value.directionDisable = false
                }
                peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activityType].regulation
                peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            } else {
                peaData.value.requireDataFail = true
            }
        }

        // 获取区域活动数据 perimeter/entry/leave
        const getPeaActivityData = (activityType: string, res: XMLDocument | Element) => {
            const $ = queryXml(res)
            const param = $(`content/chl/${activityType}/param`)
            if (!param.length) {
                return
            }

            const $param = queryXml(param[0].element)
            const $trigger = queryXml($(`content/chl/${activityType}/trigger`)[0].element)

            const areaData = peaData.value.areaCfgData[activityType]

            peaData.value.supportList.push(activityType)

            areaData.mutexList = $param('mutexList/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    object: $item('object').text(),
                    status: $item('status').text().bool(),
                }
            })
            areaData.mutexListEx = $param('mutexListEx/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    object: $item('object').text(),
                    status: $item('status').text().bool(),
                }
            })
            areaData.detectionEnable = $param('switch').text().bool()
            areaData.originalEnable = areaData.detectionEnable
            if (areaData.detectionEnable) {
                peaData.value.activityType = activityType
            }
            const holdTimeArr = $param('holdTimeNote').text().split(',')
            areaData.holdTime = $param('alarmHoldTime').text().num()
            if (!holdTimeArr.includes(areaData.holdTime.toString())) {
                holdTimeArr.push(areaData.holdTime.toString())
            }
            areaData.holdTimeList = formatHoldTime(holdTimeArr)

            const regulation = $param('content/chl/perimeter/param/boundary').attr('regulation') === '1'
            areaData.regulation = regulation

            const boundaryInfo = [] as { point: { X: number; Y: number; isClosed: boolean }[]; maxCount: number; configured: boolean }[]
            const regionInfo = [] as { X1: number; Y1: number; X2: number; Y2: number }[]
            $param('boundary/item').forEach((element) => {
                const $element = queryXml(element.element)
                const boundary = {
                    point: [] as { X: number; Y: number; isClosed: boolean }[],
                    maxCount: $param('point').attr('maxCount').num(),
                    configured: false,
                }
                const region = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
                $element('point/item').forEach((point, index) => {
                    const $item = queryXml(point.element)
                    boundary.point.push({
                        X: $item('X').text().num(),
                        Y: $item('Y').text().num(),
                        isClosed: true,
                    })
                    getRegion(index, point, region)
                })
                boundaryInfo.push(boundary)
                regionInfo.push(region)
            })
            if (regulation) {
                regionInfo.forEach((ele, idx) => {
                    if (ele.X1 || ele.Y1 || ele.X2 || ele.Y2) {
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

            areaData.boundaryInfo = boundaryInfo
            areaData.regionInfo = regionInfo
            areaData.audioSuport = $param('triggerAudio').text() !== ''
            areaData.lightSuport = $param('triggerWhiteLight').text() !== ''
            areaData.hasAutoTrack = $param('autoTrack').text() !== ''
            areaData.autoTrack = $param('autoTrack').text().bool()
            areaData.pictureAvailable = $param('saveTargetPicture').text() !== ''
            areaData.saveTargetPicture = $param('saveTargetPicture').text().bool()
            areaData.saveSourcePicture = $param('saveSourcePicture').text().bool()
            areaData.pea_onlyPreson = $param('sensitivity').text() !== ''
            // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
            areaData.onlyPersonSensitivity = peaData.value.areaCfgData[activityType].pea_onlyPreson ? $('sensitivity').text().num() : 0
            areaData.hasObj = $param('objectFilter').text() !== ''
            if (areaData.hasObj) {
                areaData.car = $param('objectFilter/car/switch').text().bool()
                areaData.person = $param('objectFilter/person/switch').text().bool()
                areaData.motorcycle = $param('objectFilter/motor/switch').text().bool()
                areaData.personSensitivity = $param('objectFilter/person/sensitivity').text().num()
                areaData.carSensitivity = $param('objectFilter/car/sensitivity').text().num()
                areaData.motorSensitivity = $param('objectFilter/motor/sensitivity').text().num()
            }

            areaData.sysAudio = $trigger('sysAudio').attr('id')
            areaData.recordSwitch = $trigger('sysRec/switch').text().bool()
            areaData.recordChls = $trigger('sysRec/chls/item').map((item) => {
                return {
                    value: item.attr('id'),
                    label: item.text(),
                }
            })
            areaData.alarmOutSwitch = $trigger('alarmOut/switch').text().bool()
            areaData.alarmOutChls = $trigger('alarmOut/alarmOuts/item').map((item) => {
                return {
                    value: item.attr('id'),
                    label: item.text(),
                }
            })
            areaData.presetSwitch = $trigger('preset/switch').text().bool()
            areaData.presets = $trigger('preset/presets/item').map((item) => {
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

            areaData.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                return $trigger(item).text().bool()
            })

            areaData.triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch']

            if (areaData.audioSuport && props.chlData.supportAudio) {
                areaData.triggerList.push('triggerAudio')
                const triggerAudio = $param('triggerAudio').text().bool()
                if (triggerAudio) {
                    areaData.trigger.push('triggerAudio')
                }
            }

            if (areaData.lightSuport && props.chlData.supportWhiteLight) {
                areaData.triggerList.push('triggerWhiteLight')
                const triggerWhiteLight = $param('triggerWhiteLight').text().bool()
                if (triggerWhiteLight) {
                    areaData.trigger.push('triggerWhiteLight')
                }
            }
        }

        // 保存区域入侵检测数据
        const savePeaData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${peaData.value.schedule}">
                        ${peaData.value.supportList
                            .map((type) => {
                                const data = peaData.value.areaCfgData[type]
                                if (type !== peaData.value.activityType) {
                                    data.detectionEnable = false
                                }
                                return rawXml`
                                    <${type}>
                                        <param>
                                            <switch>${data.detectionEnable}</switch>
                                            <alarmHoldTime unit="s">${data.holdTime}</alarmHoldTime>
                                            <boundary type="list" count="${data.boundaryInfo.length}">
                                                <itemType>
                                                    <point type="list"/>
                                                </itemType>
                                                ${data.boundaryInfo
                                                    .map((element) => {
                                                        return rawXml`
                                                            <item>
                                                                <point type="list" maxCount="${element.maxCount}" count="${element.point.length}">
                                                                    ${element.point
                                                                        .map((point) => {
                                                                            return rawXml`
                                                                                <item>
                                                                                    <X>${Math.round(point.X)}</X>
                                                                                    <Y>${Math.round(point.Y)}</Y>
                                                                                </item>
                                                                            `
                                                                        })
                                                                        .join('')}
                                                                </point>
                                                            </item>
                                                        `
                                                    })
                                                    .join('')}
                                            </boundary>
                                            ${data.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${data.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                                            ${data.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${data.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                                            ${
                                                data.pictureAvailable
                                                    ? rawXml`
                                                        <saveSourcePicture>${data.saveSourcePicture}</saveSourcePicture>
                                                        <saveTargetPicture>${data.saveTargetPicture}</saveTargetPicture>
                                                    `
                                                    : ''
                                            }
                                            ${data.hasAutoTrack ? `<autoTrack>${data.autoTrack}</autoTrack>` : ''}
                                            ${data.pea_onlyPreson ? `<sensitivity>${data.onlyPersonSensitivity}</sensitivity>` : ''}
                                            ${
                                                data.hasObj
                                                    ? rawXml`
                                                        <objectFilter>
                                                            <car>
                                                                <switch>${data.car}</switch>
                                                                <sensitivity>${data.carSensitivity}</sensitivity>
                                                            </car>
                                                            <person>
                                                                <switch>${data.person}</switch>
                                                                <sensitivity>${data.personSensitivity}</sensitivity>
                                                            </person>
                                                            ${
                                                                props.chlData.accessType === '0'
                                                                    ? rawXml`
                                                                        <motor>
                                                                            <switch>${data.motorcycle}</switch>
                                                                            <sensitivity>${data.motorSensitivity}</sensitivity>
                                                                        </motor>
                                                                    `
                                                                    : ''
                                                            }
                                                        </objectFilter>
                                                    `
                                                    : ''
                                            }
                                        </param>
                                        <trigger>
                                            <sysRec>
                                                <chls type="list">
                                                    ${data.recordChls.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
                                                </chls>
                                            </sysRec>
                                            <alarmOut>
                                                <alarmOuts type="list">
                                                    ${data.alarmOutChls.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
                                                </alarmOuts>
                                            </alarmOut>
                                            <preset>
                                                <presets type="list">
                                                    ${data.presets
                                                        .map((item) => {
                                                            return rawXml`
                                                            <item>
                                                                <index>${item.index}</index>
                                                                <name><![CDATA[${item.name}]]></name>
                                                                <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
                                                            </item>`
                                                        })
                                                        .join('')}
                                                </presets>
                                            </preset>
                                            <snapSwitch>${data.trigger.includes('snapSwitch')}</snapSwitch>
                                            <msgPushSwitch>${data.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                                            <buzzerSwitch>${data.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                                            <popVideoSwitch>${data.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                                            <emailSwitch>${data.trigger.includes('emailSwitch')}</emailSwitch>
                                            <sysAudio id='${data.sysAudio}'></sysAudio>
                                        </trigger>
                                    </${type}>
                                `
                            })
                            .join('')}
                    </chl>
                </content>
            `
            openLoading()
            const result = await editIntelAreaConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (peaData.value.areaCfgData[peaData.value.activityType].detectionEnable) {
                    peaData.value.areaCfgData.perimeter.originalEnable = true
                    peaData.value.areaCfgData.entry.originalEnable = true
                    peaData.value.areaCfgData.leave.originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                // setPeaOcxData()
                peaRefreshInitPage()
                nextTick(() => {
                    peaData.value.applyDisable = true
                })
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                }
            }
        }

        // 执行保存pea数据
        const handlePeaApply = async () => {
            if (!verification()) return
            const data = peaData.value.areaCfgData[peaData.value.activityType]
            checkMutexChl({
                isChange: data.detectionEnable && data.detectionEnable !== data.originalEnable,
                mutexList: data.mutexList,
                mutexListEx: data.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_SIMPLE_INVADE_DETECT_TIPS',
            }).then(() => {
                savePeaData()
            })
        }

        // 获取区域
        const getRegion = (index: number, element: XmlElement, region: { X1: number; Y1: number; X2: number; Y2: number }) => {
            const $ = queryXml(element.element)
            if (index === 0) {
                region.X1 = $('X').text().num()
                region.Y1 = $('Y').text().num()
            }

            if (index === 1) {
                region.X2 = $('X').text().num()
            }

            if (index === 2) {
                region.Y2 = $('Y').text().num()
            }
        }

        // 获取矩形区域点列表
        const getRegionPoints = (points: { X1: number; Y1: number; X2: number; Y2: number }) => {
            const pointList = []
            pointList.push({ X: points.X1, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y2, isClosed: true })
            pointList.push({ X: points.X1, Y: points.Y2, isClosed: true })
            return pointList
        }

        // pea检验区域合法性
        const verification = () => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            if (!peaData.value.currentRegulation) {
                const allRegionList: { X: number; Y: number; isClosed?: boolean }[][] = []
                const type = peaData.value.activityType
                const boundaryInfoList = peaData.value.areaCfgData[type].boundaryInfo
                boundaryInfoList.forEach((ele) => {
                    allRegionList.push(ele.point)
                })
                for (const i in allRegionList) {
                    const count = allRegionList[i].length
                    if (count > 0 && count < 4) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                        })
                        return false
                    } else if (count > 0 && !peaDrawer.judgeAreaCanBeClosed(allRegionList[i])) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_INTERSECT'),
                        })
                        return false
                    }
                }
            }
            return true
        }

        // pea tab点击事件
        const handlePeaFunctionTabClick = (pane: TabsPaneContext) => {
            peaData.value.peaFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (peaData.value.peaFunction === 'pea_param') {
                const type = peaData.value.activityType
                const area = peaData.value.chosenWarnAreaIndex
                const boundaryInfo = peaData.value.areaCfgData[type].boundaryInfo
                if (peamode.value === 'h5') {
                    peaDrawer.setEnable(true)
                    setPeaOcxData()
                } else {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetPeaArea(boundaryInfo[area].point, peaData.value.currentRegulation)
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                    }, 100)
                }

                if (peaData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
            } else if (peaData.value.peaFunction === 'pea_target') {
                showAllPeaArea(false)
                if (peamode.value === 'h5') {
                    peaDrawer.clear()
                    peaDrawer.setEnable(false)
                } else {
                    setTimeout(() => {
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
            const type = peaData.value.activityType
            if (peaData.value.currentRegulation) {
                // 画矩形
                const regionInfoList = peaData.value.areaCfgData[type].regionInfo
                regionInfoList.forEach((ele, idx) => {
                    if (ele.X1 || ele.Y1 || ele.X2 || ele.Y2) {
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
            peaData.value.initComplete = false
            const pageTimer = setTimeout(async () => {
                // 临时方案-NVRUSS44-79（页面快速切换时。。。）
                const peaPlugin = peaplayerRef.value?.plugin

                peaData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportPea ? 'IPC' : 'NVR')
                await getPeaData()
                peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activityType].regulation
                peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                peaRefreshInitPage()
                peaData.value.initComplete = true
                if (props.chlData.supportAutoTrack) {
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

        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList = holdTimeList.map((ele) => {
                const element = Number(ele)
                const itemText = getTranslateForSecond(element)
                return {
                    value: element,
                    label: itemText,
                }
            })

            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }

        // pea执行是否显示全部区域
        const handlePeaShowAllAreaChange = () => {
            peaDrawer && peaDrawer.setEnableShowAll(peaData.value.isShowAllArea)
            showAllPeaArea(peaData.value.isShowAllArea)
        }

        // pea切换区域活动操作
        const handleAreaActiveChange = () => {
            if (peaData.value.areaActive === 'perimeter') {
                peaData.value.activityType = 'perimeter'
                peaData.value.directionDisable = true
            } else {
                peaData.value.activityType = peaData.value.directionList[0].value
                peaData.value.direction = peaData.value.directionList[0].value
                peaData.value.directionDisable = false
            }
            // 初始化区域活动的数据
            peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activityType].regulation
            peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            peaRefreshInitPage()
            setPeaOcxData()
        }

        // pea切换方向操作
        const handlePeaDirectionChange = () => {
            peaData.value.activityType = peaData.value.direction
            // 初始化区域活动的数据
            peaData.value.currentRegulation = peaData.value.areaCfgData[peaData.value.activityType].regulation
            peaData.value.currAreaType = peaData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            peaRefreshInitPage()
            setPeaOcxData()
        }

        // pea选择警戒区域
        const handleWarnAreaChange = () => {
            // peaData.value.chosenWarnAreaIndex = index
            setPeaOcxData()
        }

        // 通用获取云台锁定状态
        const getPTZLockStatus = async () => {
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
            `
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                peaData.value.lockStatus = $('content/chl/param/PTZLock').text().bool()
            }
        }

        // 通用修改云台锁定状态
        const editLockStatus = () => {
            const sendXML = rawXml`
                <content>
                    <chl id='${props.currChlId}'>
                        <param>
                            <PTZLock>${!peaData.value.lockStatus}</PTZLock>
                        </param>
                    </chl>
                </content>
            `
            openLoading()
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    closeLoading()
                    peaData.value.lockStatus = !peaData.value.lockStatus
                    peaData.value.lockStatus = !peaData.value.lockStatus
                }
            })
        }

        // pea
        // pea绘图
        const peaChange = (
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
        ) => {
            const type = peaData.value.activityType
            const area = peaData.value.chosenWarnAreaIndex
            if (peaData.value.areaCfgData[type].regulation) {
                if (!Array.isArray(points)) {
                    peaData.value.areaCfgData[type].boundaryInfo[area].point = getRegionPoints(points)
                    peaData.value.areaCfgData[type].regionInfo[area] = points
                }
            } else {
                if (Array.isArray(points)) {
                    peaData.value.areaCfgData[type].boundaryInfo[area].point = points
                }
            }

            if (peaData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            peaRefreshInitPage()
        }

        // pea是否显示所有区域
        const showAllPeaArea = (isShowAll: boolean) => {
            peaDrawer && peaDrawer.setEnableShowAll(isShowAll)
            if (isShowAll) {
                const type = peaData.value.activityType
                const index = peaData.value.chosenWarnAreaIndex
                if (peaData.value.currentRegulation) {
                    // 画矩形
                    const regionInfoList = peaData.value.areaCfgData[type].regionInfo
                    if (peamode.value === 'h5') {
                        peaDrawer.setCurrAreaIndex(index, peaData.value.currAreaType)
                        peaDrawer.drawAllRegion(regionInfoList, index)
                    } else {
                        const pluginRegionInfoList = cloneDeep(regionInfoList)
                        pluginRegionInfoList.splice(index, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                        const sendXML = OCX_XML_SetAllArea({ regionInfoList: pluginRegionInfoList }, 'Rectangle', 'TYPE_PEA_DETECTION', undefined, true)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                } else {
                    // 画点
                    const boundaryInfo: { X: number; Y: number; isClosed?: boolean }[][] = []
                    const boundaryInfoList = peaData.value.areaCfgData[type].boundaryInfo
                    boundaryInfoList.forEach((ele, idx) => {
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
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PEA_DETECTION', undefined, false)
                        if (sendXML) {
                            peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }
                // setPeaOcxData()
            }
        }

        // pea显示
        const setPeaOcxData = () => {
            const type = peaData.value.activityType
            const area = peaData.value.chosenWarnAreaIndex
            const boundaryInfo = peaData.value.areaCfgData[type].boundaryInfo
            const regionInfo = peaData.value.areaCfgData[type].regionInfo
            if (boundaryInfo.length) {
                if (peamode.value === 'h5') {
                    peaDrawer.setCurrAreaIndex(area, peaData.value.currAreaType)
                    if (peaData.value.currentRegulation) {
                        // 画矩形
                        peaDrawer.setArea(regionInfo[area])
                    } else {
                        // 画点
                        peaDrawer.setPointList(boundaryInfo[area].point, true)
                    }
                } else {
                    const sendXML = OCX_XML_SetPeaArea(boundaryInfo[area].point, peaData.value.currentRegulation)
                    if (sendXML) {
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            }

            if (peaData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
        }

        // 区域关闭
        const peaClosePath = (
            points: {
                X: number
                Y: number
                isClosed?: boolean
            }[],
        ) => {
            const currType = peaData.value.activityType
            const area = peaData.value.chosenWarnAreaIndex
            peaData.value.areaCfgData[currType].boundaryInfo[area].point = points
            peaData.value.areaCfgData[currType].boundaryInfo[area].point.forEach((ele) => {
                ele.isClosed = true
            })
        }

        // 提示区域关闭
        const peaForceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }

        // 清空当前区域对话框
        const peaClearCurrentArea = () => {
            const currType = peaData.value.activityType
            const area = peaData.value.chosenWarnAreaIndex
            // const length = cloneDeep(peaData.value.areaCfgData[currType]['boundaryInfo'][area]['point'].length)
            // if (length == 6) {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                peaData.value.areaCfgData[currType].boundaryInfo[area].point = []
                if (peamode.value === 'h5') {
                    peaDrawer && peaDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    if (sendXML) {
                        peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
                peaData.value.areaCfgData[currType].boundaryInfo[area].configured = false
                if (peaData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
            })
            // }
        }

        // 清空当前区域按钮
        const peaClearCurrentAreaBtn = () => {
            const currType = peaData.value.activityType
            const area = peaData.value.chosenWarnAreaIndex
            peaData.value.areaCfgData[currType].boundaryInfo[area].point = []
            peaData.value.areaCfgData[currType].boundaryInfo[area].configured = false
            peaData.value.areaCfgData[currType].regionInfo[area] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
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
        }

        // 清空所有区域
        const clearAllPeaArea = () => {
            const type = peaData.value.activityType
            const regionInfoList = peaData.value.areaCfgData[type].regionInfo
            const boundaryInfoList = peaData.value.areaCfgData[type].boundaryInfo
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
        }

        const notify = ($: (path: string) => XmlResult) => {
            // 区域入侵
            if ($('statenotify[@type="PeaArea"]').length) {
                if ($('statenotify/points').length) {
                    const currType = peaData.value.activityType
                    const points = $('statenotify/points/item').map((element) => {
                        const X = element.attr('X').num()
                        const Y = element.attr('Y').num()
                        return { X, Y }
                    })
                    const area = peaData.value.chosenWarnAreaIndex
                    if (peaData.value.currentRegulation) {
                        peaData.value.areaCfgData[currType].boundaryInfo[area].point = points
                        peaData.value.areaCfgData[currType].regionInfo[area] = {
                            X1: points[0].X,
                            Y1: points[0].Y,
                            X2: points[1].X,
                            Y2: points[2].Y,
                        }
                    } else {
                        peaData.value.areaCfgData[currType].boundaryInfo[area].point = points
                    }
                    peaRefreshInitPage()
                }

                const errorCode = $('statenotify/errorCode').text().num()
                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    peaClearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                }
            }
        }

        watch(
            () => peaData.value.areaCfgData,
            () => {
                if (peaData.value.initComplete) {
                    peaData.value.applyDisable = false
                }
            },
            {
                deep: true,
            },
        )

        onMounted(async () => {
            await getScheduleList()
            await initPageData()
        })

        onBeforeUnmount(() => {
            if (peaPlugin?.IsPluginAvailable() && peamode.value === 'ocx' && peaReady.value) {
                const sendAreaXML = OCX_XML_SetPeaAreaAction('NONE')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                if (peaData.value.currentRegulation) {
                    // 画矩形
                    const sendAllAreaXML = OCX_XML_SetAllArea({ regionInfoList: [] }, 'Rectangle', 'TYPE_PEA_DETECTION', undefined, false)
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendAllAreaXML!)
                } else {
                    // 画点
                    const sendAllAreaXML = OCX_XML_SetAllArea({ detectAreaInfo: undefined }, 'IrregularPolygon', 'TYPE_PEA_DETECTION', undefined, false)
                    peaPlugin.GetVideoPlugin().ExecuteCmd(sendAllAreaXML!)
                }
                const sendXML = OCX_XML_StopPreview('ALL')
                peaPlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (peamode.value === 'h5') {
                peaPlayer.destroy()
            }
        })

        return {
            peaData,
            peaplayerRef,
            notify,
            peahandlePlayerReady,
            setPeaSpeed,
            handleSchedulePopClose,
            handlePeaApply,
            handlePeaFunctionTabClick,
            handlePeaShowAllAreaChange,
            handleAreaActiveChange,
            handlePeaDirectionChange,
            handleWarnAreaChange,
            editLockStatus,
            peaClearCurrentAreaBtn,
            clearAllPeaArea,
            areaType,
            ScheduleManagPop,
            ChannelPtzCtrlPanel,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
            AlarmBaseResourceData,
        }
    },
})
