<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:17
 * @Description: 业务应用-停车场管理-车位管理
-->

<template>
    <div id="PkMgrSpaceManageView">
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
                prop="groupName"
                min-width="200"
            >
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_PARKING_GROUP_NAME')"
                        truncated
                    >
                        {{ Translate('IDCS_PARKING_GROUP_NAME') }}
                    </el-text>
                </template>
            </el-table-column>
            <el-table-column min-width="200">
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_PARKING_TYPE')"
                        truncated
                    >
                        {{ Translate('IDCS_PARKING_TYPE') }}
                    </el-text>
                </template>
                <template #default="scope">
                    <el-select
                        v-model="scope.row.parkingType"
                        size="small"
                        collapse-tags-tooltip
                    >
                        <el-option
                            v-for="item in pageData.parkingTypeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column width="200">
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_TOTAL_VEHICLE_NUM')"
                        truncated
                    >
                        {{ Translate('IDCS_TOTAL_VEHICLE_NUM') }}
                    </el-text>
                </template>
                <template #default="scope">
                    <el-input
                        v-model.number="scope.row.groupTotalNum"
                        v-numericalRange:[scope.row].groupTotalNum="[1, 10000]"
                        :disabled="scope.row.parkingType !== 'usingGroup'"
                        size="small"
                    />
                </template>
            </el-table-column>
            <el-table-column width="200">
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_REMAIN_VEHICLE_NUM')"
                        truncated
                    >
                        {{ Translate('IDCS_REMAIN_VEHICLE_NUM') }}
                    </el-text>
                </template>
                <template #default="scope">
                    <el-input
                        v-model.number="scope.row.groupRemainNum"
                        v-numericalRange:[scope.row].groupRemainNum="[0, 10000]"
                        :disabled="scope.row.parkingType !== 'usingGroup'"
                        size="small"
                    />
                </template>
            </el-table-column>
            <el-table-column min-width="200">
                <template #header>
                    <el-dropdown trigger="click">
                        <el-text
                            class="label el-dropdown-link"
                            :title="Translate('IDCS_SCHEDULE')"
                            truncated
                        >
                            {{ Translate('IDCS_SCHEDULE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </el-text>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in pageData.scheduleList"
                                    :key="item.value"
                                    @click="changeAllSchedule(item.value)"
                                >
                                    {{ item.label }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-select
                        v-model="scope.row.groupSchedule"
                        size="small"
                        collapse-tags-tooltip
                        @change="changeSingleSchedule(scope.row)"
                    >
                        <el-option
                            v-for="item in pageData.scheduleList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column min-width="200">
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_EMAIL')"
                        truncated
                    >
                        {{ Translate('IDCS_EMAIL') }}
                    </el-text>
                </template>
                <template #default="scope">
                    <el-input
                        v-model="scope.row.linkEmail"
                        size="small"
                    />
                </template>
            </el-table-column>
        </el-table>

        <el-row class="spaceMgrBottom">
            <el-text
                class="tip"
                :title="Translate('IDCS_VEHICLE_NUM_TIPS')"
                truncated
            >
                {{ Translate('IDCS_VEHICLE_NUM_TIPS') }}
            </el-text>
            <el-button
                class="apply"
                type="primary"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </el-row>
    </div>
</template>

<script lang="ts" src="./PkMgrSpaceManage.v.ts"></script>

<style lang="scss" scoped>
#PkMgrSpaceManageView {
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
    .spaceMgrBottom {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 14px;
        .tip {
            flex: 1;
            color: var(--text-menu-03);
            font-size: 14px;
        }
        .apply {
            max-width: 200px;
            margin-left: 10px;
        }
    }
}
</style>
