/*
 * @Date: 2025-04-28 11:32:34
 * @Description: 支持业务：双目计数画线
 * 四种模式：箭头、多边形、矩形、OSD
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type AlarmBinoCountBoundaryDto } from '@/types/apiType/aiAndEvent'
import type { CanvasBaseArea, CanvasBasePoint } from './canvasBase'
import { type CanvasPasslinePassline, type CanvasPasslineOsdInfo, type CanvasPasslineLineItem, type CanvasPasslineRect } from './canvasPassline'
import { type CanvasPolygonAreaType } from './canvasPolygon'

interface CanvasBinicularOption {
    el?: HTMLCanvasElement
    lineStyle?: CanvasBaseLineStyleOption // 画线样式
    textIn?: string // 入口文字，默认为'A'
    textOut?: string // 出口文字，默认为'B'
    enable?: boolean // 警戒线是否可绘制，默认true
    enableLine?: boolean // 警戒线是否可绘制，默认true
    enableOSD?: boolean // OSD是否可绘制，默认false
    enableShowAll?: boolean // 是否显示所有区域，默认false
    direction?: CanvasPasslineDirection // 警戒线方向
    passline?: CanvasPasslinePassline // 警戒线数据
    osdInfo?: CanvasPasslineOsdInfo
    enableShowRange?: boolean // 是否显示最大/最小区域，默认false
    max?: number // 最大打点数，默认6个点
    min?: number // 最小打点数，默认4个点
    onchange?: (area: CanvasBaseArea | CanvasBasePoint[] | CanvasPasslinePassline, osdInfo?: CanvasPolygonOSDInfo) => void
    closePath?: (pointList: CanvasBasePoint[]) => void
    forceClosePath?: (bool: boolean) => void
    clearCurrentArea?: (pointList: CanvasBasePoint[]) => void
    regulation?: boolean
}

export const CanvasBinocular = (option: CanvasBinicularOption = {}) => {
    const DEFAULT_LINE_COLOR = '#00ff00' // 画线默认色值
    const DEFAULT_TEXT_COLOR = '#ff0000' // 文字默认色值
    const RELATIVE_WIDTH = 10000 // 万分比宽度
    const RELATIVE_HEIGHT = 10000 // 万分比高度
    const VERTICAL_LINE_LENGTH = 50 // 带箭头的垂线长度
    // const TEXT_IN = 'A' // 入口文字
    // const TEXT_OUT = 'B' // 出口文字

    // 箭头方向配置
    const DIRECTION_MAP: Record<string, string> = {
        none: 'NONE', // 双向箭头
        rightortop: 'A_TO_B', // 单向箭头A->B
        leftorbotton: 'B_TO_A', // 单向箭头B->A
    }
    const DEFAULT_PASSLINE = { startX: 0, startY: 0, endX: 0, endY: 0 }
    const DEFAULT_OSD_INFO = { X: 0, Y: 0, osdFormat: '' }
    // 绘制多边形相关参数
    const MAX_COUNT = 6 // 最大打点数
    // const MIN_COUNT = 4 // 最小打点数
    const DEFAULT_POINT_COLOR = '#ff1111' // 打点的颜色
    const DEFAULT_AREA = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }

    let lineStyle = option.lineStyle || { strokeStyle: DEFAULT_LINE_COLOR, lineWidth: 1.5 }
    // const textIn = option.textIn || TEXT_IN
    // const textOut = option.textOut || TEXT_OUT
    let enable = typeof option.enable === 'boolean' ? option.enable : true
    let enableLine = typeof option.enableLine === 'boolean' ? option.enableLine : true
    let enableOSD = typeof option.enableOSD === 'boolean' ? option.enableOSD : false
    let enableShowAll = typeof option.enableShowAll === 'boolean' ? option.enableShowAll : false
    // const enableShowRange = typeof option.enableShowRange === 'boolean' ? option.enableShowRange : false
    let direction: CanvasPasslineDirection = option.direction || 'rightortop'

    let passline = {
        ...DEFAULT_PASSLINE,
        ...(option.passline || {}),
    }
    let osdInfo = {
        ...DEFAULT_OSD_INFO,
        ...(option.osdInfo || {}),
    }

    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    const onchange = option.onchange
    const closePath = option.closePath
    const forceClosePath = option.forceClosePath
    const clearCurrentArea = option.clearCurrentArea
    let regulation = option.regulation || false
    let enablePolygon = false
    let currAreaIndex = 0
    let pointList: CanvasBasePoint[] = []
    let detectAreaInfo: AlarmBinoCountBoundaryDto[][] = []
    let maskAreaInfo: CanvasBasePoint[][] = []
    let regionInfoList: CanvasBaseArea[] = []
    let area = {
        ...DEFAULT_AREA,
    }
    let currAreaType: CanvasPolygonAreaType = 'detectionArea'
    let isClosed = false
    let lineInfoList: CanvasPasslineLineItem[] = []
    let currentSurfaceOrAlarmLine = 0
    // let currDrawIndex = 0
    let osdRect: CanvasPasslineRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    const hoverOnMaxMinFlag = false

    const max = option.max || MAX_COUNT

    const init = (isFoucusClosePath = false) => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        if (enableLine) {
            // 画线
            const realItem = drawPassline(passline)
            drawDirection(realItem)
        }

        // 设置OSD
        if (enableOSD) {
            drawOSD()
        }

        if (regulation) {
            // 画矩形
            drawArea()
        }

        if (enablePolygon) {
            // 画多边形
            drawPolygon(isFoucusClosePath)
        }
    }

    // 设置警戒区域（矩形）
    const setArea = (newArea: CanvasBaseArea) => {
        area = newArea
        init()
    }

    // 绘制警戒区域（矩形）
    const drawArea = () => {
        const item = getRealAreaItemByRelative(area)
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
    }

    // 绘制所有矩形区域
    const drawAllRegion = (regionInfo: CanvasBaseArea[], currentRegionIndex: number) => {
        // var self = this;
        if (!(regionInfo && regionInfo.length)) return

        regionInfoList = regionInfo // 矩形区域 - 包含每个矩形区域的点坐标

        // var lineStyle = JSON.parse(JSON.stringify(this.lineStyle));
        // var area = JSON.parse(JSON.stringify(this.area));
        regionInfoList.forEach((regionInfo, regionIndex) => {
            if (currAreaType === 'regionArea' && regionIndex === currentRegionIndex) {
                lineStyle.lineWidth = 3
            } else {
                lineStyle.lineWidth = 1.5
            }
            lineStyle.strokeStyle = DEFAULT_LINE_COLOR
            area = regionInfo
            drawArea()
        })
        // self.lineStyle = lineStyle;
        // self.area = area;
        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
        }
    }

    // 设置多边形顶点数据
    const setPointList = (list: CanvasBasePoint[], isFoucusClosePath = false) => {
        pointList = list
        if (!pointList.length) {
            isClosed = false
        }
        init(isFoucusClosePath)
    }

    // 绘制多边形, isFoucusClosePath: 是否强制闭合
    const drawPolygon = (isFoucusClosePath = false) => {
        if (!pointList.length) return
        const startPoint = getRealItemByRelative(pointList[0]) as CanvasBasePoint
        for (let i = 0; i < pointList.length; i++) {
            const item = getRealItemByRelative(pointList[i]) as CanvasBasePoint
            ctx.Circle(item.X, item.Y, 4, lineStyle)
            ctx.FillCircle(item.X, item.Y, 3.5, DEFAULT_POINT_COLOR)
            if (i > 0) {
                const itemPre = getRealItemByRelative(pointList[i - 1]) as CanvasBasePoint
                ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
            }

            // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
            if (i === pointList.length - 1 && (i === max - 1 || isFoucusClosePath)) {
                const isIntersect = pointList.length >= 4 ? judgeIntersect(pointList.at(-1)!, true) : true
                if (!isIntersect) {
                    ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                    isClosed = true
                    closePath && closePath(pointList)
                } else {
                    isClosed = false
                }
            }
        }
    }

    /**
     * 绘制所有区域
     * @property {String} detectAreaInfo 侦测区域: {0: [{X: 111,Y: 124}, {X: 34,Y: 345}, ...], 1: [{X: 875, Y: 53, ...}], ...}
     * @property {Object} maskAreaInfo 屏蔽区域: {0: [{X: 111,Y: 124}, {X: 34,Y: 345}, ...], 1: [{X: 875, Y: 53, ...}], ...}
     * @property {Boolean} currAreaType 当前区域类型: 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"
     * @property {Object} currAreaIndex 当前区域索引下标: 0, 1, ...
     * @property {Boolean} isFoucusClosePath 是否强制闭合
     */
    const drawAllPolygon = (
        newDetectAreaInfo: AlarmBinoCountBoundaryDto[][],
        newMaskAreaInfo: CanvasBasePoint[][],
        currAreaType: CanvasPolygonAreaType,
        currAreaIndex: number,
        currDrawIndex: string,
        isFoucusClosePath: boolean = false,
    ) => {
        if (!newDetectAreaInfo.length && !newMaskAreaInfo.length) {
            return
        }

        detectAreaInfo = newDetectAreaInfo // 画点多边形 - 侦测区域
        maskAreaInfo = newMaskAreaInfo // 画点多边形 - 屏蔽区域

        detectAreaInfo.forEach((areaInfo, j) => {
            if (areaInfo) {
                // 每个区域下还分为A、B区域，所以得再循环一次才能拿到绘制点的坐标
                for (const key in areaInfo) {
                    // 当前区域已被清除，继续下一个循环
                    if (!(areaInfo[key] && areaInfo[key].length)) continue
                    const startPoint = getRealItemByRelative(areaInfo[key][0]) as CanvasBasePoint
                    for (let i = 0; i < areaInfo[key].length; i++) {
                        const point = areaInfo[key][i]
                        const item = getRealItemByRelative(point) as CanvasBasePoint
                        const lineStyle = {
                            strokeStyle: DEFAULT_LINE_COLOR,
                            lineWidth: 1.5,
                        }
                        if (currAreaType === 'detectionArea' && currAreaIndex === j && currDrawIndex === key) {
                            lineStyle.lineWidth = 3
                        }
                        ctx.Circle(item.X, item.Y, 4, lineStyle)
                        ctx.FillCircle(item.X, item.Y, 3.5, DEFAULT_POINT_COLOR)

                        if (i > 0) {
                            const itemPre = getRealItemByRelative(areaInfo[key][i - 1]) as CanvasBasePoint
                            ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                        }

                        // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                        if (i === areaInfo[key].length - 1 && (i === max - 1 || isFoucusClosePath) && point.isClosed) {
                            ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                        }
                    }
                }
            }
        })

        maskAreaInfo.forEach((areaInfo, j) => {
            if (areaInfo.length) {
                const startPoint = getRealItemByRelative(areaInfo[0]) as CanvasBasePoint
                for (let i = 0; i < areaInfo.length; i++) {
                    const point = areaInfo[i]
                    const item = getRealItemByRelative(point) as CanvasBasePoint
                    const lineStyle = {
                        strokeStyle: '#d9001b',
                        lineWidth: 1.5,
                    }
                    if (currAreaType === 'maskArea' && currAreaIndex === j) {
                        lineStyle.lineWidth = 3
                    }
                    ctx.Circle(item.X, item.Y, 4, lineStyle)
                    ctx.FillCircle(item.X, item.Y, 3.5, DEFAULT_POINT_COLOR)
                    if (i > 0) {
                        const itemPre = getRealItemByRelative(areaInfo[i - 1]) as CanvasBasePoint
                        ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                    }

                    // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                    if (i === areaInfo.length - 1 && (i === max - 1 || isFoucusClosePath) && point.isClosed) {
                        ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                    }
                }
            }
        })

        if (pointList.length >= 3 && pointList[0].isClosed) {
            isClosed = true
        } else {
            isClosed = false
        }

        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
        }
    }

    // 判断新绘制线段是否和已有线段相交
    const judgeIntersect = (newPoint: CanvasBasePoint, isFoucusClosePath = false) => {
        let flag = false
        const lastPoint = pointList.at(-1)!
        for (let i = 0; i < pointList.length; i++) {
            if (i < pointList.length - 1) {
                const item = pointList[i]
                const itemNext = pointList[i + 1]
                if (ctx.IsIntersect(item, itemNext, lastPoint, newPoint)) {
                    flag = true
                    break
                }
            }
        }
        // 如果是绘制最后一个点，还需要判断它和起点的连线是否与其他线段相交
        const startPoint = pointList[0]
        if (pointList.length === max - 1 || isFoucusClosePath) {
            for (let i = 0; i < pointList.length; i++) {
                if (i < pointList.length - 1) {
                    const item = pointList[i]
                    const itemNext = pointList[i + 1]
                    if (ctx.IsIntersect(item, itemNext, startPoint, newPoint)) {
                        flag = true
                        break
                    }
                }
            }
        }
        return flag
    }

    // 判断画点多边形区域是否可闭合（通过判断区域中的第一个点和最后一个点的连线是否与其他线相交）- true:可闭合; false:不可闭合
    const judgeAreaCanBeClosed = (pointList: CanvasBasePoint[]) => {
        let flag = true
        const startPoint = pointList.at(0)!
        const lastPoint = pointList.at(-1)!
        for (let i = 0; i < pointList.length; i++) {
            if (i < pointList.length - 1) {
                const item = pointList[i]
                const itemNext = pointList[i + 1]
                if (ctx.IsIntersect(item, itemNext, startPoint, lastPoint)) {
                    flag = false
                    break
                }
            }
        }
        return flag
    }

    // 强制闭合当前绘制点时，判断是否有线段相交
    const isCurrentIntersect = () => {
        return judgeIntersect(pointList.at(-1)!, true)
    }

    // 绘制警戒线
    const drawPassline = (linePoints: CanvasPasslinePassline) => {
        const item = getRealItemByRelative(linePoints) as CanvasPasslinePassline
        ctx.Line(item.startX, item.startY, item.endX, item.endY, lineStyle)
        return item
    }

    // 绘制所有区域警戒线
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
    }

    // 实时绘制全部区域（显示全部区域时，绘制当前区域的同时显示其余区域）
    const drawConstantly = (isClosed = false) => {
        init(isClosed)
        // 绘制所有的规则线
        if (enableLine) {
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
        } else {
            // 绘制所有的多边形/矩形区域
            if (enableShowAll) {
                if (regulation) {
                    regionInfoList[currAreaIndex] = area
                } else if (currAreaType === 'detectionArea') {
                    detectAreaInfo[currAreaIndex] = pointList
                } else if (currAreaType === 'maskArea') {
                    maskAreaInfo[currAreaIndex] = pointList
                } else if (currAreaType === 'regionArea') {
                    regionInfoList[currAreaIndex] = area
                }
                drawAllPolygon(detectAreaInfo, maskAreaInfo, currAreaType, currAreaIndex, true)
                drawAllRegion(regionInfoList, currAreaIndex)
            }
        }
    }

    // 设置画布是否禁用
    const setEnable = (bool: boolean) => {
        enable = bool
    }

    // 是否显示全部警戒面
    const setEnableShowAll = (bool: boolean) => {
        enableShowAll = bool
    }

    // 绘制方向
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

    // 画箭头和文字
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
                    // startX: direEndX,
                    // startY: direEndY,
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
                    // startX: finalStartX,
                    // startY: finalStartY,
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
                    // startX: direEndX,
                    // startY: direEndY,
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

    // 设置警戒区域
    const setPassline = (info: CanvasPasslinePassline) => {
        passline = info
        init()
    }

    // 设置方向
    const setDirection = (info: CanvasPasslineDirection) => {
        direction = info
    }

    // 设置当前警戒面索引
    const setCurrentSurfaceOrAlarmLine = (info: number) => {
        currentSurfaceOrAlarmLine = info
    }

    // 设置绘制图形样式
    const setDrawType = (type: string, enable: boolean) => {
        enableLine = false
        enableOSD = false
        regulation = false
        enablePolygon = false

        if (type === 'line') {
            enableLine = enable
        } else if (type === 'osd') {
            enableOSD = enable
        } else if (type === 'regulation') {
            regulation = enable
        } else {
            enablePolygon = enable
        }
        bindEvent()
    }

    // 设置osdInfo: { osdFormat: '111\n222', X: 100, Y: 100 }
    const setOSD = (info: CanvasPasslineOsdInfo) => {
        osdInfo = info
        init()
        drawConstantly()
    }

    // 绘制OSD
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
            // 空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - lowerStrCount - spaceStrCount) * 9
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

    // 获取OSD宽度和高度
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

    // 获取初始区域坐标点
    const getRealAreaItemByRelative = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRealSizeByRelative(X1, 'x'),
            Y1: getRealSizeByRelative(Y1, 'y'),
            X2: getRealSizeByRelative(X2, 'x'),
            Y2: getRealSizeByRelative(Y2, 'y'),
        }
    }

    // 获取绘制区域坐标点
    const getRelativeAreaItemByReal = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRelativeSizeByReal(X1, 'x'),
            Y1: getRelativeSizeByReal(Y1, 'y'),
            X2: getRelativeSizeByReal(X2, 'x'),
            Y2: getRelativeSizeByReal(Y2, 'y'),
        }
    }

    let selectedMax = false
    let selectedMin = false

    const onMouseDown = (e: MouseEvent) => {
        if (enableLine) {
            if (!enable || !enableLine || hoverOnMaxMinFlag) {
                return
            }
            const startX = e.offsetX
            const startY = e.offsetY
            const clientX = e.clientX
            const clientY = e.clientY
            let endX = 0
            let endY = 0
            if (!enableLine) {
                return
            }
            document.body.style.setProperty('user-select', 'none')
            const onMouseMove = (e1: MouseEvent) => {
                endX = e1.clientX - clientX + startX
                endY = e1.clientY - clientY + startY
                if (endX < 0) endX = 0
                if (endX > cavWidth) endX = cavWidth
                if (endY < 0) endY = 0
                if (endY > cavHeight) endY = cavHeight
                const item = getRelativeItemByReal({ startX: startX, startY: startY, endX: endX, endY: endY }) as CanvasPasslinePassline
                setPassline(item)
                drawConstantly()
            }

            const onMouseUp = () => {
                onchange && onchange(passline, osdInfo)
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                document.body.style.setProperty('user-select', 'unset')
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        } else if (enableOSD) {
            if (!enableOSD || hoverOnMaxMinFlag) {
                return
            }
            const startX = e.offsetX
            const startY = e.offsetY
            const clientX = e.clientX
            const clientY = e.clientY
            let endX = 0
            let endY = 0
            // 先判断鼠标是否在osd矩形区域内
            let isInOSD = false
            const osdRectX = osdRect.x
            const osdRectY = osdRect.y
            const osdRectW = osdRect.width
            const osdRectH = osdRect.height

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
                    let newStartX = osdRectX + endX - startX
                    let newStartY = osdRectY + endY - startY
                    if (newStartX <= 0) newStartX = 0
                    if (newStartX + osdRectW >= cavWidth) newStartX = cavWidth - osdRectW
                    if (newStartY <= 0) newStartY = 0
                    if (newStartY + osdRectH >= cavHeight) newStartY = cavHeight - osdRectH
                    const X = getRelativeSizeByReal(newStartX, 'x')
                    const Y = getRelativeSizeByReal(newStartY, 'y')
                    setOSD({
                        X: X,
                        Y: Y,
                        osdFormat: osdInfo.osdFormat,
                    })
                    drawConstantly()
                }
            }

            const onMouseUp = () => {
                const area: CanvasBaseArea | CanvasBasePoint[] | CanvasPasslinePassline = []
                onchange && onchange(area, osdInfo)
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                document.body.style.setProperty('user-select', 'unset')
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        } else {
            if (regulation) {
                // const onMouseDown  = () => {
                // }
                // $(this.canvas).off('mousedown.binocularMousedown').on('mousedown.binocularMousedown', function (e) {
                if (!enable || !regulation || hoverOnMaxMinFlag) {
                    return
                }

                if (selectedMax || selectedMin) {
                    selectedMax = false
                    selectedMin = false
                    drawConstantly(isClosed)
                }

                const startX = e.offsetX
                const startY = e.offsetY
                const clientX = e.clientX
                const clientY = e.clientY
                let endX
                let endY
                let finalX
                let finalY

                document.body.style.setProperty('user-select', 'none')

                const onMouseMove = (e1: MouseEvent) => {
                    endX = e1.clientX - clientX + startX
                    endY = e1.clientY - clientY + startY
                    if (endX < 0) endX = 0
                    if (endX > cavWidth) endX = cavWidth
                    if (endY < 0) endY = 0
                    if (endY > cavHeight) endY = cavHeight
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
                        getRelativeAreaItemByReal({
                            X1: finalX,
                            Y1: finalY,
                            X2: endX,
                            Y2: endY,
                        }),
                    )
                    drawConstantly(isClosed)
                }

                const onMouseUp = () => {
                    onchange && onchange(area)
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            } else {
                if (!enablePolygon || hoverOnMaxMinFlag) {
                    return
                }

                if (selectedMax || selectedMin) {
                    selectedMax = false
                    selectedMin = false
                    drawConstantly(isClosed)
                }

                document.body.style.setProperty('user-select', 'none')

                const startX = e.offsetX
                const startY = e.offsetY
                // 先判断鼠标是否在osd矩形区域内
                const osdRectX = osdRect.x
                const osdRectY = osdRect.y
                const osdRectW = osdRect.width
                const osdRectH = osdRect.height

                const onMouseMove = () => {
                    onchange && onchange(pointList)
                }

                const onMouseUp = (e1: MouseEvent) => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')

                    // 绘制区域闭合之后再次点击绘制弹框提示：已绘制，是否需要清除绘制？
                    if (isClosed && !ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                        clearCurrentArea && clearCurrentArea(pointList)
                        return
                    }

                    // 如果绘制的点在OSD内或者当前不可编辑则不可绘制
                    if (!enable || pointList.length >= max || isClosed || e1.target !== canvas) {
                        return
                    }

                    // 当前绘制点
                    const newPoint = getRelativeItemByReal({
                        X: e1.offsetX,
                        Y: e1.offsetY,
                    }) as CanvasBasePoint
                    // 禁止一个点位于相同的坐标
                    let repeatFlag = false
                    pointList.forEach((pointItem) => {
                        if (pointItem.X === newPoint.X && pointItem.Y === newPoint.Y) repeatFlag = true
                    })
                    if (repeatFlag) return
                    // 绘制最后一个点时首先判断区域是否可闭合
                    if (pointList.length === max - 1 && judgeIntersect(newPoint)) {
                        forceClosePath && forceClosePath(false) // 区域不可闭合
                        return
                    }

                    // 绘制过程中如果区域不可闭合（有相交的直线）则不可绘制
                    if (pointList.length >= 3 && judgeIntersect(newPoint)) {
                        forceClosePath && forceClosePath(false) // 区域不可闭合
                        return
                    }

                    // 绘制当前点
                    pointList.push(newPoint)
                    drawConstantly(isClosed)
                    onchange && onchange(pointList)
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        }
    }

    // 双击主动闭合区域
    const onDoubleClick = () => {
        const isIntersect = pointList.length >= 4 ? judgeIntersect(pointList.at(-1)!, true) : true
        if (pointList.length >= 4 && !isIntersect && !isClosed) {
            init(true)
            forceClosePath && forceClosePath(true) // 区域可闭合
            onchange && onchange(pointList)
        } else {
            if (isIntersect && pointList.length >= 4) {
                forceClosePath && forceClosePath(false) // 区域不可闭合
            }
        }
    }

    // 绑定事件（鼠标绘制）
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousedown', onMouseDown)

        // 双击主动闭合区域
        if (typeof forceClosePath === 'function') {
            canvas.removeEventListener('dblclick', onDoubleClick)
            canvas.addEventListener('dblclick', onDoubleClick)
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

    // 设置绘画规则（画矩形）
    const setRegulation = (newRegulation: boolean) => {
        regulation = newRegulation
    }

    // 设置画线样式
    const setLineStyle = (strokeStyle: string, lineWidth: number) => {
        lineStyle = {
            strokeStyle: strokeStyle ? strokeStyle : DEFAULT_LINE_COLOR,
            lineWidth: lineWidth ? lineWidth : 1.5,
        }
    }

    // 设置当前区域 索引/类型
    const setCurrAreaIndex = (index: number, _drawArea: string, type: CanvasPolygonAreaType) => {
        currAreaIndex = index // 当前警戒区域索引
        currAreaType = type // 当前区域类型 - 侦测/屏蔽/矩形
        clearRect() // 清空画布
    }

    // 清空画布
    const clearRect = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
    }

    const getRealItemByRelative = (relativeItem: CanvasBasePoint | CanvasPasslinePassline) => {
        if (enableLine) {
            const item = relativeItem as CanvasPasslinePassline
            return {
                startX: getRealSizeByRelative(item.startX, 'x'),
                startY: getRealSizeByRelative(item.startY, 'y'),
                endX: getRealSizeByRelative(item.endX, 'x'),
                endY: getRealSizeByRelative(item.endY, 'y'),
            } as CanvasPasslinePassline
        } else {
            const item = relativeItem as CanvasBasePoint
            return {
                X: getRealSizeByRelative(item.X, 'x'),
                Y: getRealSizeByRelative(item.Y, 'y'),
            } as CanvasBasePoint
        }
    }

    const getRelativeItemByReal = (realItem: CanvasBasePoint | CanvasPasslinePassline) => {
        if (enableLine) {
            const item = realItem as CanvasPasslinePassline
            return {
                startX: getRelativeSizeByReal(item.startX, 'x'),
                startY: getRelativeSizeByReal(item.startY, 'y'),
                endX: getRelativeSizeByReal(item.endX, 'x'),
                endY: getRelativeSizeByReal(item.endY, 'y'),
            } as CanvasPasslinePassline
        } else {
            const item = realItem as CanvasBasePoint
            return {
                X: getRelativeSizeByReal(item.X, 'x'),
                Y: getRelativeSizeByReal(item.Y, 'y'),
            } as CanvasBasePoint
        }
    }

    // 获取多边形绘制数据
    const getArea = () => {
        if (regulation) {
            return area
        } else {
            return pointList
        }
    }

    // 获取画线绘制数据
    const getPassline = () => {
        return passline
    }

    // 清空区域
    const clear = () => {
        if (enableLine) {
            passline = {
                ...DEFAULT_PASSLINE,
            }
            setPassline(passline)
        } else if (regulation) {
            area = {
                ...DEFAULT_AREA,
            }
            setArea(area)
        } else {
            pointList = []
            setPointList(pointList)
        }
    }

    bindEvent()

    const destroy = () => {
        clear()
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('dblclick', onDoubleClick)
    }

    return {
        init,
        destroy,
        getPassline,
        getArea,
        setCurrAreaIndex,
        setLineStyle,
        setRegulation,
        judgeAreaCanBeClosed,
        setOSD,
        setDrawType,
        setEnable,
        setArea,
        drawArea,
        drawAllPassline,
        setEnableShowAll,
        isCurrentIntersect,
        setDirection,
        setPassline,
        setCurrentSurfaceOrAlarmLine,
        setPointList,
        drawAllPolygon,
        clear,
    }
}
