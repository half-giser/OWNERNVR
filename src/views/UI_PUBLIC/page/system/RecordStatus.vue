<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 录像状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-21 18:21:56
-->
<template>
    <div class="RecordStatus">
        <el-table
            stripe
            border
            :data="tableData"
        >
            <el-table-column :label="Translate('IDCS_CHANNEL_NAME')">
                <template #default="scope">
                    <el-tooltip :content="scope.row.name">
                        <div class="ellipsis">{{ scope.row.name }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD_STATE')">
                <template #default="scope">
                    <span :class="{ error: scope.row.recStatus === 'abnormal' }">{{ Translate(DEFAULT_REC_STATUS_MAPPING[scope.row.recStatus]) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_CODE_STREAM_TYPE')">
                <template #default="scope">
                    <span>{{ scope.row.streamType ? Translate(DEFAULT_STREAM_TYPE_MAPPING[scope.row.streamType]) : '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FRAME_RATE')">
                <template #default="scope">
                    <span>{{ scope.row.frameRate || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_BITRATE_TYPE')">
                <template #default="scope">
                    <span>{{ scope.row.bitType || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_IMAGE_QUALITY')">
                <template #default="scope">
                    <span>{{ scope.row.level && scope.row.bitType === 'VBR' ? Translate(DEFAULT_IMAGE_LEVEL_MAPPING[scope.row.level]) : '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_VIDEO_QUALITY')">
                <template #default="scope">
                    <span>{{ scope.row.quality ? `${scope.row.quality}Kbps` : '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RESOLUTION_RATE')">
                <template #default="scope">
                    <span>{{ scope.row.resolution && scope.row.resolution !== '0x0' ? scope.row.resolution : '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD_TYPE')">
                <template #default="scope">
                    <span>{{ formatRecordType(scope.row) }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./RecordStatus.v.ts"></script>

<style lang="scss" scoped>
.RecordStatus {
    :deep(.el-table) {
        height: calc(100vh - 250px);
    }

    .error {
        color: var(--error--01);
    }

    .ellipsis {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
