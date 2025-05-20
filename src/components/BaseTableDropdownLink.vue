<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-11 14:36:27
 * @Description: 表格头 下拉按钮
-->
<template>
    <div
        class="BaseDropdownBtn"
        :class="[`effect-${effect}`]"
    >
        <div class="BaseDropdownBtn--text">
            <slot></slot>
            <!-- <div class="dropdown-btn-icon"></div> -->
        </div>
        <el-icon class="el-icon--right">
            <ArrowDown />
        </el-icon>
    </div>
</template>

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'

withDefaults(
    defineProps<{
        effect?: 'plain' | 'table'
    }>(),
    {
        effect: 'table',
    },
)
</script>

<style lang="scss" scoped>
// @use '@/components/sprite/sprites' as *;
// @use '@/scss/mixin' as *;

.BaseDropdownBtn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-table-header-text-color);
    cursor: pointer;
    user-select: none;
    padding: 8px 0;

    &.effect-plain {
        color: var(--main-text);
    }

    &--text {
        width: fit-content;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
    }

    .el-icon--right {
        flex-shrink: 0;
    }

    // &-icon {
    //     @include sprite-mask($img-ddn, 0, 1);

    //     background-color: currentcolor;
    //     margin-left: 5px;
    // }
}
</style>
