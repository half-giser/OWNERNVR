/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:16:10
 * @Description: 绘制pos信息
 */

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
    el?: HTMLCanvasElement
    posList?: CanvasPosItem[]
}

export const CanvasPos = (options: CanvasPosOption = {}) => {
    const DEFAULT_TEXT_COLOR = '#fff' // 画线默认色值

    let posList = options.posList || []

    const ctx = CanvasBase(options.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    /**
     * @description 根据数据绘制区域
     */
    const init = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        drawPos()
    }

    /**
     * @description 绘制pos
     */
    const drawPos = () => {
        for (let i = 0; i < posList.length; i++) {
            const item = posList[i]
            ctx.Text({
                text: item.text,
                startX: 20,
                startY: 20 + i * 23,
                font: '18px Verdana',
                strokeStyle: '#000',
                fillStyle: item.RGB ? `rgb${item.RGB}` : DEFAULT_TEXT_COLOR,
            })
        }
    }

    /**
     * @description 设置posList
     * @param {CanvasPosItem[]} list
     */
    const setPosList = (list: CanvasPosItem[]) => {
        posList = list
        init()
    }

    /**
     * @description 清空区域
     */
    const clear = () => {
        posList = []
        setPosList(posList)
    }

    return {
        setPosList,
        clear,
    }
}
