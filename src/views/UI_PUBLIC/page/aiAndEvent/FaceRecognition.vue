<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-28 13:41:57
 * @Description: AI 事件——人脸识别
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
        v-title
        class="base-ai-menu-tabs"
        @tab-change="changeTab"
    >
        <AlarmBaseErrorPanel
            v-show="pageData.notSupport"
            type="not-support"
        />
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="faceDetection"
            :disabled="pageData.detectionDisabled"
        >
            <div v-if="!pageData.notSupport">
                <div class="base-btn-box space-between padding collapse">
                    <el-checkbox
                        v-model="detectionFormData.enabledSwitch"
                        :label="detectionPageData.deviceInfo"
                    />
                    <AlarmBaseResourceData
                        v-if="showAIReourceDetail"
                        :chl-id="pageData.curChl"
                        event="faceDetect"
                        :enable="detectionFormData.enabledSwitch && !chlData.supportVfd"
                        @error="handleAIResourceError"
                        @change="handleAIResourceDel"
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
                                <div v-show="detectionFormData.supportVfd">
                                    <div class="base-btn-box">
                                        <el-button @click="clearDrawArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                    </div>
                                    <div class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</div>
                                </div>
                            </div>
                            <div class="base-ai-param-box-right">
                                <el-form v-title>
                                    <!-- 排程 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                    <!-- 排程配置 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <BaseScheduleSelect
                                            v-model="detectionFormData.schedule"
                                            :options="pageData.scheduleList"
                                            @edit="pageData.isSchedulePop = true"
                                        />
                                    </el-form-item>
                                    <template v-if="detectionFormData.supportVfd">
                                        <!-- 规则 -->
                                        <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                        <!-- 持续时间 -->
                                        <el-form-item :label="Translate('IDCS_DURATION')">
                                            <BaseSelect
                                                v-model="detectionFormData.holdTime"
                                                :options="detectionFormData.holdTimeList"
                                                empty-text=""
                                            />
                                        </el-form-item>
                                        <!-- 抓拍间隔 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_INTERVAL')">
                                            <BaseSelect
                                                v-model="detectionFormData.snapInterval"
                                                :options="detectionPageData.snapList"
                                                :disabled="detectionFormData.snapInterval === ''"
                                            />
                                        </el-form-item>
                                        <!-- 抓拍次数 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_NUMBER')">
                                            <BaseNumberInput
                                                v-if="detectionFormData.captureCycleChecked"
                                                v-model="detectionFormData.captureCycle"
                                                :min="1"
                                                :max="65534"
                                                :disabled="detectionFormData.snapInterval === ''"
                                            />
                                            <el-input
                                                v-else
                                                :model-value="Translate('IDCS_NO_LIMITED')"
                                                disabled
                                            />
                                            <el-checkbox
                                                v-model="detectionFormData.captureCycleChecked"
                                                :disabled="detectionFormData.snapInterval === ''"
                                            />
                                        </el-form-item>
                                        <!-- 人脸曝光 -->
                                        <el-form-item :label="Translate('IDCS_FACE_DETECT_EXPOSURE')">
                                            <el-checkbox
                                                v-model="detectionFormData.faceExpSwitch"
                                                :disabled="detectionPageData.faceExpDisabled"
                                            />
                                            <BaseSliderInput
                                                v-model="detectionFormData.faceExpStrength"
                                                :disabled="detectionPageData.faceExpDisabled"
                                                :min="1"
                                            />
                                        </el-form-item>
                                        <!-- 人脸大小(范围：3%~50%) -->
                                        <div class="base-ai-subheading">{{ Translate('IDCS_FACE_SIZE_TIP') }}</div>
                                        <el-form-item :label="Translate('IDCS_MIN')">
                                            <BaseNumberInput
                                                v-model="detectionFormData.minFaceFrame"
                                                :min="3"
                                                :max="Math.min(50, detectionFormData.maxFaceFrame)"
                                                @blur="blurMinFaceFrame"
                                            />
                                            <span>%</span>
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_MAX')">
                                            <BaseNumberInput
                                                v-model="detectionFormData.maxFaceFrame"
                                                :min="Math.max(detectionFormData.minFaceFrame, 3)"
                                                :max="50"
                                                @blur="blurMaxFaceFrame"
                                            />
                                            <span>%</span>
                                        </el-form-item>
                                        <el-form-item label=" ">
                                            <el-checkbox
                                                v-model="detectionPageData.isDispalyRangeChecked"
                                                :label="Translate('IDCS_DISPLAY_RANGE_BOX')"
                                                @change="changeDisplayRange"
                                            />
                                        </el-form-item>
                                    </template>
                                </el-form>
                            </div>
                        </el-tab-pane>
                        <!-- 联动方式 -->
                        <el-tab-pane
                            v-if="detectionFormData.supportVfd"
                            :label="Translate('IDCS_LINKAGE_MODE')"
                            name="trigger"
                        >
                            <el-form v-title>
                                <el-form-item
                                    v-show="supportAlarmAudioConfig"
                                    :label="Translate('IDCS_VOICE_PROMPT')"
                                >
                                    <BaseSelect
                                        v-model="detectionFormData.sysAudio"
                                        :options="pageData.voiceList"
                                    />
                                </el-form-item>
                            </el-form>
                            <div class="base-ai-linkage-content">
                                <!-- 常规联动 -->
                                <AlarmBaseTriggerSelector
                                    v-model="detectionFormData.trigger"
                                    :include="detectionPageData.triggerList"
                                />
                                <!-- 录像 -->
                                <AlarmBaseRecordSelector v-model="detectionFormData.record" />
                                <!-- 报警输出 -->
                                <AlarmBaseAlarmOutSelector v-model="detectionFormData.alarmOut" />
                                <!-- 联动预置点 -->
                                <AlarmBasePresetSelector v-model="detectionFormData.preset" />
                                <!-- Ip Speaker -->
                                <AlarmBaseIPSpeakerSelector
                                    v-if="supportAlarmAudioConfig"
                                    v-model="detectionFormData.ipSpeaker"
                                    :chl-id="pageData.curChl"
                                />
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 高级设置 -->
                    <BasePopover
                        v-model:visible="pageData.isAdvance"
                        width="300"
                        popper-class="no-padding"
                        :popper-options="pageData.poppeOptions"
                    >
                        <template #reference>
                            <div
                                v-show="detectionFormData.supportVfd"
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
                            <el-form
                                v-title
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
                                        v-model="detectionFormData.saveSourcePicture"
                                        :disabled="detectionFormData.saveSourcePicture === undefined"
                                        :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <el-checkbox
                                        v-model="detectionFormData.saveFacePicture"
                                        :disabled="detectionFormData.saveFacePicture === undefined"
                                        :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                                    />
                                </el-form-item>
                                <div class="base-btn-box">
                                    <el-button @click="pageData.isAdvance = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                                </div>
                            </el-form>
                        </div>
                    </BasePopover>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="watchDetection.disabled.value"
                        @click="applyFaceDetectionData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </el-tab-pane>
        <!-- 识别 -->
        <el-tab-pane
            v-if="pageData.isRecognitionShow"
            :label="Translate('IDCS_RECOGNITION')"
            name="faceCompare"
            :disabled="pageData.recognitionDisabled"
        >
            <div v-if="!pageData.notSupport">
                <div class="base-btn-box space-between collapse padding">
                    <div>
                        <el-text class="checkbox-label">{{ Translate('IDCS_ENABLE') }}</el-text>
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
                <div class="base-ai-form">
                    <el-tabs
                        v-model="recognitionPageData.tab"
                        class="base-ai-tabs"
                    >
                        <el-tab-pane
                            :label="Translate('IDCS_PARAM_SETTING')"
                            name="param"
                        >
                            <div class="table-box">
                                <el-table
                                    v-title
                                    :data="faceMatchData.groupInfo"
                                    height="300"
                                    highlight-current-row
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_FACE_LIBRARY_GROUP')"
                                        show-overflow-tooltip
                                    >
                                        <template #default="{ row }: TableColumn<AlarmFaceGroupDto>">
                                            <span>{{ row.name }} ({{ row.count }})</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column>
                                        <template #header>
                                            <BasePopover
                                                v-model="recognitionPageData.isSimilarityPop"
                                                width="300"
                                            >
                                                <template #reference>
                                                    <BaseTableDropdownLink> {{ Translate('IDCS_SIMILARITY') }}(%) </BaseTableDropdownLink>
                                                </template>
                                                <el-form
                                                    v-title
                                                    class="no-padding"
                                                    :style="{
                                                        '--form-label-width': '100px',
                                                    }"
                                                >
                                                    <el-form-item :label="Translate('IDCS_SIMILARITY')">
                                                        <BaseNumberInput
                                                            v-model="recognitionPageData.similarity"
                                                            :min="1"
                                                            :max="100"
                                                        />
                                                        <span>%</span>
                                                    </el-form-item>
                                                </el-form>
                                                <div class="base-btn-box">
                                                    <el-button @click="changeAllSimilarity">{{ Translate('IDCS_OK') }}</el-button>
                                                    <el-button @click="recognitionPageData.isSimilarityPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                                                </div>
                                            </BasePopover>
                                        </template>
                                        <template #default="{ row }: TableColumn<AlarmFaceGroupDto>">
                                            <BaseNumberInput
                                                v-model="row.similarity"
                                                :min="1"
                                                :max="100"
                                                @keyup.enter="blurInput"
                                            />
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-form class="no-padding">
                                    <el-form-item>{{ Translate('IDCS_FACE_MATCH_PARAM_TIP') }}</el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="faceMatchData.liveDisplaySwitch"
                                            :label="Translate('IDCS_NO_REALTIME_DISPLAY')"
                                        />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane
                            v-for="(item, index) in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <RecognitionPanel
                                    :curr-task-data="recognitionFormData.task[index]"
                                    :group-data="faceGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    :chl-id="pageData.curChl"
                                    @change="recognitionFormData.task[index] = $event"
                                />
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 增加/删除任务 -->
                    <div class="base-ai-task-btn">
                        <span @click="addTask">+</span>
                        <span
                            :class="{ disabled: ['param', 'miss', 'hit'].includes(recognitionPageData.tab) }"
                            @click="removeTask"
                            >-</span
                        >
                    </div>
                </div>
                <div class="base-btn-box fixed">
                    <el-button
                        :disabled="watchRecognition.disabled.value && watchMatch.disabled.value"
                        @click="applyRecognitionData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </el-tab-pane>
        <!-- 人脸库跳转 NLYH-64：非AI模式下，不支持人脸比对，可根据是否支持人脸比对supportFaceMatch来隐藏人脸识别和人脸库  -->
        <el-tab-pane
            v-if="pageData.isLibraryShow"
            name="faceLibrary"
            :disabled="pageData.libraryDisabled || !supportFaceMatch"
        >
            <template #label>
                <span>{{ Translate('IDCS_FEATURE_LIBRARY') }}</span>
                <BaseImgSprite
                    class="link-icon"
                    file="jumpto"
                />
            </template>
        </el-tab-pane>
    </el-tabs>
    <!-- 排程管理弹窗 -->
    <BaseScheduleManagePop
        v-model="pageData.isSchedulePop"
        @close="closeSchedulePop"
    />
</template>

<script lang="ts" src="./FaceRecognition.v.ts"></script>

<style lang="scss" scoped>
.checkbox-label {
    margin-right: 20px;
}

.table-box {
    width: 500px;
}
</style>
