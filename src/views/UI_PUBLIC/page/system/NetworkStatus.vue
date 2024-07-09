<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 网络状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-21 18:44:52
-->
<template>
    <div class="NetStatus">
        <el-table
            stripe
            border
            :data="tableData"
        >
            <el-table-column :label="Translate('IDCS_ATTRIBUTE')">
                <template #default="scope">
                    <div
                        class="align"
                        :style="{ 'text-indent': `${(scope.row.i + 1) * 20}px` }"
                    >
                        {{ scope.row.k }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_VALUE')"
                prop="v"
            >
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./NetworkStatus.v.ts"></script>

<style lang="scss" scoped>
.NetStatus {
    :deep(.el-table) {
        height: calc(100vh - 250px);
    }

    .align {
        width: 100%;
        text-align: left;
        display: block;
        box-sizing: border-box;
    }
}
</style>
