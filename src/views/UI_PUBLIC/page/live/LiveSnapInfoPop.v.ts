/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:09
 * @Description: 抓拍详情弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:20:51
 */
import CanvasBase from '@/utils/canvas/canvasBase'
import { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'
import { DEFAULT_BODY_STRUCT_MAPPING, DEFAULT_NON_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING, DEFAULT_VEHICLE_STRUCT_MAPPING } from '@/utils/const/snap'
import { LiveSnapData } from '@/types/apiType/live'

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据列表
         */
        list: {
            type: Array as PropType<WebsocketSnapOnSuccessSnap[]>,
            required: true,
            default: () => [],
        },
        /**
         * @description
         */
        index: {
            type: Number,
            required: true,
            default: 0,
        },
        dateTimeFormat: {
            type: String,
            required: false,
            default: 'YYYY-MM-DD hh:mm:ss',
        },
    },
    emits: {
        playRec(item: WebsocketSnapOnSuccessSnap) {
            return !!item.type
        },
        search(item: WebsocketSnapOnSuccessSnap) {
            return !!item.type
        },
        add(item: WebsocketSnapOnSuccessSnap) {
            return !!item.type
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 事件类型与文本映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            perimeter: Translate('IDCS_INVADE_DETECTION'),
            aoi_entry: Translate('IDCS_INVADE_DETECTION'),
            aoi_leave: Translate('IDCS_INVADE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            pass_line: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            video_metavideo: Translate('IDCS_VSD_DETECTION'),
            face_detect: Translate('IDCS_FACE_DETECTION'),
            face_verify: Translate('IDCS_FACE_MATCH'),
            vehicle_plate: Translate('IDCS_PLATE_MATCH'), // 车牌事件，默认展示为：车牌识别-
        }

        // 目标类型与文本映射
        const TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            non_vehicle: Translate('IDCS_NON_VEHICLE'),
            face: Translate('IDCS_FACE'),
            vehicle_plate: Translate('IDCS_LICENSE_PLATE_NUM'),
        }

        // 比较状态与文本映射
        const COMPARE_STATUS_MAPPING: Record<number, string> = {
            1: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            3: Translate('IDCS_STRANGE_PLATE'),
            4: Translate('IDCS_GROUP_STRANGER'),
            6: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
        }

        const canvas = ref<HTMLCanvasElement>()

        let context: CanvasBase

        const pageData = ref({
            // 当前索引
            currentIndex: 0,
            // 画布宽
            canvasWidth: 400,
            // 画布高
            canvasHeight: 215,
        })

        /**
         * @description 上一个抓拍数据
         */
        const previous = () => {
            if (pageData.value.currentIndex > 0) {
                pageData.value.currentIndex--
                renderCanvas()
            }
        }

        /**
         * @description 下一个抓拍数据
         */
        const next = () => {
            if (pageData.value.currentIndex < prop.list.length) {
                pageData.value.currentIndex++
                renderCanvas()
            }
        }

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            if (src) {
                return 'data:image/png;base64,' + src
            }
            return ''
        }

        /**
         * @description 格式化时间
         * @param {Number} time
         * @returns {String}
         */
        const displayTime = (time: number) => {
            return formatDate(time, prop.dateTimeFormat)
        }

        // 显示事件类型
        const displayEventType = computed(() => {
            if (!current.value.type) {
                return ''
            }
            let eventValue = EVENT_TYPE_MAPPING[current.value.info.event_type] || EVENT_TYPE_MAPPING[current.value.type]
            if (typeof current.value.info.compare_status === 'number') {
                const subEventType = COMPARE_STATUS_MAPPING[current.value.info.compare_status]
                // 若识别状态码为4，表示陌生人，此时的基本事件类型为人脸识别
                if (current.value.type === 'face_detect' && current.value.info.compare_status === 4) {
                    eventValue = EVENT_TYPE_MAPPING['face_verify']
                }
                if (subEventType) {
                    eventValue += ' - ' + subEventType
                }
                // 当前事件为车牌侦测(1:车牌识别成功，3：陌生车牌)
                if (current.value.type === 'vehicle_plate' && ![1, 3].includes(current.value.info.compare_status)) {
                    eventValue = Translate('IDCS_PLATE_DETECTION')
                }
            }
            return eventValue
        })

        // 显示目标类型
        const displayTargetType = computed(() => {
            if (!current.value.type) {
                return ''
            }
            let targetType = ''
            if (['face_detect', 'face_verify'].includes(current.value.type)) {
                targetType = 'face'
            } else if (current.value.type === 'vehicle_plate') {
                targetType = 'vehicle_plate'
            } else if (current.value.type === 'boundary') {
                targetType = current.value.info.target_type
            }
            return TARGET_TYPE_MAPPING[targetType]
        })

        // 显示信息标题
        const displayInfoTitle = computed(() => {
            if (!current.value.type) {
                return ''
            }
            if ((current.value.type === 'boundary' && (current.value.info.person_info || current.value.info.bike_info || current.value.info.car_info)) || current.value.type === 'vehicle_plate') {
                if (current.value.type === 'vehicle_plate') {
                    return Translate('IDCS_VEHICLE_PLATE_INFO')
                } else {
                    return Translate('IDCS_STRUCT_INFO')
                }
            } else {
                return ''
            }
        })

        /**
         * @description 获取信息列表项
         * @param {String} name
         * @param {String} value
         * @returns {Object}
         */
        const getInfoListItem = (name: string, value: string) => {
            return {
                name: name,
                value: !value || value === '--' ? Translate('IDCS_UNCONTRAST') : value,
            }
        }

        // 显示信息列表
        const displayInfo = computed(() => {
            if (!current.value.type) {
                return []
            }
            if ((current.value.type === 'boundary' && (current.value.info.person_info || current.value.info.bike_info || current.value.info.car_info)) || current.value.type === 'vehicle_plate') {
                if (current.value.info.target_type === 'person') {
                    const type = current.value.info.person_info
                    return DEFAULT_BODY_STRUCT_MAPPING.map((item) => {
                        let value = item.map[type[item.type] as number]
                        if (item.pre) {
                            let pre = item.pre.map[type[item.pre.type] as number]
                            if (value === '--') {
                                value = pre
                            } else {
                                pre = pre === '--' ? '' : pre
                                value = Translate(value).formatForLang(pre)
                            }
                        }
                        return getInfoListItem(Translate(item.name), String(value))
                    })
                }
                if (current.value.info.target_type === 'vehicle') {
                    const type = current.value.info.car_info
                    return DEFAULT_VEHICLE_STRUCT_MAPPING.map((item) => {
                        let value = item.map ? item.map[Number(type[item.type])] : type[item.type]
                        if (item.type === 'brand' && !value) value = Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS')
                        return getInfoListItem(Translate(item.name), String(value))
                    })
                }
                if (current.value.info.target_type === 'non_vehicle') {
                    const type = current.value.info.bike_info
                    return DEFAULT_NON_VEHICLE_STRUCT_MAPPING.map((item) => {
                        const value = item.map[Number(type[item.type])]
                        return getInfoListItem(Translate(item.name), value)
                    })
                }
                if (current.value.type === 'vehicle_plate') {
                    const type = current.value.info as any as Record<string, string>
                    return DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING.filter((item) => {
                        // 识别成功事件的陌生车牌和车牌侦测事件无车主和手机号等信息
                        return !(['owner', 'mobile_phone_number'].includes(item.type) && current.value.info.compare_status !== 1)
                    }).map((item) => {
                        const value = type[item.type]
                        return getInfoListItem(Translate(item.name), value)
                    })
                }
                return []
            } else {
                return []
            }
        })

        /**
         * @description 当前抓拍数据
         */
        const current = computed(() => {
            return prop.list[pageData.value.currentIndex] || new LiveSnapData()
        })

        /**
         * @description 渲染矩形框
         */
        const renderCanvas = () => {
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

            const pointLeftTop = current.value.info.point_left_top
            const pointRightBottm = current.value.info.point_right_bottom
            const ptWidth = current.value.info.ptWidth || 10000
            const ptHeight = current.value.info.ptHeight || 10000
            if (pointLeftTop && pointRightBottm) {
                const leftTop = pointLeftTop.slice(1, pointLeftTop.length - 1).split(',')
                const rightBottom = pointRightBottm.slice(1, pointRightBottm.length - 1).split(',')
                const X1 = (Number(leftTop[0]) / ptWidth) * pageData.value.canvasWidth
                const X2 = (Number(rightBottom[0]) / ptWidth) * pageData.value.canvasWidth
                const Y1 = (Number(leftTop[1]) / ptHeight) * pageData.value.canvasHeight
                const Y2 = (Number(rightBottom[1]) / ptHeight) * pageData.value.canvasHeight
                context.Point2Rect(X1, Y1, X2, Y2, {
                    lineWidth: 2,
                    strokeStyle: '#0000ff',
                })
            }
        }

        /**
         * @description 回放
         */
        const playRec = () => {
            if (!current.value.type) {
                return
            }
            ctx.emit('playRec', current.value)
        }

        /**
         * @description 搜索
         */
        const search = () => {
            if (!current.value.type) {
                return
            }
            ctx.emit('search', current.value)
        }

        /**
         * @description 注册
         */
        const add = () => {
            if (!current.value.type) {
                return
            }
            ctx.emit('add', current.value)
        }

        // 是否显示注册按钮
        const isAddBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && current.value.type === 'face_detect') ||
                current.value.type === 'face_verify' ||
                (systemCaps.supportPlateMatch && current.value.type === 'vehicle_plate' && current.value.info.compare_status !== 1)
            )
        })

        /**
         * @description 打开弹窗时初始化弹窗数据
         */
        const opened = () => {
            if (!context) {
                context = new CanvasBase(canvas.value!)
            }
            pageData.value.currentIndex = prop.index
            renderCanvas()
        }

        /**
         * @description 关闭弹窗，清空画布
         */
        const close = () => {
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)
            ctx.emit('close')
        }

        return {
            canvas,
            previous,
            next,
            close,
            opened,
            pageData,
            current,
            displayBase64Img,
            displayTime,
            displayEventType,
            displayTargetType,
            displayInfo,
            displayInfoTitle,
            playRec,
            search,
            add,
            isAddBtn,
        }
    },
})
