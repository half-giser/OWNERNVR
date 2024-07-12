<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:46:16
 * @Description: 磁盘状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 17:49:54
-->
<template>
    <div class="base-flex-box">
        <el-table
            stripe
            border
            height="100%"
            :data="tableData"
        >
            <el-table-column :label="Translate('IDCS_SERIAL_NUMBER')">
                <template #default="scope">
                    {{ scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK')"
                prop="diskNum"
            >
            </el-table-column>
            <!-- <el-table-column
                :label="Translate('IDCS_DISK')"
                prop="diskNum"
            >
            </el-table-column> -->
            <el-table-column :label="Translate('IDCS_TYPE')">
                <template #default="scope">
                    <span>{{ formatDiskType(scope.row) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DISK_FREE_CAPACITY')">
                <template #default="scope">
                    <span>{{ formatSizeAndFreeSpace(scope.row) }}</span>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_STATE')"
                prop="combinedStatus"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_SOURCE')"
                prop="source"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_REEL_GROUP')"
                prop="group"
            >
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DISK_RECORD_PERIOD')">
                <template #default="scope">
                    <span>{{ scope.row.recTime ? scope.row.recTime : '' }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./DiskStatus.v.ts"></script>

<style lang="scss" scoped>
.error {
    color: var(--error--01);
}
</style>
