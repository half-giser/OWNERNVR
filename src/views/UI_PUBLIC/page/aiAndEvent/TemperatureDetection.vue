<!--
 * @Description: AI 事件——更多——温度检测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:25
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-21 10:54:42
-->
<template>
    <div>
        <div
            class="base-btn-box padding collapse"
            span="start"
        >
            <el-checkbox v-model="tempDetectionData.enabledSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
        </div>
        <div :style="{ position: 'relative' }">
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
                @tab-change="tempTabChange"
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
                            <div class="base-btn-box">
                                <el-checkbox
                                    v-model="pageData.isShowAllArea"
                                    :style="{ flex: '1' }"
                                    @change="showAllArea"
                                    >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                                >
                                <el-button
                                    size="small"
                                    @click="clearArea"
                                    >{{ Translate('IDCS_CLEAR') }}</el-button
                                >
                                <el-button
                                    size="small"
                                    @click="clearAllArea"
                                    >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                                >
                            </div>
                            <span class="base-ai-tip">{{ pageData.drawAreaTip }}</span>
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
                                    v-model="tempDetectionData.schedule"
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
                                    v-model="tempDetectionData.holdTime"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in tempDetectionData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        :empty-values="[undefined, null]"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>

                        <el-table
                            ref="boundaryTableRef"
                            stripe
                            border
                            :data="tempDetectionData.boundaryData"
                            highlight-current-row
                            :style="{ width: '940px', height: '280px' }"
                            @row-click="boundaryRowClick"
                        >
                            <!-- 序号 -->
                            <el-table-column
                                type="index"
                                :label="Translate('IDCS_SERIAL_NUMBER')"
                                width="60px"
                            />
                            <!-- 启用 -->
                            <el-table-column
                                prop="switch"
                                width="60px"
                                :label="Translate('IDCS_ENABLE')"
                            >
                                <template #default="scope">
                                    <el-checkbox v-model="scope.row.switch"></el-checkbox>
                                </template>
                            </el-table-column>
                            <!-- 名称 -->
                            <el-table-column
                                prop="ruleName"
                                width="180px"
                                :label="Translate('IDCS_NAME')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.ruleName"
                                        @input="ruleNameInput(scope.row.ruleName, scope.$index)"
                                        @keyup.enter="enterBlur($event)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                            <!-- 类型 -->
                            <el-table-column
                                prop="ruleType"
                                width="110px"
                                :label="Translate('IDCS_TYPE')"
                            >
                                <template #default="scope">
                                    <el-select
                                        v-model="scope.row.ruleType"
                                        @change="ruleTypeChange(scope.row.ruleType, scope.row, scope.$index)"
                                    >
                                        <el-option
                                            v-for="item in ruleShapeTypeList"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                        ></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 发射率 -->
                            <el-table-column
                                prop="emissivity"
                                width="90px"
                                :label="Translate('IDCS_EMISSIVITY')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.emissivity"
                                        type="number"
                                        @input="emissivityInput(scope.row.emissivity, scope.$index)"
                                        @blur="emissivityBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                            <!-- 距离（m） -->
                            <el-table-column
                                prop="distance"
                                width="90px"
                                :label="Translate('IDCS_DISTANCE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.distance"
                                        @input="distanceInput(scope.row.distance, scope.$index)"
                                        @blur="distanceBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                            <!-- 反射温度（℃） -->
                            <el-table-column
                                prop="reflectTemper"
                                width="120px"
                                :label="Translate('IDCS_REFLECTED_TEMPERATURE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.reflectTemper"
                                        @input="reflectTemperInput(scope.row.reflectTemper, scope.$index)"
                                        @blur="reflectTemperBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                            <!-- 报警规则 -->
                            <el-table-column
                                prop="alarmRule"
                                width="180px"
                                :label="Translate('IDCS_ALARM_RULES')"
                            >
                                <template #default="scope">
                                    <el-select v-model="scope.row.alarmRule">
                                        <el-option
                                            v-for="item in pageData.alarmRuleTypeList[scope.$index]"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                        ></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 报警温度（℃） -->
                            <el-table-column
                                prop="alarmTemper"
                                width="150px"
                                :label="Translate('IDCS_ALARM_TEMPERATURE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.alarmTemper"
                                        @input="alarmTemperInput(scope.row.alarmTemper, scope.$index)"
                                        @blur="alarmTemperBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                        </el-table>
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
                            <el-select v-model="tempDetectionData.sysAudio">
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
                                class="base-ai-linkage-title base-ai-linkage-title-checkbox-input"
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
                                    class="form_btn"
                                    @click="pageData.recordIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}</el-button
                                >
                            </div>
                            <el-table
                                :data="tempDetectionData.record"
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
                                    class="form_btn"
                                    size="small"
                                    @click="pageData.alarmOutIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}</el-button
                                >
                            </div>
                            <el-table
                                :data="tempDetectionData.alarmOut"
                                :show-header="false"
                            >
                                <el-table-column prop="label" />
                            </el-table>
                        </div>
                        <!-- 抓图 -->
                        <div class="base-ai-linkage-box">
                            <div class="base-ai-linkage-title">
                                <span>{{ `${Translate('IDCS_SNAP')} ` }}</span>
                                <el-button
                                    size="small"
                                    class="form_btn"
                                    @click="pageData.snapIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}</el-button
                                >
                            </div>
                            <el-table
                                :data="tempDetectionData.snap"
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
                @click="applyTempDetectionData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
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
        :linked-list="tempDetectionData.record?.map((item) => item.value) || []"
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
        :linked-list="tempDetectionData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.snapIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_SNAP"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.snapList"
        :linked-list="tempDetectionData.snap?.map((item) => item.value) || []"
        type="snap"
        @confirm="snapConfirm"
        @close="snapClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./TemperatureDetection.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
