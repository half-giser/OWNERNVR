<!--
 * @Description: AI 事件——更多——物品遗留与看护
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:32
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 15:23:13
-->
<template>
    <div>
        <div
            class="base-btn-box padding collapse"
            span="start"
        >
            <el-checkbox v-model="objectLeftData.enabledSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
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
                                        @change="showAllArea"
                                        >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                                    >
                                </div>
                                <div>
                                    <el-button
                                        size="small"
                                        @click="clearArea"
                                        >{{ Translate('IDCS_CLEAR') }}</el-button
                                    >
                                    <el-button
                                        v-show="pageData.isShowAllClearBtn"
                                        size="small"
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
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-position="left"
                            inline-message
                        >
                            <!-- 排程 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select
                                    v-model="objectLeftData.schedule"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                                <el-button
                                    size="small"
                                    @click="pageData.scheduleManagPopOpen = true"
                                    >{{ Translate('IDCS_MANAGE') }}</el-button
                                >
                            </el-form-item>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select
                                    v-model="objectLeftData.holdTime"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in objectLeftData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        :empty-values="[undefined, null]"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select
                                    v-model="objectLeftData.oscType"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in objectLeftData.oscTypeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 警戒区域 -->
                            <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                <el-radio-group
                                    v-model="pageData.warnArea"
                                    class="small-btn"
                                    size="small"
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
                                    size="small"
                                    @input="areaNameInput"
                                    @keyup.enter="enterBlur($event)"
                                ></el-input>
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
                            <el-select v-model="objectLeftData.sysAudio">
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
                                :data="objectLeftData.record"
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
                                :data="objectLeftData.alarmOut"
                                :show-header="false"
                            >
                                <el-table-column prop="label" />
                            </el-table>
                        </div>
                        <!-- 联动预置点 -->
                        <div
                            class="base-ai-linkage-box"
                            :style="{ width: '350px' }"
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
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.recordList"
        :linked-list="objectLeftData.record?.map((item) => item.value) || []"
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
        :linked-list="objectLeftData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./ObjectLeft.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
