<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-11 14:36:27
 * @Description: 表格头 下拉按钮
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 14:41:56
-->
<template>
    <div class="dropdown-btn">
        <slot></slot>
        <el-icon class="el-icon--right">
            <ArrowDown />
        </el-icon>
    </div>
</template>

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.dropdown-btn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-table-header-text-color);
    cursor: pointer;
}
</style>
