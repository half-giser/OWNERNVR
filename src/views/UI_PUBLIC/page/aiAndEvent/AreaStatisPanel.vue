<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-12 10:02:05
 * @Description: 区域统计
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- 检测开启 -->
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>

            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="pageData.tab !== 'trigger'"
                class="base-ai-param-box-left fixed"
            >
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <!-- 区域统计设置 -->
                <div v-if="pageData.tab === 'param' && chlData.supportRegionStatistics">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-if="pageData.showAllAreaVisible"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="toggleShowAllArea"
                            />
                        </div>
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-if="pageData.clearAllVisible"
                                @click="clearAllArea"
                            >
                                {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                            </el-button>
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</div>
                </div>
            </div>
            <div class="base-ai-form">
                <!-- 两种功能 -->
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
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="formData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                        />
                                    </el-form-item>
                                    <!-- 持续时间 -->
                                    <el-form-item :label="Translate('IDCS_DURATION')">
                                        <el-select-v2
                                            v-model="formData.holdTime"
                                            :options="formData.holdTimeList"
                                        />
                                    </el-form-item>
                                    <!-- 时间阈值 -->
                                    <el-form-item
                                        v-if="formData.supportDuration"
                                        :label="Translate('IDCS_DURATION_THRESHOLD')"
                                    >
                                        <BaseNumberInput
                                            v-model="formData.duration.value"
                                            :min="formData.duration.min"
                                            :max="formData.duration.max"
                                            @out-of-range="blurDuration(formData.duration.min, formData.duration.max)"
                                        />
                                    </el-form-item>
                                    <!-- 警戒面 -->
                                    <el-form-item :label="Translate('IDCS_ALARM_LINE')">
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
                                                    checked: pageData.warnAreaChecked.includes(pageData.warnAreaIndex),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 只支持人的灵敏度 -->
                                    <el-form-item
                                        v-if="formData.onlyPerson"
                                        :label="Translate('IDCS_SENSITIVITY')"
                                    >
                                        <BaseSliderInput
                                            v-model="formData.sensitivity"
                                            :min="1"
                                        />
                                    </el-form-item>
                                    <el-form-item v-if="formData.onlyPerson">
                                        {{ Translate('IDCS_SUPPORT_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_DETECTION_PERSON')) }}
                                    </el-form-item>
                                    <div :class="pageData.objectFilterMode === 'mode3' ? 'rectangleBorder' : ''">
                                        <!-- 目标大小 -->
                                        <div
                                            v-if="formData.detectTargetList.length"
                                            :class="pageData.objectFilterMode === 'mode2' ? 'rectangleBorder' : ''"
                                        >
                                            <div class="base-ai-subheading">
                                                {{ Translate('IDCS_DETECT_TARGET_SIZE') }}
                                            </div>
                                            <!-- 目标 -->
                                            <el-form-item :label="Translate('IDCS_TARGET')">
                                                <el-select-v2
                                                    v-model="formData.detectTarget"
                                                    :options="formData.detectTargetList"
                                                    @change="showDisplayRange"
                                                />
                                            </el-form-item>
                                            <el-form-item :label="Translate('IDCS_MIN')">
                                                <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.width"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.height"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextH')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                            </el-form-item>
                                            <el-form-item :label="Translate('IDCS_MAX')">
                                                <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.width"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('maxTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.height"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('maxTextH')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                            </el-form-item>
                                            <el-form-item>
                                                <template #label>
                                                    <el-checkbox
                                                        v-model="pageData.isShowDisplayRange"
                                                        :label="Translate('IDCS_DISPLAY_RANGE_BOX')"
                                                        @change="toggleDisplayRange"
                                                    />
                                                </template>
                                            </el-form-item>
                                        </div>
                                        <!-- 检测目标 -->
                                        <div :class="pageData.objectFilterMode === 'mode5' ? 'rectangleBorder' : ''">
                                            <el-form-item v-if="formData.boundaryInfo.length && formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.supportCommonSensitivity">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.commonSensitivity.enable"
                                                        :label="Translate('IDCS_ENABLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.commonSensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.commonSensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.commonSensitivity.max"
                                                    />
                                                </template>
                                            </el-form-item>
                                            <div class="base-ai-subheading">
                                                {{ Translate('IDCS_DETECTION_TARGET') }}
                                            </div>
                                            <!-- 人灵敏度 -->
                                            <el-form-item v-if="showAllPersonTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_PERSON')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.max"
                                                    />
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                    <BaseNumberInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.stayAlarmThreshold.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.stayAlarmThreshold.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.stayAlarmThreshold.max"
                                                        class="targetInput"
                                                    />
                                                </template>
                                            </el-form-item>
                                            <!-- 汽车灵敏度 -->
                                            <el-form-item v-if="showAllCarTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.max"
                                                    />
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                    <BaseNumberInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.stayAlarmThreshold.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.stayAlarmThreshold.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.stayAlarmThreshold.max"
                                                        class="targetInput"
                                                    />
                                                </template>
                                            </el-form-item>
                                            <!-- 摩托车灵敏度 -->
                                            <el-form-item v-if="showAllMotorTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.enable"
                                                        :label="Translate('IDCS_NON_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.max"
                                                    />
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                    <BaseNumberInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.stayAlarmThreshold.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.stayAlarmThreshold.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.stayAlarmThreshold.max"
                                                        class="targetInput"
                                                    />
                                                </template>
                                            </el-form-item>
                                        </div>
                                    </div>
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
                                    <el-form-item v-if="formData.countOSD.supportOsdEntranceName">
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showEnterOsd"
                                                :label="Translate('IDCS_ENTRY_DIRECT')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdEntranceName"
                                                :maxlength="formData.countOSD.osdEntranceNameMaxLen"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item v-if="formData.countOSD.supportOsdExitName">
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showExitOsd"
                                                :label="Translate('IDCS_VEHICLE_EXIT')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdExitName"
                                                :maxlength="formData.countOSD.osdExitNameMaxLen"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item v-if="formData.countOSD.supportOsdStayName">
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData.countOSD.showStayOsd"
                                                :label="Translate('IDCS_STRAND')"
                                            />
                                        </template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdStayName"
                                                :maxlength="formData.countOSD.osdStayNameMaxLen"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item v-if="formData.countOSD.supportOsdWelcomeName">
                                        <template #label>{{ Translate('IDCS_BELOW_THRESHOLD') }}</template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdWelcomeName"
                                                :maxlength="formData.countOSD.osdWelcomeNameMaxLen"
                                            />
                                        </template>
                                    </el-form-item>
                                    <el-form-item v-if="formData.countOSD.supportOsdAlarmName">
                                        <template #label>{{ Translate('IDCS_OVER_THRESHOLD') }}</template>
                                        <template #default>
                                            <input
                                                v-model="formData.countOSD.osdAlarmName"
                                                :maxlength="formData.countOSD.osdAlarmNameMaxLen"
                                            />
                                        </template>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- 联动方式 -->
                    <el-tab-pane
                        :label="Translate('IDCS_LINKAGE_MODE')"
                        name="trigger"
                    >
                        <el-form v-if="pageData.supportAlarmAudioConfig">
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select-v2
                                    v-model="formData.sysAudio"
                                    :options="voiceList"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <AlarmBaseTriggerSelector
                                v-model="formData.trigger"
                                :include="formData.triggerList"
                            />
                            <!-- record -->
                            <AlarmBaseRecordSelector v-model="formData.recordChls" />
                            <!-- alarm -->
                            <AlarmBaseAlarmOutSelector v-model="formData.alarmOutChls" />
                            <!-- preset -->
                            <AlarmBasePresetSelector v-model="formData.presets" />
                            <!-- Ip Speaker -->
                            <AlarmBaseIPSpeakerSelector
                                v-if="pageData.supportAlarmAudioConfig"
                                v-model="formData.ipSpeaker"
                                :chl-id="currChlId"
                            />
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
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveTargetPicture"
                                    :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                                />
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveSourcePicture"
                                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                />
                            </el-form-item>
                            <!-- 重置信息 -->
                            <div class="base-ai-subheading">
                                {{ Translate('IDCS_RESET_INFO') }}
                            </div>
                            <el-form-item>
                                <template #label>{{ Translate('IDCS_AUTO_RESET') }}</template>
                                <template #default>
                                    <el-checkbox
                                        v-model="pageData.autoReset"
                                        :label="Translate('IDCS_ENABLE')"
                                        @change="changeAutoReset"
                                    />
                                </template>
                            </el-form-item>
                            <!-- 模式 -->
                            <el-form-item :label="Translate('IDCS_MODE')">
                                <el-select-v2
                                    v-model="pageData.timeType"
                                    :options="formData.countCycleTypeList"
                                    :disabled="!pageData.autoReset"
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
                                <el-select-v2
                                    v-if="pageData.timeType === 'week'"
                                    v-model="formData.countPeriod.week.date"
                                    :options="pageData.weekOption"
                                    :disabled="!pageData.autoReset"
                                />
                                <el-select-v2
                                    v-if="pageData.timeType === 'month'"
                                    v-model="formData.countPeriod.month.date"
                                    :options="pageData.monthOption"
                                    :disabled="!pageData.autoReset"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'off'"
                                    model-value=""
                                    disabled
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
                                <el-button @click.stop="pageData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </el-form>
                    </div>
                </el-popover>
            </div>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./AreaStatisPanel.v.ts"></script>

<style lang="scss" scoped></style>
