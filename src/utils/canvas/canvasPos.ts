/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:16:10
 * @Description: 绘制pos信息
 */

import CanvasBase from './canvasBase'

/**
 * 绘制pos信息
 * @param {Object} option
 *      @property {String} el 画布选择器
 *      @property {Object} posList pos信息列表 [{ text: '111', RGB: '(255,1,1)' }, ...]
 *      @property {Function} onchange 绘制改变的回调
 */
interface CanvasPosItem {
    text: string
    RGB: string
}

export interface CanvasPosOption {
    el: HTMLCanvasElement
    posList?: CanvasPosItem[]
    // onchange: () => void
}

export default class CanvasPos {
    private readonly DEFAULT_TEXT_COLOR = '#ffffff' // 画线默认色值
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    private posList: CanvasPosItem[]
    // private onchange: CanvasPosOption['onchange']

    constructor({ el, posList }: CanvasPosOption) {
        this.posList = posList || []
        // this.onchange = onchange
        this.ctx = new CanvasBase(el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
    }

    // 根据数据绘制区域
    init() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        this.drawPos()
    }

    // 绘制pos
    drawPos() {
        if (!(this.posList && this.posList.length)) return
        for (let i = 0; i < this.posList.length; i++) {
            const item = this.posList[i]
            this.ctx.Text({
                text: item.text,
                startX: 20,
                startY: 20 + i * 23,
                font: '18px Verdana',
                strokeStyle: '#000',
                fillStyle: item.RGB ? `rgb${item.RGB}` : this.DEFAULT_TEXT_COLOR,
            })
        }
    }

    // 设置posList
    setPosList(posList: CanvasPosItem[]) {
        this.posList = posList
        this.init()
    }

    // 清空区域
    clear() {
        this.posList = []
        this.setPosList(this.posList)
    }
}
