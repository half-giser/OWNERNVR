/*
 * @Description: AI 事件——车牌识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-09 09:56:33
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-25 09:42:09
 */
import { ArrowDown } from '@element-plus/icons-vue'
// import { cloneDeep } from 'lodash'
import { type CompareTask, VehicleDetection, type VehicleChlItem, VehicleCompare } from '@/types/apiType/aiAndEvent'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { type TabPaneName } from 'element-plus'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import SuccessfulRecognition from './SuccessfulRecognition.vue'
import { type CanvasBasePoint } from '@/utils/canvas/canvasBase'
import { type XmlResult } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        ArrowDown,
        SuccessfulRecognition,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const router = useRouter()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform
        const Plugin = inject('Plugin') as PluginType
        type CanvasAreaType = 'regionArea' | 'maskArea'

        const supportPlateMatch = systemCaps.supportPlateMatch

        // 通道列表，存储通道的相关数据
        const chlList: Record<string, VehicleChlItem> = {}

        // 高级设置box
        const advancedVisible = ref(false)
        // 播放器
        const playerRef = ref<PlayerInstance>()

        // 侦测页的数据
        const vehicleDetectionData = ref(new VehicleDetection())
        let currentRegulation = true // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
        let currAreaType = 'regionArea' as CanvasAreaType // maskArea屏蔽区域 regionArea矩形侦测区域
        const continentArea = {} as Record<string, string[]> // 各个洲对应的区域
        const continentAreaTrans: Record<string, string> = {
            Asia: Translate('IDCS_AISA'),
            Africa: Translate('IDCS_AFRICA'),
            Europe: Translate('IDCS_EUROPE'),
            SouthAmerica: Translate('IDCS_SOUTH_AMERICA'),
            NorthAmerica: Translate('IDCS_NORTH_AMERICA'),
            Oceania: Translate('IDCS_OCEANIA'),
            SouthAfrica: Translate('IDCS_LOCALITY_SOUTH_AFRICA'),
            India: Translate('IDCS_LOCALITY_INDIA'),
            Russia: Translate('IDCS_LOCALITY_RUSSIA'),
            Poland: Translate('IDCS_LOCALITY_POLAND'),
            Brazil: Translate('IDCS_LOCALITY_PORTUGAL_BRAZIL'),
            Indonesia: Translate('IDCS_LOCALITY_INDONESIA'),
            Australia: Translate('IDCS_LOCALITY_AUSTRALIA'),
            TheUnitedArabEmirates: Translate('IDCS_LOCALITY_UNITED_ARAB_EMIRATES'),
            Vietnam: Translate('IDCS_LOCALITY_VIETNAM'),
            Canada: Translate('IDCS_LOCALITY_FRANCE_CANADA'),
            Italy: Translate('IDCS_LOCALITY_ITALY'),
            Hungary: Translate('IDCS_LOCALITY_HUNGARY'),
            Ukraine: Translate('IDCS_LOCALITY_UKRAINE'),
            Belgium: Translate('IDCS_LOCALITY_GERMAN_BELGIUM'),
            Bulgaria: Translate('IDCS_LOCALITY_BULGARIA'),
            Croatia: Translate('IDCS_LOCALITY_CROATIA'),
            Germany: Translate('IDCS_LOCALITY_GERMAN_GERMANY'),
            Britain: Translate('IDCS_LOCALITY_ENGLISH'),
            Greece: Translate('IDCS_LOCALITY_GREEK_GREECE'),
            Romania: Translate('IDCS_LOCALITY_ROMANIA'),
            Spain: Translate('IDCS_LOCALITY_SPAIN'),
            Serbia: Translate('IDCS_LOCALITY_SERBIA'),
            France: Translate('IDCS_LOCALITY_FRANCE'),
            Turkey: Translate('IDCS_LOCALITY_TURKEY'),
            Uzbekistan: Translate('IDCS_LOCALITY_UZBEKISTAN'),
            Thailand: Translate('IDCS_LOCALITY_THAILAND'),
            ChineseMainland: Translate('IDCS_CHINESE_MAINLAND'),
            'Hong Kong': Translate('IDCS_LOCALITY_CHINA_HONGKONG'),
            Taiwan: Translate('IDCS_LOCALITY_CHINA_TAIWAN'),
            'U.S.A': Translate('IDCS_LOCALITY_AMERICA'),
            Israel: Translate('IDCS_LOCALITY_ISRAEL'),
            Iran: Translate('IDCS_LOCALITY_IRAN'),
            Malaysia: Translate('IDCS_LOCALITY_MALAYSIA'),
            NewZealand: Translate('IDCS_LOCALITY_NEW_ZEALAND'),
            'Asia-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            'Europe-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            'Oceania-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            'NorthAmerica-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            'SouthAmerica-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            'Africa-Other': Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
            Iraq: Translate('IDCS_LOCALITY_IRAQ'),
            Egypt: Translate('IDCS_LOCALITY_EGYPT'),
            Mongolia: Translate('IDCS_LOCALITY_MONGOLIA'),
            Palestinian: Translate('IDCS_LOCALITY_PALESTINE'),
            Korea: Translate('IDCS_LOCALITY_SOUTHKOREA'),
            Mauritius: Translate('IDCS_LOCALITY_MAURITIUS'),
        }
        const directionType: Record<string, string> = {
            noLimit: Translate('IDCS_OVERALL_RECOGNITION'),
            approach: Translate('IDCS_RECOGNITION_APPROACHING'),
            further: Translate('IDCS_RECOGNITION_DRIVING_AWAY'),
        }
        const closeTip: Record<string, string> = {
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
            h264s: Translate('IDCS_VIDEO_ENCT_TYPE_H264_SMART'),
            h265s: Translate('IDCS_VIDEO_ENCT_TYPE_H265_SMART'),
            vehicle: Translate('IDCS_PLATE_DETECTION'),
            fire: Translate('IDCS_FIRE_POINT_DETECTION'),
            vsd: Translate('IDCS_VSD_DETECTION'),
        }

        /* 
        车牌识别——识别参数
         */
        // 车牌识别任务项
        const taskTabs = ref([] as SelectOption<string, string>[])
        //nameId的取值为0,1,2,3;0为默认的识别成功和陌生车牌类型，添加的项取值不可能为0
        const defaultNameId = [1, 2, 3]
        let haveUseNameId = [] as Number[]
        // 车牌分组数据，初始化后不会改变
        const vehicleGroupNameMap = {} as Record<string, string>
        const vehicleGroupData = [] as { guid: string; name: string }[]
        // 车牌识别数据
        const vehicleCompareData = ref(new VehicleCompare())

        // 侦测tab项下的界面数据
        const detectionPageData = ref({
            // 默认进入参数配置tab项
            detectionTab: 'param',
            // 绘图区域下提示信息
            drawAreaTip: '',
            // 是否显示全部区域
            isShowAllArea: false,
            // 侦测区域
            regionArea: 0,
            reginConfiguredArea: [] as boolean[],
            // 屏蔽区域
            maskArea: -1,
            // 初始是否有数据（添加样式）
            maskConfiguredArea: [] as boolean[],
            // 检测区域-洲
            continentValue: '',
            continentDisabled: false,
            continentOption: [] as SelectOption<string, string>[],
            // 检测区域——地区
            plateAreaDisabled: false,
            plateAreaOption: [] as SelectOption<string, string>[],
            // 没有大洲，只有区域时,需要显示区域列表
            noContinentAreaList: [] as string[],
            // 识别模式选项
            directionOption: [] as SelectOption<string, string>[],
            // 识别模式（高级设置）是否显示
            isShowDirection: false,
            // 曝光
            exposureDisabled: false,
            // 车牌曝光最大小值
            exposureMin: 1,
            exposureMax: 50,
            // 抓拍无牌车
            plateAbsenceDisabled: false,
            // minVehicleValue: 1,
            // maxVehicleValue: 50,
            // 车牌大小的form项标题
            plateSizeRangeTitle: '',
            // 显示范围框是否选中
            isDispalyRangeChecked: false,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
        })
        // 识别tab项下的界面数据
        const comparePageData = ref({
            // 默认进入参数配置tab项
            compareTab: 'whitelist',
            removeDisabled: true,
            // 当前选中tab的任务数据
            taskData: {} as CompareTask,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
        })
        // 整体的通用界面数据
        const pageData = ref({
            curChl: '',
            vehicleChlList: [] as Record<string, string>[],
            // 当前选择的tab项
            vehicleTab: 'vehicleDetection',
            vehicleDetectionDisabled: false,
            vehicleCompareDisabled: false,
            vehicleLibraryDisabled: false,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            // 通知列表
            notification: [] as string[],
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            // record数据
            recordList: [] as { value: string; label: string }[],
            // alarmOut数据
            alarmOutList: [] as { value: string; label: string }[],
            // snap数据
            snapList: [] as { value: string; label: string }[],
            notChlSupport: false,
            notSupportTip: '',
        })

        // 获取排程数据
        const getScheduleData = async () => {
            const result = await queryScheduleList()

            commLoadResponseHandler(result, ($) => {
                pageData.value.scheduleList = $('/response/content/item').map((item) => {
                    return {
                        value: item.attr('id')!,
                        label: item.text(),
                    }
                })
            })
            pageData.value.scheduleList.push({
                value: '{00000000-0000-0000-0000-000000000000}',
                label: `<${Translate('IDCS_NULL')}>`,
            })
        }
        // 获取声音列表数据
        const getVoiceList = async () => {
            const result = await queryAlarmAudioCfg()

            commLoadResponseHandler(result, ($) => {
                pageData.value.voiceList = $('/response/content/audioList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id')!,
                        label: $item('name').text(),
                    }
                })
            })
            pageData.value.voiceList.push({ value: '{00000000-0000-0000-0000-000000000000}', label: `<${Translate('IDCS_NULL')}>` })
        }
        // 获取录像数据
        const getRecordList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.recordList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }
        // 获取报警输出数据
        const getAlarmOutData = async () => {
            getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            }).then((result: any) => {
                commLoadResponseHandler(result, ($) => {
                    const rowData = [] as {
                        id: string
                        name: string
                        device: {
                            id: string
                            innerText: string
                        }
                    }[]
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '_' + name
                        }
                        rowData.push({
                            id: item.attr('id')!,
                            name,
                            device: {
                                id: $item('device').attr('id'),
                                innerText: $item('device').text(),
                            },
                        })
                    })
                    pageData.value.alarmOutList = rowData.map((item) => {
                        return {
                            value: item.id,
                            label: item.name,
                        }
                    })
                })
            })
        }
        // 获取抓图数据
        const getSnapList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.snapList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        // 获取通道及相关配置数据
        const getChlData = async () => {
            // 获取在线通道列表
            const onlineChlList = [] as string[]
            const result = await queryOnlineChlList()
            commLoadResponseHandler(result, ($) => {
                $('/response/content/item').forEach((item) => {
                    onlineChlList.push(item.attr('id')!)
                })
            })

            getChlList({
                requireField: ['supportVehiclePlate'],
            }).then((result: any) => {
                commLoadResponseHandler(result, async ($) => {
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        if (factoryName === 'Recorder') return
                        const curChlId = item.attr('id')!
                        if (protocolType !== 'RTSP' && onlineChlList.includes(curChlId)) {
                            const supportVehiclePlate = $item('supportVehiclePlate').text() == 'true'

                            // 当前没有选中任何通道的情况下，初始化为第一个支持车牌识别的通道
                            if (!pageData.value.curChl && supportVehiclePlate) {
                                pageData.value.curChl = curChlId
                            }
                            const name = $item('name').text()
                            chlList[curChlId] = {
                                id: curChlId,
                                name,
                                chlType: $item('chlType').text(),
                                supportVehiclePlate,
                            }
                            pageData.value.vehicleChlList.push({
                                value: curChlId,
                                label: name,
                            })
                        }
                    })
                }).then(async () => {
                    if (!pageData.value.curChl) pageData.value.curChl = onlineChlList[0]
                    handleCurrChlData(chlList[pageData.value.curChl])
                })
            })
        }
        // 处理通道数据
        const handleCurrChlData = async (data: VehicleChlItem) => {
            pageData.value.vehicleDetectionDisabled = !data.supportVehiclePlate
            pageData.value.vehicleCompareDisabled = !data.supportVehiclePlate

            if (!data.supportVehiclePlate) {
                pageData.value.vehicleTab = ''
                pageData.value.notChlSupport = true
                pageData.value.notSupportTip = Translate('IDCS_VEHICLE_EVENT_UNSUPORT_TIP')
            } else {
                // 在获取到通道数据后再请求通道的侦测数据
                await getVehicleDetectionData()
                // 初始化完成
                detectionPageData.value.initComplated = true
                // 请求识别的数据
                await getVehicleGroupData()
            }
        }
        // 通道改变
        const chlChange = () => {
            pageData.value.vehicleTab = 'vehicleDetection'
            comparePageData.value.compareTab = 'whiteline'
            pageData.value.notChlSupport = false
            handleCurrChlData(chlList[pageData.value.curChl])
            play()
        }

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
        // 车牌侦测绘制的Canvas
        let vehicleDrawer: CanvasPolygon
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
                vehicleDrawer = new CanvasPolygon({
                    el: canvas,
                    regulation: currentRegulation,
                    onchange: areaChange,
                    closePath: vehicleClosePath,
                    forceClosePath: vehicleForceClosePath,
                    clearCurrentArea: vehicleClearCurrentArea,
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
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'CddConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }
        // vehicleDrawer初始化时绑定以下函数
        const areaChange = (area: { X1: number; Y1: number; X2: number; Y2: number } | { X: number; Y: number; isClosed?: boolean }[]) => {
            if (currentRegulation) {
                // 检测区域（矩形）
                vehicleDetectionData.value.regionInfo[detectionPageData.value.regionArea] = area as { X1: number; Y1: number; X2: number; Y2: number }
            } else {
                // 屏蔽区域（多边形）
                vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea] = area as { X: number; Y: number; isClosed: boolean }[]
            }
            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }
        const vehicleClosePath = (area: CanvasBasePoint[]) => {
            area.forEach((item) => (item.isClosed = true))
            vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea] = area as { X: number; Y: number; isClosed: boolean }[]
        }
        const vehicleForceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_INTERSECT'),
                    showCancelButton: false,
                })
            }
        }
        const vehicleClearCurrentArea = () => {
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
                showCancelButton: true,
            }).then(() => {
                vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea] = []
                if (mode.value === 'h5') {
                    vehicleDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                if (detectionPageData.value.isShowAllArea) {
                    showAllArea()
                }
            })
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
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [chlData.id],
                        chlNameList: [chlData.name],
                        streamType: 'sub',
                        // chl没有index属性
                        chlIndexList: ['0'],
                        chlTypeList: [chlData.chlType],
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(pageData.value.curChl, chlList[pageData.value.curChl].name)
                }
            }
            // 设置视频区域可编辑
            // 界面内切换tab，调用play时初始化区域
            if (mode.value === 'h5') {
                changeArea()
                setTimeout(() => {
                    setAreaView('regionArea')
                }, 0)
                vehicleDrawer.setEnable(true)
            } else {
                const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }
        // 获取车牌侦测数据
        const getVehicleDetectionData = async () => {
            const sendXml = rawXml`
                <condition><chlId>${pageData.value.curChl}</chlId></condition>
                <requireField><param/></requireField>
                `
            const result = await queryVehicleConfig(sendXml)
            commLoadResponseHandler(result, async ($) => {
                const enabledSwitch = $('/response/content/chl/param/switch').text() == 'true'
                // 洲
                const continentType = $('/response/types/continentType/enum')
                continentType.forEach((item) => {
                    const continent = item.text()
                    continentArea[continent] = []
                })
                detectionPageData.value.continentDisabled = !continentType.text()
                // 区域
                const plateAreaType = $('/response/types/plateAreaType/enum')
                // 没有大洲，只有区域时,需要显示区域列表
                if (!continentType.text() && plateAreaType.text()) {
                    detectionPageData.value.noContinentAreaList = plateAreaType.map((item) => item.text())
                } else {
                    // 存在大洲，存储大洲与区域的对应关系
                    plateAreaType.forEach((item) => {
                        const translate = item.attr('translate')!
                        const continent = item.attr('continent')!
                        const area = item.text()
                        if (continentArea[continent]) {
                            continentArea[continent].push(area)
                        }
                        if (translate) {
                            // continentAreaTrans默认有一套翻译，有translate字段时，优先使用translate
                            continentAreaTrans[area] = translate
                        }
                    })
                }
                detectionPageData.value.plateAreaDisabled = !plateAreaType.text()
                // 识别模式
                const directionOption = $('/response/types/directionType/enum')
                directionOption.forEach((item) => {
                    detectionPageData.value.directionOption.push({
                        value: item.text(),
                        label: directionType[item.text()],
                    })
                })
                const direction = $('/response/content/chl/param/vehicleDirection').text()
                detectionPageData.value.isShowDirection = Boolean(directionOption.text()) || Boolean(direction)
                // 车牌曝光
                const exposure = $('/response/content/chl/param/plateExposure')
                detectionPageData.value.exposureDisabled = !exposure.text()
                const $exposure = queryXml(exposure[0].element)
                const exposureChecked = $exposure('switch').text() === 'true'
                detectionPageData.value.exposureMin = Number($exposure('exposureValue').attr('min'))
                detectionPageData.value.exposureMax = Number($exposure('exposureValue').attr('max'))
                // 抓拍无牌车
                const plateAbsence = $('/response/content/chl/param/capturePlateAbsenceVehicle').text()
                detectionPageData.value.plateAbsenceDisabled = plateAbsence == ''
                // 侦测区域
                const regionInfo = $('/response/content/chl/param/regionInfo/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        X1: Number($item('X1').text()),
                        Y1: Number($item('Y1').text()),
                        X2: Number($item('X2').text()),
                        Y2: Number($item('Y2').text()),
                    }
                })
                // 屏蔽区域
                const maskAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
                $('/response/content/chl/param/maskArea/item').forEach((item, index) => {
                    maskAreaInfo[index] = []
                    const $item = queryXml(item.element)
                    $item('point/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        const maskArea = {
                            X: Number($ele('X').text()),
                            Y: Number($ele('Y').text()),
                            isClosed: true,
                        }
                        maskAreaInfo[index].push(maskArea)
                    })
                })
                const mutexList = $('/response/content/chl/param/mutexList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' }
                })
                // 车牌大小范围
                let plateSize = { minWidth: 0, maxWidth: 0, min: 1, max: 50 }
                $('/response/content/chl/param/plateSize/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    plateSize = {
                        minWidth: Number($item('MinWidth').text()) / 100,
                        maxWidth: Number($item('MaxWidth').text()) / 100,
                        min: Number($item('MinWidth').attr('min')) / 100,
                        max: Number($item('MinWidth').attr('max')) / 100,
                    }
                })
                const minRegion = calcRegionInfo(plateSize.minWidth)
                const minRegionInfo = [minRegion]
                const maxRegion = calcRegionInfo(plateSize.maxWidth)
                const maxRegionInfo = [maxRegion]
                detectionPageData.value.plateSizeRangeTitle = Translate('IDCS_VEHICLE_SIZE_TIP').formatForLang(plateSize.min + '%', plateSize.max + '%')
                vehicleDetectionData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    schedule: $('/response/content/chl').attr('scheduleGuid'),
                    plateSupportArea: $('/response/content/chl/param/plateSupportArea').text(),
                    direction,
                    exposureChecked,
                    exposureValue: Number($exposure('exposureValue').text()),
                    plateAbsenceCheceked: plateAbsence == 'true',
                    regionInfo,
                    maskAreaInfo,
                    mutexList,
                    plateSize,
                    minRegionInfo,
                    maxRegionInfo,
                }
            }).then(() => {
                handleVehicleDetectionData()

                // 设置视频区域可编辑
                // 在获取到数据后绘制
                if (mode.value === 'h5') {
                    changeArea()
                    setAreaView('regionArea')
                    vehicleDrawer.setEnable(true)
                } else {
                    const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            })
        }
        // 处理车牌侦测数据
        const handleVehicleDetectionData = () => {
            detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_RECT_TIP')

            refreshInitPage()

            for (const key in continentArea) {
                if (continentArea[key].includes(vehicleDetectionData.value.plateSupportArea)) {
                    detectionPageData.value.continentValue = key
                }
                detectionPageData.value.continentOption.push({
                    value: key,
                    label: continentAreaTrans[key] || key,
                })
            }
            refreshArea()
        }
        // 车辆识别下的tab切换（侦测、识别、车牌库）
        const vehicleTabChange = (name: TabPaneName) => {
            if (name == 'vehicleDetection') {
                play()
            } else if (name == 'vehicleLibrary') {
                router.push({
                    path: '/intelligent-analysis/sample-data-base/sample-data-base-licence-plate',
                })
            }
        }
        // 是否显示全部区域
        const showAllArea = () => {
            vehicleDrawer && vehicleDrawer.setEnableShowAll(detectionPageData.value.isShowAllArea)
            if (detectionPageData.value.isShowAllArea) {
                if (mode.value === 'h5') {
                    const index = currAreaType == 'regionArea' ? detectionPageData.value.regionArea : detectionPageData.value.maskArea
                    vehicleDrawer.setCurrAreaIndex(index, currAreaType)
                    vehicleDrawer.drawAllRegion(vehicleDetectionData.value.regionInfo, index)
                    vehicleDrawer.drawAllPolygon({}, vehicleDetectionData.value.maskAreaInfo, currAreaType, index, true)
                } else {
                    // (配合插件。。。)
                    // 插件在显示全部中：使用显示多边形的逻辑显示矩形
                    const detectAreaInfo = {} as Record<number, { X: number; Y: number }[]>
                    vehicleDetectionData.value.regionInfo.forEach((item, index) => {
                        detectAreaInfo[index] = []
                        detectAreaInfo[index].push({ X: item.X1, Y: item.Y1 }, { X: item.X2, Y: item.Y1 }, { X: item.X2, Y: item.Y2 }, { X: item.X1, Y: item.Y2 })
                    })
                    if (currAreaType == 'regionArea') {
                        // 当前区域为矩形并且显示全部的时候过滤掉当前区域
                        if (detectAreaInfo[detectionPageData.value.regionArea]) detectAreaInfo[detectionPageData.value.regionArea] = []
                    }
                    let sendMaxMinXml = ``
                    if (detectionPageData.value.isDispalyRangeChecked) {
                        const sendXMLMAX = OCX_XML_GetMaxMinXml(vehicleDetectionData.value.maxRegionInfo[0], 'faceMax')
                        const sendXMLMIN = OCX_XML_GetMaxMinXml(vehicleDetectionData.value.minRegionInfo[0], 'faceMin')
                        sendMaxMinXml = `<AreaRangeInfo>`
                        sendMaxMinXml += `<LineColor>green</LineColor>`
                        sendMaxMinXml += sendXMLMAX + sendXMLMIN
                        sendMaxMinXml += `</AreaRangeInfo>`
                    }
                    const sendXML = OCX_XML_SetAllArea(
                        { detectAreaInfo: Object.values(detectAreaInfo), maskAreaInfo: Object.values(vehicleDetectionData.value.maskAreaInfo) },
                        'IrregularPolygon',
                        'TYPE_PLATE_DETECTION',
                        sendMaxMinXml,
                        true,
                    )
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                }
            } else {
                if (mode.value === 'h5') {
                    changeArea()
                } else {
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', '', false)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    if (detectionPageData.value.isDispalyRangeChecked) {
                        const sendXMLMax = OCX_XML_SetVfdArea(vehicleDetectionData.value.maxRegionInfo[0], 'faceMax', 'green', 'TYPE_PLATE_DETECTION')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXMLMax)
                        const sendXMLMin = OCX_XML_SetVfdArea(vehicleDetectionData.value.minRegionInfo[0], 'faceMin', 'green', 'TYPE_PLATE_DETECTION')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXMLMin)
                    }
                }
            }
        }
        // 清空
        const clearArea = () => {
            if (mode.value === 'h5') {
                vehicleDrawer.clear()
            } else {
                if (currAreaType == 'regionArea') {
                    // 矩形侦测区域
                    const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else if (currAreaType == 'maskArea') {
                    // 屏蔽区域
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            if (currAreaType == 'regionArea') {
                vehicleDetectionData.value.regionInfo[detectionPageData.value.regionArea] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
            } else if (currAreaType == 'maskArea') {
                vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea] = []
            }
            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }
        // 全部清除
        const clearAllArea = () => {
            vehicleDetectionData.value.regionInfo.forEach((item) => {
                item.X1 = 0
                item.Y1 = 0
                item.X2 = 0
                item.Y2 = 0
            })
            for (const key in vehicleDetectionData.value.maskAreaInfo) {
                vehicleDetectionData.value.maskAreaInfo[key] = []
            }
            if (mode.value === 'h5') {
                vehicleDrawer.clear()
            } else {
                const sendXMLAll = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', '', false)
                plugin.GetVideoPlugin().ExecuteCmd(sendXMLAll!)
                const sendXMLVfd = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.GetVideoPlugin().ExecuteCmd(sendXMLVfd)
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }
        // 检测区域切换
        const regionAreaChange = () => {
            detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_RECT_TIP')
            currAreaType = 'regionArea'
            currentRegulation = true
            detectionPageData.value.maskArea = -1
            changeArea()
        }
        // 屏蔽区域切换
        const maskAreaChange = () => {
            detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_AREA_TIP').formatForLang(6)
            currAreaType = 'maskArea'
            currentRegulation = false
            detectionPageData.value.regionArea = -1
            changeArea()
        }
        // 设置区域图形
        const setAreaView = (type: string) => {
            if (type == 'regionArea') {
                if (vehicleDetectionData.value.regionInfo && vehicleDetectionData.value.regionInfo.length > 0) {
                    if (mode.value === 'h5') {
                        vehicleDrawer.setCurrAreaIndex(detectionPageData.value.regionArea, currAreaType)
                        vehicleDrawer.setArea(vehicleDetectionData.value.regionInfo[detectionPageData.value.regionArea])
                    } else {
                        const sendXML = OCX_XML_SetVfdArea(vehicleDetectionData.value.regionInfo[detectionPageData.value.regionArea], type, '#00ff00', 'TYPE_PLATE_DETECTION')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else if (type == 'maskArea') {
                if (vehicleDetectionData.value.maskAreaInfo) {
                    if (mode.value === 'h5') {
                        vehicleDrawer.setCurrAreaIndex(detectionPageData.value.maskArea, currAreaType)
                        vehicleDrawer.setPointList(vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea], true)
                    } else {
                        const sendXML = OCX_XML_SetPeaArea(vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea], true, '#ff0000', 'TYPE_PLATE_DETECTION')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else if (type == 'vehicleMax') {
                if (mode.value === 'h5') {
                    vehicleDrawer.setRangeMax(vehicleDetectionData.value.maxRegionInfo[0])
                } else {
                    // (配合插件。。。)
                    // const sendXML = OCX_XML_SetVfdArea(vehicleDetectionData.value.maxRegionInfo[0], type, '#00ff00', 'TYPE_PLATE_DETECTION')
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            } else if (type == 'vehicleMin') {
                if (mode.value === 'h5') {
                    vehicleDrawer.setRangeMin(vehicleDetectionData.value.minRegionInfo[0])
                } else {
                    // (配合插件。。。)
                    // const sendXML = OCX_XML_SetVfdArea(vehicleDetectionData.value.minRegionInfo[0], type, '#00ff00', 'TYPE_PLATE_DETECTION')
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }
        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            vehicleDetectionData.value.regionInfo.forEach((item, index) => {
                if (item.X1 != 0 || item.Y1 != 0 || item.X2 != 0 || item.Y2 != 0) {
                    detectionPageData.value.reginConfiguredArea[index] = true
                } else {
                    detectionPageData.value.reginConfiguredArea[index] = false
                }
            })
            for (const key in vehicleDetectionData.value.maskAreaInfo) {
                if (vehicleDetectionData.value.maskAreaInfo[key].length > 0) {
                    detectionPageData.value.maskConfiguredArea[key] = true
                } else {
                    detectionPageData.value.maskConfiguredArea[key] = false
                }
            }
        }
        // 切换洲时，对应的区域随之变化
        const refreshArea = (continent?: boolean) => {
            let areaList = continentArea[detectionPageData.value.continentValue] || []
            if (detectionPageData.value.noContinentAreaList.length > 0) {
                areaList = detectionPageData.value.noContinentAreaList
            }
            // 初始化时不需要更改区域值，改变大洲时需要更改
            if (continent) {
                vehicleDetectionData.value.plateSupportArea = areaList[0]
            }
            detectionPageData.value.plateAreaOption = areaList.map((item) => {
                return {
                    value: item,
                    label: continentAreaTrans[item] || item,
                }
            })
        }
        // 在切换区域时设置区域数据，线条样式，当前绘制格式
        const changeArea = () => {
            if (currAreaType == 'regionArea') {
                // 矩形侦测区域
                if (mode.value === 'h5') {
                    vehicleDrawer.setCurrAreaIndex(detectionPageData.value.regionArea, currAreaType)
                    vehicleDrawer.setLineStyle('#00ff00', 1.5)
                    vehicleDrawer.setRegulation(currentRegulation)
                } else {
                    const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                    const sendXML3 = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                }
            } else {
                // 屏蔽区域
                if (mode.value === 'h5') {
                    vehicleDrawer.setCurrAreaIndex(detectionPageData.value.maskArea, currAreaType)
                    vehicleDrawer.setLineStyle('#d9001b', 1.5)
                    vehicleDrawer.setRegulation(currentRegulation)
                } else {
                    const sendXML1 = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                    const sendXML3 = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                    const sendXML4 = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML4)
                    const sendXML5 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML5)
                }
            }
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()
            setAreaView(currAreaType)
            // (配合插件。。。)
            if (mode.value != 'h5') {
                showDisplayRange()
            }
        }
        // 闭合区域
        const setClosed = (poinObjtList: { X: number; Y: number; isClosed: boolean }[]) => {
            poinObjtList?.forEach((item) => {
                item.isClosed = true
            })
        }
        const setOtherAreaClosed = () => {
            if (mode.value == 'h5') {
                // 画点-区域
                for (const key in vehicleDetectionData.value.maskAreaInfo) {
                    setClosed(vehicleDetectionData.value.maskAreaInfo[key])
                }
            }
        }
        // 车牌最大小值范围
        const minVehicleBlur = () => {
            const min = vehicleDetectionData.value.plateSize.minWidth
            const max = vehicleDetectionData.value.plateSize.maxWidth
            if (min > max) {
                vehicleDetectionData.value.plateSize.minWidth = max
            }
            if (min < vehicleDetectionData.value.plateSize.min) vehicleDetectionData.value.plateSize.minWidth = vehicleDetectionData.value.plateSize.min
            if (min > vehicleDetectionData.value.plateSize.max) vehicleDetectionData.value.plateSize.minWidth = vehicleDetectionData.value.plateSize.max
            if (detectionPageData.value.isDispalyRangeChecked) {
                // 绘制最小框
                const minRegionInfo = calcRegionInfo(vehicleDetectionData.value.plateSize.minWidth)
                vehicleDetectionData.value.minRegionInfo = []
                vehicleDetectionData.value.minRegionInfo.push(minRegionInfo)
                setAreaView('vehicleMin')
            }
        }
        const maxVehicleBlur = () => {
            const min = vehicleDetectionData.value.plateSize.minWidth
            const max = vehicleDetectionData.value.plateSize.maxWidth
            if (max < min) {
                vehicleDetectionData.value.plateSize.maxWidth = min
            }
            if (max < vehicleDetectionData.value.plateSize.min) vehicleDetectionData.value.plateSize.maxWidth = vehicleDetectionData.value.plateSize.min
            if (max > vehicleDetectionData.value.plateSize.max) vehicleDetectionData.value.plateSize.maxWidth = vehicleDetectionData.value.plateSize.max
            if (detectionPageData.value.isDispalyRangeChecked) {
                // 绘制最大框
                const maxRegionInfo = calcRegionInfo(vehicleDetectionData.value.plateSize.maxWidth)
                vehicleDetectionData.value.maxRegionInfo = []
                vehicleDetectionData.value.maxRegionInfo.push(maxRegionInfo)
                setAreaView('vehicleMax')
            }
        }
        // 是否显示范围框
        const showDisplayRange = () => {
            const detectAreaInfo = {} as Record<number, { X: number; Y: number }[]>
            vehicleDetectionData.value.regionInfo.forEach((item, index) => {
                detectAreaInfo[index] = []
                detectAreaInfo[index].push({ X: item.X1, Y: item.Y1 }, { X: item.X2, Y: item.Y1 }, { X: item.X2, Y: item.Y2 }, { X: item.X1, Y: item.Y2 })
            })
            if (currAreaType == 'regionArea') {
                // 当前区域为矩形并且显示全部的时候过滤掉当前区域
                if (detectAreaInfo[detectionPageData.value.regionArea]) detectAreaInfo[detectionPageData.value.regionArea] = []
            }
            if (detectionPageData.value.isDispalyRangeChecked) {
                if (mode.value === 'h5') {
                    vehicleDrawer.toggleRange(true)
                    setAreaView('vehicleMax')
                    setAreaView('vehicleMin')
                } else {
                    const sendXMLMAX = OCX_XML_GetMaxMinXml(vehicleDetectionData.value.maxRegionInfo[0], 'faceMax')
                    const sendXMLMIN = OCX_XML_GetMaxMinXml(vehicleDetectionData.value.minRegionInfo[0], 'faceMin')
                    let sendMaxMinXml = `<AreaRangeInfo>`
                    sendMaxMinXml += `<LineColor>green</LineColor>`
                    sendMaxMinXml += sendXMLMAX + sendXMLMIN
                    sendMaxMinXml += `</AreaRangeInfo>`
                    if (detectionPageData.value.isShowAllArea) {
                        const sendXML = OCX_XML_SetAllArea(
                            { detectAreaInfo: Object.values(detectAreaInfo), maskAreaInfo: Object.values(vehicleDetectionData.value.maskAreaInfo) },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            true,
                        )
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    } else {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', sendMaxMinXml, false)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    }
                }
            } else {
                if (mode.value === 'h5') {
                    vehicleDrawer.toggleRange(false)
                } else {
                    const sendMaxMinXml = ``
                    if (detectionPageData.value.isShowAllArea) {
                        const sendXML = OCX_XML_SetAllArea(
                            { detectAreaInfo: Object.values(detectAreaInfo), maskAreaInfo: Object.values(vehicleDetectionData.value.maskAreaInfo) },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            true,
                        )
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    } else {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', sendMaxMinXml, false)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    }
                    const sendXMLMin = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXMLMin)
                    const sendXMLMax = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXMLMax)
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
        // 区域为多边形时，检测区域合法性(车牌识别AI事件中：检测区域为矩形-regionArea；屏蔽区域为多边形-maskArea)
        const verification = () => {
            if (currAreaType == 'maskArea' || vehicleDetectionData.value.maskAreaInfo) {
                for (const key in vehicleDetectionData.value.maskAreaInfo) {
                    const count = vehicleDetectionData.value.maskAreaInfo[key].length
                    if (count > 0 && count < 4) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                            showCancelButton: false,
                        })
                        return false
                    } else if (count > 0 && !vehicleDrawer.judgeAreaCanBeClosed(vehicleDetectionData.value.maskAreaInfo[key])) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_INTERSECT'),
                            showCancelButton: false,
                        })
                        return false
                    }
                }
            }
            return true
        }
        const getVehilceDetectionSaveData = () => {
            let sendXml = rawXml`<content>
                <chl id='${pageData.value.curChl}' scheduleGuid='${vehicleDetectionData.value.schedule}'>
                <param>
                <switch>${String(vehicleDetectionData.value.enabledSwitch)}</switch>
                <plateSize type='list'>
                <item>
                    <MinWidth>${String(vehicleDetectionData.value.plateSize.minWidth * 100)}</MinWidth>
                    <MinHeight>${String(vehicleDetectionData.value.plateSize.minWidth * 100)}</MinHeight>
                    <MaxWidth>${String(vehicleDetectionData.value.plateSize.maxWidth * 100)}</MaxWidth>
                    <MaxHeight>${String(vehicleDetectionData.value.plateSize.maxWidth * 100)}</MaxHeight>
                </item>
                </plateSize>
                <regionInfo type='list'>`
            vehicleDetectionData.value.regionInfo.forEach((item) => {
                sendXml += rawXml`
                <item>
                    <X1>${String(item.X1)}</X1>
                    <Y1>${String(item.Y1)}</Y1>
                    <X2>${String(item.X2)}</X2>
                    <Y2>${String(item.Y2)}</Y2>
                </item>
                `
            })
            sendXml += rawXml`</regionInfo>
            <plateSupportArea>${vehicleDetectionData.value.plateSupportArea}</plateSupportArea>
            <capturePlateAbsenceVehicle>${String(vehicleDetectionData.value.plateAbsenceCheceked)}</capturePlateAbsenceVehicle>` // 识别无车牌
            if (detectionPageData.value.isShowDirection) {
                sendXml += `<vehicleDirection>${vehicleDetectionData.value.direction}</vehicleDirection>`
            }
            sendXml += rawXml`<plateExposure>
            <switch>${String(vehicleDetectionData.value.exposureChecked)}</switch>
            <exposureValue>${String(vehicleDetectionData.value.exposureValue)}</exposureValue>
            </plateExposure>
            <maskArea>`
            for (const key in vehicleDetectionData.value.maskAreaInfo) {
                const item = vehicleDetectionData.value.maskAreaInfo[key]
                sendXml += rawXml`<item><point type='list' maxCount='8' count='${String(item.length)}'>`
                item.forEach((ele) => {
                    sendXml += rawXml`
                    <item>
                        <X>${String(ele.X)}</X>
                        <Y>${String(ele.Y)}</Y>
					</item>
                    `
                })
                sendXml += `</point></item>`
            }
            sendXml += rawXml`</maskArea>
            </param>
            <trigger></trigger>
            </chl></content>`
            return sendXml
        }
        const setVehicleDetectionData = async () => {
            const sendXml = getVehilceDetectionSaveData()
            openLoading(LoadingTarget.FullScreen)
            const result = await editVehicleConfig(sendXml)
            closeLoading(LoadingTarget.FullScreen)
            const $ = queryXml(result)
            if ($('/response/status').text() == 'success') {
                if (vehicleDetectionData.value.enabledSwitch) {
                    vehicleDetectionData.value.originalSwitch = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                if (currAreaType == 'maskArea') {
                    setAreaView('maskArea')
                }
                refreshInitPage()
                detectionPageData.value.applyDisabled = true
            }
        }
        // 提交车辆识别数据
        const applyVehicleDetectionData = async () => {
            if (!verification()) return
            let isSwitchChange = false
            const switchChangeTypeArr: string[] = []
            if (vehicleDetectionData.value.enabledSwitch && vehicleDetectionData.value.enabledSwitch != vehicleDetectionData.value.originalSwitch) {
                isSwitchChange = true
            }
            vehicleDetectionData.value.mutexList?.forEach((item) => {
                if (item.status) {
                    switchChangeTypeArr.push(closeTip[item['object']])
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SIMPLE_SMART_VEHICLE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + chlList[pageData.value.curChl].name, switchChangeType),
                }).then(() => {
                    setVehicleDetectionData()
                })
            } else {
                setVehicleDetectionData()
            }
        }
        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.vehicleChlList.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        /* 
        车牌识别——识别
        */
        // 添加任务项
        const addTask = () => {
            // 默认有识别成功、陌生车牌两项，添加的最多为3项
            if (taskTabs.value.length === 5) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                    showCancelButton: false,
                })
                return false
            }
            const nameId = defaultNameId.find((item) => !haveUseNameId.includes(item))!
            haveUseNameId.push(nameId)
            taskTabs.value.push({ value: 'whitelist' + nameId, label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + nameId })
            comparePageData.value.compareTab = 'whitelist' + nameId
            comparePageData.value.removeDisabled = false
            vehicleCompareData.value.task.push({
                guid: '',
                id: '',
                ruleType: 'whitelist',
                pluseSwitch: false,
                groupId: [],
                nameId: nameId,
                hintword: '',
                sysAudio: '{00000000-0000-0000-0000-000000000000}',
                schedule: '{00000000-0000-0000-0000-000000000000}',
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
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_MP_S'),
                showCancelButton: true,
            }).then(() => {
                haveUseNameId = haveUseNameId.filter((item) => item != Number(comparePageData.value.compareTab[9]))
                taskTabs.value = taskTabs.value.filter((item) => item.value != comparePageData.value.compareTab)
                vehicleCompareData.value.task = vehicleCompareData.value.task.filter((item) => {
                    if (item.ruleType == 'whitelist' && item.nameId == Number(comparePageData.value.compareTab[9])) {
                        if (item.guid) {
                            deleteVehicleCompareData(item)
                        }
                    } else {
                        return item
                    }
                })
                comparePageData.value.compareTab = 'whitelist'
                comparePageData.value.removeDisabled = true
            })
        }
        // 识别tab选项切换
        const compareTabChange = (name: TabPaneName) => {
            if (name == 'whitelist' || name == 'stranger') {
                comparePageData.value.removeDisabled = true
            } else {
                comparePageData.value.removeDisabled = false
            }
        }
        // 获取车牌分组数据
        const getVehicleGroupData = async () => {
            const result = await queryPlateLibrary()
            commLoadResponseHandler(result, ($) => {
                $('/response/content/group/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const guid = item.attr('id')!
                    const name = $item('name').text()
                    vehicleGroupNameMap[guid] = name
                    vehicleGroupData.push({
                        guid: guid,
                        name: name,
                    })
                })
            }).then(async () => {
                await getVehicleCompareData()
                comparePageData.value.initComplated = true
            })
        }

        // 获取车牌识别数据
        const getVehicleCompareData = async () => {
            taskTabs.value = []
            vehicleCompareData.value.task = []
            const sendXml = rawXml`
            <condition><chlId>${pageData.value.curChl}</chlId></condition>
            `
            const result = await queryVehicleMatchAlarm(sendXml)
            commLoadResponseHandler(result, ($) => {
                vehicleCompareData.value.hitEnable = $('/response/content/chl/hitEnable').text() == 'true'
                vehicleCompareData.value.notHitEnable = $('/response/content/chl/notHitEnable').text() == 'true'
                $('/response/content/chl/task/item').forEach((item) => {
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
                    vehicleCompareData.value.task.push({
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
                vehicleCompareData.value.task.forEach((item, index) => {
                    if (index == 0) {
                        taskTabs.value.push({
                            value: 'whitelist',
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                        })
                        comparePageData.value.taskData = item
                    } else if (index == 1) {
                        taskTabs.value.push({
                            value: 'stranger',
                            label: Translate('IDCS_STRANGE_PLATE'),
                        })
                    } else {
                        taskTabs.value.push({
                            value: 'whitelist' + item.nameId,
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + item.nameId,
                        })
                    }
                })
            })
        }
        // tab项对应的识别数据
        const compareLinkData = (value: string) => {
            let taskData = {} as CompareTask
            if (value == 'whitelist') {
                taskData = vehicleCompareData.value.task?.[0]
            } else if (value == 'stranger') {
                taskData = vehicleCompareData.value.task?.[1]
            } else {
                vehicleCompareData.value.task?.forEach((item) => {
                    if (item.nameId == Number(value[9])) {
                        taskData = item
                    }
                })
            }
            return taskData
        }
        // 提交数据参数
        const getVehicleCompareSaveData = () => {
            let sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                    <task>
            `
            vehicleCompareData.value.task.forEach((item) => {
                sendXml += rawXml`<item guid='${item.guid}' id='${item.id}'>
                    <param>
                        <ruleType>${item.ruleType}</ruleType>
                        <pluseSwitch>${String(item.pluseSwitch)}</pluseSwitch>
                        <nameId>${String(item.nameId)}</nameId>
                        <groupId>
                `
                item.groupId.forEach((ele) => {
                    sendXml += `<item guid='${ele}'></item>`
                })
                sendXml += rawXml`</groupId>
                    <hint>
                        <word>${item.hintword}</word>
                    </hint></param>
                    <schedule id='${item.schedule}'></schedule>
                    <trigger>
                        <sysAudio id='${item.sysAudio}'></sysAudio>
                        <buzzerSwitch>${String(item.buzzerSwitch)}</buzzerSwitch>
                        <popMsgSwitch>${String(item.popMsgSwitch)}</popMsgSwitch>
                        <emailSwitch>${String(item.emailSwitch)}</emailSwitch>
                        <msgPushSwitch>${String(item.msgPushSwitch)}</msgPushSwitch>
                        <popVideo><switch>${String(item.popVideoSwitch)}</switch><chls><item id='${pageData.value.curChl}'></item></chls></popVideo>
                        <alarmOut><switch>true</switch><alarmOuts type='list'>
                `
                item.alarmOut.forEach((ele) => {
                    sendXml += `<item id='${ele.value}'></item>`
                })
                sendXml += rawXml`
                </alarmOuts></alarmOut>
                <preset><switch>${item.preset.length == 0 ? 'false' : 'true'}</switch>
                <presets type='list'>
                `
                item.preset.forEach((ele) => {
                    sendXml += rawXml`
                    <item>
                        <index>${ele.index}</index>
                        <name><![CDATA[${ele.name}]]></name>
                        <chl id='${ele.chl.value}'><![CDATA[${ele.chl.label}]]></chl>
                    </item>
                `
                })
                sendXml += rawXml`
                    </presets></preset>
                    <sysRec><switch>true</switch><chls type='list'>
                `
                item.record.forEach((ele) => {
                    sendXml += `<item id='${ele.value}'></item>`
                })
                sendXml += rawXml`
                    </chls></sysRec>
                    <sysSnap><switch>true</switch><chls type='list'>
                `
                item.snap.forEach((ele) => {
                    sendXml += `<item id='${ele.value}'></item>`
                })
                sendXml += rawXml`
                    </chls></sysSnap></trigger>
                    </item>
                `
            })
            sendXml += `</task></chl></content>`
            return sendXml
        }
        // 提交车牌识别数据
        const setVehicleCompareData = async () => {
            const sendXml = getVehicleCompareSaveData()
            openLoading(LoadingTarget.FullScreen)
            await editVehicleMatchAlarm(sendXml)
            closeLoading(LoadingTarget.FullScreen)
            comparePageData.value.compareTab = 'whitelist'
            comparePageData.value.applyDisabled = true
        }
        // 删除车牌识别任务项
        const deleteVehicleCompareData = async (data: CompareTask) => {
            const sendXml = rawXml`
                <condition>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            <item id='${data.id}' guid='${data.guid}'></item>
                        </task>
                    </chl>
                </condition>`
            await deleteVehicleMatchAlarm(sendXml)
        }
        // 车牌识别应用
        const applyVehicleCompareData = async () => {
            if (vehicleCompareData.value.editFlag) {
                await setVehicleCompareData()
            }
        }
        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            // todo，未测试
            // 侦测区域
            const xmlNote = $("statenotify[@type='VfdArea']")
            if (xmlNote.length > 0) {
                const $xmlNote = queryXml(xmlNote[0].element)
                const points = [] as { X1: number; Y1: number; X2: number; Y2: number }[]
                $xmlNote('item').forEach((item) => {
                    const $item = queryXml(item.element)
                    points.push({ X1: Number($item('X1').text()), Y1: Number($item('Y1').text()), X2: Number($item('X2').text()), Y2: Number($item('Y2').text()) })
                })
                vehicleDetectionData.value.regionInfo = points
            }
            // 屏蔽区域
            const xmlPea = $("statenotify[@type='PeaArea']")
            const $points = $("statenotify[@type='PeaArea']/points")
            // 绘制点线
            if ($points.length > 0) {
                const $xmlPea = queryXml(xmlPea[0].element)
                const points = [] as { X: number; Y: number; isClosed: boolean }[]
                $xmlPea('points/item').forEach((item) => {
                    points.push({ X: Number(item.attr('X')), Y: Number(item.attr('Y')), isClosed: true })
                })
                vehicleDetectionData.value.maskAreaInfo[detectionPageData.value.maskArea] = points
            }
            const errorCode = $("statenotify[@type='PeaArea']/errorCode").text()
            // 处理错误码
            if (errorCode == '517') {
                // 517-区域已闭合
                vehicleClearCurrentArea()
            } else if (errorCode == '515') {
                // 515-区域有相交直线，不可闭合
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_INTERSECT'),
                    showCancelButton: false,
                })
            }
        }
        onMounted(async () => {
            if (mode.value != 'h5') {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
            await getVoiceList()
            await getScheduleData()
            await getRecordList()
            await getAlarmOutData()
            await getSnapList()
            await getChlData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                Plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                plugin.GetVideoPlugin().ExecuteCmd(sendMaxXML)
                const sendMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                plugin.GetVideoPlugin().ExecuteCmd(sendMinXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            if (mode.value == 'h5') {
                vehicleDrawer.destroy()
            }
        })

        watch(
            vehicleDetectionData,
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
            vehicleCompareData,
            () => {
                if (comparePageData.value.initComplated) {
                    vehicleCompareData.value.editFlag = true
                    comparePageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            SuccessfulRecognition,
            ScheduleManagPop,
            supportPlateMatch,
            advancedVisible,
            // 播放器
            playerRef,
            // 车辆侦测
            vehicleDetectionData,
            // 侦测页面数据
            detectionPageData,
            // 识别页面数据
            comparePageData,
            pageData,
            // 切换通道
            chlChange,
            // 播放器准备完成
            handlePlayerReady,
            // 车辆识别tab切换
            vehicleTabChange,
            // 是否显示全部区域
            showAllArea,
            // 清除和全部清除
            clearArea,
            clearAllArea,
            // 检测区域
            regionAreaChange,
            // 屏蔽区域
            maskAreaChange,
            // 切换大洲时更新地区列表
            refreshArea,
            // 车牌最大小值
            minVehicleBlur,
            maxVehicleBlur,
            // 是否显示范围框
            showDisplayRange,
            // 提交车辆识别数据
            applyVehicleDetectionData,

            /* 车牌识别——识别 */
            taskTabs,
            // 车辆
            vehicleGroupData,
            compareTabChange,
            compareLinkData,
            addTask,
            removeTask,
            applyVehicleCompareData,
        }
    },
})
