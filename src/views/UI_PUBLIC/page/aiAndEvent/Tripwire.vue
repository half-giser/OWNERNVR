<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:11:35
 * @Description:  越界
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-24 18:14:15
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
            class="aiResourcePop"
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
                <el-button @click="tripwireData.aiResourcePopOpen = false">
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </el-row>
        </el-dialog>
        <div
            v-if="tripwireData.notSupportTipShow"
            class="notSupportBox"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="tripwireData.requireDataFail"
            class="notSupportBox"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!tripwireData.notSupportTipShow && !tripwireData.requireDataFail">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <el-row class="row-padding">
                <el-checkbox
                    v-model="tripwireData.detectionEnable"
                    @change="handleDectionChange"
                ></el-checkbox>
                <span class="checkbox_text">{{ tripwireData.detectionTypeText }}</span>
                <div class="aiResource">
                    <span>{{ Translate('IDCS_USAGE_RATE') }}</span>
                    <span>{{ ` : ${tripwireData.totalResourceOccupancy}% ` }}</span>
                    <BaseImgSprite
                        file="detail"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="tripwireData.aiResourcePopOpen = true"
                    />
                </div>
            </el-row>
            <!-- 更多按钮 -->
            <el-dropdown
                v-if="tripwireData.pictureAvailable"
                ref="moreDropDownRef"
                height="180px"
                class="more"
                trigger="click"
                :hide-on-click="false"
                placement="bottom-end"
            >
                <span class="el-dropdown-link">
                    {{ Translate('IDCS_ADVANCED') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu
                        :style="{
                            '--el-dropdown-menuItem-hover-color': 'black',
                            '--el-dropdown-menuItem-hover-fill': '#e5e5e5',
                            '--el-text-color-regular': 'black',
                        }"
                    >
                        <el-dropdown-item>
                            <div class="moreDropDownBox">
                                <div class="dropDownHeader">
                                    <ElDivider direction="vertical"></ElDivider>
                                    <span>{{ Translate('IDCS_VIDEO_SAVE_PIC') }}</span>
                                </div>
                                <div class="checkboxes">
                                    <el-row>
                                        <el-checkbox
                                            v-model="tripwireData.saveTargetPicture"
                                            @change="tripwireData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</span>
                                    </el-row>
                                    <el-row>
                                        <el-checkbox
                                            v-model="tripwireData.saveSourcePicture"
                                            @change="tripwireData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</span>
                                    </el-row>
                                </div>
                                <el-row class="base-btn-box">
                                    <el-button
                                        class="dropdown_btn"
                                        @click="moreDropDownRef.handleClose()"
                                    >
                                        {{ Translate('IDCS_CLOSE') }}
                                    </el-button>
                                </el-row>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="tripwireData.tripwireFunction !== 'tripwire_trigger'"
                class="left"
            >
                <div class="player">
                    <BaseVideoPlayer
                        id="tripwireplayer"
                        ref="tripwireplayerRef"
                        type="live"
                        @onready="tripWirehandlePlayerReady"
                    />
                </div>
                <div
                    v-if="tripwireData.tripwireFunction === 'tripwire_param'"
                    class="player_config"
                >
                    <el-row
                        :style="{
                            marginTop: '10px',
                        }"
                    >
                        <el-col :span="16">
                            <div class="showAllArea">
                                <el-checkbox
                                    v-if="tripwireData.showAllAreaVisible"
                                    v-model="tripwireData.isShowAllArea"
                                    @change="handleTripwireShowAllAreaChange"
                                ></el-checkbox>
                                <span
                                    v-show="tripwireData.showAllAreaVisible"
                                    class="checkbox_text"
                                    >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</span
                                >
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="clear_btns">
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
                        </el-col>
                    </el-row>
                    <span id="draw_tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</span>
                </div>
            </div>
            <!-- 三种功能 -->
            <el-tabs
                v-model="tripwireData.tripwireFunction"
                class="function-tabs"
                @tab-click="handleTripwireFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="tripwire_param"
                    class="tripwire_param"
                >
                    <div class="right">
                        <el-form
                            :model="tripwireData"
                            label-width="200px"
                            label-position="left"
                            class="form"
                        >
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_SCHEDULE') }}</span>
                            </div>
                            <!-- 排程 -->
                            <el-form-item
                                :label="Translate('IDCS_SCHEDULE_CONFIG')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="tripwireData.tripwire_schedule"
                                    value-key="value"
                                    :options="tripwireData.scheduleList"
                                    size="small"
                                    @change="tripwireData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in tripwireData.scheduleList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                                <el-button
                                    class="form_btn"
                                    size="small"
                                    @click="tripwireData.scheduleManagePopOpen = true"
                                >
                                    {{ Translate('IDCS_MANAGE') }}
                                </el-button>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCD_RULE') }}</span>
                            </div>
                            <!-- 持续时间 -->
                            <el-form-item
                                :label="Translate('IDCS_DURATION')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="tripwireData.holdTime"
                                    value-key="value"
                                    size="small"
                                    :options="tripwireData.holdTimeList"
                                    @change="tripwireData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in tripwireData.holdTimeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 警戒面 -->
                            <el-form-item
                                :label="Translate('IDCS_ALERT_SURFACE')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-button
                                    v-for="(item, index) in tripwireData.lineInfo"
                                    :key="index"
                                    class="alert_surface_btn"
                                    :style="{
                                        backgroundColor: tripwireData.chosenSurfaceIndex === index ? '#00BBDB' : 'white',
                                        color: tripwireData.chosenSurfaceIndex === index ? 'white' : item.configured ? '#00BBDB' : 'black',
                                        borderColor: tripwireData.chosenSurfaceIndex === index || item.configured ? '#00BBDB' : '',
                                        borderRadius: 0,
                                    }"
                                    @click="handleSurfaceChange(index)"
                                >
                                    {{ index + 1 }}
                                </el-button>
                            </el-form-item>
                            <!-- 方向 -->
                            <el-form-item
                                :label="Translate('IDCS_DIRECTION')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
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
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 只支持人的灵敏度 -->
                            <el-form-item
                                v-if="tripwireData.tripwire_onlyPreson"
                                :label="Translate('IDCS_SENSITIVITY')"
                                :style="{
                                    '--form-input-width': '285px',
                                }"
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
                                <div class="form_span">
                                    <el-divider direction="vertical"></el-divider>
                                    <span>{{ Translate('IDCS_PTZ') }}</span>
                                </div>
                                <ChannelPtzCtrlPanel
                                    class="ChannelPtzCtrlPanel"
                                    :chl-id="tripwireData.currChlId || ''"
                                    @speed="setTripWireSpeed"
                                />
                                <el-row class="lock_row">
                                    <el-button
                                        class="lock_btn"
                                        @click="editLockStatus"
                                    >
                                        {{ tripwireData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                    </el-button>
                                    <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                </el-row>
                                <el-checkbox
                                    v-model="tripwireData.autoTrack"
                                    class="triggerTrack_checkBox"
                                    @change="tripwireData.applyDisable = false"
                                    >{{ Translate('IDCS_TRIGGER_TRACK') }}
                                </el-checkbox>
                            </div>
                        </el-form>
                    </div>
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
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
                    class="tripwire_target"
                >
                    <div class="right">
                        <el-form
                            :model="tripwireData"
                            label-width="100px"
                            label-position="left"
                            class="form"
                            :style="{
                                '--form-input-width': '300px',
                            }"
                        >
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_DETECTION_TARGET') }}</span>
                            </div>
                            <!-- 人灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <el-row>
                                        <el-checkbox
                                            v-model="tripwireData.objectFilter.person"
                                            @change="tripwireData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_PERSON') }}</span>
                                    </el-row>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                                    <div class="sensitivity_box">
                                        <el-checkbox
                                            v-model="tripwireData.objectFilter.car"
                                            @change="tripwireData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                                    <div class="sensitivity_box">
                                        <el-checkbox
                                            v-model="tripwireData.objectFilter.motorcycle"
                                            @change="tripwireData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_NON_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
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
                    class="tripwire_trigger"
                >
                    <div class="trigger_box">
                        <div
                            v-if="tripwireData.supportAlarmAudioConfig"
                            class="audio_row"
                        >
                            <span>{{ Translate('IDCS_VOICE_PROMPT') }}</span>
                            <el-select
                                v-model="tripwireData.sysAudio"
                                value-key="value"
                                size="small"
                                class="audio_select"
                                :options="tripwireData.voiceList"
                                @change="tripwireData.applyDisable = false"
                            >
                                <el-option
                                    v-for="item in tripwireData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </div>
                        <div class="trigger_content">
                            <!-- 常规联动 -->
                            <div class="trigger_normal">
                                <div class="title">
                                    <div class="checkbox">
                                        <el-checkbox
                                            v-model="tripwireData.triggerSwitch"
                                            class="table_title"
                                            @change="handleTripwireTriggerSwitch"
                                        ></el-checkbox>
                                        <span class="span_text">{{ Translate('IDCS_TRIGGER_NOMAL') }}</span>
                                    </div>
                                </div>
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
                            <div class="trigger_rec">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_RECORD') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="tripwireData.recordIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
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
                            <div class="trigger_alarm">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_ALARM_OUT') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="tripwireData.alarmOutIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
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
                            <div class="trigger_preset">
                                <div class="title">
                                    <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
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
                            <div class="apply_area">
                                <el-button
                                    class="apply_btn"
                                    :disabled="tripwireData.applyDisable"
                                    @click="handleTripwireApply"
                                >
                                    {{ Translate('IDCS_APPLY') }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./Tripwire.v.ts"></script>

<style lang="scss" scoped>
.el-divider--vertical {
    border-right-width: 3px;
    height: 30px;
    color: #999;
    width: 3px;
    margin: 0;
    border-left: 3px solid #999;
    padding-left: 5px;
}
#draw_tip {
    color: #8d8d8d;
    font-size: 12px;
}
.row-padding {
    padding-left: 20px;
}
.el-form {
    --el-form-label-font-size: 15px;
    .el-checkbox {
        color: black;
        --el-checkbox-font-size: 15px;
    }
}
.el-table {
    .el-checkbox {
        color: black;
        --el-checkbox-font-size: 15px;
    }
}
#n9web .el-form .el-form-item {
    padding: 1px 0px 2px 12px;
    margin-bottom: 0;
}
.form > .form_span:first-child {
    padding-bottom: 10px;
    font-size: 15px;
    display: flex;
    align-items: center;
}
.form > .form_span:not(:first-child) {
    padding: 10px 0;
    font-size: 15px;
    display: flex;
    align-items: center;
}
.el-form-item > .el-select {
    width: 300px;
}
.form_btn {
    width: 80px;
    height: 25px;
    font-size: 14px;
}
.alert_surface_btn {
    width: 50px;
    height: 22px;
    margin-right: 0 15px 0 0;
    padding: 0;
    background-color: white;
    color: black;
}
.ChannelPtzCtrlPanel {
    padding: 0 10px;
}
.lock_row {
    margin: 10px 0 0 14px;
}
.lock_btn {
    width: 80px;
    height: 25px;
    margin-right: 5px;
}
.triggerTrack_checkBox {
    margin-left: 14px;
}
.apply_btn {
    width: 80px;
    height: 25px;
}
.dropdown_btn {
    width: 80px;
    height: 25px;
    right: -20px;
}
#n9web .el-form .el-checkbox + * {
    margin-left: 5px;
}
.el-form-item {
    --font-size: 15px;
}
#n9web .el-form .el-slider {
    margin-left: 15px;
}
#n9web .el-table {
    --el-table-tr-bg-color: white;
}
.table_cell_span {
    margin-right: 5px;
    font-size: 15px;
}
:deep(.el-dropdown-menu__item) {
    cursor: default;
    width: 300px;
    height: 180px;
    background-color: #e5e5e5;
}

.moreDropDownBox {
    width: 300px;
    height: 180px;
    background-color: #e5e5e5;
    .dropDownHeader {
        margin-top: 5px;
    }
    .checkboxes {
        margin-left: 10px;
    }
    .base-btn-box {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        margin-top: 40px;
    }
}
.clear_btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.showAllArea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.player_config {
    margin-top: 5px;
}
.aiResourcePop {
    height: 400px;
}
.span_txt {
    font-size: 15px;
}
.el-dropdown-link {
    cursor: pointer;
    display: flex;
    font-size: 15px;
    align-items: center;
    color: black;
    justify-content: center;
}
.content_top {
    #row_channel {
        width: 540px;
        padding: 10px 0 10px 20px;
    }
}
.form {
    width: 600px;
}
.notSupportBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #fff;
    height: 567px;
    z-index: 2;
    font-size: 20px;
}
.tripwire_setting_pane {
    position: relative;
    :deep() {
        .el-form .el-input-number.is-without-controls .el-input__wrapper {
            padding-left: 9px;
            padding-right: 9px;
        }
    }

    .checkbox_text {
        margin-left: 5px;
        width: 100px;
        font-size: 15px;
    }
    .aiResource {
        margin-left: 1264px;
    }
    .more {
        position: absolute;
        top: 41px;
        right: 12px;
        z-index: 1;
    }
    .left {
        width: 400px;
        height: 450px;
        position: absolute;
        z-index: 1;
        top: 90px;
        padding-left: 20px;
        .player {
            margin-top: 5px;
            width: 400px;
            height: 300px;
        }
    }
    .function-tabs {
        :deep(.el-tabs__header) {
            border-bottom: 1px solid var(--border-color2);
        }
        :deep(.el-tabs__item) {
            width: 100px;
            font-size: 15px;
            border: none;
        }
        /* 长分割线 */
        :deep(.el-tabs__nav-wrap::after) {
            position: static !important; //可以去掉长分割线
            // background-color: var(--border-color2);
        }

        /* 去掉下划线 */
        :deep(.el-tabs__active-bar) {
            background-color: transparent !important;
        }

        :deep(.el-tabs__item:first-child) {
            margin-left: 30px;
        }
        /* 鼠标选中时样式 */
        :deep(.el-tabs__item.is-active) {
            color: var(--primary--04);
            background-color: transparent;
            border: none;
        }
        /* 鼠标悬浮时样式 */
        :deep(.el-tabs__item:hover) {
            color: var(--primary--04);
            cursor: pointer;
            background-color: transparent;
        }
        .tripwire_param {
            display: flex;
            flex-direction: row;
            min-height: 481px;
            .right {
                // height: 480px;
                padding-left: 20px;
                margin-left: 500px;
                width: calc(100% - 500px);
            }
            .apply_area {
                display: flex;
                justify-content: center;
                align-items: flex-end;
            }
        }
        .tripwire_target {
            display: flex;
            flex-direction: row;
            min-height: 481px;
            .right {
                // height: 480px;
                padding-left: 20px;
                margin-left: 500px;
                width: calc(100% - 500px);
            }
            .apply_area {
                display: flex;
                justify-content: center;
                align-items: flex-end;
            }
        }
        .tripwire_trigger {
            display: flex;
            flex-direction: column;
            height: 481px;
            background-color: #fff;
            :deep() {
                .el-table td.el-table__cell {
                    border-bottom: 0;
                }
            }
            .trigger_box {
                z-index: 3;
                height: 481px;
                background-color: #fff;
            }
            .audio_row {
                display: flex;
                align-items: center;
                width: 280px;
                margin-left: 10px;
                margin-bottom: 5px;
                .audio_select {
                    width: 200px;
                    margin-left: 20px;
                }
            }
            .trigger_content {
                display: flex;
                flex-direction: row;
                padding-left: 20px;
                height: 100%;
                .title {
                    height: 33px;
                    background-color: #d0d0d0;
                    color: black;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .trigger_normal {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    .title {
                        .checkbox {
                            margin-right: 151px;
                        }
                    }
                    .span_text {
                        margin-left: 8px;
                    }
                    :deep() {
                        .el-table .cell {
                            padding: 0px 9px;
                        }
                        .el-checkbox__label {
                            font-size: 15px;
                            color: black;
                        }
                    }
                    .table_item {
                        display: flex;
                        justify-content: flex-start;
                    }
                }
                .trigger_rec {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .trigger_alarm {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .trigger_preset {
                    width: 350px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .apply_area {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    padding-left: 30px;
                    margin-left: 318px;
                }
            }
        }
        :deep(.el-slider) {
            width: 515px;
        }
    }
}
</style>
