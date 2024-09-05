<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:57:44
 * @Description: 智能分析-车辆统计
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:09:46
-->
<template>
    <div class="stats">
        <div class="left">
            <IntelBaseChannelSelector
                v-model="formData.chl"
                @update:model-value="changeChl"
                @ready="getChlMap"
            />
            <IntelBaseEventSelector
                v-model="formData.event"
                :range="['vehicle']"
                @update:model-value="changeEvent"
                @ready="getEventMap"
            />
            <IntelBaseAttributeSelector
                :model-value="[formData.attribute, []]"
                @update:model-value="changeAttribute"
            />
        </div>
        <div class="right">
            <div class="row">
                <BaseDateTab
                    :model-value="formData.dateRange"
                    :layout="['date', 'week', 'month', 'quarter', 'custom', 'today']"
                    @change="changeDateRange"
                />
            </div>
            <div class="row">
                <BaseDateRange
                    :model-value="formData.dateRange"
                    :type="pageData.dateRangeType"
                    @change="changeDateRange"
                />
            </div>
            <div class="row">
                <el-text>{{ Translate('IDCS_COLIMNAR_CHART') }}</el-text>
            </div>
            <div class="chart">
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
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <el-checkbox
                        v-show="['plateDetection', 'plateMatchWhiteList', 'plateMatchStranger'].includes(formData.event[0] || '')"
                        v-model="formData.deduplicate"
                        >{{ Translate('IDCS_REMOVE_DUPLICATE_LICENSE_PLATE') }}</el-checkbox
                    >
                </div>
                <div>
                    <el-button @click="exportChart">{{ Translate('IDCS_EXPORT') }}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelVehicleStats.v.ts"></script>

<style lang="scss" scoped>
.stats {
    width: 100%;
    height: 100%;
    min-width: 1200px;
    display: flex;
}

.left {
    width: 25%;
    height: 100%;
    border-right: 1px solid var(--border-color8);
    box-sizing: border-box;
    padding: 20px;
}

.right {
    width: 75%;
    height: 100%;
    box-sizing: border-box;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.row {
    width: 100%;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
}

.chart {
    display: flex;
    justify-content: center;
    width: 900px;
    height: calc(100vh - 450px);
    margin: 20px auto 40px;
}

.error {
    color: var(--error--01);
}
</style>
