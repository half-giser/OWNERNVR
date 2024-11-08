<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:35:56
 * @Description: 区域入侵
-->
<template>
    <div>
        <!-- <div
            v-if="peaData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div> -->
        <div
            v-if="peaData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!peaData.requireDataFail">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div
                class="base-btn-box padding collapse"
                span="2"
            >
                <div>
                    <el-checkbox
                        v-model="peaData.areaCfgData[peaData.activityType].detectionEnable"
                        :label="peaData.detectionTypeText"
                    />
                </div>
                <AlarmBaseResourceData
                    :event="areaType"
                    :chl-id="currChlId"
                    :enable="peaData.areaCfgData[peaData.activityType].detectionEnable && !peaData.chlData.supportTripwire"
                    @error="peaData.areaCfgData[peaData.activityType].detectionEnable = false"
                />
            </div>
            <!-- 更多按钮 -->
            <el-popover
                v-model:visible="peaData.moreDropDown"
                width="300"
                popper-class="no-padding popper"
            >
                <template #reference>
                    <div
                        v-show="peaData.areaCfgData[peaData.activityType].pictureAvailable"
                        class="more_wrap"
                    >
                        <span>{{ Translate('IDCS_ADVANCED') }}</span>
                        <BaseImgSprite
                            file="arrow"
                            :index="0"
                            :chunk="4"
                        />
                    </div>
                </template>
                <div class="advanced_box">
                    <div class="base-ai-subheading">
                        {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                    </div>
                    <el-checkbox
                        v-model="peaData.areaCfgData[peaData.activityType].saveTargetPicture"
                        :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                    />
                    <el-checkbox
                        v-model="peaData.areaCfgData[peaData.activityType].saveSourcePicture"
                        :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                    />
                    <div class="base-btn-box">
                        <el-button @click="peaData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                    </div>
                </div>
            </el-popover>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="peaData.peaFunction !== 'pea_trigger'"
                class="base-ai-param-box-left fixed"
            >
                <div class="player">
                    <BaseVideoPlayer
                        id="peaplayer"
                        ref="peaplayerRef"
                        type="live"
                        @onready="peahandlePlayerReady"
                    />
                </div>
                <div v-show="peaData.peaFunction === 'pea_param'">
                    <div
                        class="base-btn-box"
                        :span="2"
                    >
                        <div>
                            <el-checkbox
                                v-show="peaData.showAllAreaVisible"
                                v-model="peaData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="handlePeaShowAllAreaChange"
                            />
                        </div>

                        <div>
                            <el-button @click="peaClearCurrentAreaBtn">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-if="peaData.clearAllVisible"
                                @click="clearAllPeaArea"
                                >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                            >
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ peaData.areaCfgData[peaData.activityType].regulation ? Translate('IDCS_DRAW_RECT_TIP') : Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
                </div>
            </div>
            <!-- 三种功能 -->
            <el-tabs
                v-model="peaData.peaFunction"
                class="base-ai-tabs"
                @tab-click="handlePeaFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="pea_param"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="peaData"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_SCHEDULE') }}
                                </div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select
                                        v-model="peaData.schedule"
                                        @change="peaData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in peaData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-button @click="peaData.scheduleManagePopOpen = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 区域活动 -->
                                <el-form-item :label="Translate('IDCS_AREA_ACTIVE')">
                                    <el-select
                                        v-model="peaData.areaActive"
                                        :disabled="peaData.areaActiveDisable"
                                        @change="handleAreaActiveChange"
                                    >
                                        <el-option
                                            v-for="item in peaData.areaActiveList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 方向 -->
                                <el-form-item :label="Translate('IDCS_DIRECTION')">
                                    <el-select
                                        v-model="peaData.direction"
                                        :disabled="peaData.directionDisable"
                                        @change="handlePeaDirectionChange"
                                    >
                                        <el-option
                                            v-for="item in peaData.directionList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select v-model="peaData.areaCfgData[peaData.activityType].holdTime">
                                        <el-option
                                            v-for="item in peaData.areaCfgData[peaData.activityType].holdTimeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 警戒区域 -->
                                <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                    <el-radio-group
                                        v-model="peaData.chosenWarnAreaIndex"
                                        class="small-btn"
                                        @change="handleWarnAreaChange()"
                                    >
                                        <el-radio-button
                                            v-for="(_item, index) in peaData.areaCfgData[peaData.activityType].boundaryInfo"
                                            :key="index"
                                            :value="index"
                                            :label="index + 1"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <!-- 只支持人的灵敏度 -->
                                <el-form-item
                                    v-if="peaData.areaCfgData[peaData.activityType].pea_onlyPreson"
                                    :label="Translate('IDCS_SENSITIVITY')"
                                    :style="{
                                        '--form-input-width': '285px',
                                    }"
                                >
                                    <el-slider
                                        v-model="peaData.areaCfgData[peaData.activityType].onlyPersonSensitivity"
                                        show-input
                                    />
                                </el-form-item>
                                <el-form-item v-if="peaData.areaCfgData[peaData.activityType].pea_onlyPreson">
                                    {{ Translate('IDCS_DETECTION_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_BEYOND_DETECTION'), Translate('IDCS_DETECTION_PERSON')) }}
                                </el-form-item>
                                <!-- 云台 -->
                                <div v-if="peaData.chlData.supportAutoTrack">
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_PTZ') }}
                                    </div>
                                    <ChannelPtzCtrlPanel
                                        :chl-id="peaData.currChlId || ''"
                                        @speed="setPeaSpeed"
                                    />
                                    <div
                                        class="base-btn-box padding"
                                        span="start"
                                    >
                                        <el-button @click="editLockStatus">
                                            {{ peaData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                        </el-button>
                                        <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                    </div>
                                    <div
                                        class="base-btn-box padding collapse"
                                        span="start"
                                    >
                                        <el-checkbox
                                            v-model="peaData.areaCfgData[peaData.activityType].autoTrack"
                                            :label="Translate('IDCS_TRIGGER_TRACK')"
                                        />
                                    </div>
                                </div>
                            </el-form>
                        </div>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="peaData.applyDisable"
                            @click="handlePeaApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 检测目标 -->
                <el-tab-pane
                    v-if="!peaData.areaCfgData[peaData.activityType].pea_onlyPreson"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="pea_target"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="peaData"
                                class="form"
                                :style="{
                                    '--form-input-width': '300px',
                                }"
                            >
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_DETECTION_TARGET') }}
                                </div>
                                <!-- 人灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <el-row>
                                            <el-checkbox
                                                v-model="peaData.areaCfgData[peaData.activityType].person"
                                                :label="Translate('IDCS_DETECTION_PERSON')"
                                            />
                                        </el-row>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activityType].personSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 汽车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="peaData.areaCfgData[peaData.activityType].car"
                                                :label="Translate('IDCS_DETECTION_VEHICLE')"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activityType].carSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 摩托车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="peaData.areaCfgData[peaData.activityType].motorcycle"
                                                :label="Translate('IDCS_NON_VEHICLE')"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activityType].motorSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>

                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="peaData.applyDisable"
                            @click="handlePeaApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="pea_trigger"
                >
                    <el-form v-if="peaData.supportAlarmAudioConfig">
                        <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                            <el-select
                                v-model="peaData.areaCfgData[peaData.activityType].sysAudio"
                                class="audio_select"
                            >
                                <el-option
                                    v-for="item in peaData.voiceList"
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
                            v-model="peaData.areaCfgData[peaData.activityType].trigger"
                            :include="peaData.areaCfgData[peaData.activityType].triggerList"
                        />
                        <!-- record -->
                        <AlarmBaseRecordSelector v-model="peaData.areaCfgData[peaData.activityType].recordChls" />
                        <!-- alarm -->
                        <AlarmBaseAlarmOutSelector v-model="peaData.areaCfgData[peaData.activityType].alarmOutChls" />
                        <!-- preset -->
                        <AlarmBasePresetSelector v-model="peaData.areaCfgData[peaData.activityType].presets" />
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="peaData.applyDisable"
                            @click="handlePeaApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <ScheduleManagPop
            v-model="peaData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
    </div>
</template>

<script lang="ts" src="./Pea.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
// 高级设置
.more_wrap {
    position: absolute;
    right: 13px;
    top: 41px;
    cursor: pointer;
    z-index: 1;
}

.advanced_box {
    background-color: var(--ai-advance-bg);
    padding: 10px;

    .el-checkbox {
        display: block;
    }
}

.slider-text {
    margin-right: 15px;
}
</style>
