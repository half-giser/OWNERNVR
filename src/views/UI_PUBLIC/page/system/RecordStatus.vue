<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 录像状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            v-title
            :data="tableData"
            height="100%"
            show-overflow-tooltip
        >
            <el-table-column
                :label="Translate('IDCS_CHANNEL_NAME')"
                width="250"
                prop="name"
            />
            <el-table-column :label="Translate('IDCS_RECORD_STATE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    <span :class="{ 'text-error': row.recStatus === 'abnormal' }">{{ displayRecStatus(row) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_CODE_STREAM_TYPE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ displayStreamType(row) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FRAME_RATE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ row.frameRate || '--' }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_BITRATE_TYPE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ row.bitType || '--' }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_IMAGE_QUALITY')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ displayLevel(row) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_VIDEO_QUALITY')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ row.quality ? `${row.quality}Kbps` : '--' }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RESOLUTION_RATE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ row.resolution && row.resolution !== '0x0' ? row.resolution : '--' }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD_TYPE')">
                <template #default="{ row }: TableColumn<SystemRecordStatusList>">
                    {{ formatRecordType(row) }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./RecordStatus.v.ts"></script>
