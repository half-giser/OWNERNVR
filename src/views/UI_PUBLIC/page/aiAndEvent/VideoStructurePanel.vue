<!--
 * @Description: AI 事件——更多——视频结构化
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-20 10:15:52
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
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
                    class="player"
                    :class="{
                        resize: pageData.tab === 'image',
                    }"
                >
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <div v-show="pageData.tab === 'param'">
                    <div class="base-btn-box space-between">
                        <el-checkbox
                            v-show="formData.detectAreaInfo.length > 1"
                            v-model="pageData.isShowAllArea"
                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                            @change="showAllArea"
                        />
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-show="formData.detectAreaInfo.length > 1"
                                @click="clearAllArea"
                            >
                                {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                            </el-button>
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
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
                            <el-form v-title>
                                <!-- 排程配置 -->
                                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                    <BaseScheduleSelect
                                        v-model="formData.schedule"
                                        :options="pageData.scheduleList"
                                        @edit="pageData.isSchedulePop = true"
                                    />
                                </el-form-item>
                                <!-- 区域 -->
                                <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                    <el-radio-group
                                        v-model="pageData.maskArea"
                                        class="small-btn"
                                        @change="changeMaskArea"
                                    >
                                        <el-radio-button
                                            v-for="(_value, index) in formData.maskAreaInfo"
                                            :key="index"
                                            :label="index + 1"
                                            :value="index"
                                            :class="{
                                                checked: pageData.maskAreaChecked.includes(index),
                                            }"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                    <el-radio-group
                                        v-model="pageData.detectArea"
                                        class="small-btn"
                                        @change="changeDetectArea"
                                    >
                                        <el-radio-button
                                            v-for="(_value, index) in formData.detectAreaInfo"
                                            :key="index"
                                            :label="index + 1"
                                            :value="index"
                                            :class="{
                                                checked: pageData.detectAreaChecked.includes(index),
                                            }"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <div :class="pageData.objectFilterMode === 'mode3' ? 'rectangleBorder' : ''">
                                    <!-- 目标大小 -->
                                    <div
                                        v-if="formData.detectTargetList.length"
                                        :class="pageData.objectFilterMode === 'mode2' ? 'rectangleBorder' : ''"
                                    >
                                        <div class="base-ai-subheading">
                                            {{ Translate('IDCS_DETECT_TARGET_SIZE') }}
                                        </div>
                                        <!-- 目标 -->
                                        <el-form-item :label="Translate('IDCS_TARGET')">
                                            <BaseSelect
                                                v-model="formData.detectTarget"
                                                :options="formData.detectTargetList"
                                                empty-text=""
                                                @change="showDisplayRange"
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_MIN')">
                                            <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.detectAreaInfo.length"
                                                v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.width"
                                                :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('minTextW')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                            <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.detectAreaInfo.length"
                                                v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.height"
                                                :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('minTextH')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_MAX')">
                                            <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.detectAreaInfo.length"
                                                v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.width"
                                                :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('maxTextW')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>

                                            <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                            <BaseNumberInput
                                                v-if="formData.detectAreaInfo.length"
                                                v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.height"
                                                :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                class="targetInput"
                                                @change="showDisplayRange"
                                                @blur="checkMinMaxRange('maxTextH')"
                                            />
                                            <span class="percentLabel">{{ Translate('%') }}</span>
                                        </el-form-item>
                                        <el-form-item>
                                            <template #label>
                                                <el-checkbox
                                                    v-model="pageData.isShowDisplayRange"
                                                    :label="Translate('IDCS_DISPLAY_RANGE_BOX')"
                                                    @change="toggleDisplayRange"
                                                />
                                            </template>
                                        </el-form-item>
                                    </div>
                                    <!-- 检测目标 -->
                                    <div :class="pageData.objectFilterMode === 'mode5' ? 'rectangleBorder' : ''">
                                        <el-form-item v-if="formData.detectAreaInfo.length && formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.supportCommonSensitivity">
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.commonSensitivity.enable"
                                                    :label="Translate('IDCS_ENABLE')"
                                                />
                                            </template>
                                            <template #default>
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.commonSensitivity.value"
                                                    :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.commonSensitivity.min"
                                                    :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.commonSensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                        <div class="base-ai-subheading">
                                            {{ Translate('IDCS_DETECTION_TARGET') }}
                                        </div>
                                        <!-- 人灵敏度 -->
                                        <el-form-item>
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.person.sensitivity.enable"
                                                    :label="Translate('IDCS_DETECTION_PERSON')"
                                                />
                                            </template>
                                            <template #default>
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.person.sensitivity.value"
                                                    :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.person.sensitivity.min"
                                                    :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.person.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                        <!-- 汽车灵敏度 -->
                                        <el-form-item>
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.car.sensitivity.enable"
                                                    :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                />
                                            </template>
                                            <template #default>
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.car.sensitivity.value"
                                                    :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.car.sensitivity.min"
                                                    :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.car.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                        <!-- 摩托车灵敏度 -->
                                        <el-form-item v-if="chlData.accessType === '0'">
                                            <template #label>
                                                <el-checkbox
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.motor.sensitivity.enable"
                                                    :label="Translate('IDCS_NON_VEHICLE')"
                                                />
                                            </template>
                                            <template #default>
                                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                <BaseSliderInput
                                                    v-if="formData.detectAreaInfo.length"
                                                    v-model="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.motor.sensitivity.value"
                                                    :min="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.motor.sensitivity.min"
                                                    :max="formData.detectAreaInfo[pageData.lastDetectArea].objectFilter.motor.sensitivity.max"
                                                />
                                            </template>
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-form>
                        </div>
                    </el-tab-pane>
                    <!-- OSD -->
                    <el-tab-pane
                        v-if="formData.countOSD.supportCountOSD"
                        :label="Translate('IDCS_OSD')"
                        name="osd"
                        class="base-ai-param-box"
                    >
                        <div class="base-ai-param-box-left"></div>
                        <div class="base-ai-param-box-right">
                            <el-form v-title>
                                <!-- 图片叠加 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_OSD') }}</div>
                                <el-form-item>
                                    <el-checkbox
                                        v-model="formData.countOSD.switch"
                                        :label="Translate('IDCS_STATIST_OSD')"
                                        @change="setEnableOSD"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_HUMAN_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdPersonName"
                                        maxlength="10"
                                        :disabled="!formData.countOSD.supportOsdPersonName"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_VEHICLE_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdCarName"
                                        maxlength="10"
                                        :disabled="!formData.countOSD.supportOsdCarName"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_BIKE_COUNT')">
                                    <el-input
                                        v-model="formData.countOSD.osdBikeName"
                                        maxlength="10"
                                        :disabled="!formData.countOSD.supportBikeName"
                                    />
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
                            <el-form v-title>
                                <!-- 图片叠加 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_IMAGE_OSD') }}</div>
                                <!-- 类型 -->
                                <el-form-item :label="Translate('IDCS_TYPE')">
                                    <BaseSelect
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
                    popper-class="no-padding"
                >
                    <template #reference>
                        <div class="base-ai-advance-btn">
                            <span>{{ Translate('IDCS_ADVANCED') }}</span>
                            <BaseImgSprite
                                file="arrow"
                                :chunk="4"
                            />
                        </div>
                    </template>
                    <div class="base-ai-advance-box">
                        <el-form v-title>
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
                                <BaseSelect
                                    v-model="pageData.timeType"
                                    :disabled="!pageData.autoReset"
                                    :options="pageData.countCycleTypeList"
                                    :teleported="false"
                                    @change="changeTimeType"
                                />
                            </el-form-item>
                            <!-- 时间 -->
                            <el-form-item
                                :label="Translate('IDCS_TIME')"
                                :style="{
                                    '--form-input-width': '121px',
                                }"
                            >
                                <BaseSelect
                                    v-if="pageData.timeType === 'week'"
                                    v-model="formData.countPeriod.week.date"
                                    :options="pageData.weekOption"
                                    :disabled="!pageData.autoReset"
                                    :teleported="false"
                                />
                                <BaseSelect
                                    v-if="pageData.timeType === 'month'"
                                    v-model="formData.countPeriod.month.date"
                                    :options="pageData.monthOption"
                                    :disabled="!pageData.autoReset"
                                    :teleported="false"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'day'"
                                    v-model="formData.countPeriod.day.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'week'"
                                    v-model="formData.countPeriod.week.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                                <BaseTimePicker
                                    v-if="pageData.timeType === 'month'"
                                    v-model="formData.countPeriod.month.dateTime"
                                    :disabled="!pageData.autoReset"
                                />
                            </el-form-item>
                            <!-- 手动重置 -->
                            <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                <el-button @click="resetData">
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                            <div class="base-btn-box">
                                <el-button @click="advancedVisible = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </el-form>
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
        <BaseScheduleManagePop
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
