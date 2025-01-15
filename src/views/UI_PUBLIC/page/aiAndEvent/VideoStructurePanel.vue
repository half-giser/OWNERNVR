<!--
 * @Description: AI 事件——更多——视频结构化
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-20 10:15:52
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
            <div class="base-ai-param-box-left fixed">
                <div
                    v-if="pageData.tab === 'image'"
                    class="osd_show_list"
                >
                    <p
                        v-for="(value, index) in osdShowList"
                        :key="index"
                    >
                        {{ value }}
                    </p>
                </div>
                <div
                    v-if="pageData.tab !== 'image'"
                    class="player"
                >
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <div
                    v-else
                    class="player"
                >
                    <BaseVideoPlayer />
                </div>
                <div v-show="pageData.tab === 'param'">
                    <div class="base-btn-box space-between">
                        <el-checkbox
                            v-model="pageData.isShowAllArea"
                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                            @change="showAllArea"
                        />
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                        </div>
                    </div>
                    <span class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
                </div>
            </div>
            <div class="base-btn-box flex-start padding collapse">
                <el-checkbox
                    v-model="formData.enabledSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <div class="base-ai-form">
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
                                <!-- 排程 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                <!-- 排程配置 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <el-select-v2
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                    />
                                    <el-button @click="pageData.isSchedulePop = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                                </el-form-item>
                                <!-- 区域 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_AREA') }}</div>
                                <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                    <el-radio-group
                                        v-model="pageData.detectArea"
                                        class="small-btn"
                                        @change="changeDetectArea"
                                    >
                                        <el-radio-button
                                            v-for="(_value, _name, index) in formData.detectAreaInfo"
                                            :key="index"
                                            :label="index + 1"
                                            :value="index"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                    <el-radio-group
                                        v-model="pageData.maskArea"
                                        class="small-btn"
                                        @change="changeMaskArea"
                                    >
                                        <el-radio-button
                                            v-for="(_value, _name, index) in formData.maskAreaInfo"
                                            :key="index"
                                            :label="index + 1"
                                            :value="index"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <!-- OSD叠加 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_OSD') }}</div>
                                <!-- 显示OSD -->
                                <el-form-item>
                                    <el-checkbox
                                        v-model="formData.countOSD.switch"
                                        :label="Translate('IDCS_STATIST_OSD')"
                                        :disabled="formData.countOSD.supportCountOSD"
                                        @change="setEnableOSD"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_HUMAN_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdPersonName"
                                        :disabled="!formData.countOSD.supportOsdPersonName"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_VEHICLE_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdCarName"
                                        :disabled="!formData.countOSD.supportOsdCarName"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_BIKE_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdBikeName"
                                        :disabled="!formData.countOSD.supportBikeName"
                                    />
                                </el-form-item>
                                <!-- 重置信息 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_RESET_INFO') }}</div>
                                <!-- 自动重置 -->
                                <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                                    <el-checkbox
                                        v-model="pageData.autoReset"
                                        :label="Translate('IDCS_ENABLE')"
                                        @change="changeAutoReset"
                                    />
                                </el-form-item>
                                <!-- 模式 -->
                                <el-form-item :label="Translate('IDCS_MODE')">
                                    <el-select-v2
                                        v-model="pageData.timeType"
                                        :disabled="!pageData.autoReset"
                                        :options="pageData.countCycleTypeList"
                                        @change="changeTimeType"
                                    />
                                </el-form-item>
                                <!-- 时间 -->
                                <el-form-item
                                    :label="Translate('IDCS_TIME')"
                                    :style="{
                                        '--form-input-width': '102.5px',
                                    }"
                                >
                                    <el-select-v2
                                        v-if="pageData.timeType === 'week'"
                                        v-model="formData.countPeriod.week.date"
                                        :options="pageData.weekOption"
                                        :disabled="!pageData.autoReset"
                                    />
                                    <el-select-v2
                                        v-if="pageData.timeType === 'month'"
                                        v-model="formData.countPeriod.month.date"
                                        :options="pageData.monthOption"
                                        :disabled="!pageData.autoReset"
                                    />
                                    <el-time-picker
                                        v-if="pageData.timeType === 'day'"
                                        v-model="formData.countPeriod.day.dateTime"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="pageData.timeType === 'week'"
                                        v-model="formData.countPeriod.week.dateTime"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
                                    />
                                    <el-time-picker
                                        v-if="pageData.timeType === 'month'"
                                        v-model="formData.countPeriod.month.dateTime"
                                        :disabled="!pageData.autoReset"
                                        value-format="HH:mm:ss"
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
                            >
                                <!-- 检测目标 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_DETECTION_TARGET') }}</div>
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
                                <!-- 热成像通道不显示非机动车配置 -->
                                <el-form-item v-if="chlData.accessType === '0'">
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
                            >
                                <!-- 图片叠加 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_IMAGE_OSD') }}</div>
                                <!-- 类型 -->
                                <el-form-item :label="Translate('IDCS_TYPE')">
                                    <el-select-v2
                                        v-model="formData.osdType"
                                        :options="pageData.imgOsdTypeList"
                                    />
                                </el-form-item>
                                <!-- 全选 -->
                                <el-form-item>
                                    <el-checkbox
                                        :model-value="isOsdCheckedAll"
                                        :label="Translate('IDCS_ALL')"
                                        @update:model-value="toggleAllOsd"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <el-checkbox-group
                                        :model-value="osdCheckedList"
                                        class="osd_checkbox_group"
                                        @update:model-value="changeOsdCfg"
                                    >
                                        <el-checkbox
                                            v-for="item in osdCfgList"
                                            :key="item.index"
                                            :label="item.label"
                                            :value="item.index"
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
                    popper-class="no-padding keep-ocx"
                >
                    <template #reference>
                        <div class="base-ai-advance-btn">
                            <span>{{ Translate('IDCS_ADVANCED') }}</span>
                            <BaseImgSprite
                                file="arrow"
                                :index="0"
                                :chunk="4"
                            />
                        </div>
                    </template>
                    <div class="base-ai-advance-box">
                        <el-form
                            :style="{
                                '--form-label-width': '150px',
                                '--form-input-width': '170px',
                            }"
                        >
                            <div class="base-ai-subheading">
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveSourcePicture"
                                    :disabled="pageData.isSavePicDisabled"
                                    :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                                />
                                <el-checkbox
                                    v-model="formData.saveTargetPicture"
                                    :disabled="pageData.isSavePicDisabled"
                                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                />
                            </el-form-item>
                            <!-- 识别模式 -->
                            <div class="base-ai-subheading">{{ Translate('IDCS_RECOGNITION_MODE') }}</div>
                            <!-- 识别模式 -->
                            <el-form-item :label="Translate('IDCS_RECOGNITION_MODE')">
                                <el-select-v2
                                    v-model="formData.algoChkModel"
                                    :disabled="!formData.algoChkModel"
                                    :options="pageData.algoModelList"
                                />
                            </el-form-item>
                            <!-- 时间间隔（秒） -->
                            <el-form-item
                                v-show="formData.algoChkModel === 'inter_model'"
                                :label="Translate('IDCS_INTERVAL_TIME')"
                            >
                                <BaseNumberInput
                                    v-model="formData.intervalCheck"
                                    :disabled="formData.algoChkModel !== 'inter_model'"
                                    :min="formData.intervalCheckMin"
                                    :max="formData.intervalCheckMax"
                                    :value-on-clear="formData.algoChkModel === 'inter_model' ? 'min' : null"
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
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="applyData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./VideoStructurePanel.v.ts"></script>

<style lang="scss" scoped>
.timeSet .el-select {
    margin-right: 30px;
}

.osd_checkbox_group {
    width: 600px;
    margin-left: 0 !important;

    :deep(.el-checkbox) {
        width: 200px;
        margin: 5px 0 !important;
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
</style>
