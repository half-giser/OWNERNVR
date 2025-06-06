<!--
 * @Description: AI 事件——更多——温度检测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:25
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div
            v-if="pageData.tab"
            class="base-btn-box flex-start padding collapse"
        >
            <el-checkbox
                v-model="formData.enabledSwitch"
                :label="Translate('IDCS_ENABLE')"
            />
        </div>
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
                                @message="notify"
                            />
                        </div>
                        <div>
                            <div class="base-btn-box space-between">
                                <el-checkbox
                                    v-model="pageData.isShowAllArea"
                                    :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                    @change="showAllArea"
                                />
                                <div>
                                    <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                                </div>
                            </div>
                            <div class="base-ai-tip">{{ pageData.drawAreaTip }}</div>
                        </div>
                    </div>
                    <div class="base-ai-param-box-right">
                        <el-form v-title>
                            <!-- 排程 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <BaseScheduleSelect
                                    v-model="formData.schedule"
                                    :options="pageData.scheduleList"
                                    @edit="pageData.isSchedulePop = true"
                                />
                            </el-form-item>
                            <!-- 规则 -->
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <BaseSelect
                                    v-model="formData.holdTime"
                                    :options="formData.holdTimeList"
                                    empty-text=""
                                />
                            </el-form-item>
                            <!-- 温度单位 -->
                            <el-form-item :label="Translate('IDCS_TEMPERATURE_UNIT')">
                                <BaseSelect
                                    v-model="formData.tempUnits"
                                    :options="tempUnitsList"
                                    @change="changeTempUnits"
                                />
                            </el-form-item>
                            <!-- 距离单位 -->
                            <el-form-item
                                v-if="formData.isShowDistance"
                                :label="Translate('IDCS_DISTANCE_UNIT')"
                            >
                                <BaseSelect
                                    v-model="formData.distanceUnits"
                                    :options="distanceUnitList"
                                    @change="changeDistanceUnits"
                                />
                            </el-form-item>
                            <!-- 屏蔽区域 -->
                            <el-form-item
                                v-if="formData.supportMaskArea"
                                :label="Translate('IDCS_MASK_AREA')"
                            >
                                <el-radio-group
                                    v-model="pageData.maskAreaIndex"
                                    class="small-btn"
                                    @change="changeMaskArea"
                                >
                                    <el-radio-button
                                        v-for="(_item, index) in formData.maskAreaInfo"
                                        :key="index"
                                        :value="index"
                                        :label="index + 1"
                                        :class="{
                                            checked: pageData.maskAreaChecked.includes(index),
                                        }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- 碼流上疊加溫度訊息 -->
                            <div
                                v-if="formData.isShowThermal || formData.isShowOptical"
                                class="base-ai-subheading"
                            >
                                {{ Translate('IDCS_BITSTREAM_OVERLAYS_TEMPERATURE_INFO') }}
                            </div>
                            <el-form-item>
                                <el-checkbox
                                    v-if="formData.isShowThermal"
                                    v-model="formData.thermaldisplayen"
                                    :label="Translate('IDCS_THERMAL_LIGHT')"
                                />
                                <el-checkbox
                                    v-if="formData.isShowOptical"
                                    v-model="formData.opticaldisplayen"
                                    :label="Translate('IDCS_VISIBLE_LIGHT')"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="base-table-box">
                            <el-table
                                ref="boundaryTableRef"
                                v-title
                                :data="formData.boundaryData"
                                :highlight-current-row="pageData.isClickTable"
                                width="100%"
                                height="240"
                                @row-click="changeBoundary"
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
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <el-checkbox v-model="row.switch" />
                                    </template>
                                </el-table-column>
                                <!-- 名称 -->
                                <el-table-column
                                    width="180"
                                    :label="Translate('IDCS_NAME')"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <el-input
                                            v-model="row.ruleName"
                                            :formatter="formatInputMaxLength"
                                            :parser="formatInputMaxLength"
                                            @keyup.enter="blurInput"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 类型 -->
                                <el-table-column
                                    width="110"
                                    :label="Translate('IDCS_TYPE')"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseSelect
                                            v-model="row.ruleType"
                                            :options="ruleShapeTypeList"
                                            @change="changeRuleType(row)"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 发射率 -->
                                <el-table-column
                                    width="90"
                                    :label="Translate('IDCS_EMISSIVITY')"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseNumberInput
                                            v-model="row.emissivity.value"
                                            :min="row.emissivity.min"
                                            :max="row.emissivity.max"
                                            :precision="2"
                                            :step="0.01"
                                            @out-of-range="blurValue(row.emissivity.min, row.emissivity.max)"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 距离（m） -->
                                <el-table-column
                                    width="90"
                                    :label="distanceText"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseNumberInput
                                            v-model="row.distance.value"
                                            :min="formData.distanceUnits === 'Meter' ? row.distance.min : row.distance.fmin"
                                            :max="formData.distanceUnits === 'Meter' ? row.distance.max : row.distance.fmax"
                                            :precision="2"
                                            :step="0.01"
                                            @out-of-range="
                                                blurValue(
                                                    formData.distanceUnits === 'Meter' ? row.distance.min : row.distance.fmin,
                                                    formData.distanceUnits === 'Meter' ? row.distance.max : row.distance.fmax,
                                                )
                                            "
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 反射温度（℃） -->
                                <el-table-column
                                    width="120"
                                    :label="reflectTemText"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseNumberInput
                                            v-model="row.reflectTemper.value"
                                            :min="formData.tempUnits === 'centigrade' ? row.reflectTemper.min : row.reflectTemper.fmin"
                                            :max="formData.tempUnits === 'centigrade' ? row.reflectTemper.max : row.reflectTemper.fmax"
                                            :precision="2"
                                            :step="0.01"
                                            @out-of-range="
                                                blurValue(
                                                    formData.tempUnits === 'centigrade' ? row.reflectTemper.min : row.reflectTemper.fmin,
                                                    formData.tempUnits === 'centigrade' ? row.reflectTemper.max : row.reflectTemper.fmax,
                                                )
                                            "
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 报警规则 -->
                                <el-table-column
                                    width="180"
                                    :label="Translate('IDCS_ALARM_RULES')"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseSelect
                                            v-model="row.alarmRule"
                                            :options="getRuleTypeList(row.ruleType)"
                                        />
                                    </template>
                                </el-table-column>
                                <!-- 报警温度（℃） -->
                                <el-table-column
                                    width="150"
                                    :label="alarmTemText"
                                >
                                    <template #default="{ row }: TableColumn<AlarmTemperatureDetectionBoundryDto>">
                                        <BaseNumberInput
                                            v-model="row.alarmTemper.value"
                                            :precision="2"
                                            :step="0.01"
                                            :min="formData.tempUnits === 'centigrade' ? row.alarmTemper.min : row.alarmTemper.fmin"
                                            :max="formData.tempUnits === 'centigrade' ? row.alarmTemper.max : row.alarmTemper.fmax"
                                            @out-of-range="
                                                blurValue(
                                                    formData.tempUnits === 'centigrade' ? row.alarmTemper.min : row.alarmTemper.fmin,
                                                    formData.tempUnits === 'centigrade' ? row.alarmTemper.max : row.alarmTemper.fmax,
                                                )
                                            "
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div class="divTip">
                            <BaseFloatError v-model:message="pageData.errorMessage" />
                        </div>
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
                            <BaseSelect
                                v-model="formData.sysAudio"
                                :options="pageData.voiceList"
                            />
                        </el-form-item>
                    </el-form>
                    <div class="base-ai-linkage-content">
                        <!-- 常规联动 -->
                        <AlarmBaseTriggerSelector
                            v-model="formData.trigger"
                            :include="pageData.triggerList"
                        />
                        <!-- 录像 -->
                        <AlarmBaseRecordSelector v-model="formData.record" />
                        <!-- 报警输出 -->
                        <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                        <!-- 抓图 -->
                        <AlarmBaseSnapSelector v-model="formData.snap" />
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
        </div>
        <div class="base-btn-box fixed">
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <!-- 更多按钮 -->
        <el-popover
            v-model:visible="pageData.moreDropDown"
            width="400"
            popper-class="no-padding"
        >
            <template #reference>
                <div class="base-ai-advance-btn">
                    <span>{{ Translate('IDCS_ADVANCED') }}</span>
                    <BaseImgSprite
                        file="arrow"
                        :chunk="4"
                    />
                </div>
            </template>
            <div class="base-ai-advance-box">
                <el-form>
                    <div class="base-ai-subheading">
                        {{ Translate('IDCS_TEMPERATURE_INFO') }}
                    </div>
                    <el-form-item v-if="formData.tempInfo.isShowSegcolor">
                        <el-checkbox
                            v-model="formData.tempInfo.segcolorTemperatureParam"
                            :label="Translate('IDCS_DISPLAY_TEMPERATURE_BAR')"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox
                            v-model="formData.tempInfo.dotTemperatureInfo"
                            :label="Translate('IDCS_CLICK_TEMPERATURE_MEASUREMENT')"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_EMISSIVITY')">
                        <BaseNumberInput
                            v-model="formData.tempInfo.emissivity.value"
                            :precision="2"
                            :step="0.01"
                            :min="formData.tempInfo.emissivity.min"
                            :max="formData.tempInfo.emissivity.max"
                            @out-of-range="blurValue(formData.tempInfo.emissivity.min, formData.tempInfo.emissivity.max)"
                        />
                    </el-form-item>
                    <el-form-item :label="distanceText">
                        <BaseNumberInput
                            v-model="formData.tempInfo.distance.value"
                            :precision="2"
                            :step="0.01"
                            :min="tempInfoDistanceMin"
                            :max="tempInfoDistanceMax"
                            @out-of-range="blurValue(tempInfoDistanceMin, tempInfoDistanceMax)"
                        />
                    </el-form-item>
                    <el-form-item
                        :label="reflectTemText"
                        show-overflow-tooltip
                    >
                        <BaseNumberInput
                            v-model="formData.tempInfo.reflectTemper.value"
                            :precision="2"
                            :step="0.01"
                            :min="tempInfoReflectMin"
                            :max="tempInfoReflectMax"
                            @out-of-range="blurValue(tempInfoReflectMin, tempInfoReflectMax)"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox
                            v-model="formData.tempInfo.maxtemperen"
                            :label="Translate('IDCS_MAX_TEMPERATURE')"
                        />
                        <el-checkbox
                            v-if="formData.tempInfo.isShowAvgtemperen"
                            v-model="formData.tempInfo.avgtemperen"
                            :label="Translate('IDCS_AVE_TEMPERATURE')"
                        />
                        <el-checkbox
                            v-model="formData.tempInfo.mintemperen"
                            :label="Translate('IDCS_MIN_TEMPERATURE')"
                        />
                        <div class="divTip">
                            <BaseFloatError v-model:message="pageData.errorMessageTemp" />
                        </div>
                    </el-form-item>
                    <div class="base-btn-box">
                        <el-button @click="pageData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                    </div>
                </el-form>
            </div>
        </el-popover>
        <!-- 排程管理弹窗 -->
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./TemperatureDetectionPanel.v.ts"></script>

<style scoped>
.divTip {
    line-height: normal;
    width: 150px;
    height: 20px;
    position: relative;
    top: 10px;
}

.base-table-box {
    height: 280px;
}
</style>
