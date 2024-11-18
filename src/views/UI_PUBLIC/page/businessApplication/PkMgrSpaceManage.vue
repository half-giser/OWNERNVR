<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:17
 * @Description: 业务应用-停车场管理-车位管理
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
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
                    prop="groupName"
                    min-width="200"
                    :label="Translate('IDCS_PARKING_GROUP_NAME')"
                />
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_PARKING_TYPE')"
                >
                    <template #default="scope">
                        <el-select v-model="scope.row.parkingType">
                            <el-option
                                v-for="item in pageData.parkingTypeList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_TOTAL_VEHICLE_NUM')"
                >
                    <template #default="scope">
                        <BaseNumberInput
                            v-model="scope.row.groupTotalNum"
                            :min="1"
                            :max="10000"
                            :disabled="scope.row.parkingType !== 'usingGroup'"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_REMAIN_VEHICLE_NUM')"
                >
                    <template #default="scope">
                        <BaseNumberInput
                            v-model="scope.row.groupRemainNum"
                            :min="0"
                            :max="10000"
                            :disabled="scope.row.parkingType !== 'usingGroup'"
                        />
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
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
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_EMAIL')"
                >
                    <template #default="scope">
                        <el-input v-model="scope.row.linkEmail" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box padding"
            span="2"
        >
            <div class="tips">{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</div>
            <div>
                <el-button
                    :disabled="pageData.btnDisabled"
                    @click="apply()"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="confirmManageSchedule"
        />
    </div>
</template>

<script lang="ts" src="./PkMgrSpaceManage.v.ts"></script>

<style lang="scss" scoped>
.tips {
    font-size: 14px;
    color: var(--main-text-light);
}
</style>
