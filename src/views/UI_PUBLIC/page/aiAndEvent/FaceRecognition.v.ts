/*
 * @Description: AI 事件——人脸识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-28 13:42:09
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-29 17:29:56
 */
import { cloneDeep } from 'lodash-es'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type FaceChlItem, type AIResource, FaceDetection, type PresetList, FaceMatch, type FaceGroupTableItem, FaceCompare, type CompareTask } from '@/types/apiType/aiAndEvent'
import { type TabPaneName, type CheckboxValueType } from 'element-plus'
import CanvasVfd from '@/utils/canvas/canvasVfd'
import SuccessfulRecognition from './SuccessfulRecognition.vue'
import { type XmlResult } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        SuccessfulRecognition,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const router = useRouter()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform
        const Plugin = inject('Plugin') as PluginType

        const playerRef = ref<PlayerInstance>()
        // ai资源弹窗
        const AIResourcePopOpen = ref(false)
        // 高级设置
        const advancedVisible = ref(false)
        // 侦测页的数据
        const faceDetectionData = ref(new FaceDetection())
        // 常规联动
        const normalParamCheckAll = ref(false)
        const normalParamCheckList = ref([] as string[])

        /* 
        人脸识别——识别参数
         */
        const taskTabs = ref([] as SelectOption<string, string>[])
        //nameId的取值为0,1,2,3;0为默认的识别成功和陌生人类型，添加的项取值不可能为0
        const defaultNameId = [1, 2, 3]
        let haveUseNameId = [] as Number[]
        // 人脸分组数据，初始化后不会改变
        const faceGroupNameMap = {} as Record<string, string>
        let faceGroupData = [] as { guid: string; name: string }[]
        // 人脸匹配数据
        const faceMatchData = ref(new FaceMatch())
        const faceGroupTable = ref<FaceGroupTableItem[]>([])
        // 人脸识别数据
        const faceCompareData = ref(new FaceCompare())
        // 相似度下拉框
        const similarityRef = ref()

        // 需要用到的系统配置
        const supportFaceMatch = systemCaps.supportFaceMatch
        const showAIReourceDetail = systemCaps.showAIReourceDetail
        const localFaceDectEnabled = systemCaps.localFaceDectMaxCount != 0
        const faceMatchLimitMaxChlNum = systemCaps.faceMatchLimitMaxChlNum
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        const AISwitch = systemCaps.AISwitch

        const EVENT_TYPE_MAPPING: Record<string, string> = {
            faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
            faceMatch: Translate('IDCS_FACE_RECOGNITION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            perimeter: Translate('IDCS_INVADE_DETECTION'),
        }

        const closeTip = getAlarmEventList()

        const normalParamList = ref([
            { value: 'catchSnapSwitch', label: Translate('IDCS_SNAP') },
            { value: 'msgPushSwitch', label: Translate('IDCS_PUSH') },
            { value: 'buzzerSwitch', label: Translate('IDCS_BUZZER') },
            { value: 'popVideoSwitch', label: Translate('IDCS_VIDEO_POPUP') },
            { value: 'emailSwitch', label: Translate('IDCS_EMAIL') },
            // 在满足条件后添加到列表中
            // { value: 'triggerAudio', label: 'IPC_' + Translate('IDCS_AUDIO') },
            // { value: 'triggerWhiteLight', label: 'IPC_' + Translate('IDCS_LIGHT') },
        ])

        // 通道列表，存储通道的相关数据
        const chlList: Record<string, FaceChlItem> = {}

        // 侦测tab项下的界面数据
        const detectionPageData = ref({
            // '启用IPC/NVR侦测'
            deviceInfo: '',
            // 默认进入参数配置tab项
            detectionTab: 'param',
            // 参数设置右侧（除排程外）是否展示
            isParamRightShow: false,
            // 联动方式是否展示
            isLinkageShow: false,
            // 显示范围框是否选中
            isDispalyRangeChecked: false,
            // 播放器下的清空和提示是否展示
            isPlayerBottomShow: false,
            // 高级选项是否展示
            isMoreWrapShow: true,
            // 存储原图是否选中
            isSaveSourcePicChecked: false,
            // 存储目标图是否选中
            isSaveFacePicChecked: false,
            // 存储是否可用
            isSavePicDisabled: false,
            snapList: [] as SelectOption<string, string>[],
            // 抓图次数是否选中
            isSnapNumberChecked: false,
            // 抓图次数
            snapNumber: '',
            // 抓图次数是否可用
            isSnapNumberDisabled: false,
            // 人脸曝光
            faceExpDisabled: false,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
        })

        // 识别tab项下的界面数据
        const comparePageData = ref({
            // 默认进入参数配置tab项
            compareTab: 'hit',
            // tab项‘param’，‘hit’，‘miss’不可被移除，移除btn不可用
            removeDisabled: true,
            // 相似度默认值
            similarityNumber: 75,
            // 当前选中tab的任务数据
            taskData: {} as CompareTask,

            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
        })

        // 整体的通用界面数据
        const pageData = ref({
            curChl: '',
            faceChlList: [] as Record<string, string>[],
            // 当前选择的tab项
            faceTab: 'faceDetection',
            faceDetectionDisabled: false,
            faceCompareDisabled: false,
            faceLibraryDisabled: false,
            isFaceCompareShow: true,
            isFaceLibraryShow: true,
            // AI资源占比
            resourceOccupancy: '',
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            // 通知列表
            notification: [] as string[],
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            // record穿梭框数据源
            recordList: [] as SelectOption<string, string>[],
            recordIsShow: false,
            // alarmOut穿梭框数据源
            alarmOutList: [] as SelectOption<string, string>[],
            alarmOutIsShow: false,
            // 抓图数据源
            snapList: [] as SelectOption<string, string>[],
            notChlSupport: false,
            notSupportTip: '',
        })

        // 联动预置点
        const MAX_TRIGGER_PRESET_COUNT = 16
        const PresetTableData = ref<PresetList[]>([])

        // AI资源详情弹窗table数据
        const AIResourceTableData = ref<AIResource[]>([])
        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        // vfd人脸侦测绘制的Canvas
        let vfdDrawer: CanvasVfd
        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
                const canvas = player.getDrawbordCanvas(0)
                vfdDrawer = new CanvasVfd({
                    el: canvas,
                    onchange: (area: { X1: number; Y1: number; X2: number; Y2: number }) => {
                        faceDetectionData.value.regionInfo = [area]
                    },
                })
            }

            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }

                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'VfdConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const chlData = chlList[pageData.value.curChl]
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.curChl,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [chlData.id],
                    //     chlNameList: [chlData.name],
                    //     streamType: 'sub',
                    //     // chl没有index属性
                    //     chlIndexList: ['0'],
                    //     chlTypeList: [chlData.chlType],
                    // })
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(pageData.value.curChl, chlList[pageData.value.curChl].name)
                }
            }
            // 通道和tab切换时直接绘制失效，将绘制改成微任务执行
            setTimeout(() => {
                setCurrChlView('vfdArea')
            }, 0)
            if (chlData.supportVfd) {
                // 设置视频区域可编辑
                if (mode.value === 'h5') {
                    vfdDrawer.setEnable(true)
                } else {
                    const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            } else {
                // 设置视频区域不可编辑
                if (mode.value === 'h5') {
                    vfdDrawer.setEnable(false)
                } else {
                    const sendXML = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        // 获取AI资源列表数据
        const getAIResourceData = async (isEdit: boolean) => {
            let sendXml = ''
            if (isEdit) {
                let eventType = ''
                let enabledSwitch = ''
                if (pageData.value.faceTab == 'faceDetection') {
                    eventType = 'faceDetect'
                    enabledSwitch = faceDetectionData.value.enabledSwitch ? 'true' : 'false'
                } else if (pageData.value.faceTab == 'faceCompare') {
                    eventType = 'faceMatch'
                    enabledSwitch = faceMatchData.value.hitEnable || faceMatchData.value.notHitEnable ? 'true' : 'false'
                }
                sendXml += rawXml`
                    <content>
                        <chl>
                            <item id='${pageData.value.curChl}'>
                                <eventType>${eventType}</eventType>
                                <switch>${enabledSwitch}</switch>
                            </item>
                        </chl>
                    </content>
                `
            }
            const result = await queryAIResourceDetail(sendXml)
            commLoadResponseHandler(result, ($) => {
                const tempResourceOccupancy = $('//content/totalResourceOccupancy').text()
                if (Number(tempResourceOccupancy) <= 100) {
                    AIResourceTableData.value = []
                    $('//content/chl/item').forEach((item) => {
                        pageData.value.resourceOccupancy = ': ' + tempResourceOccupancy + '%'

                        const $item = queryXml(item.element)
                        const id = item.attr('id')!
                        let name = $item('name').text()
                        const connectState = $item('connectState').text() == 'true' // 通道是否在线
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'
                        $item('resource/item').forEach((element) => {
                            const eventType = element.attr('eventType')?.split(',') || []
                            const eventTypeMap = eventType.map((item) => EVENT_TYPE_MAPPING[item])
                            // 解码资源文本的判断
                            const decodeResource = element.attr('occupyDecodeCapPercent')!
                            let decodeResourceText = ''
                            if (!decodeResource) {
                                decodeResourceText = '--'
                            } else if (Number(decodeResource) > 0) {
                                decodeResourceText = decodeResource + '%'
                            } else if (decodeResource == 'notEnough') {
                                decodeResourceText = Translate('IDCS_NO_DECODE_RESOURCE')
                            }

                            AIResourceTableData.value.push({
                                id,
                                name,
                                eventType,
                                eventTypeText: eventTypeMap.join('+'),
                                percent: element.text(),
                                decodeResource,
                                decodeResourceText,
                            })
                        })
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_NO_RESOURCE'),
                    })
                    if (pageData.value.faceTab == 'faceDetection') {
                        faceDetectionData.value.enabledSwitch = false
                    } else if (pageData.value.faceTab == 'faceCompare') {
                        faceMatchData.value.hitEnable = false
                        faceMatchData.value.notHitEnable = false
                    }
                }
            })
        }

        // 处理抓图选项
        const getSnapOptions = () => {
            const snapIntervalArr = [300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 120000, 240000, 360000, 480000, 600000]
            detectionPageData.value.snapList = snapIntervalArr.map((item) => {
                let label = ''
                if (item / 1000 <= 60) {
                    label = getTranslateForSecond(item / 1000)
                } else {
                    label = getTranslateForMin(item / 1000 / 60)
                }
                return {
                    value: item.toString(),
                    label,
                }
            })
        }

        // 获取声音列表数据
        const getVoiceList = async () => {
            pageData.value.voiceList = await buildAudioList()
        }

        // 获取录像数据
        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        // 获取报警输出数据
        const getAlarmOutData = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        // 获取抓图数据
        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        // 获取通道及相关配置数据
        const getChlData = async () => {
            // 获取在线通道列表
            const onlineChlList = [] as string[]
            const result = await queryOnlineChlList()
            commLoadResponseHandler(result, ($) => {
                $('//content/item').forEach((item) => {
                    onlineChlList.push(item.attr('id')!)
                })
            })
            getChlList({
                requireField: ['ip', 'supportVfd', 'supportAudioAlarmOut', 'supportFire', 'supportWhiteLightAlarmOut', 'supportTemperature'],
            }).then((result: any) => {
                commLoadResponseHandler(result, async ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        if (factoryName === 'Recorder') return
                        const curChlId = item.attr('id')!
                        if (protocolType !== 'RTSP' && onlineChlList.includes(curChlId)) {
                            const supportVfd = $item('supportVfd').text() == 'true'
                            const supportFire = $item('supportFire').text() == 'true'
                            const supportTemperature = $item('supportTemperature').text() == 'true'
                            let supportBackVfd = false
                            if (localFaceDectEnabled) {
                                // 支持人脸后侦测且人脸前侦测为false，才算支持人脸后侦测
                                supportBackVfd = !supportVfd
                            }

                            // 热成像通道（火点检测/温度检测）不支持后侦测
                            if (supportFire || supportTemperature) {
                                supportBackVfd = false
                            }

                            // 当前没有选中任何通道的情况下，初始化为第一个支持人脸识别的通道
                            if (!pageData.value.curChl) {
                                if (supportVfd || supportBackVfd) {
                                    pageData.value.curChl = curChlId
                                }
                            }
                            const name = $item('name').text()
                            chlList[curChlId] = {
                                id: curChlId,
                                name,
                                ip: $item('ip').text(),
                                chlType: $item('chlType').text(),
                                accessType: $item('accessType').text(),
                                supportVfd,
                                supportBackVfd,
                                supportAudio: $item('supportAudioAlarmOut').text() == 'true',
                                supportWhiteLight: $item('supportWhiteLightAlarmOut').text() == 'true',
                                showAIReourceDetail,
                                faceMatchLimitMaxChlNum,
                            }
                            pageData.value.faceChlList.push({
                                value: curChlId,
                                label: name,
                            })
                        }
                    })
                }).then(async () => {
                    if (history.state.chlId) {
                        if (chlList[history.state.chlId]) {
                            pageData.value.curChl = history.state.chlId
                        }
                        delete history.state.chlId
                    }
                    if (!pageData.value.curChl) pageData.value.curChl = pageData.value.faceChlList[0].value
                    handleCurrChlData(chlList[pageData.value.curChl])
                    // 在获取到通道数据后再请求通道的侦测数据
                    await getFaceDetectionData()
                    // 初始化完成
                    detectionPageData.value.initComplated = true
                    // 请求人脸识别的数据
                    await getFaceGroupData()
                })
            })
        }

        // 处理通道数据
        const handleCurrChlData = (data: FaceChlItem) => {
            pageData.value.faceDetectionDisabled = !(data.supportVfd || data.supportBackVfd)
            pageData.value.faceCompareDisabled = !(data.supportVfd || (data.supportBackVfd && supportFaceMatch))
            if (AISwitch) {
                pageData.value.faceCompareDisabled = false
                pageData.value.faceLibraryDisabled = false
            } else if (!supportFaceMatch) {
                pageData.value.isFaceCompareShow = false
                pageData.value.isFaceLibraryShow = false
            }

            if (!(data.supportVfd || data.supportBackVfd)) {
                pageData.value.faceTab = ''
                pageData.value.notChlSupport = true
                pageData.value.notSupportTip = Translate('IDCS_FACE_EVENT_UNSUPORT_TIP')
            } else {
                pageData.value.faceTab = 'faceDetection'
            }
        }

        // 通道发生改变时刷新数据
        const chlChange = async () => {
            pageData.value.faceTab = 'faceDetection'
            detectionPageData.value.detectionTab = 'param'
            // 识别页切换为识别成功，-禁用
            comparePageData.value.compareTab = 'hit'
            comparePageData.value.removeDisabled = true
            pageData.value.notChlSupport = false
            handleCurrChlData(chlList[pageData.value.curChl])
            // 更换通道时清空上一个通道的数据
            faceDetectionData.value = {} as FaceDetection
            faceCompareData.value = {} as FaceCompare
            faceGroupData = []
            haveUseNameId = []
            detectionPageData.value.initComplated = false
            comparePageData.value.initComplated = false
            detectionPageData.value.applyDisabled = true
            comparePageData.value.applyDisabled = true
            // 获取改变后的通道数据
            await getFaceDetectionData()
            await getPresetData()
            // 初始化完成
            detectionPageData.value.initComplated = true
            await getFaceGroupData()
            // 播放器
            if (mode.value === 'h5') {
                vfdDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            dispalyRangeChange(false)
            play()
        }

        // 获取侦测页的数据
        const getFaceDetectionData = async () => {
            const chlData = chlList[pageData.value.curChl]
            if (chlData.supportVfd) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlData.id}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                        <trigger/>
                    </requireField>
                `
                const result = await queryVfd(sendXml)
                commLoadResponseHandler(result, async ($) => {
                    const param = $('//content/chl/param')
                    const $param = queryXml(param[0].element)
                    const enabledSwitch = $param('switch').text() == 'true'
                    let holdTimeArr = $param('holdTimeNote').text().split(',')
                    const holdTime = $param('holdTime').text()
                    if (!holdTimeArr.includes(holdTime)) {
                        holdTimeArr.push(holdTime)
                        holdTimeArr = holdTimeArr.sort((a, b) => Number(a) - Number(b))
                    }
                    const holdTimeList = holdTimeArr.map((item) => {
                        const label = getTranslateForSecond(Number(item))
                        return {
                            value: item,
                            label,
                        }
                    })
                    const regionInfo = $param('regionInfo/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            X1: Number($item('X1').text()),
                            Y1: Number($item('Y1').text()),
                            X2: Number($item('X2').text()),
                            Y2: Number($item('Y2').text()),
                        }
                    })
                    const mutexList = $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return { object: $item('object').text(), status: $item('status').text() == 'true' }
                    })
                    const mutexListEx = $param('mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return { object: $item('object').text(), status: $item('status').text() == 'true' }
                    })
                    const trigger = $('//content/chl/trigger')
                    const $trigger = queryXml(trigger[0].element)
                    const record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })
                    const alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })
                    const preset = $trigger('preset/presets/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            index: $item('index').text(),
                            name: $item('name').text(),
                            chl: {
                                value: $item('chl').attr('id')!,
                                label: $item('chl').text(),
                            },
                        }
                    })
                    faceDetectionData.value = {
                        enabledSwitch,
                        originalSwitch: enabledSwitch,
                        holdTime,
                        holdTimeList,
                        regionInfo,
                        mutexList,
                        mutexListEx,
                        saveFacePicture: $param('saveFacePicture').text(),
                        saveSourcePicture: $param('saveSourcePicture').text(),
                        snapInterval: $param('senceMode/customize/intervalTime').text(),
                        captureCycle: $param('senceMode/customize/captureCycle').text(),
                        minFaceFrame: Number($param('minFaceFrame').text()),
                        minRegionInfo: [],
                        maxFaceFrame: Number($param('maxFaceFrame').text()),
                        maxRegionInfo: [],
                        triggerAudio: $param('triggerAudio').text(),
                        triggerWhiteLight: $param('triggerWhiteLight').text(),
                        faceExpSwitch: $param('faceExp/switch').text() == 'true',
                        faceExpStrength: Number($param('senceMode/customize/faceExpStrength').text()),
                        schedule: $('//content/chl').attr('scheduleGuid'),
                        record,
                        alarmOut,
                        preset,
                        msgPushSwitch: $trigger('msgPushSwitch').text() == 'true',
                        buzzerSwitch: $trigger('buzzerSwitch').text() == 'true',
                        popVideoSwitch: $trigger('popVideoSwitch').text() == 'true',
                        emailSwitch: $trigger('emailSwitch').text() == 'true',
                        catchSnapSwitch: $trigger('snapSwitch').text() == 'true',
                        sysAudio: $trigger('sysAudio').attr('id'),
                    }
                })
            } else {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlData.id}</chlId>
                    </condition>
                `
                const result = await queryBackFaceMatch(sendXml)
                const $ = queryXml(result)
                $('//content/param/chls/item').forEach((item) => {
                    if (item.attr('guid') == pageData.value.curChl) {
                        const $item = queryXml(item.element)
                        const enabledSwitch = $item('switch').text() == 'true'
                        faceDetectionData.value.enabledSwitch = enabledSwitch
                        faceDetectionData.value.originalSwitch = enabledSwitch
                        faceDetectionData.value.mutexList = $item('mutexList/item').map((item) => {
                            const $item = queryXml(item.element)
                            return { object: $item('object').text(), status: $item('status').text() == 'true' }
                        })
                        faceDetectionData.value.schedule = item.attr('scheduleGuid')!
                    }
                })
            }
            handleFaceDetectionData()
        }

        // 处理人脸侦测数据，判断元素的显示、禁用等
        const handleFaceDetectionData = () => {
            const chlData = chlList[pageData.value.curChl]
            detectionPageData.value.deviceInfo = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(chlData.supportVfd ? 'IPC' : 'NVR')
            if (chlData.supportVfd) {
                detectionPageData.value.isParamRightShow = true
                detectionPageData.value.isLinkageShow = true
                detectionPageData.value.isDispalyRangeChecked = false
                detectionPageData.value.isPlayerBottomShow = true
                detectionPageData.value.isMoreWrapShow = true
                // 这里faceDetectionData.value.saveSourcePicture为字符串，"false"判断为真
                if (faceDetectionData.value.saveSourcePicture) {
                    // 将存储原图/目标图是否选中给到pagedata与元素绑定
                    detectionPageData.value.isSaveSourcePicChecked = faceDetectionData.value.saveSourcePicture == 'true'
                    detectionPageData.value.isSaveFacePicChecked = faceDetectionData.value.saveFacePicture == 'true'
                    detectionPageData.value.isSavePicDisabled = false
                } else {
                    detectionPageData.value.isSavePicDisabled = true
                }

                if (faceDetectionData.value.snapInterval == '') {
                    detectionPageData.value.isSnapNumberChecked = false
                } else {
                    const checked = faceDetectionData.value.captureCycle != '65535' // true自定义可输入1-65534，false显示“无限制”，值为65535
                    if (!checked) faceDetectionData.value.captureCycle = '3' // 防止返回值是65535时，是“无限制”状态，值取默认值3
                    detectionPageData.value.snapNumber = checked ? faceDetectionData.value.captureCycle : Translate('IDCS_NO_LIMITED')
                    detectionPageData.value.isSnapNumberDisabled = !checked
                    detectionPageData.value.isSnapNumberChecked = checked
                }
                // 先判断人脸曝光是否为空，确定是否禁用，再赋给其默认值50
                detectionPageData.value.faceExpDisabled = faceDetectionData.value.faceExpStrength == 0
                faceDetectionData.value.faceExpStrength = faceDetectionData.value.faceExpStrength || 50
                // 常规联动相关选项
                if (faceDetectionData.value.triggerAudio && chlData.supportAudio && normalParamList.value.findIndex((item) => item.value == 'triggerAudio') == -1) {
                    normalParamList.value.push({ value: 'triggerAudio', label: 'IPC_' + Translate('IDCS_AUDIO') })
                    if (faceDetectionData.value.triggerAudio == 'true') normalParamCheckList.value.push('triggerAudio')
                }

                if (faceDetectionData.value.triggerWhiteLight && chlData.supportWhiteLight && normalParamList.value.findIndex((item) => item.value == 'triggerWhiteLight') == -1) {
                    normalParamList.value.push({ value: 'triggerWhiteLight', label: 'IPC_' + Translate('IDCS_LIGHT') })
                    if (faceDetectionData.value.triggerWhiteLight == 'true') normalParamCheckList.value.push('triggerWhiteLight')
                }
                if (faceDetectionData.value.catchSnapSwitch) normalParamCheckList.value.push('catchSnapSwitch')
                if (faceDetectionData.value.msgPushSwitch) normalParamCheckList.value.push('msgPushSwitch')
                if (faceDetectionData.value.buzzerSwitch) normalParamCheckList.value.push('buzzerSwitch')
                if (faceDetectionData.value.popVideoSwitch) normalParamCheckList.value.push('popVideoSwitch')
                if (faceDetectionData.value.emailSwitch) normalParamCheckList.value.push('emailSwitch')
                if (normalParamCheckList.value.length == normalParamList.value.length) {
                    normalParamCheckAll.value = true
                }
            } else {
                detectionPageData.value.isParamRightShow = false
                detectionPageData.value.isLinkageShow = false
                detectionPageData.value.isPlayerBottomShow = false
                detectionPageData.value.isMoreWrapShow = false
            }
            setCurrChlView('vfdArea')
        }

        // 当前通道play上的视图
        const setCurrChlView = (type: string) => {
            if (type == 'vfdArea') {
                if (faceDetectionData.value.regionInfo && faceDetectionData.value.regionInfo.length > 0) {
                    if (mode.value === 'h5') {
                        vfdDrawer.setArea(faceDetectionData.value.regionInfo[0])
                    } else {
                        const sendXML = OCX_XML_SetVfdArea(faceDetectionData.value.regionInfo[0], type, '#00ff00', 'TYPE_VFD_BLOCK')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else if (type == 'faceMax') {
                if (mode.value === 'h5') {
                    vfdDrawer.setRangeMax(faceDetectionData.value.maxRegionInfo[0])
                } else {
                    const sendXML = OCX_XML_SetVfdArea(faceDetectionData.value.maxRegionInfo[0], type, '#00ff00', 'TYPE_VFD_BLOCK')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            } else if (type == 'faceMin') {
                if (mode.value === 'h5') {
                    vfdDrawer.setRangeMin(faceDetectionData.value.minRegionInfo[0])
                } else {
                    const sendXML = OCX_XML_SetVfdArea(faceDetectionData.value.minRegionInfo[0], type, '#00ff00', 'TYPE_VFD_BLOCK')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        // 计算位置
        const calcRegionInfo = (percent: number) => {
            const X1 = ((100 - percent) * 10000) / 100 / 2
            const X2 = ((100 - percent) * 10000) / 100 / 2 + (percent * 10000) / 100
            const Y1 = ((100 - percent) * 10000) / 100 / 2
            const Y2 = ((100 - percent) * 10000) / 100 / 2 + (percent * 10000) / 100
            const regionInfo = {
                X1: X1,
                Y1: Y1,
                X2: X2,
                Y2: Y2,
            }
            return regionInfo
        }

        // 启用侦测的checkbox
        const enabledSwitchChange = () => {
            if (!chlList[pageData.value.curChl].supportVfd) {
                getAIResourceData(true)
            }
        }

        // 原图checkbox
        const saveSourcePicChange = (value: CheckboxValueType) => {
            // saveSourcePicture属性被用于判断其是否禁用，接收为string类型，这里手动赋值
            faceDetectionData.value.saveSourcePicture = value ? 'true' : 'false'
        }

        // 目标图checkbox
        const saveFacePicChange = (value: CheckboxValueType) => {
            faceDetectionData.value.saveFacePicture = value ? 'true' : 'false'
        }

        // 抓图次数
        const snapNumberCheckChange = (value: CheckboxValueType) => {
            // 全部采用!value确保CheckboxValueType为boolean
            if (!value) faceDetectionData.value.captureCycle = '3'
            detectionPageData.value.snapNumber = !value ? Translate('IDCS_NO_LIMITED') : faceDetectionData.value.captureCycle
            detectionPageData.value.isSnapNumberDisabled = !value
        }

        // 人脸最大小值范围
        const minFaceBlur = () => {
            const min = Number(faceDetectionData.value.minFaceFrame)
            const max = Number(faceDetectionData.value.maxFaceFrame)
            if (min > max) {
                faceDetectionData.value.minFaceFrame = faceDetectionData.value.maxFaceFrame
            }
            if (min < 3) faceDetectionData.value.minFaceFrame = 3
            if (min > 50) faceDetectionData.value.minFaceFrame = 50
            if (detectionPageData.value.isDispalyRangeChecked) {
                // 绘制最小框
                const minRegionInfo = calcRegionInfo(faceDetectionData.value.minFaceFrame)
                faceDetectionData.value.minRegionInfo = []
                faceDetectionData.value.minRegionInfo.push(minRegionInfo)
                setCurrChlView('faceMin')
            }
        }

        const maxFaceBlur = () => {
            const min = Number(faceDetectionData.value.minFaceFrame)
            const max = Number(faceDetectionData.value.maxFaceFrame)
            if (max < min) {
                faceDetectionData.value.maxFaceFrame = faceDetectionData.value.minFaceFrame
            }
            if (max < 3) faceDetectionData.value.maxFaceFrame = 3
            if (max > 50) faceDetectionData.value.maxFaceFrame = 50
            if (detectionPageData.value.isDispalyRangeChecked) {
                // 绘制最大框
                const maxRegionInfo = calcRegionInfo(faceDetectionData.value.maxFaceFrame)
                faceDetectionData.value.maxRegionInfo = []
                faceDetectionData.value.maxRegionInfo.push(maxRegionInfo)
                setCurrChlView('faceMax')
            }
        }

        // 是否显示范围框
        const dispalyRangeChange = (value: CheckboxValueType) => {
            if (value) {
                // 显示范围框
                const minRegionInfo = calcRegionInfo(faceDetectionData.value.minFaceFrame)
                faceDetectionData.value.minRegionInfo = []
                faceDetectionData.value.minRegionInfo.push(minRegionInfo)
                setCurrChlView('faceMin')
                const maxRegionInfo = calcRegionInfo(faceDetectionData.value.maxFaceFrame)
                faceDetectionData.value.maxRegionInfo = []
                faceDetectionData.value.maxRegionInfo.push(maxRegionInfo)
                setCurrChlView('faceMax')
                if (mode.value === 'h5') {
                    vfdDrawer.toggleRange(true)
                }
            } else {
                if (mode.value === 'h5') {
                    vfdDrawer.toggleRange(false)
                } else {
                    const sendFaceMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.GetVideoPlugin().ExecuteCmd(sendFaceMinXML)
                    const sendFaceMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.GetVideoPlugin().ExecuteCmd(sendFaceMaxXML)
                }
            }
        }

        const clearDrawArea = () => {
            if (mode.value === 'h5') {
                vfdDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            faceDetectionData.value.regionInfo = [{ X1: 0, Y1: 0, X2: 0, Y2: 0 }]
        }

        const faceTabChange = async (name: TabPaneName) => {
            if (name == 'faceDetection') {
                play()
            } else if (name == 'faceLibrary') {
                if (import.meta.env.VITE_UI_TYPE === 'UI2-A') {
                    router.push({
                        path: '/config/alarm/faceFeature',
                        state: {
                            backChlId: pageData.value.curChl,
                        },
                    })
                } else {
                    router.push({
                        path: '/intelligent-analysis/sample-data-base/sample-data-base-face',
                        state: {
                            backChlId: pageData.value.curChl,
                        },
                    })
                }
            }
        }

        const detectionTabChange = (name: TabPaneName) => {
            if (name == 'param') {
                play()
            }
        }

        // 打开AI资源弹窗
        const openAIResourcePop = () => {
            AIResourcePopOpen.value = true
        }

        // 删除AI资源行数据
        const handleDelAIResource = async (row: AIResource) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(async () => {
                let sendXml = rawXml`
                <content>
                    <chl id='${row.id}'>
                        <param>`
                row.eventType.forEach((item) => {
                    sendXml += `<item>${item}</item>`
                })
                sendXml += rawXml`</param>
                    </chl>
                </content>
                `

                const result = await freeAIOccupyResource(sendXml)
                commLoadResponseHandler(result, async () => {
                    await getAIResourceData(false)
                    await getChlData()
                })
            })
        }

        // 常规联动多选
        const handleNormalParamCheckAll = (value: CheckboxValueType) => {
            normalParamCheckList.value = value ? normalParamList.value.map((item) => item.value) : []
            if (value) {
                faceDetectionData.value.catchSnapSwitch = true
                faceDetectionData.value.msgPushSwitch = true
                faceDetectionData.value.buzzerSwitch = true
                faceDetectionData.value.popVideoSwitch = true
                faceDetectionData.value.emailSwitch = true
                normalParamList.value.forEach((item) => {
                    if (item.value == 'triggerAudio') {
                        faceDetectionData.value.triggerAudio = 'true'
                    } else if (item.value == 'triggerWhiteLight') {
                        faceDetectionData.value.triggerWhiteLight = 'true'
                    }
                })
            }
        }

        const handleNormalParamCheck = (value: CheckboxValueType[]) => {
            normalParamCheckAll.value = value.length === normalParamList.value.length
            faceDetectionData.value.catchSnapSwitch = value.includes('catchSnapSwitch')
            faceDetectionData.value.msgPushSwitch = value.includes('msgPushSwitch')
            faceDetectionData.value.buzzerSwitch = value.includes('buzzerSwitch')
            faceDetectionData.value.popVideoSwitch = value.includes('popVideoSwitch')
            faceDetectionData.value.emailSwitch = value.includes('emailSwitch')
            normalParamList.value.forEach((item) => {
                if (item.value == 'triggerAudio') {
                    faceDetectionData.value.triggerAudio = value.includes('triggerAudio') ? 'true' : 'false'
                } else if (item.value == 'triggerWhiteLight') {
                    faceDetectionData.value.triggerWhiteLight = value.includes('triggerWhiteLight') ? 'true' : 'false'
                }
            })
        }

        // 录像配置相关处理
        const recordConfirm = (e: SelectOption<string, string>[]) => {
            faceDetectionData.value.record = cloneDeep(e)
            pageData.value.recordIsShow = false
        }

        const recordClose = () => {
            pageData.value.recordIsShow = false
        }

        // 报警输出相关处理
        const alarmOutConfirm = (e: SelectOption<string, string>[]) => {
            faceDetectionData.value.alarmOut = cloneDeep(e)
            pageData.value.alarmOutIsShow = false
        }

        const alarmOutClose = () => {
            pageData.value.alarmOutIsShow = false
        }

        // 获取联动预置点数据
        const getPresetData = async () => {
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
                        isGetPresetList: false,
                    }
                })
                rowData.forEach((row) => {
                    faceDetectionData.value.preset?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                            row.presetList.push({ value: item.index, label: item.name })
                        }
                    })
                })
                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    }
                }
                PresetTableData.value = rowData
            })
        }

        // 预置点选择框下拉时获取预置点列表数据
        const getPresetById = async (row: PresetList) => {
            if (!row.isGetPresetList) {
                row.presetList.splice(1)
                const sendXml = rawXml`
                    <condition>
                        <chlId>${row.id}</chlId>
                    </condition>
                `
                const result = await queryChlPresetList(sendXml)
                commLoadResponseHandler(result, ($) => {
                    $('//content/presets/item').forEach((item) => {
                        row.presetList.push({
                            value: item.attr('index')!,
                            label: item.text(),
                        })
                    })
                })
                row.isGetPresetList = true
            }
        }

        const presetChange = (row: PresetList) => {
            const ids = faceDetectionData.value.preset.map((item) => item.chl.value)
            if (ids.includes(row.id)) {
                faceDetectionData.value.preset = faceDetectionData.value.preset.filter((item) => row.id != item.chl.value)
            }

            if (row.preset.value !== '') {
                faceDetectionData.value.preset.push({
                    index: row.preset.value,
                    name: row.preset.label,
                    chl: {
                        value: row.id,
                        label: row.name,
                    },
                })
            }

            if (faceDetectionData.value.preset.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            }
        }

        // 获取互斥通道名称
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList = []
            const chlData = chlList[pageData.value.curChl]
            for (const item in chlList) {
                if (chlList[item].ip == chlData.ip) {
                    sameIPChlList.push(chlList[item])
                }
            }

            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl.accessType == '1') {
                        thermalChlName = chl.name == chlData.name ? '' : chl.name
                    } else {
                        normalChlName = chl.name == chlData.name ? '' : chl.name
                    }
                })
            }
            return {
                normalChlName,
                thermalChlName,
            }
        }

        // 提交人脸侦测数据
        const applyFaceDetectionData = () => {
            let isSwitchChange = false
            const switchChangeTypeArr: string[] = []
            if (faceDetectionData.value.enabledSwitch && faceDetectionData.value.enabledSwitch != faceDetectionData.value.originalSwitch) {
                isSwitchChange = true
            }
            const mutexChlNameObj = getMutexChlNameObj()
            faceDetectionData.value.mutexList?.forEach((item) => {
                if (item.status) {
                    const prefixName = mutexChlNameObj.normalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.normalChlName) : ''
                    const showInfo = prefixName ? prefixName + closeTip[item.object].toLowerCase() : closeTip[item.object]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            faceDetectionData.value.mutexListEx?.forEach((item) => {
                if (item.status) {
                    const prefixName = mutexChlNameObj.thermalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.thermalChlName) : ''
                    const showInfo = prefixName ? prefixName + closeTip[item.object].toLowerCase() : closeTip[item.object]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SIMPLE_FACE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + chlList[pageData.value.curChl].name, switchChangeType),
                }).then(() => {
                    chlList[pageData.value.curChl].supportVfd ? setFaceDetectionData() : setFaceDetectionBackUpData()
                })
            } else {
                chlList[pageData.value.curChl].supportVfd ? setFaceDetectionData() : setFaceDetectionBackUpData()
            }
        }

        const getFaceDetectionSaveData = () => {
            const chlData = chlList[pageData.value.curChl]
            let sendXml = rawXml``
            const captureCycle = !detectionPageData.value.isSnapNumberChecked ? 65535 : faceDetectionData.value.captureCycle
            sendXml += rawXml`<content>
            <chl id='${pageData.value.curChl}' scheduleGuid='${faceDetectionData.value.schedule}'><param>
            <switch>${String(faceDetectionData.value.enabledSwitch)}</switch>
            <holdTime>${faceDetectionData.value.holdTime}</holdTime>
            `
            if (faceDetectionData.value.saveFacePicture) {
                sendXml += rawXml`<saveFacePicture>${faceDetectionData.value.saveFacePicture}</saveFacePicture>`
            }

            if (faceDetectionData.value.saveSourcePicture) {
                sendXml += rawXml`<saveSourcePicture>${faceDetectionData.value.saveSourcePicture}</saveSourcePicture>`
            }

            if (faceDetectionData.value.snapInterval) {
                sendXml += rawXml`<senceMode>
                        <Mode>customize</Mode>
                        <customize>
                        <intervalTime>${faceDetectionData.value.snapInterval}</intervalTime>
                        <captureCycle>${String(captureCycle)}</captureCycle>
                        </customize>
                        </senceMode>
                `
            }

            if (faceDetectionData.value.minFaceFrame) {
                sendXml += rawXml`<minFaceFrame>${String(faceDetectionData.value.minFaceFrame)}</minFaceFrame>`
            }

            if (faceDetectionData.value.maxFaceFrame) {
                sendXml += rawXml`<maxFaceFrame>${String(faceDetectionData.value.maxFaceFrame)}</maxFaceFrame>`
            }

            if (faceDetectionData.value.triggerAudio && chlData.supportAudio) {
                sendXml += rawXml`<triggerAudio>${faceDetectionData.value.triggerAudio}</triggerAudio>`
            }

            if (faceDetectionData.value.triggerWhiteLight && chlData.supportWhiteLight) {
                sendXml += rawXml`<triggerWhiteLight>${faceDetectionData.value.triggerWhiteLight}</triggerWhiteLight>`
            }

            if (faceDetectionData.value.faceExpStrength) {
                sendXml += rawXml`<faceExp><switch>${String(faceDetectionData.value.faceExpSwitch)}</switch>
                <faceExpStrength>${String(faceDetectionData.value.faceExpStrength)}</faceExpStrength></faceExp>`
            }
            sendXml += `<regionInfo type='list'>`
            faceDetectionData.value.regionInfo.forEach((item) => {
                sendXml += rawXml`<item>
                    <X1>${String(item.X1)}</X1>
                    <Y1>${String(item.Y1)}</Y1>
                    <X2>${String(item.X2)}</X2>
                    <Y2>${String(item.Y2)}</Y2>
                    </item>
                `
            })
            sendXml += rawXml`</regionInfo>
                </param>
                <trigger>
                    <sysRec>
                        <chls type='list'>
            `
            faceDetectionData.value.record.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                    <![CDATA[${item.label}]]></item>`
            })
            sendXml += rawXml`</chls></sysRec>
                <alarmOut>
                <alarmOuts type='list'>`
            faceDetectionData.value.alarmOut.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                    <![CDATA[${item.label}]]></item>`
            })
            sendXml += rawXml`</alarmOuts>
                </alarmOut>
                <preset>
                <presets type='list'>`
            faceDetectionData.value.preset.forEach((item) => {
                sendXml += rawXml`<item>
                        <index>${item.index}</index>
                        <name><![CDATA[${item.name}]]></name>
                        <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
                        </item>`
            })
            sendXml += rawXml`</presets>
                </preset>
                <snapSwitch>${String(faceDetectionData.value.catchSnapSwitch)}</snapSwitch>
                <msgPushSwitch>${String(faceDetectionData.value.msgPushSwitch)}</msgPushSwitch>
                <buzzerSwitch>${String(faceDetectionData.value.buzzerSwitch)}</buzzerSwitch>
                <popVideoSwitch>${String(faceDetectionData.value.popVideoSwitch)}</popVideoSwitch>
                <emailSwitch>${String(faceDetectionData.value.emailSwitch)}</emailSwitch>
                <sysAudio id='${faceDetectionData.value.sysAudio}'></sysAudio>
                </trigger>
                </chl></content>`
            return sendXml
        }

        const setFaceDetectionData = async () => {
            const sendXml = getFaceDetectionSaveData()
            openLoading()
            await editVfd(sendXml)
            closeLoading()
            if (faceDetectionData.value.enabledSwitch) {
                faceDetectionData.value.originalSwitch = true
            }
            detectionPageData.value.applyDisabled = true
        }

        const setFaceDetectionBackUpData = async () => {
            const sendXml = rawXml`
                <content>
                    <param>
                        <chls>
                            <item guid='${pageData.value.curChl}' scheduleGuid='${faceDetectionData.value.schedule}'>
                                <switch>${String(faceDetectionData.value.enabledSwitch)}</switch>
                            </item>
                        </chls>
                    </param>
                </content>
            `
            openLoading()
            await editRealFaceMatch(sendXml)
            closeLoading()
            detectionPageData.value.applyDisabled = true
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.faceChlList.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        /* 
        人脸识别——识别
        */
        // 添加任务项
        const addTask = () => {
            // 默认有识别成功、陌生人两项，添加的最多为3项
            if (taskTabs.value.length === 5) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return false
            }
            const nameId = defaultNameId.find((item) => !haveUseNameId.includes(item))!
            haveUseNameId.push(nameId)
            taskTabs.value.push({ value: 'hit' + nameId, label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + nameId })
            comparePageData.value.compareTab = 'hit' + nameId
            comparePageData.value.removeDisabled = false
            faceCompareData.value.task.push({
                guid: '',
                id: '',
                ruleType: 'hit',
                pluseSwitch: false,
                groupId: [],
                nameId: nameId,
                hintword: '',
                sysAudio: DEFAULT_EMPTY_ID,
                schedule: DEFAULT_EMPTY_ID,
                record: [{ value: pageData.value.curChl, label: chlList[pageData.value.curChl].name }], //添加的任务默认联动本通道
                alarmOut: [],
                snap: [],
                preset: [],
                msgPushSwitch: true,
                buzzerSwitch: false,
                popVideoSwitch: false,
                emailSwitch: false,
                popMsgSwitch: false,
            })
        }

        // 移除任务项
        const removeTask = () => {
            if (comparePageData.value.removeDisabled) {
                return false
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                haveUseNameId = haveUseNameId.filter((item) => item != Number(comparePageData.value.compareTab[3]))
                taskTabs.value = taskTabs.value.filter((item) => item.value != comparePageData.value.compareTab)
                faceCompareData.value.task = faceCompareData.value.task.filter((item) => {
                    if (item.ruleType == 'hit' && item.nameId == Number(comparePageData.value.compareTab[3])) {
                        if (item.guid) {
                            deleteFaceCompareData(item)
                        }
                    } else {
                        return item
                    }
                })
                comparePageData.value.compareTab = 'hit'
                comparePageData.value.removeDisabled = true
            })
        }

        const compareTabChange = (name: TabPaneName) => {
            if (name == 'param' || name == 'hit' || name == 'miss') {
                comparePageData.value.removeDisabled = true
            } else {
                comparePageData.value.removeDisabled = false
            }
        }

        // 获取人脸分组数据
        const getFaceGroupData = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            commLoadResponseHandler(result, ($) => {
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const guid = item.attr('id')!
                    let name = $item('name').text()
                    const groupId = $item('groupId').text()
                    if (!name) {
                        if (groupId == '1' || groupId == '2') {
                            name = Translate('IDCS_WHITE_LIST') + groupId
                        } else if (groupId == '3') {
                            name = Translate('IDCS_BLACK_LIST')
                        }
                    }
                    const enableAlarmSwitch = $item('enableAlarmSwitch').text() == 'true'
                    faceGroupNameMap[guid] = name
                    if (enableAlarmSwitch) {
                        faceGroupData.push({
                            guid: guid,
                            name: name,
                        })
                    }
                })
            }).then(async () => {
                await getFaceMatchData()
                await getFaceCompareData()
                comparePageData.value.initComplated = true
            })
        }

        // 获取参数设置数据
        const getFaceMatchData = async () => {
            const sendXml = rawXml`
            <condition><chlId>${pageData.value.curChl}</chlId></condition>
            `
            const result = await queryFaceMatchConfig(sendXml)
            commLoadResponseHandler(result, ($) => {
                const hitEnable = $('//content/chl/hitEnable').text() == 'true'
                const notHitEnable = $('//content/chl/notHitEnable').text() == 'true'
                const liveDisplaySwitch = $('//content/chl/liveDisplaySwitch').text() == 'true'
                const groupInfo = [] as FaceGroupTableItem[]
                $('//content/chl/groupId/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const guid = item.attr('guid')!
                    const similarity = Number($item('similarity').text())
                    const name = faceGroupNameMap[guid]
                    groupInfo.push({
                        guid: guid,
                        name: name,
                        similarity: similarity,
                    })
                })
                faceGroupTable.value = cloneDeep(groupInfo)
                faceMatchData.value = {
                    hitEnable: hitEnable,
                    notHitEnable: notHitEnable,
                    liveDisplaySwitch: !liveDisplaySwitch,
                    groupInfo: groupInfo,
                    editFlag: false,
                }
            })
        }

        // 相似度
        const similarityChangeAll = () => {
            faceGroupTable.value.forEach((item) => {
                item.similarity = comparePageData.value.similarityNumber
            })
            faceMatchData.value.groupInfo.forEach((item) => {
                item.similarity = comparePageData.value.similarityNumber
            })
            similarityRef.value.handleClose()
        }

        const similarityInputBlur = (e: any, index: number) => {
            // vue的v-model是监听input框的input事件生效的
            // 事件对象e.target.value赋值直接操作dom元素 vue的v-model监听不到
            // e.target.value赋值后 需要手动触发input事件 v-model才能同步更新
            // dispatchEvent(new Event(‘input’))
            if (e.target.value < 1) {
                e.target.value = 1
                e.target.dispatchEvent(new Event('input'))
            } else if (e.target.value > 100) {
                e.target.value = 100
                e.target.dispatchEvent(new Event('input'))
            }

            if (index != undefined) {
                faceMatchData.value.groupInfo[index].similarity = e.target.value
            }
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
        }

        // 提交人脸匹配数据
        const setFaceMatchData = async () => {
            let sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                    <hitEnable>${String(faceMatchData.value.hitEnable)}</hitEnable>
                    <notHitEnable>${String(faceMatchData.value.notHitEnable)}</notHitEnable>
                    <liveDisplaySwitch>${String(!faceMatchData.value.liveDisplaySwitch)}</liveDisplaySwitch>
                    <groupId>
            `
            faceMatchData.value.groupInfo.forEach((item) => {
                sendXml += rawXml`
                            <item guid='${item.guid}'>
                                <similarity>${String(item.similarity)}</similarity>
                            </item>`
            })
            sendXml += `</groupId></chl></content>`
            openLoading()
            const result = await editFaceMatchConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()

            if ($('//status').text() !== 'success') {
                const errorCode = Number($('//errorCode').text())
                if (errorCode == ErrorCode.USER_ERROR_LIMITED_PLATFORM_VERSION_MISMATCH) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_MAX_CHANNEL_LIMIT').formatForLang(faceMatchLimitMaxChlNum),
                    })
                } else if (errorCode === ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_MAX_CHANNEL_LIMIT').formatForLang(faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_ENABLE') + 'AI'),
                    }).then(async () => {
                        //AISwitch 打开AI模式开关 NT-9997
                        const sendXml = rawXml`
                            <content>
                                <AISwitch>true</AISwitch>
                            </content>
                        `
                        await editBasicCfg(sendXml)
                    })
                }
            }
            comparePageData.value.applyDisabled = true
        }

        // 获取人脸识别数据
        const getFaceCompareData = async () => {
            taskTabs.value = []
            faceCompareData.value.task = []
            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.curChl}</chlId>
                </condition>
            `
            const result = await queryFaceMatchAlarmParam(sendXml)
            commLoadResponseHandler(result, ($) => {
                faceCompareData.value.voiceList = [{ value: '', label: Translate('IDCS_NULL') }]
                $('//content/voiceItem/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    faceCompareData.value.voiceList.push({
                        value: $item('filePath').text(),
                        label: $item('name').text(),
                    })
                })
                $('//content/chl/task/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const nameId = Number($item('param/nameId').text())
                    haveUseNameId.push(nameId)
                    const groupId = $item('param/groupId/item').map((item) => item.attr('guid')!)
                    const record = $item('trigger/sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })
                    const alarmOut = $item('trigger/alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })
                    const snap = $item('trigger/sysSnap/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })
                    const preset = $item('trigger/preset/presets/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            index: $item('index').text(),
                            name: $item('name').text(),
                            chl: {
                                value: $item('chl').attr('id')!,
                                label: $item('chl').text(),
                            },
                        }
                    })
                    faceCompareData.value.task.push({
                        guid: item.attr('guid')!,
                        id: item.attr('id')!,
                        ruleType: $item('param/ruleType').text(),
                        nameId,
                        pluseSwitch: $item('param/pluseSwitch').text() == 'true',
                        groupId,
                        hintword: $item('param/hint/word').text(),
                        schedule: $item('schedule').attr('id'),
                        record,
                        alarmOut,
                        snap,
                        preset,
                        msgPushSwitch: $item('trigger/msgPushSwitch').text() == 'true',
                        buzzerSwitch: $item('trigger/buzzerSwitch').text() == 'true',
                        popVideoSwitch: $item('trigger/popVideoSwitch').text() == 'true',
                        emailSwitch: $item('trigger/emailSwitch').text() == 'true',
                        popMsgSwitch: $item('trigger/popMsgSwitch').text() == 'true',
                        sysAudio: $item('trigger/sysAudio').attr('id'),
                    })
                })
            }).then(() => {
                faceCompareData.value.task.forEach((item) => {
                    if (item.ruleType == 'hit' && item.nameId == 0) {
                        taskTabs.value.push({
                            value: 'hit',
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                        })
                        comparePageData.value.taskData = item
                    } else if (item.ruleType == 'miss' && item.nameId == 0) {
                        taskTabs.value.push({
                            value: 'miss',
                            label: Translate('IDCS_GROUP_STRANGER'),
                        })
                    } else {
                        taskTabs.value.push({
                            value: 'hit' + item.nameId,
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + item.nameId,
                        })
                    }
                })
            })
        }

        // tab项对应的识别数据
        const compareLinkData = (value: string) => {
            let taskData = {} as CompareTask
            if (value == 'hit') {
                taskData = faceCompareData.value.task?.[0]
            } else if (value == 'miss') {
                taskData = faceCompareData.value.task?.[1]
            } else {
                faceCompareData.value.task?.forEach((item) => {
                    if (item.nameId == Number(value[3])) {
                        taskData = item
                    }
                })
            }
            return taskData
        }

        const getFaceCompareSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            ${faceCompareData.value.task
                                .map((item) => {
                                    return rawXml`
                                        <item guid='${item.guid}' id='${item.id}'>
                                            <param>
                                                <ruleType>${item.ruleType}</ruleType>
                                                <pluseSwitch>${String(item.pluseSwitch)}</pluseSwitch>
                                                <nameId>${String(item.nameId)}</nameId>
                                                <groupId>
                                                    ${item.groupId.map((ele) => `<item guid='${ele}'></item>`).join('')}
                                                </groupId>
                                                <hint>
                                                    <word>${item.hintword}</word>
                                                </hint>
                                            </param>
                                            <schedule id='${item.schedule}'></schedule>
                                            <trigger>
                                                <sysAudio id='${item.sysAudio}'></sysAudio>
                                                <buzzerSwitch>${String(item.buzzerSwitch)}</buzzerSwitch>
                                                <popMsgSwitch>${String(item.popMsgSwitch)}</popMsgSwitch>
                                                <emailSwitch>${String(item.emailSwitch)}</emailSwitch>
                                                <msgPushSwitch>${String(item.msgPushSwitch)}</msgPushSwitch>
                                                <popVideo><switch>${String(item.popVideoSwitch)}</switch><chls><item id='${pageData.value.curChl}'></item></chls></popVideo>
                                                <alarmOut>
                                                    <switch>true</switch>
                                                    <alarmOuts type='list'>
                                                        ${item.alarmOut.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </alarmOuts>
                                                </alarmOut>
                                                <preset>
                                                    <switch>${item.preset.length == 0 ? 'false' : 'true'}</switch>
                                                    <presets type='list'>
                                                        ${item.preset
                                                            .map((ele) => {
                                                                return rawXml`
                                                                    <item>
                                                                        <index>${ele.index}</index>
                                                                        <name><![CDATA[${ele.name}]]></name>
                                                                        <chl id='${ele.chl.value}'><![CDATA[${ele.chl.label}]]></chl>
                                                                    </item>
                                                                `
                                                            })
                                                            .join('')}
                                                    </presets>
                                                </preset>
                                                <sysRec>
                                                    <switch>true</switch>
                                                    <chls type='list'>
                                                        ${item.record.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </chls>
                                                </sysRec>
                                                <sysSnap>
                                                    <switch>true</switch>
                                                    <chls type='list'>
                                                        ${item.snap.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </chls>
                                                </sysSnap>
                                            </trigger>
                                        </item>
                                    `
                                })
                                .join('')}
                        </task>
                    </chl>
                </content>
            `
            return sendXml
        }

        const setFaceCompareData = async () => {
            const sendXml = getFaceCompareSaveData()
            openLoading()
            await editFaceMatchAlarmParam(sendXml)
            closeLoading()
            comparePageData.value.compareTab = 'hit'
            comparePageData.value.applyDisabled = true
        }

        const deleteFaceCompareData = async (data: CompareTask) => {
            const sendXml = rawXml`
                <condition>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            <item id='${data.id}' guid='${data.guid}'></item>
                        </task>
                    </chl>
                </condition>`
            await deleteFaceMatchAlarmParam(sendXml)
        }

        const applyFaceCompareData = async () => {
            // 识别中监听faceMatchData和faceCompareData两个数据
            if (faceMatchData.value.editFlag) {
                await setFaceMatchData()
            }

            if (faceCompareData.value.editFlag) {
                await setFaceCompareData()
            }
        }

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            const $xmlNote = $("statenotify[@type='VfdArea']")
            if ($xmlNote.length > 0) {
                const points = [] as { X1: number; Y1: number; X2: number; Y2: number }[]
                $('/statenotify/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    points.push({ X1: Number($item('X1').text()), Y1: Number($item('Y1').text()), X2: Number($item('X2').text()), Y2: Number($item('Y2').text()) })
                })
                faceDetectionData.value.regionInfo = points
            }
        }

        onMounted(async () => {
            if (mode.value != 'h5') {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
            getSnapOptions()
            openLoading()
            if (showAIReourceDetail) {
                await getAIResourceData(false)
            }

            if (supportAlarmAudioConfig) {
                await getVoiceList()
            }
            pageData.value.scheduleList = await buildScheduleList()
            await getRecordList()
            await getAlarmOutData()
            await getSnapList()
            await getPresetData()
            await getChlData()
            closeLoading()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                Plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                plugin.GetVideoPlugin().ExecuteCmd(sendMaxXML)
                const sendMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                plugin.GetVideoPlugin().ExecuteCmd(sendMinXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value == 'h5') {
                vfdDrawer.destroy()
            }
        })

        watch(
            faceDetectionData,
            () => {
                if (detectionPageData.value.initComplated) {
                    detectionPageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )
        watch(
            faceMatchData,
            () => {
                if (comparePageData.value.initComplated) {
                    faceMatchData.value.editFlag = true
                    comparePageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )
        watch(
            faceCompareData,
            () => {
                if (comparePageData.value.initComplated) {
                    faceCompareData.value.editFlag = true
                    comparePageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            // 识别成功界面
            SuccessfulRecognition,
            ScheduleManagPop,
            detectionPageData,
            pageData,
            // ai资源table数据
            AIResourceTableData,
            // 人脸侦测数据
            faceDetectionData,
            // 是否显示语音提示性项
            supportAlarmAudioConfig,
            // 是否支持人脸比对
            supportFaceMatch,
            showAIReourceDetail,
            getAIResourceData,
            playerRef,
            // tab项
            faceTabChange,
            detectionTabChange,
            // ai资源弹窗
            AIResourcePopOpen,
            // AI资源弹窗
            openAIResourcePop,
            handleDelAIResource,
            // 高级设置
            advancedVisible,
            // 改变通道
            chlChange,
            // 启用
            enabledSwitchChange,
            // 存储
            saveSourcePicChange,
            saveFacePicChange,
            // 抓拍次数的checkbox
            snapNumberCheckChange,
            // 人脸最大小范围
            minFaceBlur,
            maxFaceBlur,
            // 显示范围框
            dispalyRangeChange,
            // 清空绘制区域
            clearDrawArea,
            // 常规联动
            normalParamList,
            normalParamCheckAll,
            handleNormalParamCheckAll,
            normalParamCheckList,
            handleNormalParamCheck,
            // 录像
            recordConfirm,
            recordClose,
            // 报警输出
            alarmOutConfirm,
            alarmOutClose,
            // 联动预置点
            PresetTableData,
            presetChange,
            getPresetById,
            // 提交人脸侦测数据
            applyFaceDetectionData,

            handlePlayerReady,

            /* 人脸识别——识别 */
            taskTabs,
            // 相似度下拉框
            similarityRef,
            // 人脸匹配
            faceMatchData,
            // 人脸分组数据
            faceGroupData,
            // 人脸分组表格
            faceGroupTable,
            // 识别页面数据
            comparePageData,
            // 增加/删除任务
            addTask,
            removeTask,
            // 人脸识别tab项切换
            compareTabChange,
            // 人脸分组表格——相似度
            similarityChangeAll,
            // 相似度中的输入框失焦
            similarityInputBlur,
            // 按下回车键失焦
            enterBlur,
            // 人脸识别项切换
            compareLinkData,
            // 提交人脸识别数据
            applyFaceCompareData,
        }
    },
})
