<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                class="tableView"
                :data="tableData"
                show-overflow-tooltip
                stripe
                border
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
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.direction"
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
                        <span :class="getChlStatus(scope.row.id)">{{ getChlStatus(scope.row.id) === 'text-online' ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_ENABLE_LED_SCREEN')"
                >
                    <template #default="scope">
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
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.LEDScreenType"
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
            <el-button
                :disabled="pageData.btnDisabled"
                @click="apply()"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./PkMgrEnterExitManage.v.ts"></script>
