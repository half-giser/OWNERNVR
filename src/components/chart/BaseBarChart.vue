<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 16:08:10
 * @Description: 条形图组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-06 09:53:47
-->
<template>
    <div
        class="BarChart"
        :style="{ width: `${width}px` }"
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
                    :style="{ backgroundColor: item.color }"
                ></span>
                <span class="text">{{ item.text }}</span>
            </div>
        </div>
        <canvas
            ref="$canvas"
            :width="width"
            :height="height"
        />
        <div
            v-show="needPagination"
            class="pagination"
        >
            <BaseImgSprite
                file="prev_page"
                :chunk="3"
                :index="0"
                @click="prevPage"
            />
            <BaseImgSprite
                file="next_page"
                :chunk="3"
                :index="0"
                @click="nextPage"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'

interface BarChartToolTipOptionItem {
    color: string
    text: string
}

type BarChartToolTipOption = BarChartToolTipOptionItem[]

interface BarChartXValueOptionItem {
    value: number
    showBig: boolean
}

type BarChartXValueOption = BarChartXValueOptionItem[]

const prop = withDefaults(
    defineProps<{
        width: number // canvas的宽度
        height: number // canvas的高度
        lineSpacing: number // y坐标文字的间距
        xLength: number // X轴的宽度
        ox: number // 柱状图起点
        oy: number // 柱状图起点
        writeY: number // y坐标起始文字
        writeYSpacing: number // y坐标显示文字的间距值
        unit: string // X坐标显示文字的间距值
        tooltip: BarChartToolTipOption
        color: string[] // 柱子的颜色
        lineColor: string // 坐标线的颜色
        proportion: number // 柱状间的间隙和柱状宽的比例
        yValue: number[] | number[][] // 柱状图的值
        xValue: BarChartXValueOption // 柱状图的值
        unitNum: number // 单元格内的柱子数量
        maxColNums: number // 最大显示32根柱子，超出则分页
        textColor: string // 文本颜色
    }>(),
    {
        width: 1200,
        height: 1000,
        lineSpacing: 75,
        xLength: 1000,
        ox: 50,
        oy: 50,
        writeY: 5,
        writeYSpacing: 1,
        unit: '日',
        tooltip: () => [],
        color: () => ['#c94049'],
        lineColor: '#ac7e7e ',
        proportion: 3 / 4,
        yValue: () => [],
        xValue: () => [],
        unitNum: 1,
        maxColNums: 32,
        textColor: 'black',
    },
)

const $canvas = ref<HTMLCanvasElement>()
let context: CanvasRenderingContext2D
const pageIndex = ref(0)

const needPagination = computed(() => {
    return prop.yValue.length * prop.unitNum > prop.maxColNums
})

const pageSize = computed(() => {
    return Math.ceil(prop.yValue.length / prop.unitNum)
})

const prevPage = () => {
    if (pageIndex.value <= 0) return
    pageIndex.value--
    render()
}

const nextPage = () => {
    if (pageIndex.value >= pageSize.value - 1) {
        return
    }
    pageIndex.value++
    render()
}

const drawLine = (aX: number, aY: number, bX: number, bY: number, lineColor?: string) => {
    context.beginPath()
    context.moveTo(aX, aY)
    context.lineTo(bX, bY)
    if (lineColor) {
        context.strokeStyle = lineColor
    }
    context.stroke()
}

const drawText = (start: string, ox: number, oy: number) => {
    context.beginPath()
    context.fillStyle = prop.textColor
    context.fillText(start, ox, oy)
    context.closePath()
}

const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
    context.beginPath()
    context.fillStyle = color
    context.rect(x, y, width, height)
    context.fill()
    context.closePath()
}

const drawBars = () => {
    const sliceStart = pageIndex.value * pageSize.value
    const sliceEnd = sliceStart + pageIndex.value
    const yValue = needPagination ? prop.yValue.slice(sliceStart, sliceEnd) : prop.yValue
    const xValue = needPagination ? prop.xValue.slice(sliceStart, sliceEnd) : prop.xValue
    const length = yValue.length
    const w = prop.xLength / length // 刻度的宽
    const colWidth = (prop.proportion * w) / prop.unitNum // 每个柱子的宽
    const splitWidth = (w - colWidth * prop.unitNum) / (prop.unitNum + 1) // 间隙的宽
    const yLength = prop.lineSpacing * (prop.writeY / prop.writeYSpacing)

    for (let i = 0; i < length; i++) {
        const X = prop.ox + w * (i + 1)

        if (xValue[i].showBig) {
            drawLine(X, prop.oy + yLength - 10, X, prop.oy + yLength) // 画刻度
        } else {
            drawLine(X, prop.oy + yLength - 5, X, prop.oy + yLength) //画刻度
        }

        if (xValue[i].showBig) {
            drawText(xValue[i].value + prop.unit, X - 3, prop.oy + yLength + 20) // 写x坐标的值
        }

        for (let j = 0; j < prop.unitNum; j++) {
            const offset = (j + 1) * splitWidth + j * colWidth + w * i
            const yValueUnit = prop.unitNum == 1 ? (yValue as number[])[i] : Number((yValue as number[][])[i][j])
            const height = (prop.lineSpacing * yValueUnit) / prop.writeYSpacing
            const Y = prop.oy + yLength - height
            drawRect(offset + prop.ox, Y, colWidth, height, prop.color[j]) // 画柱状
            if (yValueUnit > 99 && yValueUnit < 999) {
                drawText(String(yValueUnit), offset + prop.ox + colWidth / 2 - 9, yValueUnit == 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            } else if (yValueUnit > 999) {
                drawText(String(yValueUnit), offset + prop.ox + colWidth / 2 - 12, yValueUnit == 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            } else {
                drawText(String(yValueUnit), offset + prop.ox + colWidth / 2 - 6, yValueUnit == 0 ? Y - 2 : Y - 8) // 写Y柱图上的值
            }
        }
    }
}

const render = () => {
    context.clearRect(0, 0, prop.width, prop.xLength)
    const yLength = prop.lineSpacing * (prop.writeY / prop.writeYSpacing)
    const ox = prop.ox
    const oy = prop.oy

    const y = oy + yLength
    const x = ox + prop.xLength

    drawLine(ox, oy, ox, y, prop.lineColor)
    drawLine(ox, y, x, y, prop.lineColor)

    // 画箭头
    drawLine(ox, oy - 60, ox, oy)
    drawLine(x, y, x + 60, y)
    drawLine(ox - 10, oy - 20, ox, oy - 60)
    drawLine(ox + 10, oy - 20, ox, oy - 60)
    drawLine(x + 20, y - 10, x + 60, y)
    drawLine(x + 20, y + 10, x + 60, y)

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

onMounted(() => {
    context = $canvas.value!.getContext('2d')!
})

watch(prop, () => {
    render()
})
</script>

<style lang="scss" scoped>
.BarChart {
    & > .tooltip {
        display: flex;
        margin-left: 200px;

        .color {
            width: 20px;
            height: 20px;
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
