<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 16:45:24
-->
<template>
    <div class="base-flex-box">
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="pageData.alarmOutList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        >
        </BaseTransferDialog>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                highlight-current-row
                show-overflow-tooltip
            >
                <!-- 事件类型 -->
                <el-table-column
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="375"
                >
                    <template #default="scope">
                        {{ formatEventType(scope.row.eventType) }}
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="155"
                >
                    <template #header>
                        <el-dropdown trigger="click">
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
                            size="small"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.audioList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column width="194">
                    <template #header>
                        <el-dropdown trigger="click">
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
                            size="small"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow()"
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
                <!-- 报警输出   -->
                <el-table-column width="215">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.alarmOutPopoverVisible"
                            trigger="click"
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
                                target-title="IDCS_ALARM_OUT"
                                :source-data="pageData.alarmOutList"
                                :linked-list="pageData.alarmOutChosedIdsAll"
                                :type="pageData.alarmOutType"
                                @confirm="alarmOutConfirmAll"
                                @close="alarmOutCloseAll"
                            >
                            </BaseTransferPop>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="alarmOutSwitchChange(scope.row)"
                            ></el-checkbox>
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
                <!-- 蜂鸣器   -->
                <el-table-column width="260">
                    <template #header>
                        <el-dropdown trigger="click">
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
                            size="small"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow()"
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
                <!-- 消息框弹出   -->
                <el-table-column width="260">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleMsgBoxPopupChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.msgBoxPopup"
                            size="small"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow()"
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
                <!-- email   -->
                <el-table-column width="260">
                    <template #header>
                        <el-dropdown trigger="click">
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
                            size="small"
                            :disabled="scope.row.rowDisable || scope.row.emailDisable"
                            @change="addEditRow()"
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
            </el-table>
        </div>
        <el-row
            class="base-btn-box"
            :span="2"
        >
            <div class="tips_text">
                {{ Translate('IDCS_DISK_FAILURE_TIPS').formatForLang(Translate('IDCS_DISK_FAILURE')) }}
            </div>
            <div>
                <el-button
                    :disabled="pageData.applyDisable"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-row>
    </div>
</template>

<script lang="ts" src="./ExceptionAlarm.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
:deep(.el-table .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
}
.tips_text {
    font-size: 14px;
}
</style>
