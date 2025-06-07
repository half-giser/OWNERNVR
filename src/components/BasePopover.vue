<!--
 * @Date: 2025-06-06 18:20:27
 * @Description: 扩展el-popover，监听鼠标滑轮并自动关闭
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-popover
        ref="$popover"
        :visible="visible"
        :width
        :teleported
        :popper-class
        :placement
        :trigger="trigger"
        :offset
        :disabled
        :append-to
        @update:visible="emit('update:visible', $event)"
        @before-enter="emit('beforeEnter')"
        @after-leave="emit('afterLeave')"
        @show="focus"
        @hide="blur"
    >
        <template #reference>
            <slot name="reference"></slot>
        </template>
        <slot></slot>
    </el-popover>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        visible?: boolean | null
        width?: number | string
        trigger?: 'click' | 'hover' | 'contextmenu' | 'focus'
        placement?: string
        disabled?: boolean
        teleported?: boolean
        offset?: number
        appendTo?: string
        popperClass?: string
    }>(),
    {
        visible: null,
        modelValue: false,
        offset: 0,
        trigger: 'click',
    },
)

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'beforeEnter'): void
    (e: 'afterLeave'): void
}>()

const popperObserver = usePopperObserver()
const $popover = ref()

const handleClose = () => {
    $popover.value?.hide()
}

const focus = () => {
    popperObserver.addListener(hide)
}

const blur = () => {
    popperObserver.removeListener(hide)
}

const hide = popperObserver.observe(handleClose, 'el-popover')

onBeforeUnmount(() => {
    popperObserver.removeListener(hide)
})
</script>
