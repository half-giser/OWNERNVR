/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:19:50
 * @Description: 支持业务：人脸识别侦测: 警戒区域 + 最大值&最小值;车牌识别侦测: 警戒区域 + 最大值&最小值;人群密度检测: 警戒区域
 */
import CanvasBase, { type CanvasBaseLineStyleOption, type CanvasBaseArea } from './canvasBase'

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
    el?: HTMLCanvasElement
    lineStyle?: CanvasBaseLineStyleOption
    enable?: boolean
    showRange?: boolean
    area?: CanvasBaseArea
    rangeMin?: CanvasBaseArea
    rangeMax?: CanvasBaseArea
    onchange?: (area: CanvasBaseArea) => void
}

export default function CanvasVfd(option: CanvasVfdOption = {}) {
    const DEFAULT_LINE_COLOR = '#0f0' // 画线默认色值
    const DEFAULT_TEXT_COLOR = '#ff0' // 文字默认色值
    const RELATIVE_WIDTH = 10000 // 万分比宽度
    const RELATIVE_HEIGHT = 10000 // 万分比高度
    const DEFAULT_AREA = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }

    const lineStyle = {
        strokeStyle: DEFAULT_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.lineStyle || {}),
    }
    let enable = option.enable || false
    let showRange = option.showRange || false
    let area = {
        ...DEFAULT_AREA,
        ...(option.area || {}),
    }
    let rangeMax = {
        ...DEFAULT_AREA,
        ...(option.rangeMax || {}),
    }
    let rangeMin = {
        ...DEFAULT_AREA,
        ...(option.rangeMin || {}),
    }
    const onchange = option.onchange
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    /**
     * @description 根据数据绘制区域
     */
    const init = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        drawArea()
        if (showRange) {
            drawRangeMax()
            drawRangeMin()
        }
    }

    /**
     * @description 绘制警戒区域
     */
    const drawArea = () => {
        const item = getRealItemByRelative(area)
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
    }

    /**
     * @description 绘制最大值区域
     */
    const drawRangeMax = () => {
        const item = getRealItemByRelative(rangeMax)
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Max',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: DEFAULT_TEXT_COLOR,
            strokeStyle: '#000',
            textBaseline: 'bottom',
        })
    }

    /**
     * @description 绘制最小值区域
     */
    const drawRangeMin = () => {
        const item = getRealItemByRelative(rangeMin)
        const rangeMaxY1 = getRealSizeByRelative(rangeMax.Y1, 'y')
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Min',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: DEFAULT_TEXT_COLOR,
            strokeStyle: '#000',
            textBaseline: Math.abs(rangeMaxY1 - item.Y1) < 14 ? 'top' : 'bottom',
        })
    }

    /**
     * @description 设置警戒区域
     * @param info
     */
    const setArea = (info: CanvasBaseArea) => {
        area = info
        init()
    }

    /**
     * @description 设置最大值
     * @param area
     */
    const setRangeMax = (area: CanvasBaseArea) => {
        rangeMax = area
        init()
    }

    /**
     * @description 设置最小值
     * @param area
     */
    const setRangeMin = (area: CanvasBaseArea) => {
        rangeMin = area
        init()
    }

    /**
     * @description 设置画布是否禁用
     * @param {boolean} bool
     */
    const setEnable = (bool: boolean) => {
        enable = bool
    }

    /**
     * @description 设置最值区域是否可见
     * @param {boolean} visible
     */
    const toggleRange = (visible: boolean) => {
        showRange = visible
        init()
    }

    const onMouseDown = (e: MouseEvent) => {
        if (!enable) {
            return
        }

        const startX = e.offsetX
        const startY = e.offsetY
        const clientX = e.clientX
        const clientY = e.clientY
        let endX: number
        let endY: number
        let finalX: number
        let finalY: number
        document.body.style.setProperty('user-select', 'none')

        const onMouseMove = (e1: MouseEvent) => {
            endX = clamp(e1.clientX - clientX + startX, 0, cavWidth)
            endY = clamp(e1.clientY - clientY + startY, 0, cavHeight)
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
            setArea(
                getRelativeItemByReal({
                    X1: finalX,
                    Y1: finalY,
                    X2: endX,
                    Y2: endY,
                }),
            )
        }

        const onMouseUp = () => {
            onchange && onchange(area)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.body.style.setProperty('user-select', 'unset')
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    /**
     * @description 绑定事件
     */
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousedown', onMouseDown)
    }

    /**
     * @description 根据万分比尺寸获取画布尺寸
     * @param size
     * @param type
     * @returns {number}
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
     * @returns {number}
     */
    const getRelativeSizeByReal = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (RELATIVE_WIDTH * size) / cavWidth
        } else {
            return (RELATIVE_HEIGHT * size) / cavHeight
        }
    }

    const getRealItemByRelative = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRealSizeByRelative(X1, 'x'),
            Y1: getRealSizeByRelative(Y1, 'y'),
            X2: getRealSizeByRelative(X2, 'x'),
            Y2: getRealSizeByRelative(Y2, 'y'),
        }
    }

    const getRelativeItemByReal = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRelativeSizeByReal(X1, 'x'),
            Y1: getRelativeSizeByReal(Y1, 'y'),
            X2: getRelativeSizeByReal(X2, 'x'),
            Y2: getRelativeSizeByReal(Y2, 'y'),
        }
    }

    /**
     * @description 获取绘制数据
     * @returns
     */
    const getArea = () => {
        return area
    }

    /**
     * @description 清空区域
     */
    const clear = () => {
        area = DEFAULT_AREA
        setArea(area)
    }

    /**
     * @description 销毁
     */
    const destroy = () => {
        clear()
        canvas.removeEventListener('mousedown', onMouseDown)
    }

    bindEvent()

    return {
        setArea,
        setRangeMax,
        setRangeMin,
        setEnable,
        toggleRange,
        getArea,
        clear,
        destroy,
    }
}
