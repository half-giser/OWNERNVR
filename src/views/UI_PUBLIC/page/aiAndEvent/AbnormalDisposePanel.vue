<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:27
 * @Description: AI 事件——更多——异常侦测
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left">
                        <div class="player">
                            <BaseVideoPlayer
                                ref="playerRef"
                                @ready="handlePlayerReady"
                            />
                        </div>
                    </div>
                    <div class="base-ai-param-box-right">
                        <el-form v-title>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select-v2
                                    v-model="formData.holdTime"
                                    :options="formData.holdTimeList"
                                />
                            </el-form-item>
                            <!-- 场景变更 -->
                            <el-form-item :label="Translate('IDCS_SCENE_CHANGE')">
                                <el-select-v2
                                    v-model="formData.sceneChangeSwitch"
                                    :disabled="formData.sceneChangeSwitch === ''"
                                    :options="pageData.enableList"
                                />
                            </el-form-item>
                            <!-- 视频模糊 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_BLUR')">
                                <el-select-v2
                                    v-model="formData.clarityAbnormalSwitch"
                                    :options="pageData.enableList"
                                    :disabled="formData.clarityAbnormalSwitch === ''"
                                />
                            </el-form-item>
                            <!-- 视频偏色 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_COLOR')">
                                <el-select-v2
                                    v-model="formData.colorAbnormalSwitch"
                                    :options="pageData.enableList"
                                    :disabled="formData.colorAbnormalSwitch === ''"
                                />
                            </el-form-item>
                            <!-- 灵敏度 -->
                            <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                <BaseSliderInput
                                    v-model="formData.sensitivity"
                                    :min="1"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="trigger"
                >
                    <el-form
                        v-if="supportAlarmAudioConfig"
                        v-title
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
                        <!-- 录像 -->
                        <AlarmBaseRecordSelector v-model="formData.record" />
                        <!-- 报警输出 -->
                        <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                        <!-- 联动预置点 -->
                        <AlarmBasePresetSelector v-model="formData.preset" />
                        <!-- Ip Speaker -->
                        <AlarmBaseIPSpeakerSelector
                            v-if="supportAlarmAudioConfig"
                            v-model="formData.ipSpeaker"
                            :chl-id="currChlId"
                        />
                    </div>
                </el-tab-pane>
            </el-tabs>
            <div class="base-btn-box fixed">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./AbnormalDisposePanel.v.ts"></script>
