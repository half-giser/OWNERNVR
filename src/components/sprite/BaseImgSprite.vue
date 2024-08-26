<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 09:27:20
 * @Description: 雪碧图组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 18:27:04
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
        file: string // 雪碧图文件名
        scale?: number // 缩放值
        chunk?: number // 分块 (由于雪碧大图可能由雪碧小图生成，此值对雪碧小图分块. 这里假定了小雪碧图都是水平平均分块的形式，如果不是这种模式，需特殊处理)
        index?: number // 分块索引，下标从0开始
        hoverIndex?: number | string // :hover索引值, number时是hover的下标索引，string时是hover的文件
        activeIndex?: number | string // :active索引值, number时是active的下标索引，string时是active的文件
        disabledIndex?: number | string // 禁用状态索引值. number时是disabled的下标索引，string时是disabled的文件
        disabled?: boolean // 是否禁用
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

const currentIndex = computed(() => {
    if (typeof prop.disabledIndex === 'number' && prop.disabled && prop.disabledIndex > -1) return prop.disabledIndex
    if (isMouseDown.value && typeof prop.activeIndex === 'number' && prop.activeIndex !== -1) return prop.activeIndex
    if (isHover.value && typeof prop.hoverIndex === 'number' && prop.hoverIndex !== -1) return prop.hoverIndex
    return prop.index
})

const currentFile = computed(() => {
    if (typeof prop.disabledIndex === 'string' && prop.disabled) return prop.disabledIndex
    if (isMouseDown.value && typeof prop.activeIndex === 'string') return prop.activeIndex
    if (isHover.value && typeof prop.hoverIndex === 'string') return prop.hoverIndex
    return prop.file
})

const isHoverClass = computed(() => {
    return !prop.disabled && ((typeof prop.hoverIndex === 'number' && prop.hoverIndex > -1) || (typeof prop.hoverIndex === 'string' && prop.hoverIndex.length))
})

const item = computed(() => {
    return (
        sprites.coordinates[currentFile.value] || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
    )
})

const custom = computed(() => {
    const customFn = customSprites[currentFile.value]
    if (customFn) {
        return customFn(currentIndex.value)
    }
    return null
})

const backgroundPositionX = computed(() => {
    if (custom.value) {
        return `-${item.value.x + custom.value.x}px`
    }
    return `-${item.value.x + (currentIndex.value / prop.chunk) * item.value.width}px`
})

const backgroundPositionY = computed(() => {
    if (custom.value) {
        return `-${item.value.y + custom.value.y}px`
    }
    return `-${item.value.y}px`
})

const width = computed(() => {
    if (custom.value) {
        return `${custom.value.width}px`
    }
    return `${item.value.width / prop.chunk}px`
})

const height = computed(() => {
    if (custom.value) {
        return `${custom.value.height}px`
    }
    return `${item.value.height}px`
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
