/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 14:43:14
 * @Description: 人数统计画线：可拖动单箭头 + 可拖动矩形框
 */

interface CanvasCpcOption {
    el?: HTMLCanvasElement
    regionlineStyle?: CanvasBaseLineStyleOption
    arrowlineStyle?: CanvasBaseLineStyleOption
    enable?: boolean
    regionInfo?: Partial<CanvasBaseArea>
    arrowlineInfo?: Partial<CanvasBaseArea>
    onchange?: (regionInfo: CanvasBaseArea, arrowlineInfo: CanvasBaseArea) => void
}

export const CanvasCpc = (option: CanvasCpcOption = {}) => {
    const DEFAULT_REGION_LINE_COLOR = '#0f0' // 区域画线默认色值
    const DEFAULT_ARROW_LINE_COLOR = '#f00' // 箭头默认色值
    // const DEFAULT_TEXT_COLOR = '#f00' // 文字默认色值
    const RELATIVE_WIDTH = 10000 // 万分比宽度
    const RELATIVE_HEIGHT = 10000 // 万分比高度
    const DEFAULT_REGION_INFO = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }
    const DEFAULT_LINE_INFO = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }

    const regionlineStyle = {
        strokeStyle: DEFAULT_REGION_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.regionlineStyle || {}),
    }
    const arrowlineStyle = {
        strokeStyle: DEFAULT_ARROW_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.arrowlineStyle || {}),
    }
    let enable = option.enable || false
    let regionInfo = {
        ...DEFAULT_REGION_INFO,
        ...(option.regionInfo || {}),
    }
    let arrowlineInfo = {
        ...DEFAULT_LINE_INFO,
        ...(option.arrowlineInfo || {}),
    }
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高
    const onchange = option.onchange

    /**
     * @description 根据数据绘制区域
     */
    const init = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        drawRegion()
        drawArrowline()
    }

    /**
     * @description 绘制警戒区域
     */
    const drawRegion = () => {
        const item = getRealItemByRelative(regionInfo)
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, regionlineStyle)
    }

    /**
     * @description 绘制箭头线和文字
     */
    const drawArrowline = () => {
        const item = getRealItemByRelative(arrowlineInfo)
        ctx.Line(item.X1, item.Y1, item.X2, item.Y2, arrowlineStyle)
        // (X1, Y1)是箭头端坐标
        ctx.Arrow({
            startX: item.X2,
            startY: item.Y2,
            endX: item.X1,
            endY: item.Y1,
            pointX: item.X1,
            pointY: item.Y1,
            lineStyle: arrowlineStyle,
            textCfg: {
                textEnd: 'IN',
            },
        })
    }

    /**
     * @description 设置警戒区域
     * @param info
     */
    const setRegionInfo = (info: CanvasBaseArea) => {
        regionInfo = info
        init()
    }

    /**
     * @description 设置箭头线区域
     * @param newArrowlineInfo
     */
    const setLineInfo = (info: CanvasBaseArea) => {
        arrowlineInfo = info
        init()
    }

    /**
     * @description 设置画布是否禁用
     * @param newEnable
     */
    const setEnable = (bool: boolean) => {
        enable = bool
    }

    /**
     * @description 以某点坐标为中心，获取指定范围的矩形区域
     * @param x
     * @param y
     * @param offset
     * @returns
     */
    const getPointArea = (x: number, y: number, offset: number) => {
        return {
            x: x - offset,
            y: y - offset,
            width: 2 * offset,
            height: 2 * offset,
        }
    }

    const onMouseDown = (e: MouseEvent) => {
        if (!enable) return
        const lineX1 = arrowlineInfo.X1
        const lineY1 = arrowlineInfo.Y1
        const lineX2 = arrowlineInfo.X2
        const lineY2 = arrowlineInfo.Y2
        const regionX1 = regionInfo.X1
        const regionY1 = regionInfo.Y1
        const regionX2 = regionInfo.X2
        const regionY2 = regionInfo.Y2
        const lineInfo = getRealItemByRelative(arrowlineInfo)
        const region = getRealItemByRelative(regionInfo)
        const lineStartX = Math.min(lineInfo.X1, lineInfo.X2) // 箭头线所在矩形区域左上角坐标X
        const lineStartY = Math.min(lineInfo.Y1, lineInfo.Y2) // 箭头线所在矩形区域左上角坐标Y
        const regionStartX = Math.min(region.X1, region.X2) // 矩形框左上角坐标
        const regionStartY = Math.min(region.Y1, region.Y2)
        const lineWidth = Math.abs(lineInfo.X1 - lineInfo.X2) // 箭头线所在矩形区域宽
        const lineHeight = Math.abs(lineInfo.Y1 - lineInfo.Y2) // 箭头线所在矩形区域高
        const regionWidth = Math.abs(region.X1 - region.X2)
        const regionHeight = Math.abs(region.Y1 - region.Y2)
        const isDragMode = region.X1 || region.X2 || region.Y1 || region.Y2
        const startX = e.offsetX
        const startY = e.offsetY
        const clientX = e.clientX
        const clientY = e.clientY
        const OFFSET = 10
        let isMovePoint = false
        let isMoveArrow = false
        let isMoveLine = false
        let isMoveRegion = false
        if (isDragMode) {
            const lineInfo = getRealItemByRelative(arrowlineInfo)
            const areaPoint = getPointArea(lineInfo.X2, lineInfo.Y2, OFFSET)
            const arrowPoint = getPointArea(lineInfo.X1, lineInfo.Y1, OFFSET)

            // 落点在箭头线没有箭头的端点
            if (ctx.IsInRect(startX, startY, areaPoint.x, areaPoint.y, areaPoint.width, areaPoint.height)) {
                isMovePoint = true
            }
            // 落点在箭头线有箭头的端点
            else if (ctx.IsInRect(startX, startY, arrowPoint.x, arrowPoint.y, arrowPoint.width, arrowPoint.height)) {
                isMoveArrow = true
            }
            // 落点在箭头线上
            else if (ctx.GetVerticalDistance({ X: lineInfo.X1, Y: lineInfo.Y1 }, { X: lineInfo.X2, Y: lineInfo.Y2 }, { X: startX, Y: startY }) <= OFFSET) {
                isMoveLine = true
            }
            // 落点在矩形框范围
            else if (ctx.IsInRect(startX, startY, region.X1, region.Y1, regionWidth, regionHeight)) {
                isMoveRegion = true
            }
            //
            else {
                return
            }
        }
        let endX: number
        let endY: number
        document.body.style.setProperty('user-select', 'none')

        const onMouseMove = (e1: MouseEvent) => {
            endX = clamp(e1.clientX - clientX + startX, 0, cavWidth)
            endY = clamp(e1.clientY - clientY + startY, 0, cavHeight)
            if (isDragMode) {
                if (isMovePoint) {
                    arrowlineInfo.X2 = getRelativeSizeByReal(endX, 'x')
                    arrowlineInfo.Y2 = getRelativeSizeByReal(endY, 'y')
                } else if (isMoveArrow) {
                    arrowlineInfo.X1 = getRelativeSizeByReal(endX, 'x')
                    arrowlineInfo.Y1 = getRelativeSizeByReal(endY, 'y')
                } else if (isMoveLine) {
                    const newStartX = clamp(lineStartX + endX - startX, 0, cavWidth - lineWidth)
                    const newStartY = clamp(lineStartY + endY - startY, 0, cavHeight - lineHeight)
                    const offsetX = getRelativeSizeByReal(newStartX - lineStartX, 'x')
                    const offsetY = getRelativeSizeByReal(newStartY - lineStartY, 'y')
                    arrowlineInfo.X1 = offsetX + lineX1
                    arrowlineInfo.Y1 = offsetY + lineY1
                    arrowlineInfo.X2 = offsetX + lineX2
                    arrowlineInfo.Y2 = offsetY + lineY2
                } else if (isMoveRegion) {
                    const newStartX = clamp(regionStartX + endX - startX, 0, cavWidth - regionWidth)
                    const newStartY = clamp(regionStartY + endY - startY, 0, cavHeight - regionHeight)
                    const offsetX = getRelativeSizeByReal(newStartX - regionStartX, 'x')
                    const offsetY = getRelativeSizeByReal(newStartY - regionStartY, 'y')
                    regionInfo.X1 = offsetX + regionX1
                    regionInfo.Y1 = offsetY + regionY1
                    regionInfo.X2 = offsetX + regionX2
                    regionInfo.Y2 = offsetY + regionY2
                }
            } else {
                // 非拖动模式，则绘制新的矩形区域
                regionInfo = getRelativeItemByReal({
                    X1: startX,
                    Y1: startY,
                    X2: endX,
                    Y2: endY,
                })
            }
            init()
        }

        const onMouseUp = () => {
            onchange && onchange(regionInfo, arrowlineInfo)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.body.style.setProperty('user-select', 'unset')
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    /**
     * @description 绑定事件
     * 画布禁用或者已有矩形框时，不允许绘制只能进行拖动
     * 如果是拖动模式，则根据鼠标落点位置进行交互，分下列三种情形：
     * (1) 如果落点在箭头线两端点范围内(以端点为中心长宽为10px的矩形)，则进行端点移动
     * (2) 如果落点到箭头线的垂直距离不大于10px，则进行箭头线平移
     * (3) 如果(1)和(2)都不满足，且落点在矩形框范围内，则进行矩形框平移
     * (4) 如果以上都不满足，则不进行任何交互
     */
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousedown', onMouseDown)
    }

    /**
     * @description 组件生命周期结束时执行
     */
    const destroy = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
    }

    /**
     * @description 根据万分比尺寸获取画布尺寸
     * @param size
     * @param type
     * @returns
     */
    const getRealSizeByRelative = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (cavWidth * size) / RELATIVE_WIDTH
        } else {
            return (cavHeight * size) / RELATIVE_HEIGHT
        }
    }

    /**
     * @description 根据画布尺寸获取对应万分比尺寸
     * @param size
     * @param type
     * @returns
     */
    const getRelativeSizeByReal = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (RELATIVE_WIDTH * size) / cavWidth
        } else {
            return (RELATIVE_HEIGHT * size) / cavHeight
        }
    }

    const getRealItemByRelative = (relativeItem: CanvasBaseArea) => {
        return {
            X1: getRealSizeByRelative(relativeItem.X1, 'x'),
            Y1: getRealSizeByRelative(relativeItem.Y1, 'y'),
            X2: getRealSizeByRelative(relativeItem.X2, 'x'),
            Y2: getRealSizeByRelative(relativeItem.Y2, 'y'),
        }
    }

    const getRelativeItemByReal = (realItem: CanvasBaseArea) => {
        return {
            X1: getRelativeSizeByReal(realItem.X1, 'x'),
            Y1: getRelativeSizeByReal(realItem.Y1, 'y'),
            X2: getRelativeSizeByReal(realItem.X2, 'x'),
            Y2: getRelativeSizeByReal(realItem.Y2, 'y'),
        }
    }

    /**
     * @description 获取绘制数据
     * @returns
     */
    const getArea = () => {
        return regionInfo
    }

    /**
     * @description 清空区域, 只清空矩形线框，不清除箭头线
     */
    const clear = () => {
        regionInfo = {
            ...DEFAULT_REGION_INFO,
        }
        setRegionInfo(regionInfo)
    }

    bindEvent()

    return {
        setRegionInfo,
        setLineInfo,
        setEnable,
        getPointArea,
        destroy,
        getArea,
        clear,
    }
}
