<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:32
 * @Description: AI 事件——更多——物品遗留与看护
-->
<template>
    <div>
        <div
            class="base-btn-box padding collapse"
            span="start"
        >
            <el-checkbox
                v-model="objectLeftData.enabledSwitch"
                :label="Translate('IDCS_ENABLE')"
            />
        </div>
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
                        <div>
                            <div
                                class="base-btn-box"
                                :span="2"
                            >
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
                                        >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                                    >
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
                            inline-message
                        >
                            <!-- 排程 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select v-model="objectLeftData.schedule">
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                                <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                            </el-form-item>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select v-model="objectLeftData.holdTime">
                                    <el-option
                                        v-for="item in objectLeftData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        :empty-values="[undefined, null]"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select v-model="objectLeftData.oscType">
                                    <el-option
                                        v-for="item in objectLeftData.oscTypeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 警戒区域 -->
                            <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                <el-radio-group
                                    v-model="pageData.warnArea"
                                    class="small-btn"
                                    @change="warnAreaChange"
                                >
                                    <el-radio-button
                                        v-for="index in objectLeftData.areaMaxCount"
                                        :key="index - 1"
                                        :label="index"
                                        :value="index - 1"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- 区域名称 -->
                            <el-form-item :label="Translate('IDCS_AREA_NAME')">
                                <el-input
                                    v-model="pageData.areaName"
                                    @input="areaNameInput"
                                    @keyup.enter="enterBlur($event)"
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
                            <el-select v-model="objectLeftData.sysAudio">
                                <el-option
                                    v-for="item in pageData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="base-ai-linkage-content">
                        <!-- 常规联动 -->
                        <AlarmBaseTriggerSelector v-model="objectLeftData.trigger" />
                        <!-- 录像 -->
                        <AlarmBaseRecordSelector v-model="objectLeftData.record" />
                        <!-- 报警输出 -->
                        <AlarmBaseAlarmOutSelector v-model="objectLeftData.alarmOut" />
                        <!-- 联动预置点 -->
                        <AlarmBasePresetSelector v-model="objectLeftData.preset" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="base-btn-box fixed">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="applyObjectLeftData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
    <BaseNotification v-model:notifications="pageData.notification" />
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="pageData.scheduleManagPopOpen = false"
    />
</template>

<script lang="ts" src="./ObjectLeft.v.ts"></script>
