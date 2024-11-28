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
        <div>
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
                                @ready="handlePlayerReady"
                                @message="notify"
                            />
                        </div>
                        <div>
                            <div
                                class="base-btn-box"
                                span="2"
                            >
                                <div>
                                    <el-checkbox
                                        v-model="pageData.isShowAllArea"
                                        :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                        @change="showAllArea"
                                    />
                                </div>
                                <div>
                                    <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                                </div>
                            </div>
                            <span class="base-ai-tip">{{ pageData.drawAreaTip }}</span>
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
                                    v-model="tempDetectionData.schedule"
                                    :options="pageData.scheduleList"
                                />
                                <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                            </el-form-item>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select-v2
                                    v-model="tempDetectionData.holdTime"
                                    :options="tempDetectionData.holdTimeList"
                                />
                                <div class="divTip">
                                    <BaseFloatError
                                        v-model:message="pageData.errorMessage"
                                        :teleported="false"
                                    />
                                </div>
                            </el-form-item>
                        </el-form>
                        <div class="base-table-box">
                            <el-table
                                ref="boundaryTableRef"
                                :data="tempDetectionData.boundaryData"
                                highlight-current-row
                                width="100%"
                                height="280"
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
                                            :formatter="formatInputMaxLength"
                                            :parser="formatInputMaxLength"
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
                                        <el-select-v2
                                            v-model="scope.row.ruleType"
                                            :options="ruleShapeTypeList"
                                            @change="ruleTypeChange(scope.row)"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 发射率 -->
                                <el-table-column
                                    width="90"
                                    :label="Translate('IDCS_EMISSIVITY')"
                                >
                                    <template #default="scope">
                                        <el-input-number
                                            v-model="scope.row.emissivity"
                                            :min="0.01"
                                            :max="1"
                                            :precision="2"
                                            :step="0.01"
                                            @input="inputValue"
                                            @focus="focusValue(scope.row.emissivity)"
                                            @blur="blurValue(0.01, 1)"
                                            @keyup.enter="enterBlur"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 距离（m） -->
                                <el-table-column
                                    width="90"
                                    :label="Translate('IDCS_DISTANCE')"
                                >
                                    <template #default="scope">
                                        <el-input-number
                                            v-model="scope.row.distance"
                                            :min="0"
                                            :max="10000"
                                            @input="inputValue"
                                            @focus="focusValue(scope.row.distance)"
                                            @blur="blurValue(0, 10000)"
                                            @keyup.enter="enterBlur"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 反射温度（℃） -->
                                <el-table-column
                                    width="120"
                                    :label="Translate('IDCS_REFLECTED_TEMPERATURE')"
                                >
                                    <template #default="scope">
                                        <el-input-number
                                            v-model="scope.row.reflectTemper"
                                            :min="-30"
                                            :max="60"
                                            @input="inputValue"
                                            @focus="focusValue(scope.row.reflectTemper)"
                                            @blur="blurValue(-30, 60)"
                                            @keyup.enter="enterBlur"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 报警规则 -->
                                <el-table-column
                                    width="180"
                                    :label="Translate('IDCS_ALARM_RULES')"
                                >
                                    <template #default="scope">
                                        <el-select-v2
                                            v-model="scope.row.alarmRule"
                                            :options="getRuleTypeList(scope.row.ruleType)"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 报警温度（℃） -->
                                <el-table-column
                                    width="150"
                                    :label="Translate('IDCS_ALARM_TEMPERATURE')"
                                >
                                    <template #default="scope">
                                        <el-input-number
                                            v-model="scope.row.alarmTemper"
                                            :min="-50"
                                            :max="550"
                                            @input="inputValue"
                                            @focus="focusValue(scope.row.alarmTemper)"
                                            @blur="blurValue(-50, 550)"
                                            @keyup.enter="enterBlur"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
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
                                v-model="tempDetectionData.sysAudio"
                                :options="pageData.voiceList"
                            />
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
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="pageData.scheduleManagPopOpen = false"
        />
    </div>
</template>

<script lang="ts" src="./TemperatureDetectionPanel.v.ts"></script>

<style scoped>
.divTip {
    line-height: normal;
}

.base-table-box {
    height: 280px;
}
</style>
