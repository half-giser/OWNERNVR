<!--
 * @Description: AI 事件——人脸识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-28 13:41:57
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 14:31:16
-->
<template>
    <!-- 通道名称及选择器 -->
    <el-form
        class="stripe narrow"
        :style="{
            '--form-input-width': '430px',
            '--el-form-label-font-size': '15px',
        }"
        label-position="left"
        inline-message
    >
        <el-form-item
            :label="Translate('IDCS_CHANNEL_NAME')"
            label-width="108px"
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
                >
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <el-tabs
        v-model="pageData.faceTab"
        class="base-ai-menu-tabs"
        @tab-change="faceTabChange"
    >
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="faceDetection"
            :disabled="pageData.faceDetectionDisabled"
        >
            <div>
                <div
                    class="base-btn-box padding collapse"
                    :span="2"
                >
                    <div>
                        <el-checkbox
                            v-model="faceDetectionData.enabledSwitch"
                            @change="enabledSwitchChange"
                            >{{ detectionPageData.deviceInfo }}</el-checkbox
                        >
                    </div>
                    <div v-show="showAIReourceDetail">
                        <span>{{ `${Translate('IDCS_USAGE_RATE') + pageData.resourceOccupancy}` }}</span>
                        <BaseImgSprite
                            class="detailBtn"
                            file="detail"
                            :index="0"
                            :chunk="4"
                            @click="openAIResourcePop"
                        />
                    </div>
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
                                    class="narrow"
                                    :style="{
                                        '--form-input-width': '215px',
                                    }"
                                    label-position="left"
                                    inline-message
                                >
                                    <!-- 排程 -->
                                    <div class="base-ai-subheading">{{ Translate('IDCS_SCHEDULE') }}</div>
                                    <!-- 排程配置 -->
                                    <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                        <el-select v-model="faceDetectionData.schedule">
                                            <el-option
                                                v-for="item in pageData.scheduleList"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            >
                                            </el-option>
                                        </el-select>
                                        <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                                    </el-form-item>
                                    <div v-if="detectionPageData.isParamRightShow">
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
                                                >
                                                </el-option>
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
                                                >
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                        <!-- 抓拍次数 -->
                                        <el-form-item :label="Translate('IDCS_SNAPSHOT_NUMBER')">
                                            <el-input
                                                v-model="detectionPageData.snapNumber"
                                                :disabled="faceDetectionData.snapInterval === '' || detectionPageData.isSnapNumberDisabled"
                                            ></el-input>
                                            <el-checkbox
                                                v-model="detectionPageData.isSnapNumberChecked"
                                                :disabled="faceDetectionData.snapInterval === ''"
                                                @change="snapNumberCheckChange"
                                            ></el-checkbox>
                                        </el-form-item>
                                        <!-- 人脸曝光 -->
                                        <el-form-item :label="Translate('IDCS_FACE_DETECT_EXPOSURE')">
                                            <el-checkbox
                                                v-model="faceDetectionData.faceExpSwitch"
                                                :disabled="detectionPageData.faceExpDisabled"
                                            ></el-checkbox>
                                            <el-slider
                                                v-model="faceDetectionData.faceExpStrength"
                                                :disabled="detectionPageData.faceExpDisabled"
                                                show-input
                                                :show-input-controls="false"
                                                :min="1"
                                                :max="100"
                                            />
                                        </el-form-item>
                                        <!-- 人脸大小(范围：3%~50%) -->
                                        <div class="base-ai-subheading">{{ Translate('IDCS_FACE_SIZE_TIP') }}</div>
                                        <el-form-item :label="Translate('IDCS_MIN')">
                                            <el-input
                                                v-model="faceDetectionData.minFaceFrame"
                                                :min="3"
                                                :max="50"
                                                type="number"
                                                @blur="minFaceBlur"
                                            ></el-input
                                            >%
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_MAX')">
                                            <el-input
                                                v-model="faceDetectionData.maxFaceFrame"
                                                :min="3"
                                                :max="50"
                                                type="number"
                                                @blur="maxFaceBlur"
                                            ></el-input
                                            >%
                                        </el-form-item>
                                        <el-form-item label=" ">
                                            <el-checkbox
                                                v-model="detectionPageData.isDispalyRangeChecked"
                                                @change="dispalyRangeChange"
                                                >{{ Translate('IDCS_DISPLAY_RANGE_BOX') }}</el-checkbox
                                            >
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
                                class="narrow"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                                label-position="left"
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
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <div class="base-ai-linkage-content">
                                <!-- 常规联动 -->
                                <div class="base-ai-linkage-box">
                                    <el-checkbox
                                        v-model="normalParamCheckAll"
                                        class="base-ai-linkage-title"
                                        @change="handleNormalParamCheckAll"
                                        >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                                    >
                                    <el-checkbox-group
                                        v-model="normalParamCheckList"
                                        @change="handleNormalParamCheck"
                                    >
                                        <el-checkbox
                                            v-for="item in normalParamList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        >
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <!-- 录像 -->
                                <div class="base-ai-linkage-box">
                                    <div class="base-ai-linkage-title">
                                        <!-- 在文字后加个空格，和按钮隔开一点距离 -->
                                        <span>{{ `${Translate('IDCS_RECORD')} ` }}</span>
                                        <el-button
                                            size="small"
                                            @click="pageData.recordIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}</el-button
                                        >
                                    </div>
                                    <el-table
                                        :data="faceDetectionData.record"
                                        stripe
                                        :show-header="false"
                                    >
                                        <el-table-column prop="label" />
                                    </el-table>
                                </div>
                                <!-- 报警输出 -->
                                <div class="base-ai-linkage-box">
                                    <div class="base-ai-linkage-title">
                                        <span>{{ `${Translate('IDCS_ALARM_OUT')} ` }}</span>
                                        <el-button
                                            size="small"
                                            @click="pageData.alarmOutIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}</el-button
                                        >
                                    </div>
                                    <el-table
                                        :data="faceDetectionData.alarmOut"
                                        stripe
                                        :show-header="false"
                                    >
                                        <el-table-column prop="label" />
                                    </el-table>
                                </div>
                                <!-- 联动预置点 -->
                                <div
                                    class="base-ai-linkage-box"
                                    :style="{ width: '350px' }"
                                >
                                    <div class="base-ai-linkage-title">
                                        <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                                    </div>
                                    <el-table
                                        stripe
                                        border
                                        :data="PresetTableData"
                                    >
                                        <el-table-column
                                            prop="name"
                                            width="180px"
                                            :label="Translate('IDCS_CHANNEL_NAME')"
                                        >
                                        </el-table-column>
                                        <el-table-column
                                            width="170px"
                                            :label="Translate('IDCS_PRESET_NAME')"
                                        >
                                            <template #default="scope">
                                                <el-select
                                                    v-model="scope.row.preset.value"
                                                    size="small"
                                                    :empty-values="[undefined, null]"
                                                    @change="presetChange(scope.row)"
                                                >
                                                    <el-option
                                                        v-for="item in scope.row.presetList"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value"
                                                    />
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 高级设置 -->
                    <el-popover
                        v-model:visible="advancedVisible"
                        width="300"
                        trigger="click"
                        popper-class="no-padding"
                    >
                        <template #reference>
                            <div
                                v-show="detectionPageData.isMoreWrapShow"
                                class="more_wrap"
                            >
                                <span>{{ Translate('IDCS_ADVANCED') }}</span>
                                <BaseImgSprite
                                    class="moreBtn"
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
                                @change="saveSourcePicChange"
                                >{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</el-checkbox
                            >
                            <el-checkbox
                                v-model="detectionPageData.isSaveFacePicChecked"
                                :disabled="detectionPageData.isSavePicDisabled"
                                @change="saveFacePicChange"
                                >{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</el-checkbox
                            >
                            <div class="base-btn-box">
                                <el-button
                                    small
                                    @click="advancedVisible = false"
                                    >{{ Translate('IDCS_CLOSE') }}</el-button
                                >
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
                    :span="2"
                >
                    <el-form
                        label-position="left"
                        :style="{
                            '--form-label-width': 'auto',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_ENABLE')">
                            <el-checkbox
                                v-model="faceMatchData.hitEnable"
                                @change="getAIResourceData(true)"
                                >{{ Translate('IDCS_SUCCESSFUL_RECOGNITION') }}</el-checkbox
                            >
                            <el-checkbox
                                v-model="faceMatchData.notHitEnable"
                                @change="getAIResourceData(true)"
                                >{{ Translate('IDCS_GROUP_STRANGER') }}</el-checkbox
                            >
                        </el-form-item>
                    </el-form>
                    <div v-show="showAIReourceDetail">
                        <span>{{ `${Translate('IDCS_USAGE_RATE') + pageData.resourceOccupancy}` }}</span>
                        <BaseImgSprite
                            class="detailBtn"
                            file="detail"
                            :index="0"
                            :chunk="4"
                            @click="openAIResourcePop"
                        />
                    </div>
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
                                    height="300px"
                                    highlight-current-row
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_FACE_LIBRARY_GROUP')"
                                    ></el-table-column>
                                    <el-table-column>
                                        <template #header>
                                            <el-dropdown
                                                ref="similarityRef"
                                                trigger="click"
                                                :hide-on-click="false"
                                                placement="bottom-start"
                                            >
                                                <span class="el-dropdown-link">
                                                    {{ Translate('IDCS_SIMILARITY') }}(%)
                                                    <BaseImgSprite
                                                        class="ddn"
                                                        file="ddn"
                                                    />
                                                </span>
                                                <template #dropdown>
                                                    <div class="dropdownBox">
                                                        <el-form
                                                            class="stripe narrow"
                                                            :style="{
                                                                '--form-input-width': '100px',
                                                            }"
                                                            label-position="left"
                                                            label-width="100px"
                                                            inline-message
                                                        >
                                                            <el-form-item :label="Translate('IDCS_SIMILARITY')">
                                                                <el-input
                                                                    v-model="comparePageData.similarityNumber"
                                                                    type="number"
                                                                    @blur="similarityInputBlur($event)"
                                                                ></el-input>
                                                                <span>%</span>
                                                            </el-form-item>
                                                        </el-form>
                                                        <div class="base-btn-box">
                                                            <el-button @click="similarityChangeAll">{{ Translate('IDCS_OK') }}</el-button>
                                                            <el-button @click="similarityRef.handleClose()">{{ Translate('IDCS_CANCEL') }}</el-button>
                                                        </div>
                                                    </div>
                                                </template>
                                            </el-dropdown>
                                        </template>
                                        <template #default="scope">
                                            <el-input
                                                v-model="scope.row.similarity"
                                                type="number"
                                                @blur="similarityInputBlur($event, scope.$index)"
                                                @keyup.enter="enterBlur($event)"
                                            ></el-input>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div>{{ Translate('IDCS_FACE_MATCH_PARAM_TIP') }}</div>
                                <el-checkbox v-model="faceMatchData.liveDisplaySwitch">{{ Translate('IDCS_NO_REALTIME_DISPLAY') }}</el-checkbox>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane
                            v-for="item in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <SuccessfulRecognition
                                    :curr-task-data="compareLinkData(item.value)"
                                    :group-data="faceGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    :record-list="pageData.recordList"
                                    :alarm-out-list="pageData.alarmOutList"
                                    :snap-list="pageData.snapList"
                                ></SuccessfulRecognition>
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
    <div
        v-if="pageData.notChlSupport"
        class="base-ai-not-support-box"
    >
        {{ pageData.notSupportTip }}
    </div>
    <BaseNotification v-model:notifications="pageData.notification" />
    <!-- AI资源的弹窗 -->
    <el-dialog
        v-model="AIResourcePopOpen"
        :title="Translate('IDCS_DETAIL')"
        width="600"
        hight="400"
        align-center
        draggable
        @open="openAIResourcePop"
        @close="AIResourcePopOpen = false"
    >
        <el-table
            :data="AIResourceTableData"
            stripe
            border
            height="250px"
            highlight-current-row
            show-overflow-tooltip
        >
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL')"
                width="110"
            ></el-table-column>
            <el-table-column
                prop="eventTypeText"
                :label="Translate('IDCS_EVENT_TYPE')"
                width="110"
            ></el-table-column>
            <el-table-column
                prop="percent"
                :label="Translate('IDCS_USAGE_RATE')"
                width="110"
            >
                <template #default="scope">
                    <span>{{ scope.row.percent }}%</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="decodeResourceText"
                :label="Translate('IDCS_DECODE_RESOURCE')"
                width="110"
            >
            </el-table-column>
            <el-table-column
                prop="del"
                :label="Translate('IDCS_FREE_AI_RESOURCE')"
                width="118"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="del"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handleDelAIResource(scope.row)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button
                small
                @click="AIResourcePopOpen = false"
                >{{ Translate('IDCS_CLOSE') }}</el-button
            >
        </div>
    </el-dialog>
    <!-- 排程管理弹窗 -->
    <!-- close写成赋值语句导致下面格式有点问题，用函数包一下 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="
            () => {
                pageData.scheduleManagPopOpen = false
            }
        "
    />
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.recordList"
        :linked-list="faceDetectionData.record?.map((item) => item.value) || []"
        type="record"
        @confirm="recordConfirm"
        @close="recordClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.alarmOutIsShow"
        header-title="IDCS_TRIGGER_ALARM_OUT"
        source-title="IDCS_ALARM_OUT"
        target-title="IDCS_TRIGGER_ALARM_OUT"
        :source-data="pageData.alarmOutList"
        :linked-list="faceDetectionData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./FaceRecognition.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
.table-box {
    width: 500px;
}

// 高级设置
.more_wrap {
    position: absolute;
    right: 20px;
    top: 10px;
    cursor: pointer;
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
        font-size: 30px;
        padding: 0 5px;
        cursor: pointer;
    }
    .removeDisabled {
        color: var(--main-text-light);
    }
}

.dropdownBox {
    width: 300px;
    height: 100px;
    padding: 10px;
}
</style>
