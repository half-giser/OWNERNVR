<!--
 * @Description: AI 事件——车牌识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-09 09:56:14
-->
<template>
    <AlarmBaseChannelSelector
        v-model="pageData.curChl"
        :list="pageData.chlList"
        @change="changeChl"
    />
    <el-tabs
        :key="pageData.curChl"
        v-model="pageData.tab"
        class="base-ai-menu-tabs"
        @tab-change="changeTab"
    >
        <div
            v-if="pageData.notSupport"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_VEHICLE_EVENT_UNSUPORT_TIP') }}
        </div>
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="vehicleDetection"
            :disabled="pageData.notSupport"
        >
            <div>
                <div class="base-btn-box flex-start padding collapse">
                    <el-checkbox
                        v-model="detectionFormData.enabledSwitch"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </div>
                <div class="base-ai-form">
                    <el-tabs
                        v-model="detectionPageData.tab"
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
                                        @ready="handlePlayerReady"
                                        @message="notify"
                                    />
                                </div>
                                <div>
                                    <div class="base-btn-box space-between">
                                        <el-checkbox
                                            v-model="detectionPageData.isShowAllArea"
                                            :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                            @change="showAllArea"
                                        />
                                        <div>
                                            <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                            <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                                        </div>
                                    </div>
                                    <span class="base-ai-tip">{{ detectionPageData.drawAreaTip }}</span>
                                </div>
                            </div>
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
                                            v-model="detectionFormData.schedule"
                                            :options="pageData.scheduleList"
                                        />
                                        <el-button @click="pageData.isSchedulePop = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                                    </el-form-item>
                                    <!-- 区域 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCS_AREA') }}</div>
                                    <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                        <el-radio-group
                                            v-model="detectionPageData.regionArea"
                                            class="small-btn"
                                            @change="changeRegionArea"
                                        >
                                            <el-radio-button
                                                v-for="(_item, index) in detectionFormData.regionInfo"
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
                                            @change="changeMaskArea"
                                        >
                                            <el-radio-button
                                                v-for="(_value, _name, index) in detectionFormData.maskAreaInfo"
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
                                            '--form-input-width': '180px',
                                        }"
                                    >
                                        <el-select-v2
                                            v-model="detectionPageData.continentValue"
                                            :disabled="!detectionPageData.continentOption.length"
                                            :options="detectionPageData.continentOption"
                                            @change="changeContinent"
                                        />
                                        <el-select-v2
                                            v-model="detectionFormData.plateSupportArea"
                                            :disabled="!plateAreaOption.length"
                                            :options="plateAreaOption"
                                        />
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_LICENSE_PLATE_EXPOSURE')">
                                        <el-checkbox
                                            v-model="detectionFormData.exposureSwitch"
                                            label=" "
                                            :disabled="detectionPageData.exposureDisabled"
                                        />
                                        <el-slider
                                            v-model="detectionFormData.exposureValue"
                                            :show-tooltip="false"
                                            show-input
                                            :min="detectionFormData.exposureMin"
                                            :max="detectionFormData.exposureMax"
                                            :disabled="!detectionFormData.exposureSwitch"
                                        />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="detectionFormData.capturePlateAbsenceVehicle"
                                            :disabled="detectionPageData.capturePlateAbsenceVehicleDisabled"
                                            :label="Translate('IDCS_SNAP_NO_PLATE_VIHICLE')"
                                        />
                                    </el-form-item>
                                    <!-- 车牌大小(范围) -->
                                    <div class="base-ai-subheading">{{ detectionPageData.plateSizeRangeTitle }}</div>
                                    <el-form-item :label="Translate('IDCS_MIN')">
                                        <BaseNumberInput
                                            v-model="detectionFormData.plateSize.minWidth"
                                            :min="detectionFormData.plateSize.min"
                                            :max="Math.min(detectionFormData.plateSize.max, detectionFormData.plateSize.maxWidth)"
                                            @change="blurMinWidth"
                                        />
                                        <el-text>%</el-text>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_MAX')">
                                        <BaseNumberInput
                                            v-model="detectionFormData.plateSize.maxWidth"
                                            :min="Math.max(detectionFormData.plateSize.min, detectionFormData.plateSize.minWidth)"
                                            :max="detectionFormData.plateSize.max"
                                            @change="blurMaxWidth"
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
                        v-model:visible="detectionPageData.isAdvancePop"
                        width="400"
                        popper-class="no-padding keep-ocx"
                    >
                        <template #reference>
                            <div
                                v-show="detectionPageData.isShowDirection"
                                class="base-ai-advance-btn"
                            >
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
                                class="stripe"
                                :style="{
                                    '--form-input-width': '200px',
                                    '--form-label-width': '150px',
                                }"
                            >
                                <el-form-item :label="Translate('IDCS_RECOGNITION_MODE')">
                                    <el-select-v2
                                        v-model="detectionFormData.direction"
                                        :options="detectionPageData.directionOption"
                                        :persistent="true"
                                    />
                                </el-form-item>
                            </el-form>
                            <div class="base-btn-box">
                                <el-button @click="detectionPageData.isAdvancePop = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </div>
                    </el-popover>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="watchDetection.disabled.value"
                        @click="applyDetectionData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </el-tab-pane>
        <!-- 识别 -->
        <el-tab-pane
            :label="Translate('IDCS_RECOGNITION')"
            name="vehicleCompare"
            :disabled="pageData.notSupport"
        >
            <div>
                <el-form
                    :style="{
                        '--form-label-width': 'auto',
                    }"
                >
                    <el-form-item :label="Translate('IDCS_ENABLE')">
                        <el-checkbox
                            v-model="matchFormData.hitEnable"
                            :label="Translate('IDCS_SUCCESSFUL_RECOGNITION')"
                        />
                        <el-checkbox
                            v-model="matchFormData.notHitEnable"
                            :label="Translate('IDCS_STRANGE_PLATE')"
                        />
                    </el-form-item>
                </el-form>
                <div class="base-ai-form">
                    <el-tabs
                        v-model="matchPageData.tab"
                        class="base-ai-tabs"
                    >
                        <el-tab-pane
                            v-for="(item, index) in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <RecognitionPanel
                                    :curr-task-data="matchFormData.task[index]"
                                    :group-data="groupList"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    @change="matchFormData.task[index] = $event"
                                />
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 增加/删除任务 -->
                    <div class="base-ai-task-btn">
                        <span @click="addTask">+</span>
                        <span
                            :class="{
                                disabled: ['whitelist', 'stranger'].includes(matchPageData.tab),
                            }"
                            @click="removeTask"
                        >
                            -
                        </span>
                    </div>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="watchMatch.disabled.value"
                        @click="applyMatchData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
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
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.isSchedulePop"
        @close="closeSchedulePop"
    />
</template>

<script lang="ts" src="./LPR.v.ts"></script>
