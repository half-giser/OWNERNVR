<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-14 10:39:20
 * @Description: 声音异常
-->
<template>
    <div>
        <div
            v-if="pageData.reqFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="pageData.tab">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div class="base-btn-box space-between padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="pageData.tab !== 'trigger'"
                class="base-ai-param-box-left fixed"
            >
                <div
                    ref="asdChartRef"
                    class="voiceChartDiv"
                ></div>
                <div class="legend">
                    <div class="legendItem">
                        <span class="circle red"></span>
                        <span> {{ Translate('IDCS_SOUND_INTENSITY') }} </span>
                    </div>
                    <div class="legendItem">
                        <span class="circle blue"></span>
                        <span> {{ Translate('IDCS_BACK_GROUND_SOUND_INTENSITY') }} </span>
                    </div>
                    <div class="legendItem">
                        <span class="circle green"></span>
                        <span> {{ Translate('IDCS_SOUND_RISE_THRESHOLD') }} </span>
                    </div>
                </div>
            </div>
            <div class="base-ai-form">
                <!-- 三种功能 -->
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
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form v-title>
                                    <!-- 排程 -->
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_SCHEDULE') }}
                                    </div>
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="pageData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                            @change="watchEdit.disabled.value = false"
                                        />
                                    </el-form-item>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCD_RULE') }}
                                    </div>
                                    <!-- 持续时间 -->
                                    <el-form-item :label="Translate('IDCS_DURATION')">
                                        <el-select-v2
                                            v-model="formData.holdTime"
                                            :options="formData.holdTimeList"
                                        />
                                    </el-form-item>
                                    <!-- 灵敏度 -->
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="formData.sdRiseSwitch"
                                            :label="Translate('IDCS_SOUND_RISE')"
                                        />
                                    </el-form-item>
                                    <el-form-item
                                        v-if="formData.enabledArea"
                                        :label="Translate('IDCS_SENSITIVITY')"
                                    >
                                        <BaseSliderInput
                                            v-if="formData.sdRiseSwitchEnable"
                                            v-model="formData.sdRiseSensitivity.value"
                                            :min="formData.sdRiseSensitivity.min"
                                            :max="formData.sdRiseSensitivity.max"
                                        />
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_SOUND_RISE_THRESHOLD')">
                                        <BaseSliderInput
                                            v-if="formData.sdRiseSwitchEnable"
                                            v-model="formData.sdRiseThreshold.value"
                                            :min="formData.sdRiseThreshold.min"
                                            :max="formData.sdRiseThreshold.max"
                                        />
                                    </el-form-item>
                                    <el-form-item v-if="formData.sdReduceSwitchEnable">
                                        <el-checkbox
                                            v-model="formData.sdReduceSwitch"
                                            :label="Translate('IDCS_SOUND_REDUCE')"
                                        />
                                    </el-form-item>
                                    <el-form-item
                                        v-if="formData.sdReduceSwitchEnable"
                                        :label="Translate('IDCS_SENSITIVITY')"
                                    >
                                        <BaseSliderInput
                                            v-if="formData.sdReduceSwitchEnable"
                                            v-model="formData.sdReduceSensitivity.value"
                                            :min="formData.sdReduceSensitivity.min"
                                            :max="formData.sdReduceSensitivity.max"
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
                        <el-form v-if="pageData.supportAlarmAudioConfig">
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select-v2
                                    v-model="formData.sysAudio"
                                    :options="voiceList"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <AlarmBaseTriggerSelector
                                v-model="formData.trigger"
                                :include="formData.triggerList"
                            />
                            <!-- record -->
                            <AlarmBaseRecordSelector v-model="formData.recordChls" />
                            <!-- alarm -->
                            <AlarmBaseAlarmOutSelector v-model="formData.alarmOutChls" />
                            <!-- preset -->
                            <AlarmBasePresetSelector v-model="formData.presets" />
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
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./AsdPanel.v.ts"></script>

<style lang="scss" scoped>
.voiceChartDiv {
    width: 440px;
    height: 300px;
}

.circle {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
}

.circle.red {
    background-color: #f00;
}

.circle.blue {
    background-color: #00f;
}

.circle.green {
    background-color: #61a0a8;
}

.legendItem {
    margin: 5px 0;
}
</style>
