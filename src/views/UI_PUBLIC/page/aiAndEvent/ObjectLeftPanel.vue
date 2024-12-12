<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:32
 * @Description: AI 事件——更多——物品遗留与看护
-->
<template>
    <div>
        <div class="base-btn-box flex-start padding collapse">
            <el-checkbox
                v-model="formData.enabledSwitch"
                :label="Translate('IDCS_ENABLE')"
            />
        </div>
        <div>
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
                                @message="notify"
                            />
                        </div>
                        <div>
                            <div class="base-btn-box space-between">
                                <div>
                                    <el-checkbox
                                        v-show="pageData.isShowAllAreaCheckBox"
                                        v-model="pageData.isShowAllArea"
                                        :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                        @change="showAllArea"
                                    />
                                </div>
                                <div>
                                    <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    <el-button
                                        v-show="pageData.isShowAllClearBtn"
                                        @click="clearAllArea"
                                    >
                                        {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                                    </el-button>
                                </div>
                            </div>
                            <span class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
                        </div>
                    </div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :style="{
                                '--form-input-width': '215px',
                            }"
                        >
                            <!-- 排程 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select-v2
                                    v-model="formData.schedule"
                                    :options="pageData.scheduleList"
                                />
                                <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                            </el-form-item>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select-v2
                                    v-model="formData.holdTime"
                                    :options="formData.holdTimeList"
                                />
                            </el-form-item>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select-v2
                                    v-model="formData.oscType"
                                    :options="formData.oscTypeList"
                                />
                            </el-form-item>
                            <!-- 警戒区域 -->
                            <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                <el-radio-group
                                    v-model="pageData.warnArea"
                                    class="small-btn"
                                    @change="changeWarnArea"
                                >
                                    <el-radio-button
                                        v-for="index in formData.areaMaxCount"
                                        :key="index - 1"
                                        :label="index"
                                        :value="index - 1"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- 区域名称 -->
                            <el-form-item :label="Translate('IDCS_AREA_NAME')">
                                <el-input
                                    v-if="formData.boundary.length"
                                    v-model="formData.boundary[pageData.warnArea].areaName"
                                    :formatter="formatAreaName"
                                    :parser="formatAreaName"
                                    @keyup.enter="blurInput"
                                />
                                <el-input
                                    v-else
                                    disabled
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
                            <el-select-v2
                                v-model="formData.sysAudio"
                                :options="pageData.voiceList"
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
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="base-btn-box fixed">
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="applyObjectLeftData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="pageData.scheduleManagPopOpen = false"
    />
</template>

<script lang="ts" src="./ObjectLeftPanel.v.ts"></script>
