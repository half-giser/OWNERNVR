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
            backgroundSize: `${sprites.properties.width * scale}px ${sprites.properties.height * scale}px`,
            '--sprite-normal': position,
            '--sprite-hover': hoverPosition,
            '--sprite-active': activePosition,
            '--sprite-disabled': disabledPosition,
        }"
        :class="{
            hover: prop.hoverIndex > -1,
            active,
            disabled,
        }"
        @click="click"
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
         * @property 分块 (由于雪碧大图可能由雪碧小图生成，此值对雪碧小图分块. 这里假定了小雪碧图都是水平平均分块的形式，如果不是这种模式，需特殊处理)
         */
        chunk?: number
        /**
         * @property 分块索引，下标从0开始
         */
        index?: number
        /**
         * @property :hover索引值, number时是hover的下标索引
         */
        hoverIndex?: number
        /**
         * @property 是否高亮
         */
        active?: boolean
        /**
         * @property 高亮索引值, number时是active的下标索引
         */
        activeIndex?: number
        /**
         * @property 禁用状态索引值. number时是disabled的下标索引，string时是disabled的文件
         */
        disabledIndex?: number
        /**
         * @property 是否禁用, 优先级比active高
         */
        disabled?: boolean
        /**
         * @property 点击事件是否阻止冒泡
         */
        stopPropagation?: boolean
        /**
         * @property 缩放比例
         */
        scale?: number
    }>(),
    {
        chunk: 1,
        index: 0,
        hoverIndex: -1,
        active: false,
        activeIndex: -1,
        disabledIndex: -1,
        disabled: false,
        stopPropagation: true,
        scale: 1,
    },
)

const emits = defineEmits<{
    (e: 'click', event: MouseEvent): void
}>()

const instance = getCurrentInstance()

// 当前图标文件
const item = computed(() => {
    const customSprite = customSprites[prop.file]
    if (customSprite) {
        return customSprite
    }
    return sprites.coordinates[prop.file] || [0, 0, 0, 0]
})

// background position
const position = computed(() => {
    return `${getPositionX(prop.index)} ${getPositionY()}`
})

// background position (hover)
const hoverPosition = computed(() => {
    if (prop.hoverIndex === -1) {
        return position.value
    }
    return `${getPositionX(prop.hoverIndex)} ${getPositionY()}`
})

// background position (active)
const activePosition = computed(() => {
    if (prop.activeIndex === -1) {
        return position.value
    }
    return `${getPositionX(prop.activeIndex)} ${getPositionY()}`
})

// background position (disabled)
const disabledPosition = computed(() => {
    if (prop.disabledIndex === -1) {
        return position.value
    }
    return `${getPositionX(prop.disabledIndex)} ${getPositionY()}`
})

/**
 * @description 计算background-position-x
 */
const getPositionX = (currentIndex: number) => {
    return `-${(item.value[0] + (currentIndex / prop.chunk) * item.value[2]) * prop.scale}px`
}

/**
 * @description 计算background-position-y
 */
const getPositionY = () => {
    return `-${item.value[1] * prop.scale}px`
}

// css width
const width = computed(() => {
    return `${(item.value[2] / prop.chunk) * prop.scale}px`
})

// css height
const height = computed(() => {
    return `${item.value[3] * prop.scale}px`
})

const click = (e: MouseEvent) => {
    if (instance?.vnode?.props?.onClick && prop.stopPropagation) {
        e.stopPropagation()
    }

    if (prop.disabled) {
        return
    }

    emits('click', e)
}
</script>

<style lang="scss" scoped>
@use '@/scss/function' as *;

.Sprite {
    display: inline-block;
    background-image: img-url('@/components/sprite/sprites.png');
    background-repeat: no-repeat;
    vertical-align: middle;
    flex-shrink: 0;
    background-position: var(--sprite-normal);

    &:hover {
        background-position: var(--sprite-hover);
    }

    &:active,
    &.active {
        background-position: var(--sprite-active);
    }

    &.hover {
        cursor: pointer;
    }

    &.disabled {
        cursor: not-allowed;
        background-position: var(--sprite-disabled);
    }
}
</style>
