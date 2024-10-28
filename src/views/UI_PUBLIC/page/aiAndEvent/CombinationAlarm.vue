<!--
 * @Description: 普通事件——组合报警
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-22 16:04:47
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-23 19:33:10
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                stripe
                border
                highlight-current-row
                :data="tableData"
                @current-change="changeCombinedALarmInfo"
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status"></BaseTableRowStatus>
                    </template>
                </el-table-column>

                <!-- 名称 -->
                <el-table-column
                    width="160"
                    :label="Translate('IDCS_NAME')"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.name"
                            maxlength="32"
                            size="small"
                            @focus="nameFocus(scope.row.name)"
                            @blur="nameBlur(scope.row)"
                            @keyup.enter="enterBlur($event)"
                        />
                    </template>
                </el-table-column>

                <!-- 组合报警 -->
                <el-table-column
                    :label="Translate('IDCS_COMBINATION_ALARM')"
                    width="180"
                >
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.combinedAlarm.switch"
                                @change="combinedAlarmCheckChange(scope.row)"
                            />
                            <el-button
                                :disabled="!scope.row.combinedAlarm.switch"
                                class="table_btn"
                                @click="openCombinedAlarmPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 录像 -->
                <el-table-column width="180">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.recordIsShowAll"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_RECORD') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.recordIsShowAll"
                                source-title="IDCS_CHANNEL"
                                target-title="IDCS_CHANNEL_TRGGER"
                                :source-data="pageData.recordList"
                                type="record"
                                :linked-list="pageData.recordChosedIdsAll"
                                @confirm="recordConfirmAll"
                                @close="recordCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.sysRec.switch"
                                @change="checkChange(scope.$index, 'record')"
                            />
                            <el-button
                                :disabled="!scope.row.sysRec.switch"
                                class="table_btn"
                                @click="setRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 抓图 -->
                <el-table-column width="180">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.snapIsShowAll"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_SNAP') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.snapIsShowAll"
                                source-title="IDCS_CHANNEL"
                                target-title="IDCS_CHANNEL_TRGGER"
                                :source-data="pageData.snapList"
                                :linked-list="pageData.snapChosedIdsAll"
                                type="snap"
                                @confirm="snapConfirmAll"
                                @close="snapCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.sysSnap.switch"
                                @change="checkChange(scope.$index, 'snap')"
                            />
                            <el-button
                                :disabled="!scope.row.sysSnap.switch"
                                class="table_btn"
                                @click="setSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 声音，supportAudio -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="150"
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
                                        @click="changeAllValue(item.value, 'sysAudio')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.sysAudio"
                            size="small"
                        >
                            <el-option
                                v-for="item in pageData.audioList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 推送 -->
                <el-table-column width="150">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'msgPushSwitch')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.msgPush"
                            size="small"
                        >
                            <el-option
                                v-for="item in pageData.switchList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 报警输出 -->
                <el-table-column width="180">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.alarmOutIsShowAll"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ALARM_OUT') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.alarmOutIsShowAll"
                                source-title="IDCS_ALARM_OUT"
                                target-title="IDCS_TRIGGER_ALARM_OUT"
                                :source-data="pageData.alarmOutList"
                                :linked-list="pageData.alarmOutChosedIdsAll"
                                type="alarmOut"
                                @confirm="alarmOutConfirmAll"
                                @close="alarmOutCloseAll"
                            />
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                @change="checkChange(scope.$index, 'alarmOut')"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch"
                                class="table_btn"
                                @click="setAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 预置点名称 -->
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    width="180"
                >
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                @change="presetCheckChange(scope.row)"
                            />
                            <el-button
                                :disabled="!scope.row.preset.switch"
                                class="table_btn"
                                @click="openPresetPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 蜂鸣器 -->
                <el-table-column width="100">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'buzzerSwitch')"
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
                        >
                            <el-option
                                v-for="item in pageData.switchList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 视频弹出 -->
                <el-table-column width="125">
                    <template #header>
                        <el-dropdown max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoPopupChlList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'videoPopUp')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.popVideo.chl.value"
                            size="small"
                            :empty-values="[undefined, null]"
                        >
                            <el-option
                                v-for="item in pageData.videoPopupChlList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 消息框弹出 -->
                <el-table-column width="170">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'popMsgSwitch')"
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
                        >
                            <el-option
                                v-for="item in pageData.switchList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- Email -->
                <el-table-column width="100">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>Email</BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'emailSwitch')"
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
                        >
                            <el-option
                                v-for="item in pageData.switchList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            :span="2"
        >
            <div>{{ pageData.CombinedALarmInfo }}</div>
            <div>
                <el-button
                    :disabled="pageData.applyDisabled"
                    @click="setData()"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </div>
        <BaseTransferDialog
            v-model="pageData.recordIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_RECORD"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.recordList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.recordList || []"
            type="record"
            @confirm="recordConfirm"
            @close="recordClose"
        >
        </BaseTransferDialog>
        <BaseTransferDialog
            v-model="pageData.snapIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.snapList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.snapList || []"
            type="snap"
            @confirm="snapConfirm"
            @close="snapClose"
        >
        </BaseTransferDialog>
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="pageData.alarmOutList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            type="alarmOut"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        >
        </BaseTransferDialog>
        <!-- 预置点名称 -->
        <SetPresetPop
            v-model="pageData.isPresetPopOpen"
            :filter-chl-id="pageData.presetChlId"
            :linked-list="pageData.presetLinkedList"
            :handle-preset-linked-list="handlePresetLinkedList"
            @close="presetClose"
        />
        <CombinationAlarmPop
            v-model="pageData.isCombinedAlarmPopOpen"
            :linked-id="pageData.combinedAlarmLinkedId"
            :linked-list="pageData.combinedAlarmLinkedList"
            :curr-row-face-obj="pageData.currRowFaceObj"
            :handle-linked-list="handleCombinedAlarmLinkedList"
            @close="combinedAlarmClose"
        />
    </div>
</template>

<script lang="ts" src="./CombinationAlarm.v.ts"></script>

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
