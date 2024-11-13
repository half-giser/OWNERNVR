<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 09:27:20
 * @Description: 雪碧图组件
-->
<template>
    <span
        class="Sprite"
        :style="{
            width,
            height,
            backgroundPositionX,
            backgroundPositionY,
            backgroundSize: `${sprites.properties.width}px ${sprites.properties.height}px`,
            transform: `scale(${prop.scale})`,
        }"
        :class="{
            hover: isHoverClass,
            disabled,
        }"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        @mousedown="isMouseDown = true"
        @mouseup="isMouseDown = false"
    ></span>
</template>

<script setup lang="ts">
import sprites from './sprites'
import customSprites from './customSprites'

const prop = withDefaults(
    defineProps<{
        /**
         * @property 雪碧图文件名
         */
        file: string
        /**
         * @property 缩放值
         */
        scale?: number
        /**
         * @property 分块 (由于雪碧大图可能由雪碧小图生成，此值对雪碧小图分块. 这里假定了小雪碧图都是水平平均分块的形式，如果不是这种模式，需特殊处理)
         */
        chunk?: number
        /**
         * @property 分块索引，下标从0开始
         */
        index?: number
        /**
         * @property :hover索引值, number时是hover的下标索引，string时是hover的文件
         */
        hoverIndex?: number | string
        /**
         * @property :active索引值, number时是active的下标索引，string时是active的文件
         */
        activeIndex?: number | string
        /**
         * @property 禁用状态索引值. number时是disabled的下标索引，string时是disabled的文件
         */
        disabledIndex?: number | string
        /**
         * @property 是否禁用
         */
        disabled?: boolean
    }>(),
    {
        scale: 1,
        chunk: 1,
        index: 0,
        hoverIndex: -1,
        activeIndex: -1,
        disabledIndex: -1,
        disabled: false,
    },
)

const isHover = ref(false)
const isMouseDown = ref(false)

// 当前索引值
const currentIndex = computed(() => {
    if (typeof prop.disabledIndex === 'number' && prop.disabled && prop.disabledIndex > -1) return prop.disabledIndex
    if (isMouseDown.value && typeof prop.activeIndex === 'number' && prop.activeIndex !== -1) return prop.activeIndex
    if (isHover.value && typeof prop.hoverIndex === 'number' && prop.hoverIndex !== -1) return prop.hoverIndex
    return prop.index
})

// 当前图标
const currentFile = computed(() => {
    if (typeof prop.disabledIndex === 'string' && prop.disabled) return prop.disabledIndex
    if (isMouseDown.value && typeof prop.activeIndex === 'string') return prop.activeIndex
    if (isHover.value && typeof prop.hoverIndex === 'string') return prop.hoverIndex
    return prop.file
})

// hover状态
const isHoverClass = computed(() => {
    return !prop.disabled && ((typeof prop.hoverIndex === 'number' && prop.hoverIndex > -1) || (typeof prop.hoverIndex === 'string' && prop.hoverIndex.length))
})

// 当前图标文件
const item = computed(() => {
    return sprites.coordinates[currentFile.value] || [0, 0, 0, 0]
})

// 非标准的图标
const custom = computed(() => {
    const customFn = customSprites[currentFile.value]
    if (customFn) {
        return customFn(currentIndex.value)
    }
    return null
})

// css backgroundPositionX
const backgroundPositionX = computed(() => {
    if (custom.value) {
        return `-${item.value[0] + custom.value[0]}px`
    }
    return `-${item.value[0] + (currentIndex.value / prop.chunk) * item.value[2]}px`
})

// css backgroundPositionY
const backgroundPositionY = computed(() => {
    if (custom.value) {
        return `-${item.value[1] + custom.value[1]}px`
    }
    return `-${item.value[1]}px`
})

// css width
const width = computed(() => {
    if (custom.value) {
        return `${custom.value[2]}px`
    }
    return `${item.value[2] / prop.chunk}px`
})

// css height
const height = computed(() => {
    if (custom.value) {
        return `${custom.value[3]}px`
    }
    return `${item.value[3]}px`
})
</script>

<style lang="scss" scoped>
.Sprite {
    display: inline-block;
    background-image: url('@/components/sprite/sprites.png');
    background-repeat: no-repeat;
    vertical-align: middle;

    &.hover {
        cursor: pointer;
    }

    &.disabled {
        cursor: not-allowed;
    }
}
</style>
