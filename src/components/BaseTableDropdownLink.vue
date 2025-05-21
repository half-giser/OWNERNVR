<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-11 14:36:27
 * @Description: 表格头 下拉按钮
-->
<template>
    <div
        class="BaseDropdownBtn align-item-center"
        :class="[`effect-${effect}`]"
    >
        <div class="BaseDropdownBtn--text">
            <slot></slot>
        </div>
        <BaseImgSprite
            v-if="needDropDownTips"
            file="aq"
            :index="1"
            :hover-index="0"
            :chunk="3"
            :title="title"
        />
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
        title?: string
        needDropDownTips?: boolean
    }>(),
    {
        effect: 'table',
        needDropDownTips: false,
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

    &.effect-plain {
        color: var(--main-text);
    }

    &--text {
        width: fit-content;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
    }

    &.align-item-center {
        align-items: center;
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
