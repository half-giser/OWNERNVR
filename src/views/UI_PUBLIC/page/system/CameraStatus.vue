<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 通道状态
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
                prop="name"
                width="500"
            />
            <el-table-column
                :label="Translate('IDCS_CONNECT_STATUS')"
                min-width="150"
            >
                <template #default="{ row }: TableColumn<SystemChannelStatusList>">
                    <span :class="{ 'text-error': !row.online }">{{ row.online ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                </template>
            </el-table-column>
            <el-table-column
                v-if="!systemCaps.hotStandBy"
                :label="Translate('IDCS_MOTION_DETECTION')"
                min-width="150"
            >
                <template #default="{ row }: TableColumn<SystemChannelStatusList>">
                    {{ formatMotionStatus(row) }}
                </template>
            </el-table-column>
            <el-table-column
                v-if="systemCaps.ipChlMaxCount > 0 && !systemCaps.hotStandBy"
                :label="Translate('IDCS_AI')"
                min-width="150"
            >
                <template #default="{ row }: TableColumn<SystemChannelStatusList>">
                    {{ formatIntelligentStatus(row) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_RECORD')"
                min-width="150"
            >
                <template #default="{ row }: TableColumn<SystemChannelStatusList>">
                    <span :class="{ 'text-error': row.online && row.recStatus === 'recordingAbnormal' }">{{ formatRecStatus(row) }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./CameraStatus.v.ts"></script>
