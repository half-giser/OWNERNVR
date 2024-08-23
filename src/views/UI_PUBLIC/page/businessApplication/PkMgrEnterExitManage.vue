<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->

<template>
    <div class="base-flex-box PkMgrEnterExitManageView">
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
                >
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_SERIAL_NUMBER')"
                            truncated
                        >
                            {{ Translate('IDCS_SERIAL_NUMBER') }}
                        </el-text>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="channelName"
                    min-width="200"
                >
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_ENTRY_AND_EXIT_LANE_NAME')"
                            truncated
                        >
                            {{ Translate('IDCS_ENTRY_AND_EXIT_LANE_NAME') }}
                        </el-text>
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_DIRECTION')"
                            truncated
                        >
                            {{ Translate('IDCS_DIRECTION') }}
                        </el-text>
                    </template>
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
                >
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IPC')"
                            truncated
                        >
                            {{ Translate('IPC') }}
                        </el-text>
                    </template>
                </el-table-column>
                <el-table-column width="150">
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_COMMON_STATE')"
                            truncated
                        >
                            {{ Translate('IDCS_COMMON_STATE') }}
                        </el-text>
                    </template>
                    <template #default="scope">
                        <span :class="[scope.row.ipcStatus]">{{ scope.row.ipcStatus === 'online' ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_ENABLE_LED_SCREEN')"
                            truncated
                        >
                            {{ Translate('IDCS_ENABLE_LED_SCREEN') }}
                        </el-text>
                    </template>
                    <template #default="scope">
                        <el-checkbox
                            v-model="scope.row.enableLEDScreen"
                            size="small"
                            :disabled="!scope.row.enableLEDScreenValid"
                        />
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <el-text
                            class="label"
                            :title="Translate('IDCS_RELATION_LED_SCREEN')"
                            truncated
                        >
                            {{ Translate('IDCS_RELATION_LED_SCREEN') }}
                        </el-text>
                    </template>
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
        <div class="base-btn-box">
            <el-button
                type="primary"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./PkMgrEnterExitManage.v.ts"></script>

<style lang="scss" scoped>
.PkMgrEnterExitManageView {
    width: 100%;
    height: calc(var(--content-height) + 10px);
}

.base-btn-box {
    box-sizing: border-box;
    padding: 0 15px;
}

.online {
    color: var(--color-online);
}

.offline {
    color: var(--color-offline);
}
</style>
