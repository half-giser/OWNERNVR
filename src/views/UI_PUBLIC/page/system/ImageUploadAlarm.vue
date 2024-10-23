<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 15:46:35
 * @Description: 报警图像上传
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-23 17:23:49
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="stripe"
            label-position="left"
            :model="pageData"
            inline-message
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item :label="Translate('IDCS_ALARM_TYPE')">
                <el-select
                    v-model="pageData.alarmType"
                    value-key="value"
                    :options="pageData.alarmTypeList"
                >
                    <el-option
                        v-for="item in pageData.alarmTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableData"
                show-overflow-tooltip
            >
                <!-- 通道号 -->
                <el-table-column
                    prop="chlNum"
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    min-width="6%"
                >
                </el-table-column>
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_ALARM_CHANNEL_NAME')"
                    min-width="35%"
                >
                </el-table-column>
                <!-- 预截图时间 -->
                <el-table-column
                    prop="preTime"
                    min-width="27%"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PRE_SNAP_TIME') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.pretimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handlePreTimeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.preTime"
                            prop="enable"
                            value-key="value"
                            :options="pageData.pretimeList"
                            :disabled="scope.row.rowDisable"
                        >
                            <el-option
                                v-for="item in pageData.pretimeList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 截图持续时间 -->
                <el-table-column
                    prop="saveTime"
                    min-width="27%"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SNAP_DURATION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.saveTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleSaveTimeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.saveTime"
                            prop="enable"
                            value-key="value"
                            :options="pageData.saveTimeList"
                            :disabled="scope.row.rowDisable"
                        >
                            <el-option
                                v-for="item in pageData.saveTimeList"
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
        <div class="base-btn-box">
            <el-button @click="setDispose">{{ Translate('IDCS_DISPOSE_WAY') }}</el-button>
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./ImageUploadAlarm.v.ts"></script>
