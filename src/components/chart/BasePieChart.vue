<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 16:09:43
 * @Description: 饼状图组件
-->
<template>
    <div
        class="PieChart"
        :style="{ width: `${width}px` }"
    >
        <canvas
            ref="$canvas"
            :width="width"
            :height="height"
        ></canvas>
    </div>
</template>

<script lang="ts" setup>
interface PieChartColorsOptionItem {
    name: string
    color: string
}

type PieChartColorsOption = PieChartColorsOptionItem[]

interface PieChartShowFontOptionItem {
    showColor: string
    name: string
    proportion: string
    pleCount: string
}

type PieChartShowFontOption = PieChartShowFontOptionItem[]

interface PieChartNumsOptionItem {
    imageNum: number
    name: string
}

type PieChartNumsOption = PieChartNumsOptionItem[]

const prop = withDefaults(
    defineProps<{
        /**
         * @property Canvas宽
         */
        width: number
        /**
         * @property Canvas高
         */
        height: number
        /**
         * @property 旋转角度
         */
        rotationAngle: number
        /**
         * @property 原点坐标
         */
        resetOriginal: [number, number]
        /**
         * @property 半径
         */
        r: number
        /**
         * @property 字体Style
         */
        fontStyle: string
        /**
         * @property 扇形字体Style:
         */
        rectangleFontStyle: string
        /**
         * @property 扇形位置
         */
        rectanglePosition: number
        /**
         * @property 字体颜色
         */
        fontColor: string
        /**
         * @property 线条颜色
         */
        lineColor: string
        /**
         * @property 扇形颜色
         */
        rectangleColor: string
        /**
         * @property 字体选项
         */
        showFont: PieChartShowFontOption
        /**
         * @property 颜色列表
         */
        colors: PieChartColorsOption
        /**
         * @property 数据
         */
        nums: PieChartNumsOption
    }>(),
    {
        width: 1200,
        height: 270,
        rotationAngle: -30,
        resetOriginal: () => [400, 140],
        r: 110,
        fontStyle: '15px scans-serif',
        rectangleFontStyle: '17px scans-serif',
        rectanglePosition: 520,
        fontColor: '#ffffff',
        lineColor: '#ffffff',
        rectangleColor: 'black',
        showFont: () => [],
        colors: () => [],
        nums: () => [],
    },
)

const $canvas = ref<HTMLCanvasElement>()
let context: CanvasRenderingContext2D

/**
 * @description 绘制饼状图
 */
const drawPie = () => {
    const total = prop.nums.reduce((a, b) => {
        return a + b.imageNum
    }, 0)
    const count = prop.nums.filter((item) => item.imageNum).length

    let start = 0
    let end = 0
    const proportion = 360 / total

    prop.nums.forEach((item) => {
        if (item.imageNum !== 0) {
            context.beginPath()
            context.moveTo(0, 0)
            end += (item.imageNum * proportion * Math.PI) / 180
            if (count !== 1) {
                context.strokeStyle = prop.lineColor
                const find = prop.colors.find((findItem) => findItem.name === item.name)
                if (find) {
                    context.fillStyle = find.color
                }
            } else {
                const find = prop.colors.find((findItem) => findItem.name === item.name)
                if (find) {
                    context.fillStyle = find.color
                    context.strokeStyle = find.color
                }
            }
            context.arc(0, 0, prop.r, start, end)
            context.fill()
            context.closePath()
            context.stroke()
            start += (item.imageNum * proportion * Math.PI) / 180
        }
    })
}

/**
 * @description 绘制扇形
 */
const drawRectangle = () => {
    prop.showFont.forEach((item, i) => {
        const find = prop.colors.find((fintItem) => fintItem.name === item.showColor)
        if (find) {
            context.fillStyle = find.color
            context.strokeStyle = find.color
        }
        context.fillRect(prop.rectanglePosition, 20 + i * 27, 18, 18)
        context.font = prop.rectangleFontStyle
        context.fillStyle = prop.rectangleColor
        context.fillText(item.name, prop.rectanglePosition + 20, 35 + i * 27)
        context.fillText(item.proportion, prop.rectanglePosition + 190, 35 + i * 27)
        context.fillText(item.pleCount, prop.rectanglePosition + 260, 35 + i * 27)
    })
}

// const drawNum = () => {
//     const nums = prop.nums
//     const total = prop.nums.reduce((a, b) => a + b)
//     let start = 0
//     let end = 0

//     const proportion = 360 / total
//     nums.forEach((item) => {
//         start = (item * proportion * Math.PI) / 360
//         context.rotate(end + start)
//         context.font = prop.fontStyle
//         context.fillStyle = prop.fontColor
//         context.fillText(item + '%', prop.r - 60, 0)
//         end = (item * proportion * Math.PI) / 360
//     })
// }

/**
 * @description 更新
 */
const update = () => {
    context.clearRect(0, 0, prop.width, prop.height)
    render()
}

/**
 * @description 渲染
 */
const render = () => {
    if (prop.nums.length !== 0) {
        drawRectangle()
    }
    context.save()
    context.translate(...prop.resetOriginal)
    const sum = prop.nums.reduce((a, b) => {
        return a + b.imageNum
    }, 0)
    if (!prop.nums.length || !sum) {
        context.beginPath()
        const r = prop.r < 80 ? 80 : prop.r
        context.arc(0, 0, r, 0, 2 * Math.PI)
        context.fillStyle = '#f0f0f0'
        context.fill()
        context.stroke()
        return
    }
    context.rotate((prop.rotationAngle * Math.PI) / 180)
    drawPie()
    // drawNum()
    context.restore()
}

onMounted(() => {
    context = $canvas.value!.getContext('2d')!
    render()
})

watch(
    () => prop.nums,
    () => update(),
)

watch(
    () => prop.colors,
    () => update(),
)
</script>

<style lang="scss" scoped></style>
