<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-12 15:00:13
 * @Description: 过线检测
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
                <div v-if="chlData.supportPassLine">
                    <el-checkbox
                        v-model="formData.passLineDetectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </div>
                <div v-if="chlData.supportCpc">
                    <el-checkbox
                        v-model="formData.cpcDetectionEnable"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </div>
            </div>
            <!-- 更多按钮 -->
            <div
                v-if="chlData.supportPassLine"
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
                <div v-if="pageData.fuction === 'param' && chlData.supportPassLine">
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
                <div v-if="pageData.fuction === 'param' && chlData.supportCpc">
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
                            v-if="chlData.supportPassLine"
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
                                    <el-select v-model="formData.passLineSchedule">
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
                                            v-for="(_item, index) in formData.lineInfo"
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
                                            v-model="formData.countOSD.switch"
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
                                        v-model="formData.autoReset"
                                        :label="Translate('IDCS_ENABLE')"
                                    />
                                </el-form-item>
                                <!-- 模式 -->
                                <el-form-item :label="Translate('IDCS_MODE')">
                                    <el-select
                                        v-model="formData.countTimeType"
                                        :disabled="!formData.autoReset"
                                    >
                                        <el-option
                                            v-for="item in formData.countCycleTypeList"
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
                                        v-if="formData.countTimeType === 'week'"
                                        v-model="formData.countPeriod['week'].date"
                                        :disabled="!formData.autoReset"
                                    >
                                        <el-option
                                            v-for="item in pageData.weekOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-select
                                        v-if="formData.countTimeType === 'month'"
                                        v-model="formData.countPeriod['month'].date"
                                        :disabled="!formData.autoReset"
                                    >
                                        <el-option
                                            v-for="item in pageData.monthOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                    <el-time-picker
                                        v-if="formData.countTimeType === 'off'"
                                        :disabled="formData.countTimeType === 'off'"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="formData.countTimeType === 'day'"
                                        v-model="formData.countPeriod['day']['dateTime']"
                                        :disabled="!formData.autoReset"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="formData.countTimeType === 'week'"
                                        v-model="formData.countPeriod['week']['dateTime']"
                                        :disabled="!formData.autoReset"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="formData.countTimeType === 'month'"
                                        v-model="formData.countPeriod['month']['dateTime']"
                                        :disabled="!formData.autoReset"
                                        value-format="HH:mm:ss"
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
                            v-if="chlData.supportCpc"
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
                                    <el-select v-model="formData.cpcSchedule">
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
                                    <el-select v-model="formData.holdTime">
                                        <el-option
                                            v-for="item in formData.holdTimeList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 灵敏度 -->
                                <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                    <el-select v-model="formData.detectSensitivity">
                                        <el-option
                                            v-for="item in formData.detectSensitivityList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 统计周期 -->
                                <el-form-item :label="Translate('IDCS_STATISTICALCYCLE')">
                                    <el-select v-model="formData.statisticalPeriod">
                                        <el-option
                                            v-for="item in formData.statisticalPeriodList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!-- 进入阈值 -->
                                <el-form-item :label="Translate('IDCS_ENTER_NUMBER')">
                                    <el-input v-model="formData.crossInAlarmNumValue" />
                                </el-form-item>
                                <!-- 离开阈值 -->
                                <el-form-item :label="Translate('IDCS_LEAVE_NUMBER')">
                                    <el-input v-model="formData.crossOutAlarmNumValue" />
                                </el-form-item>
                                <!-- 滞留阈值 -->
                                <el-form-item :label="Translate('IDCS_STRANDED_NUMBER')">
                                    <el-input v-model="formData.twoWayDiffAlarmNumValue" />
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
                    v-if="chlData.supportPassLine"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="target"
                >
                    <div class="base-ai-param-box">
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form
                                :model="pageData"
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
                                                v-model="formData.objectFilter.person"
                                                :label="Translate('IDCS_DETECTION_PERSON')"
                                            />
                                        </el-row>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.personSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 汽车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="formData.objectFilter.car"
                                                :label="Translate('IDCS_DETECTION_VEHICLE')"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.carSensitivity"
                                            show-input
                                        />
                                    </template>
                                </el-form-item>
                                <!-- 摩托车灵敏度 -->
                                <el-form-item>
                                    <template #label>
                                        <div class="sensitivity_box">
                                            <el-checkbox
                                                v-model="formData.objectFilter.motorcycle"
                                                :label="Translate('IDCS_NON_VEHICLE')"
                                            />
                                        </div>
                                    </template>
                                    <template #default>
                                        <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                        <el-slider
                                            v-model="formData.objectFilter.motorSensitivity"
                                            show-input
                                            class="slider"
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

.slider-text {
    margin-right: 15px;
}
</style>
