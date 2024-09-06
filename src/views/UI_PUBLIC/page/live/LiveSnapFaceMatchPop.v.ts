/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:09:59
 * @Description: 人脸比对弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:12:50
 */
import { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'
import { LiveSnapData } from '@/types/apiType/live'
import LiveSnapShotPop from './LiveSnapShotPop.vue'

export default defineComponent({
    components: {
        LiveSnapShotPop,
    },
    props: {
        /**
         * @description 抓拍数据列表
         */
        list: {
            type: Array as PropType<WebsocketSnapOnSuccessSnap[]>,
            required: true,
        },
        /**
         * @description 抓拍数据当前索引
         */
        index: {
            type: Number,
            required: true,
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
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 当前抓拍数据索引
            currentIndex: 0,
            // 是否显示抓拍弹窗
            isSnapPop: false,
        })

        // 性别与显示文本映射
        const GENDER_MAPPING: Record<string, string> = {
            male: Translate('IDCS_MALE'),
            female: Translate('IDCS_FEMALE'),
        }

        // 事件类型与显示文本映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            perimeter: Translate('IDCS_INVADE_DETECTION'),
            aoi_entry: Translate('IDCS_INVADE_DETECTION'),
            aoi_leave: Translate('IDCS_INVADE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            pass_line: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            video_metavideo: Translate('IDCS_VSD_DETECTION'),
            face_detect: Translate('IDCS_FACE_DETECTION'),
            face_verify: Translate('IDCS_FACE_MATCH'),
            vehicle_plate: Translate('IDCS_PLATE_DETECTION'),
        }

        // 目标类型与显示文本映射
        const TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            non_vehicle: Translate('IDCS_NON_VEHICLE'),
            face: Translate('IDCS_FACE'),
            vehicle_plate: Translate('IDCS_LICENSE_PLATE'),
        }

        // 比较状态与显示文本映射
        const COMPARE_STATUS_MAPPING: Record<string, string> = {
            1: Translate('--'),
            3: Translate('IDCS_STRANGE_PLATE'),
            4: Translate('IDCS_GROUP_STRANGER'),
            6: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
        }

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            if (!src) return ''
            return 'data:image/png;base64,' + src
        }

        /**
         * @description 格式化日期时间
         * @param {Number} time
         * @returns {String}
         */
        const displayDateTime = (time: number) => {
            return formatDate(time, dateTime.dateTimeFormat)
        }

        /**
         * @description 格式化日期
         * @param {String} time
         * @returns {String}
         */
        const displayDate = (time: string) => {
            return formatDate(time, dateTime.dateFormat, 'YYYY-MM-DD')
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
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 当前抓拍数据
         */
        const current = computed(() => {
            return prop.list[pageData.value.currentIndex] || new LiveSnapData()
        })

        // 回显性别文本
        const displayGender = computed(() => {
            if (!current.value.type) return ''
            return GENDER_MAPPING[current.value.info.gender]
        })

        // 回显事件类型文本
        const displayEventType = computed(() => {
            if (!current.value.type) {
                return ''
            }
            let eventType = EVENT_TYPE_MAPPING[current.value.info.event_type] || EVENT_TYPE_MAPPING[current.value.type]
            if (typeof current.value.info.compare_status === 'number') {
                const subEventType = COMPARE_STATUS_MAPPING[current.value.info.compare_status]
                eventType += subEventType ? ' - ' + subEventType : ''
            }
            return eventType
        })

        // 回显目标类型文本
        const displayTargetType = computed(() => {
            if (!current.value.type) {
                return ''
            }
            if (['face_detect', 'face_verify'].includes(current.value.type)) {
                return TARGET_TYPE_MAPPING['face']
            }
            if (current.value.type === 'vehicle_plate') {
                return TARGET_TYPE_MAPPING['vehicle_plate']
            }
            if (current.value.type === 'boundary') {
                return TARGET_TYPE_MAPPING[current.value.info.target_type]
            }
        })

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
         * @description 显示抓拍图像
         */
        const showSnapShot = () => {
            pageData.value.isSnapPop = true
        }

        return {
            pageData,
            previous,
            next,
            close,
            current,
            displayBase64Img,
            displayDateTime,
            displayDate,
            search,
            playRec,
            showSnapShot,
            displayGender,
            displayEventType,
            displayTargetType,
            LiveSnapShotPop,
        }
    },
})
