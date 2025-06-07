<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:29
 * @Description: 火点检测
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- 检测开启及ai按钮 -->
            <div class="base-btn-box flex-start collapse padding">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
                @tab-change="changeTab"
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
                            <div v-show="pageData.tab === 'param'">
                                <div class="base-btn-box space-between">
                                    <div>
                                        <el-checkbox
                                            v-show="formData.maskAreaInfo.length > 1"
                                            v-model="pageData.isShowAllArea"
                                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                            @change="toggleShowAllArea"
                                        />
                                    </div>
                                    <div>
                                        <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                        <el-button
                                            v-show="formData.maskAreaInfo.length > 1"
                                            @click="clearAllArea"
                                        >
                                            {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                                        </el-button>
                                    </div>
                                </div>
                                <div class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form v-title>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_SCHEDULE') }}
                                </div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <BaseScheduleSelect
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                        @edit="pageData.isSchedulePop = true"
                                    />
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <BaseSelect
                                        v-model="formData.holdTime"
                                        :options="formData.holdTimeList"
                                        empty-text=""
                                    />
                                </el-form-item>
                                <!-- 触发报警条件 -->
                                <el-form-item
                                    v-if="formData.fireAlarmMode"
                                    :label="Translate('IDCS_FIRE_TRIGGER_ALARM_CONDITION')"
                                >
                                    <BaseSelect
                                        v-model="formData.fireAlarmMode"
                                        :options="formData.fireAlarmModeList"
                                    />
                                </el-form-item>
                                <!-- 灵敏度 -->
                                <el-form-item
                                    v-if="formData.ShowFireSensitivity"
                                    :label="Translate('IDCS_SENSITIVITY')"
                                >
                                    <BaseSliderInput
                                        v-model="formData.sensitivity"
                                        :min="1"
                                    />
                                </el-form-item>
                                <!-- 时间阈值 -->
                                <el-form-item
                                    v-if="formData.supportDuration"
                                    :label="Translate('IDCS_DURATION_THRESHOLD')"
                                >
                                    <BaseNumberInput
                                        v-model="formData.duration.value"
                                        :min="formData.duration.min"
                                        :max="formData.duration.max"
                                        @out-of-range="blurDuration(formData.duration.min, formData.duration.max)"
                                    />
                                </el-form-item>
                                <!-- 屏蔽区域 -->
                                <el-form-item
                                    v-if="formData.supportMaskArea"
                                    :label="Translate('IDCS_MASK_AREA')"
                                >
                                    <el-radio-group
                                        v-model="pageData.maskAreaIndex"
                                        class="small-btn"
                                        @change="changeMaskArea"
                                    >
                                        <el-radio-button
                                            v-for="(_item, index) in formData.maskAreaInfo"
                                            :key="index"
                                            :value="index"
                                            :label="index + 1"
                                            :class="{
                                                checked: pageData.maskAreaChecked.includes(index),
                                            }"
                                        />
                                    </el-radio-group>
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
                        <AlarmBaseTriggerSelector
                            v-model="formData.trigger"
                            :include="formData.triggerList"
                        />
                        <!-- record -->
                        <AlarmBaseRecordSelector v-model="formData.record" />
                        <!-- alarm -->
                        <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                        <!-- snap -->
                        <AlarmBaseSnapSelector v-model="formData.snap" />
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

<script lang="ts" src="./FireDetectionPanel.v.ts"></script>
