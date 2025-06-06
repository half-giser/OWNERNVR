/*
 * @Description:智能分析-详情
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-20 10:21:10
 */

import { type XMLQuery } from '@/utils/xmlParse'
import type { TableInstance } from 'element-plus'
import dayjs from 'dayjs'
import { VALUE_NAME_MAPPING } from '@/utils/const/snap'

export default defineComponent({
    emits: {
        backup(data: IntelTargetDataItem | IntelTargetIndexItem, type: string) {
            return !!data && typeof type === 'string'
        },
        changeItem(index: string) {
            return typeof index === 'string'
        },
        search() {
            return true
        },
    },
    setup(_props, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()
        const systemCaps = useCababilityStore()
        const route = useRoute()
        const selectRef = ref<SelectInstance>()

        let context: ReturnType<typeof CanvasBase>
        const canvasRef = ref<HTMLCanvasElement>()
        let observer: ResizeObserver | null = null
        const snapImg = ref<HTMLImageElement | null>(null)

        // AI事件类型映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            faceDetection: Translate('IDCS_FACE_DETECTION'),
            faceMatchWhiteList: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            faceMatchStranger: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_GROUP_STRANGER'),
            intrusion: Translate('IDCS_INVADE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            smartEntry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            smartLeave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            passLine: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            regionStatistics: Translate('IDCS_REGION_STATISTICS'),
            plateDetection: Translate('IDCS_PLATE_DETECTION'),
            plateMatchWhiteList: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            plateMatchStranger: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_STRANGE_PLATE'),
            videoMetadata: Translate('IDCS_VSD_DETECTION'),
            openGates: Translate('IDCS_OPEN_GATE_RELEASE'),
            smartLoitering: Translate('IDCS_LOITERING_DETECTION'),
            smartPvd: Translate('IDCS_PARKING_DETECTION'),
            fireDetection: Translate('IDCS_FIRE_POINT_DETECTION'),
        }

        // 目标类型映射：人、车、非
        const TARGET_TYPE_MAPPING: Record<string, string> = {
            humanFace: Translate('IDCS_FACE'),
            humanBody: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            vehiclePlate: Translate('IDCS_LICENSE_PLATE_NUM'),
            nonMotorizedVehicle: Translate('IDCS_NON_VEHICLE'),
        }

        // 车牌类型
        const VEHICLE_STYLE_MAPPING: Record<string, string> = {
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            nonMotorizedVehicle: Translate('IDCS_NON_VEHICLE'),
        }
        // 性别与显示文本映射
        const GENDER_MAPPING: Record<string, string> = {
            male: Translate('IDCS_MALE'),
            female: Translate('IDCS_FEMALE'),
        }

        const pageData = ref({
            // 是否显示详情页
            showDeatilView: false,
            // 当前详情数据的索引
            detailIndex: 0,
            // 详情类型 （抓拍/回放）
            detailType: 'snap',
            // 列表选项
            detailTypeOptions: [
                {
                    label: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
                    value: 'snap',
                    isVisible: true,
                },
                {
                    label: Translate('IDCS_RECORD'),
                    value: 'record',
                    isVisible: true,
                },
            ],
            // 列表类型
            targetMenuType: 'targetEvent',
            // 图表选项
            targetMenuTypeOptions: [
                // 只在按人脸中显示
                {
                    label: Translate('IDCS_PERSON_INFO'),
                    value: 'personInfo',
                    isVisible: false,
                },
                {
                    label: Translate('IDCS_TARGET_EVENT'),
                    value: 'targetEvent',
                    isVisible: true,
                },
            ],
            // 抓拍图
            snapImg: '',
            // 原图
            panoramaImg: '',
            // 播放开始时间
            startTime: '', // 时间格式：'2025-05-15 16:56:48'
            startTimeStamp: 0, // 时间格式：1747299408000
            // 播放结束时间
            endTime: '', // 时间格式：'2025-05-15 16:56:52'
            endTimeStamp: 0, // 时间格式：1747299412000
            // 初始回放时长
            recTimeOrigin: 0,
            // 是否锁定滑块
            lockSlider: false,
            // 当前播放进度的时间戳（单位秒）
            progress: 0,
            // 播放状态: play pause stop ready nodata
            playStatus: 'stop',
            // 是否开启目标检索
            // enableREID: false,
            isDetectTarget: false,
            // 目标检索的图片
            detectTargetImg: '',
            // 是否支持音频
            supportAudio: true,
            // 是否开启声音
            enableAudio: false,
            // 是否置灰声音按钮
            disabledAudio: false,
            // 是否开启POS
            enablePos: false,
            // 是否绘制规则线和目标框，默认绘制
            enableAI: true,
            // 是否全屏（OCX）
            isFullScreen: false,
            // 按钮是否置灰
            iconDisabled: false,
            // 是否置灰上一个按钮
            disabledPre: false,
            // 是否置灰下一个按钮
            disabledNext: false,
            // 倍速按钮获得焦点
            isHoverSpeed: false,
            // 倍速相关
            speedValue: 1,
            speedBtn: 'X1',
            speedBtnTitle: Translate('IDCS_ONE_SPEED'),
            // 回放录像时长
            recPlayTime: 0,
            recPlayTimeList: [] as SelectOption<number, string>[],
            // 事件列表
            eventList: ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT', 'SMDHUMAN', 'SMDVEHICLE'],
            // 目标事件页签目标事件列表数据（按协议返回的顺序）
            targetEventDataNoSort: [] as IntelTargetIndexItem[],
            // 目标事件页签目标事件列表数据（按时间（使用纳秒排序）降序）
            targetEventDataByDesc: [] as IntelTargetIndexItem[],
            // 画布宽
            canvasWidth: 791,
            // 画布高
            canvasHeight: 430,

            // 目标检索按钮状态 on/disabled/default
            searchTargetStatus: 'default',
            // 显示抓拍图
            isShowSnap: false,
            // 显示上一个、下一个按钮
            isShowPrevNextBtn: false,
            // 抓拍图的宽和高
            snapWidth: 0,
            snapHeight: 0,
            // 目标类型
            targetTypeTxt: '',
            // 目标框数据

            targetBoxRectTop: 0,
            targetBoxRectLeft: 0,
            targetBoxRectWidth: 0,
            attributeTitleTop: 0,
            attributeTitleLeft: 0,
            attributeTitleWidth: 0,
            attributeTitleHeight: 0,
            attrTextMaxWidth: 0,
            attrTextMaxHeight: 0,
            attributeRectTop: 0,
            attributeRectLeft: 0,
            // 是否显示目标框标题
            isShowTargetBoxTitle: false,

            //插件抠图显示上一个、下一个按钮相关参数
            // 鼠标在上下按钮区域
            mouseIsOnPreNextDiv: false,
            // 是否已监听插件区域鼠标事件
            isListenPluginMouseEvent: false,
        })

        // 插件区域鼠标移出定时器
        // const pluginMouseoutTimer: NodeJS.Timeout | number = 0

        // 是否是轨迹详情
        const isTrail = ref(false)
        // 搜索页面当前选择抓拍图的index
        const currentIndex = ref('')
        // 当前数据源：需根据isTrail区分是普通抓拍数据还是轨迹数据
        const detailData = ref<(IntelTargetDataItem | IntelTargetIndexItem)[]>([])
        // 当前选择的抓拍图数据
        const currDetailData = ref<IntelTargetDataItem | IntelTargetIndexItem>(new IntelTargetDataItem())
        // 人脸库图片信息
        const personInfoData = ref(new IntelDetailPersonInfo())
        const attributeData = ref<IntelAttributeList[]>([])

        const playerRef = ref<PlayerInstance>()
        const tableRef = ref<TableInstance>()

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        // 抓拍图是否遮挡了目标框的上右部分
        const isCoverTargetBoxTopRight = computed(() => {
            // 获取当前抓拍图的宽和高
            const snapWidth = pageData.value.snapWidth || 250
            const snapHeight = pageData.value.snapHeight || 250
            let isCoverTargetBoxTop = false // 右上角的抓拍图是否遮挡了抓拍图区域（包括目标框，标题，属性列表）的上面部分
            let isCoverTargetBoxRight = false // 右上角的抓拍图是否遮挡了抓拍图区域（包括目标框，标题，属性列表）的右面部分
            if (pageData.value.targetBoxRectTop < snapHeight || pageData.value.attributeTitleTop < snapHeight || pageData.value.attributeRectTop < snapHeight) {
                isCoverTargetBoxTop = true
            }

            if (
                pageData.value.canvasWidth - pageData.value.targetBoxRectLeft - pageData.value.targetBoxRectWidth < snapWidth ||
                pageData.value.canvasWidth - pageData.value.attributeTitleLeft - pageData.value.attributeTitleWidth < snapWidth ||
                pageData.value.canvasWidth - pageData.value.attributeRectLeft - pageData.value.attrTextMaxWidth < snapWidth
            ) {
                isCoverTargetBoxRight = true
            }

            if (isCoverTargetBoxTop && isCoverTargetBoxRight) {
                return true
            }
            return false
        })
        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                plugin?.ExecuteCmd(sendXML)
                plugin?.ExecuteCmd(OCX_XML_SetRecPlayMode('SYNC'))
                // 插件web需要订阅插件区域的鼠标移入移出事件
                if (!pageData.value.isListenPluginMouseEvent) {
                    pageData.value.isListenPluginMouseEvent = true
                    plugin?.ExecuteCmd(OCX_XML_SetScreenMouseEvent(true))
                }
            }
        }

        const init = (dataObj: { isTrail: boolean; currentIndex: string; detailData: (IntelTargetDataItem | IntelTargetIndexItem)[] }) => {
            console.log(detailData)

            isTrail.value = dataObj.isTrail
            currentIndex.value = dataObj.currentIndex
            detailData.value = cloneDeep(dataObj.detailData)
            pageData.value.showDeatilView = true
            if (isTrail.value) {
                // 轨迹详情只显示录像菜单，且自动播放回放视频
                pageData.value.detailType = 'record'
                pageData.value.detailTypeOptions[0].isVisible = false
            } else {
                // 其他详情显示抓拍、录像菜单，默认展示抓拍详情
                pageData.value.detailType = 'snap'
                pageData.value.detailTypeOptions[0].isVisible = true
            }
            // detailData为当前页的全部抓怕图数据，需要通过currentIndex筛选出当前页面数据
            const data = detailData.value.map((item, index) => ({ value: item, index })).filter((item) => item.value.index === currentIndex.value)
            currDetailData.value = cloneDeep(data[0].value)
            pageData.value.detailIndex = data[0].index
            if ((currDetailData.value as IntelTargetDataItem).isDelete || (currDetailData.value as IntelTargetDataItem).isNoData) {
                pageData.value.iconDisabled = true
                return
            }
            personInfoData.value = (currDetailData.value as IntelTargetDataItem).personInfoData

            initPageData()
        }

        const initPageData = () => {
            // 设置回放时长
            const startTimestamp = currDetailData.value.startTime
            const endTimestamp = currDetailData.value.endTime
            pageData.value.startTime = dayjs(startTimestamp * 1000)
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
            pageData.value.endTime = dayjs(endTimestamp * 1000)
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
            pageData.value.recTimeOrigin = endTimestamp - startTimestamp // 目标录像时长
            pageData.value.recPlayTime = pageData.value.recTimeOrigin
            pageData.value.startTimeStamp = startTimestamp
            pageData.value.endTimeStamp = endTimestamp
            initRecPlayTime()

            // 不是人脸库比对图片则隐藏个人信息列表
            if (!(currDetailData.value as IntelTargetDataItem).isFaceFeature) {
                pageData.value.targetMenuTypeOptions[0].isVisible = false
                pageData.value.targetMenuType === 'targetEvent'
            } else {
                pageData.value.targetMenuType === 'personInfo'
                pageData.value.targetMenuTypeOptions[0].isVisible = true
            }

            // 轨迹详情 或者当前选择了录像菜单，则自动开始回放
            if (isTrail.value || pageData.value.detailType === 'record') {
                nextTick(() => {
                    play()
                })
            } else {
                pageData.value.snapImg = (currDetailData.value as IntelTargetDataItem).objPicData.data
                pageData.value.panoramaImg = (currDetailData.value as IntelTargetDataItem).backgroundPicDatas[0].data
                pageData.value.detectTargetImg = (currDetailData.value as IntelTargetDataItem).backgroundPicDatas[0].data.split(',').pop() || ''
                getAttributeData()
                if (pageData.value.targetMenuType === 'targetEvent') {
                    getTargetEventData()
                }
                nextTick(() => {
                    renderCanvas()
                })
            }
        }

        /**
         * @description 设置回放时长下拉列表值
         */
        const initRecPlayTime = () => {
            let recTimeArr = [30, 60, 120, 300, 900]
            pageData.value.recPlayTimeList = []
            // 如果当前的视频时长不在回放时间列表recTimeArr中，则添加到回放时间列表中
            if (!recTimeArr.includes(pageData.value.recTimeOrigin)) {
                recTimeArr = [...recTimeArr, pageData.value.recTimeOrigin].sort((a, b) => a - b)
            }

            recTimeArr.forEach((element) => {
                if (pageData.value.recTimeOrigin > element) return // 过滤掉小于录像时长的选项
                // NTA1-3533 能整除60的显示xx分，不能整除的显示具体的xxx秒
                const itemText = element % 60 > 0 ? displaySecondWithUnit(element) : displayMinuteWithUnit(element / 60)
                pageData.value.recPlayTimeList.push({ value: element, label: itemText })
            })
        }

        /**
         * @description 根据targetType获取属性信息
         */
        const getAttributeData = () => {
            // 只有视频结构化、车牌侦测才有属性信息
            let targetTypeTxt = TARGET_TYPE_MAPPING[currDetailData.value.targetType]

            /**
             * NTA1-3770 当前只有人体、汽车、非机动车、车牌有属性信息
             * 当目标类型为上述类型之一时，去对应的属性节点下获取属性信息显示到页面上
             */
            const targetType = currDetailData.value.targetType
            if (targetType === 'humanBody') {
                const attrObj = (currDetailData.value as IntelTargetDataItem).humanAttrInfo
                getStructInfo(attrObj)
            } else if (targetType === 'vehicle') {
                const attrObj = (currDetailData.value as IntelTargetDataItem).vehicleAttrInfo
                getStructInfo(attrObj)
            } else if (targetType === 'nonMotorizedVehicle') {
                const attrObj = (currDetailData.value as IntelTargetDataItem).nonMotorVehicleAttrInfo
                getStructInfo(attrObj)
            } else if (targetType === 'vehiclePlate') {
                const attrObj = (currDetailData.value as IntelTargetDataItem).plateAttrInfo
                getStructInfo(attrObj)
                // NTA1-3504 当目标类型为车牌号时，title信息来源于vehicleStyle，没有则不显示
                targetTypeTxt = (attrObj as IntelPlateAttrInfoItem).vehicleStyle ? VEHICLE_STYLE_MAPPING[(attrObj as IntelPlateAttrInfoItem).vehicleStyle] : ''
            }
            pageData.value.targetTypeTxt = targetTypeTxt
        }

        /**
         * @description 获取属性信息
         * @param {IntelHumanAttrInfoItem} attrObj 属性信息
         */
        const getStructInfo = (attrObj: IntelHumanAttrInfoItem | IntelVehicleAttrInfoItem | IntelNonMotorVehicleAttrInfoItem | IntelPlateAttrInfoItem) => {
            // 只有视频结构化、车牌侦测才有属性信息
            const dataList = [] as IntelAttributeList[]
            let attrTextMaxWidth = 0
            let attrTextMaxHeight = 0
            for (const attr in attrObj) {
                let content = ''
                // 车牌号、车牌颜色、车辆颜色、需要处理后再显示
                const attrValue = attrObj[attr as keyof typeof attrObj]
                if (attr === 'plateNumber') {
                    content = attrValue
                } else if (attr === 'plateColor' && attrValue) {
                    content = Translate('IDCS_PLATE_COLOR_XXX').formatForLang(Translate(VALUE_NAME_MAPPING[attrValue]))
                } else if (currDetailData.value.targetType === 'vehiclePlate' && attr === 'vehicleColor' && attrValue) {
                    // NTA1-3632 车牌号才拼接车身颜色
                    content = Translate('IDCS_VEHICLE_COLOR_XXX').formatForLang(Translate(VALUE_NAME_MAPPING[attrValue]))
                } else if (attr.indexOf('ClothType') > -1) {
                    // 拼接服装属性
                    content = getClothWithColor(attr, attrObj as IntelHumanAttrInfoItem)
                } else if (attr.indexOf('Color') > -1) {
                    // 返回颜色时肯定会有衣服类型，在处理衣服类型时已经拼接上颜色，所以无需再重复显示颜色
                    content = ''
                } else {
                    content = VALUE_NAME_MAPPING[attrValue] && Translate(VALUE_NAME_MAPPING[attrValue])
                }

                if (checkValidStr(content)) {
                    dataList.push({
                        name: content,
                        value: content,
                    })
                    const currAttrTextWidth = getTextWidth(content, 12)
                    if (currAttrTextWidth > attrTextMaxWidth) {
                        attrTextMaxWidth = currAttrTextWidth
                    }
                    attrTextMaxHeight += 25 // 包含margin
                }
            }
            attrTextMaxWidth += 20 // 包含padding
            // 更新最大宽高
            if (attrTextMaxWidth > pageData.value.attrTextMaxWidth) {
                pageData.value.attrTextMaxWidth = attrTextMaxWidth
            }

            if (attrTextMaxHeight > pageData.value.attrTextMaxHeight) {
                pageData.value.attrTextMaxHeight = attrTextMaxHeight
            }
            attributeData.value = cloneDeep(dataList)
        }

        /**
         * @description 获取衣服+颜色属性
         * @param {string} clothType 服装类型：upperClothType lowerClothType
         * @param {IntelHumanAttrInfoItem} attrObj 属性信息
         */
        const getClothWithColor = (clothType: string, attrObj: IntelHumanAttrInfoItem) => {
            const clothTypeVal = attrObj[clothType as keyof typeof attrObj]
            const colorKey = clothType === 'upperClothType' ? 'upperClothColor' : 'lowerClothColor'
            const colorVal = attrObj[colorKey as keyof typeof attrObj]
            // 服装这里存在以下场景：全部返回衣服类型和颜色、只返回颜色、只返回衣服类型
            let clothTypeLang = ''
            switch (clothTypeVal) {
                case 'longSleeve':
                    clothTypeLang = 'IDCS_COLOR_LONG_SLEEVE'
                    break
                case 'shortSleeve':
                    clothTypeLang = 'IDCS_COLOR_SHORT_SLEEVE'
                    break
                case 'longPants':
                    clothTypeLang = 'IDCS_COLOR_LONG_TROUSER'
                    break
                case 'shortPants':
                    clothTypeLang = 'IDCS_COLOR_SHORT_TROUSER'
                    break
            }

            const colorTxt = colorVal ? Translate(VALUE_NAME_MAPPING[colorVal as keyof typeof attrObj]) : ''
            const clothAttr = clothTypeVal ? Translate(clothTypeLang).formatForLang(colorTxt) : colorTxt
            return clothAttr
        }

        /**
         * @description 播放视频
         */
        const play = async () => {
            if (!ready.value) {
                await new Promise((resolve) => {
                    const stopWatch = watch(ready, (bool) => {
                        if (bool) {
                            stopWatch()
                            resolve(void 0)
                        }
                    })
                })
            }
            pageData.value.playStatus = 'play'
            pageData.value.iconDisabled = false
            pageData.value.progress = pageData.value.startTimeStamp
            if (mode.value === 'h5') {
                player.play({
                    chlID: currDetailData.value.chlID,
                    chlName: currDetailData.value.channelName,
                    startTime: pageData.value.startTimeStamp,
                    endTime: pageData.value.endTimeStamp,
                    streamType: 1,
                    winIndex: 0,
                    showPos: pageData.value.eventList.includes('POS'),
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SearchRec(
                    'RecPlay',
                    pageData.value.startTime,
                    pageData.value.endTime,
                    [0],
                    [currDetailData.value.chlID],
                    [currDetailData.value.channelName],
                    pageData.value.eventList,
                )
                plugin?.ExecuteCmd(sendXML)
            }
            setRecPlayParam()
        }

        /**
         * @description 停止播放
         */
        const stop = () => {
            if (!ready.value) {
                return
            }
            pageData.value.playStatus = 'stop'
            pageData.value.isFullScreen = false
            if (mode.value === 'h5') {
                player.stop(0)
                pageData.value.progress = pageData.value.startTimeStamp
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPlayStatus('STOP')
                plugin?.ExecuteCmd(sendXML)
                pageData.value.progress = pageData.value.startTimeStamp
            }
        }

        /**
         * @description 播放器恢复播放
         */
        const resume = () => {
            if (!ready.value) {
                return
            }

            if (pageData.value.playStatus !== 'stop') {
                if (mode.value === 'h5') {
                    player.resume(0)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPlayStatus('FORWARDS', 0)
                    plugin?.ExecuteCmd(sendXML)
                }
            } else {
                play()
            }
            pageData.value.playStatus = 'play'
        }

        /**
         * @description 暂停播放
         */
        const pause = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.pause(0)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPlayStatus('FORWARDS_PAUSE', 0)
                plugin?.ExecuteCmd(sendXML)
            }
            pageData.value.playStatus = 'pause'
        }

        /**
         * @description seek回放时间点
         * @param {number} timestamp 时间戳，单位 毫秒
         */
        const seek = (timestamp: number) => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'play'
            if (mode.value === 'h5') {
                player.seek(Math.floor(timestamp))
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_RecCurPlayTime([
                    {
                        index: 0,
                        time: getUTCDateByMilliseconds(timestamp),
                        timeStamp: Math.floor(timestamp),
                    },
                ])
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放下一帧
         */
        const nextFrame = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.nextFrame()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_RecNextFrame()
                plugin?.ExecuteCmd(sendXML)
            }
        }

        // 显示/隐藏抓拍图和上一个下一个按钮，并监听图片实际宽高，用于判断isCoverTargetBoxTopRight
        const showSnap = (isShow: boolean) => {
            if (pageData.value.searchTargetStatus === 'on') {
                return
            }
            pageData.value.isShowSnap = isShow
            pageData.value.isShowPrevNextBtn = isShow
            if (isShow) {
                if (snapImg.value) {
                    observer = new ResizeObserver((entries) => {
                        for (const entry of entries) {
                            const { width, height } = entry.contentRect
                            // 这里可以赋值到响应式变量
                            pageData.value.snapWidth = width
                            pageData.value.snapHeight = height
                        }
                    })
                    observer.observe(snapImg.value)
                }
            }
        }

        /**
         * @description 图片按规则自适应父容器
         * 显示规则：
         * 1、如果图片实际尺寸高>=宽，在高>=宽的区域铺满显示；在高<宽的区域按真实比例显示，左右留白
         * 2、如果图片实际尺寸高<宽，在高<=宽的区域铺满显示；在高>宽的区域按真实比例显示，上下留白
         * 3、自动计算图片的尺寸（需要预定义两个类fillImg/scaleImg对应的样式，以及$dom元素水平垂直居中
         * @param {Event} e
         */
        const loadImg = (e: Event) => {
            const img = e.currentTarget as HTMLImageElement
            if (img.naturalWidth > img.naturalHeight) {
                img.style.objectFit = 'contain'
            } else {
                img.style.objectFit = 'fill'
            }
        }

        // 校验当前字符串是否有效
        const checkValidStr = (value: string) => {
            // 属性值为"空"、"--"、"未知"，则不显示
            let validFlag = false
            const invalidStrArr = ['', '--', Translate('IDCS_UNCONTRAST')]
            if (value) {
                if (!invalidStrArr.includes(value) && value.indexOf(Translate('IDCS_UNCONTRAST')) === -1) {
                    validFlag = true
                }
            } else {
                validFlag = false
            }
            return validFlag
        }

        // 获取有文本内容但还未渲染到页面的元素的文本宽度
        const getTextWidth = (str: string, fontSize: number) => {
            // 创建临时元素
            const _span = document.createElement('span')
            // 放入文本
            _span.innerText = str
            // 设置文字大小
            _span.style.fontSize = fontSize + 'px !important'
            // span元素转块级
            _span.style.position = 'absolute'
            // span放入body中
            document.body.appendChild(_span)
            // 获取span的宽度
            const width = _span.offsetWidth
            // 从body中删除该span
            document.body.removeChild(_span)
            // 返回span宽度
            return width
        }

        /**
         * @description 无数据或数据已被删除的界面效果

         */
        // const renderNoDataView = () => {}

        /**
         * @description 渲染矩形目标框绘制和属性信息
         */
        const renderCanvas = async () => {
            if (!context && canvasRef.value) {
                context = CanvasBase(canvasRef.value)
            }

            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)
            pageData.value.canvasWidth = document.querySelector('.picVideoWrap')?.clientWidth || 791
            pageData.value.canvasHeight = document.querySelector('.picVideoWrap')?.clientHeight || 430
            context.getCanvas().width = pageData.value.canvasWidth
            context.getCanvas().height = pageData.value.canvasHeight
            await nextTick()
            const attrTextMaxWidth = pageData.value.attrTextMaxWidth
            const attrTextMaxHeight = pageData.value.attrTextMaxHeight
            const X1 = (currDetailData.value as IntelTargetDataItem).targetTrace.X1 * pageData.value.canvasWidth
            const X2 = (currDetailData.value as IntelTargetDataItem).targetTrace.X2 * pageData.value.canvasWidth
            const Y1 = (currDetailData.value as IntelTargetDataItem).targetTrace.Y1 * pageData.value.canvasHeight
            const Y2 = (currDetailData.value as IntelTargetDataItem).targetTrace.Y2 * pageData.value.canvasHeight
            context.Point2Rect(X1, Y1, X2, Y2, {
                lineWidth: 2,
                strokeStyle: '#0000ff',
            })

            // 绘制属性信息
            // 目标框距离容器顶部位置
            const targetBoxRectTop = Y1
            // 目标框距离容器左侧位置
            const targetBoxRectLeft = X1
            // 目标框宽度
            const targetBoxRectWidth = Math.abs(X2 - X1)
            // 目标框高度
            const targetBoxRectHeight = Math.abs(Y2 - Y1)
            // 目标框标题宽度（10为边框加padding, 4为富裕出来的宽度, 防止出现省略号显示）
            const attributeTitleWidth = getTextWidth(pageData.value.targetTypeTxt, 14) + 10 + 4
            // 目标框标题高度
            const attributeTitleHeight = 20
            let attributeTitleTop = 0
            let attributeTitleLeft = 0
            if (attributeTitleHeight > targetBoxRectTop) {
                if (attributeTitleHeight > pageData.value.canvasHeight - targetBoxRectTop - targetBoxRectHeight) {
                    attributeTitleTop = targetBoxRectTop
                } else {
                    attributeTitleTop = targetBoxRectTop + targetBoxRectHeight
                }
            } else {
                attributeTitleTop = targetBoxRectTop - attributeTitleHeight
            }

            if (attributeTitleWidth > pageData.value.canvasWidth - targetBoxRectLeft) {
                attributeTitleLeft = targetBoxRectLeft + targetBoxRectWidth - attributeTitleWidth
            } else {
                attributeTitleLeft = targetBoxRectLeft
            }
            // 花里胡哨的获取标题和属性列表合适的位置（属性列表）
            let attributeRectTop = 0
            let attributeRectLeft = 0
            if (attrTextMaxHeight > pageData.value.canvasHeight - targetBoxRectTop) {
                if (attrTextMaxHeight > targetBoxRectTop + targetBoxRectHeight) {
                    attributeRectTop = 0
                } else {
                    attributeRectTop = targetBoxRectTop + targetBoxRectHeight - attrTextMaxHeight
                }
            } else {
                attributeRectTop = targetBoxRectTop
            }

            if (attributeTitleWidth > targetBoxRectWidth) {
                // 标题宽度大于目标框宽度
                if (attributeTitleLeft < targetBoxRectLeft) {
                    // 标题右对齐于目标框
                    if (attributeTitleTop < targetBoxRectTop) {
                        // 标题在上方
                        if (attrTextMaxHeight < pageData.value.canvasHeight - targetBoxRectTop) {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        } else {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = attributeTitleLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        }
                    } else {
                        // 标题在下方
                        if (attrTextMaxHeight < targetBoxRectTop + targetBoxRectHeight) {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        } else {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = attributeTitleLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        }
                    }
                } else {
                    // 标题左对齐于目标框
                    if (attributeTitleTop < targetBoxRectTop) {
                        // 标题在上方
                        if (attrTextMaxHeight < pageData.value.canvasHeight - targetBoxRectTop) {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        } else {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - attributeTitleLeft - attributeTitleWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = attributeTitleLeft + attributeTitleWidth
                            }
                        }
                    } else {
                        // 标题在下方
                        if (attrTextMaxHeight < targetBoxRectTop + targetBoxRectHeight) {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                            }
                        } else {
                            if (attrTextMaxWidth > pageData.value.canvasWidth - attributeTitleLeft - attributeTitleWidth) {
                                attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                            } else {
                                attributeRectLeft = attributeTitleLeft + attributeTitleWidth
                            }
                        }
                    }
                }
            } else {
                // 标题宽度小于等于目标框宽度（标题左对齐于目标框）
                if (attrTextMaxWidth > pageData.value.canvasWidth - targetBoxRectLeft - targetBoxRectWidth) {
                    if (attrTextMaxWidth > targetBoxRectLeft) {
                        attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth - attrTextMaxWidth - 2
                        attributeRectTop += 2
                    } else {
                        attributeRectLeft = targetBoxRectLeft - attrTextMaxWidth
                    }
                } else {
                    attributeRectLeft = targetBoxRectLeft + targetBoxRectWidth
                }
            }

            if (checkValidStr(pageData.value.targetTypeTxt)) {
                pageData.value.isShowTargetBoxTitle = true
            } else {
                pageData.value.isShowTargetBoxTitle = false
            }
            pageData.value.targetBoxRectTop = targetBoxRectTop
            pageData.value.targetBoxRectLeft = targetBoxRectLeft
            pageData.value.targetBoxRectWidth = targetBoxRectWidth
            pageData.value.attributeTitleTop = attributeTitleTop
            pageData.value.attributeTitleLeft = attributeTitleLeft
            pageData.value.attributeTitleWidth = attributeTitleWidth
            pageData.value.attributeTitleHeight = attributeTitleHeight
            pageData.value.attributeRectTop = attributeRectTop
            pageData.value.attributeRectLeft = attributeRectLeft
        }

        /**
         * @description 按下播放器控制条
         */
        const handleSliderMouseDown = () => {
            pageData.value.lockSlider = true
        }

        /**
         * @description 松开播放器控制条
         */
        const handleSliderMouseUp = () => {
            setTimeout(() => {
                pageData.value.lockSlider = false
            }, 10)
        }

        /**
         * @description 控制条发生变化
         */
        const handleSliderChange = () => {
            seek(pageData.value.progress - 1)
        }

        /**
         * @description 切换抓拍、回放详情显示
         */
        const changeDetailMenu = () => {
            if ((currDetailData.value as IntelTargetDataItem).isDelete || (currDetailData.value as IntelTargetDataItem).isNoData) return
            if (pageData.value.detailType === 'record') {
                nextTick(() => {
                    play()
                })
            } else {
                pageData.value.iconDisabled = false
            }
            clearTargetDetect()
        }

        /**
         * @description 切换人员信息、事件列表显示
         */
        const changeTargetMenu = (value: string) => {
            pageData.value.targetMenuType = value
        }

        /**
         * @description 播放器进度回调
         * @param timestamp 时间戳（ms）
         */
        const handleTime = (_winIndex: number, _data: TVTPlayerWinDataListItem, timestamp: number) => {
            if (pageData.value.lockSlider) {
                return
            }
            nextTick(() => {
                pageData.value.progress = timestamp / 1000
            })
        }

        /**
         * @description 播放器播放状态回调（H5）
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerStatus = (data: TVTPlayerWinDataListItem[]) => {
            const type = data.length ? 'play' : 'stop'
            pageData.value.playStatus = type
        }

        /**
         * @description WASM播放器播放成功回调
         * @param {number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerSuccess = (_index: number, data: TVTPlayerWinDataListItem) => {
            pageData.value.playStatus = data.PLAY_STATUS
            pageData.value.iconDisabled = false
        }

        /**
         * @description WASM播放器播放结束回调
         * @param {number} _index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayComplete = (_index: number, data: TVTPlayerWinDataListItem) => {
            pageData.value.playStatus = data.PLAY_STATUS
            // NTA1-3729 轨迹页面自动播放下一个录像直至结束
            if (isTrail.value) {
                handleNext()
            }
        }

        /**
         * @description wasm播放器错误回调
         * @param {number} _index
         * @param {Object} data
         * @param {string} error
         */
        const handlePlayerError = (_index: number, data: TVTPlayerWinDataListItem, error?: string) => {
            // 不支持打开音频
            if (error === 'notSupportAudio') {
                openMessageBox(Translate('IDCS_AUDIO_NOT_SUPPORT'))
                pageData.value.supportAudio = false
                pageData.value.enableAudio = false
            }
            // 当前用户打开无音频的权限
            else if (error === 'noPermission') {
                openMessageBox(Translate('IDCS_NO_PERMISSION'))
            }
            // 音频流关闭事件，将对应通道的音频图标置为关闭状态
            else if (error === 'audioClosed') {
                pageData.value.enableAudio = false
            }
            pageData.value.playStatus = data.PLAY_STATUS
        }

        /**
         * @description  插件的上一个、下一个按钮的显示/隐藏逻辑
         */

        const handleMouseMove = (mouseOver: boolean) => {
            // 只在插件回放视频时执行此处理
            if (mode.value !== 'ocx' && pageData.value.detailType !== 'record') return
            pageData.value.mouseIsOnPreNextDiv = mouseOver
        }

        /**
         * @description 向上翻页
         */
        const handlePrev = () => {
            if (pageData.value.detailIndex <= 0) {
                return
            }

            pageData.value.detailIndex--
            pageData.value.disabledPre = pageData.value.detailIndex === 0
            currDetailData.value = detailData.value[pageData.value.detailIndex]
            initPageData()
            ctx.emit('changeItem', currDetailData.value.index)
        }

        /**
         * @description 向下翻页
         */
        const handleNext = () => {
            if (pageData.value.detailIndex >= detailData.value.length - 1) {
                return
            }
            pageData.value.detailIndex++
            pageData.value.disabledNext = pageData.value.detailIndex === detailData.value.length - 1
            currDetailData.value = detailData.value[pageData.value.detailIndex]
            initPageData()
            ctx.emit('changeItem', currDetailData.value.index)
        }

        /**
         * @description 切换回放倍速
         * @param {number} speed
         */
        const changeRecSpeed = (speed: number) => {
            pageData.value.isHoverSpeed = false
            pageData.value.speedValue = speed
            pageData.value.speedBtn = 'X' + speed
            pageData.value.speedBtnTitle = speed === 1 ? Translate('IDCS_ONE_SPEED') : Translate('IDCS_XXX_SPEED').formatForLang(speed)
            setPlaySpeed(speed)
            setVoiceStatus(pageData.value.speedValue)
        }

        /**
         * @description 设置回放倍速
         * @param {number} speed
         */
        const setPlaySpeed = (speed: number) => {
            if (mode.value === 'h5') {
                player.setSpeed(speed)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPlaySpeed(speed)
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换回放时长
         */
        const changeRecPlayTime = () => {
            if (!currDetailData) return
            // 初始回放开始时间戳
            const startTimeOrigin = currDetailData.value.startTime
            // 初始回放结束时间戳
            const endTimeOrigin = currDetailData.value.endTime
            // 初始目标录像时长
            const recTimeOrigin = endTimeOrigin - startTimeOrigin
            // 选择的播放时长等于当前的视频时长时，默认按原视频长度播放
            if (pageData.value.recPlayTime === recTimeOrigin) {
                pageData.value.startTimeStamp = startTimeOrigin
                pageData.value.endTimeStamp = endTimeOrigin
            } else {
                // 手动计算回放时长
                // 此处相关问题单：NTA1-2991 NTA1-3457
                // 预录像时长 = 向下取整[ (用户选择的目标时长 - 当前目标录像时长)/2 ]
                const playTimeStart = Math.floor((pageData.value.recPlayTime - recTimeOrigin) / 2)
                // 后录像时长 = 用户选择的目标时长 - 当前目标录像时长 - 预录像时长
                const playTimeEnd = pageData.value.recPlayTime - recTimeOrigin - playTimeStart
                pageData.value.startTimeStamp = startTimeOrigin - playTimeStart
                pageData.value.endTimeStamp = endTimeOrigin + playTimeEnd
            }
            pageData.value.startTime = dayjs(pageData.value.startTimeStamp * 1000)
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
            pageData.value.endTime = dayjs(pageData.value.endTimeStamp * 1000)
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
            play()
        }

        /**
         * @description 设置回放参数：开启AI绘制、倍数、声音、POS....
         */
        const setRecPlayParam = () => {
            // NTA1-2957 下发回放命令之后需要再次下发RecCurPlayTime命令，插件暂停才生效
            if (mode.value === 'ocx') {
                seek(pageData.value.startTimeStamp)
            }
            // 播放倍数，避免先选择倍数再点击回放时倍数不一致的场景
            setPlaySpeed(pageData.value.speedValue)
            setVoiceStatus(pageData.value.speedValue)
            // POS信息显示与否根据当前页面POS开关的选择状态来决定
            setPOSEnable(pageData.value.enablePos)
            /**插件是根据播放端口来确定需要开启智能信息的视频的，下发setAIInfo的时机调整到Recplay后*/
            setAIInfoEnable(pageData.value.enableAI)
        }

        /**
         * @description 设置声音按钮的状态（非1倍速倍速回放时，不播放声音）
         * @param {number} speed
         */
        const setVoiceStatus = (speed: number) => {
            // NTA1-2900，一倍速以外的回放场景关闭声音
            if (speed === 1) {
                // 当前用户打开无音频的权限
                if (!pageData.value.supportAudio) return
                if (pageData.value.enableAudio) {
                    voiceON()
                }
            } else {
                voiceOFF()
            }
        }

        /**
         * @description 前进/后退跳转设定秒数
         * @param {number} seconds
         */
        const handleJump = (seconds: number) => {
            if (!ready.value) {
                return
            }

            let curTime = pageData.value.progress || 0
            const startTime = pageData.value.startTimeStamp
            const endTime = pageData.value.endTimeStamp
            if (seconds >= 0) {
                curTime = curTime + seconds < endTime ? curTime + seconds : endTime - 1
            } else {
                curTime = curTime + seconds > startTime ? curTime + seconds : startTime
            }

            if (mode.value === 'h5') {
                seek(curTime)
            }

            if (mode.value === 'ocx') {
                const timeValue = localToUtc(pageData.value.startTimeStamp, DEFAULT_DATE_FORMAT)
                const sendXML = OCX_XML_RecCurPlayTime([{ time: timeValue, timeStamp: curTime, index: 0 }])
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 点击目标检测按钮
         */
        const handleSearchTarget = () => {
            if (pageData.value.isDetectTarget) {
                pageData.value.isDetectTarget = false
                if (pageData.value.detailType === 'record') {
                    if (pageData.value.playStatus === 'pause') {
                        resume()
                    }
                }
            } else {
                pageData.value.isDetectTarget = true
                if (pageData.value.detailType === 'record') {
                    pause()
                }

                if (!pageData.value.isFullScreen) {
                    handleFullScreen()
                }
            }
        }

        const handleGoToSearchTargetPage = () => {
            if (pageData.value.isFullScreen) {
                handleFullScreen()
            }
            ctx.emit('search')
        }

        const clearTargetDetect = (isResume = true) => {
            if (pageData.value.isDetectTarget) {
                if (isResume && pageData.value.playStatus === 'pause') {
                    resume()
                }
                pageData.value.isDetectTarget = false
            }
        }

        /**
         * @description 显示AI规则线和目标框
         */
        const handleShowAIMsg = () => {
            const enableAI = !pageData.value.enableAI
            setAIInfoEnable(enableAI)
            pageData.value.enableAI = enableAI
        }

        /**
         * @description 开启关闭POS信息
         * @param {boolean} enableAI
         */
        const setAIInfoEnable = (enableAI: boolean) => {
            const targetId = currDetailData.value.targetID.num()
            if (mode.value === 'h5') {
                player.setShowTargetBox(enableAI)
                player.setDetectTargetData({
                    targetId: targetId,
                    targetType: 1,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SETAIInfo(enableAI, currDetailData.value.targetID)
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 开启关闭回放声音
         */
        const handleVoice = () => {
            const enableAudio = !pageData.value.enableAudio
            if (enableAudio) {
                voiceON()
            } else {
                voiceOFF()
            }
            pageData.value.enableAudio = enableAudio
        }

        /**
         * @description 开启回放声音
         */
        const voiceON = () => {
            if (mode.value === 'h5') {
                player.openAudio(0)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVolume(50)
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 关闭回放声音
         */
        const voiceOFF = () => {
            if (mode.value === 'h5') {
                player.closeAudio(0)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVolume(0)
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 开启关闭POS信息
         */
        const handlePos = () => {
            const enablePos = !pageData.value.enablePos
            setPOSEnable(enablePos)
            pageData.value.enablePos = enablePos
        }

        /**
         * @description 开启关闭POS信息
         * @param {boolean} enablePos
         */
        const setPOSEnable = (enablePos: boolean) => {
            if (mode.value === 'h5') {
                player.togglePos(enablePos)
            }

            if (mode.value === 'ocx') {
                if (enablePos) {
                    const pos = player.getPosInfo(currDetailData.value.chlID)
                    const area = pos.displayPosition
                    const sendXml = OCX_XML_SetPOSDisplayArea(enablePos, 0, area.x, area.y, area.width, area.height, pos.printMode)
                    plugin?.ExecuteCmd(sendXml)
                } else {
                    const sendXml = OCX_XML_SetPOSDisplayArea(false, 0, 0, 0, 0, 0)
                    plugin?.ExecuteCmd(sendXml)
                }
            }
        }

        /**
         * @description 导出图片
         */
        const handleExport = () => {
            ctx.emit('backup', currDetailData.value, pageData.value.detailType === 'snap' ? 'pic' : 'video')
        }

        /**
         * @description 全屏显示 / 退出全屏
         */
        const handleFullScreen = () => {
            const fullScreenElement = document.getElementById('intelDetail-center')
            if (fullScreenElement) {
                if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
                    if (fullScreenElement.requestFullscreen) {
                        fullScreenElement.requestFullscreen()
                    } else if (fullScreenElement.webkitRequestFullscreen) {
                        fullScreenElement.webkitRequestFullscreen()
                    } else if (fullScreenElement.mozRequestFullScreen) {
                        fullScreenElement.mozRequestFullScreen()
                    } else {
                        openMessageBox("This browser doesn't support fullscreen")
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen()
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen()
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen()
                    } else {
                        openMessageBox("Exit fullscreen doesn't work")
                    }
                }
            }
        }

        const handleFullScreenChange = () => {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
                pageData.value.isFullScreen = true

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetESCHook(true)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                pageData.value.isFullScreen = false
                pageData.value.isDetectTarget = false

                if (pageData.value.detailType === 'record' && pageData.value.playStatus === 'play') {
                    play()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetESCHook(false)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            setTimeout(() => {
                renderCanvas()
            }, 50)
        }

        useEventListener(document, 'fullscreenchange', handleFullScreenChange, false)
        useEventListener(document, 'webkitfullscreenchange', handleFullScreenChange, false)
        useEventListener(document, 'mozfullscreenchange', handleFullScreenChange, false)

        /**
         * @description 点击表格行，回放当前行录像
         * @param {IntelTargetIndexItem} data
         */
        const handleClickTarget = async (data: IntelTargetIndexItem) => {
            pageData.value.detailType = 'record'
            changeDetailMenu()
            // 目标事件：从事件对应时间点的前两秒开始回放
            const startTimestamp = data.timeStamp - 2
            // 延时跳转播放，待播放器初始化成功之后再跳转
            setTimeout(() => {
                seek(startTimestamp)
                if (mode.value === 'h5') {
                    player.setDetectTargetData({
                        targetId: data.targetID.num(),
                        targetType: 1,
                    })
                }
            }, 300)
        }

        /**
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number): string => {
            if (timestamp === 0) return ''
            return formatDate(timestamp * 1000, dateTime.dateTimeFormat)
        }

        /**
         * @description 格式化时间文本
         * @param {number} timestamp
         * @returns {String}
         */
        const displayTime = (timestamp: number): string => {
            if (timestamp === 0) return ''
            return formatDate(timestamp * 1000, dateTime.timeFormat)
        }

        /**
         * @description 格式化日期
         * @param {number} timestamp
         * @returns {String}
         */
        const displayDate = (timestamp: number): string => {
            if (timestamp === 0) return ''
            return formatDate(timestamp * 1000, dateTime.dateFormat)
        }

        /**
         * @description 获取性别
         * @param {string} str
         * @returns {String}
         */
        const displayGender = (str: string | undefined | null) => {
            if (!str) return ''
            return GENDER_MAPPING[str]
        }

        /**
         * @description 获取目标事件数据
         * @returns {[]}
         */
        const getTargetEventData = async () => {
            const sendXML = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <searchType>byEventList</searchType>
                    <startTime isUTC="true">${currDetailData.value.startTimeUTC}</startTime>
                    <endTime isUTC="true">${currDetailData.value.endTimeUTC}</endTime>
                    <chls type="list">
                        <item id="${currDetailData.value.chlID}"></item>
                    </chls>
                    <byEventListParams>
                        <targetType>${currDetailData.value.targetType}</targetType>
                        <targetID>${currDetailData.value.targetID}</targetID>
                    </byEventListParams>
                </condition>
            `
            openLoading()
            const res = await searchTargetIndex(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                const targetIndexDatas: IntelTargetIndexItem[] = $('content/results/item').map((item) => {
                    const $item = queryXml(item.element)
                    const index = $item('index').text() // 索引信息,客户端原封不动返回取图
                    const targetID = $item('targetID').text()
                    const targetType = $item('targetType').text()
                    const chlID = $item('chlID').text()
                    const channelName = $item('channelName').text()
                    const timeStamp = $item('timeStamp').text().num() // 这一帧的时间戳
                    const timeStampUTC = $item('timeStampUTC').text() // 这一帧的时间戳 UTC
                    const timeStamp100ns = ('0000000' + $item('timeStamp100ns').text()).slice(-7) // 这一帧的时间戳 100ns
                    const quality = $item('quality').text() // quality
                    const similarity = $item('similarity').text().num() // 相似度
                    const eventType = $item('eventType').text() // eventType
                    const libIndex = $item('libIndex').text().num() // 以图搜索表示是哪张图地搜索结果（用于对比图的展示）
                    const startTime = $item('startTime').text().num() // 目标开始时间戳
                    const startTimeUTC = $item('startTimeUTC').text() // 目标开始时间戳 UTC
                    const endTime = $item('endTime').text().num() // 目标消失的时间戳
                    const endTimeUTC = $item('endTimeUTC').text() // 目标消失的时间戳 UTC
                    return {
                        index,
                        targetID,
                        targetType,
                        chlID,
                        channelName,
                        timeStamp,
                        timeStampUTC,
                        timeStamp100ns,
                        quality,
                        similarity,
                        eventType,
                        libIndex,
                        startTime,
                        startTimeUTC,
                        endTime,
                        endTimeUTC,
                    }
                })
                pageData.value.targetEventDataNoSort = cloneDeep(targetIndexDatas)
                pageData.value.targetEventDataByDesc = targetIndexDatas.sort((a, b) => {
                    const timeStampA = a.timeStamp + a.timeStamp100ns
                    const timeStampB = b.timeStamp + b.timeStamp100ns
                    return timeStampB.num() - timeStampA.num()
                })
            }
        }

        const searchTargetRouteType = computed(() => {
            return route.path.includes('search-target') ? 'refresh' : 'navigate'
        })

        /**
         * @description 设置插件播放状态
         * @param {string} status
         */
        const setStatus = (status: string) => {
            switch (status) {
                case 'FORWARDS_PAUSE':
                    pageData.value.playStatus = 'play'
                    break
                case 'STOP':
                case 'READAY':
                case 'NO_DATA':
                    pageData.value.playStatus = 'stop'
                    pageData.value.disabledAudio = true
                    break
                default:
                    pageData.value.playStatus = 'play'
                    // （非1倍速倍速回放时，不播放声音）
                    if (pageData.value.speedValue === 1) {
                        pageData.value.disabledAudio = false
                    }
                    break
            }
        }

        const marks = computed(() => {
            return pageData.value.targetEventDataNoSort.map((item) => {
                return {
                    value: item.timeStamp,
                    label: EVENT_TYPE_MAPPING[item.eventType],
                }
            })
        })

        /**
         * @description 设置插件显示/隐藏透明区域，用于防止$dom元素被插件遮挡
         * @param {boolean} enable
         */
        const setOCXTransparent = (enable: boolean) => {
            const element = document.querySelector('.base-intel-target-btns')
            if (element) {
                const rect = element.getBoundingClientRect()
                plugin.SetOCXTransparent(enable, rect)
            }
        }

        /**
         * @description 重置播放器
         */
        const reset = () => {
            pageData.value.playStatus = 'stop'
            pageData.value.iconDisabled = false
            pageData.value.progress = pageData.value.startTimeStamp
        }

        /**
         * @description 插件接收消息
         * @param {XMLQuery} $
         */
        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'RecCurPlayTime') {
                if (pageData.value.lockSlider) {
                    return
                }
                const seconds = $('statenotify/win[@index="0"]').text().num()
                pageData.value.progress = seconds
            }

            if (stateType === 'CurrentSelectedWindow') {
                const playStatus = $('statenotify/playStatus').text()
                // 规避连播时播放按钮状态不对的问题
                setStatus(playStatus)
                if (playStatus === 'STOP') {
                    pageData.value.iconDisabled = false
                    // NTA1-3729 轨迹页面自动播放下一个录像直至结束
                    if (isTrail.value) {
                        handleNext()
                    }
                } else if (playStatus === 'NO_DATA') {
                    pageData.value.iconDisabled = true
                }
            }

            if (stateType === 'RecPlay') {
                if ($('statenotify/errorCode').length) {
                    reset()
                }
            }

            // StartViewChl
            if (stateType === 'StartViewChl') {
                const status = $('statenotify/status').text()
                const chlId = $('statenotify/chlId').text()
                const winIndex = $('statenotify/winIndex').text().num()
                if (status.trim() === 'success') {
                    // NTA1-3813 开启回放之后还需再次下发开启声音的指令，插件开启声音才会生效
                    if (pageData.value.enableAudio) {
                        voiceON()
                    }

                    if (systemCaps.supportPOS) {
                        //设置通道是否显示POS信息
                        const pos = player.getPosInfo(chlId)
                        const area = pos.displayPosition
                        const sendXml = OCX_XML_SetPOSDisplayArea(true, winIndex, area.x, area.y, area.width, area.height, pos.printMode)
                        plugin?.ExecuteCmd(sendXml)
                    }
                }
            }

            // ScreenMouseover
            if (stateType === 'ScreenMouseover') {
                selectRef.value?.blur()

                if (pageData.value.isShowPrevNextBtn) {
                    return
                }
                pageData.value.isShowPrevNextBtn = true
                nextTick(() => {
                    setOCXTransparent(true)
                })
            }

            if (stateType === 'ScreenMouseout') {
                setTimeout(() => {
                    if (pageData.value.mouseIsOnPreNextDiv) return
                    // 隐藏上一个、下一个按钮
                    setOCXTransparent(false)
                    nextTick(() => {
                        pageData.value.isShowPrevNextBtn = false
                    })
                }, 10)
            }

            if (stateType === 'ESC') {
                if (pageData.value.isFullScreen) {
                    handleFullScreen()
                }
            }
        }

        const handleSpeedPopoverBeforeEnter = () => {
            selectRef.value?.blur()
        }

        onUnmounted(() => {
            if (mode.value === 'ocx') {
                plugin?.ExecuteCmd(OCX_XML_SetScreenMouseEvent(false))
            }
        })

        onBeforeRouteLeave(() => {
            stop()
        })

        ctx.expose({
            init,
        })

        return {
            mode,
            pageData,
            tableRef,
            canvasRef,
            playerRef,
            systemCaps,
            snapImg,
            detailData,
            currDetailData,
            attributeData,
            personInfoData,
            isTrail,
            EVENT_TYPE_MAPPING,
            isCoverTargetBoxTopRight,
            notify,
            pause,
            resume,
            nextFrame,
            loadImg,
            showSnap,
            displayDate,
            displayTime,
            displayDateTime,
            displayGender,
            handlePlayerReady,
            changeDetailMenu,
            changeTargetMenu,
            handleTime,
            handlePlayerStatus,
            handlePlayerSuccess,
            handlePlayComplete,
            handlePlayerError,
            handleMouseMove,
            handlePrev,
            handleNext,
            handleSliderMouseDown,
            handleSliderMouseUp,
            handleSliderChange,
            changeRecPlayTime,
            changeRecSpeed,
            handleJump,
            handleSearchTarget,
            handleGoToSearchTargetPage,
            handleShowAIMsg,
            handleVoice,
            handlePos,
            handleExport,
            handleFullScreen,
            handleClickTarget,
            clearTargetDetect,
            marks,
            searchTargetRouteType,
            selectRef,
            handleSpeedPopoverBeforeEnter,
        }
    },
})
