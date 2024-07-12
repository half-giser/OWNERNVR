<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 通道状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 17:47:11
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
                prop="name"
            >
            </el-table-column>
            <el-table-column :label="Translate('IDCS_CONNECT_STATUS')">
                <template #default="scope">
                    <span :class="{ error: !scope.row.online }">{{ scope.row.online ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_MOTION_DETECTION')">
                <template #default="scope">
                    <span>{{ formatMotionStatus(scope.row) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_AI')">
                <template #default="scope">
                    <span>{{ formatIntelligentStatus(scope.row) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_RECORD')">
                <template #default="scope">
                    <span :class="{ error: scope.row.online && scope.row.recStatus === 'recordingAbnormal' }">{{ formatRecStatus(scope.row) }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./CameraStatus.v.ts"></script>

<style lang="scss" scoped>
.error {
    color: var(--error--01);
}
</style>
