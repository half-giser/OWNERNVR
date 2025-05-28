<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:40
 * @Description: 闪灯
-->
<template>
    <div class="base-flex-box">
        <div class="base-head-box">{{ Translate('IDCS_LIGHT') }}</div>
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
            >
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="{ row }: TableColumn<AlarmWhiteLightDto>">
                        <BaseTableRowStatus :icon="row.status" />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CHANNEL')"
                    prop="name"
                    show-overflow-tooltip
                />
                <!-- 启用 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENABLE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.label"
                                        @click="changeAllEnable(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmWhiteLightDto>">
                        <el-select-v2
                            v-model="row.enable"
                            :placeholder="Translate('IDCS_ON')"
                            :disabled="row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 闪烁时间 -->
                <el-table-column :label="Translate('IDCS_FLASHING_TIME')">
                    <template #default="{ row }: TableColumn<AlarmWhiteLightDto>">
                        <el-input
                            v-if="row.disabled"
                            disabled
                        />
                        <BaseNumberInput
                            v-else
                            v-model="row.durationTime"
                            :disabled="!row.enable"
                            :min="1"
                            :max="60"
                            @keyup.enter="blurInput"
                        />
                    </template>
                </el-table-column>
                <!-- 闪烁频率 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_FLASHING_FREQUENCY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.lightFrequencyList"
                                        :key="item.value"
                                        @click="changeAllFrequencyType(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmWhiteLightDto>">
                        <el-select-v2
                            v-model="row.frequencyType"
                            :disabled="!row.enable"
                            :options="pageData.lightFrequencyList"
                        />
                    </template>
                </el-table-column>
                <!-- 排程 -->
                <el-table-column width="130">
                    <template #header>
                        <BaseScheduleTableDropdown
                            :options="pageData.scheduleList"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<AlarmWhiteLightDto>">
                        <BaseScheduleSelect
                            v-model="scheduleData[row.id]"
                            :disabled="row.disabled"
                            :options="pageData.scheduleList"
                            @edit="openSchedulePop"
                        />
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
                :disabled="!editRows.size() && editSchedule.disabled.value"
                @click="setData()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./Light.v.ts"></script>

<style lang="scss" scoped>
.margin {
    margin-top: 10px;
}
</style>
