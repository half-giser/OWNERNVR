<!--
 * @Date: 2025-06-06 18:20:27
 * @Description: 
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dropdown
        ref="$dropdown"
        :max-height
        :disabled
        :trigger
        :placement
        :teleported
        @visible-change="handleVisibleChange"
    >
        <slot></slot>
        <template #dropdown>
            <slot name="dropdown"></slot>
        </template>
    </el-dropdown>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        maxHeight?: number
        trigger?: 'click' | 'hover' | 'contextmenu' | 'focus'
        placement?: string
        disabled?: boolean
        teleported?: boolean
    }>(),
    {
        trigger: 'click',
        disabled: false,
        teleported: true,
        placement: 'bottom',
    },
)

const emit = defineEmits<{
    (e: 'visibleChange', bool: boolean): void
}>()

const popperObserver = usePopperObserver()
const $dropdown = ref()

const handleVisibleChange = (bool: boolean) => {
    if (bool) {
        popperObserver.addListener(hide)
    } else {
        popperObserver.removeListener(hide)
    }

    emit('visibleChange', bool)
}

const handleClose = () => {
    $dropdown.value?.handleClose()
}

const hide = popperObserver.observe(handleClose, 'el-dropdown__popper')

onBeforeUnmount(() => {
    popperObserver.removeListener(hide)
})
</script>
