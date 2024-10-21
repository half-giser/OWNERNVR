<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:40
 * @Description: 闪灯
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-21 15:09:42
-->
<template>
    <div class="base-flex-box">
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        >
        </ScheduleManagPop>
        <div class="base-subheading-box">{{ Translate('IDCS_LIGHT') }}</div>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                stripe
                border
                highlight-current-row
                :row-class-name="(data) => (data.row.rowDisable ? 'disabled' : '')"
                show-overflow-tooltip
            >
                <el-table-column
                    label=" "
                    width="50px"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL')"
                >
                </el-table-column>
                <!-- 启用 -->
                <el-table-column prop="enable">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENABLE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleEnabelChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.enable"
                            prop="enable"
                            value-key="value"
                            :placeholder="Translate('IDCS_ON')"
                            :options="pageData.enableList"
                            :disabled="scope.row.rowDisable"
                            @change="handleEnabelChange(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 闪烁时间 -->
                <el-table-column
                    prop="durationTime"
                    :label="Translate('IDCS_FLASHING_TIME')"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.durationTime"
                            :disabled="scope.row.durationTimeDisable || scope.row.rowDisable"
                            @change="handleDurationTimeChange(scope.row)"
                            @focus="handleDurationTimeFocus(scope.row)"
                            @blur="handleDurationTimeBlur(scope.row)"
                            @keydown.enter="handleDurationTimeKeydown(scope.row)"
                        />
                    </template>
                </el-table-column>
                <!-- 闪烁频率 -->
                <el-table-column prop="frequencyType">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_FLASHING_FREQUENCY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.lightFrequencyList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleFrequencyTypeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.frequencyType"
                            prop="frequencyType"
                            value-key="value"
                            placeholder=""
                            :options="pageData.lightFrequencyList"
                            :disabled="scope.row.frequencyTypeDisable || scope.row.rowDisable"
                            @change="handleFrequencyTypeChange(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.lightFrequencyList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="row_pagination">
            <el-pagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :page-sizes="pageData.pageDataCountItems"
                layout="prev, pager, next, sizes, total, jumper"
                :total="pageData.totalCount"
                size="small"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-subheading-box margin">{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE') }}</div>
        <el-form
            label-position="left"
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                <el-select
                    v-model="pageData.schedule"
                    prop="schedule"
                    value-key="value"
                    placeholder="<无>"
                    size="small"
                    :options="pageData.scheduleList"
                    @change="handleScheduleChange()"
                >
                    <el-option
                        v-for="item in pageData.scheduleList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    >
                    </el-option>
                </el-select>
                <el-button
                    size="small"
                    @click="popOpen()"
                >
                    {{ Translate('IDCS_MANAGE') }}
                </el-button>
            </el-form-item>
            <div class="tip">*{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE_TIPS') }}</div>
        </el-form>
        <div class="base-btn-box padding">
            <el-button
                :disabled="pageData.applyDisable"
                @click="setData()"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
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
