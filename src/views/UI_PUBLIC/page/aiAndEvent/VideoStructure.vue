<!--
 * @Description: AI 事件——更多——视频结构化
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-20 10:15:52
-->
<template>
    <div>
        <div class="base-ai-param-box-left fixed">
            <div
                v-if="pageData.tab === 'image'"
                class="osd_show_list"
            >
                <p
                    v-for="(value, index) in pageData.osdShowList"
                    :key="index"
                >
                    {{ value }}
                </p>
            </div>
            <div
                v-if="mode === 'h5' || pageData.tab !== 'image'"
                class="player"
            >
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <div v-else>
                <div class="player">
                    <BaseVideoPlayer
                        ref="osdPlayerRef"
                        type="live"
                    />
                </div>
            </div>
            <div v-show="pageData.tab === 'param'">
                <div
                    class="base-btn-box"
                    :span="2"
                >
                    <div>
                        <el-checkbox
                            v-model="pageData.isShowAllArea"
                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                            @change="showAllArea"
                        />
                    </div>
                    <div>
                        <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                        <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                    </div>
                </div>
                <span class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
            </div>
        </div>
        <div
            class="base-btn-box padding collapse"
            span="start"
        >
            <el-checkbox
                v-model="vsdData.enabledSwitch"
                :label="Translate('IDCS_ENABLE')"
            />
        </div>
        <div>
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
                @tab-change="tabChange"
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
                            inline-message
                        >
                            <!-- 排程 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select v-model="vsdData.schedule">
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                                <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                            </el-form-item>
                            <!-- 区域 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_AREA') }}</div>
                            <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                <el-radio-group
                                    v-model="pageData.detectArea"
                                    class="small-btn"
                                    @change="detectAreaChange"
                                >
                                    <el-radio-button
                                        v-for="(_value, _name, index) in vsdData.detectAreaInfo"
                                        :key="index"
                                        :label="index + 1"
                                        :value="index"
                                        :class="{ configured_area: pageData.detectConfiguredArea[index] }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                <el-radio-group
                                    v-model="pageData.maskArea"
                                    class="small-btn"
                                    @change="maskAreaChange"
                                >
                                    <el-radio-button
                                        v-for="(_value, _name, index) in vsdData.maskAreaInfo"
                                        :key="index"
                                        :label="index + 1"
                                        :value="index"
                                        :class="{ configured_area: pageData.maskConfiguredArea[index] }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- OSD叠加 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_OSD') }}</div>
                            <!-- 显示OSD -->
                            <el-form-item>
                                <el-checkbox
                                    v-model="vsdData.countOSD.switch"
                                    :label="Translate('IDCS_STATIST_OSD')"
                                    @change="setEnableOSD"
                                />
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_HUMAN_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdPersonName"
                                    :disabled="!vsdData.countOSD.supportOsdPersonName"
                                />
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_VEHICLE_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdCarName"
                                    :disabled="!vsdData.countOSD.supportOsdCarName"
                                />
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_BIKE_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdBikeName"
                                    :disabled="!vsdData.countOSD.supportBikeName"
                                />
                            </el-form-item>
                            <!-- 重置信息 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_RESET_INFO') }}</div>
                            <!-- 自动重置 -->
                            <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                                <el-checkbox
                                    v-model="pageData.autoReset"
                                    :label="Translate('IDCS_ENABLE')"
                                    @change="autoResetChange"
                                />
                            </el-form-item>
                            <!-- 模式 -->
                            <el-form-item :label="Translate('IDCS_MODE')">
                                <el-select
                                    v-model="pageData.timeType"
                                    :disabled="!pageData.autoReset"
                                    @change="timeTypeChange"
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
                                <el-row>
                                    <el-col
                                        :span="11"
                                        class="timeSet"
                                    >
                                        <el-select
                                            v-if="pageData.timeType === 'week'"
                                            v-model="vsdData.countPeriod['week'].date"
                                            :disabled="!pageData.autoReset"
                                        >
                                            <el-option
                                                v-for="item in pageData.weekOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                        <el-select
                                            v-if="pageData.timeType === 'month'"
                                            v-model="vsdData.countPeriod['month'].date"
                                            :disabled="!pageData.autoReset"
                                        >
                                            <el-option
                                                v-for="item in pageData.monthOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </el-col>
                                    <el-col
                                        :span="11"
                                        :style="{
                                            marginLeft: pageData.timeType === 'day' ? '-33px' : '0',
                                        }"
                                    >
                                        <el-time-picker
                                            v-if="pageData.timeType === 'day'"
                                            v-model="vsdData.countPeriod['day']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            value-format="HH:mm:ss"
                                        />
                                        <el-time-picker
                                            v-if="pageData.timeType === 'week'"
                                            v-model="vsdData.countPeriod['week']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            value-format="HH:mm:ss"
                                        />
                                        <el-time-picker
                                            v-if="pageData.timeType === 'month'"
                                            v-model="vsdData.countPeriod['month']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            value-format="HH:mm:ss"
                                        />
                                    </el-col>
                                </el-row>
                            </el-form-item>
                            <!-- 手动重置 -->
                            <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                <el-button @click="manualResetData">
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 检测目标 -->
                <el-tab-pane
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="detection"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left"></div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :style="{
                                '--form-label-width': '200px',
                                '--form-input-width': '215px',
                            }"
                            inline-message
                        >
                            <!-- 检测目标 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_DETECTION_TARGET') }}</div>
                            <!-- 人灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <el-checkbox
                                        v-model="vsdData.objectFilter.person"
                                        :label="Translate('IDCS_DETECTION_PERSON')"
                                    />
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.personSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.personSensitivity }}</span>
                                </template>
                            </el-form-item>
                            <!-- 汽车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <el-checkbox
                                        v-model="vsdData.objectFilter.car"
                                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                                    />
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.carSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.carSensitivity }}</span>
                                </template>
                            </el-form-item>
                            <!-- 摩托车灵敏度 -->
                            <!-- 热成像通道不显示非机动车配置 -->
                            <el-form-item v-if="prop.chlData.accessType === '0'">
                                <template #label>
                                    <el-checkbox
                                        v-model="vsdData.objectFilter.motorcycle"
                                        :label="Translate('IDCS_NON_VEHICLE')"
                                    />
                                </template>
                                <template #default>
                                    <span class="slider-text">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.motorSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.motorSensitivity }}</span>
                                </template>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 图片叠加 -->
                <el-tab-pane
                    :label="Translate('IDCS_IMAGE_OSD')"
                    name="image"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left"></div>
                    <div class="base-ai-param-box-right">
                        <el-form
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            inline-message
                        >
                            <!-- 图片叠加 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_IMAGE_OSD') }}</div>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select
                                    v-model="vsdData.osdType"
                                    @change="osdTypeChange"
                                >
                                    <el-option
                                        v-for="item in pageData.imgOsdTypeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 全选 -->
                            <el-form-item>
                                <el-checkbox
                                    v-model="pageData.osdCheckAll"
                                    :label="Translate('IDCS_ALL')"
                                    @change="checkAllOsdType"
                                />
                                <el-checkbox-group
                                    v-model="osdCfgCheckedList"
                                    class="osd_checkbox_group"
                                    @change="osdCfgCheckListChange"
                                >
                                    <el-checkbox
                                        v-for="item in pageData.osdCfgList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-checkbox-group>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <!-- 高级设置 -->
            <el-popover
                v-model:visible="advancedVisible"
                width="400"
                popper-class="no-padding popper"
            >
                <template #reference>
                    <div class="more_wrap">
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
                        v-model="pageData.isSaveSourcePicChecked"
                        :disabled="pageData.isSavePicDisabled"
                        :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                        @change="saveSourcePicChange"
                    />
                    <el-checkbox
                        v-model="pageData.isSaveTargetPicChecked"
                        :disabled="pageData.isSavePicDisabled"
                        :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                        @change="saveTargetPicChange"
                    />
                    <el-form
                        :style="{
                            '--form-label-width': '150px',
                            '--form-input-width': '170px',
                        }"
                        inline-message
                    >
                        <!-- 识别模式 -->
                        <div class="base-ai-subheading">{{ Translate('IDCS_RECOGNITION_MODE') }}</div>
                        <!-- 识别模式 -->
                        <el-form-item :label="Translate('IDCS_RECOGNITION_MODE')">
                            <el-select
                                v-model="vsdData.algoChkModel"
                                :disabled="pageData.algoModelDisabled"
                                @change="algoModelChange"
                            >
                                <el-option
                                    v-for="item in pageData.algoModelList"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </el-form-item>
                        <!-- 时间间隔（秒） -->
                        <el-form-item
                            v-show="pageData.algoHoldTimeShow"
                            :label="Translate('IDCS_INTERVAL_TIME')"
                        >
                            <BaseNumberInput
                                v-model="vsdData.intervalCheck"
                                :disabled="pageData.algoModelDisabled"
                                :min="vsdData.intervalCheckMin"
                                :max="vsdData.intervalCheckMax"
                                :value-on-clear="!pageData.algoModelDisabled ? 'min' : null"
                            />
                        </el-form-item>
                    </el-form>
                    <div class="base-btn-box">
                        <el-button @click="advancedVisible = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                    </div>
                </div>
            </el-popover>
        </div>
        <div class="base-btn-box fixed">
            <el-button :disabled="pageData.applyDisabled">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="pageData.scheduleManagPopOpen = false"
        />
    </div>
</template>

<script lang="ts" src="./VideoStructure.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
// 高级设置
.more_wrap {
    position: absolute;
    right: 20px;
    top: 48px;
    cursor: pointer;
}

.slider-text {
    margin-right: 15px;
}

.advanced_box {
    background-color: var(--ai-advance-bg);
    padding: 10px;

    .el-checkbox {
        display: block;
    }
}

.timeSet .el-select {
    margin-right: 30px;
}

.osd_checkbox_group {
    width: 600px;
    margin-left: 0 !important;
    :deep(.el-checkbox) {
        width: 200px;
        margin: 15px 0 !important;
        overflow: hidden;
    }
}

.osd_show_list {
    width: 400px;
    height: 120px;
    background-color: var(--color-black);
    p {
        display: inline-block;
        width: 90px;
        height: 30px;
        border: 2px var(--color-white) dashed;
        color: var(--color-white);
        line-height: 25px;
        text-align: center;
        box-sizing: border-box;
        margin: 5px;
        margin-bottom: 1px;
        padding: 1px;
        font-size: 12px;
        overflow: hidden;
    }
}
.detection_span {
    width: 30px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border: 1px solid var(--input-border);
}
.configured_area {
    :deep(.el-radio-button__inner) {
        border: 1px solid --primary !important;
        color: --primary;
    }
}
</style>
