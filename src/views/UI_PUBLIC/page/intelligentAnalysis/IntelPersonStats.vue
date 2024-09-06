<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:44:11
 * @Description: 智能分析-人员统计
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:36:01
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
                @update:model-value="changeEvent"
                @ready="getEventMap"
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
                class="chart"
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
                class="table"
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
                            <span :class="{ error: scope.row.data[index] }">{{ scope.row.data[index] }}</span>
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

.table {
    width: 100%;
    height: calc(100vh - 430px);
    margin: 20px auto 20px;

    .el-table {
        height: 100%;
    }
}

.error {
    color: var(--error--01);
}
</style>
