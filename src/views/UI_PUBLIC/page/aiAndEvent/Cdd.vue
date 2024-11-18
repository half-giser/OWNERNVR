<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:14
 * @Description: 人群密度检测
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
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
            <!-- 检测开启-->
            <div
                class="base-btn-box padding collapse"
                span="2"
            >
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
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
                                    span="2"
                                >
                                    <!-- <div>
                                        <el-checkbox
                                            v-show="pageData.showDrawAvailable"
                                            v-model="pageData.isDrawAvailable"
                                            @change="handleDrawAvailableChange"
                                            >{{ Translate('IDCS_DRAW_WARN_SURFACE') }}</el-checkbox
                                        >
                                    </div> -->
                                    <div>
                                        <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    </div>
                                </div>
                                <span class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select v-model="formData.schedule">
                                        <el-option
                                            v-for="item in pageData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-button @click="pageData.scheduleManagePopOpen = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select v-model="formData.holdTime">
                                        <el-option
                                            v-for="item in formData.holdTimeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 刷新频率 -->
                                <el-form-item :label="Translate('IDCS_REFRESH_FREQUENCY')">
                                    <el-select v-model="formData.refreshFrequency">
                                        <el-option
                                            v-for="item in formData.refreshFrequencyList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 报警阈值 -->
                                <el-form-item :label="Translate('IDCS_ALARM_THRESHOLD')">
                                    <el-slider
                                        v-model="formData.triggerAlarmLevel"
                                        show-input
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
                            :style="{
                                '--form-input-width': '215px',
                            }"
                        >
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select v-model="formData.sysAudio">
                                    <el-option
                                        v-for="item in voiceList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <AlarmBaseTriggerSelector v-model="formData.trigger" />
                            <!-- record -->
                            <AlarmBaseRecordSelector v-model="formData.record" />
                            <!-- alarm -->
                            <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                            <!-- preset -->
                            <AlarmBasePresetSelector v-model="formData.preset" />
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
