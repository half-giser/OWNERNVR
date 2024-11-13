<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 11:05:51
 * @Description: 报警输出
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableData"
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status" />
                    </template>
                </el-table-column>

                <!-- 序号 -->
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="268"
                    show-overflow-tooltip
                >
                    <template #default="scope">
                        {{ displaySerialNum(scope.row) }}
                    </template>
                </el-table-column>

                <!-- 名称 -->
                <el-table-column :label="Translate('IDCS_NAME')">
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.name"
                            @focus="nameFocus(scope.row.name)"
                            @blur="nameBlur(scope.row)"
                            @keyup.enter="enterBlur($event)"
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
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.delayTime">
                            <el-option
                                v-for="opt in pageData.delayList"
                                :key="opt.value"
                                :label="Translate(opt.label)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 排程 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.scheduleList"
                                        :key="opt.value"
                                        @click="changeScheduleAll(opt.value)"
                                    >
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.scheduleId"
                            :empty-values="[undefined, null]"
                            @change="changeSchedule(scope.row)"
                        >
                            <el-option
                                v-for="opt in pageData.scheduleList"
                                :key="opt.value"
                                :label="Translate(opt.label)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 类型 -->
                <el-table-column
                    :formatter="
                        (row) => {
                            return row.devDesc ? '--' : pageData.alarmoutTypeText[curAlarmoutType]
                        }
                    "
                >
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
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="row_pagination">
            <el-pagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :total="pageData.totalCount"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="setData()"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagePopOpen"
        @close="pageData.scheduleManagePopOpen = false"
    />
</template>

<script lang="ts" src="./AlarmOut.v.ts"></script>
