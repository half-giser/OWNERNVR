<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:14
 * @Description: 人群密度检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-18 15:45:41
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
            :header-title="pageData.recordHeaderTitle"
            :source-title="pageData.recordSourceTitle"
            :target-title="pageData.recordTargetTitle"
            :source-data="pageData.recordSource"
            :linked-list="pageData.recordList || []"
            :type="pageData.recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        ></BaseTransferDialog>
        <!-- alarmOut弹窗 -->
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            :header-title="pageData.alarmOutHeaderTitle"
            :source-title="pageData.alarmOutSourceTitle"
            :target-title="pageData.alarmOutTargetTitle"
            :source-data="pageData.alarmOutSource"
            :linked-list="pageData.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        ></BaseTransferDialog>
        <div
            v-if="pageData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="pageData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!pageData.notSupportTipShow && !pageData.requireDataFail">
            <!-- 检测开启-->
            <div
                class="base-btn-box padding collapse"
                :span="2"
            >
                <el-checkbox
                    v-model="pageData.detectionEnable"
                    @change="pageData.applyDisable = false"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="base-ai-tabs function-tabs"
                @tab-click="handleFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="tripwire_param"
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
                            <div v-if="pageData.fuction === 'param'">
                                <div
                                    class="base-btn-box"
                                    :span="2"
                                >
                                    <div>
                                        <el-checkbox
                                            v-show="pageData.showDrawAvailable"
                                            v-model="pageData.isDrawAvailable"
                                            @change="handleDrawAvailableChange"
                                            >{{ Translate('IDCS_DRAW_WARN_SURFACE') }}</el-checkbox
                                        >
                                    </div>
                                    <div>
                                        <el-button
                                            size="small"
                                            @click="clearArea"
                                            >{{ Translate('IDCS_CLEAR') }}</el-button
                                        >
                                    </div>
                                </div>
                                <span class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
                                label-position="left"
                                class="narrow"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select
                                        v-model="pageData.schedule"
                                        value-key="value"
                                        :options="pageData.scheduleList"
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
                                        class="form_btn"
                                        size="small"
                                        @click="pageData.scheduleManagePopOpen = true"
                                    >
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select
                                        v-model="pageData.holdTime"
                                        value-key="value"
                                        size="small"
                                        :options="pageData.holdTimeList"
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
                                <!-- 刷新频率 -->
                                <el-form-item :label="Translate('IDCS_REFRESH_FREQUENCY')">
                                    <el-select
                                        v-model="pageData.refreshFrequency"
                                        value-key="value"
                                        size="small"
                                        :options="pageData.refreshFrequencyList"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.refreshFrequencyList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <!-- 报警阈值 -->
                                <el-form-item :label="Translate('IDCS_ALARM_THRESHOLD')">
                                    <el-slider
                                        v-model="pageData.triggerAlarmLevel"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="pageData.applyDisable = false"
                                    />
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
                    class="tripwire_trigger"
                >
                    <div>
                        <!-- 音频 -->
                        <el-form
                            v-if="pageData.supportAlarmAudioConfig"
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-position="left"
                        >
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select
                                    v-model="pageData.sysAudio"
                                    value-key="value"
                                    size="small"
                                    class="audio_select"
                                    :options="pageData.voiceList"
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
                                    @change="handleTriggerSwitch"
                                    >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                                >
                                <el-table
                                    height="367px"
                                    :data="triggerData"
                                    :show-header="false"
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <el-checkbox
                                                v-model="scope.row.value"
                                                class="table_item"
                                                @change="handleTrigger(scope.row)"
                                                >{{ Translate(scope.row.label) }}
                                            </el-checkbox>
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
                                    height="367px"
                                    :data="pageData.record.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
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
                                    height="367px"
                                    :data="pageData.alarmOut.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- preset -->
                            <div
                                class="base-ai-linkage-box"
                                :style="{
                                    width: '350px',
                                }"
                            >
                                <div class="base-ai-linkage-title">
                                    {{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}
                                </div>
                                <el-table
                                    border
                                    stripe
                                    height="367px"
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
                                                :options="scope.row.presetList"
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

<script lang="ts" src="./Cdd.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
.table_item {
    display: flex;
    justify-content: flex-start;
}
</style>
