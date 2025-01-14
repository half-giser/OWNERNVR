/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 16:36:04
 * @Description: canvas绘制osd配置
 */
import CanvasBase, { type CanvasBaseRect } from './canvasBase'

export interface CanvasOSDOptionNameConfig {
    value: string // 通道名
    switch: boolean // 是否显示，下同
    X: number // 左上角点坐标x，下同
    XMinValue: number // 参照比例宽度起始点，下同
    XMaxValue: number // 参照比例宽度终止点，下同
    Y: number // 左上角点坐标y，下同
    YMinValue: number // 参照比例高度起始点，下同
    YMaxValue: number // 参照比例高度终止点，下同
}

export interface CanvasOSDOptionTimeConfig {
    dateFormat: 'year-month-day' | 'month-day-year' | 'day-month-year'
    timeFormat: 12 | 24
    switch: boolean // 是否显示
    X: number
    XMinValue: number
    XMaxValue: number
    Y: number
    YMinValue: number
    YMaxValue: number
    timestamp: number
}

interface CanvasOSDOption {
    el: HTMLCanvasElement
    nameCfg?: Partial<CanvasOSDOptionNameConfig>
    timeCfg?: Partial<CanvasOSDOptionTimeConfig>
    onchange?: (nameCfg: CanvasOSDOptionNameConfig, timeCfg: CanvasOSDOptionTimeConfig) => void
}

export default function CanvasOSD(option: CanvasOSDOption) {
    const OSD_COLOR: string | CanvasGradient | CanvasPattern = '#f00' // osd颜色
    const OSD_FONT_SIZE = 14 // osd字体大小
    const OSD_FONT = OSD_FONT_SIZE + 'px Arial'
    const DATE_FORMAT_MAP = {
        'year-month-day': 'yyyy/MM/dd',
        'month-day-year': 'MM/dd/yyyy',
        'day-month-year': 'dd/MM/yyyy',
    }
    const TIME_FORMAT_MAP = {
        12: 'hh:mm:ss tt',
        24: 'HH:mm:ss',
    }
    // 通道名osd参数默认配置
    const DEFAULT_NAME_CONFIG: CanvasOSDOptionNameConfig = {
        value: '', // 通道名
        switch: true, // 是否显示，下同
        X: 0, // 左上角点坐标x，下同
        XMinValue: 0, // 参照比例宽度起始点，下同
        XMaxValue: 10000, // 参照比例宽度终止点，下同
        Y: 0, // 左上角点坐标y，下同
        YMinValue: 0, // 参照比例高度起始点，下同
        YMaxValue: 10000, // 参照比例高度终止点，下同
    }
    // 时间osd参数默认配置
    const DEFAULT_TIME_CONFIG: CanvasOSDOptionTimeConfig = {
        dateFormat: 'year-month-day',
        timeFormat: 24,
        switch: true, // 是否显示
        X: 0,
        XMinValue: 0,
        XMaxValue: 10000,
        Y: 0,
        YMinValue: 0,
        YMaxValue: 10000,
        timestamp: new Date().getTime(),
    }
    // 参考系(一般是万分比)画布宽度
    const RELATIVE_WIDTH = DEFAULT_NAME_CONFIG.XMaxValue - DEFAULT_NAME_CONFIG.XMinValue
    // 参考系(一般是万分比)画布高度
    const RELATIVE_HEIGHT = DEFAULT_NAME_CONFIG.YMaxValue - DEFAULT_NAME_CONFIG.YMinValue

    // 通道名矩形区域
    let nameRect: CanvasBaseRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    // 时间矩形区域
    let timeRect: CanvasBaseRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }

    let onMouseDown: ((e: MouseEvent) => void) | undefined = undefined
    let onMouseMove: ((e: MouseEvent) => void) | undefined = undefined

    const onchange = option.onchange
    let nameCfg = {
        ...DEFAULT_NAME_CONFIG,
        ...(option.nameCfg || {}),
    }
    let timeCfg = {
        ...DEFAULT_TIME_CONFIG,
        ...(option.timeCfg || {}),
    }

    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    // 初始化
    const init = () => {
        clear()
        if (nameCfg.switch) {
            drawName()
        }

        if (timeCfg.switch) {
            drawTime()
        }
    }

    // 根据万分比尺寸获取画布尺寸
    const getRealSizeByRelative = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (cavWidth * size) / RELATIVE_WIDTH
        } else {
            return (cavHeight * size) / RELATIVE_HEIGHT
        }
    }

    // 根据画布尺寸获取对应万分比尺寸
    const getRelativeSizeByReal = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (RELATIVE_WIDTH * size) / cavWidth
        } else {
            return (RELATIVE_HEIGHT * size) / cavHeight
        }
    }

    // 设置osd配置
    const setCfg = (config: { nameCfg?: Partial<CanvasOSDOptionNameConfig>; timeCfg?: Partial<CanvasOSDOptionTimeConfig> }) => {
        nameCfg = {
            ...nameCfg,
            ...(config.nameCfg || {}),
        }
        timeCfg = {
            ...timeCfg,
            ...(config.timeCfg || {}),
        }
        init()
    }

    // 设置时间osd时间戳
    const setTime = (timestamp: number) => {
        timeCfg.timestamp = timestamp
        init()
    }

    // 绘制通道名osd
    const drawName = () => {
        const text = nameCfg.value
        const startX = getRealSizeByRelative(nameCfg.X, 'x')
        const startY = getRealSizeByRelative(nameCfg.Y, 'y')
        ctx.Text({
            text: text,
            startX: startX,
            startY: startY,
            fillStyle: OSD_COLOR,
            font: OSD_FONT,
        })
        const strLen = text.length
        const rectWidth = strLen * (OSD_FONT_SIZE - 5)
        const rectHeight = OSD_FONT_SIZE
        ctx.Rect(startX, startY, rectWidth, rectHeight, { strokeStyle: OSD_COLOR })
        nameRect = {
            x: startX,
            y: startY,
            width: rectWidth,
            height: rectHeight,
        }
    }

    // 绘制时间osd
    const drawTime = () => {
        const format = DATE_FORMAT_MAP[timeCfg.dateFormat] + ' ' + TIME_FORMAT_MAP[timeCfg.timeFormat]
        const text = formatDate(timeCfg.timestamp, format)
        const startX = getRealSizeByRelative(timeCfg.X, 'x')
        const startY = getRealSizeByRelative(timeCfg.Y, 'y')
        ctx.Text({
            text: text,
            startX: startX,
            startY: startY,
            fillStyle: OSD_COLOR,
            font: OSD_FONT,
        })
        const strLen = text.length
        const rectWidth = strLen * (OSD_FONT_SIZE - 5)
        const rectHeight = OSD_FONT_SIZE
        ctx.Rect(startX, startY, rectWidth, rectHeight, { strokeStyle: OSD_COLOR })
        timeRect = {
            x: startX,
            y: startY,
            width: rectWidth,
            height: rectHeight,
        }
    }

    // 绑定事件
    const bindEvent = () => {
        if (!onMouseDown) {
            onMouseDown = (e: MouseEvent) => {
                const isInName = ctx.IsInRect(e.offsetX, e.offsetY, nameRect.x, nameRect.y, nameRect.width, nameRect.height)
                const isInTime = ctx.IsInRect(e.offsetX, e.offsetY, timeRect.x, timeRect.y, timeRect.width, timeRect.height)
                if (!isInName && !isInTime) return
                const targetRect = isInName ? nameRect : timeRect
                const targetCfg = isInName ? nameCfg : timeCfg
                const clientX = e.clientX
                const clientY = e.clientY
                const startX = targetRect.x
                const startY = targetRect.y
                const cavWidth = canvas.width
                const cavHeight = canvas.height
                document.body.style.setProperty('user-select', 'none')
                const onMouseMove = (ev: MouseEvent) => {
                    let newX = startX + ev.clientX - clientX
                    let newY = startY + ev.clientY - clientY
                    if (newX <= 0) {
                        newX = 0
                    }

                    if (newX + targetRect.width >= cavWidth) {
                        newX = cavWidth - targetRect.width
                    }

                    if (newY <= 0) {
                        newY = 0
                    }

                    if (newY + targetRect.height >= cavHeight) {
                        newY = cavHeight - targetRect.height
                    }
                    targetCfg.X = getRelativeSizeByReal(newX, 'x')
                    targetCfg.Y = getRelativeSizeByReal(newY, 'y')
                    init()
                    onchange && onchange(nameCfg, timeCfg)
                }

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        }

        if (!onMouseMove) {
            // 监听鼠标移动事件，进入osd覆盖层时改变鼠标形态为move状态
            onMouseMove = (e: MouseEvent) => {
                const isInName = ctx.IsInRect(e.offsetX, e.offsetY, nameRect.x, nameRect.y, nameRect.width, nameRect.height)
                const isInTime = ctx.IsInRect(e.offsetX, e.offsetY, timeRect.x, timeRect.y, timeRect.width, timeRect.height)
                canvas.style.setProperty('cursor', 'default')
                if (!isInName && !isInTime) return
                canvas.style.setProperty('cursor', 'move')
            }
        }
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('mousemove', onMouseMove)
        canvas.addEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousemove', onMouseMove)
    }

    // 组件生命周期结束时执行
    const destroy = () => {
        if (onMouseDown) {
            canvas.removeEventListener('mousedown', onMouseDown)
        }

        if (onMouseMove) {
            canvas.removeEventListener('mousemove', onMouseMove)
        }
    }

    // 清除指定矩形区域的画布
    const clear = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
    }

    // 获取绘制信息
    const getOSDInfo = () => {
        return {
            nameCfg: nameCfg,
            timeCfg: timeCfg,
        }
    }

    bindEvent()

    return {
        setCfg,
        setTime,
        destroy,
        clear,
        getOSDInfo,
    }
}
