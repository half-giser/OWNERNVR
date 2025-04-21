<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 11:05:51
 * @Description: 报警输出
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="{ row }: TableColumn<AlarmOutDto>">
                        <BaseTableRowStatus :icon="row.status" />
                    </template>
                </el-table-column>
                <!-- 序号 -->
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="268"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<AlarmOutDto>">
                        {{ displaySerialNum(row) }}
                    </template>
                </el-table-column>
                <!-- 名称 -->
                <el-table-column :label="Translate('IDCS_NAME')">
                    <template #default="{ row }: TableColumn<AlarmOutDto>">
                        <el-input
                            v-model="row.name"
                            :disabled="row.disabled"
                            maxlength="32"
                            @focus="focusName(row.name)"
                            @blur="blurName(row)"
                            @keyup.enter="blurInput"
                        />
                    </template>
                </el-table-column>
                <!-- 延时 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELAY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.delayList"
                                        :key="opt.value"
                                        @click="changeAllValue(opt.value, 'delayTime')"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmOutDto>">
                        <el-select-v2
                            v-model="row.delayTime"
                            :disabled="row.disabled"
                            :options="pageData.delayList"
                        />
                    </template>
                </el-table-column>
                <!-- 排程 -->
                <el-table-column>
                    <template #header>
                        <BaseScheduleTableDropdown
                            :options="pageData.scheduleList"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<AlarmOutDto>">
                        <BaseScheduleSelect
                            v-model="row.scheduleId"
                            :options="pageData.scheduleList"
                            :disabled="row.disabled"
                            @edit="openSchedulePop"
                        />
                    </template>
                </el-table-column>
                <!-- 类型 -->
                <el-table-column :formatter="displayAlarmOutType">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_TYPE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu :disabled="pageData.localAlarmOutCount === 0">
                                    <el-dropdown-item
                                        v-for="opt in pageData.typeList"
                                        :key="opt.value"
                                        @click="changeType(opt.value)"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-pagination-box">
            <BasePagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :total="pageData.totalCount"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="!editRows.size()"
                @click="setData()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.isSchedulePop"
        @close="closeSchedulePop"
    />
</template>

<script lang="ts" src="./AlarmOut.v.ts"></script>
