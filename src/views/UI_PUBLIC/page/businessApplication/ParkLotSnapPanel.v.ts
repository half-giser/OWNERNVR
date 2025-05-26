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
        layout: {
            type: String as PropType<'search' | 'detail'>,
            default: 'detail',
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
            canvasHeight: prop.layout === 'detail' ? 538 : 430,
            isEnterImgLoading: false,
            isExitImgLoading: false,
            enterSnapPosition: 'top-right',
            exitSnapPosition: 'top-right',
        })

        const isTraceObj = (obj: { X1: number; X2: number; Y1: number; Y2: number }) => {
            return obj.X1 || obj.X2 || obj.Y1 || obj.Y2
        }

        /**
         * @description 判断两个元素是否重合(相交或覆盖)
         * @see https://zhuanlan.zhihu.com/p/526649229
         * @param {DOMRect} rect1
         * @param {DOMRect} rect2
         * @returns {boolean}
         */
        const isOverlap = (rect1: { X1: number; X2: number; Y1: number; Y2: number }, rect2: { X1: number; X2: number; Y1: number; Y2: number }) => {
            const { X1: x1, Y1: y1, X2: x2, Y2: y2 } = rect1
            const { X1: x3, Y1: y3, X2: x4, Y2: y4 } = rect2

            if (Math.max(x1, x3) <= Math.min(x2, x4) && Math.max(y1, y3) <= Math.min(y2, y4)) {
                return true
            } else {
                return false
            }
        }

        const checkOverlay = (imgSource: string, trace: { X1: number; X2: number; Y1: number; Y2: number }) => {
            return new Promise((resolve: (bool: boolean) => void) => {
                const image = new Image()
                image.onload = () => {
                    setTimeout(() => {
                        const width = pageData.value.canvasWidth * 0.3
                        const height = (width / image.width) * image.height
                        const overlap = isOverlap(
                            {
                                X1: pageData.value.canvasWidth - width,
                                Y1: 0,
                                X2: pageData.value.canvasWidth,
                                Y2: height,
                            },
                            {
                                X1: trace.X1 * pageData.value.canvasWidth,
                                Y1: trace.Y1 * pageData.value.canvasHeight,
                                X2: trace.X2 * pageData.value.canvasWidth,
                                Y2: trace.Y2 * pageData.value.canvasHeight,
                            },
                        )
                        resolve(overlap)
                    }, 0)
                }

                image.src = imgSource
            })
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
                    const hasTrace = isTraceObj(current.enterTraceObj)
                    if (hasTrace) {
                        const X1 = current.enterTraceObj.X1 * pageData.value.canvasWidth
                        const Y1 = current.enterTraceObj.Y1 * pageData.value.canvasHeight
                        const X2 = current.enterTraceObj.X2 * pageData.value.canvasWidth
                        const Y2 = current.enterTraceObj.Y2 * pageData.value.canvasHeight
                        enterCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                            lineWidth: 2,
                            strokeStyle: '#0000ff',
                        })
                    }

                    if (current.enterSnapImg && hasTrace) {
                        checkOverlay(current.enterSnapImg, current.enterTraceObj).then((bool) => {
                            pageData.value.enterSnapPosition = bool ? 'top-left' : 'top-right'
                        })
                    } else {
                        pageData.value.enterSnapPosition = 'top-right'
                    }
                }

                if (current.exitImg) {
                    const hasTrace = isTraceObj(current.exitTraceObj)
                    if (hasTrace) {
                        const X1 = current.exitTraceObj.X1 * pageData.value.canvasWidth
                        const Y1 = current.exitTraceObj.Y1 * pageData.value.canvasHeight
                        const X2 = current.exitTraceObj.X2 * pageData.value.canvasWidth
                        const Y2 = current.exitTraceObj.Y2 * pageData.value.canvasHeight
                        exitCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                            lineWidth: 2,
                            strokeStyle: '#0000ff',
                        })
                    }

                    if (current.exitSnapImg && hasTrace) {
                        checkOverlay(current.exitSnapImg, current.exitTraceObj).then((bool) => {
                            pageData.value.exitSnapPosition = bool ? 'top-left' : 'top-right'
                        })
                    } else {
                        pageData.value.exitSnapPosition = 'top-right'
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
            if (!prop.total || prop.currentIndex <= 0) {
                return
            }
            ctx.emit('prev')
        }

        /**
         * @description 下一条数据
         */
        const handleNext = () => {
            if (!prop.total || prop.currentIndex >= prop.total - 1) {
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
