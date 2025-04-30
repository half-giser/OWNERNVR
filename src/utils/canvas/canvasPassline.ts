/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:08:25
 * @Description: 支持业务：越界、过线统计画线；三种模式：A->B、A<->B、A<-B
 */

import { type CanvasBaseArea } from './canvasBase'

export interface CanvasPasslinePassline {
    startX: number
    startY: number
    endX: number
    endY: number
}

export interface CanvasPasslineLineItem {
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

export interface CanvasPasslineOsdInfo {
    X: number
    Y: number
    osdFormat: string
}

export interface CanvasPasslineRect {
    x: number
    y: number
    width: number
    height: number
}

type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'

interface CanvasPasslineOption {
    el?: HTMLCanvasElement
    lineStyle?: Partial<CanvasBaseLineStyleOption>
    textIn?: string
    textOut?: string
    enableLine?: boolean
    enableOSD?: boolean
    enableShowAll?: boolean
    enableShowRange?: boolean // 是否显示最大/最小区域，默认false
    direction?: CanvasPasslineDirection
    passline?: CanvasPasslinePassline
    osdInfo?: CanvasPasslineOsdInfo
    onchange?: (passline: CanvasPasslinePassline, osdInfo: CanvasPasslineOsdInfo) => void
}

export const CanvasPassline = (option: CanvasPasslineOption = {}) => {
    const DEFAULT_LINE_COLOR = '#0f0'
    const DEFAULT_TEXT_COLOR = '#f00'
    const RELATIVE_WIDTH = 10000
    const RELATIVE_HEIGHT = 10000
    const VERTICAL_LINE_LENGTH = 50
    // const TEXT_IN = 'A'
    // const TEXT_OUT = 'B'
    const DIRECTION_MAP: Record<CanvasPasslineDirection, string> = {
        none: 'NONE', // 双向箭头
        rightortop: 'A_TO_B', // 单向箭头A->B
        leftorbotton: 'B_TO_A', // 单向箭头B->A
    }
    const DEFAULT_PASSLINE: CanvasPasslinePassline = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
    }
    const DEFAULT_OSD_INFO: CanvasPasslineOsdInfo = {
        X: 0,
        Y: 0,
        osdFormat: '',
    }

    let osdRect: CanvasPasslineRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    let lineInfoList: CanvasPasslineLineItem[] = []
    let currentSurfaceOrAlarmLine = 0

    // 箭头方向配置
    const lineStyle = {
        strokeStyle: DEFAULT_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.lineStyle || {}),
    }
    // const textIn = option.textIn || TEXT_IN
    // const textOut = option.textOut || TEXT_OUT
    let enableLine = typeof option.enableLine === 'boolean' ? option.enableLine : true
    let enableOSD = option.enableOSD || false
    let enableShowAll = option.enableShowAll || false
    let enableShowRange = option.enableShowRange || false
    let direction = option.direction || 'rightortop'
    let passline = {
        ...DEFAULT_PASSLINE,
        ...(option.passline || {}),
    }
    let osdInfo = {
        ...DEFAULT_OSD_INFO,
        ...(option.osdInfo || {}),
    }

    const onchange = option.onchange
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    let draggingMaxMin = false // 是否正在拖拽最大/最小目标框
    let selectedMax = false // 是否选中最大目标框
    let selectedMin = false // 是否选中最小目标框
    let hoverOnMaxMinFlag = false // 防止频繁触发"绘制事件"的绑定
    let rangeMax: CanvasBaseArea = {
        X1: 0,
        X2: 0,
        Y1: 0,
        Y2: 0,
    }
    let rangeMin: CanvasBaseArea = {
        X1: 0,
        X2: 0,
        Y1: 0,
        Y2: 0,
    }
    const MAX_MIN_COLOR = '#ffff00' // rgb(255, 255, 0)

    /**
     * @description 全量绘制
     */
    const init = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        const realItem = drawPassline(passline)
        drawDirection(realItem)
        // 设置OSD
        if (enableOSD) {
            drawOSD()
        }

        // 绘制最大，最小范围框
        if (enableShowRange) {
            drawRangeMax()
            drawRangeMin()
        }
    }

    /**
     * @description 绘制警戒线
     * @param {CanvasPasslinePassline} linePoints
     * @returns
     */
    const drawPassline = (linePoints: CanvasPasslinePassline) => {
        const item = getRealItemByRelative(linePoints)
        ctx.Line(item.startX, item.startY, item.endX, item.endY, lineStyle)
        return item
    }

    /**
     * @description 绘制所有区域警戒线
     * @param newLineInfoList
     * @param currentSurfaceOrAlarmLine
     */
    const drawAllPassline = (newLineInfoList: CanvasPasslineLineItem[], currentSurfaceOrAlarmLine: number) => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        // 遍历所有警戒面进行全部显示
        lineInfoList = newLineInfoList
        lineInfoList.forEach((lineInfo, surfaceOrAlarmLine) => {
            if (surfaceOrAlarmLine === currentSurfaceOrAlarmLine) {
                lineStyle.lineWidth = 3
            } else {
                lineStyle.lineWidth = 1.5
            }
            const lineDirection = lineInfo.direction
            const linePoints = {
                startX: lineInfo.startPoint.X,
                startY: lineInfo.startPoint.Y,
                endX: lineInfo.endPoint.X,
                endY: lineInfo.endPoint.Y,
            }
            setDirection(lineDirection)
            const realItem = drawPassline(linePoints)
            drawDirection(realItem)
        })

        // 设置当前选中区域的越界方向
        setDirection(lineInfoList[currentSurfaceOrAlarmLine].direction)

        // 设置OSD
        if (enableOSD) {
            drawOSD()
        }

        // 绘制最大，最小范围框
        if (enableShowRange) {
            drawRangeMax()
            drawRangeMin()
        }
    }

    /**
     * @description 实时绘制全部区域（显示全部区域时，绘制当前区域的同时显示其余区域）
     */
    const drawConstantly = () => {
        init()

        if (enableShowAll && lineInfoList) {
            lineInfoList[currentSurfaceOrAlarmLine].direction = direction
            lineInfoList[currentSurfaceOrAlarmLine].startPoint = {
                X: passline.startX,
                Y: passline.startY,
            }
            lineInfoList[currentSurfaceOrAlarmLine].endPoint = {
                X: passline.endX,
                Y: passline.endY,
            }
            drawAllPassline(lineInfoList, currentSurfaceOrAlarmLine)
        }
    }

    /**
     * @description 是否显示全部警戒面
     * @param {boolean} enable
     */
    const setEnableShowAll = (enable: boolean) => {
        enableShowAll = enable
    }

    /**
     * @description 绘制方向
     * @param {CanvasPasslinePassline} item
     */
    const drawDirection = (item: CanvasPasslinePassline) => {
        const startX = item.startX
        const startY = item.startY
        const endX = item.endX
        const endY = item.endY

        if (startX === endX && startY === endY) return

        const centerPointX = (startX + endX) / 2
        const centerPointY = (startY + endY) / 2

        // 垂线两端点
        let direStartX: number
        let direStartY: number
        let direEndX: number
        let direEndY: number

        if (startY === endY) {
            // 警戒线和x轴平行时
            direStartX = direEndX = centerPointX
            direStartY = centerPointY - VERTICAL_LINE_LENGTH / 2
            direEndY = centerPointY + VERTICAL_LINE_LENGTH / 2
        } else if (startX === endX) {
            // 警戒线和y轴平行时
            direStartY = direEndY = centerPointY
            direStartX = centerPointX - VERTICAL_LINE_LENGTH / 2
            direEndX = centerPointX + VERTICAL_LINE_LENGTH / 2
        } else {
            // 警戒线和x、y轴都不平行时，使用三角函数求垂线两端点坐标
            const atan = Math.atan(Math.abs(startX - endX) / Math.abs(startY - endY))
            const relatCenterX = (VERTICAL_LINE_LENGTH / 2) * Math.cos(atan)
            const relatCenterY = (VERTICAL_LINE_LENGTH / 2) * Math.sin(atan)
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
        const relaCenterP = ctx.getRelativePoint(startX, startY, centerPointX, centerPointY)
        const relaDireStartP = ctx.getRelativePoint(startX, startY, direStartX, direStartY)
        // 分别计算中点相对坐标相对垂线端点相对坐标的向量叉乘，判断中点是否在起点的顺时针方向
        // 若结果为true, 则端点起止坐标不变，否则互换位置
        const startIsClockwise = ctx.isClockwise(relaDireStartP.x, relaDireStartP.y, relaCenterP.x, relaCenterP.y)
        let finalStartX = direStartX
        let finalStartY = direStartY
        if (!startIsClockwise) {
            finalStartX = direEndX
            finalStartY = direEndY
            direEndX = direStartX
            direEndY = direStartY
        }
        ctx.Line(finalStartX, finalStartY, direEndX, direEndY, lineStyle)
        drawArrow(finalStartX, finalStartY, direEndX, direEndY)
    }

    /**
     * @description 画箭头和文字
     * @param finalStartX
     * @param finalStartY
     * @param direEndX
     * @param direEndY
     */
    const drawArrow = (finalStartX: number, finalStartY: number, direEndX: number, direEndY: number) => {
        const currentDirection = DIRECTION_MAP[direction]
        if (currentDirection === 'A_TO_B') {
            // 箭头画在B点
            ctx.Arrow({
                startX: finalStartX,
                startY: finalStartY,
                endX: direEndX,
                endY: direEndY,
                pointX: direEndX,
                pointY: direEndY,
                lineStyle: lineStyle,
                textCfg: {
                    textStart: 'A',
                    textEnd: 'B',
                },
            })
        }

        if (currentDirection === 'B_TO_A') {
            // 箭头画在A点
            ctx.Arrow({
                startX: direEndX,
                startY: direEndY,
                endX: finalStartX,
                endY: finalStartY,
                pointX: finalStartX,
                pointY: finalStartY,
                lineStyle: lineStyle,
                textCfg: {
                    textStart: 'B',
                    textEnd: 'A',
                },
            })
        }

        if (currentDirection === 'NONE') {
            // 双箭头，避免重复绘制文字textCfg
            // 箭头画在B点
            ctx.Arrow({
                startX: finalStartX,
                startY: finalStartY,
                endX: direEndX,
                endY: direEndY,
                pointX: direEndX,
                pointY: direEndY,
                lineStyle: lineStyle,
                textCfg: {
                    textStart: 'A',
                    textEnd: 'B',
                },
            })
            // 箭头画在A点
            ctx.Arrow({
                startX: direEndX,
                startY: direEndY,
                endX: finalStartX,
                endY: finalStartY,
                pointX: finalStartX,
                pointY: finalStartY,
                lineStyle: lineStyle,
            })
        }
    }

    /**
     * @description 设置警戒区域
     * @param info
     */
    const setPassline = (info: CanvasPasslinePassline) => {
        passline = info
        init()
    }

    /**
     * @description 设置方向
     * @param info
     */
    const setDirection = (info: CanvasPasslineDirection) => {
        direction = info
    }

    /**
     * @description 设置当前警戒面索引
     * @param info
     */
    const setCurrentSurfaceOrAlarmLine = (info: number) => {
        currentSurfaceOrAlarmLine = info
    }

    /**
     * @description 设置警戒线/osd是否可绘制 type: line警戒线 osd: OSD显示
     * @param type
     * @param enable
     */
    const setEnable = (type: 'line' | 'osd', enable: boolean) => {
        if (type === 'line') {
            enableLine = enable
        } else if (type === 'osd') {
            enableOSD = enable
        }
    }

    /**
     * @description 设置osdInfo: { osdFormat: '111\n222', X: 100, Y: 100 }
     * @param info
     */
    const setOSD = (info: CanvasPasslineOsdInfo) => {
        osdInfo = info
        init()
        drawConstantly()
    }

    /**
     * @description 绘制OSD
     * @returns
     */
    const drawOSD = () => {
        if (!osdInfo) return

        // 兼容字符串里有\n和直接回车的换行
        const splitStr = osdInfo.osdFormat && osdInfo.osdFormat.includes('\\n') ? '\\n' : '\n'
        const osdList = osdInfo.osdFormat ? osdInfo.osdFormat.split(splitStr) : []
        const osdWidth = getOSDWH(osdInfo).osdWidth
        const osdHeight = getOSDWH(osdInfo).osdHeight
        const X = clamp(getRealSizeByRelative(osdInfo.X, 'x'), cavWidth - osdWidth)
        const Y = clamp(getRealSizeByRelative(osdInfo.Y, 'y'), cavHeight - osdHeight)
        let longestStrLen = 0

        for (let i = 0; i < osdList.length; i++) {
            const item = osdList[i].trim()
            // 汉字占13px，空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const chineseCount = item.match(/[\u4e00-\u9fa5]/g)?.length || 0
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = chineseCount * 13 + spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - chineseCount - lowerStrCount - spaceStrCount) * 9
            longestStrLen = Math.max(itemStrLength, longestStrLen)
            ctx.Text({
                text: item,
                startX: X,
                startY: Y + i * 18,
                font: '14px Verdana',
                strokeStyle: '#000',
                fillStyle: DEFAULT_TEXT_COLOR,
            })
        }
        // 设置osd所在矩形区域
        osdRect = {
            x: X,
            y: Y,
            width: longestStrLen,
            height: osdList.length * 17.5,
        }
    }

    // 设置最值区域是否可见
    const toggleRange = (visible: boolean) => {
        enableShowRange = visible
        drawConstantly()
        bindDragMaxMinEvent()
    }

    // 设置最大值
    const setRangeMax = (value: CanvasBaseArea) => {
        rangeMax = value
        selectedMax = false
        selectedMin = false
        drawConstantly()
        bindDragMaxMinEvent()
    }

    // 设置最小值
    const setRangeMin = (value: CanvasBaseArea) => {
        rangeMin = value
        selectedMax = false
        selectedMin = false
        drawConstantly()
        bindDragMaxMinEvent()
    }

    // 绘制最大值区域
    const drawRangeMax = () => {
        const item = getRealAreaItemByRelative(rangeMax)
        const lineStyle = {
            strokeStyle: MAX_MIN_COLOR,
            lineWidth: 1.5,
        }
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Max',
            startX: item.X2 - ctx.MeasureText('Max').width - 4,
            startY: item.Y1 + 4,
            fillStyle: MAX_MIN_COLOR,
            strokeStyle: '#000',
            textBaseline: 'top',
        })

        if (selectedMax) {
            ctx.FillCircle(item.X1, item.Y1, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X2, item.Y1, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X1, item.Y2, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X2, item.Y2, 4, MAX_MIN_COLOR)
        }
    }

    // 绘制最小值区域
    const drawRangeMin = () => {
        const item = getRealAreaItemByRelative(rangeMin)
        const lineStyle = {
            strokeStyle: MAX_MIN_COLOR,
            lineWidth: 1.5,
        }
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Min',
            startX: item.X2 - ctx.MeasureText('Min').width - 4,
            startY: item.Y1 + 4,
            fillStyle: MAX_MIN_COLOR,
            strokeStyle: '#000',
            textBaseline: 'top',
        })

        if (selectedMin) {
            ctx.FillCircle(item.X1, item.Y1, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X2, item.Y1, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X1, item.Y2, 4, MAX_MIN_COLOR)
            ctx.FillCircle(item.X2, item.Y2, 4, MAX_MIN_COLOR)
        }
    }

    // 获取初始区域坐标点
    const getRealAreaItemByRelative = (relativeItem: CanvasBaseArea) => {
        return {
            X1: getRealSizeByRelative(relativeItem.X1, 'x'),
            Y1: getRealSizeByRelative(relativeItem.Y1, 'y'),
            X2: getRealSizeByRelative(relativeItem.X2, 'x'),
            Y2: getRealSizeByRelative(relativeItem.Y2, 'y'),
        }
    }

    // 获取绘制区域坐标点
    const getRelativeAreaItemByReal = (realItem: CanvasBaseArea) => {
        return {
            X1: getRelativeSizeByReal(realItem.X1, 'x'),
            Y1: getRelativeSizeByReal(realItem.Y1, 'y'),
            X2: getRelativeSizeByReal(realItem.X2, 'x'),
            Y2: getRelativeSizeByReal(realItem.Y2, 'y'),
        }
    }

    /**
     * @description 获取OSD宽度和高度
     * @param options
     * @returns
     */
    const getOSDWH = ({ osdFormat }: CanvasPasslineOsdInfo) => {
        // 兼容字符串里有\n和直接回车的换行
        const splitStr = osdFormat && osdFormat.includes('\\n') ? '\\n' : '\n'
        const osdList = osdFormat ? osdFormat.split(splitStr) : []
        let longestStrLen = 0
        for (let i = 0; i < osdList.length; i++) {
            const item = osdList[i].trim()
            // 空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - lowerStrCount - spaceStrCount) * 9
            longestStrLen = Math.max(itemStrLength, longestStrLen)
        }
        return {
            osdWidth: longestStrLen,
            osdHeight: osdList.length * 17.5,
        }
    }

    let onMouseDown: (e: MouseEvent) => void = () => {}
    let onMouseMove: (e: MouseEvent) => void = () => {}

    /**
     * @description 绑定事件
     */
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)

        onMouseDown = (e: MouseEvent) => {
            if ((!enableLine && !enableOSD) || hoverOnMaxMinFlag || draggingMaxMin) {
                return
            }

            if (selectedMax || selectedMin) {
                selectedMax = false
                selectedMin = false
                drawConstantly()
            }

            const startX = e.offsetX
            const startY = e.offsetY
            const clientX = e.clientX
            const clientY = e.clientY
            const osdRectX = osdRect.x
            const osdRectY = osdRect.y
            const osdRectW = osdRect.width
            const osdRectH = osdRect.height

            let endX, endY
            // 先判断是否在osd矩形区域内
            let isInOSD = false

            if (enableOSD && ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                isInOSD = true
            }

            if (!isInOSD && !enableLine) {
                return
            }
            document.body.style.setProperty('user-select', 'none')

            const onMouseMove = (e1: MouseEvent) => {
                endX = e1.clientX - clientX + startX
                endY = e1.clientY - clientY + startY
                if (isInOSD) {
                    // osd跟随鼠标移动
                    const newStartX = clamp(osdRectX + endX - startX, 0, cavWidth - osdRectW)
                    const newStartY = clamp(osdRectY + endY - startY, 0, cavHeight - osdRectH)
                    const X = getRelativeSizeByReal(newStartX, 'x')
                    const Y = getRelativeSizeByReal(newStartY, 'y')
                    setOSD({
                        X,
                        Y,
                        osdFormat: osdInfo.osdFormat,
                    })
                    drawConstantly()
                } else {
                    // 绘制警戒线
                    endX = clamp(endX, 0, cavWidth)
                    endY = clamp(endY, 0, cavHeight)
                    const item = getRelativeItemByReal({ startX, startY, endX, endY })
                    setPassline(item)
                    drawConstantly()
                }
            }

            const onMouseUp = () => {
                onchange && onchange(passline, osdInfo)
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                document.body.style.setProperty('user-select', 'unset')
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        canvas.addEventListener('mousedown', onMouseDown)
    }

    type RelevantData = {
        realMaxArea: CanvasBaseArea
        realMinArea: CanvasBaseArea
        realMaxAreaWidth: number
        realMaxAreaHeight: number
        realMinAreaWidth: number
        realMinAreaHeight: number
        offsetX: number
        offsetY: number
        clientX: number
        clientY: number
        currentX: number
        currentY: number
        startX: number
        startY: number
    }

    // 绑定事件（鼠标拖动最大/最小目标框）
    const bindDragMaxMinEvent = () => {
        if (enableShowRange) {
            // 最大区域真实坐标和区域宽高/最小区域真实坐标和区域宽高
            const realMaxArea = getRealAreaItemByRelative(rangeMax)
            const realMinArea = getRealAreaItemByRelative(rangeMin)
            const realMaxAreaWidth = realMaxArea.X2 - realMaxArea.X1
            const realMaxAreaHeight = realMaxArea.Y2 - realMaxArea.Y1
            const realMinAreaWidth = realMinArea.X2 - realMinArea.X1
            const realMinAreaHeight = realMinArea.Y2 - realMinArea.Y1
            // 鼠标拖拽时的实时坐标点
            const offsetX = 0
            const offsetY = 0
            const clientX = 0
            const clientY = 0
            const currentX = 0
            const currentY = 0
            // 鼠标拖拽前的开始坐标点
            const startX = 0
            const startY = 0
            // 组装 - 拖拽所需的相关数据
            const relevantData: RelevantData = {
                realMaxArea: realMaxArea,
                realMinArea: realMinArea,
                realMaxAreaWidth: realMaxAreaWidth,
                realMaxAreaHeight: realMaxAreaHeight,
                realMinAreaWidth: realMinAreaWidth,
                realMinAreaHeight: realMinAreaHeight,
                offsetX: offsetX,
                offsetY: offsetY,
                clientX: clientX,
                clientY: clientY,
                currentX: currentX,
                currentY: currentY,
                startX: startX,
                startY: startY,
            }

            canvas.removeEventListener('mousemove', onMouseMove)

            onMouseMove = (e: MouseEvent) => {
                relevantData.offsetX = e.offsetX
                relevantData.offsetY = e.offsetY
                relevantData.clientX = e.clientX
                relevantData.clientY = e.clientY
                // 鼠标移到Min区域边框线上
                if (isHoverOnMaxMin(e, realMinArea) && !draggingMaxMin) {
                    hoverOnMaxMinFlag = true
                    handleDragMaxMin(relevantData, 'rangeMin')
                }
                // 鼠标移到Max区域边框线上
                else if (isHoverOnMaxMin(e, realMaxArea) && !draggingMaxMin) {
                    hoverOnMaxMinFlag = true
                    handleDragMaxMin(relevantData, 'rangeMax')
                }
                // 只要鼠标不在Max/Min区域边框线上就重新绑定区域绘制事件
                else {
                    if (hoverOnMaxMinFlag) {
                        hoverOnMaxMinFlag = false
                        bindEvent()
                    }
                }
            }

            // 只要显示最大/最小目标框就要保持canvas的mousemove事件绑定生效（边框线重叠时以最小区域优先选中：H5，插件，设备端三端保持一致）
            canvas.addEventListener('mousemove', onMouseMove)
        } else {
            clearBindingEvents()
            bindEvent()
        }
    }

    /**
     * 处理最大/最小目标框的拖拽移动
     * @property {Object} self 上下文this
     * @property {Object} relevantData 拖拽所需的相关数据（realMaxArea，realMinArea等）
     * @property {Object} rangeType 拖拽的目标框类型（最大rangeMax/最小rangeMin）
     */
    const handleDragMaxMin = (relevantData: RelevantData, rangeType: string) => {
        const realArea = rangeType === 'rangeMax' ? 'realMaxArea' : 'realMinArea'
        const realAreaWidth = rangeType === 'rangeMax' ? 'realMaxAreaWidth' : 'realMinAreaWidth'
        const realAreaHeight = rangeType === 'rangeMax' ? 'realMaxAreaHeight' : 'realMinAreaHeight'

        canvas.removeEventListener('mousedown', onMouseDown)

        onMouseDown = (e1: MouseEvent) => {
            document.body.style.setProperty('user-select', 'none')

            draggingMaxMin = true
            selectedMax = rangeType === 'rangeMax' ? true : false
            selectedMin = rangeType === 'rangeMin' ? true : false
            drawConstantly()
            relevantData.startX = e1.offsetX
            relevantData.startY = e1.offsetY

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                document.body.style.setProperty('user-select', 'unset')
                draggingMaxMin = false
                hoverOnMaxMinFlag = true
            }

            const onMouseMove = (e3: MouseEvent) => {
                draggingMaxMin = true
                // 最大目标框坐上和右下坐标跟随鼠标计算新值
                relevantData.currentX = e3.clientX - relevantData.clientX + relevantData.offsetX
                relevantData.currentY = e3.clientY - relevantData.clientY + relevantData.offsetY
                if (relevantData.currentX < 0) relevantData.currentX = 0
                if (relevantData.currentX > cavWidth) relevantData.currentX = cavWidth
                if (relevantData.currentY < 0) relevantData.currentY = 0
                if (relevantData.currentY > cavHeight) relevantData.currentY = cavHeight
                relevantData[realArea].X1 += relevantData.currentX - relevantData.startX
                relevantData[realArea].Y1 += relevantData.currentY - relevantData.startY
                relevantData[realArea].X2 = relevantData[realArea].X1 + relevantData[realAreaWidth]
                relevantData[realArea].Y2 = relevantData[realArea].Y1 + relevantData[realAreaHeight]
                // 边界处理
                if (relevantData[realArea].X1 < 0) {
                    relevantData[realArea].X1 = 0
                    relevantData[realArea].X2 = relevantData[realAreaWidth]
                }

                if (relevantData[realArea].X1 + relevantData[realAreaWidth] > cavWidth) {
                    relevantData[realArea].X1 = cavWidth - relevantData[realAreaWidth]
                    relevantData[realArea].X2 = cavWidth
                }

                if (relevantData[realArea].Y1 < 0) {
                    relevantData[realArea].Y1 = 0
                    relevantData[realArea].Y2 = relevantData[realAreaHeight]
                }

                if (relevantData[realArea].Y1 + relevantData[realAreaHeight] > cavHeight) {
                    relevantData[realArea].Y1 = cavHeight - relevantData[realAreaHeight]
                    relevantData[realArea].Y2 = cavHeight
                }

                if (rangeType === 'rangeMax') {
                    rangeMax = getRelativeAreaItemByReal(relevantData[realArea])
                } else {
                    rangeMin = getRelativeAreaItemByReal(relevantData[realArea])
                }

                // self[rangeType] = getRelativeAreaItemByReal(relevantData[realArea]);
                // 实时绘制
                drawConstantly()
                // 重置开始坐标点
                relevantData.startX = relevantData.currentX
                relevantData.startY = relevantData.currentY
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }

        canvas.addEventListener('mousedown', onMouseDown)
    }

    /**
     * 判断鼠标是否hover到最大/最小目标框的边框线上
     * @property {Object} event 鼠标事件对象
     * @property {Object} rangeAreaItem 最大/最小区域真实坐标对象（左上角-(X1, Y1) 和 右下角-(X2, Y2)）
     */
    const isHoverOnMaxMin = (event: MouseEvent, rangeAreaItem: CanvasBaseArea) => {
        const offsetX = Math.ceil(event.offsetX)
        const offsetY = Math.ceil(event.offsetY)
        const X1 = Math.ceil(rangeAreaItem.X1)
        const Y1 = Math.ceil(rangeAreaItem.Y1)
        const X2 = Math.ceil(rangeAreaItem.X2)
        const Y2 = Math.ceil(rangeAreaItem.Y2)
        const isHoverOn =
            (offsetX >= X1 - 2 && offsetX <= X1 + 2 && offsetY >= Y1 && offsetY <= Y2) ||
            (offsetX >= X2 - 2 && offsetX <= X2 + 2 && offsetY >= Y1 && offsetY <= Y2) ||
            (offsetY >= Y1 - 2 && offsetY <= Y1 + 2 && offsetX >= X1 && offsetX <= X2) ||
            (offsetY >= Y2 - 2 && offsetY <= Y2 + 2 && offsetX >= X1 && offsetX <= X2)
        return isHoverOn
    }

    // 解绑所有事件
    const clearBindingEvents = () => {
        document.removeEventListener('mousedown', onMouseDown)

        if (!enableShowRange) {
            canvas.removeEventListener('mousemove', onMouseMove)
        }
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

    const getRealItemByRelative = ({ startX, startY, endX, endY }: CanvasPasslinePassline) => {
        return {
            startX: getRealSizeByRelative(startX, 'x'),
            startY: getRealSizeByRelative(startY, 'y'),
            endX: getRealSizeByRelative(endX, 'x'),
            endY: getRealSizeByRelative(endY, 'y'),
        }
    }

    const getRelativeItemByReal = ({ startX, startY, endX, endY }: CanvasPasslinePassline) => {
        return {
            startX: getRelativeSizeByReal(startX, 'x'),
            startY: getRelativeSizeByReal(startY, 'y'),
            endX: getRelativeSizeByReal(endX, 'x'),
            endY: getRelativeSizeByReal(endY, 'y'),
        }
    }

    /**
     * @description 获取绘制数据
     * @returns
     */
    const getPassline = () => {
        return passline
    }

    /**
     * @description 清空区域
     */
    const clear = () => {
        passline = {
            ...DEFAULT_PASSLINE,
        }
        setPassline(passline)
    }

    bindEvent()

    return {
        setEnableShowAll,
        setPassline,
        setDirection,
        setCurrentSurfaceOrAlarmLine,
        setEnable,
        setOSD,
        destroy,
        getPassline,
        clear,
        drawAllPassline,
        toggleRange,
        setRangeMin,
        setRangeMax,
        ctx,
    }
}
