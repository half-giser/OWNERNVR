<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 15:46:35
 * @Description: 报警图像上传
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item :label="Translate('IDCS_ALARM_TYPE')">
                <el-select-v2
                    v-model="pageData.alarmType"
                    :options="pageData.alarmTypeList"
                />
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
            >
                <!-- 通道号 -->
                <el-table-column
                    prop="chlNum"
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    min-width="6%"
                />
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_ALARM_CHANNEL_NAME')"
                    min-width="35%"
                />
                <!-- 预截图时间 -->
                <el-table-column min-width="27%">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PRE_SNAP_TIME') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.pretimeList"
                                        :key="item.value"
                                        @click="handlePreTimeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.preTime"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.pretimeList"
                        />
                    </template>
                </el-table-column>
                <!-- 截图持续时间 -->
                <el-table-column min-width="27%">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SNAP_DURATION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.saveTimeList"
                                        :key="item.value"
                                        @click="handleSaveTimeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.saveTime"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.saveTimeList"
                        />
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
