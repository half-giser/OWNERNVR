import {
    BODY_STRUCT_MAPPING,
    CAR_BRAND_MAP,
    CAR_TYPE_MAP,
    COLOR_MAP,
    DEFAULT_NON_VEHICLE_STRUCT_MAPPING,
    DEFAULT_PLATE_VEHICLE_STRUCT_MAPPING,
    DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING,
    DEFAULT_VEHICLE_STRUCT_MAPPING,
    NON_MOTOR_MAP,
    PLATE_COLOR_MAP,
} from '@/utils/const/snap'
import BaseTargetSearchPanel from '@/components/player/BaseTargetSearchPanel.vue'

export default defineComponent({
    components: {
        BaseTargetSearchPanel,
    },
    props: {
        list: {
            type: Array as PropType<WebsocketSnapOnSuccessSnap[]>,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        openType: {
            type: String,
            default: 'normal',
        },
    },
    emits: {
        close() {
            return true
        },
        playRec(item: WebsocketSnapOnSuccessSnap, index: number) {
            return !!item && typeof index === 'number'
        },
        exportPic(item: WebsocketSnapOnSuccessSnap, index: number) {
            return !!item && typeof index === 'number'
        },
        add(item: WebsocketSnapOnSuccessSnap, index: number) {
            return !!item && typeof index === 'number'
        },
        search(item: WebsocketSnapOnSuccessSnap, index: number) {
            return !!item && typeof index === 'number'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        let context: ReturnType<typeof CanvasBase>
        const canvas = ref<HTMLCanvasElement>()
        const systemCaps = useCababilityStore()
        const dateTime = useDateTimeStore()
        const snapImg = ref<HTMLImageElement | null>(null)
        let observer: ResizeObserver | null = null

        const EVENT_TYPE_MAPPING: Record<string, string> = {
            perimeter: Translate('IDCS_INVADE_DETECTION'),
            aoi_entry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            aoi_leave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            pass_line: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            region_statistics: Translate('IDCS_REGION_STATISTICS'),
            video_metavideo: Translate('IDCS_VSD_DETECTION'),
            face_detect: Translate('IDCS_FACE_DETECTION'),
            face_verify: Translate('IDCS_FACE_MATCH'),
            vehicle_plate: Translate('IDCS_PLATE_MATCH'), // 车牌事件，默认展示为：车牌识别-
            pvd: Translate('IDCS_PARKING_DETECTION'),
            fire_detection: Translate('IDCS_FIRE_POINT_DETECTION'),
            crowd_gather: Translate('IDCS_CROWD_GATHERING'),
            loitering: Translate('IDCS_LOITERING_DETECTION'),
        }

        const TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            non_vehicle: Translate('IDCS_NON_VEHICLE'),
            face: Translate('IDCS_FACE'),
            firepoint: Translate('IDCS_FIRE_POINT'),
            vehicle_plate: Translate('IDCS_LICENSE_PLATE_NUM'),
        }

        const PLATE_EVENT_TARGET_TYPE_MAPPING: Record<string, string> = {
            0: '--',
            1: Translate('IDCS_DETECTION_VEHICLE'),
            2: Translate('IDCS_NON_VEHICLE'),
        }

        const COMPARE_STATUS_MAPPING: Record<string, string> = {
            1: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            3: Translate('IDCS_STRANGE_PLATE'),
            4: Translate('IDCS_GROUP_STRANGER'),
            6: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
        }

        const SEX_MAPPING: Record<string, string> = {
            male: Translate('IDCS_MALE'),
            female: Translate('IDCS_FEMALE'),
        }

        const SNAP_TARGET_MAPPING: Record<string, string> = {
            person: 'person_info',
            vehicle: 'car_info',
            vehicle_plate: 'info',
            non_vehicle: 'bike_info',
        }

        const listData = ref<WebsocketSnapOnSuccessSnap[]>([])

        const pageData = ref({
            // 从人脸识别成功打开弹窗
            isFaceCompareOpen: false,
            index: 0,
            type: 'faceCompare',
            // 共用显示抓拍图和上一个下一个按钮
            showSnap: false,
            // 双目热成像ipc显示热成像原图与可见光原图进行切换
            showThermal: false,
            // 人脸对比成功，原图与对比图进行切换
            showFaceCompare: false,
            // 车牌对比，原图与对比图进行切换
            showPlateCompare: false,

            // 画布宽
            canvasWidth: 900,
            // 画布高
            canvasHeight: 500,

            // 抓拍图的宽和高
            snapWidth: 0,
            snapHeight: 0,

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

            // 目标检索按钮状态 on/disabled/default
            searchTargetStatus: 'default',
            showTargetSearch: false,
        })

        // NTA1-3779彻底将人脸识别成功和其他事件分开，从对比图进入需要过滤掉其他事件；从人脸识别成功的原图进入，无需过滤，但无法切换到对比图
        const open = () => {
            const currentItem = prop.list[prop.index]
            pageData.value.type = prop.openType
            if (currentItem.type === 'face_verify' && prop.openType === 'faceCompare') {
                // 人脸对比成功，从对比图打开则显示对比图
                pageData.value.isFaceCompareOpen = true
                pageData.value.showFaceCompare = true
                listData.value = prop.list.filter((item) => {
                    return item.type === 'face_verify'
                })
                pageData.value.index = listData.value.findIndex((item) => {
                    return item.info!.face_id === currentItem.info!.face_id && item.detect_time === currentItem.detect_time && item.info!.face_respo_id === currentItem.info!.face_respo_id
                })
            } else {
                pageData.value.isFaceCompareOpen = false
                pageData.value.showFaceCompare = false
                listData.value = cloneDeep(prop.list)
                pageData.value.index = prop.index
            }
            toggleTab()
            if (pageData.value.showFaceCompare || pageData.value.showPlateCompare) {
                pageData.value.searchTargetStatus = 'disabled'
            } else {
                pageData.value.searchTargetStatus = 'default'
            }
        }

        /**
         * @description 打开弹窗回调
         */
        const opened = () => {
            if (!context) {
                context = CanvasBase(canvas.value!)
            }

            renderCanvas()
        }

        const toggleTab = () => {
            // 双目热成像ipc显示热成像原图，可切换查看可见光原图
            if (isThermalDouble.value) {
                pageData.value.showThermal = true
            } else {
                pageData.value.showThermal = false
            }

            //  车牌对比成功默认显示对比图
            if (isPlateCompare.value) {
                pageData.value.showPlateCompare = true
            } else {
                pageData.value.showPlateCompare = false
            }
        }

        const toggleSearchTarget = () => {
            if (pageData.value.showFaceCompare || pageData.value.showPlateCompare) {
                pageData.value.searchTargetStatus = 'disabled'
            } else {
                pageData.value.searchTargetStatus = 'default'
            }
        }

        const current = computed(() => {
            return listData.value[pageData.value.index] || ([] as WebsocketSnapOnSuccessSnap[])
        })

        // 双目热成像ipc显示热成像原图，可切换查看可见光原图
        // 单目热成像ipc只显示热成像原图，不显示可见光原图
        const isThermalDouble = computed(() => {
            return current.value.optical_scene_pic && current.value.thermal_scene_pic
        })

        // 是否是车牌对比成功
        const isPlateCompare = computed(() => {
            return current.value.type === 'vehicle_plate' && current.value.info?.compare_status === 1
        })

        // 是否支持人脸注册
        const isRegisterBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && current.value.type === 'face_detect') ||
                (pageData.value.type === 'facePanorama' && current.value.type === 'face_verify') ||
                (systemCaps.supportPlateMatch && current.value.type === 'vehicle_plate' && current.value.info!.compare_status !== 1)
            )
        })

        // 事件类型
        const eventType = computed(() => {
            const eventTypeKey = current.value.info?.event_type ?? ''
            let eventValue = (eventTypeKey && EVENT_TYPE_MAPPING[eventTypeKey]) || EVENT_TYPE_MAPPING[current.value.type]

            const compareStatus = current.value.info?.compare_status

            // 判断 compare_status 是否为 undefined 或空字符串
            if (compareStatus) {
                const subEventType = COMPARE_STATUS_MAPPING[compareStatus]

                // 若识别状态码为4，表示陌生人，此时的基本事件类型为人脸识别
                if (current.value.type === 'face_detect' && compareStatus === 4) {
                    eventValue = EVENT_TYPE_MAPPING.face_verify
                }

                if (subEventType) {
                    eventValue += ` - ${subEventType}`
                }

                // 当前事件为车牌侦测(1:车牌识别成功，3：陌生车牌)
                if (current.value.type === 'vehicle_plate' && ![1, 3].includes(compareStatus)) {
                    eventValue = Translate('IDCS_PLATE_DETECTION')
                }
            }
            return eventValue
        })

        // 目标类型
        const targetType = computed(() => {
            const type = current.value.type as string
            if (['face_detect', 'face_verify'].includes(type)) {
                return 'face'
            } else if (type === 'vehicle_plate') {
                return 'vehicle_plate'
            } else if (type === 'boundary' || type === 'fire_detect') {
                return current.value.info?.target_type ?? ''
            }
            return ''
        })

        const targetTypeTxt = computed(() => {
            const type = current.value.type as string
            if (['face_detect', 'face_verify'].includes(type)) {
                return TARGET_TYPE_MAPPING.face
            } else if (type === 'vehicle_plate') {
                const vehicleType = current.value.info?.vehicle_type
                return vehicleType !== undefined && vehicleType !== null ? PLATE_EVENT_TARGET_TYPE_MAPPING[vehicleType] : '--'
            } else if (type === 'boundary' || type === 'fire_detect') {
                const targetTypeVal = current.value.info?.target_type as string
                return TARGET_TYPE_MAPPING[targetTypeVal] ?? ''
            }
            return ''
        })

        const getCurrentPano = computed(() => {
            if (isThermalDouble.value) {
                const panoSrc = pageData.value.showThermal ? current.value.thermal_scene_pic : current.value.optical_scene_pic
                return panoSrc ? (panoSrc.split(',').pop() as string) : undefined
            }
            return current.value.scene_pic ? current.value.scene_pic.split(',').pop() : undefined
        })

        const handlePrev = () => {
            if (pageData.value.index <= 0) {
                return
            }
            pageData.value.index = pageData.value.index - 1
            // 从对比图进入弹窗，下方切换到原图，点击上一个下一个按钮，切换到对比图
            if (pageData.value.isFaceCompareOpen) {
                pageData.value.showFaceCompare = true
                pageData.value.type = 'faceCompare'
            } else {
                pageData.value.showFaceCompare = false
                pageData.value.type = 'normal'
            }
            toggleSearchTarget()
            toggleTab()
        }

        const handleNext = () => {
            if (pageData.value.index >= listData.value.length - 1) {
                return
            }
            pageData.value.index = pageData.value.index + 1
            // 从对比图进入弹窗，下方切换到原图，点击上一个下一个按钮，切换到对比图
            if (pageData.value.isFaceCompareOpen) {
                pageData.value.showFaceCompare = true
                pageData.value.type = 'faceCompare'
            } else {
                pageData.value.showFaceCompare = false
                pageData.value.type = 'normal'
            }
            toggleSearchTarget()
            toggleTab()
        }

        const displayTime = (time: string) => {
            return formatDate(time, dateTime.monthDateYearFormat)
        }

        const displayDate = (date: string | undefined | null) => {
            if (!date) return ''
            return formatDate(date, DEFAULT_YMD_FORMAT)
        }

        const displayGender = (str: string | undefined | null) => {
            if (!str) return ''
            return SEX_MAPPING[str]
        }

        const displayImg = (str: string | undefined | null) => {
            if (!str) return ''
            return wrapBase64Img(str)
        }

        const displayPlateColor = (color: number | undefined | null) => {
            if (!color && color !== 0) return ''
            return Translate(PLATE_COLOR_MAP[color])
        }

        const displayVehicleColor = (color: number | undefined | null) => {
            if (!color && color !== 0) return ''
            return Translate(COLOR_MAP[color])
        }

        const displayVehicleType = (color: number | undefined | null) => {
            if (!color && color !== 0) return ''
            return Translate(CAR_TYPE_MAP[color])
        }

        const displayBrand = (brand: number | undefined | null) => {
            if (!brand && brand !== 0) return ''
            return Translate(CAR_BRAND_MAP[brand])
        }

        const searchTarget = () => {
            if (pageData.value.searchTargetStatus === 'on') {
                pageData.value.searchTargetStatus = 'default'
                pageData.value.showTargetSearch = false
            } else {
                pageData.value.searchTargetStatus = 'on'
                pageData.value.showTargetSearch = true
            }
        }

        const search = () => {
            ctx.emit('search', current.value, pageData.value.index)
        }

        const register = () => {
            ctx.emit('add', current.value, pageData.value.index)
        }

        const exportPic = () => {
            ctx.emit('exportPic', current.value, pageData.value.index)
        }

        const playRec = () => {
            ctx.emit('playRec', current.value, pageData.value.index)
        }

        const close = () => {
            destorySearchTarget()
            ctx.emit('close')
        }

        const destorySearchTarget = () => {
            pageData.value.searchTargetStatus = 'default'
            pageData.value.showTargetSearch = false
        }

        // 显示/隐藏抓拍图和上一个下一个按钮，并监听图片实际宽高，用于判断isCoverTargetBoxTopRight
        const showSnap = (isShow: boolean) => {
            if (pageData.value.searchTargetStatus === 'on') {
                return
            }
            pageData.value.showSnap = isShow
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

        /**
         * @description 根据targetType获取属性信息
         */
        const attributeData = computed(() => {
            const dataList = [] as { name: string; value: string }[]
            const infoType = current.value.info?.target_type as string
            const infoKey = SNAP_TARGET_MAPPING[infoType] as keyof typeof current.value.info
            if ((current.value.type === 'boundary' && current.value.info?.[infoKey]) || current.value.type === 'vehicle_plate') {
                if (targetType.value === 'vehicle_plate') {
                    const data = getStructInfo('vehicle_plate')
                    dataList.push(...data)
                } else {
                    const data = getStructInfo(current.value.info?.target_type as string)
                    dataList.push(...data)
                }

                if (targetType.value === 'vehicle_plate') {
                    const data = getStructInfo('vehiclePlateVehicleStruct')
                    dataList.push(...data)
                }
            }
            return dataList
        })

        // 获取属性信息
        const getStructInfo = (infoType: string) => {
            const dataList = [] as { name: string; value: string }[]
            let attrTextMaxWidth = 0
            let attrTextMaxHeight = 0
            // 获取属性信息
            const infoKey = SNAP_TARGET_MAPPING[infoType]
            const attrObj = current.value.info?.[infoKey as keyof typeof current.value.info] as Record<string, string | number>
            if (infoType === 'person' && attrObj && typeof attrObj === 'object' && !Array.isArray(attrObj)) {
                BODY_STRUCT_MAPPING.forEach((item) => {
                    const key = item.type as keyof typeof attrObj
                    let value = item.map[attrObj[key] as keyof typeof item.map]
                    value = Translate(value)
                    if (item.pre !== null && item.pre !== undefined) {
                        let pre = item.pre.map[attrObj[item.pre.type] as keyof typeof item.pre.map]
                        if ((value = '--')) {
                            value = pre
                            value = Translate(value)
                        } else {
                            pre = attrObj[item.pre.type] === '' ? '' : pre === '--' ? '' : pre
                            value = Translate(pre).formatForLang(Translate(pre))
                        }
                    }

                    if (checkValidStr(value)) {
                        dataList.push({
                            name: value,
                            value: value,
                        })
                        const currAttrTextWidth = getTextWidth(value, 12)
                        if (currAttrTextWidth > attrTextMaxWidth) {
                            attrTextMaxWidth = currAttrTextWidth
                        }
                        attrTextMaxHeight += 25 // 包含margin
                    }
                })
                attrTextMaxWidth += 20 // 包含padding
            } else if (infoType === 'vehicle') {
                if (attrObj && typeof attrObj === 'object' && !Array.isArray(attrObj)) {
                    DEFAULT_VEHICLE_STRUCT_MAPPING.forEach((item) => {
                        const key = item.type as keyof typeof attrObj
                        let value = item.map[attrObj[key] as keyof typeof item.map]
                        value = Translate(value)
                        if ((item.type === 'brand' || item.type === 'brand_type') && !value) {
                            value = Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS')
                        }

                        if (checkValidStr(value)) {
                            dataList.push({
                                name: value,
                                value: value,
                            })
                            const currAttrTextWidth = getTextWidth(value, 12)
                            if (currAttrTextWidth > attrTextMaxWidth) {
                                attrTextMaxWidth = currAttrTextWidth
                            }
                            attrTextMaxHeight += 25 // 包含margin
                        }
                    })
                    attrTextMaxWidth += 20 // 包含padding
                }
            } else if (infoType === 'vehicle_plate') {
                // 过滤掉不需要显示的字段
                const excludeFields = ['owner', 'mobile_phone_number', 'group_name']
                const supportPlateColor = systemCaps.supportPlateColor
                DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING.forEach((item) => {
                    if (excludeFields.includes(item.type)) return
                    const attr = current.value.info
                    const key = item.type as keyof typeof attr
                    const isMapEmpty = item.map && Object.keys(item.map).length === 0
                    let value = ''
                    if (attr) {
                        value = !isMapEmpty ? item.map[attr[key] as keyof typeof item.map] : attr[key]
                        value = Translate(value)
                        // 若车牌事件支持【车牌颜色】的属性，显示【车牌颜色】字段，否则显示未知
                        if (item.type === 'platecolor' && !supportPlateColor) value = ''
                        if (item.type === 'platecolor' && value) {
                            value = Translate('IDCS_PLATE_COLOR_XXX').formatForLang(Translate(value))
                        }
                    }

                    if (checkValidStr(value)) {
                        dataList.push({
                            name: value,
                            value: value,
                        })
                        const currAttrTextWidth = getTextWidth(value, 12)
                        if (currAttrTextWidth > attrTextMaxWidth) {
                            attrTextMaxWidth = currAttrTextWidth
                        }
                        attrTextMaxHeight += 25 // 包含margin
                    }
                })
                attrTextMaxWidth += 20 // 包含padding
            } else if (infoType === 'non_vehicle') {
                DEFAULT_NON_VEHICLE_STRUCT_MAPPING.forEach((item) => {
                    const key = item.type as keyof typeof attrObj
                    let value = item.map[attrObj[key] as keyof typeof item.map]
                    value = Translate(value)

                    if (checkValidStr(value)) {
                        dataList.push({
                            name: value,
                            value: value,
                        })
                        const currAttrTextWidth = getTextWidth(value, 12)
                        if (currAttrTextWidth > attrTextMaxWidth) {
                            attrTextMaxWidth = currAttrTextWidth
                        }
                        attrTextMaxHeight += 25 // 包含margin
                    }
                })
                attrTextMaxWidth += 20 // 包含padding
            } else if (infoType === 'vehiclePlateVehicleStruct') {
                const attr = current.value.info
                DEFAULT_PLATE_VEHICLE_STRUCT_MAPPING.forEach((item) => {
                    if (attr?.vehicle_type === 2 && ['color', 'brand_type'].includes(item.type)) return
                    let value: string = ''
                    const attrKey = item.type as keyof typeof attr
                    if (attr?.[attrKey] !== undefined && attr?.[attrKey] !== null) {
                        const isMapEmpty = item.map && Object.keys(item.map).length === 0
                        value = !isMapEmpty ? item.map[attr[attrKey] as keyof typeof item.map] : attr[attrKey]
                        value = Translate(value)
                    } else {
                        value = Translate('IDCS_UNCONTRAST')
                    }

                    if (item.type === 'brand_type' && !value) {
                        value = Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS')
                    }

                    if (item.type === 'type' && attr?.vehicle_type === 2) {
                        value = NON_MOTOR_MAP[attr[item.type] as keyof typeof NON_MOTOR_MAP]
                        value = Translate(value)
                    }

                    if (item.type === 'color' && checkValidStr(value)) {
                        value = Translate('IDCS_VEHICLE_COLOR_XXX').formatForLang(Translate(value))
                    }

                    if (checkValidStr(value)) {
                        dataList.push({
                            name: value,
                            value: value,
                        })
                        const currAttrTextWidth = getTextWidth(value, 12)
                        if (currAttrTextWidth > attrTextMaxWidth) {
                            attrTextMaxWidth = currAttrTextWidth
                        }
                        attrTextMaxHeight += 25 // 包含margin
                    }
                })
                attrTextMaxWidth += 20 // 包含padding
            }

            // 更新最大宽高
            if (attrTextMaxWidth > pageData.value.attrTextMaxWidth) {
                pageData.value.attrTextMaxWidth = attrTextMaxWidth
            }

            if (attrTextMaxHeight > pageData.value.attrTextMaxHeight) {
                pageData.value.attrTextMaxHeight = attrTextMaxHeight
            }

            return dataList
        }

        /**
         * @description 渲染矩形框
         */
        const renderCanvas = () => {
            if (!context) {
                return
            }
            const attrTextMaxWidth = pageData.value.attrTextMaxWidth
            const attrTextMaxHeight = pageData.value.attrTextMaxHeight
            const { X1, X2, Y1, Y2 } = getRuleBorderArea()
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)
            context.Point2Rect(X1, Y1, X2, Y2, {
                lineWidth: 2,
                strokeStyle: '#0000ff',
            })
            // 目标框距离容器顶部位置
            const targetBoxRectTop = Y1
            // 目标框距离容器左侧位置
            const targetBoxRectLeft = X1
            // 目标框宽度
            const targetBoxRectWidth = Math.abs(X2 - X1)
            // 目标框高度
            const targetBoxRectHeight = Math.abs(Y2 - Y1)
            // 目标框标题宽度（10为边框加padding, 4为富裕出来的宽度, 防止出现省略号显示）
            const attributeTitleWidth = getTextWidth(targetTypeTxt.value, 14) + 10 + 4
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

            if (checkValidStr(targetTypeTxt.value)) {
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

        // 计算获取X1，X2，Y1，Y2
        const getRuleBorderArea = () => {
            if (!current.value.info) {
                return { X1: 0, X2: 0, Y1: 0, Y2: 0 }
            }
            const width = current.value.info!.ptWidth || 10000
            const height = current.value.info!.ptHeight || 10000
            let x1 = 0,
                x2 = 0,
                y1 = 0,
                y2 = 0
            const pointLeftTop = current.value.info!.point_left_top
            const pointRightBottm = current.value.info!.point_right_bottom
            if (pointLeftTop && pointRightBottm) {
                const leftTop = pointLeftTop.slice(1, -1).split(',')
                const rightBottom = pointRightBottm.slice(1, -1).split(',')
                x1 = Number(leftTop[0]) / width
                x2 = Number(rightBottom[0]) / width
                y1 = Number(leftTop[1]) / height
                y2 = Number(rightBottom[1]) / height
            }
            const X1 = x1 * pageData.value.canvasWidth
            const X2 = x2 * pageData.value.canvasWidth
            const Y1 = y1 * pageData.value.canvasHeight
            const Y2 = y2 * pageData.value.canvasHeight
            return { X1, X2, Y1, Y2 }
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

        watch(current, () => {
            renderCanvas()
        })

        // showFaceCompare,showPlateCompare为true时，目标检索置灰
        watch(
            () => [pageData.value.showFaceCompare, pageData.value.showPlateCompare],
            () => {
                toggleSearchTarget()
            },
            { immediate: true },
        )

        return {
            snapImg,
            current,
            pageData,
            attributeData,
            listData,
            open,
            opened,
            canvas,
            displayTime,
            displayDate,
            displayGender,
            displayImg,
            systemCaps,
            isRegisterBtn,
            displayPlateColor,
            displayVehicleColor,
            displayVehicleType,
            displayBrand,
            eventType,
            isThermalDouble,
            isPlateCompare,
            targetTypeTxt,
            getCurrentPano,
            isCoverTargetBoxTopRight,
            handlePrev,
            handleNext,
            searchTarget,
            search,
            register,
            exportPic,
            playRec,
            close,
            showSnap,
            loadImg,
        }
    },
})
