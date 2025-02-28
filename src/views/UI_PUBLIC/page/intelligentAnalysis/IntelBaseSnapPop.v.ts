/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 19:24:00
 * @Description: 智能分析 - 抓拍详情弹窗
 */
import { DEFAULT_BODY_STRUCT_MAPPING, DEFAULT_NON_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING } from '@/utils/const/snap'

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据列表
         */
        list: {
            type: Array as PropType<IntelSnapPopList[]>,
            required: true,
        },
        /**
         * @property 当前索引
         */
        index: {
            type: Number,
            default: 0,
        },
        /**
         * @property 展示搜索按钮
         */
        showSearch: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        playRec(item: IntelSnapPopList, index: number) {
            return !!item && typeof index === 'number'
        },
        close() {
            return true
        },
        add(item: IntelSnapPopList, index: number) {
            return !!item && typeof index === 'number'
        },
        search(item: IntelSnapPopList, index: number) {
            return !!item && typeof index === 'number'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        let context: ReturnType<typeof CanvasBase>
        const canvas = ref<HTMLCanvasElement>()

        // 允许注册的事件
        const ENABLE_REGISTER_LIST = ['faceDetection', 'faceMatchStranger', 'plateDetection', 'plateMatchStranger']

        // 事件与显示文本的映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            faceDetection: Translate('IDCS_FACE_DETECTION'),
            faceMatchWhiteList: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            faceMatchStranger: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_GROUP_STRANGER'),
            intrusion: Translate('IDCS_INVADE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            passLine: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            videoMetadata: Translate('IDCS_VSD_DETECTION'),
            plateDetection: Translate('IDCS_PLATE_DETECTION'),
            plateMatchWhiteList: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            plateMatchStranger: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_STRANGE_PLATE'),
        }

        // 目标类型与文本映射
        const TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            non_vehicle: Translate('IDCS_NON_VEHICLE'),
            face: Translate('IDCS_FACE'),
            vehicle_plate: Translate('IDCS_LICENSE_PLATE_NUM'),
            car: Translate('IDCS_DETECTION_VEHICLE'), // alias vehicle
            motor: Translate('IDCS_NON_VEHICLE'), // alias non_vehicle
        }

        const UNKNOWN = Translate('IDCS_ENCRYPT_UNKNOWN')

        // 目标类型与属性的映射
        const ATTRIBUTE_MAPPING: Record<string, string[]> = {
            person: ['gender', 'age', 'mask', 'hat', 'galsses', 'backpack', 'upper', 'lower', 'skirt', 'orient'],
            vehicle: ['color', 'type', 'brand'],
            non_vehicle: ['type'],
            plate: ['plateNumber', 'owner', 'mobile_phone_number'],
        }

        const pageData = ref({
            // 当前索引
            currentIndex: 0,
            // 画布宽
            canvasWidth: 400,
            // 画布高
            canvasHeight: 215,
        })

        const current = computed(() => {
            return prop.list[pageData.value.currentIndex] || new IntelSnapPopList()
        })

        const isAddBtn = computed(() => {
            return ENABLE_REGISTER_LIST.includes(current.value.eventType)
        })

        type Option = {
            name: string
            map: Record<number, string>
        }

        const BODY_STRUCT_MAPPING: Record<string, Option> = {}
        Object.keys(DEFAULT_BODY_STRUCT_MAPPING).forEach((index) => {
            const item = DEFAULT_BODY_STRUCT_MAPPING[Number(index)]
            BODY_STRUCT_MAPPING[item.type] = {
                name: Translate(item.name),
                map: item.map,
            }
            BODY_STRUCT_MAPPING[item.type].map = item.map
            if (item.pre) {
                const preItem = item.pre
                BODY_STRUCT_MAPPING[preItem.type] = {
                    name: Translate(preItem.name),
                    map: preItem.map,
                }
            }
        })

        const VEHICLE_STRUCT_MAPPING: Record<string, Option> = {}
        Object.keys(DEFAULT_VEHICLE_STRUCT_MAPPING).forEach((index) => {
            const item = DEFAULT_BODY_STRUCT_MAPPING[Number(index)]
            VEHICLE_STRUCT_MAPPING[item.type] = {
                name: Translate(item.name),
                map: item.map,
            }
        })

        const NON_VEHICLE_STRUCT_MAPPING: Record<string, Option> = {}
        Object.keys(DEFAULT_NON_VEHICLE_STRUCT_MAPPING).forEach((index) => {
            const item = DEFAULT_NON_VEHICLE_STRUCT_MAPPING[Number(index)]
            NON_VEHICLE_STRUCT_MAPPING[item.type] = {
                name: Translate(item.name),
                map: item.map,
            }
        })

        const VEHICLE_PLATE_STRUCT_MAPPING: Record<string, Option> = {}
        Object.keys(DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING).forEach((index) => {
            const item = DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING[Number(index)]
            VEHICLE_PLATE_STRUCT_MAPPING[item.type] = {
                name: Translate(item.name),
                map: item.map,
            }
        })

        /**
         * @description 生成属性的键值对
         * @param attribute
         * @param mapping
         * @param property
         * @returns {string[]}
         */
        const getItem = (attribute: Record<string, string | number>, mapping: Record<string, Option>, property: string) => {
            if (typeof attribute[property] !== 'undefined') {
                const name = mapping[property].name
                const value = mapping[property].map[Number(attribute[property])]
                return {
                    label: name,
                    value: value === '--' ? UNKNOWN : Translate(value),
                }
            } else {
                return {
                    label: '',
                    value: '',
                }
            }
        }

        // 属性列表
        const infoList = computed(() => {
            const targetType = current.value.targetType
            const attribute = current.value.attribute

            let listData: SelectOption<string, string>[] = []

            if (targetType === 'person') {
                listData = ATTRIBUTE_MAPPING.person.map((item) => {
                    if (item === 'upper' || item === 'lower') {
                        const clothPropertyName = item === 'upper' ? 'upper_length' : 'lower_length'
                        const colorPropertyName = item === 'upper' ? 'upper_color' : 'lower_color'

                        let clothName = ''
                        if (typeof attribute[clothPropertyName] !== 'undefined') {
                            const value = BODY_STRUCT_MAPPING[clothPropertyName].map[Number(attribute[clothPropertyName])]
                            clothName = value === '--' ? UNKNOWN : Translate(value)
                        }

                        let clothColor = ''
                        if (typeof attribute[colorPropertyName] !== 'undefined') {
                            const value = BODY_STRUCT_MAPPING[colorPropertyName].map[Number(attribute[colorPropertyName])]
                            clothColor = value === '--' ? UNKNOWN : Translate(value)
                        }

                        const name = BODY_STRUCT_MAPPING[clothPropertyName].name

                        if (clothName === '' && clothColor === '') {
                            return {
                                label: '',
                                value: '',
                            }
                        } else if (clothName === UNKNOWN && clothColor === UNKNOWN) {
                            return {
                                label: name,
                                value: Translate('IDCS_UNCONTRAST'),
                            }
                        } else if (clothName === UNKNOWN && clothColor !== UNKNOWN) {
                            return {
                                label: name,
                                value: clothColor,
                            }
                        } else if (clothName !== UNKNOWN && clothColor === UNKNOWN) {
                            return {
                                label: name,
                                value: clothName.formatForLang(''),
                            }
                        } else {
                            return {
                                label: name,
                                value: clothName.formatForLang(clothColor),
                            }
                        }
                    } else {
                        return getItem(attribute, BODY_STRUCT_MAPPING, item)
                    }
                })
            }

            if (targetType === 'car' || targetType === 'vehicle') {
                listData = ATTRIBUTE_MAPPING.vehicle.map((item) => {
                    return getItem(attribute, VEHICLE_STRUCT_MAPPING, item)
                })
            }

            if (targetType === 'motor' || targetType === 'non_vehicle') {
                listData = ATTRIBUTE_MAPPING.non_vehicle.map((item) => {
                    return getItem(attribute, NON_VEHICLE_STRUCT_MAPPING, item)
                })
            }

            if (targetType === 'plate') {
                listData = ATTRIBUTE_MAPPING.plate.map((item) => {
                    if (item === 'plateNumber') {
                        return {
                            label: VEHICLE_PLATE_STRUCT_MAPPING.plate.name,
                            value: current.value.plateNumber,
                        }
                    }
                    if (typeof attribute[item] !== 'undefined') {
                        return {
                            label: VEHICLE_PLATE_STRUCT_MAPPING[item].name,
                            value: attribute[item] as string,
                        }
                    } else
                        return {
                            label: '',
                            value: '',
                        }
                })
            }

            return listData.filter((item) => !!item.label)
        })

        // 信息标题
        const infoListTitle = computed(() => {
            if (current.value.targetType === 'plate') {
                return Translate('IDCS_VEHICLE_PLATE_INFO')
            } else {
                return Translate('IDCS_STRUCT_INFO')
            }
        })

        /**
         * @description 渲染矩形框
         */
        const renderCanvas = () => {
            if (!context) {
                return
            }
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)
            const X1 = current.value.X1 * pageData.value.canvasWidth
            const X2 = current.value.X2 * pageData.value.canvasWidth
            const Y1 = current.value.Y1 * pageData.value.canvasHeight
            const Y2 = current.value.Y2 * pageData.value.canvasHeight
            context.Point2Rect(X1, Y1, X2, Y2, {
                lineWidth: 2,
                strokeStyle: '#0000ff',
            })
        }

        /**
         * @description 打开弹窗回调
         */
        const open = () => {
            if (!context) {
                context = CanvasBase(canvas.value!)
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

        /**
         * @description 上一个抓拍数据
         */
        const previous = () => {
            if (pageData.value.currentIndex > 0) {
                pageData.value.currentIndex--
            }
        }

        /**
         * @description 下一个抓拍数据
         */
        const next = () => {
            if (pageData.value.currentIndex < prop.list.length) {
                pageData.value.currentIndex++
            }
        }

        /**
         * @description 格式化时间
         * @param {Number} time
         * @returns {String}
         */
        const displayTime = (time: number) => {
            return formatDate(time, dateTime.dateTimeFormat)
        }

        /**
         * @description 显示事件类型文本
         * @param {string} type
         * @returns {string}
         */
        const displayEventType = (type: string) => {
            return EVENT_TYPE_MAPPING[type] || '--'
        }

        /**
         * @description 显示目标类型文本
         * @param {stirng} type
         * @returns {string}
         */
        const displayTargetType = (type: string) => {
            return TARGET_TYPE_MAPPING[type] || '--'
        }

        /**
         * @description 回放
         */
        const playRec = () => {
            ctx.emit('playRec', current.value, pageData.value.currentIndex)
        }

        /**
         * @description 注册
         */
        const add = () => {
            ctx.emit('add', current.value, pageData.value.currentIndex)
        }

        /**
         * @description 搜索
         */
        const search = () => {
            ctx.emit('search', current.value, pageData.value.currentIndex)
        }

        watch(
            () => current.value.panorama,
            () => {
                renderCanvas()
            },
        )

        return {
            open,
            canvas,
            current,
            previous,
            next,
            displayTime,
            displayEventType,
            displayTargetType,
            pageData,
            close,
            playRec,
            add,
            search,
            isAddBtn,
            infoList,
            infoListTitle,
        }
    },
})
