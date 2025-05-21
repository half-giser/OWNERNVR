/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:18
 * @Description: 现场预览-目标检测视图-渲染单个抓拍元素组件
 */

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据
         */
        data: {
            type: Object as PropType<WebsocketSnapOnSuccessSnap>,
            required: true,
        },
        /**
         * @property 边框类型
         */
        border: {
            type: Number,
            default: 0,
        },
    },
    emits: {
        add() {
            return true
        },
        detail() {
            return true
        },
        search() {
            return true
        },
        playRec() {
            return true
        },
    },
    setup(prop) {
        const systemCaps = useCababilityStore()
        const { Translate, getTextDir } = useLangStore()
        const dateTime = useDateTimeStore()

        // 事件类型与文本映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            perimeter: Translate('IDCS_INVADE_DETECTION'),
            aoi_entry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            aoi_leave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            pass_line: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            region_statistics: Translate('IDCS_REGION_STATISTICS'),
            video_metavideo: Translate('IDCS_VSD_DETECTION'),
            pvd: Translate('IDCS_PARKING_DETECTION'),
            fire_detection: Translate('IDCS_FIRE_POINT_DETECTION'),
            crowd_gather: Translate('IDCS_CROWD_GATHERING'),
            loitering: Translate('IDCS_LOITERING_DETECTION'),
        }

        // 目标类型与文本映射
        const TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            non_vehicle: Translate('IDCS_NON_VEHICLE'),
        }

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            if (!src) return ''
            return wrapBase64Img(src)
        }

        /**
         * @description 格式化时间
         * @param {number} time
         * @returns {string}
         */
        const displayTime = (time: number) => {
            return formatDate(time, dateTime.timeFormat)
        }

        // 显示信息
        const displayMsg = computed(() => {
            if (prop.data.type === 'face_detect' && prop.data.info!.compare_status === 4) {
                const strangeMsg = prop.data.info!.text_tip || Translate('IDCS_GROUP_STRANGER')
                return strangeMsg
            }

            if (prop.data.type === 'boundary') {
                const eventType = EVENT_TYPE_MAPPING[prop.data.info!.event_type]
                const targetType = TARGET_TYPE_MAPPING[prop.data.info!.target_type]
                return `${eventType}${targetType ? `(${targetType})` : ''}`
            }

            if (prop.data.type === 'fire_detect') {
                const eventType = EVENT_TYPE_MAPPING[prop.data.info!.event_type]
                const targetType = TARGET_TYPE_MAPPING[prop.data.info!.target_type]
                return `${eventType}${targetType ? `(${targetType})` : ''}`
            }

            return ''
        })

        // 显示边框
        const msgBorder = computed(() => {
            if (prop.data.type === 'face_detect' && prop.data.info!.compare_status === 4) {
                return true
            }

            return false
        })

        // 是否显示信息
        const msgOpacity = computed(() => {
            return prop.data.type === 'face_detect' && prop.data.info!.compare_status !== 4 ? 0 : 1
        })

        // 是否显示注册按钮
        const isAddBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && prop.data.type === 'face_detect') ||
                (prop.data.type === 'face_verify' && prop.data.info!.compare_status !== 6) ||
                (systemCaps.supportPlateMatch && prop.data.type === 'vehicle_plate' && prop.data.info!.compare_status !== 1)
            )
        })

        const loadImg = (e: Event) => {
            const img = e.currentTarget as HTMLImageElement
            if (img.naturalWidth > img.naturalHeight) {
                img.style.objectFit = 'contain'
            } else {
                img.style.objectFit = 'fill'
            }
        }

        return {
            displayBase64Img,
            displayTime,
            displayMsg,
            isAddBtn,
            msgBorder,
            msgOpacity,
            getTextDir,
            loadImg,
        }
    },
})
