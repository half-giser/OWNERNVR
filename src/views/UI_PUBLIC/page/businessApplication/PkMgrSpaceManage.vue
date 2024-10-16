<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:17
 * @Description: 业务应用-停车场管理-车位管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-10 14:18:51
-->
<template>
    <div class="base-flex-box manage">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                empty-text=" "
                table-layout="fixed"
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
                        <el-select
                            v-model="scope.row.parkingType"
                            size="small"
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
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_TOTAL_VEHICLE_NUM')"
                >
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.groupTotalNum"
                            :min="1"
                            :max="10000"
                            :controls="false"
                            value-on-clear="min"
                            :disabled="scope.row.parkingType !== 'usingGroup'"
                            size="small"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_REMAIN_VEHICLE_NUM')"
                >
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.groupRemainNum"
                            :min="0"
                            :max="10000"
                            :controls="false"
                            value-on-clear="min"
                            :disabled="scope.row.parkingType !== 'usingGroup'"
                            size="small"
                        />
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <el-dropdown trigger="click">
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
                            size="small"
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
                        <el-input
                            v-model="scope.row.linkEmail"
                            size="small"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box padding"
            :span="2"
        >
            <div>{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</div>
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
.manage {
    width: 100%;
    height: calc(var(--content-height) + 10px);
}
</style>
