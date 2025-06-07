<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-15 19:52:13
 * @Description: 客流统计
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div class="base-btn-box space-between padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div class="base-ai-param-box-left fixed">
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <div v-show="showAreaTipMsg">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-show="pageData.tab === 'param' && isShowAllVisible"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="toggleShowAllArea"
                            />
                        </div>
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-if="pageData.tab === 'param' && isShowAllVisible"
                                @click="clearAllArea"
                            >
                                {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                            </el-button>
                        </div>
                    </div>
                    <div class="base-ai-tip">
                        {{ drawAreaTipMsg }}
                    </div>
                </div>
            </div>
            <div class="base-ai-form">
                <el-tabs
                    v-model="pageData.tab"
                    class="base-ai-tabs"
                    @tab-change="changeTab"
                >
                    <!-- 参数设置 -->
                    <el-tab-pane
                        :label="Translate('IDCS_PARAM_SETTING')"
                        name="param"
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form v-title>
                                    <!-- 排程 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="pageData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                            @change="watchEdit.disabled.value = false"
                                        />
                                    </el-form-item>
                                    <!-- 规则 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                    <el-form-item :label="`${Translate('IDCS_LINE')}/${Translate('IDCS_AREA')}`">
                                        <BaseSelect
                                            v-model="pageData.detectType"
                                            :options="pageData.detectTypeList"
                                            empty-text=""
                                            @change="changeLineArea"
                                        />
                                    </el-form-item>
                                    <!-- 警戒线 -->
                                    <el-form-item
                                        v-show="showLineCfg"
                                        :label="Translate('IDCS_ALARM_LINE')"
                                    >
                                        <el-radio-group
                                            v-model="pageData.lineIndex"
                                            class="small-btn"
                                            @change="changeLine"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.lineInfo"
                                                :key="index"
                                                :value="index"
                                                :label="index + 1"
                                                :class="{
                                                    checked: pageData.lineChecked.includes(pageData.lineIndex),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 方向 -->
                                    <el-form-item
                                        v-show="showLineCfg"
                                        :label="Translate('IDCS_DIRECTION')"
                                    >
                                        <BaseSelect
                                            v-model="pageData.lineDirection"
                                            :options="pageData.lineDirectionList"
                                            empty-text=""
                                            @change="changeLineDirection"
                                        />
                                    </el-form-item>
                                    <!-- 警戒区域 -->
                                    <el-form-item
                                        v-show="showAreaCfg"
                                        :label="Translate('IDCS_WARN_AREA')"
                                    >
                                        <el-radio-group
                                            v-model="pageData.warnAreaIndex"
                                            class="small-btn"
                                            @change="changeWarnArea"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.boundaryInfo"
                                                :key="index"
                                                :value="index"
                                                :label="index + 1"
                                                :class="{
                                                    checked: pageData.warnAreaChecked.includes(index),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 绘制区域 -->
                                    <el-form-item
                                        v-show="showAreaCfg"
                                        :label="Translate('IDCS_DRAW_AREA')"
                                    >
                                        <el-radio-group
                                            v-model="pageData.drawAreaIndex"
                                            class="small-btn"
                                            @change="changeDrawArea"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.boundaryInfo[0]"
                                                v-show="index !== 'direction'"
                                                :key="index"
                                                :value="index"
                                                :label="index.slice(-1)"
                                                :class="{
                                                    checked: pageData.drawAreaChecked.includes(index),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 方向 -->
                                    <el-form-item
                                        v-show="showAreaCfg"
                                        :label="Translate('IDCS_DIRECTION')"
                                    >
                                        <BaseSelect
                                            v-model="pageData.areaDirection"
                                            :options="pageData.areaDirectionList"
                                            empty-text=""
                                            @change="changeAreaDirection"
                                        />
                                    </el-form-item>
                                    <!-- 持续时间 -->
                                    <el-form-item :label="Translate('IDCS_DURATION')">
                                        <BaseSelect
                                            v-model="formData.holdTime"
                                            empty-text=""
                                            :options="formData.holdTimeList"
                                        />
                                    </el-form-item>
                                    <!-- 灵敏度 -->
                                    <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                        <BaseSliderInput
                                            v-model="formData.sensitivity.value"
                                            :min="formData.sensitivity.min"
                                            :max="formData.sensitivity.max"
                                        />
                                    </el-form-item>
                                    <!-- 滞留报警阈值 -->
                                    <el-form-item :label="Translate('IDCS_STAY_ALARM_THRESHOLD')">
                                        <BaseSliderInput
                                            v-model="formData.overcrowdingThreshold.value"
                                            :min="formData.overcrowdingThreshold.min"
                                            :max="formData.overcrowdingThreshold.max"
                                        />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- 校正方法 -->
                    <el-tab-pane
                        :label="Translate('IDCS_CALIBRATION_MODE')"
                        name="calibration"
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_CALIBRATION') }}
                                    </div>
                                    <!-- 校正方法 -->
                                    <el-form-item :label="Translate('IDCS_CALIBRATION_MODE')">
                                        <BaseSelect
                                            v-model="formData.calibration.modeType"
                                            :options="pageData.calibrationModeList"
                                            @change="changeCalibrationMode"
                                        />
                                    </el-form-item>
                                    <!-- IPC离地高度 -->
                                    <el-form-item :label="Translate('IDCS_LENS_HEIGHT')">
                                        <BaseNumberInput
                                            v-model="formData.calibration.height.value"
                                            :disabled="formData.calibration.modeType === 'auto'"
                                            :min="formData.calibration.height.min"
                                            :max="formData.calibration.height.max"
                                        />
                                        <el-button @click="handleCalibrate">
                                            {{ Translate('IDCS_CALIBRATION') }}
                                        </el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- OSD叠加 -->
                    <el-tab-pane
                        :label="Translate('IDCS_OSD')"
                        name="imageOSD"
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_DETECTION_TARGET') }}
                                    </div>
                                    <!-- OSD -->
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.switch"
                                                :label="Translate('IDCS_OSD')"
                                                @change="setEnableOSD"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showEnterOsd"
                                                :label="Translate('IDCS_ENTRY_DIRECT')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdEntranceName"
                                                :maxlength="12"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showExitOsd"
                                                :label="Translate('IDCS_VEHICLE_EXIT')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdExitName"
                                                :maxlength="12"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showStayOsd"
                                                :label="Translate('IDCS_STRAND')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdStayName"
                                                :maxlength="12"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_HUMAN_COUNT')">
                                        <input
                                            v-model="formData.countOSD.osdPersonName"
                                            :maxlength="12"
                                        />
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_CHILD_COUNT')">
                                        <input
                                            v-model="formData.countOSD.osdChildName"
                                            :maxlength="12"
                                        />
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_BELOW_THRESHOLD')">
                                        <input
                                            v-model="formData.countOSD.osdWelcomeName"
                                            :maxlength="12"
                                        />
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_OVER_THRESHOLD')">
                                        <input
                                            v-model="formData.countOSD.osdAlarmName"
                                            :maxlength="12"
                                        />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- 高度过滤 -->
                    <el-tab-pane
                        :label="Translate('IDCS_HEIGHT_FILTER')"
                        name="heightFilter"
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form>
                                    <!-- 高度过滤 -->
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.enableHeightFilter"
                                                :label="Translate('IDCS_HEIGHT_FILTER')"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_HEIGHT')">
                                        <BaseSliderInput
                                            v-model="formData.heightLowerLimit.value"
                                            :disabled="!formData.enableHeightFilter"
                                            :min="formData.heightLowerLimit.min"
                                            :max="formData.heightLowerLimit.max"
                                        />
                                    </el-form-item>
                                    <!-- 儿童计数 -->
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.enableChildFilter"
                                                :label="Translate('IDCS_CHILD_COUNT')"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_HEIGHT')">
                                        <BaseSliderInput
                                            v-model="formData.childHeightLowerLimit.value"
                                            :disabled="!formData.enableChildFilter"
                                            :min="formData.childHeightLowerLimit.min"
                                            :max="formData.childHeightLowerLimit.max"
                                        />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="watchEdit.disabled.value"
                        @click="applyData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
                <!-- 更多按钮 -->
                <BasePopover
                    v-model:visible="pageData.moreDropDown"
                    width="400"
                    popper-class="no-padding"
                >
                    <template #reference>
                        <div
                            v-show="formData.pictureAvailable"
                            class="base-ai-advance-btn"
                        >
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
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveSourcePicture"
                                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                />
                            </el-form-item>
                            <!-- 重置信息 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_RESET_INFO') }}</div>
                            <!-- 自动重置 -->
                            <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                                <el-checkbox
                                    v-model="pageData.autoReset"
                                    :label="Translate('IDCS_ENABLE')"
                                    @change="changeAutoReset"
                                />
                            </el-form-item>
                            <!-- 模式 -->
                            <el-form-item :label="Translate('IDCS_MODE')">
                                <BaseSelect
                                    v-model="pageData.timeType"
                                    :disabled="!pageData.autoReset"
                                    :options="pageData.countCycleTypeList"
                                    :teleported="false"
                                    @change="changeTimeType"
                                />
                            </el-form-item>
                            <!-- 时间 -->
                            <el-form-item
                                :label="Translate('IDCS_TIME')"
                                :style="{
                                    '--form-input-width': '121px',
                                }"
                            >
                                <BaseSelect
                                    v-if="pageData.timeType === 'week'"
                                    v-model="formData.countPeriod.week.date"
                                    :options="pageData.weekOption"
                                    :disabled="!pageData.autoReset"
                                    :teleported="false"
                                />
                                <BaseSelect
                                    v-if="pageData.timeType === 'month'"
                                    v-model="formData.countPeriod.month.date"
                                    :options="pageData.monthOption"
                                    :disabled="!pageData.autoReset"
                                    :teleported="false"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'day'"
                                    v-model="formData.countPeriod.day.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'week'"
                                    v-model="formData.countPeriod.week.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'month'"
                                    v-model="formData.countPeriod.month.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                            </el-form-item>
                            <!-- 手动重置 -->
                            <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                <el-button @click="resetData">
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                            <div class="base-btn-box">
                                <el-button @click="pageData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </el-form>
                    </div>
                </BasePopover>
            </div>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./BinocularCountPanel.v.ts"></script>

<style lang="scss" scoped></style>
