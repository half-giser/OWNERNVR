<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:30:59
 * @Description: 列表项组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-20 19:40:27
-->
<template>
    <li
        :class="{ active }"
        @click="handleClick"
        @dblclick="handleDblClick"
    >
        <slot></slot>
    </li>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        /**
         * @property 是否选中状态
         */
        active?: boolean
    }>(),
    {
        active: false,
    },
)

const emits = defineEmits<{
    (e: 'click'): void
    (e: 'dblclick'): void
}>()

let timer: NodeJS.Timeout | number = 0

/**
 * @description 拦截点击事件，在非双击时回调
 */
const handleClick = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        emits('click')
    }, 300)
}

/**
 * @description 双击时，取消点击事件
 */
const handleDblClick = () => {
    clearTimeout(timer)
    emits('dblclick')
}
</script>

<style lang="scss" scoped>
li {
    list-style: none;
    padding: 5px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;

    :deep(span) {
        &:last-child {
            margin-left: 10px;
        }
    }

    &:hover,
    &.active {
        border-color: var(--primary);
    }

    &.active {
        background-color: var(--primary);
        color: white;
    }
}
</style>
