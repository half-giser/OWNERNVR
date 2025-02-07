<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 通道状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            :data="tableData"
            height="100%"
            show-overflow-tooltip
        >
            <el-table-column
                :label="Translate('IDCS_CHANNEL_NAME')"
                prop="name"
            />
            <el-table-column :label="Translate('IDCS_CONNECT_STATUS')">
                <template #default="scope: TableColumn<SystemChannelStatusList>">
                    <span :class="{ 'text-error': !scope.row.online }">{{ scope.row.online ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_MOTION_DETECTION')">
                <template #default="scope: TableColumn<SystemChannelStatusList>">
                    {{ formatMotionStatus(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column
                v-if="systemCaps.ipChlMaxCount > 0"
                :label="Translate('IDCS_AI')"
            >
                <template #default="scope: TableColumn<SystemChannelStatusList>">
                    {{ formatIntelligentStatus(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD')">
                <template #default="scope: TableColumn<SystemChannelStatusList>">
                    <span :class="{ 'text-error': scope.row.online && scope.row.recStatus === 'recordingAbnormal' }">{{ formatRecStatus(scope.row) }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./CameraStatus.v.ts"></script>
