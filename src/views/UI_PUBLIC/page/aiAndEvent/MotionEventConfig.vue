<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:47
 * @Description: 移动侦测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-04 15:53:17
-->
<template>
    <div class="base-flex-box">
        <BaseTransferDialog
            v-model="pageData.recordIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_RECORD"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.recordList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.recordList || []"
            limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
            @confirm="recordConfirm"
            @close="recordClose"
        />
        <BaseTransferDialog
            v-model="pageData.snapIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.snapList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.snapList || []"
            limit-tip="IDCS_SNAP_CHANNEL_LIMIT"
            @confirm="snapConfirm"
            @close="snapClose"
        />
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="pageData.alarmOutList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            limit-tip="IDCS_ALARMOUT_LIMIT"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        />
        <SetPresetPop
            v-model="pageData.isPresetPopOpen"
            :filter-chl-id="pageData.presetChlId"
            :linked-list="pageData.presetLinkedList"
            @confirm="handlePresetLinkedList"
            @close="presetClose"
        />
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
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
                                        :value="item.value"
                                        :label="item.label"
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
                        <el-popover
                            v-model:visible="pageData.recordPopoverVisible"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_RECORD') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.recordPopoverVisible"
                                source-title="IDCS_CHANNEL"
                                target-title="IDCS_CHANNEL_TRGGER"
                                :source-data="pageData.recordList"
                                :linked-list="pageData.recordChosedIdsAll"
                                limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
                                @confirm="recordConfirmAll"
                                @close="recordCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.record.switch"
                                :disabled="scope.row.rowDisable"
                                @change="checkChange(scope.$index, 'record')"
                            />
                            <el-button
                                :disabled="!scope.row.record.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 抓图   -->
                <el-table-column width="180">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.snapPopoverVisible"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_SNAP') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.snapPopoverVisible"
                                source-title="IDCS_CHANNEL"
                                target-title="IDCS_CHANNEL_TRGGER"
                                :source-data="pageData.snapList"
                                :linked-list="pageData.snapChosedIdsAll"
                                limit-tip="IDCS_SNAP_CHANNEL_LIMIT"
                                @confirm="snapConfirmAll"
                                @close="snapCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                :disabled="scope.row.rowDisable"
                                @change="checkChange(scope.$index, 'snap')"
                            />
                            <el-button
                                :disabled="!scope.row.snap.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
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
                                        :value="item.value"
                                        :label="item.label"
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
                                        :value="item.value"
                                        :label="item.label"
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
                        <el-popover
                            v-model:visible="pageData.alarmOutPopoverVisible"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ALARM_OUT') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.alarmOutPopoverVisible"
                                source-title="IDCS_ALARM_OUT"
                                target-title="IDCS_TRIGGER_ALARM_OUT"
                                :source-data="pageData.alarmOutList"
                                :linked-list="pageData.alarmOutChosedIdsAll"
                                limit-tip="IDCS_ALARMOUT_LIMIT"
                                @confirm="alarmOutConfirmAll"
                                @close="alarmOutCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="checkChange(scope.$index, 'record')"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 预置点名称   -->
                <el-table-column
                    width="180"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                :disabled="scope.row.rowDisable"
                                @change="presetSwitchChange(scope.row)"
                            />
                            <el-button
                                :disabled="!scope.row.preset.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openPresetPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
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
                                        :value="item.value"
                                        :label="item.label"
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
                                        :value="item.value"
                                        :label="item.label"
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
                                        :value="item.value"
                                        :label="item.label"
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
        <div class="row_pagination">
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
    </div>
</template>

<script lang="ts" src="./MotionEventConfig.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
:deep(.el-table .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
