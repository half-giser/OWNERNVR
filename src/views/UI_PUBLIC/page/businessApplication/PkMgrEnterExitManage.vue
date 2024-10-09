<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->

<template>
    <div class="base-flex-box manager">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                class="tableView"
                :data="pageData.tableDatas"
                empty-text=" "
                table-layout="fixed"
                show-overflow-tooltip
                stripe
                border
            >
                <el-table-column
                    prop="serialNum"
                    width="70"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                />
                <el-table-column
                    prop="channelName"
                    min-width="200"
                    :label="Translate('IDCS_ENTRY_AND_EXIT_LANE_NAME')"
                />
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_DIRECTION')"
                >
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.direction"
                            size="small"
                            collapse-tags-tooltip
                        >
                            <el-option
                                v-for="item in pageData.directionList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="ipc"
                    width="400"
                    :label="Translate('IPC')"
                />
                <el-table-column
                    width="150"
                    :label="Translate('IDCS_COMMON_STATE')"
                >
                    <template #default="scope">
                        <span :class="[scope.row.ipcStatus]">{{ scope.row.ipcStatus === 'online' ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_ENABLE_LED_SCREEN')"
                >
                    <template #default="scope">
                        <el-checkbox
                            v-model="scope.row.enableLEDScreen"
                            size="small"
                            :disabled="!scope.row.enableLEDScreenValid"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_RELATION_LED_SCREEN')"
                >
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.LEDScreenType"
                            placeholder=""
                            size="small"
                            collapse-tags-tooltip
                            :disabled="!scope.row.LEDScreenTypeValid"
                        >
                            <el-option
                                v-for="item in pageData.screenList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box padding">
            <el-button @click="apply()">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./PkMgrEnterExitManage.v.ts"></script>

<style lang="scss" scoped>
.manager {
    width: 100%;
    height: calc(var(--content-height) + 10px);
}

.online {
    color: var(--color-online);
}

.offline {
    color: var(--color-offline);
}
</style>
