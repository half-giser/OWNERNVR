<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:44:11
 * @Description: 智能分析-人员统计
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 17:26:40
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left">
            <IntelBaseChannelSelector
                v-model="formData.chl"
                @update:model-value="changeChl"
                @ready="getChlMap"
            />
            <IntelBaseEventSelector
                v-model="formData.event"
                @update:model-value="changeEvent"
                @ready="getEventMap"
            />
        </div>
        <div class="base-intel-right">
            <div class="base-intel-row">
                <BaseDateTab
                    :model-value="formData.dateRange"
                    :layout="['date', 'week', 'month', 'quarter', 'custom', 'today']"
                    @change="changeDateRange"
                />
            </div>
            <div class="base-intel-row">
                <BaseDateRange
                    :model-value="formData.dateRange"
                    :type="pageData.dateRangeType"
                    @change="changeDateRange"
                />
            </div>
            <div class="base-intel-row">
                <el-dropdown
                    v-show="formData.event[0] === 'faceMatchWhiteList'"
                    trigger="click"
                >
                    <span class="el-dropdown-link">
                        {{ Translate('IDCS_COLIMNAR_CHART') }}
                        <BaseImgSprite
                            class="ddn"
                            file="ddn"
                        />
                    </span>
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
                </el-dropdown>
                <el-text v-show="formData.event[0] !== 'faceMatchWhiteList'">{{ Translate('IDCS_COLIMNAR_CHART') }}</el-text>
            </div>
            <div
                v-show="pageData.chartType === 'chart'"
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
            </div>
            <div
                v-show="pageData.chartType === 'table'"
                class="base-table-box"
            >
                <el-table
                    border
                    stripe
                    :data="pageData.tableData.data"
                >
                    <el-table-column
                        prop="chlName"
                        width="150px"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                    />
                    <el-table-column
                        v-for="(label, index) in pageData.tableData.label"
                        :key="label"
                        :label="label"
                    >
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.data[index] }">{{ scope.row.data[index] }}</span>
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

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>
