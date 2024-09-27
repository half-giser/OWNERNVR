<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:40
 * @Description: 闪灯
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 14:53:51
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="pageData.scheduleManagePopOpen = false"
        >
        </ScheduleManagPop>
        <div class="whiteLight_main">
            <div class="base-subheading-box">{{ Translate('IDCS_LIGHT') }}</div>
            <div class="flash_setting">
                <el-table
                    id="whiteLightAlarmOutGrid"
                    :data="tableData"
                    stripe
                    border
                    height="359px"
                    highlight-current-row
                    show-overflow-tooltip
                >
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <div
                                v-if="scope.row.status === 'loading'"
                                class="table_status_col_loading"
                                :title="tableRowStatusToolTip[scope.row.statusTip]"
                            ></div>
                            <BaseImgSprite
                                v-else-if="scope.row.status === 'success'"
                                file="success"
                                :chunk="1"
                                :index="0"
                                :title="tableRowStatusToolTip[scope.row.statusTip]"
                            />
                            <BaseImgSprite
                                v-else-if="scope.row.status === 'error'"
                                file="error"
                                :chunk="1"
                                :index="0"
                                :title="tableRowStatusToolTip[scope.row.statusTip]"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL')"
                        width="207.11px"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="enable"
                        width="258.64px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_ENABLE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
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
                                :disabled="scope.row.enableDisable"
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
                    <el-table-column
                        prop="durationTime"
                        :label="Translate('IDCS_FLASHING_TIME')"
                        width="207.11px"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.durationTime"
                                :disabled="scope.row.durationTimeDisable"
                                placeholder="undefined"
                                @change="handleDurationTimeChange(scope.row)"
                                @focus="handleDurationTimeFocus(scope.row)"
                                @blur="handleDurationTimeBlur(scope.row)"
                                @keydown.enter="handleDurationTimeKeydown(scope.row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="frequencyType"
                        width="155.58px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_FLASHING_FREQUENCY') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
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
                                :disabled="scope.row.frequencyTypeDisable"
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
                <el-row class="row_pagination">
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
                </el-row>
            </div>
            <div class="base-subheading-box">{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE') }}</div>
            <div class="flash_scheduleCfg">
                <el-row>
                    <el-col :span="3">
                        <span id="config_title">{{ Translate('IDCS_SCHEDULE_CONFIG') }}</span>
                    </el-col>
                    <el-col :span="4">
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
                    </el-col>
                    <el-col :span="6">
                        <el-button @click="popOpen()">
                            {{ Translate('IDCS_MANAGE') }}
                        </el-button>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col id="col_tips">
                        <span id="tips">*{{ Translate('IDCS_FLASH_LIGHT_LINK_SCHEDULE_TIPS') }}</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col id="col_apply">
                        <el-button
                            id="apply_button"
                            :disabled="pageData.applyDisable"
                            @click="setData()"
                            >{{ Translate('IDCS_APPLY') }}</el-button
                        >
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./Light.v.ts"></script>

<style lang="scss" scoped>
.flash_setting {
    height: 416px;
    padding: 15px;
}
.flash_scheduleCfg {
    padding: 15px 0 0 15px;
    .el-row {
        #config_title {
            font-size: 15px;
        }
        .el-col {
            margin-right: 5px;
        }
        .el-button {
            height: 25px;
            width: 80px;
        }
    }
    #col_tips {
        margin-top: 5px;
        #tips {
            color: #8d8d8d;
            font-size: 14px;
        }
    }
    #col_apply {
        margin-top: 80px;
        display: flex;
        justify-content: flex-end;
        #apply_button {
            margin-right: 10px;
            height: 25px;
            width: 80px;
        }
    }
}
</style>
