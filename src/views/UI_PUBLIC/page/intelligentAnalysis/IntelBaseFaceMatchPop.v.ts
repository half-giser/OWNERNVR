/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 09:22:23
 * @Description: 智能分析 - 人脸比对结果弹窗
 */
import { IntelFaceMatchPopList } from '@/types/apiType/intelligentAnalysis'
import IntelBasePanoramaPop from './IntelBasePanoramaPop.vue'

export default defineComponent({
    components: {
        IntelBasePanoramaPop,
    },
    props: {
        /**
         * @description 抓拍数据列表
         */
        list: {
            type: Array as PropType<IntelFaceMatchPopList[]>,
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
        playRec(item: IntelFaceMatchPopList, index: number) {
            return !!item && typeof index === 'number'
        },
        search(item: IntelFaceMatchPopList, index: number) {
            return !!item && typeof index === 'number'
        },
        add(item: IntelFaceMatchPopList, index: number) {
            return !!item && typeof index === 'number'
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
            return prop.list[pageData.value.currentIndex] || new IntelFaceMatchPopList()
        })

        // 回显性别文本
        const displayGender = computed(() => {
            return GENDER_MAPPING[current.value.sex] || ''
        })

        // 回显事件类型文本
        const displayEventType = computed(() => {
            return EVENT_TYPE_MAPPING[current.value.eventType] || ''
        })

        // 回显目标类型文本
        const displayTargetType = computed(() => {
            return TARGET_TYPE_MAPPING[current.value.targetType] || ''
        })

        /**
         * @description 回放
         */
        const playRec = () => {
            ctx.emit('playRec', current.value, pageData.value.currentIndex)
        }

        /**
         * @description 搜索
         */
        const search = () => {
            ctx.emit('search', current.value, pageData.value.currentIndex)
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
            displayDateTime,
            search,
            playRec,
            showSnapShot,
            displayGender,
            displayEventType,
            displayTargetType,
            IntelBasePanoramaPop,
        }
    },
})
