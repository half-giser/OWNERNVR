/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:19:50
 * @Description: 支持业务：人脸识别侦测: 警戒区域 + 最大值&最小值;车牌识别侦测: 警戒区域 + 最大值&最小值;人群密度检测: 警戒区域
 */
import CanvasBase, { type CanvasBaseLineStyleOption } from './canvasBase'

interface CanvasVfdArea {
    X1: number
    Y1: number
    X2: number
    Y2: number
}

/**
 * @param {Object} option
 *      @property {String} el 画布选择器
 *      @property {Object} lineStyle 画线样式 { strokeStyle, lineWidth }
 *      @property {Boolean} enable 是否可绘制，默认false
 *      @property {Boolean} showRange 是否显示最值框，默认false
 *      @property {Object} area 警戒区域数据 { X1, Y1, X2, Y2 }
 *      @property {Object} rangeMax 最大值数据 { X1, Y1, X2, Y2 }
 *      @property {Object} rangeMin 最小值数据 { X1, Y1, X2, Y2 }
 *      @property {Function} onchange 绘制改变的回调
 */
interface CanvasVfdOption {
    el: HTMLCanvasElement
    lineStyle?: CanvasBaseLineStyleOption
    enable?: boolean
    showRange?: boolean
    area?: CanvasVfdArea
    rangeMin?: CanvasVfdArea
    rangeMax?: CanvasVfdArea
    onchange: (area: CanvasVfdArea) => void
}

export default class CanvasVfd {
    private readonly DEFAULT_LINE_COLOR = '#00ff00' // 画线默认色值
    private readonly DEFAULT_TEXT_COLOR = '#ffff00' // 文字默认色值
    private readonly RELATIVE_WIDTH = 10000 // 万分比宽度
    private readonly RELATIVE_HEIGHT = 10000 // 万分比高度
    private readonly DEFAULT_AREA = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    private lineStyle: CanvasBaseLineStyleOption
    private enable: boolean
    private showRange: boolean
    area: CanvasVfdArea
    rangeMin: CanvasVfdArea
    rangeMax: CanvasVfdArea
    private readonly onchange: CanvasVfdOption['onchange']
    private onMouseDown?: (e: MouseEvent) => void

    constructor(option: CanvasVfdOption) {
        this.lineStyle = {
            strokeStyle: this.DEFAULT_LINE_COLOR,
            lineWidth: 1.5,
            ...(option.lineStyle || {}),
        }
        this.enable = option.enable || false
        this.showRange = option.showRange || false
        this.area = {
            ...this.DEFAULT_AREA,
            ...(option.area || {}),
        }
        this.rangeMax = {
            ...this.DEFAULT_AREA,
            ...(option.rangeMax || {}),
        }
        this.rangeMin = {
            ...this.DEFAULT_AREA,
            ...(option.rangeMin || {}),
        }
        this.onchange = option.onchange
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.bindEvent()
    }

    // 根据数据绘制区域
    init() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        this.drawArea()
        if (this.showRange) {
            this.drawRangeMax()
            this.drawRangeMin()
        }
    }

    // 绘制警戒区域
    drawArea() {
        const item = this.getRealItemByRelative(this.area)
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, this.lineStyle)
    }

    // 绘制最大值区域
    drawRangeMax() {
        const item = this.getRealItemByRelative(this.rangeMax)
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, this.lineStyle)
        this.ctx.Text({
            text: 'Max',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: this.DEFAULT_TEXT_COLOR,
            strokeStyle: '#000',
            textBaseline: 'bottom',
        })
    }

    // 绘制最小值区域
    drawRangeMin() {
        const item = this.getRealItemByRelative(this.rangeMin)
        const rangeMaxY1 = this.getRealSizeByRelative(this.rangeMax.Y1, 'y')
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, this.lineStyle)
        this.ctx.Text({
            text: 'Min',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: this.DEFAULT_TEXT_COLOR,
            strokeStyle: '#000',
            textBaseline: Math.abs(rangeMaxY1 - item.Y1) < 14 ? 'top' : 'bottom',
        })
    }

    // 设置警戒区域
    setArea(area: CanvasVfdArea) {
        this.area = area
        this.init()
    }

    // 设置最大值
    setRangeMax(rangeMax: CanvasVfdArea) {
        this.rangeMax = rangeMax
        this.init()
    }

    // 设置最小值
    setRangeMin(rangeMin: CanvasVfdArea) {
        this.rangeMin = rangeMin
        this.init()
    }

    // 设置画布是否禁用
    setEnable(enable: boolean) {
        this.enable = enable
    }

    // 设置最值区域是否可见
    toggleRange(visible: boolean) {
        this.showRange = visible
        this.init()
    }

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                if (!this.enable) {
                    return
                }
                const startX = e.offsetX,
                    startY = e.offsetY
                const clientX = e.clientX,
                    clientY = e.clientY
                let endX, endY
                let finalX, finalY
                document.body.style.setProperty('user-select', 'none')

                const onMouseMove = (e1: MouseEvent) => {
                    endX = e1.clientX - clientX + startX
                    endY = e1.clientY - clientY + startY
                    if (endX < 0) endX = 0
                    if (endX > this.cavWidth) endX = this.cavWidth
                    if (endY < 0) endY = 0
                    if (endY > this.cavHeight) endY = this.cavHeight
                    finalX = startX
                    finalY = startY
                    if (endX < startX) {
                        finalX = endX
                        endX = startX
                    }

                    if (endY < startY) {
                        finalY = endY
                        endY = startY
                    }
                    this.setArea(
                        this.getRelativeItemByReal({
                            X1: finalX,
                            Y1: finalY,
                            X2: endX,
                            Y2: endY,
                        }),
                    )
                }

                const onMouseUp = () => {
                    this.onchange && this.onchange(this.area)
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

    getRealItemByRelative({ X1, Y1, X2, Y2 }: CanvasVfdArea) {
        return {
            X1: this.getRealSizeByRelative(X1, 'x'),
            Y1: this.getRealSizeByRelative(Y1, 'y'),
            X2: this.getRealSizeByRelative(X2, 'x'),
            Y2: this.getRealSizeByRelative(Y2, 'y'),
        }
    }

    getRelativeItemByReal({ X1, Y1, X2, Y2 }: CanvasVfdArea) {
        return {
            X1: this.getRelativeSizeByReal(X1, 'x'),
            Y1: this.getRelativeSizeByReal(Y1, 'y'),
            X2: this.getRelativeSizeByReal(X2, 'x'),
            Y2: this.getRelativeSizeByReal(Y2, 'y'),
        }
    }

    // 获取绘制数据
    getArea() {
        return this.area
    }

    // 清空区域
    clear() {
        this.area = this.DEFAULT_AREA
        this.setArea(this.area)
    }

    // 销毁
    destroy() {
        this.clear()

        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }
    }
}
