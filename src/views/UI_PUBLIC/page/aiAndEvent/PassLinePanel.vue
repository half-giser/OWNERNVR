<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-12 15:00:13
 * @Description: 过线检测
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
            <!-- 检测开启 -->
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-if="chlData.supportPassLine"
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
                <el-checkbox
                    v-if="chlData.supportCpc"
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>

            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div class="base-ai-param-box-left fixed">
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <!-- passLine设置 -->
                <div v-if="pageData.tab === 'param' && chlData.supportPassLine">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-if="pageData.showAllAreaVisible"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="togglePassLineShowAllArea"
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
                <!-- cpc设置 -->
                <div v-if="pageData.tab === 'param' && chlData.supportCpc">
                    <div class="base-btn-box">
                        <!-- <div>
                            <el-checkbox
                                v-if="pageData.showCpcDrawAvailable"
                                v-model="pageData.isCpcDrawAvailable"
                                :label="Translate('IDCS_DRAW_WARN_SURFACE')"
                                @change="toggleCpcDrawAvailable"
                            />
                        </div> -->
                        <el-button @click="clearCpcArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</div>
                </div>
            </div>
            <div class="base-ai-form">
                <!-- 两种功能 -->
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
                            <!-- passLine -->
                            <div
                                v-if="chlData.supportPassLine"
                                class="base-ai-param-right"
                            >
                                <el-form v-title>
                                    <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                    <!-- 排程 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="formData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                        />
                                    </el-form-item>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCD_RULE') }}
                                    </div>
                                    <!-- 警戒面 -->
                                    <el-form-item :label="Translate('IDCS_ALARM_LINE')">
                                        <el-radio-group
                                            v-model="pageData.surfaceIndex"
                                            class="small-btn"
                                            @change="changeLine"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.line"
                                                :key="index"
                                                :value="index"
                                                :label="index + 1"
                                                :class="{
                                                    checked: pageData.surfaceChecked.includes(pageData.surfaceIndex),
                                                }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 方向 -->
                                    <el-form-item :label="Translate('IDCS_DIRECTION')">
                                        <el-select-v2
                                            v-model="pageData.direction"
                                            :options="pageData.directionList"
                                            @change="changeDirection"
                                        />
                                    </el-form-item>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_OSD') }}
                                    </div>
                                    <!-- OSD -->
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="formData.countOSD.switch"
                                            :label="Translate('IDCS_STATIST_OSD')"
                                            @change="changeOSD"
                                        />
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
                                        <el-select-v2
                                            v-model="formData.countTimeType"
                                            :options="formData.countCycleTypeList"
                                            :disabled="!formData.autoReset"
                                        />
                                    </el-form-item>
                                    <!-- 时间 -->
                                    <el-form-item
                                        :label="Translate('IDCS_TIME')"
                                        :style="{
                                            '--form-input-width': '121px',
                                        }"
                                    >
                                        <el-select-v2
                                            v-if="formData.countTimeType === 'week'"
                                            v-model="formData.countPeriod.week.date"
                                            :options="pageData.weekOption"
                                            :disabled="!formData.autoReset"
                                        />
                                        <el-select-v2
                                            v-if="formData.countTimeType === 'month'"
                                            v-model="formData.countPeriod.month.date"
                                            :options="pageData.monthOption"
                                            :disabled="!formData.autoReset"
                                        />
                                        <BaseTimePicker
                                            v-if="formData.countTimeType === 'off'"
                                            model-value=""
                                            disabled
                                        />
                                        <BaseTimePicker
                                            v-if="formData.countTimeType === 'day'"
                                            v-model="formData.countPeriod.day.dateTime"
                                            :disabled="!formData.autoReset"
                                        />
                                        <BaseTimePicker
                                            v-if="formData.countTimeType === 'week'"
                                            v-model="formData.countPeriod.week.dateTime"
                                            :disabled="!formData.autoReset"
                                        />
                                        <BaseTimePicker
                                            v-if="formData.countTimeType === 'month'"
                                            v-model="formData.countPeriod.month.dateTime"
                                            :disabled="!formData.autoReset"
                                        />
                                    </el-form-item>
                                    <!-- 手动重置 -->
                                    <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                        <el-button @click="resetData">
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
                                <el-form v-title>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_SCHEDULE') }}
                                    </div>
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
                                    <!-- 灵敏度 -->
                                    <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                        <el-select-v2
                                            v-model="formData.detectSensitivity"
                                            :options="formData.detectSensitivityList"
                                        />
                                    </el-form-item>
                                    <!-- 统计周期 -->
                                    <el-form-item :label="Translate('IDCS_STATISTICALCYCLE')">
                                        <el-select-v2
                                            v-model="formData.statisticalPeriod"
                                            :options="formData.statisticalPeriodList"
                                        />
                                    </el-form-item>
                                    <!-- 进入阈值 -->
                                    <el-form-item :label="Translate('IDCS_ENTER_NUMBER')">
                                        <BaseNumberInput v-model="formData.crossInAlarmNumValue" />
                                    </el-form-item>
                                    <!-- 离开阈值 -->
                                    <el-form-item :label="Translate('IDCS_LEAVE_NUMBER')">
                                        <BaseNumberInput v-model="formData.crossOutAlarmNumValue" />
                                    </el-form-item>
                                    <!-- 滞留阈值 -->
                                    <el-form-item :label="Translate('IDCS_STRANDED_NUMBER')">
                                        <BaseNumberInput v-model="formData.twoWayDiffAlarmNumValue" />
                                    </el-form-item>
                                    <div class="base-ai-subheading">
                                        {{ Translate('IDCS_RESET_INFO') }}
                                    </div>
                                    <!-- 手动重置 -->
                                    <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                        <el-button @click="resetData">
                                            {{ Translate('IDCS_RESET') }}
                                        </el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
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
                                <el-form>
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
                                            <BaseSliderInput v-model="formData.objectFilter.personSensitivity" />
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
                                            <BaseSliderInput v-model="formData.objectFilter.carSensitivity" />
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
                                            <BaseSliderInput v-model="formData.objectFilter.motorSensitivity" />
                                        </template>
                                    </el-form-item>
                                </el-form>
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
                <div
                    v-if="chlData.supportPassLine"
                    class="base-ai-advance-btn"
                    @click="handleMoreClick"
                >
                    {{ Translate('IDCS_ADVANCED') }}
                    <BaseImgSprite
                        file="arrow"
                        :chunk="4"
                    />
                </div>
            </div>
        </div>
        <PassLineEmailPop
            v-model="pageData.morePopOpen"
            :schedule-list="pageData.scheduleList"
            :email-data="pageData.emailData"
            @edit-schedule="pageData.isSchedulePop = true"
            @close="closeMorePop"
        />
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./PassLinePanel.v.ts"></script>
