<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:44:11
 * @Description: 智能分析-人员统计
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left">
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <IntelBaseChannelSelector
                        v-model="formData.chl"
                        :keep-removed-chl="false"
                        @update:model-value="changeChl"
                        @ready="getChlMap"
                    />
                    <IntelBaseEventSelector
                        v-model="formData.event"
                        :range="['person']"
                        @update:model-value="changeEvent"
                        @ready="getEventMap"
                    />
                    <IntelBaseProfileSelector
                        v-show="formData.event[0] === 'videoMetadata'"
                        v-model="formData.attribute"
                        :range="['person']"
                        @update:model-value="changeAttr"
                    />
                </div>
            </div>
        </div>
        <div class="base-intel-center">
            <div class="base-intel-row">
                <BaseDateTab
                    :model-value="formData.dateRange"
                    :layout="['date', 'week', 'month', 'quarter', 'custom', 'today']"
                    custom-type="day"
                    @change="changeDateRange"
                />
            </div>
            <div class="base-intel-row">
                <BaseDateRange
                    :model-value="formData.dateRange"
                    :type="pageData.dateRangeType"
                    custom-type="day"
                    @change="changeDateRange"
                />
            </div>
            <div class="base-intel-row">
                <BaseDropdown v-show="formData.event[0] === 'faceMatchWhiteList'">
                    <BaseTableDropdownLink effect="plain">
                        {{ pageData.chartType === 'chart' ? Translate('IDCS_COLIMNAR_CHART') : Translate('IDCS_DETAIL_CHART') }}
                    </BaseTableDropdownLink>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item
                                v-for="item in pageData.chartOptions"
                                :key="item.value"
                                @click="changeType(item.value)"
                                >{{ item.label }}</el-dropdown-item
                            >
                        </el-dropdown-menu>
                    </template>
                </BaseDropdown>
                <el-text v-show="formData.event[0] !== 'faceMatchWhiteList'">{{ Translate('IDCS_COLIMNAR_CHART') }}</el-text>
            </div>
            <div
                v-if="pageData.chartType === 'chart'"
                class="base-intel-chart-box"
            >
                <BaseBarChart
                    :x-value="pageData.barData.xValue"
                    :unit="pageData.barData.unit"
                    :write-y="pageData.barData.writeY"
                    :write-y-spacing="pageData.barData.writeYSpacing"
                    :y-value="pageData.barData.yValue"
                    :unit-num="pageData.barData.unitNum"
                    :color="pageData.barData.color"
                    :tooltip="pageData.barData.tooltip"
                />
                <el-checkbox
                    v-show="formData.event[0] === 'passengerFlow'"
                    v-model="onlyChild"
                    :label="Translate('IDCS_ONLY_CHILD_COUNT')"
                    class="base-only-child-checkbox"
                    @change="handleOnlyChildChange"
                />
            </div>
            <div
                v-show="pageData.chartType === 'table'"
                class="base-table-box"
            >
                <el-table :data="pageData.tableData.data">
                    <el-table-column
                        prop="groupName"
                        width="150"
                        show-overflow-tooltip
                        :label="Translate('IDCS_GROUP_NAME')"
                    />
                    <el-table-column
                        v-for="(label, index) in pageData.tableData.label"
                        :key="label"
                        :label="label"
                        min-width="80"
                    >
                        <template #default="{ row }: TableColumn<IntelStatsBarChartDataDto>">
                            <span :class="{ 'text-error': row.data[index] }">{{ row.data[index] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button @click="exportChart">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelPersonStats.v.ts"></script>
