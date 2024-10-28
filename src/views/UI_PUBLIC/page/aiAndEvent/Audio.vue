<!--
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:15
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 14:35:35
-->
<template>
    <el-tabs
        v-model="pageData.audioTab"
        class="audioTabs"
    >
        <!-- 摄像机声音 -->
        <el-tab-pane
            :name="pageTabs[0].name"
            :label="pageTabs[0].label"
        >
            <el-form
                ref="ipcAudioRef"
                :model="ipcAudioFormData"
                class="stripe narrow"
                :style="{
                    '--form-input-width': '215px',
                    '--form-label-width': '220px',
                }"
                inline-message
            >
                <el-form-item>
                    <el-radio-group v-model="ipcAudioFormData.ipcRadio">
                        <el-radio-button
                            value="audioAlarm"
                            :label="Translate('IDCS_IPC_VOICE_BROADCAST')"
                        />
                        <el-radio-button
                            value="audioDevice"
                            :label="Translate('IDCS_AUDIO_DEVICE')"
                        />
                    </el-radio-group>
                </el-form-item>
                <!-- 语音播报 -->
                <template v-if="ipcAudioFormData.ipcRadio === 'audioAlarm'">
                    <!-- 通道 -->
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select
                            v-model="ipcAudioFormData.audioChl"
                            :disabled="audioAlarmPageData.chlDisabled"
                            @change="changeChl"
                        >
                            <el-option
                                v-for="item in audioAlarmPageData.chlAlarmOutList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                        <span
                            v-show="audioAlarmPageData.queryFailTipsShow"
                            :style="{ marginLeft: '80px' }"
                            >{{ Translate('IDCS_QUERY_DATA_FAIL').replace(/，/g, '') }}</span
                        >
                    </el-form-item>
                    <!-- 声音 -->
                    <el-form-item :label="Translate('IDCS_AUDIO')">
                        <el-checkbox
                            v-model="ipcAudioFormData.audioChecked"
                            :disabled="audioAlarmPageData.audioCheckDisabled"
                            :label="Translate('IDCS_ENABLE')"
                            @change="changeAudioCheck"
                        />
                    </el-form-item>
                    <!-- 语音 -->
                    <el-form-item :label="Translate('IDCS_ALERT_VOICE')">
                        <el-select
                            v-model="ipcAudioFormData.voice"
                            :disabled="audioAlarmPageData.voiceDisabled"
                            @change="changeVioce"
                        >
                            <el-option
                                v-for="item in audioAlarmPageData.audioTypeList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option
                        ></el-select>
                        <div :style="{ marginLeft: '80px' }">
                            <el-button
                                :disabled="audioAlarmPageData.addAudioDisabled"
                                @click="addAudio"
                                >{{ Translate('IDCS_ADD') }}</el-button
                            >
                            <el-button
                                :disabled="audioAlarmPageData.deleteAudioDisabled"
                                @click="deleteAudio"
                                >{{ Translate('IDCS_DELETE') }}</el-button
                            >
                            <el-button
                                :disabled="audioAlarmPageData.listenAudioDisabled"
                                @click="listenAudio"
                                >{{ Translate('IDCS_AUDITION') }}</el-button
                            >
                        </div>
                    </el-form-item>
                    <!-- 次数 -->
                    <el-form-item :label="Translate('IDCS_TIMES')">
                        <BaseNumberInput
                            v-model="ipcAudioFormData.number"
                            :disabled="audioAlarmPageData.numberDisabled"
                            :min="1"
                            :max="50"
                            :value-on-clear="!audioAlarmPageData.numberDisabled ? 'min' : null"
                            @blur="blurNumber"
                        />
                    </el-form-item>
                    <!-- 音量 -->
                    <el-form-item :label="Translate('IDCS_ALARM_VOLUME')">
                        <BaseNumberInput
                            v-model="ipcAudioFormData.volume"
                            :disabled="audioAlarmPageData.volumeDisabled"
                            :min="0"
                            :max="100"
                            :value-on-clear="!audioAlarmPageData.volumeDisabled ? 'min' : null"
                            @blur="blurVolume"
                        ></BaseNumberInput>
                    </el-form-item>
                    <!-- 语言 -->
                    <el-form-item :label="Translate('IDCS_LANGUAGE')">
                        <el-select
                            v-model="ipcAudioFormData.language"
                            :disabled="audioAlarmPageData.languageDisbaled"
                            @change="changeLanguage"
                        >
                            <el-option
                                v-for="item in audioAlarmPageData.langList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option
                        ></el-select>
                    </el-form-item>
                </template>
                <!-- 声音设备 -->
                <template v-if="ipcAudioFormData.ipcRadio === 'audioDevice'">
                    <!-- 通道 -->
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select
                            v-model="ipcAudioFormData.deviceChl"
                            @change="chagneDeviceChl"
                        >
                            <el-option
                                v-for="item in audioDevicePageData.chlAudioDevList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option>
                        </el-select>
                        <span
                            v-show="audioDevicePageData.resFailShow"
                            :style="{ marginLeft: '200px' }"
                            >{{ Translate('IDCS_OFFLINE') }}</span
                        >
                    </el-form-item>
                    <!-- 声音设备 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_DEVICE')">
                        <el-checkbox
                            v-model="ipcAudioFormData.deviceEnable"
                            :disabled="audioDevicePageData.deviceEnableDisabled"
                            :label="Translate('IDCS_ENABLE')"
                            @change="changeDeviceEnable"
                        />
                    </el-form-item>
                    <!-- 音频输入设备 -->
                    <el-form-item :label="Translate('IDCS_DEVICE_AUDIO_IN')">
                        <el-select
                            v-model="ipcAudioFormData.deviceAudioInput"
                            :disabled="audioDevicePageData.deviceAudioInputDisabled"
                            @change="chagneAudioInput"
                        >
                            <el-option
                                v-for="item in audioDevicePageData.audioInputList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 音频输入音量 -->
                    <el-form-item :label="Translate('IDCS_IN_VOLUME')">
                        <el-slider
                            v-model="ipcAudioFormData.micOrLinVolume"
                            :disabled="audioDevicePageData.micOrLinVolumeDisabled"
                            :min="0"
                            @change="changeMicOrLinVolume"
                        ></el-slider
                        ><span
                            v-show="!audioDevicePageData.micOrLinVolumeDisabled"
                            :style="{ marginLeft: '20px' }"
                            >{{ ipcAudioFormData.micOrLinVolume }}</span
                        >
                    </el-form-item>
                    <!-- 扬声器（内置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_BUILT_IN')">
                        <el-select
                            v-model="ipcAudioFormData.loudSpeaker"
                            :disabled="audioDevicePageData.loudSpeakerDisabled"
                            @change="changeLoudSpeaker"
                        >
                            <el-option
                                v-for="item in audioDevicePageData.loudSpeakerList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- LOUT（外置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_LINE_OUT')">
                        <el-select
                            v-model="ipcAudioFormData.deviceAudioOutput"
                            :disabled="audioDevicePageData.deviceAudioOutputDisabled"
                            @change="chagneAudioOutput"
                        >
                            <el-option
                                v-for="item in audioDevicePageData.audioOutputList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 音频输出音量 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_OUT_VOLUME')">
                        <el-slider
                            v-model="ipcAudioFormData.outputVolume"
                            :disabled="audioDevicePageData.outputVolumeDisabled"
                            :min="0"
                            @change="changeOutputVolume"
                        >
                        </el-slider
                        ><span
                            v-show="!audioDevicePageData.outputVolumeDisabled"
                            :style="{ marginLeft: '20px' }"
                            >{{ ipcAudioFormData.outputVolume }}</span
                        >
                    </el-form-item>
                    <!-- 音频输入编码 -->
                    <el-form-item :label="Translate('IDCS_ENCODE_AUDIO_IN')">
                        <el-select
                            v-model="ipcAudioFormData.audioEncode"
                            :disabled="audioDevicePageData.audioEncodeDisabled"
                            @change="changeAudioEncode"
                        >
                            <el-option
                                v-for="item in audioDevicePageData.audioEncodeList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-form>
            <el-form
                ref="popMsgRef"
                class="narrow"
                :style="{
                    '--form-input-width': '215px',
                    '--form-label-width': '220px',
                }"
                inline-message
            >
                <!-- 排程 -->
                <div class="base-subheading-box">{{ Translate('IDCS_AUDIO_LINK_SCHEDULE') }}</div>
                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                    <el-select
                        v-model="pageData.audioSchedule"
                        :empty-values="[undefined, null]"
                        @change="pageData.btnApplyDisabled = false"
                    >
                        <el-option
                            v-for="item in pageData.audioScheduleList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        >
                        </el-option>
                    </el-select>
                    <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                </el-form-item>
                <el-form-item>
                    <span class="ipcAudioTips">*{{ Translate('IDCS_AUDIO_LINK_SCHEDULE_TIPS') }}</span>
                </el-form-item>
                <div
                    class="base-btn-box"
                    :style="{ paddingTop: '10px' }"
                >
                    <el-button
                        :disabled="pageData.btnApplyDisabled"
                        @click="setData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </el-form>
        </el-tab-pane>
        <!-- 本地声音报警 -->
        <el-tab-pane
            v-if="pageData.supportAlarmAudioConfig"
            :name="pageTabs[1].name"
            :label="pageTabs[1].label"
        >
            <span :style="{ padding: '10px 0px 0px 15px' }">{{ Translate('IDCS_FILE_LIST') }}</span>
            <div :style="{ position: 'relative', padding: '10px 0px 0px 15px' }">
                <el-table
                    ref="localTableRef"
                    class="localTable"
                    border
                    stripe
                    :data="pageData.localTableData"
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        type="selection"
                        width="55"
                    />
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_FILE_NAME')"
                        width="395"
                    ></el-table-column>
                </el-table>
                <el-button
                    class="localBtn"
                    :style="{ top: '30px' }"
                    @click="addLocalAudio"
                    >{{ Translate('IDCS_ADD') }}</el-button
                >
                <el-button
                    class="localBtn"
                    :style="{ top: '70px', marginLeft: '0' }"
                    @click="deleteLocalAudio"
                    >{{ Translate('IDCS_DELETE') }}</el-button
                >
            </div>
        </el-tab-pane>
    </el-tabs>
    <UploadAudioPop
        v-model="pageData.isImportAudioDialog"
        :type="pageData.audioTab"
        :ipc-audio-chl="ipcAudioFormData.audioChl"
        :ipc-row-data="audioAlarmOutData[ipcAudioFormData.audioChl]"
        :handle-add-voice-list="handleAddVoiceList"
        @close="pageData.isImportAudioDialog = false"
    />
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="handleSchedulePopClose"
    />
</template>

<script lang="ts" src="./Audio.v.ts"></script>

<style lang="scss" scoped>
.audioTabs {
    /* 去掉长分割线 */
    :deep(.el-tabs__nav-wrap::after) {
        position: static !important;
    }

    /* 去掉下划线 */
    :deep(.el-tabs__active-bar) {
        background-color: transparent !important;
    }

    /* 导航行背景色 */
    :deep(.el-tabs__nav-wrap) {
        background-color: var(--subheading-bg);
        padding: 0 15px;
    }

    /* tab项的文字样式 */
    :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: bolder;
        color: var(--main-text);
    }

    /* 鼠标选中时样式 */
    :deep(.el-tabs__item.is-active) {
        color: var(--primary);
        opacity: 1;
    }
    /* 鼠标悬浮时样式 */
    :deep(.el-tabs__item:hover) {
        color: var(--primary);
        cursor: pointer;
        opacity: 1;
    }
}

.ipcAudioTips {
    color: var(--main-text-light);
}

.localTable {
    width: 450px;
    height: 180px;
}

.localBtn {
    position: absolute;
    left: 500px;
    min-width: 100px;
}
</style>
