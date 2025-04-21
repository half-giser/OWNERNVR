<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:17
 * @Description: 业务应用-停车场管理-车位管理
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
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
                    show-overflow-tooltip
                />
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_PARKING_TYPE')"
                >
                    <template #default="{ row }: TableColumn<BusinessPkMgrSpaceManageList>">
                        <el-select-v2
                            v-model="row.parkingType"
                            :options="pageData.parkingTypeList"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_TOTAL_VEHICLE_NUM')"
                >
                    <template #default="{ row }: TableColumn<BusinessPkMgrSpaceManageList>">
                        <el-input
                            v-if="row.parkingType !== 'usingGroup'"
                            disabled
                        />
                        <BaseNumberInput
                            v-else
                            v-model="row.groupTotalNum"
                            :min="0"
                            :max="10000"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    :label="Translate('IDCS_REMAIN_VEHICLE_NUM')"
                >
                    <template #default="{ row }: TableColumn<BusinessPkMgrSpaceManageList>">
                        <el-input
                            v-if="row.parkingType !== 'usingGroup'"
                            disabled
                        />
                        <BaseNumberInput
                            v-else
                            v-model="row.groupRemainNum"
                            :min="0"
                            :max="10000"
                        />
                    </template>
                </el-table-column>
                <el-table-column min-width="200">
                    <template #header>
                        <BaseScheduleTableDropdown
                            :options="pageData.scheduleList"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<BusinessPkMgrSpaceManageList>">
                        <BaseScheduleSelect
                            v-model="row.groupSchedule"
                            :options="pageData.scheduleList"
                            @edit="openSchedulePop"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_EMAIL')"
                >
                    <template #default="{ row }: TableColumn<BusinessPkMgrSpaceManageList>">
                        <el-input v-model="row.linkEmail" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between padding">
            <div class="text-tips">{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</div>
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./PkMgrSpaceManage.v.ts"></script>
