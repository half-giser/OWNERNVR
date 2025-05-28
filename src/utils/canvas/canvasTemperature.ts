/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 17:18:13
 * @Description: 打点绘制闭合多边形、点、线，支持业务：温度检测
 */

interface CanvasTemperatureOSDInfo {
    X: number
    Y: number
    osdFormat: string
}

interface CanvasTemperaturePassline {
    startX: number
    startY: number
    endX: number
    endY: number
}

type CanvasTemperatureType = 'temperatureDetect' | 'detectionArea' | ''

// 当前区域类型: 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"
export type CanvasTemperatureAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"

/**
 * 打点绘制闭合多边形
 * @param {Object} option
 *      @property {String} el 画布选择器
 *      @property {Object} lineStyle 画线样式 { strokeStyle, lineWidth }
 *      @property {Boolean} enable 是否可绘制，默认true
 *      @property {Object} pointList 多边形顶点列表 [{ X, Y }, { X, Y }, ...]
 *      @property {Boolean} enableOSD OSD是否可绘制，默认false
 *      @property {Boolean} enableShowAll 是否显示所有区域，默认false
 *      @property {Object} osdInfo osd数据 { X, Y, osdFormat }
 *      @property {Object} max 最大打点数，默认6个点
 *      @property {Object} min 最小打点数，默认4个点
 *      @property {Function} onchange 绘制改变的回调
 *      @property {Function} closePath 闭合路径的回调
 *      @property {Function} forceClosePath 强制闭合路径的回调
 *      @property {Function} clearCurrentArea 清除当前区域的回调
 *      @property {Object} area 警戒区域数据 { X1, Y1, X2, Y2 }
 */
interface CanvasTemperatureOption {
    el?: HTMLCanvasElement
    lineStyle?: Partial<CanvasBaseLineStyleOption>
    pointList?: CanvasBasePoint[]
    enableOSD?: boolean
    enableShowAll?: boolean
    osdInfo?: CanvasTemperatureOSDInfo
    max?: number
    min?: number
    regulation?: boolean // 增加画矩形逻辑 regulation为true则为画矩形，false为画多边形
    area?: CanvasBaseArea
    imgSrc?: string
    onchange?: (area: CanvasBaseArea | CanvasBasePoint[], osdInfo?: CanvasTemperatureOSDInfo) => void
    closePath?: (pointList: CanvasBasePoint[]) => void
    forceClosePath?: (bool: boolean) => void
    clearCurrentArea?: (pointList: CanvasBasePoint[]) => void
}

export const CanvasTemperature = (option: CanvasTemperatureOption = {}) => {
    const DEFAULT_LINE_COLOR = '#0f0' // 画线默认色值
    const DEFAULT_POINT_COLOR = '#f11' // 打点的颜色
    const DEFAULT_TEXT_COLOR = '#f00' // 文字默认色值
    const MAX_COUNT = 6 // 最大打点数
    // private readonly MIN_COUNT = 4 // 最小打点数
    const DEFAULT_OSD_INFO: CanvasTemperatureOSDInfo = {
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
    let enable = true
    let isClosed = false // 多边形是否已闭合，若为true则不能继续绘制
    let detectAreaInfo: CanvasBasePoint[][] = []
    let maskAreaInfo: CanvasBasePoint[][] = []
    let temperatureFlag = false // 温度检测事件绘图标记
    // let dragFlag = false
    let osdRect: CanvasBaseRect = {
        // osd所在矩形区域 {x,y,width,height}
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    let currAreaIndex = 0
    let currAreaType: CanvasTemperatureAreaType = 'detectionArea'

    let lineStyle = {
        strokeStyle: DEFAULT_LINE_COLOR,
        lineWidth: 1.5,
        ...(option.lineStyle || {}),
    }
    let pointList = option.pointList || []
    let enableOSD = option.enableOSD || false
    let enableShowAll = option.enableShowAll || false
    let osdInfo = {
        ...DEFAULT_OSD_INFO,
        ...(option.osdInfo || {}),
    }
    let max = option.max || MAX_COUNT
    // let min = option.min || MIN_COUNT

    const onchange = option.onchange
    const closePath = option.closePath
    const forceClosePath = option.forceClosePath
    const clearCurrentArea = option.clearCurrentArea
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高
    const regulation = option.regulation || false // 增加画矩形逻辑 regulation为true则为画矩形，false为画点
    // const imgSrc = option.imgSrc || '' // 待绘制的抓拍图路径
    let area = {
        ...DEFAULT_AREA,
        ...(option.area || {}),
    }

    /**
     * @description 根据数据绘制区域
     * @param {boolean} isFoucusClosePath
     */
    const init = (isFoucusClosePath: boolean = false) => {
        clearRect()
        if (regulation) {
            // 画矩形
            drawArea()
        } else {
            // 画点
            drawPolygon(isFoucusClosePath)
        }

        if (enableOSD) {
            drawOSD()
        }
    }

    /**
     * @description 绘制警戒区域（矩形）
     */
    const drawArea = () => {
        const item = getRealAreaItemByRelative(area)
        ctx.Point2Rect(item.X1, item.Y1, item.X2, item.Y2, lineStyle)
    }

    /**
     * @description 设置警戒区域（矩形）
     * @param {CanvasBaseArea} info
     */
    const setArea = (info: CanvasBaseArea) => {
        area = info
        init()
    }

    /**
     * @description 绘制警戒线
     * @param {CanvasTemperaturePassline} item
     * @returns
     */
    const drawLine = (item: CanvasTemperaturePassline) => {
        clear()
        ctx.Circle(item.startX, item.startY, 4, lineStyle)
        ctx.FillCircle(item.startX, item.startY, 3.5, DEFAULT_POINT_COLOR)
        ctx.Line(item.startX, item.startY, item.endX, item.endY, lineStyle)
        ctx.Circle(item.endX, item.endY, 4, lineStyle)
        ctx.FillCircle(item.endX, item.endY, 3.5, DEFAULT_POINT_COLOR)
        return item
    }

    /**
     * @description 设置最大顶点数(点、线、面)
     * @param num
     * @param type
     */
    const setPointCount = (num: number, type: CanvasTemperatureType) => {
        temperatureFlag = type === 'temperatureDetect'
        max = num
    }

    /**
     * @description 获取初始区域坐标点
     * @param points
     * @returns
     */
    const getRealAreaItemByRelative = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRealSizeByRelative(X1, 'x'),
            Y1: getRealSizeByRelative(Y1, 'y'),
            X2: getRealSizeByRelative(X2, 'x'),
            Y2: getRealSizeByRelative(Y2, 'y'),
        }
    }

    /**
     * @description 获取绘制区域坐标点
     * @param points
     * @returns
     */
    const getRelativeAreaItemByReal = ({ X1, Y1, X2, Y2 }: CanvasBaseArea) => {
        return {
            X1: getRelativeSizeByReal(X1, 'x'),
            Y1: getRelativeSizeByReal(Y1, 'y'),
            X2: getRelativeSizeByReal(X2, 'x'),
            Y2: getRelativeSizeByReal(Y2, 'y'),
        }
    }

    /**
     * @description 绘制多边形, isFoucusClosePath: 是否强制闭合
     * @param {boolean} isFoucusClosePath
     */
    const drawPolygon = (isFoucusClosePath: boolean = false) => {
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
        newDetectAreaInfo: CanvasBasePoint[][],
        newMaskAreaInfo: CanvasBasePoint[][],
        currAreaType: CanvasTemperatureAreaType,
        currAreaIndex: number,
        isFoucusClosePath = false,
    ) => {
        if (!newDetectAreaInfo.length && !newMaskAreaInfo.length) {
            return
        }

        detectAreaInfo = newDetectAreaInfo // 画点多边形 - 侦测区域
        maskAreaInfo = newMaskAreaInfo // 画点多边形 - 屏蔽区域

        // 两种颜色的线框
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

        maskAreaInfo.forEach((araeInfo, j) => {
            if (araeInfo.length) {
                const startPoint = getRealItemByRelative(araeInfo[0])
                for (let i = 0; i < araeInfo.length; i++) {
                    const point = araeInfo[i]
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
                        const itemPre = getRealItemByRelative(araeInfo[i - 1])
                        ctx.Line(itemPre.X, itemPre.Y, item.X, item.Y, lineStyle)
                    }

                    // 绘制的最后一个点是最大点数，或者强制闭合为true时，才绘制闭合线段
                    if (i === araeInfo.length - 1 && (i === max - 1 || isFoucusClosePath) && point.isClosed) {
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
    }

    const setEnableShowAll = (enable: boolean) => {
        enableShowAll = enable
    }

    const setLineStyle = (strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth?: number) => {
        lineStyle = {
            strokeStyle: strokeStyle ? strokeStyle : DEFAULT_LINE_COLOR,
            lineWidth: lineWidth ? lineWidth : 1.5,
        }
    }

    /**
     * @description 判断新绘制线段是否和已有线段相交
     * @param newPoint
     * @param isFoucusClosePath
     * @returns
     */
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

    /**
     * @description 判断画点多边形区域是否可闭合（通过判断区域中的第一个点和最后一个点的连线是否与其他线相交）- true:可闭合; false:不可闭合
     * @param pointList
     * @returns
     */
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

    // 设置多边形顶点数据
    const setPointList = (list: CanvasBasePoint[], isFoucusClosePath = false) => {
        pointList = list
        if (!pointList.length) {
            isClosed = false
        }
        init(isFoucusClosePath)
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
    const setOSD = (newOsdInfo: CanvasTemperatureOSDInfo) => {
        osdInfo = newOsdInfo
        init(isClosed) // 绘制osd时会重新绘制多边形，此时需判断多边形是否闭合
        if (enableShowAll) drawAllPolygon(detectAreaInfo, maskAreaInfo, currAreaType, currAreaIndex, true)
    }

    // 绘制OSD
    const drawOSD = () => {
        if (!osdInfo) return
        const X = getRealSizeByRelative(osdInfo.X, 'x')
        const Y = getRealSizeByRelative(osdInfo.Y, 'y')
        // 兼容字符串里有\n和直接回车的换行
        const splitStr = osdInfo.osdFormat && osdInfo.osdFormat.includes('\\n') ? '\\n' : '\n'
        const osdList = osdInfo.osdFormat ? osdInfo.osdFormat.split(splitStr) : []
        let longestStrLen = 0
        for (let i = 0; i < osdList.length; i++) {
            const item = osdList[i].trim()
            // 空白符占5.8px，小写字母占7.5px，大写字母、数字等其他占9px
            const lowerStrCount = item.match(/[a-z]/g)?.length || 0
            const spaceStrCount = item.match(/\s/g)?.length || 0
            const itemStrLength = spaceStrCount * 5.8 + lowerStrCount * 7.5 + (item.length - lowerStrCount - spaceStrCount) * 9
            longestStrLen = itemStrLength > longestStrLen ? itemStrLength : longestStrLen
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

    const onMouseDown = (e: MouseEvent) => {
        if (regulation) {
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
                    getRelativeAreaItemByReal({
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
        } else {
            if (!enable) {
                return
            }

            document.body.style.setProperty('user-select', 'none')
            const startX = e.offsetX
            const startY = e.offsetY
            const clientX = e.clientX
            const clientY = e.clientY
            // 先判断鼠标是否在osd矩形区域内
            const osdRectX = osdRect.x
            const osdRectY = osdRect.y
            const osdRectW = osdRect.width
            const osdRectH = osdRect.height
            let endX: number
            let endY: number

            const onMouseMove = (e2: MouseEvent) => {
                endX = e2.clientX - clientX + startX
                endY = e2.clientY - clientY + startY
                // 若绘制线条，允许拖拽绘制
                if (temperatureFlag && max === 2) {
                    endX = clamp(endX, 0, cavWidth)
                    endY = clamp(endY, 0, cavHeight)

                    const startPoint = getRelativeItemByReal({
                        X: startX,
                        Y: startY,
                    })
                    const endPoint = getRelativeItemByReal({
                        X: endX,
                        Y: endY,
                    })
                    drawLine({ startX, startY, endX, endY })
                    pointList = [
                        {
                            X: startPoint.X,
                            Y: startPoint.Y,
                        },
                        {
                            X: endPoint.X,
                            Y: endPoint.Y,
                        },
                    ]
                    onchange && onchange(pointList, osdInfo)
                }
            }

            const onMouseUp = ({ offsetX, offsetY }: MouseEvent) => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                document.body.style.setProperty('user-select', 'unset')
                // 绘制区域闭合之后再次点击绘制弹框提示：已绘制，是否需要清除绘制？
                if (isClosed && !ctx.IsInRect(startX, startY, osdRectX, osdRectY, osdRectW, osdRectH)) {
                    clearCurrentArea && clearCurrentArea(pointList)
                    return
                }

                // 温度检测事件重新绘制（点/线）时，清除图形
                if (temperatureFlag) {
                    if (max === 1) {
                        pointList = []
                        clear()
                    }

                    if (max === 2 && pointList.length === 2) {
                        return
                    }

                    if (pointList.length >= max) {
                        return
                    }
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
                init()
                onchange && onchange(pointList)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }
    }

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

    /**
     * @description 绑定事件
     */
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousedown', onMouseDown)

        // 双击主动闭合区域
        if (typeof forceClosePath === 'function') {
            canvas.removeEventListener('dblclick', onDoubleClick)
            canvas.addEventListener('dblclick', onDoubleClick)
        }
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

    /**
     * @description 清空画布
     */
    const clearRect = () => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
    }

    /**
     * @description 获取绘制数据
     * @returns
     */
    const getArea = () => {
        return pointList
    }

    /**
     * @description 设置当前区域 索引/类型
     * @param index
     * @param type
     */
    const setCurrAreaIndex = (index: number, type: CanvasTemperatureAreaType) => {
        currAreaIndex = index // 当前区域索引
        currAreaType = type // 当前区域类型 - 侦测/屏蔽/矩形
        clearRect() // 清空画布
    }

    /**
     * @description 清空区域
     */
    const clear = () => {
        if (regulation) {
            area = DEFAULT_AREA
            setArea(area)
        } else {
            pointList = []
            setPointList(pointList)
        }
    }

    /**
     * @description 销毁
     */
    const destroy = () => {
        clear()
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('dblclick', onDoubleClick)
    }

    bindEvent()

    return {
        setArea,
        setPointCount,
        setEnableShowAll,
        setLineStyle,
        judgeIntersect,
        judgeAreaCanBeClosed,
        isCurrentIntersect,
        setPointList,
        setEnable,
        setOSDEnable,
        setOSD,
        getArea,
        setCurrAreaIndex,
        clear,
        destroy,
        drawAllPolygon,
    }
}
