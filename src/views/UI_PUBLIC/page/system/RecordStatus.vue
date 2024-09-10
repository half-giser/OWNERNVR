<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 录像状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 17:38:18
-->
<template>
    <div class="base-flex-box">
        <el-table
            stripe
            border
            :data="tableData"
            height="100%"
        >
            <el-table-column
                :label="Translate('IDCS_CHANNEL_NAME')"
                width="250px"
            >
                <template #default="scope">
                    <el-tooltip
                        :content="scope.row.name"
                        :show-after="500"
                    >
                        <div class="text-ellipsis">{{ scope.row.name }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD_STATE')">
                <template #default="scope">
                    <span :class="{ 'text-error': scope.row.recStatus === 'abnormal' }">{{ Translate(DEFAULT_REC_STATUS_MAPPING[scope.row.recStatus]) }}</span>
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
