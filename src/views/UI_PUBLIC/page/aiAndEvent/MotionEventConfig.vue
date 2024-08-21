<template>
    <div>
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
        <SetPresetPop
            v-model="pageData.isPresetPopOpen"
            :filter-chl-id="pageData.presetChlId"
            :linked-list="pageData.presetLinkedList"
            :handle-preset-linked-list="handlePresetLinkedList"
            @close="pageData.isPresetPopOpen = false"
        />
        <el-table
            :data="tableData"
            border
            stripe
            height="610px"
            highlight-current-row
            show-overflow-tooltip
        >
            <!-- 状态列 -->
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
            <!-- 通道名 -->
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                width="150px"
            >
                <template #default="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <!-- 排程   -->
            <el-table-column
                prop="schedule"
                width="210px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_SCHEDULE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="schedule"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.scheduleList"
                        @change="addEditRow(scope.row)"
                    >
                        <el-option
                            v-for="item in pageData.scheduleList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        >
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <!-- 录像   -->
            <el-table-column
                prop="record"
                width="155px"
            >
                <template #header>
                    <el-dropdown
                        ref="recordRef"
                        trigger="click"
                        :hide-on-click="false"
                        placement="bottom-start"
                    >
                        <span
                            class="el-dropdown-link"
                            @click="recordDropdownOpen"
                        >
                            {{ Translate('IDCS_RECORD') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <BaseTransferPop
                                        v-if="pageData.recordIsShowAll"
                                        :source-title="pageData.recordSourceTitle"
                                        :target-title="pageData.recordTargetTitle"
                                        :source-data="pageData.recordList"
                                        :linked-list="pageData.recordChosedIdsAll"
                                        :type="pageData.recordType"
                                        @confirm="recordConfirmAll"
                                        @close="recordCloseAll"
                                    >
                                    </BaseTransferPop>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-row>
                        <el-col :span="12">
                            <el-checkbox
                                v-model="scope.row.record.switch"
                                :disabled="scope.row.rowDisable"
                                @change="recordSwitchChange(scope.row)"
                            ></el-checkbox>
                        </el-col>
                        <el-col :span="12">
                            <el-button
                                :disabled="!scope.row.record.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 抓图   -->
            <el-table-column
                prop="snap"
                width="155px"
            >
                <template #header>
                    <el-dropdown
                        ref="snapRef"
                        trigger="click"
                        :hide-on-click="false"
                        placement="bottom-start"
                    >
                        <span
                            class="el-dropdown-link"
                            @click="snapDropdownOpen"
                        >
                            {{ Translate('IDCS_SNAP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <BaseTransferPop
                                        v-if="pageData.snapIsShowAll"
                                        :source-title="pageData.snapSourceTitle"
                                        :target-title="pageData.snapTargetTitle"
                                        :source-data="pageData.snapList"
                                        :linked-list="pageData.snapChosedIdsAll"
                                        :type="pageData.snapType"
                                        @confirm="snapConfirmAll"
                                        @close="snapCloseAll"
                                    >
                                    </BaseTransferPop>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-row>
                        <el-col :span="12">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                :disabled="scope.row.rowDisable"
                                @change="snapSwitchChange(scope.row)"
                            ></el-checkbox>
                        </el-col>
                        <el-col :span="12">
                            <el-button
                                :disabled="!scope.row.snap.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 音频   -->
            <el-table-column
                v-if="pageData.supportAudio"
                prop="sysAudio"
                width="165px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_AUDIO') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="sysAudio"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.audioList"
                        @change="addEditRow(scope.row)"
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
            <el-table-column
                prop="msgPush"
                width="170px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_PUSH') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="schedule"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.enableList"
                        @change="addEditRow(scope.row)"
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
            <el-table-column
                prop="alarmOut"
                width="155px"
            >
                <template #header>
                    <el-dropdown
                        ref="alarmOutRef"
                        trigger="click"
                        :hide-on-click="false"
                        placement="bottom-end"
                    >
                        <span
                            class="el-dropdown-link"
                            @click="alarmOutDropdownOpen"
                        >
                            {{ Translate('IDCS_ALARM_OUT') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <BaseTransferPop
                                        v-if="pageData.alarmOutIsShowAll"
                                        :source-title="pageData.alarmOutSourceTitle"
                                        :target-title="pageData.alarmOutTargetTitle"
                                        :source-data="pageData.alarmOutList"
                                        :linked-list="pageData.alarmOutChosedIdsAll"
                                        :type="pageData.alarmOutType"
                                        @confirm="alarmOutConfirmAll"
                                        @close="alarmOutCloseAll"
                                    >
                                    </BaseTransferPop>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-row>
                        <el-col :span="12">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="alarmOutSwitchChange(scope.row)"
                            ></el-checkbox>
                        </el-col>
                        <el-col :span="12">
                            <el-button
                                :disabled="!scope.row.alarmOut.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 预置点名称   -->
            <el-table-column
                prop="preset"
                width="140px"
                :label="Translate('IDCS_PRESET_NAME')"
            >
                <template #default="scope">
                    <el-row>
                        <el-col :span="12">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                :disabled="scope.row.rowDisable"
                                @change="presetSwitchChange(scope.row)"
                            ></el-checkbox>
                        </el-col>
                        <el-col :span="12">
                            <el-button
                                :disabled="!scope.row.preset.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openPresetPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 蜂鸣器   -->
            <el-table-column
                prop="beeper"
                width="124px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_BUZZER') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="beeper"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.enableList"
                        @change="addEditRow(scope.row)"
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
            <!-- 视频弹出   -->
            <el-table-column
                prop="videoPopup"
                width="140px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_VIDEO_POPUP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="videoPopup"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.enableList"
                        @change="addEditRow(scope.row)"
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
            <el-table-column
                prop="email"
                width="115px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            Email <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        prop="email"
                        value-key="value"
                        :disabled="scope.row.rowDisable"
                        :options="pageData.enableList"
                        @change="addEditRow(scope.row)"
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
        <el-row class="base-btn-box">
            <el-button @click="handleMotionSetting">
                {{ Translate('IDCS_MOTION_SETTING') }}
            </el-button>
            <el-button
                :disabled="pageData.applyDisable"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </el-row>
    </div>
</template>

<script lang="ts" src="./MotionEventConfig.v.ts"></script>

<style lang="scss" scoped>
.table_btn {
    margin-left: -25px;
}
</style>
