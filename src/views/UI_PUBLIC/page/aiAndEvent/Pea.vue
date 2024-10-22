<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:35:56
 * @Description:  区域入侵
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-22 11:04:29
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="peaData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        >
        </ScheduleManagPop>
        <!-- pearecord弹窗 -->
        <BaseTransferDialog
            v-model="peaData.areaCfgData[peaData.activity_type].recordIsShow"
            :header-title="peaData.areaCfgData[peaData.activity_type].recordHeaderTitle"
            :source-title="peaData.areaCfgData[peaData.activity_type].recordSourceTitle"
            :target-title="peaData.areaCfgData[peaData.activity_type].recordTargetTitle"
            :source-data="peaData.recordSource"
            :linked-list="peaData.areaCfgData[peaData.activity_type].recordList || []"
            :type="peaData.areaCfgData[peaData.activity_type].recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        ></BaseTransferDialog>
        <!-- peaalarmOut弹窗 -->
        <BaseTransferDialog
            v-model="peaData.areaCfgData[peaData.activity_type].alarmOutIsShow"
            :header-title="peaData.areaCfgData[peaData.activity_type].alarmOutHeaderTitle"
            :source-title="peaData.areaCfgData[peaData.activity_type].alarmOutSourceTitle"
            :target-title="peaData.areaCfgData[peaData.activity_type].alarmOutTargetTitle"
            :source-data="peaData.alarmOutSource"
            :linked-list="peaData.areaCfgData[peaData.activity_type].alarmOutList || []"
            :type="peaData.areaCfgData[peaData.activity_type].alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        ></BaseTransferDialog>
        <el-dialog
            v-model="peaData.aiResourcePopOpen"
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
            <el-row class="base-btn-box">
                <el-button @click="peaData.aiResourcePopOpen = false">
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </el-row>
        </el-dialog>
        <div
            v-if="peaData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="peaData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!peaData.notSupportTipShow && !peaData.requireDataFail">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div
                class="base-btn-box padding collapse"
                span="2"
            >
                <div>
                    <el-checkbox
                        v-model="peaData.areaCfgData[peaData.activity_type].detectionEnable"
                        @change="handleDectionChange"
                        >{{ peaData.detectionTypeText }}</el-checkbox
                    >
                </div>
                <div>
                    <span>{{ Translate('IDCS_USAGE_RATE') }}: {{ peaData.totalResourceOccupancy }}%</span>
                    <BaseImgSprite
                        file="detail"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="peaData.aiResourcePopOpen = true"
                    />
                </div>
            </div>
            <!-- 更多按钮 -->
            <el-popover
                v-model:visible="peaData.moreDropDown"
                width="300"
                trigger="click"
                popper-class="no-padding"
            >
                <template #reference>
                    <div
                        v-show="peaData.areaCfgData[peaData.activity_type].pictureAvailable"
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
                        v-model="peaData.areaCfgData[peaData.activity_type].saveTargetPicture"
                        @change="peaData.applyDisable = false"
                        >{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</el-checkbox
                    >
                    <el-checkbox
                        v-model="peaData.areaCfgData[peaData.activity_type].saveSourcePicture"
                        @change="peaData.applyDisable = false"
                        >{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</el-checkbox
                    >
                    <div class="base-btn-box">
                        <el-button
                            small
                            @click="peaData.moreDropDown = false"
                            >{{ Translate('IDCS_CLOSE') }}</el-button
                        >
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
                                @change="handlePeaShowAllAreaChange"
                                >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                            >
                        </div>

                        <div>
                            <el-button
                                size="small"
                                @click="peaClearCurrentAreaBtn"
                                >{{ Translate('IDCS_CLEAR') }}</el-button
                            >
                            <el-button
                                v-if="peaData.clearAllVisible"
                                size="small"
                                @click="clearAllPeaArea"
                                >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                            >
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ peaData.areaCfgData[peaData.activity_type].regulation ? Translate('IDCS_DRAW_RECT_TIP') : Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
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
                                label-position="left"
                                class="narrow"
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
                                        v-model="peaData.pea_schedule"
                                        value-key="value"
                                        :options="peaData.scheduleList"
                                        size="small"
                                        @change="peaData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in peaData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-button
                                        size="small"
                                        @click="peaData.scheduleManagePopOpen = true"
                                    >
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
                                        value-key="value"
                                        size="small"
                                        :options="peaData.areaActiveList"
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
                                        value-key="value"
                                        size="small"
                                        :options="peaData.directionList"
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
                                    <el-select
                                        v-model="peaData.areaCfgData[peaData.activity_type].holdTime"
                                        value-key="value"
                                        size="small"
                                        :options="peaData.areaCfgData[peaData.activity_type].holdTimeList"
                                        @change="peaData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in peaData.areaCfgData[peaData.activity_type].holdTimeList"
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
                                        size="small"
                                        @change="handleWarnAreaChange()"
                                    >
                                        <el-radio-button
                                            v-for="(_item, index) in peaData.areaCfgData[peaData.activity_type].boundaryInfo"
                                            :key="index"
                                            :value="index"
                                        >
                                            {{ index + 1 }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                                <!-- 只支持人的灵敏度 -->
                                <el-form-item
                                    v-if="peaData.areaCfgData[peaData.activity_type].pea_onlyPreson"
                                    :label="Translate('IDCS_SENSITIVITY')"
                                    :style="{
                                        '--form-input-width': '285px',
                                    }"
                                >
                                    <el-slider
                                        v-model="peaData.areaCfgData[peaData.activity_type].onlyPersonSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="peaData.applyDisable = false"
                                    />
                                </el-form-item>
                                <el-form-item v-if="peaData.areaCfgData[peaData.activity_type].pea_onlyPreson">
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
                                        <el-button
                                            size="small"
                                            @click="editLockStatus"
                                        >
                                            {{ peaData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                        </el-button>
                                        <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                    </div>
                                    <div
                                        class="base-btn-box padding collapse"
                                        span="start"
                                    >
                                        <el-checkbox
                                            v-model="peaData.areaCfgData[peaData.activity_type].autoTrack"
                                            @change="peaData.applyDisable = false"
                                            >{{ Translate('IDCS_TRIGGER_TRACK') }}
                                        </el-checkbox>
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
                    v-if="!peaData.areaCfgData[peaData.activity_type].pea_onlyPreson"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="pea_target"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="peaData"
                                label-width="auto"
                                label-position="left"
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
                                                v-model="peaData.areaCfgData[peaData.activity_type].person"
                                                @change="peaData.applyDisable = false"
                                                >{{ Translate('IDCS_DETECTION_PERSON') }}</el-checkbox
                                            >
                                        </el-row>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activity_type].personSensitivity"
                                            size="small"
                                            :show-input-controls="false"
                                            show-input
                                            @change="peaData.applyDisable = false"
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 汽车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="peaData.areaCfgData[peaData.activity_type].car"
                                                @change="peaData.applyDisable = false"
                                                >{{ Translate('IDCS_DETECTION_VEHICLE') }}</el-checkbox
                                            >
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activity_type].carSensitivity"
                                            size="small"
                                            :show-input-controls="false"
                                            show-input
                                            @change="peaData.applyDisable = false"
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 摩托车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="peaData.areaCfgData[peaData.activity_type].motorcycle"
                                                @change="peaData.applyDisable = false"
                                                >{{ Translate('IDCS_NON_VEHICLE') }}</el-checkbox
                                            >
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="peaData.areaCfgData[peaData.activity_type].motorSensitivity"
                                            size="small"
                                            :show-input-controls="false"
                                            show-input
                                            @change="peaData.applyDisable = false"
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
                    <el-form
                        v-if="peaData.supportAlarmAudioConfig"
                        label-position="left"
                        class="narrow"
                    >
                        <el-form-item :label="Translate('IDCS_VOICE_PROMPT')">
                            <el-select
                                v-model="peaData.areaCfgData[peaData.activity_type].sysAudio"
                                value-key="value"
                                size="small"
                                :options="peaData.voiceList"
                                class="audio_select"
                                @change="peaData.applyDisable = false"
                            >
                                <el-option
                                    v-for="item in peaData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="base-ai-linkage-content">
                        <!-- 常规联动 -->
                        <div class="base-ai-linkage-box">
                            <el-checkbox
                                v-model="peaData.areaCfgData[peaData.activity_type].triggerSwitch"
                                class="base-ai-linkage-title base-ai-linkage-title-checkbox"
                                @change="handlePeaTriggerSwitch"
                                >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                            >
                            <el-table
                                height="367px"
                                :data="peaData.areaCfgData[peaData.activity_type].peaTriggerData"
                                :show-header="false"
                                :header-cell-style="{ 'text-align': 'left' }"
                            >
                                <el-table-column>
                                    <template #default="scope">
                                        <el-checkbox
                                            v-model="scope.row.value"
                                            class="table_item"
                                            @change="handlePeaTrigger(scope.row)"
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
                                    @click="peaData.areaCfgData[peaData.activity_type].recordIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </div>
                            <el-table
                                :show-header="false"
                                height="367px"
                                :data="peaData.areaCfgData[peaData.activity_type].recordChls"
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
                                    @click="peaData.areaCfgData[peaData.activity_type].alarmOutIsShow = true"
                                    >{{ Translate('IDCS_CONFIG') }}
                                </el-button>
                            </div>
                            <el-table
                                :show-header="false"
                                height="367px"
                                :data="peaData.areaCfgData[peaData.activity_type].alarmOutChls"
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
                                :data="peaData.areaCfgData[peaData.activity_type].presetSource"
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
                                            :options="scope.row.presetList"
                                            @visible-change="getPresetById(scope.row)"
                                            @change="peaData.applyDisable = false"
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
                            :disabled="peaData.applyDisable"
                            @click="handlePeaApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
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

.table_item {
    display: flex;
    justify-content: flex-start;
}
</style>
