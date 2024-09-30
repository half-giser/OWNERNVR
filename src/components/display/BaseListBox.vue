<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:26:58
 * @Description: 列表组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-09 15:28:33
-->
<template>
    <div
        class="BaseListBox"
        :class="{ border }"
    >
        <ul>
            <slot></slot>
        </ul>
    </div>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        /**
         * @description 是否显示边框
         */
        border?: boolean
    }>(),
    {
        border: false,
    },
)
</script>

<style lang="scss" scoped>
.BaseListBox {
    width: 100%;
    height: calc(100% - 80px);
    overflow-y: scroll;
    border-collapse: collapse;

    &.border {
        border: 1px solid var(--content-border);
    }

    ul {
        margin: 0;
        padding: 0;

        :deep(.el-checkbox) {
            margin-left: 10px;
            display: flex;
        }
    }
}
</style>
