<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->

<template>
    <div id="PkMgrEnterExitManageView">
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

        <el-row class="enterExitMgrBottom">
            <el-button
                type="primary"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </el-row>
    </div>
</template>

<script lang="ts" src="./PkMgrEnterExitManage.v.ts"></script>

<style lang="scss" scoped>
#PkMgrEnterExitManageView {
    .tableView {
        width: 100%;
        height: calc(100vh - 273px);
    }
    height: 100%;
    display: flex;
    flex-direction: column;
    :deep(.el-table) {
        :deep(.el-input.is-disabled) {
            user-select: none;
            .el-input__wrapper {
                cursor: not-allowed;
                .el-input__inner {
                    pointer-events: none;
                    -webkit-text-fill-color: var(--color-transparent);
                }
            }
        }
    }
    .online {
        color: var(--color-online);
    }
    .offline {
        color: var(--color-offline);
    }
    .enterExitMgrBottom {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 0 14px;
    }
}
</style>
