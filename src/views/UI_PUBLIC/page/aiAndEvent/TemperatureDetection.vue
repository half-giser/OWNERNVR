<!--
 * @Description: AI 事件——更多——温度检测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:25
-->
<template>
    <div>
        <div
            class="base-btn-box padding collapse"
            span="start"
        >
            <el-checkbox
                v-model="tempDetectionData.enabledSwitch"
                :label="Translate('IDCS_ENABLE')"
            />
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
                                    :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                    @change="showAllArea"
                                />
                                <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                            </div>
                            <span class="base-ai-tip">{{ pageData.drawAreaTip }}</span>
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
                                <el-select v-model="tempDetectionData.schedule">
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
                                <el-select v-model="tempDetectionData.holdTime">
                                    <el-option
                                        v-for="item in tempDetectionData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        :empty-values="[undefined, null]"
                                    />
                                </el-select>
                                <div id="divTip"></div>
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
                                width="60"
                            />
                            <!-- 启用 -->
                            <el-table-column
                                width="60"
                                :label="Translate('IDCS_ENABLE')"
                            >
                                <template #default="scope">
                                    <el-checkbox v-model="scope.row.switch" />
                                </template>
                            </el-table-column>
                            <!-- 名称 -->
                            <el-table-column
                                width="180"
                                :label="Translate('IDCS_NAME')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.ruleName"
                                        @input="ruleNameInput(scope.row.ruleName, scope.$index)"
                                        @keyup.enter="enterBlur($event)"
                                    />
                                </template>
                            </el-table-column>
                            <!-- 类型 -->
                            <el-table-column
                                width="110"
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
                                        />
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 发射率 -->
                            <el-table-column
                                width="90"
                                :label="Translate('IDCS_EMISSIVITY')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.emissivity"
                                        type="number"
                                        @input="emissivityInput(scope.row.emissivity, scope.$index)"
                                        @blur="emissivityBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    />
                                </template>
                            </el-table-column>
                            <!-- 距离（m） -->
                            <el-table-column
                                width="90"
                                :label="Translate('IDCS_DISTANCE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.distance"
                                        @input="distanceInput(scope.row.distance, scope.$index)"
                                        @blur="distanceBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    />
                                </template>
                            </el-table-column>
                            <!-- 反射温度（℃） -->
                            <el-table-column
                                width="120"
                                :label="Translate('IDCS_REFLECTED_TEMPERATURE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.reflectTemper"
                                        @input="reflectTemperInput(scope.row.reflectTemper, scope.$index)"
                                        @blur="reflectTemperBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    />
                                </template>
                            </el-table-column>
                            <!-- 报警规则 -->
                            <el-table-column
                                width="180"
                                :label="Translate('IDCS_ALARM_RULES')"
                            >
                                <template #default="scope">
                                    <el-select v-model="scope.row.alarmRule">
                                        <el-option
                                            v-for="item in pageData.alarmRuleTypeList[scope.$index]"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                        />
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 报警温度（℃） -->
                            <el-table-column
                                width="150"
                                :label="Translate('IDCS_ALARM_TEMPERATURE')"
                            >
                                <template #default="scope">
                                    <el-input
                                        v-model="scope.row.alarmTemper"
                                        @input="alarmTemperInput(scope.row.alarmTemper, scope.$index)"
                                        @blur="alarmTemperBlur(scope.row)"
                                        @keyup.enter="enterBlur($event)"
                                    />
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
                        v-if="supportAlarmAudioConfig"
                        :style="{
                            '--form-input-width': '215px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                            <el-select v-model="tempDetectionData.sysAudio">
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
                        <AlarmBaseTriggerSelector
                            v-model="tempDetectionData.trigger"
                            :include="pageData.triggerList"
                        />
                        <!-- 录像 -->
                        <AlarmBaseRecordSelector v-model="tempDetectionData.record" />
                        <!-- 报警输出 -->
                        <AlarmBaseAlarmOutSelector v-model="tempDetectionData.alarmOut" />
                        <!-- 抓图 -->
                        <AlarmBaseSnapSelector v-model="tempDetectionData.snap" />
                        <!-- 联动预置点 -->
                        <AlarmBasePresetSelector v-model="tempDetectionData.preset" />
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
        <BaseFloatError ref="baseFloatErrorRef" />
        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="pageData.scheduleManagPopOpen = false"
        />
    </div>
</template>

<script lang="ts" src="./TemperatureDetection.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style scoped>
#divTip {
    line-height: normal;
}
</style>
