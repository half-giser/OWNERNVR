<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:14
 * @Description: 人群密度检测
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- 检测开启-->
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.tab"
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
                            <div v-if="pageData.tab === 'param'">
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
                                <div class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</div>
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form v-title>
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <BaseScheduleSelect
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                        @edit="pageData.isSchedulePop = true"
                                    />
                                </el-form-item>
                                <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <BaseSelect
                                        v-model="formData.holdTime"
                                        :options="formData.holdTimeList"
                                        empty-text=""
                                    />
                                </el-form-item>
                                <!-- 刷新频率 -->
                                <el-form-item :label="Translate('IDCS_REFRESH_FREQUENCY')">
                                    <BaseSelect
                                        v-model="formData.refreshFrequency"
                                        :options="formData.refreshFrequencyList"
                                        empty-text=""
                                    />
                                </el-form-item>
                                <!-- 报警阈值 -->
                                <el-form-item :label="Translate('IDCS_ALARM_THRESHOLD')">
                                    <BaseSliderInput
                                        v-model="formData.triggerAlarmLevel"
                                        :min="1"
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
                    <!-- 音频 -->
                    <el-form
                        v-if="pageData.supportAlarmAudioConfig"
                        v-title
                    >
                        <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                            <BaseSelect
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
                        <!-- Ip Speaker -->
                        <AlarmBaseIPSpeakerSelector
                            v-if="pageData.supportAlarmAudioConfig"
                            v-model="formData.ipSpeaker"
                            :chl-id="currChlId"
                        />
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
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./CddPanel.v.ts"></script>
