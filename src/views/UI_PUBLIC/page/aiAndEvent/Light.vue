<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:40
 * @Description: 闪灯
-->
<template>
    <div class="base-flex-box">
        <div class="base-subheading-box">{{ Translate('IDCS_LIGHT') }}</div>
        <div class="base-table-box">
            <el-table :data="tableData">
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
                        <BaseNumberInput
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
        <div class="base-subheading-box margin">{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE') }}</div>
        <el-form
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                <el-select-v2
                    v-model="pageData.schedule"
                    :options="pageData.scheduleList"
                    @change="changeSchedule()"
                />
                <el-button @click="openSchedulePop()">
                    {{ Translate('IDCS_MANAGE') }}
                </el-button>
            </el-form-item>
            <div class="tip">*{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE_TIPS') }}</div>
        </el-form>
        <div class="base-btn-box padding">
            <el-button
                :disabled="!editRows.size() && !pageData.scheduleChanged"
                @click="setData()"
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

<script lang="ts" src="./Light.v.ts"></script>

<style lang="scss" scoped>
.tip {
    color: var(--main-text-light);
    font-size: 14px;
    padding-left: 10px;
}

.margin {
    margin-top: 20px;
}
</style>
