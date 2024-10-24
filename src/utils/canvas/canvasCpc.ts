/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 14:43:14
 * @Description: 人数统计画线：可拖动单箭头 + 可拖动矩形框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 15:40:14
 */

import CanvasBase, { type CanvasBaseLineStyleOption } from './canvasBase'

interface CanvasCpcInfoOption {
    X1: number
    X2: number
    Y1: number
    Y2: number
}

interface CanvasCpcOption {
    el: HTMLCanvasElement
    regionlineStyle?: CanvasBaseLineStyleOption
    arrowlineStyle?: CanvasBaseLineStyleOption
    enable: boolean
    regionInfo?: Partial<CanvasCpcInfoOption>
    arrowlineInfo?: Partial<CanvasCpcInfoOption>
    onchange?: (regionInfo: CanvasCpcInfoOption, arrowlineInfo: CanvasCpcInfoOption) => void
}

export default class CanvasCpc {
    private readonly DEFAULT_REGION_LINE_COLOR = '#00ff00' // 区域画线默认色值
    private readonly DEFAULT_ARROW_LINE_COLOR = '#ff0000' // 箭头默认色值
    // private readonly DEFAULT_TEXT_COLOR = '#ff0000' // 文字默认色值
    private readonly RELATIVE_WIDTH = 10000 // 万分比宽度
    private readonly RELATIVE_HEIGHT = 10000 // 万分比高度
    private readonly DEFAULT_REGION_INFO = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
    private readonly DEFAULT_LINE_INFO = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
    private regionInfo: CanvasCpcInfoOption
    private arrowlineInfo: CanvasCpcInfoOption
    private regionlineStyle: CanvasBaseLineStyleOption
    private arrowlineStyle: CanvasBaseLineStyleOption
    private ctx: CanvasBase
    private canvas: HTMLCanvasElement
    private cavWidth: number
    private cavHeight: number
    private enable: boolean
    private onchange: CanvasCpcOption['onchange']
    private onMouseDown?: (e: MouseEvent) => void

    constructor(option: CanvasCpcOption) {
        // this.el = option.el
        this.regionlineStyle = {
            strokeStyle: this.DEFAULT_REGION_LINE_COLOR,
            lineWidth: 1.5,
            ...(option.regionlineStyle || {}),
        }
        this.arrowlineStyle = {
            strokeStyle: this.DEFAULT_ARROW_LINE_COLOR,
            lineWidth: 1.5,
            ...(option.arrowlineStyle || {}),
        }
        this.enable = option.enable
        this.regionInfo = {
            ...this.DEFAULT_REGION_INFO,
            ...(option.regionInfo || {}),
        }
        this.arrowlineInfo = {
            ...this.DEFAULT_LINE_INFO,
            ...(option.arrowlineInfo || {}),
        }
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.onchange = option.onchange
        this.bindEvent()
    }

    // 根据数据绘制区域
    init() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        this.drawRegion()
        this.drawArrowline()
    }

    // 绘制警戒区域
    drawRegion() {
        const item = this.getRealItemByRelative(this.regionInfo)
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, this.regionlineStyle)
    }

    // 绘制箭头线和文字
    drawArrowline() {
        const item = this.getRealItemByRelative(this.arrowlineInfo)
        this.ctx.Line(item.X1, item.Y1, item.X2, item.Y2, this.arrowlineStyle)
        // (X1, Y1)是箭头端坐标
        this.ctx.Arrow({
            startX: item.X2,
            startY: item.Y2,
            endX: item.X1,
            endY: item.Y1,
            pointX: item.X1,
            pointY: item.Y1,
            lineStyle: this.arrowlineStyle,
            textCfg: {
                textEnd: 'IN',
            },
        })
    }

    // 设置警戒区域
    setRegionInfo(regionInfo: CanvasCpcInfoOption) {
        this.regionInfo = regionInfo
        this.init()
    }

    // 设置箭头线区域
    setLineInfo(arrowlineInfo: CanvasCpcInfoOption) {
        this.arrowlineInfo = arrowlineInfo
        this.init()
    }

    // 设置画布是否禁用
    setEnable(enable: boolean) {
        this.enable = enable
    }

    // 以某点坐标为中心，获取指定范围的矩形区域
    getPointArea(x: number, y: number, offset: number) {
        return {
            x: x - offset,
            y: y - offset,
            width: 2 * offset,
            height: 2 * offset,
        }
    }

    // 绑定事件
    // 画布禁用或者已有矩形框时，不允许绘制只能进行拖动
    // 如果是拖动模式，则根据鼠标落点位置进行交互，分下列三种情形：
    // (1) 如果落点在箭头线两端点范围内(以端点为中心长宽为10px的矩形)，则进行端点移动
    // (2) 如果落点到箭头线的垂直距离不大于10px，则进行箭头线平移
    // (3) 如果(1)和(2)都不满足，且落点在矩形框范围内，则进行矩形框平移
    // (4) 如果以上都不满足，则不进行任何交互
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                if (!this.enable) return
                const lineX1 = this.arrowlineInfo.X1,
                    lineY1 = this.arrowlineInfo.Y1
                const lineX2 = this.arrowlineInfo.X2,
                    lineY2 = this.arrowlineInfo.Y2
                const regionX1 = this.regionInfo.X1,
                    regionY1 = this.regionInfo.Y1
                const regionX2 = this.regionInfo.X2,
                    regionY2 = this.regionInfo.Y2
                const lineInfo = this.getRealItemByRelative(this.arrowlineInfo)
                const region = this.getRealItemByRelative(this.regionInfo)
                const lineStartX = lineInfo.X1 < lineInfo.X2 ? lineInfo.X1 : lineInfo.X2 // 箭头线所在矩形区域左上角坐标X
                const lineStartY = lineInfo.Y1 < lineInfo.Y2 ? lineInfo.Y1 : lineInfo.Y2 // 箭头线所在矩形区域左上角坐标Y
                const regionStartX = region.X1 < region.X2 ? region.X1 : region.X2 // 矩形框左上角坐标
                const regionStartY = region.Y1 < region.Y2 ? region.Y1 : region.Y2
                const lineWidth = Math.abs(lineInfo.X1 - lineInfo.X2) // 箭头线所在矩形区域宽
                const lineHeight = Math.abs(lineInfo.Y1 - lineInfo.Y2) // 箭头线所在矩形区域高
                const regionWidth = Math.abs(region.X1 - region.X2)
                const regionHeight = Math.abs(region.Y1 - region.Y2)
                const isDragMode = region.X1 || region.X2 || region.Y1 || region.Y2
                const startX = e.offsetX,
                    startY = e.offsetY
                const clientX = e.clientX,
                    clientY = e.clientY
                let isMovePoint = false,
                    isMoveArrow = false,
                    isMoveLine = false,
                    isMoveRegion = false
                const OFFSET = 10
                if (isDragMode) {
                    const lineInfo = this.getRealItemByRelative(this.arrowlineInfo)
                    const areaPoint = this.getPointArea(lineInfo.X2, lineInfo.Y2, OFFSET)
                    const arrowPoint = this.getPointArea(lineInfo.X1, lineInfo.Y1, OFFSET)
                    if (this.ctx.IsInRect(startX, startY, areaPoint.x, areaPoint.y, areaPoint.width, areaPoint.height)) {
                        isMovePoint = true // 落点在箭头线没有箭头的端点
                    } else if (this.ctx.IsInRect(startX, startY, arrowPoint.x, arrowPoint.y, arrowPoint.width, arrowPoint.height)) {
                        isMoveArrow = true // 落点在箭头线有箭头的端点
                    } else if (this.ctx.GetVerticalDistance({ X: lineInfo.X1, Y: lineInfo.Y1 }, { X: lineInfo.X2, Y: lineInfo.Y2 }, { X: startX, Y: startY }) <= OFFSET) {
                        isMoveLine = true // 落点在箭头线上
                    } else if (this.ctx.IsInRect(startX, startY, region.X1, region.Y1, regionWidth, regionHeight)) {
                        isMoveRegion = true // 落点在矩形框范围
                    } else {
                        return
                    }
                }
                let endX: number
                let endY: number
                document.body.style.setProperty('user-select', 'none')
                const onMouseMove = (e1: MouseEvent) => {
                    endX = e1.clientX - clientX + startX
                    endY = e1.clientY - clientY + startY
                    if (endX < 0) endX = 0
                    if (endX > this.cavWidth) endX = this.cavWidth
                    if (endY < 0) endY = 0
                    if (endY > this.cavHeight) endY = this.cavHeight
                    if (isDragMode) {
                        if (isMovePoint) {
                            this.arrowlineInfo.X2 = this.getRelativeSizeByReal(endX, 'x')
                            this.arrowlineInfo.Y2 = this.getRelativeSizeByReal(endY, 'y')
                        } else if (isMoveArrow) {
                            this.arrowlineInfo.X1 = this.getRelativeSizeByReal(endX, 'x')
                            this.arrowlineInfo.Y1 = this.getRelativeSizeByReal(endY, 'y')
                        } else if (isMoveLine) {
                            let newStartX = lineStartX + endX - startX
                            let newStartY = lineStartY + endY - startY
                            if (newStartX <= 0) newStartX = 0
                            if (newStartX + lineWidth >= this.cavWidth) newStartX = this.cavWidth - lineWidth
                            if (newStartY <= 0) newStartY = 0
                            if (newStartY + lineHeight >= this.cavHeight) newStartY = this.cavHeight - lineHeight
                            const offsetX = this.getRelativeSizeByReal(newStartX - lineStartX, 'x')
                            const offsetY = this.getRelativeSizeByReal(newStartY - lineStartY, 'y')
                            this.arrowlineInfo.X1 = offsetX + lineX1
                            this.arrowlineInfo.Y1 = offsetY + lineY1
                            this.arrowlineInfo.X2 = offsetX + lineX2
                            this.arrowlineInfo.Y2 = offsetY + lineY2
                        } else if (isMoveRegion) {
                            let newStartX = regionStartX + endX - startX
                            let newStartY = regionStartY + endY - startY
                            if (newStartX <= 0) newStartX = 0
                            if (newStartX + regionWidth >= this.cavWidth) newStartX = this.cavWidth - regionWidth
                            if (newStartY <= 0) newStartY = 0
                            if (newStartY + regionHeight >= this.cavHeight) newStartY = this.cavHeight - regionHeight
                            const offsetX = this.getRelativeSizeByReal(newStartX - regionStartX, 'x')
                            const offsetY = this.getRelativeSizeByReal(newStartY - regionStartY, 'y')
                            this.regionInfo.X1 = offsetX + regionX1
                            this.regionInfo.Y1 = offsetY + regionY1
                            this.regionInfo.X2 = offsetX + regionX2
                            this.regionInfo.Y2 = offsetY + regionY2
                        }
                    } else {
                        // 非拖动模式，则绘制新的矩形区域
                        this.regionInfo = this.getRelativeItemByReal({ X1: startX, Y1: startY, X2: endX, Y2: endY })
                    }
                    this.init()
                }

                const onMouseUp = () => {
                    this.onchange && this.onchange(this.regionInfo, this.arrowlineInfo)
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousedown', this.onMouseDown)
    }

    // 组件生命周期结束时执行
    destroy() {
        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }
    }

    // 根据万分比尺寸获取画布尺寸
    getRealSizeByRelative(size: number, type: 'x' | 'y') {
        if (type === 'x') {
            return (this.cavWidth * size) / this.RELATIVE_WIDTH
        } else {
            return (this.cavHeight * size) / this.RELATIVE_HEIGHT
        }
    }

    // 根据画布尺寸获取对应万分比尺寸
    getRelativeSizeByReal(size: number, type: 'x' | 'y') {
        if (type === 'x') {
            return (this.RELATIVE_WIDTH * size) / this.cavWidth
        } else {
            return (this.RELATIVE_HEIGHT * size) / this.cavHeight
        }
    }

    getRealItemByRelative(relativeItem: CanvasCpcInfoOption) {
        return {
            X1: this.getRealSizeByRelative(relativeItem.X1, 'x'),
            Y1: this.getRealSizeByRelative(relativeItem.Y1, 'y'),
            X2: this.getRealSizeByRelative(relativeItem.X2, 'x'),
            Y2: this.getRealSizeByRelative(relativeItem.Y2, 'y'),
        }
    }

    getRelativeItemByReal(realItem: CanvasCpcInfoOption) {
        return {
            X1: this.getRelativeSizeByReal(realItem.X1, 'x'),
            Y1: this.getRelativeSizeByReal(realItem.Y1, 'y'),
            X2: this.getRelativeSizeByReal(realItem.X2, 'x'),
            Y2: this.getRelativeSizeByReal(realItem.Y2, 'y'),
        }
    }

    // 获取绘制数据
    getArea() {
        return this.regionInfo
    }

    // 清空区域, 只清空矩形线框，不清除箭头线
    clear() {
        this.regionInfo = {
            ...this.DEFAULT_REGION_INFO,
        }
        this.setRegionInfo(this.regionInfo)
    }
}
