<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:35:56
 * @Description: 区域入侵
-->
<template>
    <div>
        <div
            v-if="pageData.reqFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="pageData.tab">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div class="base-btn-box space-between padding collapse">
                <el-checkbox
                    v-model="formData[pageData.activityType].detectionEnable"
                    :label="pageData.detectionTypeText"
                />
                <AlarmBaseResourceData
                    :event="areaType"
                    :chl-id="currChlId"
                    :enable="formData[pageData.activityType].detectionEnable && !chlData.supportTripwire"
                    @error="formData[pageData.activityType].detectionEnable = false"
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
                    <div class="base-ai-tip">{{ formData[pageData.activityType].regulation ? Translate('IDCS_DRAW_RECT_TIP') : Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
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
                                <el-form
                                    :style="{
                                        '--form-input-width': '215px',
                                    }"
                                >
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_SCHEDULE') }}
                                    </div>
                                    <!-- 排程 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <el-select-v2
                                            v-model="pageData.schedule"
                                            :options="pageData.scheduleList"
                                            @change="watchEdit.disabled.value = false"
                                        />
                                        <el-button @click="pageData.isSchedulePop = true">
                                            {{ Translate('IDCS_MANAGE') }}
                                        </el-button>
                                    </el-form-item>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCD_RULE') }}
                                    </div>
                                    <!-- 区域活动 -->
                                    <el-form-item :label="Translate('IDCS_AREA_ACTIVE')">
                                        <el-select-v2
                                            v-model="pageData.areaActive"
                                            :disabled="pageData.areaActiveDisable"
                                            :options="pageData.areaActiveList"
                                            @change="changeAreaActive"
                                        />
                                    </el-form-item>
                                    <!-- 方向 -->
                                    <el-form-item :label="Translate('IDCS_DIRECTION')">
                                        <el-select-v2
                                            v-model="pageData.direction"
                                            :disabled="pageData.directionDisable"
                                            :options="pageData.directionList"
                                            @change="changeDirection"
                                        />
                                    </el-form-item>
                                    <!-- 持续时间 -->
                                    <el-form-item :label="Translate('IDCS_DURATION')">
                                        <el-select-v2
                                            v-model="formData[pageData.activityType].holdTime"
                                            :options="formData[pageData.activityType].holdTimeList"
                                        />
                                    </el-form-item>
                                    <!-- 警戒区域 -->
                                    <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                        <el-radio-group
                                            v-model="pageData.warnAreaIndex"
                                            class="small-btn"
                                            @change="changeWarnArea()"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData[pageData.activityType].boundaryInfo"
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
                                        v-if="formData[pageData.activityType].pea_onlyPreson"
                                        :label="Translate('IDCS_SENSITIVITY')"
                                        :style="{
                                            '--form-input-width': '285px',
                                        }"
                                    >
                                        <el-slider
                                            v-model="formData[pageData.activityType].onlyPersonSensitivity"
                                            show-input
                                        />
                                    </el-form-item>
                                    <el-form-item v-if="formData[pageData.activityType].pea_onlyPreson">
                                        {{ Translate('IDCS_DETECTION_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_BEYOND_DETECTION'), Translate('IDCS_DETECTION_PERSON')) }}
                                    </el-form-item>
                                    <!-- 云台 -->
                                    <template v-if="chlData.supportAutoTrack">
                                        <div class="base-ai-subheading">
                                            {{ Translate('IDCS_PTZ') }}
                                        </div>
                                        <ChannelPtzCtrlPanel
                                            :chl-id="currChlId || ''"
                                            @speed="setSpeed"
                                        />
                                        <el-form-item>
                                            <el-button @click="editLockStatus">
                                                {{ pageData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                            </el-button>
                                            <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-checkbox
                                                v-model="formData[pageData.activityType].autoTrack"
                                                :label="Translate('IDCS_TRIGGER_TRACK')"
                                            />
                                        </el-form-item>
                                    </template>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- 检测目标 -->
                    <el-tab-pane
                        v-if="!formData[pageData.activityType].pea_onlyPreson"
                        :label="Translate('IDCS_DETECTION_TARGET')"
                        name="target"
                    >
                        <div class="base-ai-param-box">
                            <div class="base-ai-param-box-left"></div>
                            <div class="base-ai-param-box-right">
                                <el-form
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
                                            <el-checkbox
                                                v-model="formData[pageData.activityType].person"
                                                :label="Translate('IDCS_DETECTION_PERSON')"
                                            />
                                        </template>
                                        <template #default>
                                            <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                            <el-slider
                                                v-model="formData[pageData.activityType].personSensitivity"
                                                show-input
                                            />
                                        </template>
                                    </el-form-item>
                                    <!-- 汽车灵敏度 -->
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData[pageData.activityType].car"
                                                :label="Translate('IDCS_DETECTION_VEHICLE')"
                                            />
                                        </template>
                                        <template #default>
                                            <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                            <el-slider
                                                v-model="formData[pageData.activityType].carSensitivity"
                                                show-input
                                            />
                                        </template>
                                    </el-form-item>
                                    <!-- 摩托车灵敏度 -->
                                    <el-form-item>
                                        <template #label>
                                            <el-checkbox
                                                v-model="formData[pageData.activityType].motorcycle"
                                                :label="Translate('IDCS_NON_VEHICLE')"
                                            />
                                        </template>
                                        <template #default>
                                            <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                            <el-slider
                                                v-model="formData[pageData.activityType].motorSensitivity"
                                                show-input
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
                                    v-model="formData[pageData.activityType].sysAudio"
                                    :options="voiceList"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <AlarmBaseTriggerSelector
                                v-model="formData[pageData.activityType].trigger"
                                :include="formData[pageData.activityType].triggerList"
                            />
                            <!-- record -->
                            <AlarmBaseRecordSelector v-model="formData[pageData.activityType].recordChls" />
                            <!-- alarm -->
                            <AlarmBaseAlarmOutSelector v-model="formData[pageData.activityType].alarmOutChls" />
                            <!-- preset -->
                            <AlarmBasePresetSelector v-model="formData[pageData.activityType].presets" />
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
                    width="300"
                    popper-class="no-padding keep-ocx"
                >
                    <template #reference>
                        <div
                            v-show="formData[pageData.activityType].pictureAvailable"
                            class="base-ai-advance-btn"
                        >
                            <span>{{ Translate('IDCS_ADVANCED') }}</span>
                            <BaseImgSprite
                                file="arrow"
                                :index="0"
                                :chunk="4"
                            />
                        </div>
                    </template>
                    <div class="base-ai-advance-box">
                        <div class="base-ai-subheading">
                            {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                        </div>
                        <el-checkbox
                            v-model="formData[pageData.activityType].saveTargetPicture"
                            :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                        />
                        <el-checkbox
                            v-model="formData[pageData.activityType].saveSourcePicture"
                            :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                        />
                        <div class="base-btn-box">
                            <el-button @click="pageData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                        </div>
                    </div>
                </el-popover>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./PeaPanel.v.ts"></script>
