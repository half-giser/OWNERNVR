<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:29
 * @Description: 火点检测
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
        <BaseNotification v-model:notifications="pageData.notification" />
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
                span="2"
            >
                <div>
                    <el-checkbox
                        v-model="formData.detectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </div>
                <div></div>
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
                                    ref="playerRef"
                                    type="live"
                                    @onready="handlePlayerReady"
                                />
                            </div>
                        </div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_SCHEDULE') }}
                                </div>
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
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
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
