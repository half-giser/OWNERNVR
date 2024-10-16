<!--
 * @Description: AI 事件——更多——异常侦测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:27
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-16 10:39:49
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
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-position="left"
                            inline-message
                        >
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select
                                    v-model="abnormalDisposeData.holdTime"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in abnormalDisposeData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 场景变更 -->
                            <el-form-item :label="Translate('IDCS_SCENE_CHANGE')">
                                <el-select
                                    v-model="abnormalDisposeData.sceneChangeSwitch"
                                    size="small"
                                    :disabled="abnormalDisposeData.sceneChangeSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 视频模糊 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_BLUR')">
                                <el-select
                                    v-model="abnormalDisposeData.clarityAbnormalSwitch"
                                    size="small"
                                    :disabled="abnormalDisposeData.clarityAbnormalSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 视频偏色 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_COLOR')">
                                <el-select
                                    v-model="abnormalDisposeData.colorAbnormalSwitch"
                                    size="small"
                                    :disabled="abnormalDisposeData.colorAbnormalSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 灵敏度 -->
                            <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                <el-slider
                                    v-model="abnormalDisposeData.sensitivity"
                                    :show-tooltip="false"
                                    :min="1"
                                    :max="100"
                                    size="small"
                                    :show-input-controls="false"
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
                        class="narrow"
                        :style="{
                            '--form-input-width': '215px',
                        }"
                        label-position="left"
                    >
                        <el-form-item
                            v-show="supportAlarmAudioConfig"
                            :label="Translate('IDCS_VOICE_PROMPT')"
                        >
                            <el-select v-model="abnormalDisposeData.sysAudio">
                                <el-option
                                    v-for="item in pageData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="base-ai-linkage-content">
                        <!-- 常规联动 -->
                        <div class="base-ai-linkage-box">
                            <el-checkbox
                                v-model="normalParamCheckAll"
                                class="base-ai-linkage-title"
                                @change="handleNormalParamCheckAll"
                                >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                            >
                            <el-checkbox-group
                                v-model="normalParamCheckList"
                                @change="handleNormalParamCheck"
                            >
                                <el-checkbox
                                    v-for="item in normalParamList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <!-- 录像 -->
                        <div class="base-ai-linkage-box">
                            <div class="base-ai-linkage-title">
                                <span>{{ `${Translate('IDCS_RECORD')} ` }}</span>
                                <el-button
                                    size="small"
                                    @click="pageData.recordIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}</el-button
                                >
                            </div>
                            <el-table
                                :data="abnormalDisposeData.record"
                                :show-header="false"
                            >
                                <el-table-column prop="label" />
                            </el-table>
                        </div>
                        <!-- 报警输出 -->
                        <div class="base-ai-linkage-box">
                            <div class="base-ai-linkage-title">
                                <span>{{ `${Translate('IDCS_ALARM_OUT')} ` }}</span>
                                <el-button
                                    size="small"
                                    @click="pageData.alarmOutIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}</el-button
                                >
                            </div>
                            <el-table
                                :data="abnormalDisposeData.alarmOut"
                                :show-header="false"
                            >
                                <el-table-column prop="label" />
                            </el-table>
                        </div>
                        <!-- 联动预置点 -->
                        <div
                            class="base-ai-linkage-box"
                            :style="{
                                width: '350px',
                            }"
                        >
                            <div class="base-ai-linkage-title">
                                <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                            </div>
                            <el-table
                                stripe
                                border
                                :data="PresetTableData"
                            >
                                <el-table-column
                                    prop="name"
                                    width="180px"
                                    :label="Translate('IDCS_CHANNEL_NAME')"
                                >
                                </el-table-column>
                                <el-table-column
                                    width="170px"
                                    :label="Translate('IDCS_PRESET_NAME')"
                                >
                                    <template #default="scope">
                                        <el-select
                                            v-model="scope.row.preset.value"
                                            size="small"
                                            :empty-values="[undefined, null]"
                                            @visible-change="getPresetById(scope.row)"
                                            @change="presetChange(scope.row)"
                                        >
                                            <el-option
                                                v-for="item in scope.row.presetList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
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
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.recordList"
        :linked-list="abnormalDisposeData.record?.map((item) => item.value) || []"
        type="record"
        @confirm="recordConfirm"
        @close="recordClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.alarmOutIsShow"
        header-title="IDCS_TRIGGER_ALARM_OUT"
        source-title="IDCS_ALARM_OUT"
        target-title="IDCS_TRIGGER_ALARM_OUT"
        :source-data="pageData.alarmOutList"
        :linked-list="abnormalDisposeData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./AbnormalDispose.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
