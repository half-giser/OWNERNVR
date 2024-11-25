<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-28 13:41:57
 * @Description: AI 事件——人脸识别
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
                    v-for="item in pageData.faceChlList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </el-form-item>
    </el-form>
    <el-tabs
        v-model="pageData.faceTab"
        class="base-ai-menu-tabs"
        @tab-change="faceTabChange"
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
            name="faceDetection"
            :disabled="pageData.faceDetectionDisabled"
        >
            <div>
                <div
                    class="base-btn-box padding collapse"
                    span="2"
                >
                    <div>
                        <el-checkbox
                            v-model="faceDetectionData.enabledSwitch"
                            :label="detectionPageData.deviceInfo"
                        />
                    </div>
                    <AlarmBaseResourceData
                        v-if="showAIReourceDetail"
                        :chl-id="pageData.curChl"
                        event="faceDetect"
                        :enable="faceDetectionData.enabledSwitch && !chlList[pageData.curChl].supportVfd"
                        @error="handleAIResourceError"
                        @change="handleAIResourceDel"
                    />
                </div>
                <div>
                    <el-tabs
                        v-model="detectionPageData.detectionTab"
                        class="base-ai-tabs"
                        @tab-change="detectionTabChange"
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
                                <div v-show="detectionPageData.isPlayerBottomShow">
                                    <div class="base-btn-box">
                                        <el-button @click="clearDrawArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    </div>
                                    <span class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
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
                                        <el-select
                                            v-model="faceDetectionData.schedule"
                                            :empty-values="[undefined, null]"
                                        >
                                            <el-option
                                                v-for="item in pageData.scheduleList"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            />
                                        </el-select>
                                        <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                                    </el-form-item>
                                    <div
                                        v-if="detectionPageData.isParamRightShow"
                                        class="param-right-form-item"
                                    >
                                        <!-- 规则 -->
                                        <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                        <!-- 持续时间 -->
                                        <el-form-item :label="Translate('IDCS_DURATION')">
                                            <el-select v-model="faceDetectionData.holdTime">
                                                <el-option
                                                    v-for="item in faceDetectionData.holdTimeList"
                                                    :key="item.value"
                                                    :value="item.value"
                                                    :label="item.label"
                                                    :empty-values="[undefined, null]"
                                                />
                                            </el-select>
                                        </el-form-item>
                                        <!-- 抓拍间隔 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_INTERVAL')">
                                            <el-select
                                                v-model="faceDetectionData.snapInterval"
                                                :disabled="faceDetectionData.snapInterval === ''"
                                            >
                                                <el-option
                                                    v-for="item in detectionPageData.snapList"
                                                    :key="item.value"
                                                    :value="item.value"
                                                    :label="item.label"
                                                />
                                            </el-select>
                                        </el-form-item>
                                        <!-- 抓拍次数 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_NUMBER')">
                                            <BaseNumberInput
                                                v-model="detectionPageData.snapNumber"
                                                :disabled="faceDetectionData.snapInterval === '' || detectionPageData.isSnapNumberDisabled"
                                            />
                                            <el-checkbox
                                                v-model="detectionPageData.isSnapNumberChecked"
                                                :disabled="faceDetectionData.snapInterval === ''"
                                                @change="snapNumberCheckChange"
                                            />
                                        </el-form-item>
                                        <!-- 人脸曝光 -->
                                        <el-form-item :label="Translate('IDCS_FACE_DETECT_EXPOSURE')">
                                            <el-checkbox
                                                v-model="faceDetectionData.faceExpSwitch"
                                                :disabled="detectionPageData.faceExpDisabled"
                                            />
                                            <el-slider
                                                v-model="faceDetectionData.faceExpStrength"
                                                :disabled="detectionPageData.faceExpDisabled"
                                                show-input
                                                :min="1"
                                                :max="100"
                                            />
                                        </el-form-item>
                                        <!-- 人脸大小(范围：3%~50%) -->
                                        <div class="base-ai-subheading">{{ Translate('IDCS_FACE_SIZE_TIP') }}</div>
                                        <el-form-item :label="Translate('IDCS_MIN')">
                                            <BaseNumberInput
                                                v-model="faceDetectionData.minFaceFrame"
                                                :min="3"
                                                :max="50"
                                                @blur="minFaceBlur"
                                            />
                                            <span>%</span>
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_MAX')">
                                            <BaseNumberInput
                                                v-model="faceDetectionData.maxFaceFrame"
                                                :min="3"
                                                :max="50"
                                                @blur="maxFaceBlur"
                                            />
                                            <span>%</span>
                                        </el-form-item>
                                        <el-form-item label=" ">
                                            <el-checkbox
                                                v-model="detectionPageData.isDispalyRangeChecked"
                                                :label="Translate('IDCS_DISPLAY_RANGE_BOX')"
                                                @change="dispalyRangeChange"
                                            />
                                        </el-form-item>
                                    </div>
                                </el-form>
                            </div>
                        </el-tab-pane>
                        <!-- 联动方式 -->
                        <el-tab-pane
                            v-if="detectionPageData.isLinkageShow"
                            :label="Translate('IDCS_LINKAGE_MODE')"
                            name="linkage"
                        >
                            <el-form
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-form-item
                                    v-show="supportAlarmAudioConfig"
                                    :label="Translate('IDCS_VOICE_PROMPT')"
                                >
                                    <el-select v-model="faceDetectionData.sysAudio">
                                        <el-option
                                            v-for="item in pageData.voiceList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <div class="base-ai-linkage-content">
                                <!-- 常规联动 -->
                                <AlarmBaseTriggerSelector
                                    v-model="faceDetectionData.trigger"
                                    :include="detectionPageData.triggerList"
                                />
                                <!-- 录像 -->
                                <AlarmBaseRecordSelector v-model="faceDetectionData.record" />
                                <!-- 报警输出 -->
                                <AlarmBaseRecordSelector v-model="faceDetectionData.alarmOut" />
                                <!-- 联动预置点 -->
                                <AlarmBasePresetSelector v-model="faceDetectionData.preset" />
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
                                v-show="detectionPageData.isMoreWrapShow"
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
                            <div class="base-ai-subheading">
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-checkbox
                                v-model="detectionPageData.isSaveSourcePicChecked"
                                :disabled="detectionPageData.isSavePicDisabled"
                                :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                                @change="saveSourcePicChange"
                            />
                            <el-checkbox
                                v-model="detectionPageData.isSaveFacePicChecked"
                                :disabled="detectionPageData.isSavePicDisabled"
                                :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                @change="saveFacePicChange"
                            />
                            <div class="base-btn-box">
                                <el-button @click="advancedVisible = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </div>
                    </el-popover>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="detectionPageData.applyDisabled"
                        @click="applyFaceDetectionData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 识别 -->
        <el-tab-pane
            v-if="pageData.isFaceCompareShow"
            :label="Translate('IDCS_RECOGNITION')"
            name="faceCompare"
            :disabled="pageData.faceCompareDisabled"
        >
            <div>
                <div
                    class="base-btn-box collapse"
                    span="2"
                >
                    <div>
                        <el-text :style="{ margin: '0 20px' }">{{ Translate('IDCS_ENABLE') }}</el-text>
                        <el-checkbox
                            v-model="faceMatchData.hitEnable"
                            :label="Translate('IDCS_SUCCESSFUL_RECOGNITION')"
                        />
                        <el-checkbox
                            v-model="faceMatchData.notHitEnable"
                            :label="Translate('IDCS_GROUP_STRANGER')"
                        />
                    </div>
                    <AlarmBaseResourceData
                        v-if="showAIReourceDetail"
                        :enable="faceMatchData.hitEnable || faceMatchData.notHitEnable"
                        :chl-id="pageData.curChl"
                        event="faceMatch"
                        @error="handleAIResourceError"
                        @change="handleAIResourceDel"
                    />
                </div>
                <div>
                    <el-tabs
                        v-model="comparePageData.compareTab"
                        class="base-ai-tabs"
                        @tab-change="compareTabChange"
                    >
                        <el-tab-pane
                            :label="Translate('IDCS_PARAM_SETTING')"
                            name="param"
                        >
                            <div class="table-box">
                                <el-table
                                    stripe
                                    border
                                    :data="faceGroupTable"
                                    height="300"
                                    highlight-current-row
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_FACE_LIBRARY_GROUP')"
                                    />
                                    <el-table-column>
                                        <template #header>
                                            <el-popover
                                                ref="similarityRef"
                                                :hide-on-click="false"
                                                width="300"
                                            >
                                                <template #reference>
                                                    <BaseTableDropdownLink> {{ Translate('IDCS_SIMILARITY') }}(%) </BaseTableDropdownLink>
                                                </template>
                                                <el-form
                                                    class="stripe"
                                                    :style="{
                                                        '--form-label-width': '100px',
                                                        '--form-input-width': '100px',
                                                    }"
                                                    inline-message
                                                >
                                                    <el-form-item :label="Translate('IDCS_SIMILARITY')">
                                                        <BaseNumberInput
                                                            v-model="comparePageData.similarityNumber"
                                                            :min="1"
                                                            :max="100"
                                                        />
                                                        <span>%</span>
                                                    </el-form-item>
                                                </el-form>
                                                <div class="base-btn-box">
                                                    <el-button @click="similarityChangeAll">{{ Translate('IDCS_OK') }}</el-button>
                                                    <el-button @click="comparePageData.isSimilarityPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                                                </div>
                                            </el-popover>
                                        </template>
                                        <template #default="scope">
                                            <BaseNumberInput
                                                v-model="scope.row.similarity"
                                                :min="1"
                                                :max="100"
                                                @blur="similarityInputBlur($event, scope.$index)"
                                                @keyup.enter="enterBlur($event)"
                                            />
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div>{{ Translate('IDCS_FACE_MATCH_PARAM_TIP') }}</div>
                                <el-checkbox
                                    v-model="faceMatchData.liveDisplaySwitch"
                                    :label="Translate('IDCS_NO_REALTIME_DISPLAY')"
                                />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane
                            v-for="(item, index) in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <SuccessfulRecognition
                                    :curr-task-data="faceCompareData.task[index]"
                                    :group-data="faceGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    @change="faceCompareData.task[index] = $event"
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
                        @click="applyFaceCompareData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 人脸库跳转 -->
        <el-tab-pane
            v-if="pageData.isFaceLibraryShow"
            name="faceLibrary"
            :disabled="pageData.faceLibraryDisabled || !supportFaceMatch"
        >
            <template #label>
                <span :title="Translate('IDCS_FEATURE_LIBRARY')">{{ Translate('IDCS_FEATURE_LIBRARY') }}</span>
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

<script lang="ts" src="./FaceRecognition.v.ts"></script>

<style lang="scss" scoped>
.table-box {
    width: 500px;
}
// 高级设置
.more_wrap {
    position: absolute;
    right: 20px;
    top: 45px;
    cursor: pointer;
}

.advanced_box {
    background-color: var(--ai-advance-bg);
    padding: 10px;

    .el-checkbox {
        display: block;
    }
}

.param-right-form-item {
    .el-form-item {
        margin-bottom: 0;
        padding: 5px 15px;
    }
}

.taskBtn {
    position: absolute;
    right: 20px;
    top: 35px;

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
