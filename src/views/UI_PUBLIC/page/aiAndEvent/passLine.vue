<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-12 15:00:13
 * @Description: 过线检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-24 15:36:43
-->
<template>
    <div class="tripwire_setting_pane">
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="pageData.scheduleManagePopOpen = false"
        >
        </ScheduleManagPop>
        <passLineEmailPop
            v-model="pageData.morePopOpen"
            :schedule-list="pageData.scheduleList"
            :email-data="pageData.emailData"
            @close="handleMorePopClose"
        ></passLineEmailPop>
        <div
            v-if="pageData.notSupportTipShow"
            class="notSupportBox"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="pageData.requireDataFail"
            class="notSupportBox"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!pageData.notSupportTipShow && !pageData.requireDataFail">
            <!-- 检测开启 -->
            <el-row
                v-if="pageData.chlData['supportPassLine']"
                class="row-padding"
            >
                <el-checkbox
                    v-model="pageData.passLineDetectionEnable"
                    @change="pageData.applyDisable = false"
                ></el-checkbox>
                <span class="checkbox_text">{{ Translate('IDCS_ENABLE') }}</span>
            </el-row>
            <el-row
                v-if="pageData.chlData['supportCpc']"
                class="row-padding"
            >
                <el-checkbox
                    v-model="pageData.cpcDetectionEnable"
                    @change="pageData.applyDisable = false"
                ></el-checkbox>
                <span class="checkbox_text">{{ Translate('IDCS_ENABLE') }}</span>
            </el-row>
            <!-- 更多按钮 -->
            <el-dropdown
                v-if="pageData.chlData.supportPassLine"
                height="180px"
                class="more"
                trigger="click"
            >
                <span
                    class="el-dropdown-link"
                    @click="handleMoreClick"
                >
                    {{ Translate('IDCS_ADVANCED') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
            </el-dropdown>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div class="left">
                <div class="player">
                    <BaseVideoPlayer
                        id="player"
                        ref="playerRef"
                        type="live"
                        @onready="handlePlayerReady"
                    />
                </div>
                <!-- passLine设置 -->
                <div
                    v-if="pageData.fuction === 'param' && pageData.chlData.supportPassLine"
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
                                    v-if="pageData.showAllAreaVisible"
                                    v-model="pageData.isShowAllArea"
                                    @change="handlePassLineShowAllAreaChange"
                                ></el-checkbox>
                                <span
                                    v-show="pageData.showAllAreaVisible"
                                    class="checkbox_text"
                                    >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</span
                                >
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="clear_btns">
                                <el-button
                                    size="small"
                                    @click="passLineClearArea"
                                    >{{ Translate('IDCS_CLEAR') }}</el-button
                                >
                                <el-button
                                    v-if="pageData.clearAllVisible"
                                    size="small"
                                    @click="passLineClearAllArea"
                                    >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                                >
                            </div>
                        </el-col>
                    </el-row>
                    <span id="draw_tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</span>
                </div>
                <!-- cpc设置 -->
                <div
                    v-if="pageData.fuction === 'param' && pageData.chlData.supportCpc"
                    class="player_config"
                >
                    <el-row>
                        <el-col :span="16">
                            <div
                                v-if="pageData.showCpcDrawAvailable"
                                class="showAllArea"
                            >
                                <el-checkbox
                                    v-model="pageData.isCpcDrawAvailable"
                                    @change="handleCpcDrawAvailableChange"
                                ></el-checkbox>
                                <span class="checkbox_text">{{ Translate('IDCS_DRAW_WARN_SURFACE') }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="clear_btns">
                                <el-button
                                    size="small"
                                    @click="clearCpcArea"
                                    >{{ Translate('IDCS_CLEAR') }}</el-button
                                >
                            </div>
                        </el-col>
                    </el-row>
                    <span id="draw_tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
                </div>
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="function-tabs"
                @tab-click="handleFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="tripwire_param"
                >
                    <!-- passLine -->
                    <div
                        v-if="pageData.chlData.supportPassLine"
                        class="right"
                    >
                        <el-form
                            :model="pageData"
                            label-width="150px"
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
                                    v-model="pageData.passLineSchedule"
                                    value-key="value"
                                    :options="pageData.scheduleList"
                                    size="small"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                                <el-button
                                    class="form_btn"
                                    size="small"
                                    @click="pageData.scheduleManagePopOpen = true"
                                >
                                    {{ Translate('IDCS_MANAGE') }}
                                </el-button>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCD_RULE') }}</span>
                            </div>
                            <!-- 警戒面 -->
                            <el-form-item
                                :label="Translate('IDCS_ALARM_LINE')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-button
                                    v-for="(item, index) in pageData.lineInfo"
                                    :key="index"
                                    class="alert_surface_btn"
                                    :style="{
                                        backgroundColor: pageData.chosenSurfaceIndex === index ? '#00BBDB' : 'white',
                                        color: pageData.chosenSurfaceIndex === index ? 'white' : item.configured ? '#00BBDB' : 'black',
                                        borderColor: pageData.chosenSurfaceIndex === index || item.configured ? '#00BBDB' : '',
                                    }"
                                    @click="handleLineChange(index)"
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
                                    v-model="pageData.direction"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.directionList"
                                    @change="handleDirectionChange"
                                >
                                    <el-option
                                        v-for="item in pageData.directionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_OSD') }}</span>
                            </div>
                            <!-- OSD -->
                            <el-form-item>
                                <template #label>
                                    <el-checkbox
                                        v-model="pageData.countOSD.switch"
                                        @change="handleOSDChange"
                                        >{{ Translate('IDCS_STATIST_OSD') }}</el-checkbox
                                    >
                                </template>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_RESET_INFO') }}</span>
                            </div>
                            <!-- 自动重置 -->
                            <el-form-item
                                :label="Translate('IDCS_AUTO_RESET')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-checkbox
                                    v-model="pageData.autoReset"
                                    @change="pageData.applyDisable = false"
                                >
                                    {{ Translate('IDCS_ENABLE') }}
                                </el-checkbox>
                            </el-form-item>
                            <!-- 模式 -->
                            <el-form-item
                                :label="Translate('IDCS_MODE')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.countTimeType"
                                    :disabled="!pageData.autoReset"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.countCycleTypeList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.countCycleTypeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 时间 -->
                            <el-form-item
                                :label="Translate('IDCS_TIME')"
                                :style="{
                                    '--form-input-width': '105px',
                                }"
                            >
                                <el-row>
                                    <el-col
                                        :span="11"
                                        class="timeSet"
                                    >
                                        <el-select
                                            v-if="pageData.countTimeType === 'week'"
                                            v-model="pageData.countPeriod['week'].date"
                                            :disabled="!pageData.autoReset"
                                            value-key="value"
                                            size="small"
                                            :options="pageData.weekOption"
                                            @change="pageData.applyDisable = false"
                                        >
                                            <el-option
                                                v-for="item in pageData.weekOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                        <el-select
                                            v-if="pageData.countTimeType === 'month'"
                                            v-model="pageData.countPeriod['month'].date"
                                            :disabled="!pageData.autoReset"
                                            value-key="value"
                                            size="small"
                                            :options="pageData.monthOption"
                                            @change="pageData.applyDisable = false"
                                        >
                                            <el-option
                                                v-for="item in pageData.monthOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col
                                        :span="11"
                                        :style="{
                                            marginLeft: pageData.countTimeType === 'off' || pageData.countTimeType === 'day' ? '-33px' : '0',
                                        }"
                                    >
                                        <el-time-picker
                                            v-if="pageData.countTimeType === 'off'"
                                            :disabled="pageData.countTimeType === 'off'"
                                            size="small"
                                            value-format="HH:mm:ss"
                                        />
                                        <el-time-picker
                                            v-if="pageData.countTimeType === 'day'"
                                            v-model="pageData.countPeriod['day']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                            @change="pageData.applyDisable = false"
                                        />
                                        <el-time-picker
                                            v-if="pageData.countTimeType === 'week'"
                                            v-model="pageData.countPeriod['week']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                            @change="pageData.applyDisable = false"
                                        />
                                        <el-time-picker
                                            v-if="pageData.countTimeType === 'month'"
                                            v-model="pageData.countPeriod['month']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                            @change="pageData.applyDisable = false"
                                        />
                                    </el-col>
                                </el-row>
                            </el-form-item>
                            <!-- 手动重置 -->
                            <el-form-item
                                :label="Translate('IDCS_MANUAL_RESET')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-button
                                    class="apply_btn"
                                    @click="handleReset"
                                >
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                    <!-- cpc -->
                    <div
                        v-if="pageData.chlData.supportCpc"
                        class="right"
                    >
                        <el-form
                            :model="pageData"
                            label-width="150px"
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
                                    v-model="pageData.cpcSchedule"
                                    value-key="value"
                                    :options="pageData.scheduleList"
                                    size="small"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                                <el-button
                                    class="form_btn"
                                    size="small"
                                    @click="pageData.scheduleManagePopOpen = true"
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
                                    v-model="pageData.holdTime"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.holdTimeList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.holdTimeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 灵敏度 -->
                            <el-form-item
                                :label="Translate('IDCS_SENSITIVITY')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.detectSensitivity"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.detectSensitivityList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.detectSensitivityList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 统计周期 -->
                            <el-form-item
                                :label="Translate('IDCS_STATISTICALCYCLE')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.statisticalPeriod"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.statisticalPeriodList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.statisticalPeriodList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 进入阈值 -->
                            <el-form-item
                                :label="Translate('IDCS_ENTER_NUMBER')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-input
                                    v-model="pageData.crossInAlarmNumValue"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <!-- 离开阈值 -->
                            <el-form-item
                                :label="Translate('IDCS_LEAVE_NUMBER')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-input
                                    v-model="pageData.crossOutAlarmNumValue"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <!-- 滞留阈值 -->
                            <el-form-item
                                :label="Translate('IDCS_STRANDED_NUMBER')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-input
                                    v-model="pageData.twoWayDiffAlarmNumValue"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_RESET_INFO') }}</span>
                            </div>
                            <!-- 手动重置 -->
                            <el-form-item
                                :label="Translate('IDCS_MANUAL_RESET')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-button
                                    class="apply_btn"
                                    @click="handleReset"
                                >
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
                            :disabled="pageData.applyDisable"
                            @click="handleApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 检测目标 -->
                <el-tab-pane
                    v-if="pageData.chlData.supportPassLine"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="target"
                    class="tripwire_target"
                >
                    <div class="right">
                        <el-form
                            :model="pageData"
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
                                            v-model="pageData.objectFilter.person"
                                            @change="pageData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_PERSON') }}</span>
                                    </el-row>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="pageData.objectFilter.personSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="pageData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                            <!-- 汽车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <div class="sensitivity_box">
                                        <el-checkbox
                                            v-model="pageData.objectFilter.car"
                                            @change="pageData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_DETECTION_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="pageData.objectFilter.carSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        @change="pageData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                            <!-- 摩托车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <div class="sensitivity_box">
                                        <el-checkbox
                                            v-model="pageData.objectFilter.motorcycle"
                                            @change="pageData.applyDisable = false"
                                        ></el-checkbox>
                                        <span>{{ Translate('IDCS_NON_VEHICLE') }}</span>
                                    </div>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="pageData.objectFilter.motorSensitivity"
                                        size="small"
                                        :show-input-controls="false"
                                        show-input
                                        class="slider"
                                        @change="pageData.applyDisable = false"
                                    />
                                </template>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
                            :disabled="pageData.applyDisable"
                            @click="handleApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./passLine.v.ts"></script>

<style lang="scss" scoped>
.chl_select {
    width: 430px;
    :deep(.el-select__selection) {
        text-align: center;
    }
}
.chl_item {
    float: left;
    width: 120px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--border-color2);
}
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
.row-padding {
    padding-left: 20px;
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
    .checkbox_text {
        margin-left: 5px;
        width: 100px;
        font-size: 15px;
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
        padding-left: 20px;
        z-index: 1;
        top: 82px;
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
                margin-left: 500px;
                padding-left: 20px;
                width: calc(100% - 500px);
                .timeSet .el-select {
                    margin-right: 30px;
                }
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
                padding-left: 20px;
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
