<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:47
 * @Description: 移动侦测
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                highlight-current-row
                show-overflow-tooltip
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status" />
                    </template>
                </el-table-column>
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="150"
                />
                <!-- 排程   -->
                <el-table-column width="130">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        @click="handleScheduleChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.schedule.value"
                            :disabled="scope.row.rowDisable"
                            @change="handleScheduleChangeSingle(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.scheduleList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 录像   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseRecordPop
                            :visible="pageData.recordIsShow"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeRecord"
                        />
                    </template>
                    <template #default="scope">
                        <div class="row-together">
                            <el-checkbox
                                v-model="scope.row.record.switch"
                                :disabled="scope.row.rowDisable"
                                @change="switchRecord(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.record.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 抓图   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseSnapPop
                            :visible="pageData.snapIsShow"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeSnap"
                        />
                    </template>
                    <template #default="scope">
                        <div class="row-together">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                :disabled="scope.row.rowDisable"
                                @change="switchSnap(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.snap.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="165"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_AUDIO') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioList"
                                        :key="item.value"
                                        @click="handleSysAudioChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.sysAudio"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.audioList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column width="150">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="handleMsgPushChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.msgPush"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 报警输出   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.alarmOutIsShow"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="scope">
                        <div class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="switchAlarmOut(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 预置点名称   -->
                <el-table-column
                    width="180"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="scope">
                        <div class="row-together">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                :disabled="scope.row.rowDisable"
                                @change="switchPreset(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.preset.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openPreset(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 蜂鸣器   -->
                <el-table-column width="119">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="handleBeeperChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.beeper"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 视频弹出   -->
                <el-table-column width="135">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="handleVideoPopupChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoPopup"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- email   -->
                <el-table-column width="110">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink> Email </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="handleEmailChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.email"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-pagination-box">
            <el-pagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :total="pageData.totalCount"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button @click="handleMotionSetting">
                {{ Translate('IDCS_MOTION_SETTING') }}
            </el-button>
            <el-button
                :disabled="pageData.applyDisable"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <AlarmBasePresetPop
            v-model="pageData.isPresetPopOpen"
            :data="tableData"
            :index="pageData.triggerDialogIndex"
            @confirm="changePreset"
        />
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
    </div>
</template>

<script lang="ts" src="./MotionEventConfig.v.ts"></script>

<style lang="scss" scoped>
:deep(.el-table .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
