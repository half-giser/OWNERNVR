<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:30:59
 * @Description: 列表项组件
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
    margin: 0;
    padding: 0 10px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    line-height: 30px;

    :deep(.Sprite) {
        margin-right: 8px;
    }

    :deep(.el-checkbox) {
        height: 30px;
        width: 100%;
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
