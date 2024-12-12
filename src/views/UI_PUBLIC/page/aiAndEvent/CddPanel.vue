<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:14
 * @Description: 人群密度检测
-->
<template>
    <div>
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
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="base-ai-tabs"
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
                                    ref="playerRef"
                                    @ready="handlePlayerReady"
                                    @message="notify"
                                />
                            </div>
                            <div v-if="pageData.fuction === 'param'">
                                <div class="base-btn-box">
                                    <!-- <div>
                                        <el-checkbox
                                            v-show="pageData.showDrawAvailable"
                                            v-model="pageData.isDrawAvailable"
                                            :label="Translate('IDCS_DRAW_WARN_SURFACE')"
                                            @change="handleDrawAvailableChange"
                                        />
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
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select-v2
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                    />
                                    <el-button @click="pageData.isSchedulePop = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select-v2
                                        v-model="formData.holdTime"
                                        :options="formData.holdTimeList"
                                    />
                                </el-form-item>
                                <!-- 刷新频率 -->
                                <el-form-item :label="Translate('IDCS_REFRESH_FREQUENCY')">
                                    <el-select-v2
                                        v-model="formData.refreshFrequency"
                                        :options="formData.refreshFrequencyList"
                                    />
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
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="trigger"
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
                                <el-select-v2
                                    v-model="formData.sysAudio"
                                    :options="voiceList"
                                />
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
                    </div>
                </el-tab-pane>
            </el-tabs>
            <div class="base-btn-box fixed">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="applyData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./CddPanel.v.ts"></script>
