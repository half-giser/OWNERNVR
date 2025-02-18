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
        class="base-ai-menu-tabs"
        @tab-change="changeTab"
    >
        <div
            v-if="pageData.notSupport"
            class="base-ai-not-support-box"
        >
            {{ Translate('IDCS_FACE_EVENT_UNSUPORT_TIP') }}
        </div>
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="faceDetection"
            :disabled="pageData.detectionDisabled"
        >
            <div>
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
                                    <span class="base-ai-tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
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
                                    <template v-if="detectionFormData.supportVfd">
                                        <!-- 规则 -->
                                        <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                                        <!-- 持续时间 -->
                                        <el-form-item :label="Translate('IDCS_DURATION')">
                                            <el-select-v2
                                                v-model="detectionFormData.holdTime"
                                                :options="detectionFormData.holdTimeList"
                                            />
                                        </el-form-item>
                                        <!-- 抓拍间隔 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_INTERVAL')">
                                            <el-select-v2
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
                                            <el-slider
                                                v-model="detectionFormData.faceExpStrength"
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
                                    <el-select-v2
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
                                <AlarmBaseRecordSelector v-model="detectionFormData.alarmOut" />
                                <!-- 联动预置点 -->
                                <AlarmBasePresetSelector v-model="detectionFormData.preset" />
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 高级设置 -->
                    <el-popover
                        v-model:visible="pageData.isAdvance"
                        width="300"
                        popper-class="no-padding keep-ocx"
                    >
                        <template #reference>
                            <div
                                v-show="detectionFormData.supportVfd"
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
                            <div class="base-ai-subheading">
                                {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                            </div>
                            <el-checkbox
                                v-model="detectionFormData.saveSourcePicture"
                                :disabled="detectionFormData.saveSourcePicture === undefined"
                                :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                            />
                            <el-checkbox
                                v-model="detectionFormData.saveFacePicture"
                                :disabled="detectionFormData.saveFacePicture === undefined"
                                :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                            />
                            <div class="base-btn-box">
                                <el-button @click="pageData.isAdvance = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                            </div>
                        </div>
                    </el-popover>
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
            <div>
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
                                    :data="faceMatchData.groupInfo"
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
                                            </el-popover>
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
                                <RecognitionPanel
                                    :curr-task-data="recognitionFormData.task[index]"
                                    :group-data="faceGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
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
                <span :title="Translate('IDCS_FEATURE_LIBRARY')">{{ Translate('IDCS_FEATURE_LIBRARY') }}</span>
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

<script lang="ts" src="./FaceRecognition.v.ts"></script>

<style lang="scss" scoped>
.checkbox-label {
    margin-right: 20px;
}

.table-box {
    width: 500px;
}
</style>
