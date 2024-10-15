<!--
 * @Description: 普通事件——组合报警
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-22 16:04:47
 * @LastEditors: luoyimingyimingyimingyiming a11593@tvt.net.cn
 * @LastEditTime: 2024-10-09 16:12:42
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
                    width="50px"
                    class-name="custom_cell"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status"></BaseTableRowStatus>
                    </template>
                </el-table-column>

                <!-- 名称 -->
                <el-table-column
                    width="160px"
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
                    width="180px"
                >
                    <template #default="scope">
                        <el-row>
                            <el-col :span="6">
                                <el-checkbox
                                    v-model="scope.row.combinedAlarm.switch"
                                    @change="combinedAlarmCheckChange(scope.row)"
                                ></el-checkbox>
                            </el-col>
                            <el-col :span="18">
                                <el-button
                                    :disabled="!scope.row.combinedAlarm.switch"
                                    class="table_btn"
                                    @click="openCombinedAlarmPop(scope.row)"
                                >
                                    {{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 录像 -->
                <el-table-column
                    prop="record"
                    width="180px"
                >
                    <template #header>
                        <el-dropdown
                            ref="recordRef"
                            trigger="click"
                            :hide-on-click="false"
                            placement="bottom-start"
                        >
                            <BaseTableDropdownLink @click="recordDropdownOpen">
                                {{ Translate('IDCS_RECORD') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <div v-if="pageData.recordIsShowAll">
                                        <BaseTransferPop
                                            v-model="pageData.recordIsShowAll"
                                            :source-title="pageData.recordSourceTitle"
                                            :target-title="pageData.recordTargetTitle"
                                            :source-data="pageData.recordList"
                                            :type="pageData.recordType"
                                            :linked-list="pageData.recordChosedIdsAll"
                                            @confirm="recordConfirmAll"
                                            @close="recordCloseAll"
                                        >
                                        </BaseTransferPop>
                                    </div>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-row>
                            <el-col :span="6">
                                <el-checkbox
                                    v-model="scope.row.sysRec.switch"
                                    @change="checkChange(scope.$index, 'record')"
                                ></el-checkbox>
                            </el-col>
                            <el-col :span="18">
                                <el-button
                                    :disabled="!scope.row.sysRec.switch"
                                    class="table_btn"
                                    @click="setRecord(scope.$index)"
                                >
                                    {{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 抓图 -->
                <el-table-column
                    prop="snap"
                    width="180px"
                >
                    <template #header>
                        <el-dropdown
                            ref="snapRef"
                            trigger="click"
                            :hide-on-click="false"
                            placement="bottom-start"
                        >
                            <BaseTableDropdownLink @click="snapDropdownOpen">
                                {{ Translate('IDCS_SNAP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div v-if="pageData.snapIsShowAll">
                                    <BaseTransferPop
                                        v-model="pageData.snapIsShowAll"
                                        :source-title="pageData.snapSourceTitle"
                                        :target-title="pageData.snapTargetTitle"
                                        :source-data="pageData.snapList"
                                        :linked-list="pageData.snapChosedIdsAll"
                                        :type="pageData.snapType"
                                        @confirm="snapConfirmAll"
                                        @close="snapCloseAll"
                                    />
                                </div>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-row>
                            <el-col :span="6">
                                <el-checkbox
                                    v-model="scope.row.sysSnap.switch"
                                    @change="checkChange(scope.$index, 'snap')"
                                ></el-checkbox>
                            </el-col>
                            <el-col :span="18">
                                <el-button
                                    :disabled="!scope.row.sysSnap.switch"
                                    class="table_btn"
                                    @click="setSnap(scope.$index)"
                                >
                                    {{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 声音，supportAudio -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="150px"
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
                <el-table-column width="150px">
                    <template #header>
                        <el-dropdown trigger="click">
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
                <el-table-column
                    prop="alarmOut"
                    width="180px"
                >
                    <template #header>
                        <el-dropdown
                            ref="alarmOutRef"
                            trigger="click"
                            :hide-on-click="false"
                            placement="bottom-start"
                        >
                            <BaseTableDropdownLink @click="alarmOutDropdownOpen">
                                {{ Translate('IDCS_ALARM_OUT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div v-if="pageData.alarmOutIsShowAll">
                                    <BaseTransferPop
                                        v-model="pageData.alarmOutIsShowAll"
                                        :source-title="pageData.alarmOutSourceTitle"
                                        :target-title="pageData.alarmOutTargetTitle"
                                        :source-data="pageData.alarmOutList"
                                        :linked-list="pageData.alarmOutChosedIdsAll"
                                        :type="pageData.alarmOutType"
                                        @confirm="alarmOutConfirmAll"
                                        @close="alarmOutCloseAll"
                                    />
                                </div>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-row>
                            <el-col :span="6">
                                <el-checkbox
                                    v-model="scope.row.alarmOut.switch"
                                    @change="checkChange(scope.$index, 'alarmOut')"
                                ></el-checkbox>
                            </el-col>
                            <el-col :span="18">
                                <el-button
                                    :disabled="!scope.row.alarmOut.switch"
                                    class="table_btn"
                                    @click="setAlarmOut(scope.$index)"
                                >
                                    {{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 预置点名称 -->
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    width="180px"
                >
                    <template #default="scope">
                        <el-row>
                            <el-col :span="6">
                                <el-checkbox
                                    v-model="scope.row.preset.switch"
                                    @change="presetCheckChange(scope.row)"
                                ></el-checkbox>
                            </el-col>
                            <el-col :span="18">
                                <el-button
                                    :disabled="!scope.row.preset.switch"
                                    class="table_btn"
                                    @click="openPresetPop(scope.row)"
                                >
                                    {{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 蜂鸣器 -->
                <el-table-column width="85px">
                    <template #header>
                        <el-dropdown trigger="click">
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
                <el-table-column width="125px">
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            max-height="400px"
                        >
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
                <el-table-column width="170px">
                    <template #header>
                        <el-dropdown trigger="click">
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
                <el-table-column width="75px">
                    <template #header>
                        <el-dropdown trigger="click">
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
            :header-title="pageData.recordHeaderTitle"
            :source-title="pageData.recordSourceTitle"
            :target-title="pageData.recordTargetTitle"
            :source-data="pageData.recordList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.recordList || []"
            :type="pageData.recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        >
        </BaseTransferDialog>
        <BaseTransferDialog
            v-model="pageData.snapIsShow"
            :header-title="pageData.snapHeaderTitle"
            :source-title="pageData.snapSourceTitle"
            :target-title="pageData.snapTargetTitle"
            :source-data="pageData.snapList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.snapList || []"
            :type="pageData.snapType"
            @confirm="snapConfirm"
            @close="snapClose"
        >
        </BaseTransferDialog>
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            :header-title="pageData.alarmOutHeaderTitle"
            :source-title="pageData.alarmOutSourceTitle"
            :target-title="pageData.alarmOutTargetTitle"
            :source-data="pageData.alarmOutList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            :type="pageData.alarmOutType"
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
