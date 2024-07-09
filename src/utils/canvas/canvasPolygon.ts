/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:14:06
 * @Description: 打点绘制闭合多边形, 绘制矩形；支持业务：区域入侵、车牌侦测，视频结构化，物品遗留与看护
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 19:04:47
 */

import CanvasBase, { type CanvasBaseLineStyleOption, type CanvasBasePoint } from './canvasBase'

interface CanvasPolygonArea {
    X1: number
    Y1: number
    X2: number
    Y2: number
}

interface CanvasPolygonRect {
    x: number
    y: number
    width: number
    height: number
}

interface CanvasPolygonOSDInfo {
    X: number
    Y: number
    osdFormat: string
}

type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"

/**
 * 打点绘制闭合多边形
 * @param {Object} option
 *      @property {String} el 画布选择器
 *      @property {Object} lineStyle 画线样式 { strokeStyle, lineWidth }
 *      @property {Boolean} enable 是否可绘制，默认true
 *      @property {Boolean} enableOSD OSD是否可绘制，默认false
 *      @property {Boolean} enableShowAll 是否显示所有区域，默认false
 *      @property {Boolean} enableShowRange 是否显示最大/最小区域，默认false
 *      @property {Object} osdInfo osd数据 { X, Y, osdFormat }
 *      @property {Object} max 最大打点数，默认6个点
 *      @property {Object} min 最小打点数，默认4个点
 *      @property {Function} onchange 绘制改变的回调
 *      @property {Function} closePath 闭合路径的回调
 *      @property {Function} forceClosePath 强制闭合路径的回调
 *      @property {Function} clearCurrentArea 清除当前区域的回调
 *      @property {Object} pointList 侦测/屏蔽区域数据 [{ X, Y }, { X, Y }, ...]
 *      @property {Object} detectAreaInfo 侦测区域集合 {0: [{ X, Y }, { X, Y }, ...], ...}
 *      @property {Object} maskAreaInfo 屏蔽区域集合 {0: [{ X, Y }, { X, Y }, ...], ...}
 *      @property {Object} area 警戒区域数据(矩形) { X1, Y1, X2, Y2 }
 *      @property {Object} regionInfoList 警戒区域数据集合(矩形) [{ X1, Y1, X2, Y2 }, ...]
 */
interface CanvasPolygonOption {
    el: HTMLCanvasElement
    lineStyle?: CanvasBaseLineStyleOption
    enable?: boolean
    enableOSD?: boolean
    enableShowAll?: boolean
    enableShowRange?: boolean
    osdInfo?: CanvasPolygonOSDInfo
    max?: number
    min?: number
    area?: CanvasPolygonArea
    regulation?: boolean // 增加画矩形逻辑 regulation为true则为画矩形，false为画多边形
    imgSrc?: string // 待绘制的抓拍图路径
    onchange?: (area: CanvasPolygonArea | CanvasBasePoint[], osdInfo?: CanvasPolygonOSDInfo) => void
    closePath?: (pointList: CanvasBasePoint[]) => void
    forceClosePath?: (bool: boolean) => void
    clearCurrentArea?: (pointList: CanvasBasePoint[]) => void
}

export default class CanvasPolygon {
    private readonly DEFAULT_LINE_COLOR = '#00ff00'
    private readonly DEFAULT_POINT_COLOR = '#ff1111' // 打点的颜色
    private readonly DEFAULT_TEXT_COLOR = '#ff0000' // 文字默认色值
    private readonly MAX_COUNT = 6 // 最大打点数
    // private readonly MIN_COUNT = 4 // 最小打点数
    private readonly DEFAULT_OSD_INFO = { X: 0, Y: 0, osdFormat: '' } // 默认osd信息
    private readonly RELATIVE_WIDTH = 10000 // 万分比宽度
    private readonly RELATIVE_HEIGHT = 10000 // 万分比高度
    private readonly DEFAULT_AREA: CanvasPolygonArea = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private readonly cavWidth: number
    private readonly cavHeight: number
    private isClosed = false
    private lineStyle: CanvasBaseLineStyleOption
    private enable: boolean
    private enableOSD: boolean
    private enableShowAll: boolean
    private enableShowRange: boolean
    private osdInfo: CanvasPolygonOSDInfo
    private osdRect: CanvasPolygonRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    private max: number
    // private min: number
    private imgSrc: string
    private pointList: CanvasBasePoint[] = []
    private detectAreaInfo: Record<number, CanvasBasePoint[]> = {}
    private maskAreaInfo: Record<number, CanvasBasePoint[]> = {}
    // private allDetectRegionList: CanvasBasePoint[][] = []
    // private allMaskRegionList: CanvasBasePoint[][] = []
    private area: CanvasPolygonArea
    private regionInfoList: CanvasPolygonArea[] = []
    private regulation: boolean
    private rangeMax: CanvasPolygonArea = {
        ...this.DEFAULT_AREA,
    }
    private rangeMin: CanvasPolygonArea = {
        ...this.DEFAULT_AREA,
    }
    private currAreaType: CanvasPolygonAreaType = 'detectionArea'
    private currAreaIndex = 0
    private readonly onchange: CanvasPolygonOption['onchange']
    private readonly closePath: CanvasPolygonOption['closePath']
    private readonly forceClosePath: CanvasPolygonOption['forceClosePath']
    private readonly clearCurrentArea: CanvasPolygonOption['clearCurrentArea']
    private onMouseDown?: (e: MouseEvent) => void
    private onDoubleClick?: () => void

    constructor(option: CanvasPolygonOption) {
        this.lineStyle = {
            strokeStyle: this.DEFAULT_LINE_COLOR,
            lineWidth: 1.5,
            ...(option.lineStyle || {}),
        }
        this.enable = option.enable || true
        this.enableOSD = option.enableOSD || false
        this.enableShowAll = option.enableShowAll || false
        this.enableShowRange = option.enableShowRange || false
        this.osdInfo = {
            ...this.DEFAULT_OSD_INFO,
            ...(option.osdInfo || {}),
        }
        this.max = option.max || this.MAX_COUNT
        // this.min = option.min || this.MIN_COUNT
        this.onchange = option.onchange
        this.closePath = option.closePath
        this.forceClosePath = option.forceClosePath
        this.clearCurrentArea = option.clearCurrentArea
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.cavWidth = this.canvas.width // 画布宽
        this.cavHeight = this.canvas.height // 画布高
        this.regulation = option.regulation ? option.regulation : false
        this.imgSrc = option.imgSrc || '' // 待绘制的抓拍图路径
        this.area = {
            ...this.DEFAULT_AREA,
            ...(option.area || {}),
        }
        this.bindEvent()
    }

    // 根据数据绘制区域
    init(isFoucusClosePath = false) {
        this.clearRect()
        if (this.regulation) {
            // 画矩形
            this.drawArea()
        } else {
            // 画多边形
            this.drawPolygon(isFoucusClosePath)
        }
        // 绘制OSD信息
        if (this.enableOSD) {
            this.drawOSD()
        }
        // 绘制最大，最小范围框
        if (this.enableShowRange) {
            this.drawRangeMax()
            this.drawRangeMin()
        }
    }

    // 设置警戒区域（矩形）
    setArea(area: CanvasPolygonArea) {
        this.area = area
        this.init()
    }

    // 绘制警戒区域（矩形）
    drawArea() {
        const item = this.getRealAreaItemByRelative(this.area)
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, this.lineStyle)
    }

    // 绘制所有矩形区域
    drawAllRegion(regionInfoList: CanvasPolygonArea[], currentRegionIndex: number) {
        // const self = this;
        if (!(regionInfoList && regionInfoList.length)) return
        this.regionInfoList = regionInfoList // 矩形区域 - 包含每个矩形区域的点坐标
        const lineStyle = {
            ...this.lineStyle,
        }
        const area = {
            ...this.area,
        }
        regionInfoList.forEach((regionInfo, regionIndex) => {
            if (this.currAreaType === 'regionArea' && regionIndex == currentRegionIndex) {
                this.lineStyle.lineWidth = 3
            } else {
                this.lineStyle.lineWidth = 1.5
            }
            this.lineStyle.strokeStyle = this.DEFAULT_LINE_COLOR
            this.area = regionInfo
            this.drawArea()
        })
        this.lineStyle = lineStyle
        this.area = area
        // 绘制OSD信息
        if (this.enableOSD) {
            this.drawOSD()
        }
        // 绘制最大，最小范围框
        if (this.enableShowRange) {
            this.drawRangeMax()
            this.drawRangeMin()
        }
    }

    // 设置最值区域是否可见
    toggleRange(visible: boolean) {
        this.enableShowRange = visible
        this.init(this.isClosed)
        this.drawConstantly()
    }

    // 设置最大值
    setRangeMax(rangeMax: CanvasPolygonArea) {
        this.rangeMax = rangeMax
        this.init(this.isClosed)
        this.drawConstantly()
    }

    // 设置最小值
    setRangeMin(rangeMin: CanvasPolygonArea) {
        this.rangeMin = rangeMin
        this.init(this.isClosed)
        this.drawConstantly()
    }

    // 绘制最大值区域
    drawRangeMax() {
        const item = this.getRealAreaItemByRelative(this.rangeMax)
        const lineStyle = { strokeStyle: this.DEFAULT_LINE_COLOR, lineWidth: 1.5 }
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        this.ctx.Text({
            text: 'Max',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: '#ffff00',
            strokeStyle: '#000',
            textBaseline: 'bottom',
        })
    }

    // 绘制最小值区域
    drawRangeMin() {
        const item = this.getRealAreaItemByRelative(this.rangeMin)
        const rangeMaxY1 = this.getRealSizeByRelative(this.rangeMax.Y1, 'y')
        const lineStyle = { strokeStyle: this.DEFAULT_LINE_COLOR, lineWidth: 1.5 }
        this.ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        this.ctx.Text({
            text: 'Min',
            startX: item.X1,
            startY: item.Y1,
            fillStyle: '#ffff00',
            strokeStyle: '#000',
            textBaseline: Math.abs(rangeMaxY1 - item.Y1) < 14 ? 'top' : 'bottom',
        })
    }

    // 获取初始区域坐标点
    getRealAreaItemByRelative({ X1, Y1, X2, Y2 }: CanvasPolygonArea) {
        return {
            X1: this.getRealSizeByRelative(X1, 'x'),
            Y1: this.getRealSizeByRelative(Y1, 'y'),
            X2: this.getRealSizeByRelative(X2, 'x'),
            Y2: this.getRealSizeByRelative(Y2, 'y'),
        }
    }

    // 获取绘制区域坐标点
    getRelativeAreaItemByReal({ X1, Y1, X2, Y2 }: CanvasPolygonArea) {
        return {
            X1: this.getRelativeSizeByReal(X1, 'x'),
            Y1: this.getRelativeSizeByReal(Y1, 'y'),
            X2: this.getRelativeSizeByReal(X2, 'x'),
            Y2: this.getRelativeSizeByReal(Y2, 'y'),
        }
    }

    // 设置多边形顶点数据
    setPointList(pointList: CanvasBasePoint[], isFoucusClosePath = false) {
        this.pointList = pointList
        if (!(this.pointList && this.pointList.length)) {
            this.isClosed = false
        }
        this.init(isFoucusClosePath)
    }

    // 绘制多边形, isFoucusClosePath: 是否强制闭合
    drawPolygon(isFoucusClosePath = false) {
        if (!(this.pointList && this.pointList.length)) return
        const startPoint = this.getRealItemByRelative(this.pointList[0])
        for (let i = 0; i < this.pointList.length; i++) {
            const item = this.getRealItemByRelative(this.pointList[i])
            this.ctx.Circle(item.X, item.Y, 4, this.lineStyle)
            this.ctx.FillCircle(item.X, item.Y, 3.5, this.DEFAULT_POINT_COLOR)
            if (i > 0) {
                const itemPre = this.getRealItemByRelative(this.pointList[i - 1])
                this.ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, this.lineStyle)
            }
            // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
            if (i === this.pointList.length - 1 && (i === this.max - 1 || isFoucusClosePath)) {
                const isIntersect = this.pointList.length >= 3 ? this.judgeIntersect(this.pointList[this.pointList.length - 1], true) : true
                if (!isIntersect) {
                    this.ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, this.lineStyle)
                    this.isClosed = true
                    this.closePath && this.closePath(this.pointList)
                } else {
                    this.isClosed = false
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
    drawAllPolygon(
        detectAreaInfo: Record<number, CanvasBasePoint[]>,
        maskAreaInfo: Record<number, CanvasBasePoint[]>,
        currAreaType: CanvasPolygonAreaType,
        currAreaIndex: number,
        isFoucusClosePath: boolean = false,
    ) {
        const allRegionList = []
        for (const key in detectAreaInfo) {
            allRegionList.push(detectAreaInfo[key])
        }
        for (const key in maskAreaInfo) {
            allRegionList.push(maskAreaInfo[key])
        }
        if (!(allRegionList && allRegionList.length)) return
        this.detectAreaInfo = detectAreaInfo // 画点多边形 - 侦测区域
        this.maskAreaInfo = maskAreaInfo // 画点多边形 - 屏蔽区域
        // 两种颜色的线框
        if (detectAreaInfo) {
            const allDetectRegionList = []
            for (const key in detectAreaInfo) {
                allDetectRegionList.push(detectAreaInfo[key])
            }
            // this.allDetectRegionList = allDetectRegionList
            for (let j = 0; j < allDetectRegionList.length; j++) {
                if (allDetectRegionList[j].length > 0) {
                    const startPoint = this.getRealItemByRelative(allDetectRegionList[j][0])
                    for (let i = 0; i < allDetectRegionList[j].length; i++) {
                        const item = this.getRealItemByRelative(allDetectRegionList[j][i])
                        const lineStyle = { strokeStyle: this.DEFAULT_LINE_COLOR, lineWidth: 1.5 }
                        if (currAreaType == 'detectionArea' && currAreaIndex == j) {
                            lineStyle.lineWidth = 3
                        }
                        this.ctx.Circle(item.X, item.Y, 4, lineStyle)
                        this.ctx.FillCircle(item.X, item.Y, 3.5, this.DEFAULT_POINT_COLOR)
                        if (i > 0) {
                            const itemPre = this.getRealItemByRelative(allDetectRegionList[j][i - 1])
                            this.ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                        }
                        // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                        if (i === allDetectRegionList[j].length - 1 && (i === this.max - 1 || isFoucusClosePath) && allDetectRegionList[j][i].isClosed) {
                            this.ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                        }
                    }
                }
            }
        }
        if (maskAreaInfo) {
            const allMaskRegionList = []
            for (const key in maskAreaInfo) {
                allMaskRegionList.push(maskAreaInfo[key])
            }
            // this.allMaskRegionList = allMaskRegionList
            for (let j = 0; j < allMaskRegionList.length; j++) {
                if (allMaskRegionList[j].length > 0) {
                    const startPoint = this.getRealItemByRelative(allMaskRegionList[j][0])
                    for (let i = 0; i < allMaskRegionList[j].length; i++) {
                        const item = this.getRealItemByRelative(allMaskRegionList[j][i])
                        const lineStyle = { strokeStyle: '#d9001b', lineWidth: 1.5 }
                        if (currAreaType == 'maskArea' && currAreaIndex == j) {
                            lineStyle.lineWidth = 3
                        }
                        this.ctx.Circle(item.X, item.Y, 4, lineStyle)
                        this.ctx.FillCircle(item.X, item.Y, 3.5, this.DEFAULT_POINT_COLOR)
                        if (i > 0) {
                            const itemPre = this.getRealItemByRelative(allMaskRegionList[j][i - 1])
                            this.ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                        }
                        // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                        if (i === allMaskRegionList[j].length - 1 && (i === this.max - 1 || isFoucusClosePath) && allMaskRegionList[j][i].isClosed) {
                            this.ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                        }
                    }
                }
            }
        }
        if (this.pointList && this.pointList.length >= 3 && this.pointList[0].isClosed) {
            this.isClosed = true
        } else {
            this.isClosed = false
        }
        // 绘制OSD信息
        if (this.enableOSD) {
            this.drawOSD()
        }
        // 绘制最大，最小范围框
        if (this.enableShowRange) {
            this.drawRangeMax()
            this.drawRangeMin()
        }
    }

    // 判断新绘制线段是否和已有线段相交
    judgeIntersect(newPoint: CanvasBasePoint, isFoucusClosePath = false) {
        let flag = false
        const lastPoint = this.pointList[this.pointList.length - 1]
        for (let i = 0; i < this.pointList.length; i++) {
            if (i < this.pointList.length - 1) {
                const item = this.pointList[i]
                const itemNext = this.pointList[i + 1]
                if (this.ctx.IsIntersect(item, itemNext, lastPoint, newPoint)) {
                    flag = true
                    break
                }
            }
        }
        // 如果是绘制最后一个点，还需要判断它和起点的连线是否与其他线段相交
        const startPoint = this.pointList[0]
        if (this.pointList.length === this.max - 1 || isFoucusClosePath) {
            for (let i = 0; i < this.pointList.length; i++) {
                if (i < this.pointList.length - 1) {
                    const item = this.pointList[i]
                    const itemNext = this.pointList[i + 1]
                    if (this.ctx.IsIntersect(item, itemNext, startPoint, newPoint)) {
                        flag = true
                        break
                    }
                }
            }
        }
        return flag
    }

    // 判断画点多边形区域是否可闭合（通过判断区域中的第一个点和最后一个点的连线是否与其他线相交）- true:可闭合; false:不可闭合
    judgeAreaCanBeClosed(pointList: CanvasBasePoint[]) {
        let flag = true
        const startPoint = pointList[0]
        const lastPoint = pointList[pointList.length - 1]
        for (let i = 0; i < pointList.length; i++) {
            if (i < pointList.length - 1) {
                const item = pointList[i]
                const itemNext = pointList[i + 1]
                if (this.ctx.IsIntersect(item, itemNext, startPoint, lastPoint)) {
                    flag = false
                    break
                }
            }
        }
        return flag
    }

    // 强制闭合当前绘制点时，判断是否有线段相交
    isCurrentIntersect() {
        return this.judgeIntersect(this.pointList[this.pointList.length - 1], true)
    }

    getRealItemByRelative({ X, Y }: CanvasBasePoint) {
        return {
            X: this.getRealSizeByRelative(X, 'x'),
            Y: this.getRealSizeByRelative(Y, 'y'),
        }
    }

    getRelativeItemByReal({ X, Y }: CanvasBasePoint) {
        return {
            X: this.getRelativeSizeByReal(X, 'x'),
            Y: this.getRelativeSizeByReal(Y, 'y'),
        }
    }

    // 实时绘制全部区域（显示全部区域时，绘制当前区域的同时显示其余区域）
    drawConstantly() {
        if (this.enableShowAll) {
            if (this.regulation) {
                this.regionInfoList[this.currAreaIndex] = this.area
            } else if (this.currAreaType == 'detectionArea') {
                this.detectAreaInfo[this.currAreaIndex] = this.pointList
            } else if (this.currAreaType == 'maskArea') {
                this.maskAreaInfo[this.currAreaIndex] = this.pointList
            } else if (this.currAreaType == 'regionArea') {
                this.regionInfoList[this.currAreaIndex] = this.area
            }
            this.drawAllPolygon(this.detectAreaInfo, this.maskAreaInfo, this.currAreaType, this.currAreaIndex, true)
            this.drawAllRegion(this.regionInfoList, this.currAreaIndex)
        }
    }

    // 绘制抓拍原图目标框
    drawSnapImgRule() {
        this.ctx.DrawImage(this.imgSrc, 0, 0, this.cavWidth, this.cavHeight, () => {
            // 绘制图片完成的回调（其它任务）
            this.drawArea()
        })
    }

    // 设置画布是否禁用
    setEnable(enable: boolean) {
        this.enable = enable
    }

    // 设置OSD是否禁用
    setOSDEnable(enable: boolean) {
        this.enableOSD = enable
    }

    // 设置osdInfo: { osdFormat: '111\n222', X: 100, Y: 100 }
    setOSD(osdInfo: CanvasPolygonOSDInfo) {
        this.osdInfo = osdInfo
        this.init(this.isClosed) // 绘制osd时会重新绘制多边形，此时需判断多边形是否闭合
        this.drawConstantly()
    }

    // 绘制OSD
    drawOSD() {
        if (!this.osdInfo) return
        const X = this.getRealSizeByRelative(this.osdInfo.X, 'x')
        const Y = this.getRealSizeByRelative(this.osdInfo.Y, 'y')

        const // 兼容字符串里有\n和直接回车的换行
            splitStr = this.osdInfo.osdFormat && this.osdInfo.osdFormat.includes('\\n') ? '\\n' : '\n'

        const osdList = this.osdInfo.osdFormat ? this.osdInfo.osdFormat.split(splitStr) : []
        let longestStrLen = 0
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

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                if (this.regulation) {
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
                            this.getRelativeAreaItemByReal({
                                X1: finalX,
                                Y1: finalY,
                                X2: endX,
                                Y2: endY,
                            }),
                        )
                        this.drawConstantly()
                    }

                    const onMouseUp = () => {
                        this.onchange && this.onchange(this.area)
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)
                        document.body.style.setProperty('user-select', 'unset')
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                } else {
                    if (!this.enable) {
                        return
                    }

                    document.body.style.setProperty('user-select', 'none')
                    const startX = e.offsetX,
                        startY = e.offsetY
                    const clientX = e.clientX,
                        clientY = e.clientY
                    let endX, endY
                    // 先判断鼠标是否在osd矩形区域内
                    let isInOSD = false
                    const osdRectX = this.osdRect.x,
                        osdRectY = this.osdRect.y,
                        osdRectW = this.osdRect.width,
                        osdRectH = this.osdRect.height

                    const onMouseMove = (e2: MouseEvent) => {
                        // OSD
                        if (!this.enableOSD) {
                            return
                        }
                        if (this.enableOSD && this.ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                            isInOSD = true
                        }
                        if (!isInOSD) {
                            return
                        }
                        endX = e2.clientX - clientX + startX
                        endY = e2.clientY - clientY + startY
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
                            this.onchange && this.onchange(this.pointList, this.osdInfo)
                        }
                    }

                    const onMouseUp = ({ target, offsetX, offsetY }: MouseEvent) => {
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)
                        document.body.style.setProperty('user-select', 'unset')

                        if (typeof this.clearCurrentArea === 'function' && this.isClosed && !this.ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                            this.clearCurrentArea(this.pointList)
                            return
                        }
                        // 如果绘制的点在OSD内或者当前不可编辑则不可绘制
                        if (isInOSD || !this.enable || this.pointList.length >= this.max || this.isClosed || target !== this.canvas) {
                            return
                        }
                        // 当前绘制点
                        const newPoint = this.getRelativeItemByReal({
                            X: offsetX,
                            Y: offsetY,
                        })
                        // 禁止一个点位于相同的坐标
                        let repeatFlag = false
                        this.pointList.forEach(({ X, Y }) => {
                            if (X === newPoint.X && Y === newPoint.Y) repeatFlag = true
                        })
                        if (repeatFlag) return
                        // 绘制最后一个点时首先判断区域是否可闭合
                        if (this.pointList.length == this.max - 1 && this.judgeIntersect(newPoint)) {
                            this.forceClosePath && this.forceClosePath(false) // 区域不可闭合
                            return
                        }
                        // 绘制过程中如果区域不可闭合（有相交的直线）则不可绘制
                        if (this.pointList.length >= 3 && this.judgeIntersect(newPoint)) {
                            return
                        }
                        // 绘制当前点
                        this.pointList.push(newPoint)
                        this.init()
                        this.drawConstantly()
                        this.onchange && this.onchange(this.pointList)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                }
            }
        }
        if (!this.onDoubleClick) {
            this.onDoubleClick = () => {
                const pointList = this.pointList || []
                const isIntersect = pointList.length >= 3 ? this.judgeIntersect(pointList[pointList.length - 1], true) : true
                if (pointList.length >= 3 && !isIntersect && !this.isClosed) {
                    this.init(true)
                    this.forceClosePath && this.forceClosePath(true) // 区域可闭合
                    this.onchange && this.onchange(this.pointList)
                } else {
                    if (isIntersect && pointList.length >= 3) {
                        this.forceClosePath && this.forceClosePath(false) // 区域不可闭合
                    }
                }
            }
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousedown', this.onMouseDown)

        // 双击主动闭合区域
        if (typeof this.forceClosePath === 'function') {
            this.canvas.removeEventListener('dblclick', this.onDoubleClick)
            this.canvas.addEventListener('dblclick', this.onDoubleClick)
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

    // 设置绘画规则（规定画矩形还是多边形）
    setRegulation(regulation: boolean) {
        this.regulation = regulation
        this.bindEvent()
    }

    // 是否显示全部区域
    setEnableShowAll(enable: boolean) {
        this.enableShowAll = enable
    }

    // 设置画线样式
    setLineStyle(strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number) {
        this.lineStyle = {
            strokeStyle: strokeStyle ? strokeStyle : this.DEFAULT_LINE_COLOR,
            lineWidth: lineWidth ? lineWidth : 1.5,
        }
    }

    // 设置当前区域 索引/类型
    setCurrAreaIndex(index: number, type: CanvasPolygonAreaType) {
        this.currAreaIndex = index // 当前区域索引
        this.currAreaType = type // 当前区域类型 - 侦测/屏蔽/矩形
        this.clearRect() // 清空画布
    }

    // 清空画布
    clearRect() {
        this.ctx.ClearRect(0, 0, this.cavWidth, this.cavHeight)
    }

    // 获取绘制数据
    getArea() {
        if (this.regulation) {
            return this.area
        } else {
            return this.pointList
        }
    }

    // 清空区域
    clear() {
        if (this.regulation) {
            this.area = this.DEFAULT_AREA
            this.setArea(this.area)
        } else {
            this.pointList = []
            this.setPointList(this.pointList)
        }
    }

    // 销毁
    destroy() {
        this.clear()
        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }
        if (this.onDoubleClick) {
            this.canvas.removeEventListener('dblclick', this.onDoubleClick)
        }
    }
}
