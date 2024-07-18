/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 15:34:27
 * @Description: canvas视频遮挡配置（透明矩形区域×4）
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 16:03:07
 */

import CanvasBase from './canvasBase'

export interface CanvasMaskMaskItem {
    X: number
    Y: number
    width: number
    height: number
}

interface CanvasMaskOption {
    el: HTMLCanvasElement
    maxCount?: number
    fillStyle?: string | CanvasGradient | CanvasPattern
    maskList?: CanvasMaskMaskItem[]
    enable?: boolean
    onchange: (maskList: CanvasMaskMaskItem[]) => void
}

export default class CanvasMask {
    private readonly DEFAULT_COLOR = '#00ff0088' // 默认填充色值
    private readonly DEFAULT_MAX = 4 // 绘制最大数量
    private readonly RELATIVE_WIDTH = 640 // 万分比宽度
    private readonly RELATIVE_HEIGHT = 480 // 万分比高度
    private readonly DEFAULT_ENABLE = false
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    private maxCount: number
    private fillStyle: string | CanvasGradient | CanvasPattern
    private maskList: CanvasMaskMaskItem[]
    private enable: boolean
    private readonly onchange: CanvasMaskOption['onchange']
    private onMouseDown?: (e: MouseEvent) => void

    constructor(option: CanvasMaskOption) {
        this.maxCount = option.maxCount || this.DEFAULT_MAX
        this.fillStyle = option.fillStyle || this.DEFAULT_COLOR
        this.maskList = option.maskList || []
        this.enable = option.enable || this.DEFAULT_ENABLE
        this.onchange = option.onchange
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.setArea(this.maskList)
        this.bindEvent()
    }

    // 根据数据绘制区域
    setArea(maskList: CanvasMaskMaskItem[]) {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        if (!(maskList && maskList.length)) return
        for (let i = 0; i < maskList.length; i++) {
            if (i === this.maxCount) {
                break
            }
            const item = this.getRealItemByRelative(maskList[i])
            this.ctx.FillRect(item.X, item.Y, item.width, item.height, this.fillStyle)
        }
    }

    // 设置画布是否禁用
    setEnable(enable: boolean) {
        this.enable = enable
    }

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                if (!this.enable || this.maskList.length === this.maxCount) {
                    return
                }
                const startX = e.offsetX,
                    startY = e.offsetY
                const clientX = e.clientX,
                    clientY = e.clientY
                let endX = 0,
                    endY = 0
                let finalX = 0,
                    finalY = 0
                let width = 0,
                    height = 0
                document.body.style.setProperty('user-select', 'none')

                const onMouseMove = (e1: MouseEvent) => {
                    endX = e1.clientX - clientX + startX
                    endY = e1.clientY - clientY + startY
                    if (endX < 0) endX = 0
                    if (endX > this.cavWidth) endX = this.cavWidth
                    if (endY < 0) endY = 0
                    if (endY > this.cavHeight) endY = this.cavHeight
                    width = Math.abs(endX - startX)
                    height = Math.abs(endY - startY)
                    finalX = endX > startX ? startX : endX
                    finalY = endY > startY ? startY : endY
                    this.setArea(this.maskList)
                    this.ctx.FillRect(finalX, finalY, width, height, this.fillStyle)
                }

                const onMouseUp = () => {
                    if (!this.isInnerRect(finalX, finalY, width, height)) {
                        this.maskList.push(
                            this.getRelativeItemByReal({
                                X: finalX,
                                Y: finalY,
                                width: width,
                                height: height,
                            }),
                        )
                    }
                    this.setArea(this.maskList)
                    this.onchange && this.onchange(this.maskList)
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

    getRealItemByRelative(relativeItem: CanvasMaskMaskItem) {
        return {
            X: this.getRealSizeByRelative(relativeItem.X, 'x'),
            Y: this.getRealSizeByRelative(relativeItem.Y, 'y'),
            width: this.getRealSizeByRelative(relativeItem.width, 'x'),
            height: this.getRealSizeByRelative(relativeItem.height, 'y'),
        }
    }

    getRelativeItemByReal(realItem: CanvasMaskMaskItem) {
        return {
            X: this.getRelativeSizeByReal(realItem.X, 'x'),
            Y: this.getRelativeSizeByReal(realItem.Y, 'y'),
            width: this.getRelativeSizeByReal(realItem.width, 'x'),
            height: this.getRelativeSizeByReal(realItem.height, 'y'),
        }
    }

    // 判断新绘制的矩形是否包含于已画矩形内
    isInnerRect(startX: number, startY: number, width: number, height: number) {
        if (this.maskList.length === 0) {
            return false
        }
        let isInner = false
        const endX = startX + width
        const endY = startY + height
        for (let i = 0; i < this.maskList.length; i++) {
            const item = this.getRealItemByRelative(this.maskList[i])
            const innerLeftTop = this.ctx.IsInRect(startX, startY, item.X, item.Y, item.width, item.height)
            const innerRightTop = this.ctx.IsInRect(endX, startY, item.X, item.Y, item.width, item.height)
            const innerLeftBottom = this.ctx.IsInRect(startX, endY, item.X, item.Y, item.width, item.height)
            const innerRightBottom = this.ctx.IsInRect(endX, endY, item.X, item.Y, item.width, item.height)
            if (innerLeftTop && innerRightTop && innerLeftBottom && innerRightBottom) {
                isInner = true
                break
            }
        }
        return isInner
    }

    // 获取绘制数据
    getArea() {
        return this.maskList
    }

    // 清空所有区域
    clear() {
        this.maskList = []
        this.setArea(this.maskList)
    }

    // 组件生命周期结束时执行
    destroy() {
        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }
    }
}
