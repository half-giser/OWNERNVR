/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:08:25
 * @Description: 支持业务：越界、过线统计画线；三种模式：A->B、A<->B、A<-B
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 18:02:20
 */
import CanvasBase, { type CanvasBaseLineStyleOption } from './canvasBase'

interface CanvasPasslinePassline {
    startX: number
    startY: number
    endX: number
    endY: number
}

interface CanvasPasslineLineItem {
    direction: CanvasPasslineDirection
    startPoint: {
        X: number
        Y: number
    }
    endPoint: {
        X: number
        Y: number
    }
}

interface CanvasPasslineOsdInfo {
    X: number
    Y: number
    osdFormat: string
}

interface CanvasPasslineRect {
    x: number
    y: number
    width: number
    height: number
}

type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'

interface CanvasPasslineOption {
    el: HTMLCanvasElement
    lineStyle?: Partial<CanvasBaseLineStyleOption>
    textIn?: string
    textOut?: string
    enableLine?: boolean
    enableOSD: boolean
    enableShowAll: boolean
    direction?: CanvasPasslineDirection
    passline?: CanvasPasslinePassline
    osdInfo?: CanvasPasslineOsdInfo
    onchange: (passline: CanvasPasslinePassline, osdInfo: CanvasPasslineOsdInfo) => void
}

export default class CanvasPassline {
    private readonly DEFAULT_LINE_COLOR = '#00ff00'
    private readonly DEFAULT_TEXT_COLOR = '#ff0000'
    private readonly RELATIVE_WIDTH = 10000
    private readonly RELATIVE_HEIGHT = 10000
    private readonly VERTICAL_LINE_LENGTH = 50
    // private readonly TEXT_IN = 'A'
    // private readonly TEXT_OUT = 'B'
    private readonly DIRECTION_MAP: Record<CanvasPasslineDirection, string> = {
        none: 'NONE', // 双向箭头
        rightortop: 'A_TO_B', // 单向箭头A->B
        leftorbotton: 'B_TO_A', // 单向箭头B->A
    }
    private readonly DEFAULT_PASSLINE: CanvasPasslinePassline = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
    }
    private readonly DEFAULT_OSD_INFO: CanvasPasslineOsdInfo = {
        X: 0,
        Y: 0,
        osdFormat: '',
    }
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    private lineStyle: CanvasBaseLineStyleOption
    // private textIn: string
    // private textOut: string
    private enableLine: boolean
    private enableOSD: boolean
    private enableShowAll: boolean
    private direction: CanvasPasslineDirection
    private osdRect: CanvasPasslineRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    private osdInfo: CanvasPasslineOsdInfo
    private passline: CanvasPasslinePassline
    private lineInfoList: CanvasPasslineLineItem[] = []
    private currentSurfaceOrAlarmLine = 0
    private readonly onchange: CanvasPasslineOption['onchange']
    private onMouseDown?: (e: MouseEvent) => void

    constructor(option: CanvasPasslineOption) {
        // 箭头方向配置
        this.lineStyle = {
            strokeStyle: this.DEFAULT_LINE_COLOR,
            lineWidth: 1.5,
            ...(option.lineStyle || {}),
        }
        // this.textIn = option.textIn || this.TEXT_IN
        // this.textOut = option.textOut || this.TEXT_OUT
        this.enableLine = option.enableLine || true
        this.enableOSD = option.enableOSD
        this.enableShowAll = option.enableShowAll
        this.direction = option.direction || 'rightortop'

        this.passline = {
            ...this.DEFAULT_PASSLINE,
            ...(option.passline || {}),
        }
        this.osdInfo = {
            ...this.DEFAULT_OSD_INFO,
            ...(option.osdInfo || {}),
        }
        this.onchange = option.onchange
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.bindEvent()
    }

    // 全量绘制
    init() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        const realItem = this.drawPassline(this.passline)
        this.drawDirection(realItem)
        // 设置OSD
        if (this.enableOSD) {
            this.drawOSD()
        }
    }

    // 绘制警戒线
    drawPassline(linePoints: CanvasPasslinePassline) {
        const item = this.getRealItemByRelative(linePoints)
        this.ctx.Line(item.startX, item.startY, item.endX, item.endY, this.lineStyle)
        return item
    }

    // 绘制所有区域警戒线
    drawAllPassline(lineInfoList: CanvasPasslineLineItem[], currentSurfaceOrAlarmLine: number) {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
        // 遍历所有警戒面进行全部显示
        this.lineInfoList = lineInfoList
        const lineStyle = JSON.parse(JSON.stringify(this.lineStyle))
        lineInfoList.forEach((lineInfo, surfaceOrAlarmLine) => {
            if (surfaceOrAlarmLine == currentSurfaceOrAlarmLine) {
                this.lineStyle.lineWidth = 3
            } else {
                this.lineStyle.lineWidth = 1.5
            }
            const lineDirection = lineInfo.direction
            const linePoints = {
                startX: lineInfo.startPoint.X,
                startY: lineInfo.startPoint.Y,
                endX: lineInfo.endPoint.X,
                endY: lineInfo.endPoint.Y,
            }
            this.setDirection(lineDirection)
            const realItem = this.drawPassline(linePoints)
            this.drawDirection(realItem)
        })
        this.lineStyle = lineStyle
        // 设置当前选中区域的越界方向
        this.setDirection(lineInfoList[currentSurfaceOrAlarmLine].direction)
        // 设置OSD
        if (this.enableOSD) {
            this.drawOSD()
        }
    }

    // 实时绘制全部区域（显示全部区域时，绘制当前区域的同时显示其余区域）
    drawConstantly() {
        if (this.enableShowAll && this.lineInfoList) {
            this.lineInfoList[this.currentSurfaceOrAlarmLine].direction = this.direction
            this.lineInfoList[this.currentSurfaceOrAlarmLine].startPoint = {
                X: this.passline.startX,
                Y: this.passline.startY,
            }
            this.lineInfoList[this.currentSurfaceOrAlarmLine].endPoint = {
                X: this.passline.endX,
                Y: this.passline.endY,
            }
            this.drawAllPassline(this.lineInfoList, this.currentSurfaceOrAlarmLine)
        }
    }

    // 是否显示全部警戒面
    setEnableShowAll(enable: boolean) {
        this.enableShowAll = enable
    }

    // 绘制方向
    drawDirection(item: CanvasPasslinePassline) {
        const startX = item.startX,
            startY = item.startY,
            endX = item.endX,
            endY = item.endY
        if (startX === endX && startY === endY) return
        const centerPointX = (startX + endX) / 2
        const centerPointY = (startY + endY) / 2
        // 垂线两端点
        let direStartX, direStartY, direEndX, direEndY
        if (startY === endY) {
            // 警戒线和x轴平行时
            direStartX = direEndX = centerPointX
            direStartY = centerPointY - this.VERTICAL_LINE_LENGTH / 2
            direEndY = centerPointY + this.VERTICAL_LINE_LENGTH / 2
        } else if (startX === endX) {
            // 警戒线和y轴平行时
            direStartY = direEndY = centerPointY
            direStartX = centerPointX - this.VERTICAL_LINE_LENGTH / 2
            direEndX = centerPointX + this.VERTICAL_LINE_LENGTH / 2
        } else {
            // 警戒线和x、y轴都不平行时，使用三角函数求垂线两端点坐标
            const atan = Math.atan(Math.abs(startX - endX) / Math.abs(startY - endY))
            const relatCenterX = (this.VERTICAL_LINE_LENGTH / 2) * Math.cos(atan)
            const relatCenterY = (this.VERTICAL_LINE_LENGTH / 2) * Math.sin(atan)
            // 先判断警戒线的走向
            if ((startX - endX) * (startY - endY) > 0) {
                // 西北-东南向
                direStartX = centerPointX - relatCenterX
                direStartY = centerPointY + relatCenterY
                direEndX = centerPointX + relatCenterX
                direEndY = centerPointY - relatCenterY
            } else {
                // 东北-西南向
                direStartX = centerPointX + relatCenterX
                direStartY = centerPointY + relatCenterY
                direEndX = centerPointX - relatCenterX
                direEndY = centerPointY - relatCenterY
            }
        }
        // 计算中点、垂线两端点相对警戒线起点的坐标
        const relaCenterP = this.ctx.getRelativePoint(startX, startY, centerPointX, centerPointY)
        const relaDireStartP = this.ctx.getRelativePoint(startX, startY, direStartX, direStartY)
        // 分别计算中点相对坐标相对垂线端点相对坐标的向量叉乘，判断中点是否在起点的顺时针方向
        // 若结果为true, 则端点起止坐标不变，否则互换位置
        const startIsClockwise = this.ctx.isClockwise(relaDireStartP.x, relaDireStartP.y, relaCenterP.x, relaCenterP.y)
        let finalStartX = direStartX,
            finalStartY = direStartY
        if (!startIsClockwise) {
            finalStartX = direEndX
            finalStartY = direEndY
            direEndX = direStartX
            direEndY = direStartY
        }
        this.ctx.Line(finalStartX, finalStartY, direEndX, direEndY, this.lineStyle)
        this.drawArrow(finalStartX, finalStartY, direEndX, direEndY)
    }

    // 画箭头和文字
    drawArrow(finalStartX: number, finalStartY: number, direEndX: number, direEndY: number) {
        const direction = this.DIRECTION_MAP[this.direction]
        if (direction === 'A_TO_B') {
            // 箭头画在B点
            this.ctx.Arrow({
                startX: finalStartX,
                startY: finalStartY,
                endX: direEndX,
                endY: direEndY,
                pointX: direEndX,
                pointY: direEndY,
                lineStyle: this.lineStyle,
                textCfg: {
                    textStart: 'A',
                    textEnd: 'B',
                },
            })
        }

        if (direction === 'B_TO_A') {
            // 箭头画在A点
            this.ctx.Arrow({
                startX: direEndX,
                startY: direEndY,
                endX: finalStartX,
                endY: finalStartY,
                pointX: finalStartX,
                pointY: finalStartY,
                lineStyle: this.lineStyle,
                textCfg: {
                    textStart: 'B',
                    textEnd: 'A',
                },
            })
        }

        if (direction === 'NONE') {
            // 双箭头，避免重复绘制文字textCfg
            // 箭头画在B点
            this.ctx.Arrow({
                startX: finalStartX,
                startY: finalStartY,
                endX: direEndX,
                endY: direEndY,
                pointX: direEndX,
                pointY: direEndY,
                lineStyle: this.lineStyle,
                textCfg: {
                    textStart: 'A',
                    textEnd: 'B',
                },
            })
            // 箭头画在A点
            this.ctx.Arrow({
                startX: direEndX,
                startY: direEndY,
                endX: finalStartX,
                endY: finalStartY,
                pointX: finalStartX,
                pointY: finalStartY,
                lineStyle: this.lineStyle,
            })
        }
    }

    // 设置警戒区域
    setPassline(passline: CanvasPasslinePassline) {
        this.passline = passline
        this.init()
    }

    // 设置方向
    setDirection(direction: CanvasPasslineDirection) {
        this.direction = direction
    }

    // 设置当前警戒面索引
    setCurrentSurfaceOrAlarmLine(currentSurfaceOrAlarmLine: number) {
        this.currentSurfaceOrAlarmLine = currentSurfaceOrAlarmLine
    }

    // 设置警戒线/osd是否可绘制 type: line警戒线 osd: OSD显示
    setEnable(type: 'line' | 'osd', enable: boolean) {
        if (type === 'line') {
            this.enableLine = enable
        } else if (type === 'osd') {
            this.enableOSD = enable
        }
    }

    // 设置osdInfo: { osdFormat: '111\n222', X: 100, Y: 100 }
    setOSD(osdInfo: CanvasPasslineOsdInfo) {
        this.osdInfo = osdInfo
        this.init()
        this.drawConstantly()
    }

    // 绘制OSD
    drawOSD() {
        if (!this.osdInfo) return
        let X = this.getRealSizeByRelative(this.osdInfo.X, 'x')
        let Y = this.getRealSizeByRelative(this.osdInfo.Y, 'y')

        const // 兼容字符串里有\n和直接回车的换行
            splitStr = this.osdInfo.osdFormat && this.osdInfo.osdFormat.includes('\\n') ? '\\n' : '\n'

        const osdList = this.osdInfo.osdFormat ? this.osdInfo.osdFormat.split(splitStr) : []
        let longestStrLen = 0
        const osdWidth = this.getOSDWH(this.osdInfo).osdWidth
        const osdHeight = this.getOSDWH(this.osdInfo).osdHeight
        if (X + osdWidth >= this.cavWidth) X = this.cavWidth - osdWidth
        if (Y + osdHeight >= this.cavHeight) Y = this.cavHeight - osdHeight
        for (let i = 0; i < osdList.length; i++) {
            const item = osdList[i].trim()
            // 空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - lowerStrCount - spaceStrCount) * 9
            longestStrLen = itemStrLength > longestStrLen ? itemStrLength : longestStrLen
            this.ctx.Text({
                text: item,
                startX: X,
                startY: Y + i * 18,
                font: '14px Verdana',
                strokeStyle: '#000',
                fillStyle: this.DEFAULT_TEXT_COLOR,
            })
        }
        // 设置osd所在矩形区域
        this.osdRect = {
            x: X,
            y: Y,
            width: longestStrLen,
            height: osdList.length * 17.5,
        }
    }

    // 获取OSD宽度和高度
    getOSDWH({ osdFormat }: CanvasPasslineOsdInfo) {
        const // 兼容字符串里有\n和直接回车的换行
            splitStr = osdFormat && osdFormat.includes('\\n') ? '\\n' : '\n'

        const osdList = osdFormat ? osdFormat.split(splitStr) : []
        let longestStrLen = 0
        for (let i = 0; i < osdList.length; i++) {
            const item = osdList[i].trim()
            // 空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - lowerStrCount - spaceStrCount) * 9
            longestStrLen = itemStrLength > longestStrLen ? itemStrLength : longestStrLen
        }
        return {
            osdWidth: longestStrLen,
            osdHeight: osdList.length * 17.5,
        }
    }

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                if (!this.enableLine && !this.enableOSD) {
                    return
                }
                const startX = e.offsetX,
                    startY = e.offsetY
                const clientX = e.clientX,
                    clientY = e.clientY
                let endX, endY
                // 先判断是否在osd矩形区域内
                let isInOSD = false
                const osdRectX = this.osdRect.x,
                    osdRectY = this.osdRect.y,
                    osdRectW = this.osdRect.width,
                    osdRectH = this.osdRect.height
                if (this.enableOSD && this.ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                    isInOSD = true
                }

                if (!isInOSD && !this.enableLine) {
                    return
                }
                document.body.style.setProperty('user-select', 'none')

                const onMouseMove = (e1: MouseEvent) => {
                    endX = e1.clientX - clientX + startX
                    endY = e1.clientY - clientY + startY
                    if (isInOSD) {
                        // osd跟随鼠标移动
                        let newStartX = osdRectX + endX - startX
                        let newStartY = osdRectY + endY - startY
                        if (newStartX <= 0) newStartX = 0
                        if (newStartX + osdRectW >= this.cavWidth) newStartX = this.cavWidth - osdRectW
                        if (newStartY <= 0) newStartY = 0
                        if (newStartY + osdRectH >= this.cavHeight) newStartY = this.cavHeight - osdRectH
                        const X = this.getRelativeSizeByReal(newStartX, 'x')
                        const Y = this.getRelativeSizeByReal(newStartY, 'y')
                        this.setOSD({
                            X,
                            Y,
                            osdFormat: this.osdInfo.osdFormat,
                        })
                        this.drawConstantly()
                    } else {
                        // 绘制警戒线
                        if (endX < 0) endX = 0
                        if (endX > this.cavWidth) endX = this.cavWidth
                        if (endY < 0) endY = 0
                        if (endY > this.cavHeight) endY = this.cavHeight
                        const item = this.getRelativeItemByReal({ startX, startY, endX, endY })
                        this.setPassline(item)
                        this.drawConstantly()
                    }
                }

                const onMouseUp = () => {
                    this.onchange && this.onchange(this.passline, this.osdInfo)
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

    getRealItemByRelative({ startX, startY, endX, endY }: CanvasPasslinePassline) {
        return {
            startX: this.getRealSizeByRelative(startX, 'x'),
            startY: this.getRealSizeByRelative(startY, 'y'),
            endX: this.getRealSizeByRelative(endX, 'x'),
            endY: this.getRealSizeByRelative(endY, 'y'),
        }
    }

    getRelativeItemByReal({ startX, startY, endX, endY }: CanvasPasslinePassline) {
        return {
            startX: this.getRelativeSizeByReal(startX, 'x'),
            startY: this.getRelativeSizeByReal(startY, 'y'),
            endX: this.getRelativeSizeByReal(endX, 'x'),
            endY: this.getRelativeSizeByReal(endY, 'y'),
        }
    }

    // 获取绘制数据
    getPassline() {
        return this.passline
    }

    // 清空区域
    clear() {
        this.passline = {
            ...this.DEFAULT_PASSLINE,
        }
        this.setPassline(this.passline)
    }
}
