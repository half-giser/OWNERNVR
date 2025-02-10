<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column
                    type="index"
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
                    <template #default="scope: TableColumn<BusinessPkMgrEnterExitManageList>">
                        <el-select-v2
                            v-model="scope.row.direction"
                            :options="pageData.directionList"
                        />
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
                    <template #default="scope: TableColumn<BusinessPkMgrEnterExitManageList>">
                        <span :class="getChlStatus(scope.row.id)">{{ getChlStatus(scope.row.id) === 'text-online' ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_ENABLE_LED_SCREEN')"
                >
                    <template #default="scope: TableColumn<BusinessPkMgrEnterExitManageList>">
                        <el-checkbox
                            v-model="scope.row.enableLEDScreen"
                            :disabled="!scope.row.enableLEDScreenValid"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_RELATION_LED_SCREEN')"
                >
                    <template #default="scope: TableColumn<BusinessPkMgrEnterExitManageList>">
                        <el-select-v2
                            v-model="scope.row.LEDScreenType"
                            :options="pageData.screenList"
                            :disabled="!scope.row.LEDScreenTypeValid"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box padding">
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./PkMgrEnterExitManage.v.ts"></script>
