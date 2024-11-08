<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:27
 * @Description: AI 事件——更多——异常侦测
-->
<template>
    <div>
        <div>
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
                @tab-change="tabChange"
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
                                type="live"
                                @onready="handlePlayerReady"
                            />
                        </div>
                    </div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            inline-message
                        >
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select v-model="abnormalDisposeData.holdTime">
                                    <el-option
                                        v-for="item in abnormalDisposeData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 场景变更 -->
                            <el-form-item :label="Translate('IDCS_SCENE_CHANGE')">
                                <el-select
                                    v-model="abnormalDisposeData.sceneChangeSwitch"
                                    :disabled="abnormalDisposeData.sceneChangeSwitch === ''"
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 视频模糊 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_BLUR')">
                                <el-select
                                    v-model="abnormalDisposeData.clarityAbnormalSwitch"
                                    :disabled="abnormalDisposeData.clarityAbnormalSwitch === ''"
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 视频偏色 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_COLOR')">
                                <el-select
                                    v-model="abnormalDisposeData.colorAbnormalSwitch"
                                    :disabled="abnormalDisposeData.colorAbnormalSwitch === ''"
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 灵敏度 -->
                            <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                <el-slider
                                    v-model="abnormalDisposeData.sensitivity"
                                    :show-tooltip="false"
                                    :min="1"
                                    :max="100"
                                    show-input
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="linkage"
                >
                    <el-form
                        v-if="supportAlarmAudioConfig"
                        :style="{
                            '--form-input-width': '215px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                            <el-select v-model="abnormalDisposeData.sysAudio">
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
                        <AlarmBaseTriggerSelector v-model="abnormalDisposeData.trigger" />
                        <!-- 录像 -->
                        <AlarmBaseRecordSelector v-model="abnormalDisposeData.record" />
                        <!-- 报警输出 -->
                        <AlarmBaseAlarmOutSelector v-model="abnormalDisposeData.alarmOut" />
                        <!-- 联动预置点 -->
                        <AlarmBasePresetSelector v-model="abnormalDisposeData.preset" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="base-btn-box fixed">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="applyAbnormalDisposeData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./AbnormalDispose.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
