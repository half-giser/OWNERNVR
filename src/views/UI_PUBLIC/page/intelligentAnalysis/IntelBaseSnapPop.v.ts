/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 19:24:00
 * @Description: 智能分析 - 抓拍详情弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-09 19:27:24
 */
import CanvasBase from '@/utils/canvas/canvasBase'
import { IntelSearchBodyList } from '@/types/apiType/intelligentAnalysis'

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据列表
         */
        list: {
            type: Array as PropType<IntelSearchBodyList[]>,
            required: true,
        },
        /**
         * @property 当前索引
         */
        index: {
            type: Number,
            default: 0,
        },
    },
    emits: {
        playRec(item: IntelSearchBodyList) {
            return !!item
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        let context: CanvasBase
        const canvas = ref<HTMLCanvasElement>()

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

        const pageData = ref({
            // 当前索引
            currentIndex: 0,
            // 画布宽
            canvasWidth: 400,
            // 画布高
            canvasHeight: 215,
        })

        const current = computed(() => {
            return prop.list[pageData.value.currentIndex] || new IntelSearchBodyList()
        })

        /**
         * @description 渲染矩形框
         */
        const renderCanvas = () => {
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
            return EVENT_TYPE_MAPPING[type]
        }

        /**
         * @description 显示目标类型文本
         * @param {stirng} type
         * @returns {string}
         */
        const displayTargetType = (type: string) => {
            return TARGET_TYPE_MAPPING[type]
        }

        /**
         * @description 回放
         */
        const playRec = () => {
            if (!current.value.imgId) {
                return
            }
            ctx.emit('playRec', current.value)
        }

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
        }
    },
})
