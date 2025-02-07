<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:46:16
 * @Description: 磁盘状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            height="100%"
            :data="tableData"
            highlight-current-row
            show-overflow-tooltip
        >
            <el-table-column
                label=" "
                width="50"
            >
                <template #default="scope: TableColumn<SystemDiskStatusList>">
                    <BaseTableRowStatus :icon="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_SERIAL_NUMBER')"
                type="index"
                width="70"
            />
            <el-table-column
                :label="Translate('IDCS_DISK')"
                prop="diskNum"
            />
            <!-- <el-table-column
                :label="Translate('IDCS_DISK')"
                prop="diskNum"
            >
            </el-table-column> -->
            <el-table-column :label="Translate('IDCS_TYPE')">
                <template #default="scope: TableColumn<SystemDiskStatusList>">
                    {{ formatDiskType(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DISK_FREE_CAPACITY')">
                <template #default="scope: TableColumn<SystemDiskStatusList>">
                    {{ formatSizeAndFreeSpace(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_STATE')"
                prop="combinedStatus"
            />
            <el-table-column
                :label="Translate('IDCS_SOURCE')"
                prop="source"
            />
            <el-table-column
                :label="Translate('IDCS_REEL_GROUP')"
                prop="group"
            />
            <el-table-column :label="Translate('IDCS_DISK_RECORD_PERIOD')">
                <template #default="scope: TableColumn<SystemDiskStatusList>">
                    {{ scope.row.recTime ? scope.row.recTime : '' }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./DiskStatus.v.ts"></script>
