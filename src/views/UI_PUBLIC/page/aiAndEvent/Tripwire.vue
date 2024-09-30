<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:11:35
 * @Description:  越界
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-30 17:01:16
-->

<template>
    <div class="tripwire_setting_pane">
        <ScheduleManagPop
            v-model="tripwireData.scheduleManagePopOpen"
            @close="tripwireData.scheduleManagePopOpen = false"
        >
        </ScheduleManagPop>
        <!-- tripwirerecord弹窗 -->
        <BaseTransferDialog
            v-model="tripwireData.recordIsShow"
            :header-title="tripwireData.recordHeaderTitle"
            :source-title="tripwireData.recordSourceTitle"
            :target-title="tripwireData.recordTargetTitle"
            :source-data="tripwireData.recordSource"
            :linked-list="tripwireData.recordList || []"
            :type="tripwireData.recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        ></BaseTransferDialog>
        <!-- tripwirealarmOut弹窗 -->
        <BaseTransferDialog
            v-model="tripwireData.alarmOutIsShow"
            :header-title="tripwireData.alarmOutHeaderTitle"
            :source-title="tripwireData.alarmOutSourceTitle"
            :target-title="tripwireData.alarmOutTargetTitle"
            :source-data="tripwireData.alarmOutSource"
            :linked-list="tripwireData.alarmOutList || []"
            :type="tripwireData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        ></BaseTransferDialog>
        <!-- ai -->
        <el-dialog
            v-model="tripwireData.aiResourcePopOpen"
            :title="Translate('IDCS_DETAIL')"
            width="600px"
            center
            draggable
        >
            <el-table
                :data="aiResourceTableData"
                stripe
                border
                show-overflow-tooltip
                height="290px"
            >
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL')"
                    width="138px"
                ></el-table-column>
                <el-table-column
                    prop="eventTypeText"
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="150px"
                ></el-table-column>
                <el-table-column
                    prop="percent"
                    :label="Translate('IDCS_USAGE_RATE')"
                    width="100px"
                ></el-table-column>
                <el-table-column
                    prop="decodeResource"
                    :label="Translate('IDCS_DECODE_RESOURCE')"
                    width="100px"
                ></el-table-column>
                <el-table-column
                    :label="Translate('IDCS_FREE_AI_RESOURCE')"
                    width="70px"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="handleAIResourceDel(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <el-row class="base-btn-box collapse">
                    <el-button @click="tripwireData.aiResourcePopOpen = false">
                        {{ Translate('IDCS_CLOSE') }}
                    </el-button>
                </el-row>
            </template>
        </el-dialog>
        <div
            v-if="tripwireData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="tripwireData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!tripwireData.notSupportTipShow && !tripwireData.requireDataFail">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div
                class="base-btn-box padding collapse"
                :span="2"
            >
                <div>
                    <el-checkbox
                        v-model="tripwireData.detectionEnable"
                        @change="handleDectionChange"
                        >{{ tripwireData.detectionTypeText }}</el-checkbox
                    >
                </div>
                <div class="aiResource">
                    <span>{{ Translate('IDCS_USAGE_RATE') }} :</span>
                    <span>{{ tripwireData.totalResourceOccupancy }}%</span>
                    <BaseImgSprite
                        file="detail"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="tripwireData.aiResourcePopOpen = true"
                    />
                </div>
            </div>
            <!-- 更多按钮 -->
            <el-popover
                v-model:visible="tripwireData.moreDropDown"
                width="300"
                popper-class="no-padding"
                trigger="click"
            >
                <template #reference>
                    <div
                        v-show="tripwireData.pictureAvailable"
                        class="more_wrap"
                    >
                        <span>{{ Translate('IDCS_ADVANCED') }}</span>
                        <BaseImgSprite
                            class="moreBtn"
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
                        v-model="tripwireData.saveTargetPicture"
                        @change="tripwireData.applyDisable = false"
                        >{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</el-checkbox
                    >
                    <el-checkbox
                        v-model="tripwireData.saveSourcePicture"
                        @change="tripwireData.applyDisable = false"
                        >{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</el-checkbox
                    >
                    <div class="base-btn-box">
                        <el-button
                            small
                            @click="tripwireData.moreDropDown = false"
                            >{{ Translate('IDCS_CLOSE') }}</el-button
                        >
                    </div>
                </div>
            </el-popover>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="tripwireData.tripwireFunction !== 'tripwire_trigger'"
                class="base-ai-param-box-left fixed"
            >
                <div class="player">
                    <BaseVideoPlayer
                        id="tripwireplayer"
                        ref="tripwireplayerRef"
                        type="live"
                        @onready="tripWirehandlePlayerReady"
                    />
                </div>
                <div v-if="tripwireData.tripwireFunction === 'tripwire_param'">
                    <div
                        class="base-btn-box"
                        :span="2"
                    >
                        <div>
                            <el-checkbox
                                v-if="tripwireData.showAllAreaVisible"
                                v-model="tripwireData.isShowAllArea"
                                @change="handleTripwireShowAllAreaChange"
                                >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                            >
                        </div>
                        <div>
                            <el-button
                                size="small"
                                @click="clearTripwireArea"
                                >{{ Translate('IDCS_CLEAR') }}</el-button
                            >
                            <el-button
                                v-if="tripwireData.clearAllVisible"
                                size="small"
                                @click="clearAllTripwireArea"
                                >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                            >
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</div>
                </div>
            </div>
            <!-- 三种功能 -->
            <el-tabs
                v-model="tripwireData.tripwireFunction"
                class="base-ai-tabs"
                @tab-click="handleTripwireFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="tripwire_param"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left"></div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :model="tripwireData"
                            label-position="left"
                            :style="{
                                '--form-label-width': '200px',
                                '--form-input-width': '215px',
                            }"
                        >
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select
                                    v-model="tripwireData.tripwire_schedule"
                                    value-key="value"
                                    size="small"
                                    @change="tripwireData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in tripwireData.scheduleList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                                <el-button
                                    size="small"
                                    @click="tripwireData.scheduleManagePopOpen = true"
                                >
                                    {{ Translate('IDCS_MANAGE') }}
                                </el-button>
                            </el-form-item>
                            <div class="base-ai-subheading">
                                {{ Translate('IDCD_RULE') }}
                            </div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select
                                    v-model="tripwireData.holdTime"
                                    value-key="value"
                                    size="small"
                                    @change="tripwireData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in tripwireData.holdTimeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 警戒面 -->
                            <el-form-item :label="Translate('IDCS_ALERT_SURFACE')">
                                <el-radio-group
                                    v-model="tripwireData.chosenSurfaceIndex"
                                    class="small-btn"
                                    size="small"
                                    @change="handleSurfaceChange()"
                                >
                                    <el-radio-button
                                        v-for="(item, index) in tripwireData.lineInfo"
                                        :key="index"
                                        :value="index"
                                    >
                                        {{ index + 1 }}
                                    </el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                            <!-- 方向 -->
                            <el-form-item :label="Translate('IDCS_DIRECTION')">
                                <el-select
                                    v-model="tripwireData.direction"
                                    value-key="value"
                                    size="small"
                                    :options="tripwireData.directionList"
                                    @change="handleTripwireDirectionChange"
                                >
                                    <el-option
                                        v-for="item in tripwireData.directionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 只支持人的灵敏度 -->
                            <el-form-item
                                v-if="tripwireData.tripwire_onlyPreson"
                                :label="Translate('IDCS_SENSITIVITY')"
                            >
                                <el-slider
                                    v-model="tripwireData.onlyPersonSensitivity"
                                    size="small"
                                    :show-input-controls="false"
                                    show-input
                                    @change="tripwireData.applyDisable = false"
                                />
                            </el-form-item>
                            <el-form-item
                                v-if="tripwireData.tripwire_onlyPreson"
                                :label="Translate('IDCS_DETECTION_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_BEYOND_DETECTION'), Translate('IDCS_DETECTION_PERSON'))"
                            >
                            </el-form-item>
                            <!-- 云台 -->
                            <div v-if="tripwireData.chlData.supportAutoTrack">
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_PTZ') }}
                                </div>
                                <ChannelPtzCtrlPanel
                                    :chl-id="tripwireData.currChlId || ''"
                                    @speed="setTripWireSpeed"
                                />
                                <div
                                    class="base-btn-box padding"
                                    span="start"
                                >
                                    <el-button
                                        size="small"
                                        @click="editLockStatus"
                                    >
                                        {{ tripwireData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                    </el-button>
                                    <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                </div>
                                <div
                                    class="base-btn-box padding collapse"
                                    span="start"
                                >
                                    <el-checkbox
                                        v-model="tripwireData.autoTrack"
                                        @change="tripwireData.applyDisable = false"
                                        >{{ Translate('IDCS_TRIGGER_TRACK') }}
                                    </el-checkbox>
                                </div>
                            </div>
                        </el-form>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="tripwireData.applyDisable"
                            @click="handleTripwireApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 检测目标 -->
                <el-tab-pane
                    v-if="!tripwireData.tripwire_onlyPreson"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="tripwire_target"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left"></div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :model="tripwireData"
                            label-position="left"
                            label-width="auto"
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
                                        v-model="tripwireData.objectFilter.person"
                                        @change="tripwireData.applyDisable = false"
                                        >{{ Translate('IDCS_DETECTION_PERSON') }}</el-checkbox
                                    >
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="tripwireData.objectFilter.personSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="tripwireData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                            <!-- 汽车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <div>
                                        <el-checkbox
                                            v-model="tripwireData.objectFilter.car"
                                            @change="tripwireData.applyDisable = false"
                                            >{{ Translate('IDCS_DETECTION_VEHICLE') }}</el-checkbox
                                        >
                                    </div>
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="tripwireData.objectFilter.carSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="tripwireData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                            <!-- 摩托车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <div>
                                        <el-checkbox
                                            v-model="tripwireData.objectFilter.motorcycle"
                                            @change="tripwireData.applyDisable = false"
                                            >{{ Translate('IDCS_NON_VEHICLE') }}</el-checkbox
                                        >
                                    </div>
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="tripwireData.objectFilter.motorSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="tripwireData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
                            :disabled="tripwireData.applyDisable"
                            @click="handleTripwireApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="tripwire_trigger"
                >
                    <div class="trigger_box">
                        <el-form
                            v-if="tripwireData.supportAlarmAudioConfig"
                            :style="{
                                '--form-label-width': 'auto',
                            }"
                        >
                            <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                                <el-select
                                    v-model="tripwireData.sysAudio"
                                    value-key="value"
                                    size="small"
                                    class="audio_select"
                                    @change="tripwireData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in tripwireData.voiceList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div class="base-ai-linkage-content">
                            <!-- 常规联动 -->
                            <div class="base-ai-linkage-box">
                                <el-checkbox
                                    v-model="tripwireData.triggerSwitch"
                                    class="base-ai-linkage-title"
                                    @change="handleTripwireTriggerSwitch"
                                    >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                                >
                                <el-table
                                    height="367px"
                                    :data="tripwireTriggerData"
                                    :show-header="false"
                                    :header-cell-style="{ 'text-align': 'left' }"
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <el-checkbox
                                                v-model="scope.row.value"
                                                class="table_item"
                                                @change="handleTripwireTrigger(scope.row)"
                                                >{{ Translate(scope.row.label) }}</el-checkbox
                                            >
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- record -->
                            <div class="base-ai-linkage-box">
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_RECORD') }}</span>
                                    <el-button
                                        size="small"
                                        @click="tripwireData.recordIsShow = true"
                                        >{{ Translate('IDCS_CONFIG') }}
                                    </el-button>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367px"
                                    :data="tripwireData.record.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- alarm -->
                            <div class="base-ai-linkage-box">
                                <div class="base-ai-linkage-title">
                                    <span>{{ Translate('IDCS_ALARM_OUT') }}</span>
                                    <el-button
                                        size="small"
                                        @click="tripwireData.alarmOutIsShow = true"
                                        >{{ Translate('IDCS_CONFIG') }}
                                    </el-button>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367px"
                                    :data="tripwireData.alarmOut.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- preset -->
                            <div
                                class="base-ai-linkage-box"
                                :style="{
                                    width: '350px',
                                }"
                            >
                                <div class="base-ai-linkage-title">
                                    {{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}
                                </div>
                                <el-table
                                    border
                                    stripe
                                    height="367px"
                                    :data="tripwireData.presetSource"
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_CHANNEL_NAME')"
                                    ></el-table-column>
                                    <el-table-column :label="Translate('IDCS_PRESET_NAME')">
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.preset.value"
                                                size="small"
                                                :empty-values="[undefined, null]"
                                                @change="tripwireData.applyDisable = false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.presetList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                        <div class="base-btn-box fixed">
                            <el-button
                                :disabled="tripwireData.applyDisable"
                                @click="handleTripwireApply"
                            >
                                {{ Translate('IDCS_APPLY') }}
                            </el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./Tripwire.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
// 高级设置
.more_wrap {
    position: absolute;
    right: 13px;
    top: 42px;
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

.table_item {
    display: flex;
    justify-content: flex-start;
}
.base-ai-linkage-title > .el-checkbox {
    margin-right: 10px;
}
</style>
