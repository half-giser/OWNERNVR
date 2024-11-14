<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 16:08:10
 * @Description: 条形图组件
-->
<template>
    <div
        ref="$container"
        class="BarChart"
    >
        <div
            v-show="prop.tooltip.length"
            class="tooltip"
        >
            <div
                v-for="(item, key) in prop.tooltip"
                :key
            >
                <span
                    class="color"
                    :style="{ backgroundColor: barColors[color[key]] }"
                ></span>
                <span class="text">{{ item }}</span>
            </div>
        </div>
        <canvas ref="$canvas"></canvas>
        <div
            v-show="needPagination"
            class="pagination"
        >
            <BaseImgSprite
                file="prev_page"
                :chunk="3"
                :index="0"
                :hover-index="1"
                :disabled-index="2"
                :disabled="pageIndex === 0"
                @click="prevPage"
            />
            <BaseImgSprite
                file="next_page"
                :chunk="3"
                :index="0"
                :hover-index="1"
                :disabled-index="2"
                :disabled="pageIndex === pageCount - 1"
                @click="nextPage"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
export interface BarChartToolTipOptionItem {
    color: string
    text: string
}

export interface BarChartXValueOptionItem {
    value: number | string
    showBig: boolean
}

type BarChartXValueOption = BarChartXValueOptionItem[]

const prop = withDefaults(
    defineProps<{
        /**
         * @property y坐标文字的间距
         */
        lineSpacing?: number
        /**
         * @property y坐标起始文字
         */
        writeY: number
        /**
         * @property y坐标显示文字的间距值
         */
        writeYSpacing: number
        /**
         * @property 单位值
         */
        unit: string
        /**
         * @property 图例
         */
        tooltip: string[]
        /**
         * @property 柱子的颜色索引
         */
        color?: number[]
        /**
         * @property 柱状间的间隙和柱状宽的比例
         */
        proportion?: number
        /**
         * @property 柱状图的值
         */
        yValue: number[] | number[][]
        /**
         * @property 柱状图的值
         */
        xValue: BarChartXValueOption
        /**
         * @property 单元格内的柱子数量
         */
        unitNum: number
        /**
         * @property 最大显示32根柱子，超出则分页
         */
        maxColNums?: number
    }>(),
    {
        lineSpacing: 75,
        writeY: 5,
        writeYSpacing: 1,
        unit: '',
        tooltip: () => [],
        color: () => [0],
        proportion: 3 / 4,
        yValue: () => [],
        xValue: () => [],
        unitNum: 1,
        maxColNums: 32,
    },
)

const $container = ref<HTMLDivElement>()
const $canvas = ref<HTMLCanvasElement>()
let context: CanvasRenderingContext2D
const pageIndex = ref(0)

let ready = false

// 原点
const ox = 50
const oy = 50

let lineColor = '' // 条形图刻度线颜色
let textColor = '' // 条形图字体颜色
const barColors: string[] = [] // 条形图矩形可选色

/**
 * @description 初始化颜色值
 */
const initColor = () => {
    const style = getComputedStyle($container.value!)
    lineColor = style.getPropertyValue('--barchart-line')
    textColor = style.getPropertyValue('--barchart-text')
    barColors.push(style.getPropertyValue('--barchart-item-01'), style.getPropertyValue('--barchart-item-02'))
}

// 是否需要分页
const needPagination = computed(() => {
    return prop.yValue.length * prop.unitNum > prop.maxColNums
})

// 每页大小
const pageSize = computed(() => {
    return prop.yValue.length * prop.unitNum > prop.maxColNums ? prop.maxColNums : prop.yValue.length * prop.unitNum
})

// 页数
const pageCount = computed(() => {
    return Math.ceil((prop.yValue.length * prop.unitNum) / pageSize.value)
})

/**
 * @description 上一页
 */
const prevPage = () => {
    if (pageIndex.value <= 0) return
    pageIndex.value--
    render()
}

/**
 * @description 下一页
 */
const nextPage = () => {
    if (pageIndex.value >= pageCount.value - 1) {
        return
    }
    pageIndex.value++
    render()
}

/**
 * @description 绘制线
 * @param {Number} aX
 * @param {Number} aY
 * @param {Number} bX
 * @param {Number} bY
 * @param {String} lineColor
 */
const drawLine = (aX: number, aY: number, bX: number, bY: number, lineColor?: string) => {
    context.beginPath()
    context.moveTo(aX, aY)
    context.lineTo(bX, bY)
    if (lineColor) {
        context.strokeStyle = lineColor
    }
    context.stroke()
}

/**
 * @description 绘制文本
 * @param {String} start
 * @param {Number} ox
 * @param {Number} oy
 */
const drawText = (start: string, ox: number, oy: number, maxWidth?: number) => {
    context.beginPath()
    context.fillStyle = textColor
    context.textAlign = maxWidth ? 'center' : 'left'
    context.fillText(start, ox, oy, maxWidth)
    context.closePath()
}

/**
 * @description 绘制矩形
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {String} color
 */
const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
    context.beginPath()
    context.fillStyle = color
    context.rect(x, y, width, height)
    context.fill()
    context.closePath()
}

/**
 * @description 绘制条形
 */
const drawBars = () => {
    const sliceStart = (pageIndex.value * pageSize.value) / prop.unitNum
    const sliceEnd = sliceStart + pageSize.value / prop.unitNum
    const yValue = needPagination ? prop.yValue.slice(sliceStart, sliceEnd) : prop.yValue
    const xValue = needPagination ? prop.xValue.slice(sliceStart, sliceEnd) : prop.xValue
    const length = yValue.length
    const w = (($canvas.value!.width - ox) * 0.83) / length // 刻度的宽
    const colWidth = (prop.proportion * w) / prop.unitNum // 每个柱子的宽
    const splitWidth = (w - colWidth * prop.unitNum) / (prop.unitNum + 1) // 间隙的宽
    const yLength = prop.lineSpacing * (prop.writeY / prop.writeYSpacing)

    for (let i = 0; i < length; i++) {
        const X = ox + w * (i + 1)

        if (xValue[i].showBig) {
            drawLine(X, oy + yLength - 10, X, oy + yLength) // 画刻度
        } else {
            drawLine(X, oy + yLength - 5, X, oy + yLength) //画刻度
        }

        if (xValue[i].showBig) {
            drawText(xValue[i].value + prop.unit, X, oy + yLength + 20, w) // 写x坐标的值
        }

        for (let j = 0; j < prop.unitNum; j++) {
            const offset = (j + 1) * splitWidth + j * colWidth + w * i
            const yValueUnit = prop.unitNum === 1 ? (yValue as number[])[i] : Number((yValue as number[][])[i][j])
            const height = (prop.lineSpacing * yValueUnit) / prop.writeYSpacing
            const Y = oy + yLength - height
            drawRect(offset + ox, Y, colWidth, height, barColors[prop.color[j]]) // 画柱状
            if (yValueUnit > 99 && yValueUnit < 999) {
                drawText(String(yValueUnit), offset + ox + colWidth / 2 - 9, yValueUnit === 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            } else if (yValueUnit > 999) {
                drawText(String(yValueUnit), offset + ox + colWidth / 2 - 12, yValueUnit === 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            } else {
                drawText(String(yValueUnit), offset + ox + colWidth / 2 - 6, yValueUnit === 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            }
        }
    }
}

/**
 * @description 渲染
 */
const render = () => {
    context.clearRect(0, 0, $canvas.value!.width, $canvas.value!.width * 0.83)
    const yLength = prop.lineSpacing * (prop.writeY / prop.writeYSpacing)
    $canvas.value!.width = $container.value!.clientWidth
    $canvas.value!.height = yLength + 100

    const y = oy + yLength
    const x = ox + $canvas.value!.width * 0.83 // prop.xLength

    drawLine(ox, oy, ox, y, lineColor)
    drawLine(ox, y, x, y, lineColor)

    // 画箭头
    // drawLine(ox, oy - 60, ox, oy)
    // drawLine(x, y, x + 60, y)
    // drawLine(ox - 10, oy - 20, ox, oy - 60)
    // drawLine(ox + 10, oy - 20, ox, oy - 60)
    // drawLine(x + 20, y - 10, x + 60, y)
    // drawLine(x + 20, y + 10, x + 60, y)

    for (let i = 0; i < prop.writeY / prop.writeYSpacing + 1; i++) {
        // 画坐标轴方法
        if (i !== prop.writeY / prop.writeYSpacing) {
            drawLine(ox, oy + i * prop.lineSpacing, ox + 5, oy + i * prop.lineSpacing) //画y轴的刻度
        }
        // 坐标轴的显示文字方法
        const text = prop.writeY - i * prop.writeYSpacing
        drawText(String(text), text > 999 ? (text > 9999 ? (text > 9999 ? ox - 41 : ox - 35) : ox - 28) : ox - 21, oy + i * prop.lineSpacing)
    }

    drawBars()
}

const resize = () => {
    const { width, height } = $container.value!.getBoundingClientRect()
    $canvas.value!.width = width
    $canvas.value!.height = height
}

onMounted(() => {
    initColor()
    resize()
    context = $canvas.value!.getContext('2d')!
    render()
    nextTick(() => {
        ready = true
    })
})

watch(
    prop,
    () => {
        if (ready) {
            pageIndex.value = 0
            render()
        }
    },
    {
        deep: true,
    },
)
</script>

<style lang="scss" scoped>
.BarChart {
    width: 100%;
    // height: 100%;

    & > .tooltip {
        display: flex;
        margin-left: 100px;
        font-size: 14px;

        div {
            display: inline-flex;
            margin-right: 20px;
        }

        .color {
            width: 20px;
            height: 20px;
            display: block;
        }

        .text {
            margin-left: 10px;
            height: 20px;
            line-height: 20px;
        }
    }

    & > .pagination {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 20px;
    }
}
</style>
