<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 10:41:06
 * @Description: 录像与回放时间轴组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-21 10:39:01
-->
<template>
    <div
        ref="$container"
        class="timeline"
        :style="{
            backgroundColor: `var(--timeline-bg-0${colorSet})`,
        }"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mousewheel="handleMouseWheel"
        @DOMMouseScroll="handleMouseWheel"
        @dblclick="handleDoubleClick"
    >
        <!-- 刻度Canvas -->
        <canvas
            ref="$canvas"
            class="scale"
        ></canvas>
        <!-- 录像条画布 -->
        <div class="container">
            <canvas
                ref="$recordCanvas"
                class="canvas"
            ></canvas>
        </div>
    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'

type ColorMap = {
    value: string
    color: string
    name: string
    children: string[]
}

type ChlListRecordItem = {
    startTime: number
    endTime: number
    event: string
}

type ChlList = {
    chlName: string
    chlId: string
    records: ChlListRecordItem[]
}

const prop = withDefaults(
    defineProps<{
        /**
         * @property 是否禁用缩放
         */
        disableZoom?: boolean
        /**
         * @property 是否禁用时间轴拖拽滑动
         */
        disableDrag?: boolean
        /**
         * @property 是否启用滑动选择时间范围
         */
        enableMask?: boolean
        /**
         * @peoperty 是否开启剪切功能
         */
        enableClip?: boolean
        /**
         * @propert 时间日期格式（day模式）
         */
        dayFormat?: string
        /**
         * @property 事件与颜色的映射表
         */
        colorsMap?: ColorMap[]
        /**
         * @property 通道列表
         */
        chlsList?: ChlList[]
        /**
         * @property 颜色集
         */
        colorSet?: number
    }>(),
    {
        disableZoom: false,
        disableDrag: false,
        enableMask: false,
        enableClip: false,
        dayFormat: 'HH:mm:ss',
        colorSet: 1,
    },
)

const emits = defineEmits<{
    (e: 'seek', pointerTime: number): void
    (e: 'dblclick', curTime: number, timeRange: [number, number], mode: string): void
    (e: 'changeMask', mask: [number, number]): void
    (e: 'clearMask'): void
    (e: 'setOffsetX', offsetX: number): void
    (e: 'setMaxCoordinateX', maxCoordinateX: number): void
    (e: 'setCurrentPointerTime', timeStr: string): void
    (e: 'clipRange', range: number[]): void
}>()

const dateTime = useDateTimeStore()

const $canvas = ref<HTMLCanvasElement>()
const $recordCanvas = ref<HTMLCanvasElement>()
const $container = ref<HTMLDivElement>()

let ctx: CanvasRenderingContext2D
let recordCtx: CanvasRenderingContext2D

let bgColor = '' // 画布背景色
let scaleLineColor = '' // 刻度线颜色
let scaleTextColor = '' // 刻度字体线颜色
let splitLineColor = '' // 通道间的分割线颜色
let pointerColor = '' // 指针颜色
let pointerTimeColor = '' // 指针显示的时间颜色
let mousemovingPointerColor = '' // 鼠标跟随指针颜色
let mousemovingTimeBgColor = '' // 鼠标跟随时间背景色
let mousemovingTimeTextColor = '' // 鼠标跟随时间文本颜色
let timeRangeMaskColor = '' // 时间范围遮罩颜色

// 通道列表
let chlList: ChlList[] = []

let colorMap: ColorMap[] = []

// 当前指针时间
let pointerTime = 0
// 当前指针在X轴方向的位置
let pointerX = 40
// 两端偏移值
const offsetWidth = 40
// // 时间轴实际绘制总长度
let timelineWidth = 0 // this.canvasWidth - this.offsetWidth * 2
// 定时器对象
let timer: NodeJS.Timeout | number = 0
// 随鼠标移动的指针x方向位置
let movePointerX = -1
// 随鼠标移动的指针y方向位置
let movePointerY = -1
// 鼠标是否按下
let isMouseDown = false
// 是否是拖拽移动
let isMouseMove = false
let autoPointer = false
// 是否点击在遮罩内
let isInnerMask = false
// 鼠标按下的坐标x
let mouseDownX = -1
// 夏令时开始那一天为23小时, 夏令时结束那一天为25小时
let oneDayHours = 24
// 初始状态分割刻度数量，按天-24, 按月-当月天数，按年-天数
let initScaleNum = 24
// 表示夏令时在几时开始（一般为凌晨两点）
let dstStartHour = 0
// 表示夏令时在几时结束（一般为凌晨两点）
let dstEndHour = 0
// 时间轴最小时长
let minTime = 0
// 时间轴最大时长
let maxTime = oneDayHours * 3600
// 当前模式 day-展示1天内刻度; month-展示1个月内刻度; year-展示指定连续月份内的刻度
let mode = 'day'
// 缩放比例配置项
let zoomList: number[] = []
// 缩放比例索引
let zoomIndex = 0
let zoom = 0
// 可见区域起始端时间
let startTime = 0
let secondPerScale = 0
let widthPerScale = 0
let totalTimeOfView = 0

// 剪切的时间范围
const clipRange = ref<number[]>([])

type TimeRange = {
    startTime: number
    endTime: number
}
// 滑动选择的时间范围
let timeRangeMask: [number, number] = [startTime, 0]
// 按刻度切割的时间范围 [{ startTime, endTime }]
let timeSplitList: TimeRange[] = []

let canvasWidth = 0
let canvasHeight = 40

/**
 * @description 初始化颜色值
 */
const initColor = () => {
    const style = getComputedStyle($container.value!)
    bgColor = style.getPropertyValue(`--timeline-bg-0${prop.colorSet}`) // 画布背景色
    scaleLineColor = style.getPropertyValue(`--timeline-scale-line-0${prop.colorSet}`) // 刻度线颜色
    scaleTextColor = style.getPropertyValue(`--timeline-scale-text-0${prop.colorSet}`) // 刻度字体线颜色
    splitLineColor = style.getPropertyValue(`--timeline-split-line-0${prop.colorSet}`) // 通道间的分割线颜色
    pointerColor = style.getPropertyValue(`--timeline-pointer-0${prop.colorSet}`) // 指针颜色
    pointerTimeColor = style.getPropertyValue(`--timeline-pointer-time-0${prop.colorSet}`) // 指针显示的时间颜色
    mousemovingPointerColor = style.getPropertyValue(`--timeline-moving-pointer-0${prop.colorSet}`) // 鼠标跟随指针颜色
    mousemovingTimeBgColor = style.getPropertyValue(`--timeline-moving-time-bg-0${prop.colorSet}`) // 鼠标跟随时间背景色
    mousemovingTimeTextColor = style.getPropertyValue(`--timeline-moving-time-text-0${prop.colorSet}`) // 鼠标跟随时间文本颜色
    timeRangeMaskColor = style.getPropertyValue(`--timeline-range-mask-0${prop.colorSet}`) // 时间范围遮罩颜色
}

/**
 * @description 根据公历年月日获取对应月份的第一天年月日
 * @param {string} dateStr YYYY/MM/DD
 * @returns {string} YYYY/MM/DD
 */
const getFirstDayByGreDate = (dateStr: string) => {
    const currentDate = dayjs(dateStr, 'YYYY/MM/DD')
    return dayjs().year(currentDate.year()).month(currentDate.month()).date(1).hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * @description 根据日期字符串获取对应时间戳
 * @param {String} 'YYYY/MM/DD hh:mm:ss'
 * @return {Number} 时间戳秒
 */
const getTimestamp = (dateStr: string) => {
    return dayjs(dateStr, 'YYYY/MM/DD hh:mm:ss').unix()
}

/**
 * @description 获取n个月后的第一天, n <= 12
 * 比如: getLastDateAfterNMonths('2021/03/01 00:00:00', 1) => '2021/04/01 00:00:00'
 * @param {String} 'YYYY/MM/DD hh:mm:ss'
 * @param {Number} n
 * @returns {String} 'YYYY/MM/DD hh:mm:ss'
 */

const getLastDateAfterNMonths = (dateStr: string, n: number) => {
    return dayjs(dateStr, 'YYYY/MM/DD hh:mm:ss').add(n, 'month').format('YYYY/MM/DD hh:mm:ss')
}

/**
 * @description 根据秒时间戳获取日期字符串
 * @param {Number} 时间戳秒
 * @return {String} 'yyyy/mm/dd 00:00:00'
 */
const getDateByTimestamp = (timestamp: number) => {
    return formatDate(timestamp * 1000, 'YYYY/MM/DD HH:mm:ss')
}

/**
 * @description 根据秒时间戳获取当月第一天和最后一天秒时间戳
 * @param {Number} 秒时间戳
 * @return {Array<Number>} [1614528000, 1617206399]
 */
const getTimestampRangeOfMonth = (timestamp: number): [number, number] => {
    const dateStr = getDateByTimestamp(timestamp)
    const firstDate = dateStr.replace(/\/\d+\s\S+/, '/01 00:00:00')
    const lastDatestamp = getTimestamp(getLastDateAfterNMonths(firstDate, 1)) - 1
    return [getTimestamp(firstDate), lastDatestamp]
}

type ModeConfig = {
    mode?: string
    startDate?: string
    monthNum?: number
}

/**
 * @description 设置当前模式
 * @param {ModeConfig} modeConfig
 * @param {number} newPointerTime
 */
const setMode = (modeConfig: ModeConfig, newPointerTime?: number) => {
    // startDate - 起始年月日（公历），mode为year/month时必填，例：'2021/03/01'
    // monthNum - 跨月数量，mode为year时必填，例：2, 表示只显示2个月的时间
    mode = modeConfig?.mode || 'day'
    let startDate = modeConfig?.startDate || ''
    const monthNum = modeConfig?.monthNum || 1

    initScaleNum = oneDayHours
    if (mode === 'day') {
        if (!startDate) {
            minTime = 0
            maxTime = oneDayHours * 3600
        } else {
            // dayjs(startDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').valueOf() / 1000 //
            const startTime = new Date(startDate + ' 00:00:00').getTime() / 1000
            const endTime = startTime + 3600 * oneDayHours - 1
            minTime = startTime
            maxTime = endTime
        }
        pointerTime = newPointerTime || minTime
        zoomList = [oneDayHours, 18, 12, 6, 3, 1, 0.6]
    } else {
        startDate = getFirstDayByGreDate(startDate)
        const startTime = getTimestamp(startDate)
        const n = mode === 'month' ? 1 : monthNum
        const endDate = getLastDateAfterNMonths(startDate, n)
        const endTime = getTimestamp(endDate)
        minTime = startTime
        maxTime = endTime
        const hours = Math.floor((endTime - startTime) / 3600)
        initScaleNum = hours / 24
        zoomList = [hours] // 按月/按年显示不支持缩放
    }
    zoomIndex = 0 // 缩放比例索引
    startTime = minTime // 可见区域起始端时间
    if (autoPointer) {
        pointerTime = startTime
    }
    init()
}

/**
 * @description 初始化画布，每次重绘需执行一次该命令
 */
const init = () => {
    clear()
    canvasWidth = $canvas.value!.width
    canvasHeight = 40
    zoom = zoomList[zoomIndex]
    secondPerScale = (zoom * 3600) / initScaleNum
    timelineWidth = canvasWidth - offsetWidth * 2
    widthPerScale = timelineWidth / initScaleNum
    totalTimeOfView = Math.round(timelineWidth * (secondPerScale / widthPerScale))

    // 填充画布背景
    drawRect(ctx, 0, 0, canvasWidth, canvasHeight, bgColor)
    drawRect(ctx, offsetWidth, 0, timelineWidth, offsetWidth, bgColor)
    // 绘制基准轴线
    drawLine(ctx, 0, 39, canvasWidth, 39, scaleLineColor)
    // 绘制所有刻度
    drawScale()
    // 绘制录像条
    drawRecord()
    // 绘制指针
    drawPointer()
    // 如果鼠标停留在画布上，则绘制跟随指针
    if (movePointerX >= 0 && movePointerX !== pointerX) {
        drawMovingWithMousePointer(movePointerX, movePointerY)
    }
    // 如果有选择时间范围遮罩层，则进行遮罩层绘制
    if (timeRangeMask && timeRangeMask.length > 0) {
        drawTimeRangeMask(timeRangeMask[0], timeRangeMask[1])
    }
}

/**
 * @description 鼠标进入事件
 */
const handleMouseOver = () => {
    if (prop.disableDrag) {
        return
    }
}

/**
 * @description 鼠标离开事件
 */
const handleMouseOut = () => {
    movePointerX = -1
    movePointerY = -1
    init()
}

/**
 * @description 鼠标点下事件
 * @param {MouseEvent} e
 */
const handleMouseDown = (e: MouseEvent) => {
    autoPointer = false
    isMouseDown = true
    mouseDownX = e.offsetX
    if (prop.enableMask) {
        const time = getTimeByX(mouseDownX)
        // 是否点击在遮罩内
        isInnerMask = time >= timeRangeMask[0] && time <= timeRangeMask[1]
        if (!isInnerMask) {
            clearTimeRangeMask()
            emits('clearMask')
        }
    }
    emits('setOffsetX', e.offsetX)
}

/**
 * @description 鼠标抬起事件，在这里判断是拖拽还是点击事件
 * @param {MouseEvent} e
 */
const handleMouseUp = (e: MouseEvent) => {
    isMouseDown = false
    isInnerMask = false
    if (isMouseMove && (!prop.disableDrag || prop.enableMask)) {
        // 拖拽
        isMouseMove = false
    } else {
        // 点击
        if (!isPointerVisible(e.offsetX)) return
        pointerTime = getTimeByX(e.offsetX)

        // 发布当前指针时间
        emits('seek', pointerTime)
        init()
    }
    $container.value!.style.cursor = 'pointer'
}

/**
 * @description 鼠标移动事件:拖拽移动/不拖拽移动
 * @param {MouseEvent} e
 */
const handleMouseMove = (e: MouseEvent) => {
    if (isMouseDown) {
        const translateX = e.offsetX - mouseDownX
        if (Math.abs(translateX) > 5) {
            isMouseMove = true
            if (!prop.disableDrag) {
                // 拖拽滑动时间轴
                mouseDownX = e.offsetX
                translateOnX(-translateX)
                $container.value!.style.cursor = 'grab'
            } else if (prop.enableMask) {
                const mouseDownTime = getTimeByX(mouseDownX)
                const mouseEndTime = getTimeByX(e.offsetX)
                let startTime = mouseDownTime < minTime ? minTime : mouseDownTime
                let endTime = mouseEndTime > maxTime ? maxTime : mouseEndTime
                if (isInnerMask) {
                    // 如果在遮罩内，则平移当前遮罩
                    const offsetTime = mouseEndTime - mouseDownTime
                    startTime = timeRangeMask[0] + offsetTime
                    endTime = timeRangeMask[1] + offsetTime
                    if (startTime < minTime) {
                        startTime = minTime
                        endTime = timeRangeMask[1]
                    }
                    if (endTime > maxTime) {
                        endTime = maxTime
                        startTime = timeRangeMask[0]
                    }
                    mouseDownX = e.offsetX
                } else {
                    // 拖拽绘制时间范围遮罩
                    if (translateX < 0) {
                        startTime = mouseEndTime
                        endTime = mouseDownTime
                    }
                    if (startTime < minTime) {
                        startTime = minTime
                    }
                    if (endTime > maxTime) {
                        endTime = maxTime
                    }
                }
                clearTimeRangeMask()
                drawTimeRangeMask(startTime, endTime)
                handleMaskChange()
            }
        }
    } else {
        movePointerX = e.offsetX
        movePointerY = e.offsetY
        init()
    }
}

/**
 * @description 鼠标双击事件
 * @param e
 */
const handleDoubleClick = () => {
    const curTime = Math.floor(pointerTime)
    const timeRange = getPointerTimeRange()
    emits('dblclick', curTime, timeRange, mode)
}

/**
 * @description 处理鼠标滚动事件，需要对火狐浏览器兼容处理， 具体差异如下：
 * 1、其他浏览器监听mousewheel；而Firefox监听DOMMouseScroll
 * 2、其它浏览器向上滚动为正值(+120) 、向下滚动为负值(-120) ；而Firefox向上滚动为负值(-5) ，向下滚动为正值(+5)
 * 3、其它浏览器保存在event对象中的wheelDelta属性；而Firefox对滚轮滚动的值保存在event对象中的detail属性里
 * @param {WheelEvent} e
 */
const handleMouseWheel = (e: WheelEvent) => {
    if (!prop.disableZoom) {
        e.preventDefault()
        const wheelValue = ((e as any).wheelDelta as number) || -e.detail * 24
        const time = getTimeByX(e.offsetX) - startTime
        // 阻止鼠标滚轮在00:00以前位置和23:59:59以后的位置触发缩放，导致时间显示异常
        if (time < 0 || time > oneDayHours * 3600) return
        // 向上滚动
        if (wheelValue > 0) zoomOut(time + startTime)
        // 向下滚动
        if (wheelValue < 0) zoomIn(time + startTime)
    }
}

/**
 * @description 根据当前指针时间戳
 */
const getPointerTime = () => {
    return Math.floor(pointerTime)
}

/**
 * @description 根据当前指针时间戳获取时间范围
 * 按天时：时间范围为当天起止时间戳（秒）
 * 按月时：时间范围为命中日期当天起止时间戳（秒）
 * 按年时：时间范围为命中月份起止时间戳（秒）
 */
const getPointerTimeRange = () => {
    let timeRange: [number, number] = [0, 0]
    const curTime = pointerTime
    const startDate = getDateByTimestamp(curTime)
    if (mode === 'day') {
        timeRange = [minTime, maxTime]
    } else if (mode === 'month') {
        const startTimestamp = getTimestamp(startDate.split(' ')[0] + ' 00:00:00')
        const endTimestamp = getTimestamp(startDate.split(' ')[0] + ' 23:59:59')
        timeRange = [startTimestamp, endTimestamp]
    } else if (mode === 'year') {
        timeRange = getTimestampRangeOfMonth(curTime)
    }
    return timeRange
}

/**
 * @description 根据秒时间戳范围, 绘制遮罩层
 * @param {number} startTime 秒
 * @param {number} endTime 秒
 */
const drawTimeRangeMask = (startTime: number, endTime: number) => {
    const startX = getXByTime(startTime)
    const endX = getXByTime(endTime)
    drawRect(recordCtx, startX, 0, endX - startX, 30, timeRangeMaskColor)
    timeRangeMask = [Math.floor(startTime), Math.floor(endTime)]
}

/**
 * @description 遮罩层绘制回调
 */
const handleMaskChange = () => {
    // const formatStart = formatTime(timeRangeMask[0], 'HH:mm:ss') // 格式化为"00:00:00"
    // const formatEnd = formatTime(timeRangeMask[1], 'HH:mm:ss')
    emits('changeMask', timeRangeMask)
    // this.onmaskchange(this.timeRangeMask, [formatStart, formatEnd])
}

/**
 * @description 清空遮罩层
 */
const clearTimeRangeMask = () => {
    timeRangeMask = [0, 0]
    init()
}

/**
 * @description 获取遮罩层起止时间
 */
const getTimeRangeMask = () => {
    return timeRangeMask
}

/**
 * 根据秒时间戳范围, 绘制遮罩层
 */
// const enableTimeRangeMask = (enable) => {
//     this.enableMask = enable
// }

/**
 * @description 绘制剪切层, 形状如下：
 * start |XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX| end
 * @param {number} index
 */
const drawClipRange = (index: number) => {
    if (!clipRange.value.length) {
        return
    }
    if (clipRange.value.length === 1) {
        const startX = getXByTime(clipRange.value[0])
        const startY = 25 * index
        drawLine(recordCtx, startX, startY, startX, startY + 28, '#f00', 2)
    } else {
        const startX = getXByTime(clipRange.value[0])
        const endX = getXByTime(clipRange.value[1])
        const startY = 5 + 25 * index
        const height = 10
        const endY = startY + height
        let xDiff = endX - startX
        xDiff = xDiff > height ? height : xDiff
        // 绘制矩形背景
        drawRect(recordCtx, startX, 5 + 25 * index, endX - startX, 10, '#fff')
        // 绘制交叉网格
        for (let i = startX; i < endX; i += xDiff) {
            let _endX = i + xDiff
            if (_endX > endX) {
                if (_endX < endX + 2.5) {
                    _endX = endX
                } else {
                    break
                }
            }
            drawLine(recordCtx, i, startY, _endX, endY, '#f11', 0.5)
            drawLine(recordCtx, i, endY, _endX, startY, '#f11', 0.5)
        }
    }
}

/**
 * @description 设置剪切开始时间（秒）
 * @param {number} time
 */
const setClipStart = (time = getPointerTime()) => {
    if (clipRange.value.length === 2 && time >= clipRange.value[1]) {
        // 如果开始时间大于等于当前剪切的结束时间，则先清空剪切层
        clipRange.value = []
    }
    clipRange.value[0] = time
    init()
}

/**
 * @description 设置剪切结束时间（秒）
 * @param {number} time
 */
const setClipEnd = (time = getPointerTime()) => {
    if (clipRange.value.length === 0) {
        // 如果没有设置开始时间，则直接返回
        return
    }
    if (clipRange.value.length === 1 && time < clipRange.value[0]) {
        // 如果当前只有开始时间，且结束时间小于当前剪切的开始时间，则直接返回
        return
    }
    if (time < clipRange.value[0]) {
        // 如果结束时间小于当前剪切的开始时间，则移除结束时间
        clipRange.value.pop()
    } else if (time === clipRange.value[0]) {
        // 如果结束时间等于当前剪切的开始时间，则清空剪切层
        clipRange.value = []
    } else {
        clipRange.value[1] = time
    }
    init()
}

/**
 * @description 获取剪切起止时间
 */
// const getClipRange = () => {
//     return clipRange.value
// }

/**
 * @description 清空剪切
 */
const clearClipRange = () => {
    clipRange.value = []
    init()
}

/**
 * 开启/关闭剪切功能
 */
// const setClipEnable = function (enable) {
//     this.enableClip = enable
// }

/**
 * @description 获取按刻度切割的时间列表
 */
const getTimeSplitList = () => {
    return timeSplitList
}

/**
 * @description 根据当前指针命中的小时，获取按分钟切割的时间列表
 */
const getMinuteSplitList = () => {
    const scaleIndex = Math.floor((pointerTime - minTime) / secondPerScale)
    const targetItem = timeSplitList[scaleIndex]
    const list = []
    for (let i = targetItem.startTime; i < targetItem.endTime; i += 60) {
        list.push({
            startTime: i,
            endTime: i + 59,
        })
    }
    return list.slice(0, 60)
}

/**
 * @description 获取时间轴最小时间
 */
const getMinTime = () => {
    return minTime
}

/**
 * @description 获取时间轴最大时间
 */
const getMaxTime = () => {
    return maxTime
}

/**
 * @description 根据画布父容器宽高重新设置画布大小
 */
const setCanvasSize = () => {
    const width = $container.value!.offsetWidth
    const height = $container.value!.offsetHeight
    $canvas.value!.width = width
    $recordCanvas.value!.width = width
    $recordCanvas.value!.height = chlList.length * 28 < height - 40 ? height - 40 : chlList.length * 28
}

/**
 * @description 画直线
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {string} color
 * @param {number} width
 */
const drawLine = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color = scaleLineColor, width = 1) => {
    ctx.beginPath()
    ctx.moveTo(startX + 0.5, startY + 0.5)
    ctx.lineTo(endX + 0.5, endY + 0.5)
    ctx.strokeStyle = color
    ctx.lineWidth = width + 0.5
    ctx.stroke()
}

/**
 * @description 画矩形
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX
 * @param {number} startY
 * @param {number} width
 * @param {number} height
 * @param {string} bgColor
 */
const drawRect = (ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number, bgColor: string) => {
    ctx.fillStyle = bgColor
    ctx.fillRect(startX, startY, width, height)
}

/**
 * @description 画文字
 * @param {string} text
 * @param {number} startX
 * @param {number} startY
 * @param {string} fillStyle
 * @param {string} font
 */
const drawText = (ctx: CanvasRenderingContext2D, text: string, startX: number, startY: number, fillStyle = '#fff', font = '12px') => {
    ctx.fillStyle = fillStyle
    ctx.font = font + ' Arial'
    ctx.fillText(text, startX + 0.5, startY + 0.5)
}

/**
 * @description 清除时间轴canvas画布
 */
const clear = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    recordCtx.clearRect(0, 0, $recordCanvas.value!.width, $recordCanvas.value!.height)
}

/**
 * @description 将秒转化成时间字符串，输出格式：'00:00'
 * @param {number} second
 * @param {string} format
 */
const formatTime = (second: number, format = 'HH:mm') => {
    if (minTime > 0) {
        return dayjs.utc('1970-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').add(second, 'second').local().format(format)
        // return dayjs.utc(second * 1000).format(format)
    } else {
        return dayjs.utc('1970-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').add(second, 'second').format(format)
        // return dayjs.utc(0).add(second, 'second').format(format)
    }
}

/**
 * @description 根据时间计算x坐标
 * @param {Number} time
 */
const getXByTime = (time: number) => {
    if (time < startTime) return offsetWidth
    if (time > startTime + totalTimeOfView) return canvasWidth - offsetWidth
    return (time - startTime) * (widthPerScale / secondPerScale) + offsetWidth
}

/**
 * @description 根据x坐标计算时间
 * @param {Number} x
 */
const getTimeByX = (x: number) => {
    return (x - offsetWidth) * (secondPerScale / widthPerScale) + startTime
}

/**
 * @description 判断坐标是否在可视区
 * @param {Number} x
 */
const isPointerVisible = (x: number) => {
    return x >= offsetWidth && x <= canvasWidth - offsetWidth
}

/**
 * @description 绘制刻度
 */
const drawScale = () => {
    // 完整时间轴（包含放大后的超出部分）刻度数
    const scaleNum = (maxTime - minTime) / secondPerScale + 1
    // 起始刻度的索引
    const startIndex = Math.ceil((startTime - minTime) / secondPerScale)
    // 起始刻度的时间
    let startScaleTime = startIndex * secondPerScale + minTime
    // 第一个刻度到起点之间的宽度
    let startScaleX = ((startScaleTime - startTime) / secondPerScale) * widthPerScale
    timeSplitList = []
    for (let i = startIndex; i < scaleNum; i++) {
        // +0.5是因为计算精度问题
        if (startScaleX > timelineWidth + 0.5) break
        if (mode === 'day') {
            drawScaleByDay(startScaleX, startScaleTime, i)
        } else if (mode === 'month') {
            drawScaleByMonth(startScaleX, startScaleTime)
        } else if (mode === 'year') {
            drawScaleByYear(startScaleX, startScaleTime)
        }
        startScaleTime += secondPerScale
        startScaleX += widthPerScale
    }
    timeSplitList.pop()
}

/**
 * @description 更新分割线列表
 * @param {number} startTime
 */
const updateTimeSplitList = (startTime: number) => {
    timeSplitList.push({ startTime: startTime, endTime: 0 })
    const len = timeSplitList.length
    if (len > 1) {
        timeSplitList[len - 2].endTime = startTime - 1
    }
}

/**
 * @description 按天绘制刻度线和时间
 * @param {number} startScaleX
 * @param {number} startScaleTime
 * @param {number} i
 */
const drawScaleByDay = (startScaleX: number, startScaleTime: number, i: number) => {
    let timeStr = ''
    if (oneDayHours == 24) {
        if (i % 2 === 0) {
            // 长刻度
            drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
            timeStr = formatTime(startScaleTime)
            drawText(ctx, timeStr === '24:00' ? '23:59' : timeStr, startScaleX + 27, 28, scaleTextColor, '11px')
        } else {
            // 短刻度
            drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 35)
        }
    } else {
        if (oneDayHours == 23 && startScaleTime >= 3600 * dstStartHour) {
            // 夏令时开始当天
            timeStr = formatTime(startScaleTime + 3600)
        } else if (oneDayHours == 25 && startScaleTime >= 3600 * dstEndHour) {
            // 夏令时结束当天
            timeStr = formatTime(startScaleTime - 3600)
        } else {
            timeStr = formatTime(startScaleTime)
        }
        const dstStartOrEndHour = dstStartHour ? dstStartHour : dstEndHour
        if (i <= dstStartOrEndHour) {
            if (i == dstStartOrEndHour) {
                if (dstStartOrEndHour % 2 === 0) {
                    // 短刻度
                    drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 35)
                } else {
                    // 长刻度
                    drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
                }
            } else {
                if (i % 2 === 0) {
                    // 长刻度
                    drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
                } else {
                    // 短刻度
                    drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 35)
                }
            }
            drawText(ctx, timeStr === '24:00' ? '23:59' : timeStr, startScaleX + 27, 28, scaleTextColor, '11px')
        } else {
            if ((i - 1) % 2 === 0) {
                // 长刻度
                drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
                drawText(ctx, timeStr === '24:00' ? '23:59' : timeStr, startScaleX + 27, 28, scaleTextColor, '11px')
            } else {
                // 短刻度
                drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 35)
            }
        }
    }
    updateTimeSplitList(startScaleTime)
}

/**
 * @description 按月绘制刻度线和时间
 * @param {number} startScaleX
 * @param {number} startScaleTime
 */
const drawScaleByMonth = (startScaleX: number, startScaleTime: number) => {
    drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
    const dateStr = getDateByTimestamp(startScaleTime)
    const day = Number(/(\d+)\s/.exec(dateStr)![1])
    const startX = day < 10 ? startScaleX + 36 : startScaleX + 35
    drawText(ctx, day + '', startX, 28, scaleTextColor, '11px')
    updateTimeSplitList(startScaleTime)
}

/**
 * @description 按年绘制刻度线和时间
 * @param {number} startScaleX
 * @param {number} startScaleTime
 */
const drawScaleByYear = (startScaleX: number, startScaleTime: number) => {
    const dateStr = getDateByTimestamp(startScaleTime)
    const arr = dateStr.split(' ')[0].split('/')
    if (Number(arr[2]) === 1) {
        let ym = arr[0] + '/' + arr[1]
        if (dateTime.dateTimeFormat.indexOf('DD/') >= 0) {
            // 出现'dd/'说明是"日/月/年"或者"月/日/年"格式
            ym = arr[1] + '/' + arr[0]
        }
        drawLine(ctx, startScaleX + offsetWidth, 40, startScaleX + offsetWidth, 32)
        drawText(ctx, ym, startScaleX + 20, 28, scaleTextColor, '11px')
        updateTimeSplitList(startScaleTime)
    }
}

/**
 * @description 绘制录像条
 */
const drawRecord = () => {
    if (!chlList.length) return
    $recordCanvas.value!.height = chlList.length * 28 < $container.value!.offsetHeight - 40 ? $container.value!.offsetHeight - 40 : chlList.length * 28
    // EVENT_COLOR_MAP: [{ key: 'MANUAL', color: '#00FF00', name: '手动', children: [] }, ...]
    // 按事件类型列表倒序遍历，优先级高的事件最后绘制，确保优先级高的彩条覆盖优先级低的彩条
    const coordinateArr: number[] = []
    colorMap.forEach((item) => {
        const color = item.color
        const key = item.value
        const children = item.children || []
        chlList.forEach((chl, index) => {
            if (!chl) return
            // 绘制录像段
            const records = chl.records
            if (!(records && records.length > 0)) return
            // 一个通道可能包含多个录像段
            records.forEach((record) => {
                const type = record.event
                if (key !== type && children.indexOf(type) < 0) return
                const startX = getXByTime(record.startTime / 1000)
                if (!isPointerVisible(startX)) return
                const endX = getXByTime(record.endTime / 1000)
                drawRect(recordCtx, startX, 5 + 25 * index, endX - startX, 20, color)
                coordinateArr.push(startX, endX)
            })
        })
    })
    const maxCoordinateX = Math.max.apply(null, coordinateArr)
    emits('setMaxCoordinateX', maxCoordinateX)
    chlList.forEach((chl, index) => {
        // 绘制通道名
        const serialNum = index + 1 > 9 ? index + 1 : '0' + (index + 1)
        drawText(recordCtx, serialNum + '', 15, 18 + 25 * index, scaleLineColor)
        // 绘制剪切层
        if (chl) drawClipRange(index)
        // 绘制通道之间的分割线
        if (chlList.length === 1 && minTime > 0) {
            return
        }
        const positonY = 28 + 25 * index
        drawLine(recordCtx, 0, positonY, canvasWidth, positonY, splitLineColor)
    })
    // if (autoPointer) {
    //     pointerTime = chlList[0].records[0].startTime
    // }
}

/**
 * @description 绘制指针
 */
const drawPointer = () => {
    if (pointerTime >= startTime && pointerTime <= startTime + totalTimeOfView) {
        // 计算当前指针的位置
        pointerX = (pointerTime - startTime) * (widthPerScale / secondPerScale) + offsetWidth
        drawLine(ctx, pointerX, 0, pointerX, canvasHeight, pointerColor, 2)
        drawLine(recordCtx, pointerX, 0, pointerX, $recordCanvas.value!.height, pointerColor, 2)
        let timeStr = ''
        const startY = 12
        if (mode === 'day') {
            if (oneDayHours == 24) {
                timeStr = formatTime(pointerTime, prop.dayFormat)
            } else {
                if (oneDayHours == 23 && pointerTime >= 3600 * dstStartHour) {
                    // 夏令时开始当天
                    timeStr = formatTime(pointerTime + 3600, prop.dayFormat)
                } else if (oneDayHours == 25 && pointerTime >= 3600 * dstEndHour) {
                    // 夏令时结束当天
                    timeStr = formatTime(pointerTime - 3600, prop.dayFormat)
                } else {
                    timeStr = formatTime(pointerTime, prop.dayFormat)
                }
            }
        } else {
            timeStr = formatTime(pointerTime, dateTime.dateTimeFormat.split(' ')[0])
        }
        let startX = pointerX - 3.4 * timeStr.length
        startX = startX < 0 ? 0 : startX
        drawText(ctx, timeStr, startX, startY, pointerTimeColor, '14px')
        emits('setCurrentPointerTime', timeStr)
    }
}

/**
 * @description 绘制随鼠标运动的指针
 * @param {Number} x 画布中的横坐标位置
 */
const drawMovingWithMousePointer = (x: number, y: number) => {
    if (x < offsetWidth || x > canvasWidth - offsetWidth) {
        return
    }
    // 绘制指针
    drawLine(ctx, x, 0, x, canvasHeight, mousemovingPointerColor)
    drawLine(recordCtx, x, 0, x, $recordCanvas.value!.height, mousemovingPointerColor)
    // 绘制时间
    const time = getTimeByX(x) === maxTime ? maxTime - 1 : getTimeByX(x)
    let timeStr = ''
    let rectY = y - 17
    const rectH = 24
    if (mode === 'day') {
        if (oneDayHours == 24) {
            timeStr = formatTime(time, prop.dayFormat)
        } else {
            if (oneDayHours == 23 && time >= 3600 * dstStartHour) {
                // 夏令时开始当天
                timeStr = formatTime(time + 3600, prop.dayFormat)
            } else if (oneDayHours == 25 && time >= 3600 * dstEndHour) {
                // 夏令时结束当天
                timeStr = formatTime(time - 3600, prop.dayFormat)
            } else {
                timeStr = formatTime(time, prop.dayFormat)
            }
        }
    } else {
        timeStr = formatTime(time, dateTime.dateTimeFormat.split(' ')[0])
    }
    let textX = x - 4 * timeStr.length
    let rectX = x - 4 * timeStr.length - 5
    const rectW = 9 * timeStr.length
    textX = textX < 0 ? 0 : textX
    y = y < 17 ? 17 : y
    rectX = rectX < 0 ? 0 : rectX
    rectY = rectY < 0 ? 0 : rectY
    drawRect(recordCtx, rectX, rectY, rectW, rectH, mousemovingTimeBgColor)
    drawText(recordCtx, timeStr, textX, y, mousemovingTimeTextColor, '16px')
    movePointerX = x
}

/**
 * @description 指针开始运动
 * @param {Number} step 秒/次
 * @param {Number} speed 速度, 0.5, 1, 2, 3...
 */
const play = (step = 1, speed = 1) => {
    clearInterval(timer)
    // NOTICE 定时器的时间不可靠
    timer = setInterval(() => {
        pointerTime = pointerTime + step
        // 如果当前指针时间超出当前可视区范围，则将起始点时间设为当前指针时间
        if (pointerTime > startTime + totalTimeOfView) {
            startTime = pointerTime
        }
        // 如果指针到达最大时间长度，清除定时器
        if (Math.floor(pointerTime) === maxTime - 1) {
            clearInterval(timer)
        }
        init()
    }, 1000 / speed)
}

/**
 * @description 指针停止运动
 */
const stop = () => {
    clearInterval(timer)
}

/**
 * @description 放大，以鼠标停留位置为中心
 * @param {number} time 秒
 */
const zoomOut = (time: number) => {
    if (zoomIndex === zoomList.length - 1) return
    zoomIndex++
    zoom = zoomList[zoomIndex]
    secondPerScale = (zoom * 3600) / initScaleNum
    const pastTime = (movePointerX - offsetWidth) * (secondPerScale / widthPerScale)
    startTime = time - pastTime
    init()
}

/**
 * @description 缩小，以鼠标停留位置为中心
 * @param {number} time 秒
 */
const zoomIn = (time: number) => {
    if (zoomIndex === 0 && startTime === minTime) return
    if (zoomIndex === 0 && startTime !== minTime) {
        startTime = minTime
        init()
        return
    }
    zoomIndex--
    zoom = zoomList[zoomIndex]
    secondPerScale = (zoom * 3600) / initScaleNum
    const pastTime = (movePointerX - offsetWidth) * (secondPerScale / widthPerScale)
    startTime = time - pastTime
    if (startTime < minTime) startTime = minTime
    init()
}

/**
 * @description 左右平移
 * @param offsetX 像素
 */
const translateOnX = (offsetX: number) => {
    if (offsetX === 0) return
    // 计算平移的时间长度，取绝对值
    const offsetTime = Math.abs(offsetX * (secondPerScale / widthPerScale))
    // 向左平移（刻度越来越大）
    if (offsetX > 0) {
        if (startTime + totalTimeOfView === maxTime) return
        if (startTime + totalTimeOfView + offsetTime <= maxTime) {
            startTime += offsetTime
        } else {
            startTime = maxTime - totalTimeOfView
        }
        init()
    }
    // 向右平移（刻度越来越小）
    if (offsetX < 0) {
        if (startTime === 0) return
        if (startTime - offsetTime >= 0) {
            startTime -= offsetTime
        } else {
            startTime = 0
        }
        init()
    }
}

/**
 * @description 设置播放时间点
 * @param {number} time 秒
 */
const setTime = (time: number) => {
    pointerTime = time
    autoPointer = false
    init()
}

/**
 * @description 获取当前播放时间
 */
const getTime = () => {
    return pointerTime
}

/**
 * @description 前进
 * @param {Number} second 前进时间 秒
 */
const playForward = (second: number) => {
    const time = pointerTime + second >= maxTime ? maxTime : pointerTime + second
    setTime(time)
}

/**
 * @description 后退
 * @param {Number} second 后退时间 秒
 */
const playBack = (second: number) => {
    const time = pointerTime - second <= 0 ? 0 : pointerTime - second
    setTime(time)
}

/**
 * @description 设置夏令时的时间配置
 * this.oneDayHours 夏令时开始那一天为23小时, 夏令时结束那一天为25小时
 * this.dstStartHour 表示夏令时在几时开始（一般为凌晨两点）
 * this.dstEndHour 表示夏令时在几时结束（一般为凌晨两点）
 * @param {String} currentDayStartTime 当天时间字符串 2023/10/29 00:00:00
 */
const setDstDayTime = (currentDayStartTime: string) => {
    const timeDay = currentDayStartTime.split(' ')[0]
    const timeHourList = [
        '00:00:00',
        '01:00:00',
        '02:00:00',
        '03:00:00',
        '04:00:00',
        '05:00:00',
        '06:00:00',
        '07:00:00',
        '08:00:00',
        '09:00:00',
        '10:00:00',
        '11:00:00',
        '12:00:00',
        '13:00:00',
        '14:00:00',
        '15:00:00',
        '16:00:00',
        '17:00:00',
        '18:00:00',
        '19:00:00',
        '20:00:00',
        '21:00:00',
        '22:00:00',
        '23:00:00',
    ]
    oneDayHours = 24
    dstStartHour = 0
    dstEndHour = 0
    for (let i = 1; i < timeHourList.length; i++) {
        const timeStrPre = timeDay + ' ' + timeHourList[i - 1]
        const timeStrNext = timeDay + ' ' + timeHourList[i + 1]
        const timeStrCur = timeDay + ' ' + timeHourList[i]
        if (isDST(timeStrCur) && !isDST(timeStrPre) && isDST(timeStrNext)) {
            // timeStrCur为夏令时开始时间（当天为23小时）
            oneDayHours = 23
            dstStartHour = i
            break
        }
        if (!isDST(timeStrCur) && isDST(timeStrPre) && !isDST(timeStrNext)) {
            // timeStrCur为夏令时结束时间（当天为25小时）
            oneDayHours = 25
            dstEndHour = i
            break
        }
    }
}

/**
 * @description 更新通道列表数据
 * @param {Boolean} autoPointer 指针是否自动定位到最早的录像条位置
 */
const updateChlList = (newChlList: ChlList[], newAutoPointer: boolean, pageType: 'live' | 'record') => {
    chlList = newChlList
    autoPointer = newAutoPointer
    if (pageType == 'record') {
        const records = chlList.map((item) => item.records).flat()
        if (newChlList.length && records.length) {
            const startDate = formatDate(records[0].startTime, 'YYYY/MM/DD')
            setMode({ mode: 'day', startDate: startDate }, pointerTime)
        } else {
            setMode({ mode: 'day' }, pointerTime)
        }
    } else {
        init()
    }
}

/**
 * @description 获取通道列表数据
 */
// const getChlList = () => {
//     return chlList
// }

/**
 * @description 重置画布，清空日志，指针归零
 */
const clearData = () => {
    // chlList.splice(0, chlList.length)
    pointerTime = minTime
    timeRangeMask = [0, 0]
    clipRange.value = []
    init()
}

/**
 * @description 设置录像条事件-颜色映射
 * @param {Array} newColorMap
 */
const setColorMap = (newColorMap: ColorMap[]) => {
    colorMap = newColorMap
}

/**
 * @description 获取冬夏令时切换日小时数
 */
const getDST = () => {
    return {
        hours: oneDayHours,
        start: dstStartHour,
        end: dstEndHour,
    }
}

/**
 * @description 重置画布大小，重绘当前状态
 */
const resize = new ResizeObserver(() => {
    setCanvasSize()
    init()
})

onMounted(() => {
    initColor()

    if (prop.chlsList) {
        chlList = prop.chlsList
    }
    if (prop.colorsMap) {
        colorMap = prop.colorsMap
    }
    const width = $container.value!.offsetWidth
    const height = $container.value!.offsetHeight
    $canvas.value!.width = width
    $canvas.value!.height = 40 // 时间轴画布高固定为40
    ctx = $canvas.value!.getContext('2d')!
    canvasWidth = width
    canvasHeight = 40

    $recordCanvas.value!.style.width = '100%'
    $recordCanvas.value!.style.height = height - 40 + 'px'
    $recordCanvas.value!.width = width
    $recordCanvas.value!.height = chlList.length * 28 < height - 40 ? height - 40 : chlList.length * 28
    recordCtx = $recordCanvas.value!.getContext('2d')!

    setMode({ mode: 'day' })
    resize.observe($container.value!)
})

onBeforeUnmount(() => {
    resize.disconnect()
})

watch(
    clipRange,
    (newVal) => {
        emits('clipRange', newVal)
    },
    {
        deep: true,
    },
)

defineExpose<TimelineInstance>({
    updateChlList,
    play,
    stop,
    getTime,
    setTime,
    playForward,
    playBack,
    // getClipRange,
    clearClipRange,
    clearTimeRangeMask,
    drawTimeRangeMask,
    setDstDayTime,
    setClipStart,
    setClipEnd,
    getMinuteSplitList,
    clearData,
    getMinTime,
    getMaxTime,
    setColorMap,
    getTimeSplitList,
    // getChlList,
    getPointerTime,
    getTimeRangeMask,
    getDST,
    setMode,
})
</script>

<style lang="scss" scoped>
.timeline {
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.scale {
    width: 100%;
    height: 40px;
    vertical-align: top;
}

.container {
    position: relative;
    width: 100%;
    min-height: calc(100% - 40px);
    overflow-x: hidden;
    overflow-y: auto;
    vertical-align: top;
}

.canvas {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
</style>
