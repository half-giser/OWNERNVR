<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:57:44
 * @Description: 智能分析-车辆统计
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
                :range="['vehicle']"
                @update:model-value="changeEvent"
                @ready="getEventMap"
            />
            <IntelBaseAttributeSelector
                :model-value="[formData.attribute, []]"
                @update:model-value="changeAttribute"
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
                <el-text>{{ Translate('IDCS_COLIMNAR_CHART') }}</el-text>
            </div>
            <div class="base-intel-chart-box">
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
            <div class="base-btn-box space-between">
                <div>
                    <el-checkbox
                        v-show="['plateDetection', 'plateMatchWhiteList', 'plateMatchStranger'].includes(formData.event[0] || '')"
                        v-model="formData.deduplicate"
                        :label="Translate('IDCS_REMOVE_DUPLICATE_LICENSE_PLATE')"
                    />
                </div>
                <el-button @click="exportChart">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelVehicleStats.v.ts"></script>
