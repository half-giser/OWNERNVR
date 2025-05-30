<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-12 15:00:13
 * @Description: 过线检测
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- 检测开启 -->
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-if="chlData.supportPassLine"
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
                <el-checkbox
                    v-if="chlData.supportCpc"
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
                <!-- passLine设置 -->
                <div v-if="pageData.tab === 'param' && chlData.supportPassLine">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-if="pageData.showAllAreaVisible"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="togglePassLineShowAllArea"
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
                <!-- cpc设置 -->
                <div v-if="pageData.tab === 'param' && chlData.supportCpc">
                    <div class="base-btn-box">
                        <!-- <div>
                            <el-checkbox
                                v-if="pageData.showCpcDrawAvailable"
                                v-model="pageData.isCpcDrawAvailable"
                                :label="Translate('IDCS_DRAW_WARN_SURFACE')"
                                @change="toggleCpcDrawAvailable"
                            />
                        </div> -->
                        <el-button @click="clearCpcArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</div>
                </div>
            </div>
            <div class="base-ai-form">
                <!-- 三种种功能：参数设置 、OSD叠加、联动方式 -->
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
                                    <!-- 侦测灵敏度 -->
                                    <el-form-item
                                        v-if="chlData.supportCpc"
                                        :label="Translate('IDCS_SENSITIVITY')"
                                    >
                                        <el-select-v2
                                            v-model="formData.detectSensitivity"
                                            :options="formData.detectSensitivityList"
                                        />
                                    </el-form-item>
                                    <!-- 侦测灵敏度 -->
                                    <el-form-item
                                        v-if="chlData.supportCpc"
                                        :label="Translate('IDCS_STATISTICALCYCLE')"
                                    >
                                        <el-select-v2
                                            v-model="formData.statisticalPeriod"
                                            :options="formData.statisticalPeriodList"
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
                                    <el-form-item
                                        v-if="chlData.supportPassLine"
                                        :label="Translate('IDCS_ALARM_LINE')"
                                    >
                                        <el-radio-group
                                            v-model="pageData.surfaceIndex"
                                            class="small-btn"
                                            @change="changeLine"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.line"
                                                :key="index"
                                                :value="index"
                                                :label="index + 1"
                                                :class="{
                                                    checked: pageData.surfaceChecked.includes(pageData.surfaceIndex),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 方向 -->
                                    <el-form-item
                                        v-if="chlData.supportPassLine"
                                        :label="Translate('IDCS_DIRECTION')"
                                    >
                                        <el-select-v2
                                            v-model="pageData.direction"
                                            :options="pageData.directionList"
                                            @change="changeDirection"
                                        />
                                    </el-form-item>
                                    <div
                                        v-if="chlData.supportPassLine"
                                        :class="pageData.objectFilterMode === 'mode3' ? 'rectangleBorder' : ''"
                                    >
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
                                                    v-if="formData.line.length"
                                                    v-model="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.width"
                                                    :min="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.line.length"
                                                    v-model="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.height"
                                                    :min="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextH')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                            </el-form-item>
                                            <el-form-item :label="Translate('IDCS_MAX')">
                                                <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.line.length"
                                                    v-model="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.width"
                                                    :min="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('maxTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.line.length"
                                                    v-model="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.height"
                                                    :min="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.line[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
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
                                            <div class="base-ai-subheading">
                                                {{ Translate('IDCS_DETECTION_TARGET') }}
                                            </div>
                                            <!-- 人灵敏度 -->
                                            <el-form-item v-if="showAllPersonTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.person.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_PERSON')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.person.sensitivity.value"
                                                        :min="formData.line[pageData.surfaceIndex].objectFilter.person.sensitivity.min"
                                                        :max="formData.line[pageData.surfaceIndex].objectFilter.person.sensitivity.max"
                                                    />
                                                    <div v-if="showPersonThreshold">
                                                        <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                        <BaseNumberInput
                                                            v-if="formData.line.length"
                                                            v-model="formData.line[pageData.surfaceIndex].objectFilter.person.stayAlarmThreshold.value"
                                                            :min="formData.line[pageData.surfaceIndex].objectFilter.person.stayAlarmThreshold.min"
                                                            :max="formData.line[pageData.surfaceIndex].objectFilter.person.stayAlarmThreshold.max"
                                                            class="targetInput"
                                                        />
                                                    </div>
                                                </template>
                                            </el-form-item>
                                            <!-- 汽车灵敏度 -->
                                            <el-form-item v-if="showAllCarTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.car.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.car.sensitivity.value"
                                                        :min="formData.line[pageData.surfaceIndex].objectFilter.car.sensitivity.min"
                                                        :max="formData.line[pageData.surfaceIndex].objectFilter.car.sensitivity.max"
                                                    />
                                                    <div v-if="showCarThreshold">
                                                        <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                        <BaseNumberInput
                                                            v-if="formData.line.length"
                                                            v-model="formData.line[pageData.surfaceIndex].objectFilter.car.stayAlarmThreshold.value"
                                                            :min="formData.line[pageData.surfaceIndex].objectFilter.car.stayAlarmThreshold.min"
                                                            :max="formData.line[pageData.surfaceIndex].objectFilter.car.stayAlarmThreshold.max"
                                                            class="targetInput"
                                                        />
                                                    </div>
                                                </template>
                                            </el-form-item>
                                            <!-- 摩托车灵敏度 -->
                                            <el-form-item v-if="showAllMotorTarget">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.motor.sensitivity.enable"
                                                        :label="Translate('IDCS_NON_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.line.length"
                                                        v-model="formData.line[pageData.surfaceIndex].objectFilter.motor.sensitivity.value"
                                                        :min="formData.line[pageData.surfaceIndex].objectFilter.motor.sensitivity.min"
                                                        :max="formData.line[pageData.surfaceIndex].objectFilter.motor.sensitivity.max"
                                                    />
                                                    <div v-if="showMotorThreshold">
                                                        <span class="base-ai-slider-label">{{ Translate('IDCS_STAY_ALARM_THRESHOLD') }}</span>
                                                        <BaseNumberInput
                                                            v-if="formData.line.length"
                                                            v-model="formData.line[pageData.surfaceIndex].objectFilter.motor.stayAlarmThreshold.value"
                                                            :min="formData.line[pageData.surfaceIndex].objectFilter.motor.stayAlarmThreshold.min"
                                                            :max="formData.line[pageData.surfaceIndex].objectFilter.motor.stayAlarmThreshold.max"
                                                            class="targetInput"
                                                        />
                                                    </div>
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
                        v-if="chlData.supportPassLine"
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
                                                @change="changeOSD"
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
                        v-if="chlData.supportPassLine"
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
                <div
                    v-if="chlData.supportPassLine"
                    class="base-ai-advance-btn"
                    @click="handleMoreClick"
                >
                    {{ Translate('IDCS_ADVANCED') }}
                    <BaseImgSprite
                        file="arrow"
                        :chunk="4"
                    />
                </div>
            </div>
        </div>
        <PassLineEmailPop
            v-model="pageData.morePopOpen"
            :schedule-list="pageData.scheduleList"
            :email-data="pageData.emailData"
            @edit-schedule="pageData.isSchedulePop = true"
            @close="closeMorePop"
        />
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./PassLinePanel.v.ts"></script>

<style lang="scss" scoped></style>
