/*
 * @Description: AI 事件——更多——视频结构化
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-20 10:15:52
 */
import { AlarmVideoStructureDto, type AlarmChlDto } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { type CheckboxValueType, type TabPaneName } from 'element-plus'
import { type XMLQuery } from '@/utils/xmlParse'
export default defineComponent({
    components: {
        ScheduleManagPop,
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
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const { openNotify } = useNotification()
        const osType = getSystemInfo().platform

        type CanvasAreaType = 'detectionArea' | 'maskArea'
        // 高级设置
        const advancedVisible = ref(false)
        // 视频结构化数据
        const vsdData = ref(new AlarmVideoStructureDto())
        // 播放器
        const playerRef = ref<PlayerInstance>()

        let currAreaType = 'detectionArea' as CanvasAreaType // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const algoChkType: Record<string, string> = {
            instant_model: Translate('IDCS_INSTANT_MODEL'),
            inter_model: Translate('IDCS_INTERVAL_MODEL'),
        }

        const countCycleTypeTip: Record<string, string> = {
            day: Translate('IDCS_TIME_DAY'),
            week: Translate('IDCS_TIME_WEEK'),
            month: Translate('IDCS_TIME_MOUNTH'),
            off: Translate('IDCS_OFF'),
        }

        const imgOsdTypeTip: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            bike: Translate('IDCS_NON_VEHICLE'),
        }

        const osdListTagNameMap: Record<string, string> = {
            sexSwitch: Translate('IDCS_SEX'),
            ageSwitch: Translate('IDCS_AGE'),
            orientationSwitch: Translate('IDCS_DIRECTION'),
            maskSwitch: Translate('IDCS_MASK'),
            hatSwitch: Translate('IDCS_HAT'),
            glassesSwitch: Translate('IDCS_GLASSES'),
            backpackSwitch: Translate('IDCS_BACKPACK'),
            shortsleevesSwitch: Translate('IDCS_LONG_SHORT_SLEEVE'),
            upperbodycolorSwitch: Translate('IDCS_UPPERCOLOR'),
            skirtSwitch: Translate('IDCS_SKIRT'),
            lowerbodycolorSwitch: Translate('IDCS_BLOWERCOLOR'),
            shortsSwitch: Translate('IDCS_LONG_SHORT_TROUSER'),
            colorSwitch: Translate('IDCS_COLOR'),
            categorySwitch: Translate('IDCS_TYPE'),
            brandSwitch: Translate('IDCS_BRAND'),
            bikeTypeSwitch: Translate('IDCS_TYPE'),
        }

        const noneOSD = {
            switch: false,
            X: 0,
            Y: 0,
            osdPersonName: '',
            osdCarName: '',
            osdBikeName: '',
            osdFormat: '',
        }

        const osdCfgCheckedList = ref<string[]>([])

        // 页面数据
        const pageData = ref({
            tab: 'param',
            // 存储原图是否选中
            isSaveSourcePicChecked: false,
            // 存储目标图是否选中
            isSaveTargetPicChecked: false,
            // 存储是否可用
            isSavePicDisabled: false,
            // 高级-识别模式
            algoModelList: [] as SelectOption<string, string>[],
            algoModelDisabled: false,
            algoHoldTimeShow: true,
            // 是否显示全部区域
            isShowAllArea: false,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            // 检测区域，屏蔽区域
            detectArea: 0,
            detectConfiguredArea: [] as boolean[],
            maskArea: -1,
            // 初始是否有数据（添加样式）
            maskConfiguredArea: [] as boolean[],

            // 是否启用自动重置
            autoReset: true,
            timeType: 'day',
            // 重置模式列表
            countCycleTypeList: [] as SelectOption<string, string>[],
            weekOption: [
                {
                    value: '0',
                    label: Translate('IDCS_WEEK_DAY_SEVEN'),
                },
                {
                    value: '1',
                    label: Translate('IDCS_WEEK_DAY_ONE'),
                },
                {
                    value: '2',
                    label: Translate('IDCS_WEEK_DAY_TWO'),
                },
                {
                    value: '3',
                    label: Translate('IDCS_WEEK_DAY_THREE'),
                },
                {
                    value: '4',
                    label: Translate('IDCS_WEEK_DAY_FOUR'),
                },
                {
                    value: '5',
                    label: Translate('IDCS_WEEK_DAY_FIVE'),
                },
                {
                    value: '6',
                    label: Translate('IDCS_WEEK_DAY_SIX'),
                },
            ],
            monthOption: [] as SelectOption<string, string>[],

            imgOsdTypeList: [] as SelectOption<string, string>[],
            osdCheckAll: false,
            osdCfgList: [] as SelectOption<string, string>[],
            osdShowList: [] as string[],
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
        })

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
        let vsdDrawer = new CanvasPolygon({
            el: document.createElement('canvas'),
        })

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin
            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    openNotify(formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`))
                }
                const canvas = player.getDrawbordCanvas(0)
                vsdDrawer = new CanvasPolygon({
                    el: canvas,
                    enable: true,
                    enableOSD: vsdData.value.countOSD.switch,
                    onchange: vsdAreaChange,
                    closePath: vsdClosePath,
                    forceClosePath: vsdForceClosePath,
                    clearCurrentArea: vsdClearCurrentArea,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'OscConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // vsdDrawer初始化时绑定以下函数
        const vsdAreaChange = (
            area: { X1: number; Y1: number; X2: number; Y2: number } | { X: number; Y: number; isClosed?: boolean }[],
            osdInfo: { X: number; Y: number; osdFormat: string } | undefined,
        ) => {
            // 检测区域/屏蔽区域
            if (currAreaType === 'detectionArea') {
                vsdData.value.detectAreaInfo[pageData.value.detectArea] = area as { X: number; Y: number; isClosed: boolean }[]
            } else if (currAreaType === 'maskArea') {
                vsdData.value.maskAreaInfo[pageData.value.maskArea] = area as { X: number; Y: number; isClosed: boolean }[]
            }

            if (osdInfo) {
                vsdData.value.countOSD.X = osdInfo.X
                vsdData.value.countOSD.Y = osdInfo.Y
            }
            showAllArea(pageData.value.isShowAllArea)
        }

        const vsdClosePath = (area: { X: number; Y: number; isClosed?: boolean }[]) => {
            area.forEach((item) => (item.isClosed = true))
            if (currAreaType === 'detectionArea') {
                vsdData.value.detectAreaInfo[pageData.value.detectArea] = area as { X: number; Y: number; isClosed: boolean }[]
            } else if (currAreaType === 'maskArea') {
                vsdData.value.maskAreaInfo[pageData.value.maskArea] = area as { X: number; Y: number; isClosed: boolean }[]
            }
        }

        const vsdForceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }

        const vsdClearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (currAreaType === 'detectionArea') {
                    vsdData.value.detectAreaInfo[pageData.value.detectArea] = []
                } else if (currAreaType === 'maskArea') {
                    vsdData.value.maskAreaInfo[pageData.value.maskArea] = []
                }

                if (mode.value === 'h5') {
                    vsdDrawer && vsdDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
                showAllArea(pageData.value.isShowAllArea)
            })
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const chlData = prop.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: prop.currChlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType === 'mac') {
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
                    plugin.RetryStartChlView(prop.currChlId, chlData.name)
                }
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        // 获取数据
        const getVideoStructureData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await queryVideoMetadata(sendXml)
            commLoadResponseHandler(result, ($) => {
                const param = $('content/chl/param')
                const $param = queryXml(param[0].element)
                const enabledSwitch = $param('switch').text().bool()
                // 识别模式选项
                pageData.value.algoModelList = $('types/algoChkType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: algoChkType[item.text()],
                    }
                })
                // 侦测区域
                const detectAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
                $('boundary/item').forEach((item, index) => {
                    detectAreaInfo[index] = []
                    const $item = queryXml(item.element)
                    $item('point/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        const detectArea = {
                            X: $ele('X').text().num(),
                            Y: $ele('Y').text().num(),
                            isClosed: true,
                        }
                        detectAreaInfo[index].push(detectArea)
                    })
                })
                // 屏蔽区域
                const maskAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
                $('maskArea/item').forEach((item, index) => {
                    maskAreaInfo[index] = []
                    const $item = queryXml(item.element)
                    $item('point/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        const maskArea = {
                            X: $ele('X').text().num(),
                            Y: $ele('Y').text().num(),
                            isClosed: true,
                        }
                        maskAreaInfo[index].push(maskArea)
                    })
                })
                const mutexList = $('mutexList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        object: $item('object').text(),
                        status: $item('status').text().bool(),
                    }
                })
                // 重置信息（循环模式列表）
                $('types/countCycleType/enum').forEach((item) => {
                    if (item.text() !== 'off') {
                        pageData.value.countCycleTypeList.push({
                            value: item.text(),
                            label: countCycleTypeTip[item.text()],
                        })
                    }
                })
                // OSD
                const countOSD = {
                    switch: $param('countOSD/switch').text().bool(),
                    X: $param('countOSD/X').text().num(),
                    Y: $param('countOSD/Y').text().num(),
                    osdPersonName: $param('countOSD/osdPersonName').text(),
                    osdCarName: $param('countOSD/osdCarName').text(),
                    osdBikeName: $param('countOSD/osdBikeName').text(),
                    osdFormat: '',
                    supportCountOSD: $param('countOSD').length > 0,
                    supportPoint: $param('countOSD/X').length > 0 && $param('countOSD/Y').length > 0,
                    supportOsdPersonName: $param('countOSD/osdPersonName').length > 0,
                    supportOsdCarName: $param('countOSD/osdCarName').length > 0,
                    supportBikeName: $param('countOSD/osdBikeName').length > 0,
                }
                countOSD.osdFormat =
                    (countOSD.osdPersonName ? countOSD.osdPersonName + '-# ' : '') +
                    (countOSD.osdCarName ? countOSD.osdCarName + '-# ' : '') +
                    (countOSD.osdBikeName ? countOSD.osdBikeName + '-# ' : '')

                // 图片叠加(OSD)
                pageData.value.imgOsdTypeList = $('types/osdEumType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: imgOsdTypeTip[item.text()],
                    }
                })

                const osdPersonCfgList = [] as { index: string; value: string; tagName: string }[]
                $param('osdConfig/personcfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdPersonCfgList.push({
                            index: item.attr('index'),
                            value: item.text(),
                            tagName,
                        })
                    }
                })

                const osdCarCfgList = [] as { index: string; value: string; tagName: string }[]
                $param('osdConfig/carcfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdCarCfgList.push({
                            index: item.attr('index'),
                            value: item.text(),
                            tagName,
                        })
                    }
                })

                const osdBikeCfgList = [] as { index: string; value: string; tagName: string }[]
                $param('osdConfig/bikecfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdBikeCfgList.push({
                            index: item.attr('index'),
                            value: item.text(),
                            tagName,
                        })
                    }
                })

                vsdData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    schedule: $('content/chl').attr('scheduleGuid'),
                    saveSourcePicture: $param('saveSourcePicture').text(),
                    saveTargetPicture: $param('saveTargetPicture').text(),
                    algoChkModel: $param('algoModel/algoChkModel').text(),
                    intervalCheck: $param('algoModel/intervalCheck').text().num(),
                    intervalCheckMin: $param('algoModel/intervalCheck').attr('min').num(),
                    intervalCheckMax: $param('algoModel/intervalCheck').attr('max').num(),
                    detectAreaInfo,
                    maskAreaInfo,
                    mutexList,
                    countOSD,
                    countPeriod: {
                        countTimeType: $param('countPeriod/countTimeType').text(),
                        day: {
                            date: $param('countPeriod/daily/dateSpan').text(),
                            dateTime: $param('countPeriod/daily/dateTimeSpan').text(),
                        },
                        week: {
                            date: $param('countPeriod/weekly/dateSpan').text(),
                            dateTime: $param('countPeriod/weekly/dateTimeSpan').text(),
                        },
                        month: {
                            date: $param('countPeriod/monthly/dateSpan').text(),
                            dateTime: $param('countPeriod/monthly/dateTimeSpan').text(),
                        },
                    },
                    objectFilter: {
                        car: $param('objectFilter/car/switch').text().bool(),
                        person: $param('objectFilter/person/switch').text().bool(),
                        motorcycle: $param('objectFilter/motor/switch').text().bool(),
                        carSensitivity: $param('objectFilter/car/sensitivity').text().num(),
                        personSensitivity: $param('objectFilter/person/sensitivity').text().num(),
                        motorSensitivity: $param('objectFilter/motor/sensitivity').text().num(),
                    },
                    osdType: $param('osdConfig/osdType').text(),
                    osdPersonCfgList,
                    osdCarCfgList,
                    osdBikeCfgList,
                }
            }).then(() => {
                pageData.value.initComplated = true
                handleVideoStructureData()
            })
        }

        const handleVideoStructureData = () => {
            refreshInitPage()
            // 这里saveSourcePicture为字符串，"false"判断为真
            if (vsdData.value.saveSourcePicture) {
                // 将存储原图/目标图是否选中给到pagedata与元素绑定
                pageData.value.isSaveSourcePicChecked = vsdData.value.saveSourcePicture.bool()
                pageData.value.isSaveTargetPicChecked = vsdData.value.saveTargetPicture.bool()
                pageData.value.isSavePicDisabled = false
            } else {
                pageData.value.isSavePicDisabled = true
            }

            // 识别模式
            if (vsdData.value.algoChkModel && vsdData.value.algoChkModel === 'inter_model') {
                pageData.value.algoHoldTimeShow = true
            } else {
                pageData.value.algoHoldTimeShow = false
            }

            if (vsdData.value.algoChkModel) {
                pageData.value.algoModelDisabled = false
            } else {
                pageData.value.algoModelDisabled = true
            }

            // 重置信息
            pageData.value.autoReset = vsdData.value.countPeriod.countTimeType !== 'off'
            // 图片叠加(OSD)
            if (vsdData.value.osdType === 'person') {
                // OSD-人
                getOsdCfgHtml(vsdData.value.osdPersonCfgList)
                judgeCheckAll(vsdData.value.osdPersonCfgList)
                getOsdShowListHtml(vsdData.value.osdPersonCfgList)
            } else if (vsdData.value.osdType === 'vehicle') {
                // OSD-汽车
                getOsdCfgHtml(vsdData.value.osdCarCfgList)
                judgeCheckAll(vsdData.value.osdCarCfgList)
                getOsdShowListHtml(vsdData.value.osdCarCfgList)
            } else if (vsdData.value.osdType === 'bike') {
                // OSD-摩托车
                getOsdCfgHtml(vsdData.value.osdBikeCfgList)
                judgeCheckAll(vsdData.value.osdBikeCfgList)
                getOsdShowListHtml(vsdData.value.osdBikeCfgList)
            }

            setAreaView('detectionArea')
        }

        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            // 区域状态
            for (const key in vsdData.value.detectAreaInfo) {
                if (vsdData.value.detectAreaInfo[key].length > 0) {
                    pageData.value.detectConfiguredArea[key] = true
                } else {
                    pageData.value.detectConfiguredArea[key] = false
                }
            }

            for (const key in vsdData.value.maskAreaInfo) {
                if (vsdData.value.maskAreaInfo[key].length > 0) {
                    pageData.value.maskConfiguredArea[key] = true
                } else {
                    pageData.value.maskConfiguredArea[key] = false
                }
            }

            // OSD状态
            if (vsdData.value.countOSD) {
                const osdPersonName = vsdData.value.countOSD.osdPersonName
                const osdCarName = vsdData.value.countOSD.osdCarName
                const osdBikeName = vsdData.value.countOSD.osdBikeName
                vsdData.value.countOSD.osdFormat = (osdPersonName ? osdPersonName + '-# ' : '') + (osdCarName ? osdCarName + '-# ' : '') + (osdBikeName ? osdBikeName + '-# ' : '')
            }

            if (pageData.value.tab === 'param') {
                setEnableOSD()
            }
        }

        const tabChange = (name: TabPaneName) => {
            if (name === 'param') {
                setAreaView(currAreaType)
                if (mode.value === 'h5') {
                    vsdDrawer.setEnable(true)
                    vsdDrawer.setOSDEnable(vsdData.value.countOSD.switch)
                    vsdDrawer.init(true)
                } else {
                    const osdData = vsdData.value.countOSD ? vsdData.value.countOSD : noneOSD
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(osdData, 'vsd')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('EDIT_ON')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                        play()
                    }, 100)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            } else if (name === 'detection') {
                if (mode.value === 'h5') {
                    vsdDrawer.clear()
                    vsdDrawer.setEnable(false)
                    vsdDrawer.setOSDEnable(false)
                    vsdDrawer.init(true)
                } else {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(noneOSD, 'vsd')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                        play()
                    }, 100)
                }
                showAllArea(false)
            } else if (name === 'image') {
                if (mode.value === 'h5') {
                    vsdDrawer.clear()
                    vsdDrawer.setEnable(false)
                    vsdDrawer.setOSDEnable(false)
                    vsdDrawer.init(true)
                } else {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(noneOSD, 'vsd')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                        play()
                    }, 100)
                }
                showAllArea(false)
            }
        }

        // 是否显示全部区域
        const showAllArea = (value: CheckboxValueType) => {
            vsdDrawer && vsdDrawer.setEnableShowAll(value as boolean)
            if (value) {
                const detectAreaInfo = vsdData.value.detectAreaInfo
                const maskAreaInfo = vsdData.value.maskAreaInfo
                if (mode.value === 'h5') {
                    let index = -1
                    if (currAreaType === 'detectionArea') {
                        index = pageData.value.detectArea
                    } else if (currAreaType === 'maskArea') {
                        index = pageData.value.maskArea
                    }
                    vsdDrawer.setCurrAreaIndex(index, currAreaType)
                    vsdDrawer.drawAllPolygon(detectAreaInfo, maskAreaInfo, currAreaType, index, true)
                } else {
                    setTimeout(() => {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: Object.values(detectAreaInfo), maskAreaInfo: Object.values(maskAreaInfo) }, 'IrregularPolygon', 'TYPE_VSD', '', true)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                    }, 100)
                }
            } else {
                if (mode.value !== 'h5') {
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_VSD', '', false)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                }

                if (pageData.value.tab === 'param') {
                    changeArea()
                }
            }
        }

        // 清空
        const clearArea = () => {
            if (currAreaType === 'detectionArea') {
                vsdData.value.detectAreaInfo[pageData.value.detectArea] = []
            } else if (currAreaType === 'maskArea') {
                vsdData.value.maskAreaInfo[pageData.value.maskArea] = []
            }

            if (mode.value === 'h5') {
                vsdDrawer && vsdDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        // 全部清除
        const clearAllArea = () => {
            for (const key in vsdData.value.detectAreaInfo) {
                vsdData.value.detectAreaInfo[key] = []
            }

            for (const key in vsdData.value.maskAreaInfo) {
                vsdData.value.maskAreaInfo[key] = []
            }

            if (mode.value === 'h5') {
                vsdDrawer && vsdDrawer.clear()
            } else {
                // const sendXML = OCX_XML_SetVsdAreaAction("CLEARALL");
                // plugin.GetVideoPlugin().ExecuteCmd(sendXML, sendXML.length);

                const sendXML1 = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_VSD', '', pageData.value.isShowAllArea)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML1!)

                const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        // 区域切换
        const detectAreaChange = () => {
            currAreaType = 'detectionArea'
            pageData.value.maskArea = -1
            changeArea()
        }

        const maskAreaChange = () => {
            currAreaType = 'maskArea'
            pageData.value.detectArea = -1
            changeArea()
        }

        const changeArea = () => {
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()
            // 检测区域/屏蔽区域
            if (currAreaType === 'detectionArea') {
                vsdDrawer && vsdDrawer.setLineStyle('#00ff00', 1.5)
                setAreaView('detectionArea')
            } else if (currAreaType === 'maskArea') {
                vsdDrawer && vsdDrawer.setLineStyle('#d9001b', 1.5)
                setAreaView('maskArea')
            }
        }

        // 设置区域图形
        const setAreaView = (type: string) => {
            if (type === 'detectionArea') {
                const index = pageData.value.detectArea
                if (vsdData.value.detectAreaInfo[index]) {
                    if (mode.value === 'h5') {
                        vsdDrawer.setCurrAreaIndex(index, type)
                        vsdDrawer.setPointList(vsdData.value.detectAreaInfo[index], true)
                    } else {
                        // 从侦测区域切换到屏蔽区域时（反之同理），会先执行侦测区域的清空、不可编辑，再执行屏蔽区域的是否可编辑三个命令
                        // 最后执行渲染画线的命令，加延时的目的是这个过程执行命令过多，插件响应不过来
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetVsdArea(vsdData.value.detectAreaInfo[index], false, index, 'green')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            } else if (type === 'maskArea') {
                const index = pageData.value.maskArea
                if (vsdData.value.maskAreaInfo[index]) {
                    if (mode.value === 'h5') {
                        vsdDrawer.setCurrAreaIndex(index, type)
                        vsdDrawer.setPointList(vsdData.value.maskAreaInfo[index], true)
                    } else {
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetVsdArea(vsdData.value.maskAreaInfo[index], false, index, 'red')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            }

            if (pageData.value.tab === 'param' && pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        // 设置OSD
        const setEnableOSD = () => {
            const enable = vsdData.value.countOSD.switch
            if (mode.value !== 'h5') {
                // 需要插件提供专门在画点多边形情况下显示OSD的插件命令
                const sendXML = OCX_XML_SetVsdAreaInfo(vsdData.value.countOSD, 'vsd')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            } else {
                vsdDrawer.setOSDEnable(enable)
                vsdDrawer.setOSD(vsdData.value.countOSD)
            }
        }

        // 闭合区域
        const setClosed = (poinObjtList: { X: number; Y: number; isClosed: boolean }[]) => {
            poinObjtList.forEach((item) => {
                item.isClosed = true
            })
        }

        // 闭合其他区域
        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
                // 画点-区域
                const boundaryInfoList = []
                const detectAreaInfo = vsdData.value.detectAreaInfo
                const maskAreaInfo = vsdData.value.maskAreaInfo
                for (const key in detectAreaInfo) {
                    boundaryInfoList.push(detectAreaInfo[key])
                }

                for (const key in maskAreaInfo) {
                    boundaryInfoList.push(maskAreaInfo[key])
                }

                if (boundaryInfoList && boundaryInfoList.length > 0) {
                    boundaryInfoList.forEach((boundaryInfo) => {
                        if (boundaryInfo.length >= 3 && vsdDrawer.judgeAreaCanBeClosed(boundaryInfo)) {
                            setClosed(boundaryInfo)
                        }
                    })
                }
            }
        }

        // 原图checkbox
        const saveSourcePicChange = (value: CheckboxValueType) => {
            // saveSourcePicture属性被用于判断其是否禁用，接收为string类型，这里手动赋值
            vsdData.value.saveSourcePicture = value ? 'true' : 'false'
        }

        // 目标图checkbox
        const saveTargetPicChange = (value: CheckboxValueType) => {
            vsdData.value.saveTargetPicture = value ? 'true' : 'false'
        }

        // 识别模式
        const algoModelChange = (value: string) => {
            if (value === 'inter_model') {
                pageData.value.algoHoldTimeShow = true
            } else {
                pageData.value.algoHoldTimeShow = false
            }
        }

        // 时间间隔
        const algoHoldTimeBlur = () => {
            let value = Number(vsdData.value.intervalCheck.toString().replace(/\D/g, ''))
            if (value > vsdData.value.intervalCheckMax) {
                value = vsdData.value.intervalCheckMax
            } else if (value < vsdData.value.intervalCheckMin) {
                value = vsdData.value.intervalCheckMin
            }

            if (!value) {
                value = 1
            }
            vsdData.value.intervalCheck = value
        }

        // 自动重置
        const autoResetChange = (value: CheckboxValueType) => {
            vsdData.value.countPeriod.countTimeType = value ? pageData.value.timeType : 'off'
        }

        // 重置时间模式
        const timeTypeChange = (value: string) => {
            // 自动重置选中时vsdData.value.countPeriod.countTimeType被置为off，不方便直接绑定元素
            // 用pageData.value.timeType绑定页面元素
            vsdData.value.countPeriod.countTimeType = value
        }

        // 手动重置
        const manualResetData = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_RESET_TIP'),
            }).then(async () => {
                const sendXml = rawXml`
                    <content>
                        <chl id="${prop.currChlId}">
                            <param>
                                <forceReset>true</forceReset>
                            </param>
                        </chl>
                    </content>
                `
                const result = await editVideoMetadata(sendXml)
                commSaveResponseHadler(result)
            })
        }

        // 图片叠加
        const osdTypeChange = (value: string) => {
            if (value === 'person') {
                // OSD-人
                getOsdCfgHtml(vsdData.value.osdPersonCfgList)
                judgeCheckAll(vsdData.value.osdPersonCfgList)
                getOsdShowListHtml(vsdData.value.osdPersonCfgList)
            } else if (value === 'vehicle') {
                // OSD-汽车
                getOsdCfgHtml(vsdData.value.osdCarCfgList)
                judgeCheckAll(vsdData.value.osdCarCfgList)
                getOsdShowListHtml(vsdData.value.osdCarCfgList)
            } else if (value === 'bike') {
                // OSD-摩托车
                getOsdCfgHtml(vsdData.value.osdBikeCfgList)
                judgeCheckAll(vsdData.value.osdBikeCfgList)
                getOsdShowListHtml(vsdData.value.osdBikeCfgList)
            }
        }

        const osdCfgCheckListChange = (value: CheckboxValueType[]) => {
            if (vsdData.value.osdType === 'person') {
                // OSD-人
                vsdData.value.osdPersonCfgList.forEach((item) => {
                    item.value = value.includes(item.index) ? 'true' : 'false'
                })
                judgeCheckAll(vsdData.value.osdPersonCfgList)
                getOsdShowListHtml(vsdData.value.osdPersonCfgList)
            } else if (vsdData.value.osdType === 'vehicle') {
                // OSD-汽车
                vsdData.value.osdCarCfgList.forEach((item) => {
                    item.value = value.includes(item.index) ? 'true' : 'false'
                })
                judgeCheckAll(vsdData.value.osdCarCfgList)
                getOsdShowListHtml(vsdData.value.osdCarCfgList)
            } else if (vsdData.value.osdType === 'bike') {
                // OSD-摩托车
                vsdData.value.osdBikeCfgList.forEach((item) => {
                    item.value = value.includes(item.index) ? 'true' : 'false'
                })
                judgeCheckAll(vsdData.value.osdBikeCfgList)
                getOsdShowListHtml(vsdData.value.osdBikeCfgList)
            }
        }

        // 页面osd列表
        const getOsdCfgHtml = (list: { index: string; value: string; tagName: string }[]) => {
            pageData.value.osdCfgList = []
            osdCfgCheckedList.value = []
            list.forEach((item) => {
                pageData.value.osdCfgList.push({
                    value: item.index,
                    label: osdListTagNameMap[item.tagName],
                })
                if (item.value === 'true') {
                    osdCfgCheckedList.value.push(item.index)
                }
            })
        }

        // 判断是否全选
        const judgeCheckAll = (list: { index: string; value: string; tagName: string }[]) => {
            pageData.value.osdCheckAll = osdCfgCheckedList.value.length === list.length
        }

        const getOsdShowListHtml = (list: { index: string; value: string; tagName: string }[]) => {
            pageData.value.osdShowList = []
            list.forEach((item) => {
                if (item.value === 'true') {
                    pageData.value.osdShowList.push(osdListTagNameMap[item.tagName])
                }
            })
        }

        // 全选
        const checkAllOsdType = (value: CheckboxValueType) => {
            osdCfgCheckedList.value = []
            if (vsdData.value.osdType === 'person') {
                // OSD-人
                vsdData.value.osdPersonCfgList.forEach((item) => {
                    item.value = value ? 'true' : 'false'
                    if (value) {
                        osdCfgCheckedList.value.push(item.index)
                    }
                })
                getOsdShowListHtml(vsdData.value.osdPersonCfgList)
            } else if (vsdData.value.osdType === 'vehicle') {
                // OSD-汽车
                vsdData.value.osdCarCfgList.forEach((item) => {
                    item.value = value ? 'true' : 'false'
                    if (value) {
                        osdCfgCheckedList.value.push(item.index)
                    }
                })
                getOsdShowListHtml(vsdData.value.osdCarCfgList)
            } else if (vsdData.value.osdType === 'bike') {
                // OSD-摩托车
                vsdData.value.osdBikeCfgList.forEach((item) => {
                    item.value = value ? 'true' : 'false'
                    if (value) {
                        osdCfgCheckedList.value.push(item.index)
                    }
                })
                getOsdShowListHtml(vsdData.value.osdBikeCfgList)
            }
        }

        // 判断osd是否可用
        const checkOsdName = (value: string) => {
            const name = value.replace(' ', '')
            //前端过滤XML中不允许字符：<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]以及键盘上看到的特殊字符：!@#$%^*()-+=:;,./?\\|
            // var reg = /[!@#$%^*()-+=:;,./?\\|<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]/g;
            const reg = /[&$|;`\\/:*?\"<>]/g
            if (!reg.test(name)) return true
            else return false
        }

        // 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
        const verification = () => {
            // 检测区域合法性(视频结构化AI事件中：检测和屏蔽区域都为多边形)
            const detectAreaInfo = vsdData.value.detectAreaInfo
            const maskAreaInfo = vsdData.value.maskAreaInfo
            const allRegionList = []
            for (const key in detectAreaInfo) {
                allRegionList.push(detectAreaInfo[key])
            }

            for (const key in maskAreaInfo) {
                allRegionList.push(maskAreaInfo[key])
            }

            for (const i in allRegionList) {
                const count = allRegionList[i].length
                if (count > 0 && count < 4) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                    return false
                } else if (count > 0 && !vsdDrawer.judgeAreaCanBeClosed(allRegionList[i])) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                    return false
                }
            }
            // 检测OSD名称合法性
            const peopleOsdName = vsdData.value.countOSD.osdPersonName
            const carOsdName = vsdData.value.countOSD.osdCarName
            const bikeOsdName = vsdData.value.countOSD.osdBikeName
            if (!checkOsdName(peopleOsdName) || !checkOsdName(carOsdName) || !checkOsdName(bikeOsdName)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_USER_ERROR_INVALID_PARAM'),
                })
                return false
            }
            return true
        }

        const getVideoStructureSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${vsdData.value.schedule}'>
                        <param>
                            <switch>${vsdData.value.enabledSwitch}</switch>
                            <saveTargetPicture>${vsdData.value.saveTargetPicture}</saveTargetPicture>
                            <saveSourcePicture>${vsdData.value.saveSourcePicture}</saveSourcePicture>
                            <algoModel>
                                <algoChkModel type=algoChkType>${vsdData.value.algoChkModel}</algoChkModel>
                                <intervalCheck type='int' min='${vsdData.value.intervalCheckMin}' max='${vsdData.value.intervalCheckMax}'>${vsdData.value.intervalCheck}</intervalCheck>
                            </algoModel>
                            <boundary type='list' count='4'>
                                ${Object.keys(vsdData.value.detectAreaInfo)
                                    .map((key) => {
                                        const count = vsdData.value.detectAreaInfo[Number(key)].length
                                        return rawXml`
                                            <item>
                                                <point type='list' maxCount='8' count='${count}'>
                                                    ${vsdData.value.detectAreaInfo[Number(key)]
                                                        .map((item) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${item.X}</X>
                                                                    <Y>${item.Y}</Y>
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
                            <maskArea type='list' count='4'>
                                ${Object.keys(vsdData.value.maskAreaInfo)
                                    .map((key) => {
                                        const count = vsdData.value.maskAreaInfo[Number(key)].length
                                        return rawXml`
                                        <item>
                                            <point type='list' maxCount='8' count='${count}'>
                                                ${vsdData.value.maskAreaInfo[Number(key)]
                                                    .map((item) => {
                                                        return rawXml`
                                                            <item>
                                                                <X>${item.X}</X>
                                                                <Y>${item.Y}</Y>
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
                            <objectFilter>
                                <car>
                                    <switch>${vsdData.value.objectFilter.car}</switch>
                                    <sensitivity>${vsdData.value.objectFilter.carSensitivity}</sensitivity>
                                </car>
                                <person>
                                    <switch>${vsdData.value.objectFilter.person}</switch>
                                    <sensitivity>${vsdData.value.objectFilter.personSensitivity}</sensitivity>
                                </person>
                                ${
                                    prop.chlData.accessType === '0'
                                        ? rawXml`
                                            <motor>
                                                <switch>${vsdData.value.objectFilter.motorcycle}</switch>
                                                <sensitivity>${vsdData.value.objectFilter.motorSensitivity}</sensitivity>
                                            </motor>
                                        `
                                        : ''
                                }
                            </objectFilter>
                            <countPeriod>
                                <countTimeType>${vsdData.value.countPeriod.countTimeType}</countTimeType>
                                <daily>
                                    <dateSpan>${vsdData.value.countPeriod.day.date}</dateSpan>
                                    <dateTimeSpan>${vsdData.value.countPeriod.day.dateTime}</dateTimeSpan>
                                </daily>
                                <weekly>
                                    <dateSpan>${vsdData.value.countPeriod.week.date}</dateSpan>
                                    <dateTimeSpan>${vsdData.value.countPeriod.week.date}</dateTimeSpan>
                                </weekly>
                                <monthly>
                                    <dateSpan>${vsdData.value.countPeriod.month.date}</dateSpan>
                                    <dateTimeSpan>${vsdData.value.countPeriod.month.date}</dateTimeSpan>
                                </monthly>
                            </countPeriod>
                            ${
                                vsdData.value.countOSD.supportCountOSD
                                    ? rawXml`
                                        <countOSD>
                                            <switch>${vsdData.value.countOSD.switch}</switch>
                                            ${vsdData.value.countOSD.supportPoint ? `<X>${vsdData.value.countOSD.X}</X>` : ''}
                                            ${vsdData.value.countOSD.supportPoint ? `<Y>${vsdData.value.countOSD.Y}</Y>` : ''}
                                            ${vsdData.value.countOSD.supportOsdPersonName ? `<osdPersonName>${vsdData.value.countOSD.osdPersonName}</osdPersonName>` : ''}
                                            ${vsdData.value.countOSD.supportOsdCarName ? `<osdCarName>${vsdData.value.countOSD.osdCarName}</osdCarName>` : ''}
                                            ${vsdData.value.countOSD.supportBikeName ? `<osdBikeName>${vsdData.value.countOSD.osdBikeName}</osdBikeName>` : ''}
                                        </countOSD>
                                    `
                                    : ''
                            }
                            <osdConfig>
                                <osdType type='osdEumType'>${vsdData.value.osdType}</osdType>
                                <personcfg>
                                    ${vsdData.value.osdPersonCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </personcfg>
                                <carcfg>
                                    ${vsdData.value.osdCarCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </carcfg>
                                <bikecfg>
                                    ${vsdData.value.osdBikeCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </bikecfg>
                            </osdConfig>
                        </param>
                        <trigger></trigger>
                    </chl>
                </content>   
            `

            return sendXml
        }

        const setVideoStructureData = async () => {
            const sendXml = getVideoStructureSaveData()
            openLoading()
            const result = await editOsc(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (vsdData.value.enabledSwitch) {
                    vsdData.value.originalSwitch = true
                }

                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                if (currAreaType === 'detectionArea') {
                    setAreaView('detectionArea')
                } else if (currAreaType === 'maskArea') {
                    setAreaView('maskArea')
                }
                refreshInitPage()
                pageData.value.applyDisabled = true
            }
        }

        const applyVideoStructureData = () => {
            if (!verification()) return
            checkMutexChl({
                isChange: vsdData.value.enabledSwitch && vsdData.value.enabledSwitch !== vsdData.value.originalSwitch,
                tips: 'IDCS_SIMPLE_VIDEO_META_DETECT_TIPS',
                mutexList: vsdData.value.mutexList,
                chlName: prop.chlData.name,
            }).then(() => {
                setVideoStructureData()
            })
        }

        const notify = ($: XMLQuery) => {
            // 侦测区域/屏蔽区域
            if ($("statenotify[@type='PeaArea']").length) {
                // 绘制点线
                if ($('statenotify/points').length > 0) {
                    const point = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                    if (currAreaType === 'detectionArea') {
                        vsdData.value.detectAreaInfo[pageData.value.detectArea] = point as { X: number; Y: number; isClosed: boolean }[]
                    } else if (currAreaType === 'maskArea') {
                        vsdData.value.maskAreaInfo[pageData.value.maskArea] = point as { X: number; Y: number; isClosed: boolean }[]
                    }
                }

                const errorCode = $('statenotify/errorCode').text().num()
                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    vsdClearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                }
            }
            // OSD
            else if ($("statenotify[@type='TripwireLineInfo']").length) {
                const X = $('statenotify/PosInfo/X').text().num()
                const Y = $('statenotify/PosInfo/Y').text().num()
                vsdData.value.countOSD.X = X
                vsdData.value.countOSD.Y = Y
            }
        }

        onMounted(async () => {
            pageData.value.monthOption = Array(31)
                .fill(0)
                .map((_, index) => {
                    const i = (index + 1).toString()
                    return {
                        value: i,
                        label: i,
                    }
                })

            openLoading()
            pageData.value.scheduleList = await buildScheduleList()
            await getVideoStructureData()
            closeLoading()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)

                const sendAllAreaXML = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_VSD', '', false)
                plugin.GetVideoPlugin().ExecuteCmd(sendAllAreaXML!)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                vsdDrawer.destroy()
            }
        })

        watch(
            vsdData,
            () => {
                if (pageData.value.initComplated) {
                    pageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            ScheduleManagPop,
            // 高级设置
            advancedVisible,
            // 存储
            saveSourcePicChange,
            saveTargetPicChange,
            // 播放器
            playerRef,
            notify,
            // 视频结构化数据
            vsdData,
            pageData,
            mode,
            // 播放器就绪
            handlePlayerReady,
            // 识别模式改变
            algoModelChange,
            // 时间间隔
            algoHoldTimeBlur,
            // tab项切换
            tabChange,
            // 显示全部区域
            showAllArea,
            // 清除
            clearArea,
            clearAllArea,
            // 区域切换
            detectAreaChange,
            maskAreaChange,
            // osd显示
            setEnableOSD,
            // 自动重置
            autoResetChange,
            // 时间模式
            timeTypeChange,
            // 手动重置
            manualResetData,
            // 选中的checkbox
            osdCfgCheckedList,
            osdCfgCheckListChange,
            // 全选
            checkAllOsdType,
            // 图片叠加类型
            osdTypeChange,
            applyVideoStructureData,
        }
    },
})
