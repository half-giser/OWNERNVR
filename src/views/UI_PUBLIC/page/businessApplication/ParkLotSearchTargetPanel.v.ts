/*
 * @Date: 2025-05-24 18:19:16
 * @Description: 停车场进出记录 抓拍图区域
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import IntelLicencePlateDBAddPlatePop from '../intelligentAnalysis/IntelLicencePlateDBAddPlatePop.vue'

export default defineComponent({
    components: {
        IntelLicencePlateDBAddPlatePop,
    },
    props: {
        current: {
            type: Object as PropType<BusinessParkingLotList>,
            default: () => new BusinessParkingLotList(),
        },
        total: {
            type: Number,
            required: true,
        },
        currentIndex: {
            type: Number,
            required: true,
        },
        showEnterLoading: {
            type: Boolean,
            default: false,
        },
        showExitLoading: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        prev() {
            return true
        },
        next() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const $enterCanvas = ref<HTMLCanvasElement>()
        const $exitCanvas = ref<HTMLCanvasElement>()

        let enterCanvasContext: ReturnType<typeof CanvasBase>
        let exitCanvasContext: ReturnType<typeof CanvasBase>

        // 进场放行方式/出场放行方式与文本映射
        const OPEN_GATE_MAPPING: Record<string | number, string> = {
            0: '', // 拒绝放行
            1: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            2: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
            refuse: '', // 拒绝放行
            auto: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            manual: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
        }

        const pageData = ref({
            tabIndex: 0,
            index: 0,
            isAddPlatePop: false,
            plateNum: '',
            isBtnVisible: false,
            canvasWidth: 796,
            canvasHeight: 538,
            isEnterImgLoading: false,
            isExitImgLoading: false,
        })

        const isTraceObj = (obj: { X1: number; X2: number; Y1: number; Y2: number }) => {
            return obj.X1 || obj.X2 || obj.Y1 || obj.Y2
        }

        watch(
            () => prop.current,
            async (current) => {
                if (!enterCanvasContext) {
                    enterCanvasContext = CanvasBase($enterCanvas.value!)
                }
                enterCanvasContext.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

                if (!exitCanvasContext) {
                    exitCanvasContext = CanvasBase($exitCanvas.value!)
                }
                exitCanvasContext.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

                if (current.enterImg) {
                    if (isTraceObj(current.enterTraceObj)) {
                        const X1 = current.enterTraceObj.X1 * pageData.value.canvasWidth
                        const Y1 = current.enterTraceObj.Y1 * pageData.value.canvasHeight
                        const X2 = current.enterTraceObj.X2 * pageData.value.canvasWidth
                        const Y2 = current.enterTraceObj.Y2 * pageData.value.canvasHeight
                        enterCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                            lineWidth: 2,
                            strokeStyle: '#0000ff',
                        })
                    }
                }

                if (current.exitImg) {
                    if (isTraceObj(current.exitTraceObj)) {
                        const X1 = current.exitTraceObj.X1 * pageData.value.canvasWidth
                        const Y1 = current.exitTraceObj.Y1 * pageData.value.canvasHeight
                        const X2 = current.exitTraceObj.X2 * pageData.value.canvasWidth
                        const Y2 = current.exitTraceObj.Y2 * pageData.value.canvasHeight
                        exitCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                            lineWidth: 2,
                            strokeStyle: '#0000ff',
                        })
                    }
                }
            },
        )

        /**
         * @description 显示进场放行方式/出场放行方式
         * @param {String} type
         * @returns {String}
         */
        const displayOpenGateType = (type: string) => {
            return OPEN_GATE_MAPPING[type] || ''
        }

        /**
         * @description 上一条数据
         */
        const handlePrev = () => {
            if (prop.currentIndex <= 0) {
                return
            }
            ctx.emit('prev')
        }

        /**
         * @description 下一条数据
         */
        const handleNext = () => {
            if (prop.currentIndex >= prop.total - 1) {
                return
            }
            ctx.emit('next')
        }

        /**
         * @description 新增车牌
         */
        const addPlate = () => {
            pageData.value.plateNum = prop.current.plateNum
            pageData.value.isAddPlatePop = true
        }

        return {
            pageData,
            displayOpenGateType,
            handleNext,
            handlePrev,
            addPlate,
            close,
            open,
            $enterCanvas,
            $exitCanvas,
        }
    },
})
