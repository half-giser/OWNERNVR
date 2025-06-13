<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-09 14:12:30
 * @Description: 违停检测
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
                <div v-show="pageData.tab === 'param'">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-show="pageData.showAllAreaVisible"
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
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(maxCount) }}</div>
                </div>
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
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form v-title>
                                    <!-- 排程 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="pageData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                            @change="watchEdit.disabled.value = false"
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
                                    <!-- 时间阈值 -->
                                    <el-form-item
                                        v-if="formData.supportDuration"
                                        :label="Translate('IDCS_DURATION_THRESHOLD')"
                                    >
                                        <BaseNumberInput
                                            v-model="formData.duration.value"
                                            :min="formData.duration.min"
                                            :max="formData.duration.max"
                                            mode="blur"
                                            @out-of-range="blurDuration(formData.duration.min, formData.duration.max)"
                                        />
                                    </el-form-item>
                                    <!-- 警戒区域 -->
                                    <el-form-item :label="Translate('IDCS_WARN_AREA')">
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
                                                <BaseSelect
                                                    v-model="formData.detectTarget"
                                                    :options="formData.detectTargetList"
                                                    empty-text=""
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
                                        <!-- 汽车灵敏度 -->
                                        <el-form-item>
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
                                            </template>
                                        </el-form-item>
                                        <!-- 摩托车灵敏度 -->
                                        <el-form-item>
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
                                            </template>
                                        </el-form-item>
                                    </div>
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

<script lang="ts" src="./PvdPanel.v.ts"></script>

<style lang="scss" scoped></style>
