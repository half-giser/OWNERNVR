<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:35:56
 * @Description:  区域入侵
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-20 17:38:34
-->
<template>
    <div class="pea_setting_pane">
        <ScheduleManagPop
            v-model="peaData.scheduleManagePopOpen"
            @close="peaData.scheduleManagePopOpen = false"
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
                <el-button @click="peaData.aiResourcePopOpen = false">
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </el-row>
        </el-dialog>
        <div
            v-if="peaData.notSupportTipShow"
            class="notSupportBox"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="peaData.requireDataFail"
            class="notSupportBox"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!peaData.notSupportTipShow && !peaData.requireDataFail">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <el-row>
                <el-checkbox
                    v-model="peaData.areaCfgData[peaData.activity_type].detectionEnable"
                    @change="handleDectionChange"
                ></el-checkbox>
                <span class="checkbox_text">{{ peaData.detectionTypeText }}</span>
                <div class="aiResource">
                    <span>{{ Translate('IDCS_USAGE_RATE') }}</span>
                    <span>{{ ` : ${peaData.totalResourceOccupancy}% ` }}</span>
                    <BaseImgSprite
                        file="detail"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="peaData.aiResourcePopOpen = true"
                    />
                </div>
            </el-row>
            <!-- 更多按钮 -->
            <el-dropdown
                v-if="peaData.areaCfgData[peaData.activity_type].pictureAvailable"
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
                                            v-model="peaData.areaCfgData[peaData.activity_type].saveTargetPicture"
                                            @change="peaData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</span>
                                    </el-row>
                                    <el-row>
                                        <el-checkbox
                                            v-model="peaData.areaCfgData[peaData.activity_type].saveSourcePicture"
                                            @change="peaData.applyDisable = false"
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
                v-show="peaData.peaFunction !== 'pea_trigger'"
                class="left"
            >
                <div class="player">
                    <BaseVideoPlayer
                        id="peaplayer"
                        ref="peaplayerRef"
                        type="live"
                        @onready="peahandlePlayerReady"
                    />
                </div>
                <div
                    v-show="peaData.peaFunction === 'pea_param'"
                    class="player_config"
                >
                    <el-row>
                        <el-col :span="16">
                            <div class="showAllArea">
                                <el-checkbox
                                    v-show="peaData.showAllAreaVisible"
                                    v-model="peaData.isShowAllArea"
                                    @change="handlePeaShowAllAreaChange"
                                ></el-checkbox>
                                <span
                                    v-show="peaData.showAllAreaVisible"
                                    class="checkbox_text"
                                    >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</span
                                >
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="clear_btns">
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
                        </el-col>
                    </el-row>
                    <span id="draw_tip">{{ peaData.areaCfgData[peaData.activity_type].regulation ? Translate('IDCS_DRAW_RECT_TIP') : Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
                </div>
            </div>
            <!-- 三种功能 -->
            <el-tabs
                v-model="peaData.peaFunction"
                class="function-tabs"
                @tab-click="handlePeaFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="pea_param"
                    class="tripwire_param"
                >
                    <div class="right">
                        <el-form
                            :model="peaData"
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
                                    ></el-option>
                                </el-select>
                                <el-button
                                    class="form_btn"
                                    size="small"
                                    @click="peaData.scheduleManagePopOpen = true"
                                >
                                    {{ Translate('IDCS_MANAGE') }}
                                </el-button>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCD_RULE') }}</span>
                            </div>
                            <!-- 区域活动 -->
                            <el-form-item
                                :label="Translate('IDCS_AREA_ACTIVE')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
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
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 方向 -->
                            <el-form-item
                                :label="Translate('IDCS_DIRECTION')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
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
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 持续时间 -->
                            <el-form-item
                                :label="Translate('IDCS_DURATION')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
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
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 警戒区域 -->
                            <el-form-item
                                :label="Translate('IDCS_WARN_AREA')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-button
                                    v-for="(item, index) in peaData.areaCfgData[peaData.activity_type].boundaryInfo"
                                    :key="index"
                                    class="alert_surface_btn"
                                    :style="{
                                        backgroundColor: peaData.chosenWarnAreaIndex === index ? '#00BBDB' : 'white',
                                        color: peaData.chosenWarnAreaIndex === index ? 'white' : item.configured ? '#00BBDB' : 'black',
                                        borderColor: peaData.chosenWarnAreaIndex === index || item.configured ? '#00BBDB' : '',
                                    }"
                                    @click="handleWarnAreaChange(index)"
                                >
                                    {{ index + 1 }}
                                </el-button>
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
                            <el-form-item
                                v-if="peaData.areaCfgData[peaData.activity_type].pea_onlyPreson"
                                :label="Translate('IDCS_DETECTION_ONLY_ONE_OBJECT').formatForLang(Translate('IDCS_BEYOND_DETECTION'), Translate('IDCS_DETECTION_PERSON'))"
                            >
                            </el-form-item>
                            <!-- 云台 -->
                            <div v-if="peaData.chlData.supportAutoTrack">
                                <div class="form_span">
                                    <el-divider direction="vertical"></el-divider>
                                    <span>{{ Translate('IDCS_PTZ') }}</span>
                                </div>
                                <ChannelPtzCtrlPanel
                                    class="ChannelPtzCtrlPanel"
                                    :chl-id="peaData.currChlId || ''"
                                    @speed="setPeaSpeed"
                                />
                                <el-row class="lock_row">
                                    <el-button
                                        class="lock_btn"
                                        @click="editLockStatus"
                                    >
                                        {{ peaData.lockStatus ? Translate('IDCS_UNLOCK') : Translate('IDCS_LOCKED') }}
                                    </el-button>
                                    <span>{{ Translate('IDCS_LOCK_PTZ_TIP') }}</span>
                                </el-row>
                                <el-checkbox
                                    v-model="peaData.areaCfgData[peaData.activity_type].autoTrack"
                                    class="triggerTrack_checkBox"
                                    @change="peaData.applyDisable = false"
                                    >{{ Translate('IDCS_TRIGGER_TRACK') }}
                                </el-checkbox>
                            </div>
                        </el-form>
                    </div>
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
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
                    class="tripwire_target"
                >
                    <div class="right">
                        <el-form
                            :model="peaData"
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
                                            v-model="peaData.areaCfgData[peaData.activity_type].person"
                                            @change="peaData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_PERSON') }}</span>
                                    </el-row>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_NON_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
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
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
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
                    class="tripwire_trigger"
                >
                    <div class="trigger_box">
                        <div
                            v-if="peaData.supportAlarmAudioConfig"
                            class="audio_row"
                        >
                            <span>{{ Translate('IDCS_VOICE_PROMPT') }}</span>
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
                        </div>
                        <div class="trigger_content">
                            <!-- 常规联动 -->
                            <div class="trigger_normal">
                                <div class="title">
                                    <div class="checkbox"></div>
                                    <el-checkbox
                                        v-model="peaData.areaCfgData[peaData.activity_type].triggerSwitch"
                                        class="table_title"
                                        @change="handlePeaTriggerSwitch"
                                    ></el-checkbox>
                                    <span class="span_text">{{ Translate('IDCS_TRIGGER_NOMAL') }}</span>
                                </div>
                                <el-table
                                    height="358px"
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
                            <div class="trigger_rec">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_RECORD') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="peaData.areaCfgData[peaData.activity_type].recordIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="358px"
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
                            <div class="trigger_alarm">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_ALARM_OUT') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="peaData.areaCfgData[peaData.activity_type].alarmOutIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="358px"
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
                            <div class="trigger_preset">
                                <div class="title">
                                    <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                                </div>
                                <el-table
                                    border
                                    stripe
                                    height="358px"
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
                            <div class="apply_area">
                                <el-button
                                    class="apply_btn"
                                    :disabled="peaData.applyDisable"
                                    @click="handlePeaApply"
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

<script lang="ts" src="./Pea.v.ts"></script>

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
}
.form > .form_span:not(:first-child) {
    padding: 10px 0;
}
.el-form-item > .el-select {
    width: 300px;
}
.form_btn {
    width: 80px;
    height: 25px;
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
:deep() {
    .el-tabs--border-card > .el-tabs__header .el-tabs__item {
        padding: 0px;
        border: 1px solid #999999;
        margin-top: 0px;
        margin-left: 0px;
    }
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
.pea_setting_pane {
    position: relative;
    :deep(#n9web .el-form .el-input-number.is-without-controls .el-input__wrapper) {
        padding-left: 9px;
        padding-right: 9px;
    }
    .checkbox_text {
        margin-left: 5px;
        width: 100px;
    }
    .aiResource {
        margin-left: 1253px;
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
        top: 84px;
        .player {
            margin-top: 5px;
            width: 400px;
            height: 300px;
        }
    }
    .function-tabs {
        :deep(.el-tabs__item.is-active) {
            color: #00bbdb;
        }
        .tripwire_param {
            display: flex;
            flex-direction: row;
            min-height: 481px;
            .right {
                // height: 480px;
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
                padding-left: 10px;
                height: 100%;
                .title {
                    height: 42px;
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
                            margin-right: -140px;
                        }
                    }
                    .span_text {
                        margin-left: 5px;
                    }
                    .table_item {
                        display: flex;
                        justify-content: flex-start;
                        margin-left: 4px;
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
