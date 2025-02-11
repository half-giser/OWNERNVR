/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-09 09:56:33
 * @Description: AI 事件——车牌识别
 */
import { type AlarmRecognitionTaskDto, AlarmVehicleDetectionDto, AlarmVehicleChlDto, AlarmVehicleRecognitionDto } from '@/types/apiType/aiAndEvent'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import RecognitionPanel from './RecognitionPanel.vue'
import { type CanvasBasePoint, type CanvasBaseArea } from '@/utils/canvas/canvasBase'
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
        RecognitionPanel,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const router = useRouter()
        const systemCaps = useCababilityStore()
        type CanvasAreaType = 'regionArea' | 'maskArea'

        const supportPlateMatch = systemCaps.supportPlateMatch

        // 播放器
        const playerRef = ref<PlayerInstance>()

        let currentRegulation = true // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
        let currAreaType: CanvasAreaType = 'regionArea' // maskArea屏蔽区域 regionArea矩形侦测区域

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

        // 侦测页的数据
        const detectionFormData = ref(new AlarmVehicleDetectionDto())
        const watchDetection = useWatchEditData(detectionFormData)

        // 侦测tab项下的界面数据
        const detectionPageData = ref({
            // 默认进入参数配置tab项
            tab: 'param',
            // 绘图区域下提示信息
            drawAreaTip: '',
            // 是否显示全部区域
            isShowAllArea: false,
            // 侦测区域
            regionArea: 0,
            regionAreaChecked: [] as number[],
            // reginConfiguredArea: [] as boolean[],
            // 屏蔽区域
            maskArea: -1,
            maskAreaChecked: [] as number[],
            // 初始是否有数据（添加样式）
            // maskConfiguredArea: [] as boolean[],
            // 检测区域-洲
            continentValue: '',
            continentDisabled: false,
            continentOption: [] as SelectOption<string, string>[],
            plateAreaList: [] as { translate: string; continent: string; value: string }[],
            // 识别模式选项
            directionOption: [] as SelectOption<string, string>[],
            // 识别模式（高级设置）是否显示
            isShowDirection: false,
            // 曝光
            exposureDisabled: false,
            // 抓拍无牌车
            capturePlateAbsenceVehicleDisabled: false,
            // 车牌大小的form项标题
            plateSizeRangeTitle: '',
            // 显示范围框是否选中
            isDispalyRangeChecked: false,
            isAdvancePop: false,
        })

        // 识别tab项下的界面数据
        const matchPageData = ref({
            // 默认进入参数配置tab项
            tab: 'whitelist',
            // 当前选中tab的任务数据
            taskData: {} as AlarmRecognitionTaskDto,
        })

        // 车牌识别任务项
        const taskTabs = ref<SelectOption<string, string>[]>([])
        //nameId的取值为0,1,2,3;0为默认的识别成功和陌生车牌类型，添加的项取值不可能为0
        const defaultNameId = [1, 2, 3]
        let haveUseNameId: number[] = []
        // 车牌分组数据，初始化后不会改变
        const groupList = ref<{ guid: string; name: string }[]>([])
        // 车牌识别数据
        const matchFormData = ref(new AlarmVehicleRecognitionDto())
        const watchMatch = useWatchEditData(matchFormData)

        // 整体的通用界面数据
        const pageData = ref({
            curChl: '',
            chlList: [] as AlarmVehicleChlDto[],
            // 当前选择的tab项
            tab: '',
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            notSupport: false,
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        // 车牌侦测绘制的Canvas
        let vehicleDrawer: ReturnType<typeof CanvasPolygon>

        const chlData = computed(() => {
            return pageData.value.chlList.find((item) => item.id === pageData.value.curChl) || new AlarmVehicleChlDto()
        })

        // 获取声音列表数据
        const getVoiceList = async () => {
            pageData.value.voiceList = await buildAudioList()
        }

        // 获取通道及相关配置数据
        const getChlData = async () => {
            // 获取在线通道列表
            const online = await queryOnlineChlList()
            const $ = await commLoadResponseHandler(online)
            const onlineChlList = $('content/item').map((item) => {
                return item.attr('id')
            })
            const result = await getChlList({
                requireField: ['supportVehiclePlate'],
            })
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const protocolType = $item('protocolType').text()
                    const factoryName = $item('productModel').attr('factoryName')
                    if (factoryName === 'Recorder') return
                    const curChlId = item.attr('id')
                    if (protocolType !== 'RTSP' && onlineChlList.includes(curChlId)) {
                        const supportVehiclePlate = $item('supportVehiclePlate').text().bool()

                        // 当前没有选中任何通道的情况下，初始化为第一个支持车牌识别的通道
                        if (!pageData.value.curChl && supportVehiclePlate) {
                            pageData.value.curChl = curChlId
                        }

                        const name = $item('name').text()

                        pageData.value.chlList.push({
                            id: curChlId,
                            name,
                            chlType: $item('chlType').text(),
                            supportVehiclePlate,
                        })
                    }
                })
            })
        }

        // 处理通道数据
        const changeChl = async () => {
            const data = chlData.value

            pageData.value.tab = ''
            matchPageData.value.tab = ''
            taskTabs.value = []

            detectionFormData.value = new AlarmVehicleDetectionDto()
            matchFormData.value = new AlarmVehicleRecognitionDto()

            if (!data.supportVehiclePlate) {
                pageData.value.notSupport = true
            } else {
                matchPageData.value.tab = 'whitelist'
                pageData.value.notSupport = false

                await getGroupData()
                await getMatchData()
                await getDetectionData()

                pageData.value.tab = 'vehicleDetection'
            }
        }

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                const canvas = player.getDrawbordCanvas(0)
                vehicleDrawer = CanvasPolygon({
                    el: canvas,
                    regulation: currentRegulation,
                    onchange: changeVehicle,
                    closePath: closePath,
                    forceClosePath: forceClosePath,
                    clearCurrentArea: clearCurrentArea,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        // vehicleDrawer初始化时绑定以下函数
        const changeVehicle = (area: CanvasBaseArea | CanvasBasePoint[]) => {
            if (currentRegulation) {
                // 检测区域（矩形）
                detectionFormData.value.regionInfo[detectionPageData.value.regionArea] = area as CanvasBaseArea
            } else {
                // 屏蔽区域（多边形）
                detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea] = area as CanvasBasePoint[]
            }

            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const closePath = (area: CanvasBasePoint[]) => {
            area.forEach((item) => (item.isClosed = true))
            detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea] = area
        }

        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea] = []

                if (mode.value === 'h5') {
                    vehicleDrawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
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
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.curChl,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(pageData.value.curChl, chlData.value.name)
            }

            // 设置视频区域可编辑
            // 界面内切换tab，调用play时初始化区域
            changeArea()
            setTimeout(() => {
                setAreaView('regionArea')
            }, 0)

            if (mode.value === 'h5') {
                vehicleDrawer.setEnable(true)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                plugin.ExecuteCmd(sendXML)
            }
        }

        // 获取车牌侦测数据
        const getDetectionData = async () => {
            watchDetection.reset()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.curChl}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await queryVehicleConfig(sendXml)
            commLoadResponseHandler(result, ($) => {
                const $param = queryXml($('content/chl/param')[0].element)

                const enabledSwitch = $param('switch').text().bool()
                // 洲
                detectionPageData.value.continentOption = $('types/continentType/enum').map((item) => {
                    return {
                        label: continentAreaTrans[item.text()],
                        value: item.text(),
                    }
                })

                detectionPageData.value.plateAreaList = $('types/plateAreaType/enum').map((item) => {
                    return {
                        translate: item.attr('translate') || continentAreaTrans[item.text()] || item.text(),
                        continent: item.attr('continent'),
                        value: item.text(),
                    }
                })

                // 识别模式
                detectionPageData.value.directionOption = $('types/directionType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: directionType[item.text()],
                    }
                })
                const direction = $param('vehicleDirection').text()
                detectionPageData.value.isShowDirection = !!detectionPageData.value.directionOption.length || !!direction
                // 车牌曝光
                const exposure = $param('plateExposure')
                detectionPageData.value.exposureDisabled = !exposure.text()
                const $exposure = queryXml(exposure[0].element)
                // 抓拍无牌车
                const plateAbsence = $param('capturePlateAbsenceVehicle').text()
                detectionPageData.value.capturePlateAbsenceVehicleDisabled = !plateAbsence

                // 车牌大小范围
                const plateSize = {
                    minWidth: $param('plateSize/item/MinWidth').text().num() / 100,
                    maxWidth: $param('plateSize/item/MaxWidth').text().num() / 100,
                    min: $param('plateSize/item/MinWidth').attr('min').num() / 100 || 1,
                    max: $param('plateSize/item/MinWidth').attr('max').num() / 100 || 50,
                }

                detectionPageData.value.plateSizeRangeTitle = Translate('IDCS_VEHICLE_SIZE_TIP').formatForLang(plateSize.min + '%', plateSize.max + '%')
                detectionFormData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    plateSupportArea: $param('plateSupportArea').text(),
                    direction,
                    exposureSwitch: $exposure('switch').text().bool(),
                    exposureMin: $exposure('exposureValue').attr('min').num(),
                    exposureMax: $exposure('exposureValue').attr('max').num() || 50,
                    exposureValue: $exposure('exposureValue').text().num(),
                    capturePlateAbsenceVehicle: plateAbsence.bool(),
                    regionInfo: $param('regionInfo/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            X1: $item('X1').text().num(),
                            Y1: $item('Y1').text().num(),
                            X2: $item('X2').text().num(),
                            Y2: $item('Y2').text().num(),
                        }
                    }),
                    maskAreaInfo: Object.fromEntries(
                        $param('maskArea/item').map((item, index) => {
                            const $item = queryXml(item.element)
                            return [
                                index,
                                $item('point/item').map((ele) => {
                                    const $ele = queryXml(ele.element)
                                    return {
                                        X: $ele('X').text().num(),
                                        Y: $ele('Y').text().num(),
                                        isClosed: true,
                                    }
                                }),
                            ]
                        }),
                    ),
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    plateSize: plateSize,
                    minRegionInfo: [calcRegionInfo(plateSize.minWidth)],
                    maxRegionInfo: [calcRegionInfo(plateSize.maxWidth)],
                }

                detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_RECT_TIP')

                refreshInitPage()

                detectionPageData.value.continentValue =
                    detectionPageData.value.plateAreaList.find((item) => {
                        return item.value === detectionFormData.value.plateSupportArea
                    })?.continent || ''

                watchDetection.listen()
            })
        }

        // 车辆识别下的tab切换（侦测、识别、车牌库）
        const changeTab = () => {
            if (pageData.value.tab === 'vehicleDetection') {
                play()
            } else if (pageData.value.tab === 'vehicleLibrary') {
                if (import.meta.env.VITE_UI_TYPE === 'UI2-A') {
                    router.push({
                        path: '/config/alarm/vehicleDatabase',
                        state: {
                            backChlId: pageData.value.curChl,
                        },
                    })
                } else {
                    router.push({
                        path: '/intelligent-analysis/sample-data-base/sample-data-base-licence-plate',
                        state: {
                            backChlId: pageData.value.curChl,
                        },
                    })
                }
            }
        }

        // 是否显示全部区域
        const showAllArea = () => {
            vehicleDrawer && vehicleDrawer.setEnableShowAll(detectionPageData.value.isShowAllArea)
            if (detectionPageData.value.isShowAllArea) {
                if (mode.value === 'h5') {
                    const index = currAreaType === 'regionArea' ? detectionPageData.value.regionArea : detectionPageData.value.maskArea
                    vehicleDrawer.setCurrAreaIndex(index, currAreaType)
                    vehicleDrawer.drawAllRegion(detectionFormData.value.regionInfo, index)
                    vehicleDrawer.drawAllPolygon({}, detectionFormData.value.maskAreaInfo, currAreaType, index, true)
                }

                if (mode.value === 'ocx') {
                    // (配合插件。。。)
                    // 插件在显示全部中：使用显示多边形的逻辑显示矩形
                    const detectAreaInfo: Record<number, { X: number; Y: number }[]> = {}
                    detectionFormData.value.regionInfo.forEach((item, index) => {
                        detectAreaInfo[index] = [
                            {
                                X: item.X1,
                                Y: item.Y1,
                            },
                            {
                                X: item.X2,
                                Y: item.Y1,
                            },
                            {
                                X: item.X2,
                                Y: item.Y2,
                            },
                            {
                                X: item.X1,
                                Y: item.Y2,
                            },
                        ]
                    })
                    if (currAreaType === 'regionArea') {
                        // 当前区域为矩形并且显示全部的时候过滤掉当前区域
                        if (detectAreaInfo[detectionPageData.value.regionArea]) detectAreaInfo[detectionPageData.value.regionArea] = []
                    }
                    let sendMaxMinXml = ''
                    if (detectionPageData.value.isDispalyRangeChecked) {
                        sendMaxMinXml = rawXml`
                            <AreaRangeInfo>
                                <LineColor>green</LineColor>
                                ${OCX_XML_GetMaxMinXml(detectionFormData.value.maxRegionInfo[0], 'faceMax')}
                                ${OCX_XML_GetMaxMinXml(detectionFormData.value.minRegionInfo[0], 'faceMin')}
                            </AreaRangeInfo>
                        `
                    }
                    const sendXML = OCX_XML_SetAllArea(
                        {
                            detectAreaInfo: Object.values(detectAreaInfo),
                            maskAreaInfo: Object.values(detectionFormData.value.maskAreaInfo),
                        },
                        'IrregularPolygon',
                        'TYPE_PLATE_DETECTION',
                        sendMaxMinXml,
                        true,
                    )
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'h5') {
                    changeArea()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', '', false)
                    plugin.ExecuteCmd(sendXML!)

                    if (detectionPageData.value.isDispalyRangeChecked) {
                        const sendXMLMax = OCX_XML_SetVfdArea(detectionFormData.value.maxRegionInfo[0], 'faceMax', 'green', 'TYPE_PLATE_DETECTION')
                        plugin.ExecuteCmd(sendXMLMax)

                        const sendXMLMin = OCX_XML_SetVfdArea(detectionFormData.value.minRegionInfo[0], 'faceMin', 'green', 'TYPE_PLATE_DETECTION')
                        plugin.ExecuteCmd(sendXMLMin)
                    }
                }
            }
        }

        // 清空
        const clearArea = () => {
            if (mode.value === 'h5') {
                vehicleDrawer.clear()
            }

            if (mode.value === 'ocx') {
                if (currAreaType === 'regionArea') {
                    // 矩形侦测区域
                    const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.ExecuteCmd(sendXML)
                } else if (currAreaType === 'maskArea') {
                    // 屏蔽区域
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (currAreaType === 'regionArea') {
                detectionFormData.value.regionInfo[detectionPageData.value.regionArea] = {
                    X1: 0,
                    Y1: 0,
                    X2: 0,
                    Y2: 0,
                }
            } else if (currAreaType === 'maskArea') {
                detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea] = []
            }

            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 全部清除
        const clearAllArea = () => {
            detectionFormData.value.regionInfo.forEach((item) => {
                item.X1 = 0
                item.Y1 = 0
                item.X2 = 0
                item.Y2 = 0
            })
            for (const key in detectionFormData.value.maskAreaInfo) {
                detectionFormData.value.maskAreaInfo[key] = []
            }

            if (mode.value === 'h5') {
                vehicleDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXMLAll = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_PLATE_DETECTION', '', false)
                plugin.ExecuteCmd(sendXMLAll!)

                const sendXMLVfd = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.ExecuteCmd(sendXMLVfd)

                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 检测区域切换
        const changeRegionArea = () => {
            detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_RECT_TIP')
            currAreaType = 'regionArea'
            currentRegulation = true
            detectionPageData.value.maskArea = -1
            changeArea()
        }

        // 屏蔽区域切换
        const changeMaskArea = () => {
            detectionPageData.value.drawAreaTip = Translate('IDCS_DRAW_AREA_TIP').formatForLang(6)
            currAreaType = 'maskArea'
            currentRegulation = false
            detectionPageData.value.regionArea = -1
            changeArea()
        }

        // 设置区域图形
        const setAreaView = (type: string) => {
            if (type === 'regionArea') {
                if (detectionFormData.value.regionInfo && detectionFormData.value.regionInfo.length) {
                    if (mode.value === 'h5') {
                        vehicleDrawer.setCurrAreaIndex(detectionPageData.value.regionArea, currAreaType)
                        vehicleDrawer.setArea(detectionFormData.value.regionInfo[detectionPageData.value.regionArea])
                    }

                    if (mode.value === 'ocx') {
                        // 从侦测区域切换到屏蔽区域时（反之同理），会先执行侦测区域的清空、不可编辑，再执行屏蔽区域的是否可编辑三个命令
                        // 最后执行渲染画线的命令，加延时的目的是这个过程执行命令过多，插件响应不过来
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.regionInfo[detectionPageData.value.regionArea], type, 'green', 'TYPE_PLATE_DETECTION')
                            plugin.ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            } else if (type === 'maskArea') {
                if (detectionFormData.value.maskAreaInfo) {
                    if (mode.value === 'h5') {
                        vehicleDrawer.setCurrAreaIndex(detectionPageData.value.maskArea, currAreaType)
                        vehicleDrawer.setPointList(detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea], true)
                    }

                    if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetPeaArea(detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea], false, 'red', 'TYPE_PLATE_DETECTION')
                            plugin.ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            } else if (type === 'vehicleMax') {
                if (mode.value === 'h5') {
                    vehicleDrawer.setRangeMax(detectionFormData.value.maxRegionInfo[0])
                }

                if (mode.value === 'ocx') {
                    // (配合插件。。。)
                    const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.maxRegionInfo[0], 'faceMax', 'green', 'TYPE_PLATE_DETECTION')
                    plugin.ExecuteCmd(sendXML)
                }
            } else if (type === 'vehicleMin') {
                if (mode.value === 'h5') {
                    vehicleDrawer.setRangeMin(detectionFormData.value.minRegionInfo[0])
                }

                if (mode.value === 'ocx') {
                    // (配合插件。。。)
                    const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.minRegionInfo[0], 'faceMin', 'green', 'TYPE_PLATE_DETECTION')
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (detectionPageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            detectionPageData.value.regionAreaChecked = detectionFormData.value.regionInfo.map((item, index) => {
                if (item.X1 || item.Y1 || item.X2 || item.Y2) {
                    return index
                }
                return -1
            })

            detectionPageData.value.maskAreaChecked = Object.values(detectionFormData.value.maskAreaInfo).map((item, index) => {
                if (item.length) {
                    return index
                }
                return -1
            })
        }

        // 切换洲时，对应的区域随之变化
        const changeContinent = () => {
            nextTick(() => {
                if (plateAreaOption.value.length) {
                    detectionFormData.value.plateSupportArea = plateAreaOption.value[0].value
                }
            })
        }

        const plateAreaOption = computed(() => {
            return detectionPageData.value.plateAreaList
                .filter((item) => item.continent === detectionPageData.value.continentValue)
                .map((item) => {
                    return {
                        label: item.translate,
                        value: item.value,
                    }
                })
        })

        // 在切换区域时设置区域数据，线条样式，当前绘制格式
        const changeArea = () => {
            if (currAreaType === 'regionArea') {
                // 矩形侦测区域
                if (mode.value === 'h5') {
                    vehicleDrawer.setCurrAreaIndex(detectionPageData.value.regionArea, currAreaType)
                    vehicleDrawer.setLineStyle('#00ff00', 1.5)
                    vehicleDrawer.setRegulation(currentRegulation)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)

                    const sendXML3 = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML3)
                }
            } else if (currAreaType === 'maskArea') {
                // 屏蔽区域
                if (mode.value === 'h5') {
                    vehicleDrawer.setCurrAreaIndex(detectionPageData.value.maskArea, currAreaType)
                    vehicleDrawer.setLineStyle('#d9001b', 1.5)
                    vehicleDrawer.setRegulation(currentRegulation)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.ExecuteCmd(sendXML2)

                    const sendXML3 = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.ExecuteCmd(sendXML3)

                    const sendXML4 = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML4)

                    const sendXML5 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML5)
                }
            }
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()
            setAreaView(currAreaType)
            // (配合插件。。。)
            if (mode.value === 'ocx') {
                showDisplayRange()
            }
        }

        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
                // 画点-区域
                for (const key in detectionFormData.value.maskAreaInfo) {
                    detectionFormData.value.maskAreaInfo[key].forEach((item) => {
                        item.isClosed = true
                    })
                }
            }
        }

        /**
         * @description 绘制最小框
         */
        const blurMinWidth = () => {
            if (detectionPageData.value.isDispalyRangeChecked) {
                const minRegionInfo = calcRegionInfo(detectionFormData.value.plateSize.minWidth)
                detectionFormData.value.minRegionInfo = []
                detectionFormData.value.minRegionInfo.push(minRegionInfo)
                setAreaView('vehicleMin')
            }
        }

        /**
         * @description 绘制最大框
         */
        const blurMaxWidth = () => {
            if (detectionPageData.value.isDispalyRangeChecked) {
                const maxRegionInfo = calcRegionInfo(detectionFormData.value.plateSize.maxWidth)
                detectionFormData.value.maxRegionInfo = []
                detectionFormData.value.maxRegionInfo.push(maxRegionInfo)
                setAreaView('vehicleMax')
            }
        }

        // 是否显示范围框
        const showDisplayRange = () => {
            const detectAreaInfo: Record<number, { X: number; Y: number }[]> = {}
            detectionFormData.value.regionInfo.forEach((item, index) => {
                detectAreaInfo[index] = []
                detectAreaInfo[index].push(
                    {
                        X: item.X1,
                        Y: item.Y1,
                    },
                    {
                        X: item.X2,
                        Y: item.Y1,
                    },
                    {
                        X: item.X2,
                        Y: item.Y2,
                    },
                    {
                        X: item.X1,
                        Y: item.Y2,
                    },
                )
            })
            if (currAreaType === 'regionArea') {
                // 当前区域为矩形并且显示全部的时候过滤掉当前区域
                if (detectAreaInfo[detectionPageData.value.regionArea]) detectAreaInfo[detectionPageData.value.regionArea] = []
            }

            if (detectionPageData.value.isDispalyRangeChecked) {
                if (mode.value === 'h5') {
                    vehicleDrawer.toggleRange(true)
                    setAreaView('vehicleMax')
                    setAreaView('vehicleMin')
                }

                if (mode.value === 'ocx') {
                    const sendMaxMinXml = rawXml`
                        <AreaRangeInfo>
                            <LineColor>green</LineColor>
                            ${OCX_XML_GetMaxMinXml(detectionFormData.value.maxRegionInfo[0], 'faceMax')}
                            ${OCX_XML_GetMaxMinXml(detectionFormData.value.minRegionInfo[0], 'faceMin')}
                        </AreaRangeInfo>
                    `
                    if (detectionPageData.value.isShowAllArea) {
                        const sendXML = OCX_XML_SetAllArea(
                            {
                                detectAreaInfo: Object.values(detectAreaInfo),
                                maskAreaInfo: Object.values(detectionFormData.value.maskAreaInfo),
                            },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            true,
                        )
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        const sendXML = OCX_XML_SetAllArea(
                            {
                                detectAreaInfo: [],
                                maskAreaInfo: [],
                            },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            false,
                        )
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (mode.value === 'h5') {
                    vehicleDrawer.toggleRange(false)
                }

                if (mode.value === 'ocx') {
                    const sendMaxMinXml = ''
                    if (detectionPageData.value.isShowAllArea) {
                        const sendXML = OCX_XML_SetAllArea(
                            {
                                detectAreaInfo: Object.values(detectAreaInfo),
                                maskAreaInfo: Object.values(detectionFormData.value.maskAreaInfo),
                            },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            true,
                        )
                        plugin.ExecuteCmd(sendXML!)
                    } else {
                        const sendXML = OCX_XML_SetAllArea(
                            {
                                detectAreaInfo: [],
                                maskAreaInfo: [],
                            },
                            'IrregularPolygon',
                            'TYPE_PLATE_DETECTION',
                            sendMaxMinXml,
                            false,
                        )
                        plugin.ExecuteCmd(sendXML!)
                    }

                    const sendXMLMin = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.ExecuteCmd(sendXMLMin)

                    const sendXMLMax = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.ExecuteCmd(sendXMLMax)
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
            if (currAreaType === 'maskArea' || detectionFormData.value.maskAreaInfo) {
                for (const key in detectionFormData.value.maskAreaInfo) {
                    const count = detectionFormData.value.maskAreaInfo[key].length
                    if (count > 0 && count < 4) {
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                        return false
                    } else if (count > 0 && !vehicleDrawer.judgeAreaCanBeClosed(detectionFormData.value.maskAreaInfo[key])) {
                        openMessageBox(Translate('IDCS_INTERSECT'))
                        return false
                    }
                }
            }
            return true
        }

        const getDetectionSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}' scheduleGuid='${detectionFormData.value.schedule}'>
                        <param>
                            <switch>${detectionFormData.value.enabledSwitch}</switch>
                            <plateSize type='list'>
                                <item>
                                    <MinWidth>${detectionFormData.value.plateSize.minWidth * 100}</MinWidth>
                                    <MinHeight>${detectionFormData.value.plateSize.minWidth * 100}</MinHeight>
                                    <MaxWidth>${detectionFormData.value.plateSize.maxWidth * 100}</MaxWidth>
                                    <MaxHeight>${detectionFormData.value.plateSize.maxWidth * 100}</MaxHeight>
                                </item>
                            </plateSize>
                            <regionInfo type='list'>
                                ${detectionFormData.value.regionInfo
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <X1>${item.X1}</X1>
                                                <Y1>${item.Y1}</Y1>
                                                <X2>${item.X2}</X2>
                                                <Y2>${item.Y2}</Y2>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </regionInfo>
                            <plateSupportArea>${detectionFormData.value.plateSupportArea}</plateSupportArea>
                            <capturePlateAbsenceVehicle>${detectionFormData.value.capturePlateAbsenceVehicle}</capturePlateAbsenceVehicle>
                            ${detectionPageData.value.isShowDirection ? `<vehicleDirection>${detectionFormData.value.direction}</vehicleDirection>` : ''}
                            <plateExposure>
                                <switch>${detectionFormData.value.exposureSwitch}</switch>
                                <exposureValue>${detectionFormData.value.exposureValue}</exposureValue>
                            </plateExposure>
                            <maskArea>
                                ${Object.keys(detectionFormData.value.maskAreaInfo)
                                    .map((key) => {
                                        const item = detectionFormData.value.maskAreaInfo[Number(key)]
                                        return rawXml`
                                            <item>
                                                <point type='list' maxCount='8' count='${item.length}'>
                                                    ${item
                                                        .map((ele) => {
                                                            return rawXml`
                                                            <item>
                                                                <X>${ele.X}</X>
                                                                <Y>${ele.Y}</Y>
                                                            </item>
                                                        `
                                                        })
                                                        .join('')}
                                                </point>
                                            </item>   
                                        `
                                    })
                                    .join('')}
                            </maskArea>
                        </param>
                        <trigger></trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        const setDetectionFormData = async () => {
            const sendXml = getDetectionSaveData()
            openLoading()
            const result = await editVehicleConfig(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (detectionFormData.value.enabledSwitch) {
                    detectionFormData.value.originalSwitch = true
                }

                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                if (currAreaType === 'maskArea') {
                    setAreaView('maskArea')
                }
                refreshInitPage()
                watchDetection.update()
            }
        }

        // 提交车辆识别数据
        const applyDetectionData = () => {
            if (!verification()) return
            checkMutexChl({
                isChange: detectionFormData.value.enabledSwitch && detectionFormData.value.enabledSwitch !== detectionFormData.value.originalSwitch,
                mutexList: detectionFormData.value.mutexList,
                chlName: chlData.value.name,
                tips: 'IDCS_SIMPLE_SMART_VEHICLE_DETECT_TIPS',
            }).then(() => {
                setDetectionFormData()
            })
        }

        // 首次加载成功 播放视频
        watchEffect(() => {
            if (ready.value && watchDetection.ready.value) {
                nextTick(() => play())
            }
        })

        // 添加任务项
        const addTask = () => {
            // 默认有识别成功、陌生车牌两项，添加的最多为3项
            if (taskTabs.value.length === 5) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return false
            }
            const nameId = defaultNameId.find((item) => !haveUseNameId.includes(item))!
            haveUseNameId.push(nameId)
            taskTabs.value.push({
                value: 'whitelist' + nameId,
                label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + nameId,
            })
            matchPageData.value.tab = 'whitelist' + nameId
            matchFormData.value.task.push({
                guid: '',
                id: '',
                ruleType: 'whitelist',
                pluseSwitch: false,
                groupId: [],
                nameId: nameId,
                hintword: '',
                sysAudio: DEFAULT_EMPTY_ID,
                schedule: DEFAULT_EMPTY_ID,
                record: [
                    {
                        value: pageData.value.curChl,
                        label: chlData.value.name,
                    },
                ], //添加的任务默认联动本通道
                alarmOut: [],
                snap: [],
                preset: [],
                trigger: ['msgPushSwitch'],
            })
        }

        // 移除任务项
        const removeTask = () => {
            if (['whitelist', 'stranger'].includes(matchPageData.value.tab)) {
                return false
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                haveUseNameId = haveUseNameId.filter((item) => item !== Number(matchPageData.value.tab[9]))
                taskTabs.value = taskTabs.value.filter((item) => item.value !== matchPageData.value.tab)
                matchFormData.value.task = matchFormData.value.task.filter((item) => {
                    if (item.ruleType === 'whitelist' && item.nameId === Number(matchPageData.value.tab[9])) {
                        if (item.guid) {
                            deleteMatchData(item)
                        }
                    } else {
                        return item
                    }
                })
                matchPageData.value.tab = 'whitelist'
            })
        }

        // 获取车牌分组数据
        const getGroupData = async () => {
            const result = await queryPlateLibrary()
            commLoadResponseHandler(result, ($) => {
                groupList.value = $('content/group/item').map((item) => {
                    const $item = queryXml(item.element)
                    const guid = item.attr('id')
                    const name = $item('name').text()
                    return {
                        guid: guid,
                        name: name,
                    }
                })
            })
        }

        // 获取车牌识别数据
        const getMatchData = async () => {
            watchMatch.reset()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.curChl}</chlId>
                </condition>
            `
            const result = await queryVehicleMatchAlarm(sendXml)

            commLoadResponseHandler(result, ($) => {
                matchFormData.value.hitEnable = $('content/chl/hitEnable').text().bool()
                matchFormData.value.notHitEnable = $('content/chl/notHitEnable').text().bool()
                matchFormData.value.task = $('content/chl/task/item').map((item) => {
                    const $item = queryXml(item.element)
                    const nameId = $item('param/nameId').text().num()
                    haveUseNameId.push(nameId)
                    return {
                        guid: item.attr('guid'),
                        id: item.attr('id'),
                        ruleType: $item('param/ruleType').text(),
                        nameId,
                        pluseSwitch: $item('param/pluseSwitch').text().bool(),
                        groupId: $item('param/groupId/item').map((item) => item.attr('guid')),
                        hintword: $item('param/hint/word').text(),
                        schedule: getScheduleId(pageData.value.scheduleList, $item('schedule').attr('id')),
                        record: $item('trigger/sysRec/chls/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        alarmOut: $item('trigger/alarmOut/alarmOuts/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        snap: $item('trigger/sysSnap/chls/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        preset: $item('trigger/preset/presets/item').map((item) => {
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
                        trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'popMsgSwitch'].filter((item) => {
                            return $item(item).text().bool()
                        }),
                        sysAudio: $item('trigger/sysAudio').attr('id'),
                    }
                })
                matchFormData.value.task.forEach((item, index) => {
                    if (index === 0) {
                        taskTabs.value.push({
                            value: 'whitelist',
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                        })
                        matchPageData.value.taskData = item
                    } else if (index === 1) {
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
                watchMatch.listen()
            })
        }

        // 提交数据参数
        const getMatchSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            ${matchFormData.value.task
                                .map((item) => {
                                    rawXml`
                                        <item guid='${item.guid}' id='${item.id}'>
                                            <param>
                                                <ruleType>${item.ruleType}</ruleType>
                                                <pluseSwitch>${item.pluseSwitch}</pluseSwitch>
                                                <nameId>${item.nameId}</nameId>
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
                                                <buzzerSwitch>${item.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                                                <popMsgSwitch>${item.trigger.includes('popMsgSwitch')}</popMsgSwitch>
                                                <emailSwitch>${item.trigger.includes('emailSwitch')}</emailSwitch>
                                                <msgPushSwitch>${item.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                                                <popVideo>
                                                    <switch>${item.trigger.includes('popVideoSwitch')}</switch>
                                                    <chls>
                                                        <item id='${pageData.value.curChl}'></item>
                                                    </chls>
                                                </popVideo>
                                                <alarmOut>
                                                    <switch>true</switch>
                                                    <alarmOuts type='list'>
                                                        ${item.alarmOut.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </alarmOuts>
                                                </alarmOut>
                                                <preset>
                                                    <switch>${!!item.preset.length}</switch>
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

        // 提交车牌识别数据
        const setMatchData = async () => {
            const sendXml = getMatchSaveData()
            openLoading()
            await editVehicleMatchAlarm(sendXml)
            closeLoading()
            matchPageData.value.tab = 'whitelist'
            watchMatch.update()
        }

        // 删除车牌识别任务项
        const deleteMatchData = async (data: AlarmRecognitionTaskDto) => {
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
        const applyMatchData = async () => {
            if (matchFormData.value.editFlag) {
                await setMatchData()
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            // 侦测区域
            if (stateType === 'VfdArea') {
                detectionFormData.value.regionInfo = $('statenotify/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        X1: $item('X1').text().num(),
                        Y1: $item('Y1').text().num(),
                        X2: $item('X2').text().num(),
                        Y2: $item('Y2').text().num(),
                    }
                })
            }

            // 屏蔽区域
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    detectionFormData.value.maskAreaInfo[detectionPageData.value.maskArea] = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                            isClosed: true,
                        }
                    })
                }
                const errorCode = $('statenotify/errorCode').text().num()
                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    clearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox(Translate('IDCS_INTERSECT'))
                }
            }
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            detectionFormData.value.schedule = getScheduleId(pageData.value.scheduleList, detectionFormData.value.schedule)
        }

        onMounted(async () => {
            openLoading()

            await getScheduleList()
            await getVoiceList()
            await getChlData()

            if (history.state.chlId) {
                if (pageData.value.chlList.some((item) => item.id === history.state.chlId)) {
                    pageData.value.curChl = history.state.chlId
                }
                delete history.state.chlId
            }

            if (!pageData.value.curChl && pageData.value.chlList.length) {
                pageData.value.curChl = pageData.value.chlList[0].id
            }

            closeLoading()

            await changeChl()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                plugin.ExecuteCmd(sendMaxXML)

                const sendMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                plugin.ExecuteCmd(sendMinXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                vehicleDrawer.destroy()
            }
        })

        return {
            supportPlateMatch,
            playerRef,
            notify,
            detectionFormData,
            detectionPageData,
            matchPageData,
            pageData,
            changeChl,
            handlePlayerReady,
            changeTab,
            showAllArea,
            clearArea,
            clearAllArea,
            changeRegionArea,
            changeMaskArea,
            changeContinent,
            blurMinWidth,
            blurMaxWidth,
            showDisplayRange,
            applyDetectionData,
            matchFormData,
            taskTabs,
            groupList,
            addTask,
            removeTask,
            applyMatchData,
            chlData,
            plateAreaOption,
            watchMatch,
            watchDetection,
            closeSchedulePop,
        }
    },
})
