<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-08 17:49:20
 * @Description: 徘徊检测
-->
<template>
    <div>
        <AlarmBaseErrorPanel v-if="pageData.reqFail" />
        <div v-if="pageData.tab">
            <!-- nvr/ipc检测开启及ai按钮 -->
            <div class="base-btn-box space-between padding collapse">
                <el-checkbox
                    v-model="formData.detectionEnable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="pageData.tab === 'param'"
                class="base-ai-param-box-left fixed"
            >
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="handlePlayerReady"
                        @message="notify"
                    />
                </div>
                <div v-show="pageData.tab === 'param'">
                    <div class="base-btn-box space-between">
                        <div>
                            <el-checkbox
                                v-show="formData.boundaryInfo.length > 1"
                                v-model="pageData.isShowAllArea"
                                :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                @change="toggleShowAllArea"
                            />
                        </div>
                        <div>
                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                            <el-button
                                v-show="formData.boundaryInfo.length > 1"
                                @click="clearAllArea"
                            >
                                {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                            </el-button>
                        </div>
                    </div>
                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(maxCount) }}</div>
                </div>
            </div>
            <div class="base-ai-form">
                <!-- 三种功能 -->
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
                            <div class="base-ai-param-box-right">
                                <el-form v-title>
                                    <!-- 排程 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="pageData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                            @change="watchEdit.disabled.value = false"
                                        />
                                    </el-form-item>
                                    <!-- 警戒区域 -->
                                    <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                        <el-radio-group
                                            v-model="pageData.warnAreaIndex"
                                            class="small-btn"
                                            @change="changeWarnArea"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in formData.boundaryInfo"
                                                :key="index"
                                                :value="index"
                                                :label="index + 1"
                                                :class="{
                                                    checked: pageData.warnAreaChecked.includes(index),
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
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.width"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.height"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].minRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('minTextH')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                            </el-form-item>
                                            <el-form-item :label="Translate('IDCS_MAX')">
                                                <span class="spanWidth">{{ Translate('IDCS_WIDTH') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.width"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
                                                    class="targetInput"
                                                    @change="showDisplayRange"
                                                    @blur="checkMinMaxRange('maxTextW')"
                                                />
                                                <span class="percentLabel">{{ Translate('%') }}</span>
                                                <span class="spanWidth">{{ Translate('IDCS_HEIGHT') }}</span>
                                                <BaseNumberInput
                                                    v-if="formData.boundaryInfo.length"
                                                    v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.height"
                                                    :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.min"
                                                    :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter[formData.detectTarget].maxRegionInfo.max"
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
                                            <div class="base-ai-subheading">
                                                {{ Translate('IDCS_DETECTION_TARGET') }}
                                            </div>
                                            <!-- 人灵敏度 -->
                                            <el-form-item v-if="showPersonSentity">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_PERSON')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.person.sensitivity.max"
                                                    />
                                                </template>
                                            </el-form-item>
                                            <!-- 汽车灵敏度 -->
                                            <el-form-item v-if="showCarSentity">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.enable"
                                                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.car.sensitivity.max"
                                                    />
                                                </template>
                                            </el-form-item>
                                            <!-- 摩托车灵敏度 -->
                                            <el-form-item v-if="showMotorSentity">
                                                <template #label>
                                                    <el-checkbox
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.enable"
                                                        :label="Translate('IDCS_NON_VEHICLE')"
                                                    />
                                                </template>
                                                <template #default>
                                                    <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                                    <BaseSliderInput
                                                        v-if="formData.boundaryInfo.length"
                                                        v-model="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.value"
                                                        :min="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.min"
                                                        :max="formData.boundaryInfo[pageData.warnAreaIndex].objectFilter.motor.sensitivity.max"
                                                    />
                                                </template>
                                            </el-form-item>
                                        </div>
                                    </div>
                                </el-form>
                            </div>
                        </div>
                    </el-tab-pane>
                    <!-- 图表 -->
                    <el-tab-pane
                        :label="Translate('IDCS_CHART')"
                        name="chart"
                    >
                        <div class="base-ai-param-box">
                            <div class="heatMapChart_left">
                                <div class="heatMapArea">
                                    <div
                                        v-if="!pageData.imgOrigBase64"
                                        class="heatMapArea-nodata"
                                    >
                                        <BaseImgSprite
                                            file="heatMap_chart"
                                            :index="0"
                                            :chunk="1"
                                        />
                                    </div>
                                    <div v-else>
                                        <img
                                            :src="pageData.imgOrigBase64"
                                            class=""
                                        />
                                        <BaseHeatMapChart
                                            ref="heatMapRef"
                                            :data="pageData.heatMapChartData"
                                            :min="0"
                                            :max="pageData.renderLevel"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-show="pageData.imgOrigBase64"
                                    class="legend"
                                >
                                    <div class="legend-item">
                                        <div class="legend-left"></div>
                                        <BaseSliderInput
                                            v-model="pageData.renderLevel"
                                            :min="1"
                                            :max="10000"
                                        />
                                    </div>
                                    <div class="legend-item">
                                        <span class="legend-left">0</span>
                                        <div class="legend-gradient"></div>
                                        <span class="legend-right">{{ pageData.renderLevel }}</span>
                                    </div>
                                </div>
                            </div>
                            <el-form>
                                <!-- 搜索条件 -->
                                <div class="base-ai-subheading">{{ Translate('IDCS_SEARCH') }}</div>
                                <el-form-item :label="Translate('IDCS_START_TIME')">
                                    <BaseDatePicker
                                        v-model="pageData.startTime"
                                        type="datetime"
                                        :placeholder="Translate('IDCS_START_TIME')"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_END_TIME')">
                                    <BaseDatePicker
                                        v-model="pageData.endTime"
                                        type="datetime"
                                        :placeholder="Translate('IDCS_END_TIME')"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <el-radio-group
                                        v-model="pageData.searchTarget"
                                        class="radio-group"
                                    >
                                        <el-radio
                                            v-if="showPersonSentity"
                                            value="person"
                                            :label="Translate('IDCS_DETECTION_PERSON')"
                                        />
                                        <el-radio
                                            v-if="showCarSentity"
                                            value="car"
                                            :label="Translate('IDCS_DETECTION_VEHICLE')"
                                        />
                                        <el-radio
                                            v-if="showMotorSentity"
                                            value="bike"
                                            :label="Translate('IDCS_NON_VEHICLE')"
                                        />
                                    </el-radio-group>
                                </el-form-item>
                                <div class="base-btn-box">
                                    <el-button @click="handleStatics">{{ Translate('IDCS_STATISTICS') }}</el-button>
                                    <el-button
                                        :disabled="!pageData.imgOrigBase64"
                                        @click="handleExport"
                                    >
                                        {{ Translate('IDCS_EXPORT') }}
                                    </el-button>
                                </div>
                            </el-form>
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
                <BasePopover
                    v-model:visible="pageData.moreDropDown"
                    width="300"
                    popper-class="no-padding"
                    :popper-options="pageData.poppeOptions"
                >
                    <template #reference>
                        <div
                            v-show="formData.pictureAvailable"
                            class="base-ai-advance-btn"
                        >
                            <span>{{ Translate('IDCS_ADVANCED') }}</span>
                            <BaseImgSprite
                                file="arrow"
                                :chunk="4"
                            />
                        </div>
                    </template>
                    <div class="base-ai-advance-box">
                        <el-form>
                            <div class="base-ai-subheading">
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveTargetPicture"
                                    :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                                />
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox
                                    v-model="formData.saveSourcePicture"
                                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                />
                            </el-form-item>
                            <div class="base-btn-box">
                                <el-button @click="pageData.moreDropDown = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </el-form>
                    </div>
                </BasePopover>
            </div>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./HeatMapPanel.v.ts"></script>

<style lang="scss" scoped>
.heatMapChart_left {
    width: 700px;
    padding: 0 30px 10px 20px;
}

.heatMapArea {
    width: 700px;
    height: 450px;
    position: relative;
    border: 1px solid var(--content-border);
    overflow: hidden;

    img {
        width: 700px;
        height: 450px;
        object-fit: fill;

        &[src=''] {
            opacity: 0;
        }
    }

    &-nodata {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: var(--main-bg);
    }
}

.legend {
    width: 223px;
    height: auto;
    padding: 10px;
    border: 1px solid var(--content-border);
    margin-top: 30px;
    font-size: 14px;

    &-left {
        width: 10px;
        flex-shrink: 0;
    }

    &-right {
        width: 50px;
        flex-shrink: 0;
        text-align: right;
    }

    &-item {
        display: flex;
        justify-content: space-between;
    }

    &-gradient {
        width: 100%;
        height: 15px;
        // 此值为heatmap插件的渐变默认值
        background: linear-gradient(90deg, #00f 25%, #0f0 55%, yellow 85%, #f00 100%) no-repeat;
    }
}
</style>
