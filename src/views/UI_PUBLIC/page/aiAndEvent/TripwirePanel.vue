<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:11:35
 * @Description: 越界
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div
                v-if="!supportPeaTrigger"
                class="base-btn-box space-between padding collapse"
            >
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(chlData.supportTripwire ? 'IPC' : 'NVR')"
                />
                <AlarmBaseResourceData
                    event="tripwire"
                    :enable="formData.detectionEnable && !chlData.supportTripwire"
                    :chl-id="currChlId"
                    @error="formData.detectionEnable = false"
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
                <div v-if="pageData.tab === 'param' && !supportPeaTrigger">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-if="formData.lineInfo.length > 1"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="toggleShowAllArea"
                            />
                        </div>
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-if="formData.lineInfo.length > 1"
                                @click="clearAllArea"
                            >
                                {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                            </el-button>
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</div>
                </div>
                <ChannelPtzCtrlPanel
                    v-show="chlData.supportAutoTrack"
                    :chl-id="currChlId || ''"
                    layout="event"
                    enable-speed
                    @speed="setSpeed"
                />
            </div>
            <div class="base-ai-form">
                <!-- 三种功能 -->
                <el-tabs
                    v-model="pageData.tab"
                    class="base-ai-tabs"
                    @tab-change="changeTab"
                >
                    <!-- 参数设置 -->
                    <el-tab-pane
                        :label="Translate('IDCS_PARAM_SETTING')"
                        name="param"
                        class="base-ai-param-box"
                    >
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                v-if="!supportPeaTrigger"
                                v-title
                            >
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
                                    <BaseSelect
                                        v-model="formData.holdTime"
                                        :options="formData.holdTimeList"
                                        empty-text=""
                                    />
                                </el-form-item>
                                <!-- 警戒面 -->
                                <el-form-item :label="Translate('IDCS_ALERT_SURFACE')">
                                    <el-radio-group
                                        v-model="pageData.surfaceIndex"
                                        class="small-btn"
                                        @change="changeSurface()"
                                    >
                                        <el-radio-button
                                            v-for="(_item, index) in formData.lineInfo"
                                            :key="index"
                                            :value="index"
                                            :label="index + 1"
                                            :class="{
                                                checked: pageData.surfaceChecked.includes(index),
                                            }"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <div :class="pageData.objectFilterMode === 'mode3' ? 'rectangleBorder' : ''">
                                    <!-- 方向 -->
                                    <div :class="pageData.objectFilterMode === 'mode2' ? 'rectangleBorder' : ''">
                                        <el-form-item :label="Translate('IDCS_DIRECTION')">
                                            <BaseSelect
                                                v-model="formData.direction"
                                                :options="formData.directionList"
                                                @change="changeDirection"
                                            />
                                        </el-form-item>
                                        <!-- 目标大小 -->
                                        <div
                                            v-if="formData.detectTargetList.length"
                                            class="base-ai-subheading"
                                        >
                                            {{ Translate('IDCS_DETECT_TARGET_SIZE') }}
                                        </div>
                                        <!-- 目标 -->
                                        <el-form-item
                                            v-if="formData.detectTargetList.length"
                                            :label="Translate('IDCS_TARGET')"
                                        >
                                            <BaseSelect
                                                v-model="formData.detectTarget"
                                                :options="formData.detectTargetList"
                                                empty-text=""
                                                @change="showDisplayRange"
                                            />
                                        </el-form-item>
                                        <el-form-item
                                            v-if="formData.detectTargetList.length"
                                            :label="Translate('IDCS_MIN')"
                                        >
                                            <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.lineInfo.length"
                                                v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.width"
                                                :min="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                :max="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('minTextW')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                            <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.lineInfo.length"
                                                v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.height"
                                                :min="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                :max="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('minTextH')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                        </el-form-item>
                                        <el-form-item
                                            v-if="formData.detectTargetList.length"
                                            :label="Translate('IDCS_MAX')"
                                        >
                                            <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.lineInfo.length"
                                                v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.width"
                                                :min="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                :max="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('maxTextW')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                            <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.lineInfo.length"
                                                v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.height"
                                                :min="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                :max="formData.lineInfo[pageData.surfaceIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('maxTextH')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                        </el-form-item>
                                        <el-form-item v-if="formData.detectTargetList.length">
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
                                        <el-form-item v-if="formData.lineInfo.length && formData.lineInfo[pageData.surfaceIndex].objectFilter.supportCommonSensitivity">
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.commonSensitivity.enable"
                                                    :label="Translate('IDCS_ENABLE')"
                                                />
                                            </template>
                                            <template #default>
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.commonSensitivity.value"
                                                    :min="formData.lineInfo[pageData.surfaceIndex].objectFilter.commonSensitivity.min"
                                                    :max="formData.lineInfo[pageData.surfaceIndex].objectFilter.commonSensitivity.max"
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
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.person.sensitivity.enable"
                                                    :label="Translate('IDCS_DETECTION_PERSON')"
                                                />
                                            </template>
                                            <template
                                                v-if="showPersonSentity"
                                                #default
                                            >
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.person.sensitivity.value"
                                                    :min="formData.lineInfo[pageData.surfaceIndex].objectFilter.person.sensitivity.min"
                                                    :max="formData.lineInfo[pageData.surfaceIndex].objectFilter.person.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                        <!-- 汽车灵敏度 -->
                                        <el-form-item v-if="showAllCarTarget">
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.car.sensitivity.enable"
                                                    :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                />
                                            </template>
                                            <template
                                                v-if="showCarSentity"
                                                #default
                                            >
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.car.sensitivity.value"
                                                    :min="formData.lineInfo[pageData.surfaceIndex].objectFilter.car.sensitivity.min"
                                                    :max="formData.lineInfo[pageData.surfaceIndex].objectFilter.car.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                        <!-- 摩托车灵敏度 -->
                                        <el-form-item v-if="showAllMotorTarget">
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.motor.sensitivity.enable"
                                                    :label="Translate('IDCS_NON_VEHICLE')"
                                                />
                                            </template>
                                            <template
                                                v-if="showMotorSentity"
                                                #default
                                            >
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.lineInfo.length"
                                                    v-model="formData.lineInfo[pageData.surfaceIndex].objectFilter.motor.sensitivity.value"
                                                    :min="formData.lineInfo[pageData.surfaceIndex].objectFilter.motor.sensitivity.min"
                                                    :max="formData.lineInfo[pageData.surfaceIndex].objectFilter.motor.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                    </div>
                                </div>
                                <!-- 只支持人的灵敏度 -->
                                <el-form-item
                                    v-if="formData.onlyPreson"
                                    :label="Translate('IDCS_SENSITIVITY')"
                                >
                                    <BaseSliderInput
                                        v-model="formData.sensitivity"
                                        :min="1"
                                    />
                                </el-form-item>
                                <el-form-item
                                    v-if="formData.onlyPreson"
                                    :label="Translate('IDCS_DETECTION_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_BEYOND_DETECTION'), Translate('IDCS_DETECTION_PERSON'))"
                                />
                                <!-- 云台 -->
                                <template v-if="chlData.supportAutoTrack">
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_PTZ') }}
                                    </div>
                                    <el-form-item>
                                        <el-button @click="editLockStatus">
                                            {{ pageData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                        </el-button>
                                        <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="formData.autoTrack"
                                            :label="Translate('IDCS_TRIGGER_TRACK')"
                                        />
                                    </el-form-item>
                                </template>
                            </el-form>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane
                        :label="Translate('IDCS_LINKAGE_MODE')"
                        name="trigger"
                    >
                        <div>
                            <el-form v-if="pageData.supportAlarmAudioConfig">
                                <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                    <BaseSelect
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
                                <AlarmBaseRecordSelector v-model="formData.record" />
                                <!-- alarm -->
                                <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                                <!-- preset -->
                                <AlarmBasePresetSelector v-model="formData.preset" />
                                <!-- Ip Speaker -->
                                <AlarmBaseIPSpeakerSelector
                                    v-if="pageData.supportAlarmAudioConfig"
                                    v-model="formData.ipSpeaker"
                                    :chl-id="currChlId"
                                />
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
                    width="300"
                    popper-class="no-padding"
                    :popper-options="pageData.poppeOptions"
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

<script lang="ts" src="./TripwirePanel.v.ts"></script>

<style lang="scss" scoped></style>
