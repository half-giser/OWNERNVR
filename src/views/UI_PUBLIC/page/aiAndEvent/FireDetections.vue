<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:29
 * @Description: 火点检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-28 10:34:14
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        >
        </ScheduleManagPop>
        <!-- record弹窗 -->
        <BaseTransferDialog
            v-model="pageData.recordIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_RECORD"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.recordSource"
            :linked-list="pageData.recordList || []"
            :type="pageData.recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        ></BaseTransferDialog>
        <!-- alarmOut弹窗 -->
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="pageData.alarmOutSource"
            :linked-list="pageData.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        ></BaseTransferDialog>
        <!-- snap弹窗 -->
        <BaseTransferDialog
            v-model="pageData.snapIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.snapSource"
            :linked-list="pageData.snapList || []"
            :type="pageData.snapType"
            @confirm="snapConfirm"
            @close="snapClose"
        ></BaseTransferDialog>
        <BaseNotification v-model:notifications="pageData.notification" />
        <el-dialog
            v-model="pageData.aiResourcePopOpen"
            :title="Translate('IDCS_DETAIL')"
            width="600"
        >
            <el-table
                :data="aiResourceTableData"
                stripe
                border
                show-overflow-tooltip
                height="290"
            >
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL')"
                    width="138"
                ></el-table-column>
                <el-table-column
                    prop="eventTypeText"
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="150"
                ></el-table-column>
                <el-table-column
                    prop="percent"
                    :label="Translate('IDCS_USAGE_RATE')"
                    width="100"
                ></el-table-column>
                <el-table-column
                    prop="decodeResource"
                    :label="Translate('IDCS_DECODE_RESOURCE')"
                    width="100"
                ></el-table-column>
                <el-table-column
                    :label="Translate('IDCS_FREE_AI_RESOURCE')"
                    width="70"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="handleAIResourceDel(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <div class="base-btn-box collapse">
                    <el-button @click="pageData.aiResourcePopOpen = false">
                        {{ Translate('IDCS_CLOSE') }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <!-- <div
            v-if="pageData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div> -->
        <div
            v-if="pageData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!pageData.requireDataFail">
            <!-- 检测开启及ai按钮 -->
            <div
                class="base-btn-box collapse padding"
                :span="2"
            >
                <div>
                    <el-checkbox
                        v-model="pageData.detectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                        @change="pageData.applyDisable = false"
                    />
                </div>
                <div></div>
                <!-- <div v-show="pageData.showAiConfig">
                    <span>{{ Translate('IDCS_USAGE_RATE') }}</span>
                    <span>{{ pageData.totalResourceOccupancy }}%</span>
                    <BaseImgSprite
                        file="detail"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="pageData.aiResourcePopOpen = true"
                    />
                </div> -->
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="base-ai-tabs"
                @tab-click="handleFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left">
                            <div class="player">
                                <BaseVideoPlayer
                                    id="player"
                                    ref="playerRef"
                                    type="live"
                                    @onready="handlePlayerReady"
                                />
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
                                class="narrow"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_SCHEDULE') }}
                                </div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select
                                        v-model="pageData.schedule"
                                        size="small"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        ></el-option>
                                    </el-select>
                                    <el-button
                                        size="small"
                                        @click="pageData.scheduleManagePopOpen = true"
                                    >
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select
                                        v-model="pageData.holdTime"
                                        size="small"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.holdTimeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="pageData.applyDisable"
                            @click="handleApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="trigger"
                >
                    <div class="trigger_box">
                        <!-- 音频 -->
                        <el-form
                            v-if="pageData.supportAlarmAudioConfig"
                            :style="{
                                '--form-input-width': '200px',
                            }"
                        >
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select
                                    v-model="pageData.sysAudio"
                                    value-key="value"
                                    size="small"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.voiceList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <div class="base-ai-linkage-box">
                                <el-checkbox
                                    v-model="pageData.triggerSwitch"
                                    class="base-ai-linkage-title base-ai-linkage-title-checkbox"
                                    :label="Translate('IDCS_TRIGGER_NOMAL')"
                                    @change="handleTriggerSwitch"
                                />
                                <el-table
                                    height="367"
                                    :data="triggerData"
                                    :show-header="false"
                                    :header-cell-style="{ 'text-align': 'left' }"
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <el-checkbox
                                                v-model="scope.row.value"
                                                class="table_item"
                                                :label="Translate(scope.row.label)"
                                                @change="handleTrigger(scope.row)"
                                            />
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                            <!-- record -->
                            <div class="base-ai-linkage-box">
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_RECORD') }}</span>
                                    <el-button
                                        size="small"
                                        @click="pageData.recordIsShow = true"
                                        >{{ Translate('IDCS_CONFIG') }}
                                    </el-button>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367"
                                    :data="pageData.record.chls"
                                >
                                    <el-table-column prop="label" />
                                </el-table>
                            </div>
                            <!-- alarm -->
                            <div class="base-ai-linkage-box">
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_ALARM_OUT') }}</span>
                                    <el-button
                                        size="small"
                                        @click="pageData.alarmOutIsShow = true"
                                        >{{ Translate('IDCS_CONFIG') }}
                                    </el-button>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367"
                                    :data="pageData.alarmOut.chls"
                                >
                                    <el-table-column prop="label" />
                                </el-table>
                            </div>
                            <!-- snap -->
                            <div class="base-ai-linkage-box">
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_SNAP') }}</span>
                                    <el-button
                                        size="small"
                                        @click="pageData.snapIsShow = true"
                                        >{{ Translate('IDCS_CONFIG') }}
                                    </el-button>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367"
                                    :data="pageData.snap.chls"
                                >
                                    <el-table-column prop="label" />
                                </el-table>
                            </div>
                            <!-- preset -->
                            <div
                                class="base-ai-linkage-box"
                                :style="{ width: '350px' }"
                            >
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                                </div>
                                <el-table
                                    border
                                    stripe
                                    height="367"
                                    :data="pageData.presetSource"
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_CHANNEL_NAME')"
                                    ></el-table-column>
                                    <el-table-column :label="Translate('IDCS_PRESET_NAME')">
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.preset.value"
                                                size="small"
                                                :empty-values="[undefined, null]"
                                                @visible-change="getPresetById(scope.row)"
                                                @change="pageData.applyDisable = false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.presetList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                        <div class="base-btn-box fixed">
                            <el-button
                                :disabled="pageData.applyDisable"
                                @click="handleApply"
                            >
                                {{ Translate('IDCS_APPLY') }}
                            </el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./FireDetections.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
.table_item {
    display: flex;
    justify-content: flex-start;
}
</style>
