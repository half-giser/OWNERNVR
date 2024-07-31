<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:30:59
 * @Description: 列表项组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-24 17:13:39
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
        active?: boolean
        icon?: string
    }>(),
    {
        active: false,
        icon: '',
    },
)

const emits = defineEmits<{
    (e: 'click'): void
    (e: 'dblclick'): void
}>()

let timer: NodeJS.Timeout | number = 0

const handleClick = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        emits('click')
    }, 300)
}

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

    :deep(span) {
        &:last-child {
            margin-left: 10px;
        }
    }

    &:hover,
    &.active {
        border-color: var(--primary--04);
    }

    &.active {
        background-color: var(--primary--04);
        color: white;
    }
}
</style>
