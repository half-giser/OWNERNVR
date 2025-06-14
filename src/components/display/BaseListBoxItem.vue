<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:30:59
 * @Description: 列表项组件
-->
<template>
    <li
        v-title
        :class="{ active, 'show-hover': showHover }"
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
        showHover?: boolean
    }>(),
    {
        active: false,
        showHover: true,
    },
)

const emits = defineEmits<{
    (e: 'click'): void
    (e: 'dblclick'): void
}>()

const instance = getCurrentInstance()

let timer: NodeJS.Timeout | number = 0

/**
 * @description 拦截点击事件，在非双击时回调
 */
const handleClick = () => {
    if (instance?.vnode?.props?.onDblclick) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            emits('click')
        }, 250)
    } else {
        emits('click')
    }
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
    user-select: none;
    background-color: var(--main-bg);
    width: 100%;
    box-sizing: border-box;

    :deep(.Sprite) {
        margin-right: 8px;
    }

    :deep(.el-checkbox) {
        height: 30px;
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
    }

    :deep(.el-checkbox__label) {
        text-overflow: ellipsis;
        width: calc(100% - 20px);
        font-size: 13px;
        height: 30px;
        overflow: hidden;
        line-height: 30px;
    }

    &.show-hover {
        &:hover,
        &.active {
            border-color: var(--primary);
        }
    }

    &.active {
        background-color: var(--primary);
        color: var(--main-text-active);
    }
}
</style>
