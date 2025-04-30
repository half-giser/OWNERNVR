/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:14:06
 * @Description: 打点绘制闭合多边形, 绘制矩形；支持业务：区域入侵、车牌侦测，视频结构化，物品遗留与看护
 */

export interface CanvasPolygonOSDInfo {
    X: number
    Y: number
    osdFormat: string
}

export type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"

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
    el?: HTMLCanvasElement
    lineStyle?: CanvasBaseLineStyleOption
    enable?: boolean
    enableOSD?: boolean
    enableShowAll?: boolean
    enableShowRange?: boolean
    osdInfo?: CanvasPolygonOSDInfo
    max?: number
    min?: number
    area?: CanvasBaseArea
    regulation?: boolean // 增加画矩形逻辑 regulation为true则为画矩形，false为画多边形
    imgSrc?: string // 待绘制的抓拍图路径
    oldVersionMaxMin?: boolean
    onchange?: (area: CanvasBaseArea | CanvasBasePoint[], osdInfo?: CanvasPolygonOSDInfo) => void
    closePath?: (pointList: CanvasBasePoint[]) => void
    forceClosePath?: (bool: boolean) => void
    clearCurrentArea?: (pointList: CanvasBasePoint[]) => void
}

export const CanvasPolygon = (option: CanvasPolygonOption = {}) => {
    const DEFAULT_LINE_COLOR = '#0f0'
    const DEFAULT_POINT_COLOR = '#f11' // 打点的颜色
    const DEFAULT_TEXT_COLOR = '#f00' // 文字默认色值
    const MAX_COUNT = 6 // 最大打点数
    // private readonly MIN_COUNT = 4 // 最小打点数
    const DEFAULT_OSD_INFO = {
        X: 0,
        Y: 0,
        osdFormat: '',
    } // 默认osd信息
    const RELATIVE_WIDTH = 10000 // 万分比宽度
    const RELATIVE_HEIGHT = 10000 // 万分比高度
    const DEFAULT_AREA: CanvasBaseArea = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }

    let isClosed = false
    let osdRect: CanvasBaseRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    let pointList: CanvasBasePoint[] = []
    let detectAreaInfo: CanvasBasePoint[][]
    let maskAreaInfo: CanvasBasePoint[][]
    let regionInfoList: CanvasBaseArea[] = []
    let rangeMax: CanvasBaseArea = {
        ...DEFAULT_AREA,
    }
    let rangeMin: CanvasBaseArea = {
        ...DEFAULT_AREA,
    }
    let currAreaType: CanvasPolygonAreaType = 'detectionArea'
    let currAreaIndex = 0

    let lineStyle = {
        strokeStyle: DEFAULT_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.lineStyle || {}),
    }
    let enable = typeof option.enable === 'boolean' ? option.enable : true
    let enableOSD = option.enableOSD || false
    let enableShowAll = option.enableShowAll || false
    let enableShowRange = option.enableShowRange || false
    let osdInfo = {
        ...DEFAULT_OSD_INFO,
        ...(option.osdInfo || {}),
    }
    const max = option.max || MAX_COUNT
    // const min = option.min || this.MIN_COUNT
    const onchange = option.onchange
    const closePath = option.closePath
    const forceClosePath = option.forceClosePath
    const clearCurrentArea = option.clearCurrentArea
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高
    let regulation = typeof option.regulation === 'boolean' ? option.regulation : false
    // const imgSrc = option.imgSrc || '' // 待绘制的抓拍图路径
    let area = {
        ...DEFAULT_AREA,
        ...(option.area || {}),
    }
    const oldVersionMaxMin = option.oldVersionMaxMin || false // 是否使用旧版的最大/最小框
    let draggingMaxMin = false // 是否正在拖拽最大/最小目标框
    let selectedMax = false // 是否选中最大目标框
    let selectedMin = false // 是否选中最小目标框
    let hoverOnMaxMinFlag = false // 防止频繁触发"绘制事件"的绑定
    const MAX_MIN_COLOR = '#ff0' // rgb(255, 255, 0)

    // 根据数据绘制区域
    const init = (isFoucusClosePath = false) => {
        clearRect()

        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
            return
        }

        if (regulation) {
            // 画矩形
            drawArea()
        } else {
            // 画多边形
            drawPolygon(isFoucusClosePath)
        }

        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
        }

        // 绘制最大，最小范围框
        if (enableShowRange) {
            drawRangeMax()
            drawRangeMin()
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
    const drawAllRegion = (infoList: CanvasBaseArea[], currentRegionIndex: number) => {
        if (!infoList.length) return
        // 矩形区域 - 包含每个矩形区域的点坐标
        regionInfoList = infoList

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

        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
        }

        // 绘制最大，最小范围框
        if (enableShowRange) {
            drawRangeMax()
            drawRangeMin()
        }
    }

    // 设置最值区域是否可见
    const toggleRange = (visible: boolean) => {
        enableShowRange = visible

        drawConstantly(isClosed)
        bindDragMaxMinEvent()
    }

    // 设置最大值
    const setRangeMax = (area: CanvasBaseArea) => {
        rangeMax = area
        selectedMax = false
        selectedMin = false
        drawConstantly(isClosed)
        bindDragMaxMinEvent()
    }

    // 设置最小值
    const setRangeMin = (area: CanvasBaseArea) => {
        rangeMin = area
        selectedMax = false
        selectedMin = false
        drawConstantly(isClosed)
        bindDragMaxMinEvent()
    }

    // 绘制最大值区域
    const drawRangeMax = () => {
        const item = getRealAreaItemByRelative(rangeMax)
        const maxMinColor = oldVersionMaxMin ? DEFAULT_LINE_COLOR : MAX_MIN_COLOR
        const lineStyle = {
            strokeStyle: maxMinColor,
            lineWidth: 1.5,
        }

        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Max',
            startX: oldVersionMaxMin ? item.X1 : item.X2 - ctx.MeasureText('Max').width - 4,
            startY: oldVersionMaxMin ? item.Y1 : item.Y1 + 4,
            fillStyle: oldVersionMaxMin ? '#ffff00' : MAX_MIN_COLOR,
            strokeStyle: '#000',
            textBaseline: oldVersionMaxMin ? 'bottom' : 'top',
        })

        if (selectedMax) {
            ctx.FillCircle(item.X1, item.Y1, 4, maxMinColor)
            ctx.FillCircle(item.X2, item.Y1, 4, maxMinColor)
            ctx.FillCircle(item.X1, item.Y2, 4, maxMinColor)
            ctx.FillCircle(item.X2, item.Y2, 4, maxMinColor)
        }
    }

    // 绘制最小值区域
    const drawRangeMin = () => {
        // const item = getRealAreaItemByRelative(rangeMin)
        // const rangeMaxY1 = getRealSizeByRelative(rangeMax.Y1, 'y')
        // const lineStyle = {
        //     strokeStyle: DEFAULT_LINE_COLOR,
        //     lineWidth: 1.5,
        // }
        // ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        // ctx.Text({
        //     text: 'Min',
        //     startX: item.X1,
        //     startY: item.Y1,
        //     fillStyle: '#ff0',
        //     strokeStyle: '#000',
        //     textBaseline: Math.abs(rangeMaxY1 - item.Y1) < 14 ? 'top' : 'bottom',
        // })

        const item = getRealAreaItemByRelative(rangeMin)
        const rangeMaxY1 = getRealSizeByRelative(rangeMax.Y1, 'y')
        const maxMinColor = oldVersionMaxMin ? DEFAULT_LINE_COLOR : MAX_MIN_COLOR
        const lineStyle = {
            strokeStyle: maxMinColor,
            lineWidth: 1.5,
        }
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
        ctx.Text({
            text: 'Min',
            startX: oldVersionMaxMin ? item.X1 : item.X2 - ctx.MeasureText('Min').width - 4,
            startY: oldVersionMaxMin ? item.Y1 : item.Y1 + 4,
            fillStyle: oldVersionMaxMin ? '#ffff00' : MAX_MIN_COLOR,
            strokeStyle: '#000',
            textBaseline: oldVersionMaxMin ? (Math.abs(rangeMaxY1 - item.Y1) < 14 ? 'top' : 'bottom') : 'top',
        })
        if (selectedMin) {
            ctx.FillCircle(item.X1, item.Y1, 4, maxMinColor)
            ctx.FillCircle(item.X2, item.Y1, 4, maxMinColor)
            ctx.FillCircle(item.X1, item.Y2, 4, maxMinColor)
            ctx.FillCircle(item.X2, item.Y2, 4, maxMinColor)
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
        const startPoint = getRealItemByRelative(pointList[0])
        for (let i = 0; i < pointList.length; i++) {
            const item = getRealItemByRelative(pointList[i])
            ctx.Circle(item.X, item.Y, 4, lineStyle)
            ctx.FillCircle(item.X, item.Y, 3.5, DEFAULT_POINT_COLOR)

            if (i > 0) {
                const itemPre = getRealItemByRelative(pointList[i - 1])
                ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
            }

            // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
            if (i === pointList.length - 1 && (i === max - 1 || isFoucusClosePath)) {
                const isIntersect = pointList.length >= 3 ? judgeIntersect(pointList.at(-1)!, true) : true
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
        newDetectAreaInfo: CanvasBasePoint[][],
        newMaskAreaInfo: CanvasBasePoint[][],
        currAreaType: CanvasPolygonAreaType,
        currAreaIndex: number,
        isFoucusClosePath: boolean = false,
    ) => {
        if (!newDetectAreaInfo.length && !newMaskAreaInfo.length) {
            return
        }

        detectAreaInfo = newDetectAreaInfo // 画点多边形 - 侦测区域
        maskAreaInfo = newMaskAreaInfo // 画点多边形 - 屏蔽区域

        detectAreaInfo.forEach((areaInfo, j) => {
            if (areaInfo.length) {
                const startPoint = getRealItemByRelative(areaInfo[0])
                for (let i = 0; i < areaInfo.length; i++) {
                    const point = areaInfo[i]
                    const item = getRealItemByRelative(point)
                    const lineStyle = {
                        strokeStyle: DEFAULT_LINE_COLOR,
                        lineWidth: 1.5,
                    }
                    if (currAreaType === 'detectionArea' && currAreaIndex === j) {
                        lineStyle.lineWidth = 3
                    }
                    ctx.Circle(item.X, item.Y, 4, lineStyle)
                    ctx.FillCircle(item.X, item.Y, 3.5, DEFAULT_POINT_COLOR)

                    if (i > 0) {
                        const itemPre = getRealItemByRelative(areaInfo[i - 1])
                        ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                    }

                    // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                    if (i === areaInfo.length - 1 && (i === max - 1 || isFoucusClosePath) && point.isClosed) {
                        ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                    }
                }
            }
        })

        maskAreaInfo.forEach((areaInfo, j) => {
            if (areaInfo.length) {
                const startPoint = getRealItemByRelative(areaInfo[0])
                for (let i = 0; i < areaInfo.length; i++) {
                    const point = areaInfo[i]
                    const item = getRealItemByRelative(point)
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
                        const itemPre = getRealItemByRelative(areaInfo[i - 1])
                        ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                    }

                    // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                    if (i === areaInfo.length - 1 && (i === max - 1 || isFoucusClosePath) && point.isClosed) {
                        ctx.Line(startPoint.X, startPoint.Y, item.X, item.Y, lineStyle)
                    }
                }
            }
        })

        if (pointList.length >= 4 && pointList[0].isClosed) {
            isClosed = true
        } else {
            isClosed = false
        }

        // 绘制OSD信息
        if (enableOSD) {
            drawOSD()
        }

        // 绘制最大，最小范围框
        if (enableShowRange) {
            drawRangeMax()
            drawRangeMin()
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

    const getRealItemByRelative = ({ X, Y }: CanvasBasePoint) => {
        return {
            X: getRealSizeByRelative(X, 'x'),
            Y: getRealSizeByRelative(Y, 'y'),
        }
    }

    const getRelativeItemByReal = ({ X, Y }: CanvasBasePoint) => {
        return {
            X: getRelativeSizeByReal(X, 'x'),
            Y: getRelativeSizeByReal(Y, 'y'),
        }
    }

    // 实时绘制全部区域（显示全部区域时，绘制当前区域的同时显示其余区域）
    const drawConstantly = (isClosed = false) => {
        init(isClosed)
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

    // 绘制抓拍原图目标框
    // const drawSnapImgRule = () => {
    //     ctx.DrawImage(imgSrc, 0, 0, cavWidth, cavHeight, () => {
    //         // 绘制图片完成的回调（其它任务）
    //         drawArea()
    //     })
    // }

    // 设置画布是否禁用
    const setEnable = (bool: boolean) => {
        enable = bool
    }

    // 设置OSD是否禁用
    const setOSDEnable = (enable: boolean) => {
        enableOSD = enable
    }

    // 设置osdInfo: { osdFormat: '111\n222', X: 100, Y: 100 }
    const setOSD = (info: CanvasPolygonOSDInfo) => {
        osdInfo = info
        drawConstantly(isClosed) // 绘制osd时会重新绘制多边形，此时需判断多边形是否闭合
    }

    // 绘制OSD
    const drawOSD = () => {
        if (!osdInfo) return
        const X = getRealSizeByRelative(osdInfo.X, 'x')
        const Y = getRealSizeByRelative(osdInfo.Y, 'y')

        // 兼容字符串里有\n和直接回车的换行
        const splitStr = osdInfo.osdFormat.includes('\\n') ? '\\n' : '\n'
        const osdList = osdInfo.osdFormat ? osdInfo.osdFormat.split(splitStr) : []
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

    let onMouseDown: (e: MouseEvent) => void = () => {}
    let onMouseMove: (e: MouseEvent) => void = () => {}

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

    // 绑定事件
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)

        onMouseDown = (e: MouseEvent) => {
            if (regulation) {
                if (!enable || hoverOnMaxMinFlag || draggingMaxMin) {
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
                if (!enable || hoverOnMaxMinFlag || draggingMaxMin) {
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
                const clientX = e.clientX
                const clientY = e.clientY
                const osdRectX = osdRect.x
                const osdRectY = osdRect.y
                const osdRectW = osdRect.width
                const osdRectH = osdRect.height
                let endX: number
                let endY: number
                // 先判断鼠标是否在osd矩形区域内
                let isInOSD = false

                const onMouseMove = (e2: MouseEvent) => {
                    // OSD
                    if (!enableOSD) {
                        return
                    }

                    if (enableOSD && ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                        isInOSD = true
                    }

                    if (!isInOSD) {
                        return
                    }
                    endX = e2.clientX - clientX + startX
                    endY = e2.clientY - clientY + startY
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
                        onchange && onchange(pointList, osdInfo)
                    }
                }

                const onMouseUp = ({ target, offsetX, offsetY }: MouseEvent) => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')

                    if (typeof clearCurrentArea === 'function' && isClosed && !ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                        clearCurrentArea(pointList)
                        return
                    }

                    // 如果绘制的点在OSD内或者当前不可编辑则不可绘制
                    if (isInOSD || !enable || pointList.length >= max || isClosed || target !== canvas) {
                        return
                    }

                    // 当前绘制点
                    const newPoint = getRelativeItemByReal({
                        X: offsetX,
                        Y: offsetY,
                    })

                    // 禁止一个点位于相同的坐标
                    if (pointList.some(({ X, Y }) => X === newPoint.X && Y === newPoint.Y)) return

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

        canvas.addEventListener('mousedown', onMouseDown)

        // 双击主动闭合区域
        if (typeof forceClosePath === 'function') {
            canvas.removeEventListener('dblclick', onDoubleClick)
            canvas.addEventListener('dblclick', onDoubleClick)
        }
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
        if (oldVersionMaxMin) return
        // var self = this;
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

    // 设置绘画规则（规定画矩形还是多边形）
    const setRegulation = (bool: boolean) => {
        regulation = bool
        bindEvent()
    }

    // 是否显示全部区域
    const setEnableShowAll = (enable: boolean) => {
        enableShowAll = enable
    }

    // 设置画线样式
    const setLineStyle = (strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number) => {
        lineStyle = {
            strokeStyle: strokeStyle ? strokeStyle : DEFAULT_LINE_COLOR,
            lineWidth: lineWidth ? lineWidth : 1.5,
        }
    }

    // 设置当前区域 索引/类型
    const setCurrAreaIndex = (index: number, type: CanvasPolygonAreaType) => {
        currAreaIndex = index // 当前区域索引
        currAreaType = type // 当前区域类型 - 侦测/屏蔽/矩形
        clearRect() // 清空画布
    }

    // 清空画布
    const clearRect = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
    }

    // 获取绘制数据
    const getArea = () => {
        if (regulation) {
            return area
        } else {
            return pointList
        }
    }

    // 清空区域
    const clear = () => {
        if (regulation) {
            area = DEFAULT_AREA
            setArea(area)
        } else {
            pointList = []
            setPointList(pointList)
        }
    }

    // 销毁
    const destroy = () => {
        clear()
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('dblclick', onDoubleClick)
    }

    bindEvent()

    return {
        init,
        setArea,
        toggleRange,
        setRangeMax,
        setRangeMin,
        setPointList,
        judgeIntersect,
        judgeAreaCanBeClosed,
        isCurrentIntersect,
        setEnable,
        setOSDEnable,
        setOSD,
        setRegulation,
        setEnableShowAll,
        setLineStyle,
        setCurrAreaIndex,
        getArea,
        clear,
        destroy,
        drawAllPolygon,
        drawAllRegion,
    }
}
