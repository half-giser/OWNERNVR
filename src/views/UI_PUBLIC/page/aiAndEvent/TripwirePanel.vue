<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:11:35
 * @Description: 越界
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
                <div v-if="pageData.tab === 'param'">
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
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select-v2
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                    />
                                    <el-button @click="pageData.isSchedulePop = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select-v2
                                        v-model="formData.holdTime"
                                        :options="formData.holdTimeList"
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
                                <!-- 方向 -->
                                <el-form-item :label="Translate('IDCS_DIRECTION')">
                                    <el-select-v2
                                        v-model="formData.direction"
                                        :options="formData.directionList"
                                        @change="changeDirection"
                                    />
                                </el-form-item>
                                <!-- 只支持人的灵敏度 -->
                                <el-form-item
                                    v-if="formData.onlyPreson"
                                    :label="Translate('IDCS_SENSITIVITY')"
                                >
                                    <el-slider
                                        v-model="formData.onlyPersonSensitivity"
                                        show-input
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
                                            v-model="formData.autoTrack"
                                            :label="Translate('IDCS_TRIGGER_TRACK')"
                                        />
                                    </el-form-item>
                                </template>
                            </el-form>
                        </div>
                    </el-tab-pane>
                    <!-- 检测目标 -->
                    <el-tab-pane
                        v-if="!formData.onlyPreson"
                        :label="Translate('IDCS_DETECTION_TARGET')"
                        name="target"
                        class="base-ai-param-box"
                    >
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
                                            v-model="formData.objectFilter.person"
                                            :label="Translate('IDCS_DETECTION_PERSON')"
                                        />
                                    </template>
                                    <template #default>
                                        <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.personSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 汽车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <el-checkbox
                                            v-model="formData.objectFilter.car"
                                            :label="Translate('IDCS_DETECTION_VEHICLE')"
                                        />
                                    </template>
                                    <template #default>
                                        <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.carSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 摩托车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <el-checkbox
                                            v-model="formData.objectFilter.motorcycle"
                                            :label="Translate('IDCS_NON_VEHICLE')"
                                        />
                                    </template>
                                    <template #default>
                                        <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.motorSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-tab-pane>
                    <!-- 联动方式 -->
                    <el-tab-pane
                        :label="Translate('IDCS_LINKAGE_MODE')"
                        name="trigger"
                    >
                        <div>
                            <el-form
                                v-if="pageData.supportAlarmAudioConfig"
                                :style="{
                                    '--form-label-width': 'auto',
                                }"
                            >
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
                                <AlarmBaseRecordSelector v-model="formData.record" />
                                <!-- alarm -->
                                <AlarmBaseAlarmOutSelector v-model="formData.alarmOut" />
                                <!-- preset -->
                                <AlarmBasePresetSelector v-model="formData.preset" />
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
                <el-popover
                    v-model:visible="pageData.moreDropDown"
                    width="300"
                    popper-class="no-padding keep-ocx"
                >
                    <template #reference>
                        <div
                            v-show="formData.pictureAvailable"
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
                            v-model="formData.saveTargetPicture"
                            :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                        />
                        <el-checkbox
                            v-model="formData.saveSourcePicture"
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

<script lang="ts" src="./TripwirePanel.v.ts"></script>
