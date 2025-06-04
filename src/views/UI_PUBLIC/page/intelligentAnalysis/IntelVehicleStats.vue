<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:57:44
 * @Description: 智能分析-车辆统计
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left">
            <!-- 汽车、摩托车/单车、车牌号 tab -->
            <el-radio-group
                v-model="pageData.searchType"
                size="large"
                class="inline hide-border-top hide-border-inline tab_container"
                @change="changeTab"
            >
                <el-radio-button
                    v-for="item in pageData.searchOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
            <!-- 时间、通道、属性、车牌号等条件筛选 -->
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <IntelBaseChannelSelector
                        v-model="formData.chl"
                        :keep-removed-chl="false"
                        @update:model-value="changeChl"
                        @ready="getChlMap"
                    />
                    <IntelBaseEventSelector
                        v-show="pageData.searchType === 'byCar' || pageData.searchType === 'byMotorcycle'"
                        v-model="pageData.event"
                        :range="['vehicle']"
                        @update:model-value="changeEvent"
                        @ready="getEventMap"
                    />
                    <IntelBaseEventSelector
                        v-show="pageData.searchType === 'byPlateNumber'"
                        v-model="pageData.eventForPlate"
                        :range="['plate']"
                        @update:model-value="changeEvent"
                        @ready="getEventMap"
                    />
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byCar' && formData.event[0] === 'videoMetadata'"
                        v-model="pageData.attributeForCar"
                        :range="['car']"
                        @update:model-value="changeAttribute"
                    />
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byMotorcycle' && formData.event[0] === 'videoMetadata'"
                        v-model="pageData.attributeForMotor"
                        :range="['motor']"
                        @update:model-value="changeAttribute"
                    />
                </div>
            </div>
        </div>
        <div class="base-intel-right">
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
                        @change="changeDeDuplicate"
                    />
                </div>
                <el-button @click="exportChart">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelVehicleStats.v.ts"></script>
