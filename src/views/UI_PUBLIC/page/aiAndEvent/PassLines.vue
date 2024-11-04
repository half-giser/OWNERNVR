<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-12 15:00:13
 * @Description: 过线检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-31 19:28:52
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        />
        <PassLineEmailPop
            v-model="pageData.morePopOpen"
            :schedule-list="pageData.scheduleList"
            :email-data="pageData.emailData"
            @close="handleMorePopClose"
        />
        <BaseNotification v-model:notifications="pageData.notification" />
        <!-- <div
            v-if="pageData.notSupportTipShow"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div> -->
        <div
            v-if="pageData.requireDataFail"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!pageData.requireDataFail">
            <!-- 检测开启 -->
            <div
                class="base-btn-box padding collapse"
                :span="2"
            >
                <div v-if="pageData.chlData.supportPassLine">
                    <el-checkbox
                        v-model="pageData.passLineDetectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                        @change="pageData.applyDisable = false"
                    />
                </div>
                <div v-if="pageData.chlData.supportCpc">
                    <el-checkbox
                        v-model="pageData.cpcDetectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                        @change="pageData.applyDisable = false"
                    />
                </div>
            </div>
            <!-- 更多按钮 -->
            <div
                v-if="pageData.chlData.supportPassLine"
                class="more_wrap"
                @click="handleMoreClick"
            >
                {{ Translate('IDCS_ADVANCED') }}
                <BaseImgSprite
                    file="arrow"
                    :index="0"
                    :chunk="4"
                />
            </div>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div class="base-ai-param-box-left fixed">
                <div class="player">
                    <BaseVideoPlayer
                        id="player"
                        ref="playerRef"
                        type="live"
                        @onready="handlePlayerReady"
                    />
                </div>
                <!-- passLine设置 -->
                <div v-if="pageData.fuction === 'param' && pageData.chlData.supportPassLine">
                    <div
                        class="base-btn-box"
                        :span="2"
                    >
                        <div>
                            <el-checkbox
                                v-if="pageData.showAllAreaVisible"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="handlePassLineShowAllAreaChange"
                            />
                        </div>
                        <div>
                            <el-button @click="passLineClearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-if="pageData.clearAllVisible"
                                @click="passLineClearAllArea"
                                >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                            >
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_LINE_TIP') }}</div>
                </div>
                <!-- cpc设置 -->
                <div v-if="pageData.fuction === 'param' && pageData.chlData.supportCpc">
                    <div
                        class="base-btn-box"
                        :span="2"
                    >
                        <div>
                            <!-- <el-checkbox
                                v-if="pageData.showCpcDrawAvailable"
                                v-model="pageData.isCpcDrawAvailable"
                                :label="Translate('IDCS_DRAW_WARN_SURFACE')"
                                @change="handleCpcDrawAvailableChange"
                            /> -->
                        </div>
                        <div>
                            <el-button @click="clearCpcArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                        </div>
                    </div>
                    <span class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
                </div>
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="base-ai-tabs"
                @tab-click="handleFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <!-- passLine -->
                        <div
                            v-if="pageData.chlData.supportPassLine"
                            class="base-ai-param-right"
                        >
                            <el-form
                                :model="pageData"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select
                                        v-model="pageData.passLineSchedule"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-button @click="pageData.scheduleManagePopOpen = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 警戒面 -->
                                <el-form-item :label="Translate('IDCS_ALARM_LINE')">
                                    <el-radio-group
                                        v-model="pageData.chosenSurfaceIndex"
                                        class="small-btn"
                                        @change="handleLineChange"
                                    >
                                        <el-radio-button
                                            v-for="(_item, index) in pageData.lineInfo"
                                            :key="index"
                                            :value="index"
                                            :label="index + 1"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <!-- 方向 -->
                                <el-form-item :label="Translate('IDCS_DIRECTION')">
                                    <el-select
                                        v-model="pageData.direction"
                                        @change="handleDirectionChange"
                                    >
                                        <el-option
                                            v-for="item in pageData.directionList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_OSD') }}
                                </div>
                                <!-- OSD -->
                                <el-form-item>
                                    <template #label>
                                        <el-checkbox
                                            v-model="pageData.countOSD.switch"
                                            :label="Translate('IDCS_STATIST_OSD')"
                                            @change="handleOSDChange"
                                        />
                                    </template>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_RESET_INFO') }}
                                </div>
                                <!-- 自动重置 -->
                                <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                                    <el-checkbox
                                        v-model="pageData.autoReset"
                                        :label="Translate('IDCS_ENABLE')"
                                        @change="pageData.applyDisable = false"
                                    />
                                </el-form-item>
                                <!-- 模式 -->
                                <el-form-item :label="Translate('IDCS_MODE')">
                                    <el-select
                                        v-model="pageData.countTimeType"
                                        :disabled="!pageData.autoReset"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.countCycleTypeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 时间 -->
                                <el-form-item
                                    :label="Translate('IDCS_TIME')"
                                    :style="{
                                        '--form-input-width': '105px',
                                    }"
                                >
                                    <el-select
                                        v-if="pageData.countTimeType === 'week'"
                                        v-model="pageData.countPeriod['week'].date"
                                        :disabled="!pageData.autoReset"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.weekOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-select
                                        v-if="pageData.countTimeType === 'month'"
                                        v-model="pageData.countPeriod['month'].date"
                                        :disabled="!pageData.autoReset"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.monthOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-time-picker
                                        v-if="pageData.countTimeType === 'off'"
                                        :disabled="pageData.countTimeType === 'off'"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="pageData.countTimeType === 'day'"
                                        v-model="pageData.countPeriod['day']['dateTime']"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
                                        @change="pageData.applyDisable = false"
                                    />
                                    <el-time-picker
                                        v-if="pageData.countTimeType === 'week'"
                                        v-model="pageData.countPeriod['week']['dateTime']"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
                                        @change="pageData.applyDisable = false"
                                    />
                                    <el-time-picker
                                        v-if="pageData.countTimeType === 'month'"
                                        v-model="pageData.countPeriod['month']['dateTime']"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
                                        @change="pageData.applyDisable = false"
                                    />
                                </el-form-item>
                                <!-- 手动重置 -->
                                <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                    <el-button @click="handleReset">
                                        {{ Translate('IDCS_RESET') }}
                                    </el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                        <!-- cpc -->
                        <div
                            v-if="pageData.chlData.supportCpc"
                            class="base-ai-param-right"
                        >
                            <el-form
                                :model="pageData"
                                label-width="150"
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
                                        v-model="pageData.cpcSchedule"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.scheduleList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-button @click="pageData.scheduleManagePopOpen = true">
                                        {{ Translate('IDCS_MANAGE') }}
                                    </el-button>
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCD_RULE') }}
                                </div>
                                <!-- 持续时间 -->
                                <el-form-item :label="Translate('IDCS_DURATION')">
                                    <el-select
                                        v-model="pageData.holdTime"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.holdTimeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 灵敏度 -->
                                <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                    <el-select
                                        v-model="pageData.detectSensitivity"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.detectSensitivityList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 统计周期 -->
                                <el-form-item :label="Translate('IDCS_STATISTICALCYCLE')">
                                    <el-select
                                        v-model="pageData.statisticalPeriod"
                                        @change="pageData.applyDisable = false"
                                    >
                                        <el-option
                                            v-for="item in pageData.statisticalPeriodList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 进入阈值 -->
                                <el-form-item :label="Translate('IDCS_ENTER_NUMBER')">
                                    <el-input v-model="pageData.crossInAlarmNumValue" />
                                </el-form-item>
                                <!-- 离开阈值 -->
                                <el-form-item :label="Translate('IDCS_LEAVE_NUMBER')">
                                    <el-input v-model="pageData.crossOutAlarmNumValue" />
                                </el-form-item>
                                <!-- 滞留阈值 -->
                                <el-form-item :label="Translate('IDCS_STRANDED_NUMBER')">
                                    <el-input v-model="pageData.twoWayDiffAlarmNumValue" />
                                </el-form-item>
                                <div class="base-ai-subheading">
                                    {{ Translate('IDCS_RESET_INFO') }}
                                </div>
                                <!-- 手动重置 -->
                                <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                    <el-button @click="handleReset">
                                        {{ Translate('IDCS_RESET') }}
                                    </el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
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
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
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
                                        <el-row>
                                            <el-checkbox
                                                v-model="pageData.objectFilter.person"
                                                :label="Translate('IDCS_DETECTION_PERSON')"
                                                @change="pageData.applyDisable = false"
                                            />
                                        </el-row>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="pageData.objectFilter.personSensitivity"
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
                                                :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                @change="pageData.applyDisable = false"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="pageData.objectFilter.carSensitivity"
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
                                                :label="Translate('IDCS_NON_VEHICLE')"
                                                @change="pageData.applyDisable = false"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="pageData.objectFilter.motorSensitivity"
                                            show-input
                                            class="slider"
                                            @change="pageData.applyDisable = false"
                                        />
                                    </template>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="base-btn-box fixed">
                        <el-button
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

<script lang="ts" src="./PassLines.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
.more_wrap {
    position: absolute;
    top: 42px;
    right: 13px;
    z-index: 1;
    cursor: pointer;
    z-index: 1;
    display: flex;
    align-items: center;
}
.base-ai-linkage-title-checkbox {
    padding-left: 15px;
    :deep(.el-checkbox__label) {
        padding-left: 3px;
    }
}
.slider-text {
    margin-right: 15px;
}
</style>
