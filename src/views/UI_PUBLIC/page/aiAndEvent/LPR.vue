<!--
 * @Description: AI 事件——车牌识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-09 09:56:14
-->
<template>
    <!-- 通道名称及选择器 -->
    <el-form
        class="stripe"
        :style="{
            '--form-input-width': '430px',
        }"
        inline-message
    >
        <el-form-item
            :label="Translate('IDCS_CHANNEL_NAME')"
            label-width="108"
        >
            <el-select
                v-model="pageData.curChl"
                class="base-ai-chl-select"
                popper-class="base-ai-chl-option"
                @change="chlChange"
            >
                <el-option
                    v-for="item in pageData.vehicleChlList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </el-form-item>
    </el-form>
    <el-tabs
        v-model="pageData.vehicleTab"
        class="base-ai-menu-tabs"
        @tab-change="vehicleTabChange"
    >
        <div
            v-if="pageData.notChlSupport"
            class="base-ai-not-support-box"
        >
            {{ pageData.notSupportTip }}
        </div>
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="vehicleDetection"
            :disabled="pageData.vehicleDetectionDisabled"
        >
            <div>
                <div
                    class="base-btn-box padding collapse"
                    span="start"
                >
                    <el-checkbox
                        v-model="vehicleDetectionData.enabledSwitch"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </div>
                <div :style="{ position: 'relative' }">
                    <el-tabs
                        v-model="detectionPageData.detectionTab"
                        class="base-ai-tabs"
                    >
                        <!-- 参数设置 -->
                        <el-tab-pane
                            :label="Translate('IDCS_PARAM_SETTING')"
                            name="param"
                            class="base-ai-param-box"
                        >
                            <div class="base-ai-param-box-left">
                                <div class="player">
                                    <BaseVideoPlayer
                                        ref="playerRef"
                                        type="live"
                                        @onready="handlePlayerReady"
                                    />
                                </div>
                                <div>
                                    <div class="base-btn-box">
                                        <el-checkbox
                                            v-model="detectionPageData.isShowAllArea"
                                            :style="{ flex: '1' }"
                                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                            @change="showAllArea"
                                        />
                                        <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                        <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                                    </div>
                                    <span class="base-ai-tip">{{ detectionPageData.drawAreaTip }}</span>
                                </div>
                            </div>
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
                                        <el-select v-model="vehicleDetectionData.schedule">
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
                                            v-model="detectionPageData.regionArea"
                                            class="small-btn"
                                            @change="regionAreaChange"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in vehicleDetectionData.regionInfo"
                                                :key="index"
                                                :label="index + 1"
                                                :value="index"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                        <el-radio-group
                                            v-model="detectionPageData.maskArea"
                                            class="small-btn"
                                            @change="maskAreaChange"
                                        >
                                            <el-radio-button
                                                v-for="(_value, _name, index) in vehicleDetectionData.maskAreaInfo"
                                                :key="index"
                                                :label="index + 1"
                                                :value="index"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 规则 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                    <el-form-item
                                        :label="Translate('IDCS_PLATE_DETECTION_AREA')"
                                        :style="{
                                            '--form-input-width': '130px',
                                        }"
                                    >
                                        <el-select
                                            v-model="detectionPageData.continentValue"
                                            :disabled="detectionPageData.continentDisabled"
                                            @change="refreshArea"
                                        >
                                            <el-option
                                                v-for="item in detectionPageData.continentOption"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            />
                                        </el-select>
                                        <el-select
                                            v-model="vehicleDetectionData.plateSupportArea"
                                            :disabled="detectionPageData.plateAreaDisabled"
                                        >
                                            <el-option
                                                v-for="item in detectionPageData.plateAreaOption"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_LICENSE_PLATE_EXPOSURE')">
                                        <el-checkbox v-model="vehicleDetectionData.exposureChecked">{{ '  ' }}</el-checkbox>
                                        <el-slider
                                            v-model="vehicleDetectionData.exposureValue"
                                            :show-tooltip="false"
                                            show-input
                                            :min="detectionPageData.exposureMin"
                                            :max="detectionPageData.exposureMax"
                                            :disabled="!vehicleDetectionData.exposureChecked"
                                        />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="vehicleDetectionData.plateAbsenceCheceked"
                                            :disabled="detectionPageData.plateAbsenceDisabled"
                                            :label="Translate('IDCS_SNAP_NO_PLATE_VIHICLE')"
                                        />
                                    </el-form-item>
                                    <!-- 车牌大小(范围) -->
                                    <div class="base-ai-subheading">{{ detectionPageData.plateSizeRangeTitle }}</div>
                                    <el-form-item :label="Translate('IDCS_MIN')">
                                        <BaseNumberInput
                                            v-model="vehicleDetectionData.plateSize.minWidth"
                                            :min="vehicleDetectionData.plateSize.min"
                                            :max="vehicleDetectionData.plateSize.max"
                                            @blur="minVehicleBlur"
                                        />
                                        <el-text>%</el-text>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_MAX')">
                                        <BaseNumberInput
                                            v-model="vehicleDetectionData.plateSize.maxWidth"
                                            :min="vehicleDetectionData.plateSize.min"
                                            :max="vehicleDetectionData.plateSize.max"
                                            @blur="maxVehicleBlur"
                                        />
                                        <el-text>%</el-text>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="detectionPageData.isDispalyRangeChecked"
                                            :label="Translate('IDCS_DISPLAY_RANGE_BOX')"
                                            @change="showDisplayRange"
                                        />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 高级设置 -->
                    <el-popover
                        v-model:visible="advancedVisible"
                        width="300"
                        popper-class="no-padding popper"
                    >
                        <template #reference>
                            <div
                                v-show="detectionPageData.isShowDirection"
                                class="more_wrap"
                            >
                                <span>{{ Translate('IDCS_ADVANCED') }}</span>
                                <BaseImgSprite
                                    file="arrow"
                                    :index="0"
                                    :chunk="4"
                                />
                            </div>
                        </template>
                        <div class="advanced_box">
                            <el-form
                                class="stripe"
                                :style="{
                                    '--form-input-width': '170px',
                                }"
                                label-width="80"
                                inline-message
                            >
                                <el-form-item
                                    :label="Translate('IDCS_RECOGNITION_MODE')"
                                    :style="{ padding: '20px 0' }"
                                >
                                    <el-select v-model="vehicleDetectionData.direction">
                                        <el-option
                                            v-for="item in detectionPageData.directionOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
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
                        :disabled="detectionPageData.applyDisabled"
                        @click="applyVehicleDetectionData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 识别 -->
        <el-tab-pane
            :label="Translate('IDCS_RECOGNITION')"
            name="vehicleCompare"
            :disabled="pageData.vehicleCompareDisabled"
        >
            <div>
                <el-form
                    :style="{
                        '--form-label-width': 'auto',
                    }"
                >
                    <el-form-item :label="Translate('IDCS_ENABLE')">
                        <el-checkbox
                            v-model="vehicleCompareData.hitEnable"
                            :label="Translate('IDCS_SUCCESSFUL_RECOGNITION')"
                        />
                        <el-checkbox
                            v-model="vehicleCompareData.notHitEnable"
                            :label="Translate('IDCS_STRANGE_PLATE')"
                        />
                    </el-form-item>
                </el-form>
                <div :style="{ position: 'relative' }">
                    <el-tabs
                        v-model="comparePageData.compareTab"
                        class="base-ai-tabs"
                        @tab-change="compareTabChange"
                    >
                        <el-tab-pane
                            v-for="(item, index) in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <SuccessfulRecognition
                                    :curr-task-data="vehicleCompareData.task[index]"
                                    :group-data="vehicleGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    @change="vehicleCompareData.task[index] = $event"
                                />
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 增加/删除任务 -->
                    <div class="taskBtn">
                        <span @click="addTask">+</span>
                        <span
                            :class="{ removeDisabled: comparePageData.removeDisabled }"
                            @click="removeTask"
                            >-</span
                        >
                    </div>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="comparePageData.applyDisabled"
                        @click="applyVehicleCompareData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 车牌库跳转 -->
        <el-tab-pane
            name="vehicleLibrary"
            :disabled="!supportPlateMatch"
        >
            <template #label>
                <span :title="Translate('IDCS_VEHICLE_DATABASE')">{{ Translate('IDCS_VEHICLE_DATABASE') }}</span>
                <BaseImgSprite
                    class="link-icon"
                    file="jumpto"
                />
            </template>
        </el-tab-pane>
    </el-tabs>
    <BaseNotification v-model:notifications="pageData.notification" />
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="pageData.scheduleManagPopOpen = false"
    />
</template>

<script lang="ts" src="./LPR.v.ts"></script>

<style lang="scss" scoped>
// 高级设置
.more_wrap {
    position: absolute;
    right: 20px;
    top: 15px;
    cursor: pointer;
    z-index: 1;
}

.advanced_box {
    background-color: var(--ai-advance-bg);
    padding: 10px;

    .el-checkbox {
        display: block;
    }
}

.taskBtn {
    position: absolute;
    right: 20px;
    top: 3px;

    span {
        font-size: 20px;
        padding: 0 5px;
        cursor: pointer;
    }

    .removeDisabled {
        color: var(--main-text-light);
    }
}
</style>
