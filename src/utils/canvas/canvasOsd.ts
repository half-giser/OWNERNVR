/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 16:36:04
 * @Description: canvas绘制osd配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 16:23:49
 */
import CanvasBase from './canvasBase'

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

interface CanvasOSDRect {
    x: number
    y: number
    width: number
    height: number
}

interface CanvasOSDOption {
    el: HTMLCanvasElement
    nameCfg?: Partial<CanvasOSDOptionNameConfig>
    timeCfg?: Partial<CanvasOSDOptionTimeConfig>
    onchange?: (nameCfg: CanvasOSDOptionNameConfig, timeCfg: CanvasOSDOptionTimeConfig) => void
}

export default class CanvasOSD {
    private readonly OSD_COLOR: string | CanvasGradient | CanvasPattern = '#f00' // osd颜色
    private readonly OSD_FONT_SIZE = 14 // osd字体大小
    private readonly OSD_FONT = this.OSD_FONT_SIZE + 'px Arial'
    private readonly DATE_FORMAT_MAP = {
        'year-month-day': 'YYYY/MM/DD',
        'month-day-year': 'MM/DD/yyyy',
        'day-month-year': 'DD/MM/yyyy',
    }
    private readonly TIME_FORMAT_MAP = {
        12: 'hh:mm:ss A',
        24: 'HH:mm:ss',
    }
    // 通道名osd参数默认配置
    private readonly DEFAULT_NAME_CONFIG: CanvasOSDOptionNameConfig = {
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
    private readonly DEFAULT_TIME_CONFIG: CanvasOSDOptionTimeConfig = {
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
    private readonly RELATIVE_WIDTH = this.DEFAULT_NAME_CONFIG.XMaxValue - this.DEFAULT_NAME_CONFIG.XMinValue
    // 参考系(一般是万分比)画布高度
    private readonly RELATIVE_HEIGHT = this.DEFAULT_NAME_CONFIG.YMaxValue - this.DEFAULT_NAME_CONFIG.YMinValue
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    // 通道名矩形区域
    private nameRect: CanvasOSDRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    // 时间矩形区域
    private timeRect: CanvasOSDRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    private onchange: CanvasOSDOption['onchange']
    private nameCfg: CanvasOSDOptionNameConfig
    private timeCfg: CanvasOSDOptionTimeConfig
    private onMouseDown?: (e: MouseEvent) => void
    private onMouseMove?: (e: MouseEvent) => void

    /*
     * OSD配置绘制
     * @param {Object} option
     *      @property {String} el 画布选择器
     *      @property {Object} nameCfg 通道名osd配置
     *      @property {Object} timeCfg 时间osd配置
     *      @property {Function} onchange osd配置改变的回调
     */
    constructor(option: CanvasOSDOption) {
        this.onchange = option.onchange
        this.nameCfg = {
            ...this.DEFAULT_NAME_CONFIG,
            ...(option.nameCfg || {}),
        }
        this.timeCfg = {
            ...this.DEFAULT_TIME_CONFIG,
            ...(option.timeCfg || {}),
        }

        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.bindEvent()
    }

    // 初始化
    init() {
        this.clear()
        if (this.nameCfg.switch) {
            this.drawName()
        }

        if (this.timeCfg.switch) {
            this.drawTime()
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

    // 设置osd配置
    setCfg(config: { nameCfg?: Partial<CanvasOSDOptionNameConfig>; timeCfg?: Partial<CanvasOSDOptionTimeConfig> }) {
        this.nameCfg = {
            ...this.nameCfg,
            ...(config.nameCfg || {}),
        }
        this.timeCfg = {
            ...this.timeCfg,
            ...(config.timeCfg || {}),
        }
        this.init()
    }

    // 设置时间osd时间戳
    setTime(timestamp: number) {
        this.timeCfg.timestamp = timestamp
        this.init()
    }

    // 绘制通道名osd
    drawName() {
        const ctx = this.ctx
        const text = this.nameCfg.value
        const startX = this.getRealSizeByRelative(this.nameCfg.X, 'x')
        const startY = this.getRealSizeByRelative(this.nameCfg.Y, 'y')
        ctx.Text({
            text: text,
            startX: startX,
            startY: startY,
            fillStyle: this.OSD_COLOR,
            font: this.OSD_FONT,
        })
        const strLen = text.length
        const rectWidth = strLen * (this.OSD_FONT_SIZE - 5)
        const rectHeight = this.OSD_FONT_SIZE
        ctx.Rect(startX, startY, rectWidth, rectHeight, { strokeStyle: this.OSD_COLOR })
        this.nameRect = {
            x: startX,
            y: startY,
            width: rectWidth,
            height: rectHeight,
        }
    }

    // 绘制时间osd
    drawTime() {
        const ctx = this.ctx
        const format = this.DATE_FORMAT_MAP[this.timeCfg.dateFormat] + ' ' + this.TIME_FORMAT_MAP[this.timeCfg.timeFormat]
        const text = formatDate(this.timeCfg.timestamp, format)
        const startX = this.getRealSizeByRelative(this.timeCfg.X, 'x')
        const startY = this.getRealSizeByRelative(this.timeCfg.Y, 'y')
        ctx.Text({
            text: text,
            startX: startX,
            startY: startY,
            fillStyle: this.OSD_COLOR,
            font: this.OSD_FONT,
        })
        const strLen = text.length
        const rectWidth = strLen * (this.OSD_FONT_SIZE - 5)
        const rectHeight = this.OSD_FONT_SIZE
        ctx.Rect(startX, startY, rectWidth, rectHeight, { strokeStyle: this.OSD_COLOR })
        this.timeRect = {
            x: startX,
            y: startY,
            width: rectWidth,
            height: rectHeight,
        }
    }

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                const isInName = this.ctx.IsInRect(e.offsetX, e.offsetY, this.nameRect.x, this.nameRect.y, this.nameRect.width, this.nameRect.height)
                const isInTime = this.ctx.IsInRect(e.offsetX, e.offsetY, this.timeRect.x, this.timeRect.y, this.timeRect.width, this.timeRect.height)
                if (!isInName && !isInTime) return
                const targetRect = isInName ? 'nameRect' : 'timeRect'
                const targetCfg = isInName ? 'nameCfg' : 'timeCfg'
                const clientX = e.clientX
                const clientY = e.clientY
                const startX = this[targetRect].x
                const startY = this[targetRect].y
                const cavWidth = this.canvas.width
                const cavHeight = this.canvas.height
                document.body.style.setProperty('user-select', 'none')
                const onMouseMove = (ev: MouseEvent) => {
                    let newX = startX + ev.clientX - clientX
                    let newY = startY + ev.clientY - clientY
                    if (newX <= 0) {
                        newX = 0
                    }

                    if (newX + this[targetRect].width >= cavWidth) {
                        newX = cavWidth - this[targetRect].width
                    }

                    if (newY <= 0) {
                        newY = 0
                    }

                    if (newY + this[targetRect].height >= cavHeight) {
                        newY = cavHeight - this[targetRect].height
                    }
                    this[targetCfg].X = this.getRelativeSizeByReal(newX, 'x')
                    this[targetCfg].Y = this.getRelativeSizeByReal(newY, 'y')
                    this.init()
                    this.onchange && this.onchange(this.nameCfg, this.timeCfg)
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

        if (!this.onMouseMove) {
            // 监听鼠标移动事件，进入osd覆盖层时改变鼠标形态为move状态
            this.onMouseMove = (e: MouseEvent) => {
                const isInName = this.ctx.IsInRect(e.offsetX, e.offsetY, this.nameRect.x, this.nameRect.y, this.nameRect.width, this.nameRect.height)
                const isInTime = this.ctx.IsInRect(e.offsetX, e.offsetY, this.timeRect.x, this.timeRect.y, this.timeRect.width, this.timeRect.height)
                this.canvas.style.setProperty('cursor', 'default')
                if (!isInName && !isInTime) return
                this.canvas.style.setProperty('cursor', 'move')
            }
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown)
        this.canvas.removeEventListener('mousemove', this.onMouseMove)
        this.canvas.addEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousemove', this.onMouseMove)
    }

    // 组件生命周期结束时执行
    destroy() {
        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }

        if (this.onMouseMove) {
            this.canvas.removeEventListener('mousemove', this.onMouseMove)
        }
    }

    // 清除指定矩形区域的画布
    clear() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
    }

    // 获取绘制信息
    getOSDInfo() {
        return {
            nameCfg: this.nameCfg,
            timeCfg: this.timeCfg,
        }
    }
}
