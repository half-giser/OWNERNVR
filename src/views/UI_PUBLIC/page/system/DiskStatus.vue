<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:46:16
 * @Description: 磁盘状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            v-title
            :data="tableData"
            highlight-current-row
            show-overflow-tooltip
            height="100%"
        >
            <el-table-column
                label=" "
                width="50"
            >
                <template #default="{ row }: TableColumn<SystemDiskStatusList>">
                    <BaseTableRowStatus :icon="row.status" />
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
                <template #default="{ row }: TableColumn<SystemDiskStatusList>">
                    {{ formatDiskType(row) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DISK_FREE_CAPACITY')">
                <template #default="{ row }: TableColumn<SystemDiskStatusList>">
                    {{ formatSizeAndFreeSpace(row) }}
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
                <template #default="{ row }: TableColumn<SystemDiskStatusList>">
                    <span>{{ row.recTime ? row.recTime : '' }}</span>
                    <BaseImgSprite
                        v-if="row.recFileDate"
                        file="alarm"
                        :index="0"
                        :hover-index="0"
                        :title="`${Translate('IDCS_WARNING_MSG')}: ${Translate('IDCS_RECORD_LOG_PERIOD').formatForLang(row.recFileDate)}`"
                    />
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./DiskStatus.v.ts"></script>
