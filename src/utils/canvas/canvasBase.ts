/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 14:08:32
 * @Description: Canvas基础类
 */
export interface CanvasBasePoint {
    X: number
    Y: number
    isClosed?: boolean
}

export interface CanvasBaseArea {
    X1: number
    X2: number
    Y1: number
    Y2: number
}

export interface CanvasBaseRect {
    x: number
    y: number
    width: number
    height: number
}

export interface CanvasBaseLineStyleOption {
    lineWidth: number
    strokeStyle: string | CanvasGradient | CanvasPattern
}

interface CanvasBaseTextOption {
    text: string
    startX: number
    startY: number
    fillStyle?: string | CanvasGradient | CanvasPattern
    lineWidth?: number
    strokeStyle?: string
    font?: string
    textBaseline?: CanvasTextBaseline
}

interface CanvaseBaseArrowOption {
    startX: number
    startY: number
    endX: number
    endY: number
    pointX: number
    pointY: number
    size?: number
    direction?: 'toStart' | 'toEnd'
    lineStyle?: CanvasBaseLineStyleOption
    textCfg?: {
        textStart?: string
        textEnd?: string
        fillStyle?: string | CanvasGradient | CanvasPattern
        lineWidth?: number
        strokeStyle?: string
        font?: string
        textBaseline?: CanvasTextBaseline
    }
}

export default function CanvasBase(element: HTMLCanvasElement) {
    const el = isRef(element) ? toRaw(element) : element
    const ctx = el.getContext('2d')!

    ctx.imageSmoothingEnabled = false
    ctx.imageSmoothingQuality = 'high'

    /**
     * @description 画直线
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @param lineStyle
     */
    const Line = (startX: number, startY: number, endX: number, endY: number, lineStyle: Partial<CanvasBaseLineStyleOption>) => {
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        if (lineStyle) {
            ctx.lineWidth = lineStyle.lineWidth || 1
            ctx.strokeStyle = lineStyle.strokeStyle || '#000'
        } else {
            ctx.lineWidth = 1
            ctx.strokeStyle = '#000'
        }
        ctx.stroke()
    }

    /**
     * @description 画边框矩形
     * @param startX
     * @param startY
     * @param width
     * @param height
     * @param lineStyle
     */
    const Rect = (startX: number, startY: number, width: number, height: number, lineStyle: Partial<CanvasBaseLineStyleOption>) => {
        ctx.beginPath()
        ctx.rect(startX, startY, width, height)
        if (lineStyle) {
            ctx.lineWidth = lineStyle.lineWidth || 1
            ctx.strokeStyle = lineStyle.strokeStyle || '#000'
        }
        ctx.stroke()
    }

    /**
     * @description 渲染图像
     * @param imgSrc
     * @param startX
     * @param startY
     * @param width
     * @param height
     * @param callback
     */
    const DrawImage = (imgSrc: string, startX: number, startY: number, width: number, height: number, callback?: () => void) => {
        const image = new Image()
        image.onload = () => {
            ctx.drawImage(image, startX, startY, width, height)
            callback && callback()
        }
        image.src = imgSrc
    }

    /**
     * @description 根据两点坐标画边框矩形
     * @param X1
     * @param Y1
     * @param X2
     * @param Y2
     * @param lineStyle
     */
    const Point2Rect = (X1: number, Y1: number, X2: number, Y2: number, lineStyle: CanvasBaseLineStyleOption) => {
        ctx.beginPath()
        ctx.moveTo(X1, Y1)
        ctx.lineTo(X2, Y1)
        ctx.lineTo(X2, Y2)
        ctx.lineTo(X1, Y2)
        ctx.lineTo(X1, Y1)
        if (lineStyle) {
            ctx.lineWidth = lineStyle.lineWidth || 1
            ctx.strokeStyle = lineStyle.strokeStyle || '#000'
        }
        ctx.stroke()
    }

    /**
     * @description 画填充矩形
     * @param startX
     * @param startY
     * @param width
     * @param height
     * @param fillStyle
     */
    const FillRect = (startX: number, startY: number, width: number, height: number, fillStyle: string | CanvasGradient | CanvasPattern) => {
        ctx.beginPath()
        ctx.fillStyle = fillStyle || '#000'
        ctx.fillRect(startX, startY, width, height)
    }

    /**
     * @description 画空心圆
     * @param x
     * @param y
     * @param r
     * @param lineStyle
     */
    const Circle = (x: number, y: number, r: number, lineStyle: CanvasBaseLineStyleOption) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        if (lineStyle) {
            ctx.lineWidth = lineStyle.lineWidth || 1
            ctx.strokeStyle = lineStyle.strokeStyle || '#000'
        }
        ctx.stroke()
        ctx.closePath()
    }

    /**
     * @description 画实心圆
     * @param x
     * @param y
     * @param r
     * @param fillStyle
     */
    const FillCircle = (x: number, y: number, r: number, fillStyle: string) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        ctx.fillStyle = fillStyle || '#f00'
        ctx.fill()
    }

    /**
     * @description 画文字
     * @param {Object} option
     *      @property {String} text 文字内容
     *      @property {Number} startX 起始坐标X
     *      @property {Number} startY 起始坐标Y
     *      @property {String} fillStyle 填充颜色
     *      @property {Number} lineWidth 线宽（字重）
     *      @property {String} strokeStyle 轮廓线颜色
     *      @property {String} font 字体,与css font属性相同用法，具体参考canvas font属性
     *      @property {String} textBaseline 文本基线，具体参考canvas textBaseline属性
     */
    const Text = (option: CanvasBaseTextOption) => {
        ctx.textBaseline = option.textBaseline || 'top'
        ctx.font = option.font || '14px Verdana'
        ctx.fillStyle = option.fillStyle || '#fff' // 填充线样式
        ctx.lineWidth = option.lineWidth || 1.5 // 线宽（字重）
        ctx.strokeStyle = option.strokeStyle || '#00000000' // 轮廓线样式，默认透明
        ctx.strokeText(option.text, option.startX, option.startY)
        ctx.fillText(option.text, option.startX, option.startY)
    }

    /**
     * @description 清除指定矩形区域的画布
     * @param startX
     * @param startY
     * @param width
     * @param height
     */
    const ClearRect = (startX: number, startY: number, width: number, height: number) => {
        ctx.clearRect(startX, startY, width, height)
    }

    /**
     * @description 判断坐标点是否在矩形范围内
     * @param x
     * @param y
     * @param rectX
     * @param rectY
     * @param rectWidth
     * @param rectHeight
     * @returns {number}
     */
    const IsInRect = (x: number, y: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number) => {
        return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight
    }

    /**
     * @description 判断B点相对A点是否是顺时针方向（向量叉乘结果<0）
     * @see https://www.cnblogs.com/tuyang1129/p/9390376.html
     * @param pointAx
     * @param pointAy
     * @param pointBx
     * @param pointBy
     * @returns {boolean}
     */
    const isClockwise = (pointAx: number, pointAy: number, pointBx: number, pointBy: number) => {
        return pointAx * pointBy - pointAy * pointBx < 0
    }

    /**
     * @description 获取B点相对A点为原点在坐标系（x→, y↑）中的坐标
     * @param pointAx
     * @param pointAy
     * @param pointBx
     * @param pointBy
     * @returns {object}
     */
    const getRelativePoint = (pointAx: number, pointAy: number, pointBx: number, pointBy: number) => {
        return {
            x: pointBx - pointAx,
            y: pointAy - pointBy,
        }
    }

    /**
     * @description 根据已知线段和线段上的某点，画该点的箭头
     * @param {Object} option
     *      @property {Number} startX 线段起点坐标X
     *      @property {Number} startY 线段起点坐标Y
     *      @property {Number} endX 线段终点坐标X
     *      @property {Number} endY 线段终点坐标Y
     *      @property {Number} pointX 目标点X
     *      @property {Number} pointY 目标点Y
     *      @property {Number} size 箭头尺寸：箭头投影在线段上的长度
     *      @property {String} direction 箭头方向 toStart: 朝向起点位置; toEnd: 朝向终点位置
     *      @property {String} lineStyle 箭头线条样式 { lineWidth, strokeStyle }
     *      @property {Object} textCfg 箭头两端点的文字配置 { textStart, textEnd, fillStyle, strokeStyle, font, textBaseline }, 详细见Text方法
     */
    const Arrow = (option: CanvaseBaseArrowOption) => {
        const startX = option.startX,
            startY = option.startY,
            endX = option.endX,
            endY = option.endY
        if (startX === endX && startY === endY) return
        const pointX = option.pointX,
            pointY = option.pointY
        const size = option.size || 5
        const direction = option.direction || 'toEnd'
        const lineStyle = {
            lineWidth: 1,
            strokeStyle: '#0f0',
            ...(option.lineStyle || {}),
        }
        // 箭头两端点
        let arrowStartX, arrowStartY, arrowEndX, arrowEndY
        // 箭头端点投影在线段上的坐标
        let onlinePointX, onlinePointY
        if (startY === endY) {
            // 线段和x轴平行时
            onlinePointX = pointX - size
            onlinePointY = endY
            if ((startX < endX && direction === 'toStart') || (startX > endX && direction === 'toEnd')) {
                onlinePointX = pointX + size
            }
            arrowStartX = arrowEndX = onlinePointX
            arrowStartY = onlinePointY - size
            arrowEndY = onlinePointY + size
        } else if (startX === endX) {
            // 线段和y轴平行时
            onlinePointY = pointY - size
            onlinePointX = endX
            if ((startY < endY && direction === 'toStart') || (startY > endY && direction === 'toEnd')) {
                onlinePointY = pointY + size
            }
            arrowStartY = arrowEndY = onlinePointY
            arrowStartX = onlinePointX - size
            arrowEndX = onlinePointX + size
        } else {
            // 线段和x、y轴都不平行时，使用三角函数求垂线两端点坐标
            const atan = Math.atan(Math.abs(startX - endX) / Math.abs(startY - endY))
            const relatX = size * Math.sin(atan)
            const relatY = size * Math.cos(atan)
            // 先判断线段的走向
            if ((startX - endX) * (startY - endY) > 0) {
                // 西北-东南向
                onlinePointX = pointX - relatX
                onlinePointY = pointY - relatY
                if ((startY < endY && direction === 'toStart') || (startY > endY && direction === 'toEnd')) {
                    onlinePointX = pointX + relatX
                    onlinePointY = pointY + relatY
                }
                arrowStartX = onlinePointX + relatY
                arrowStartY = onlinePointY - relatX
                arrowEndX = onlinePointX - relatY
                arrowEndY = onlinePointY + relatX
            } else {
                // 东北-西南向
                onlinePointX = pointX - relatX
                onlinePointY = pointY + relatY
                if ((startX < endX && direction === 'toStart') || (startX > endX && direction === 'toEnd')) {
                    onlinePointX = pointX + relatX
                    onlinePointY = pointY - relatY
                }
                arrowStartX = onlinePointX - relatY
                arrowStartY = onlinePointY - relatX
                arrowEndX = onlinePointX + relatY
                arrowEndY = onlinePointY + relatX
            }
        }
        Line(arrowStartX, arrowStartY, pointX, pointY, lineStyle)
        Line(arrowEndX, arrowEndY, pointX, pointY, lineStyle)
        // 如果需要绘制文字
        if (option.textCfg) {
            const textCfg = option.textCfg
            const TEXT_START_DISTANCE = textCfg.textStart ? textCfg.textStart.length * 10 : 0 // 文字和端点距离
            const TEXT_END_DISTANCE = textCfg.textEnd ? textCfg.textEnd.length * 10 : 0 // 文字和端点距离
            const FONT_OFFSET = 3 // 文字与端点间距
            const DEFAULT_FILLSTYLE = '#f00' // 文字填充色
            const DEFAULT_STROKE_STYLE = '#4f2828' // 文字描边色
            const DEFAULT_BASELINE = 'middle' // 文字基准线
            const textStartX = startX < endX ? startX - TEXT_START_DISTANCE - FONT_OFFSET : startX + FONT_OFFSET
            const textStartY = startY < endY ? startY - FONT_OFFSET : startY + FONT_OFFSET
            const textEndX = startX < endX ? endX + FONT_OFFSET : endX - TEXT_END_DISTANCE - FONT_OFFSET
            const textEndY = startY < endY ? endY + FONT_OFFSET : endY - FONT_OFFSET
            if (textCfg.textStart) {
                Text({
                    text: textCfg.textStart,
                    startX: textStartX,
                    startY: textStartY,
                    fillStyle: textCfg.fillStyle || DEFAULT_FILLSTYLE,
                    strokeStyle: textCfg.strokeStyle || DEFAULT_STROKE_STYLE,
                    textBaseline: textCfg.textBaseline || DEFAULT_BASELINE,
                })
            }

            if (textCfg.textEnd) {
                Text({
                    text: textCfg.textEnd,
                    startX: textEndX,
                    startY: textEndY,
                    fillStyle: textCfg.fillStyle || DEFAULT_FILLSTYLE,
                    strokeStyle: textCfg.strokeStyle || DEFAULT_STROKE_STYLE,
                    textBaseline: textCfg.textBaseline || DEFAULT_BASELINE,
                })
            }
        }
    }

    /**
     * @description 判断线段AB和线段CD是否相交（不包含共端点）
     * 原理：如果线段CD的两个端点C和D，与另一条线段的一个端点（A或B，只能是其中一个）连成的向量，与向量AB做叉乘，
     *       若结果异号，表示C和D分别在直线AB的两边，
     *       若结果同号，则表示CD两点都在AB的一边，则肯定不相交。
     *       即判断CD是否在AB的两边、和AB是否在CD的两边，两者同时满足则证明线段相交
     * @see https://www.cnblogs.com/tuyang1129/p/9390376.html
     * @returns {Boolean} true:相交; false:不相交
     */
    const IsIntersect = (pointA: CanvasBasePoint, pointB: CanvasBasePoint, pointC: CanvasBasePoint, pointD: CanvasBasePoint) => {
        const vectorAC = {
            X: pointC.X - pointA.X,
            Y: pointC.Y - pointA.Y,
        }
        const vectorAD = {
            X: pointD.X - pointA.X,
            Y: pointD.Y - pointA.Y,
        }
        const vectorAB = {
            X: pointB.X - pointA.X,
            Y: pointB.Y - pointA.Y,
        }
        const vectorCA = {
            X: pointA.X - pointC.X,
            Y: pointA.Y - pointC.Y,
        }
        const vectorCB = {
            X: pointB.X - pointC.X,
            Y: pointB.Y - pointC.Y,
        }
        const vectorCD = {
            X: pointD.X - pointC.X,
            Y: pointD.Y - pointC.Y,
        }
        const isBothSideCD = (vectorAC.X * vectorAB.Y - vectorAC.Y * vectorAB.X) * (vectorAD.X * vectorAB.Y - vectorAD.Y * vectorAB.X) < 0
        const isBothSideAB = (vectorCA.X * vectorCD.Y - vectorCA.Y * vectorCD.X) * (vectorCB.X * vectorCD.Y - vectorCB.Y * vectorCD.X) < 0
        return isBothSideCD && isBothSideAB
    }

    /**
     * @description 求点C到线段AB的垂直距离
     * 利用点到直线距离公式求解: |kx-y+b|/√(k²+1)
     * @param pointA
     * @param pointB
     * @param pointC
     * @returns {number}
     */
    const GetVerticalDistance = (pointA: CanvasBasePoint, pointB: CanvasBasePoint, pointC: CanvasBasePoint) => {
        if (pointA.X === pointB.X) {
            // AB和y轴平行时
            // 先判断C点是否在AB之间
            const isBetween = (pointC.Y - pointA.Y) * (pointC.Y - pointB.Y) <= 0
            return isBetween ? Math.abs(pointC.X - pointA.X) : Infinity
        }

        if (pointA.Y === pointB.Y) {
            // AB和x轴平行时
            // 先判断C点是否在AB之间
            const isBetween = (pointC.X - pointA.X) * (pointC.X - pointB.X) <= 0
            return isBetween ? Math.abs(pointC.Y - pointA.Y) : Infinity
        }
        // 先根据直线公式y=kx+b求得k、b
        const k = (pointA.Y - pointB.Y) / (pointA.X - pointB.X)
        const b = pointA.Y - k * pointA.X
        // 根据公式 |kx-y+b|/√(k²+1) 求解
        const distance = Math.abs(k * pointC.X - pointC.Y + b) / Math.sqrt(k * k + 1)
        // 先判断C点是否在AB之间
        const isBetween = (pointC.X - pointA.X) * (pointC.X - pointB.X) <= 0
        return isBetween ? distance : Infinity
    }

    /**
     * @description 获取画布对象
     * @returns {HTMLCanvasElement}
     */
    const getCanvas = () => {
        return el
    }

    /**
     * @description 获取画布上下文
     * @returns {CanvasRenderingContext2D}
     */
    const getContext = () => {
        return ctx
    }

    return {
        Line,
        Rect,
        DrawImage,
        Point2Rect,
        FillRect,
        Circle,
        FillCircle,
        Text,
        ClearRect,
        IsInRect,
        isClockwise,
        getRelativePoint,
        Arrow,
        IsIntersect,
        GetVerticalDistance,
        getCanvas,
        getContext,
    }
}
