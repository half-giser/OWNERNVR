<!--
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:15
-->
<template>
    <div>
        <BaseTab
            v-model="pageData.audioTab"
            :options="pageTabs"
            @change="changeTab"
        />
        <!-- 摄像机声音 -->
        <div v-show="pageData.audioTab === 'ipcAudio'">
            <el-form>
                <el-form-item>
                    <el-radio-group v-model="pageData.ipcAudioTab">
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
            </el-form>
            <el-form
                v-title
                class="stripe"
            >
                <!-- 语音播报 -->
                <template v-if="pageData.ipcAudioTab === 'audioAlarm'">
                    <!-- 通道 -->
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select-v2
                            v-model="pageData.alarmOutIndex"
                            :disabled="!alarmOutList.length || alarmOutList[pageData.alarmOutIndex].id === ''"
                            :options="alarmOutList"
                            :props="{
                                value: 'index',
                                label: 'name',
                                disabled: 'none',
                            }"
                            @change="changeAlarmOutChl"
                        />
                        <span
                            v-show="alarmOutFormData.disabled && alarmOutList.length"
                            class="state"
                        >
                            {{ Translate('IDCS_QUERY_DATA_FAIL').replace(/，/g, '') }}
                        </span>
                    </el-form-item>
                    <!-- 声音 -->
                    <el-form-item :label="Translate('IDCS_AUDIO')">
                        <el-checkbox
                            v-model="alarmOutFormData.audioSwitch"
                            :disabled="alarmOutFormData.disabled"
                            :label="Translate('IDCS_ENABLE')"
                        />
                    </el-form-item>
                    <!-- 语音 -->
                    <el-form-item :label="Translate('IDCS_ALERT_VOICE')">
                        <el-select-v2
                            v-if="alarmOutFormData.languageType !== 'customize'"
                            v-model="alarmOutFormData.audioType"
                            :disabled="alarmOutFormData.disabled || !alarmOutFormData.audioSwitch"
                            :options="alarmOutFormData.audioTypeList[alarmOutFormData.languageType] || []"
                        />
                        <el-select-v2
                            v-else-if="alarmOutFormData.customizeAudioType === 0"
                            model-value=""
                            :options="[]"
                            :disabled="alarmOutFormData.disabled || !alarmOutFormData.audioSwitch"
                        />
                        <el-select-v2
                            v-else
                            v-model="alarmOutFormData.customizeAudioType"
                            :disabled="alarmOutFormData.disabled || !alarmOutFormData.audioSwitch"
                            :options="alarmOutFormData.audioTypeList.customize"
                        />
                        <div class="state">
                            <el-button
                                :disabled="!alarmOutFormData.audioSwitch || alarmOutFormData.languageType !== 'customize'"
                                @click="addAudio"
                            >
                                {{ Translate('IDCS_ADD') }}
                            </el-button>
                            <el-button
                                :disabled="!alarmOutFormData.audioSwitch || alarmOutFormData.languageType !== 'customize' || !alarmOutFormData.audioTypeList.customize.length"
                                @click="deleteAudio"
                            >
                                {{ Translate('IDCS_DELETE') }}
                            </el-button>
                            <el-button
                                :disabled="!alarmOutFormData.audioSwitch"
                                @click="listenAudio"
                            >
                                {{ Translate('IDCS_AUDITION') }}
                            </el-button>
                        </div>
                    </el-form-item>
                    <!-- 次数 -->
                    <el-form-item :label="Translate('IDCS_TIMES')">
                        <BaseNumberInput
                            v-model="alarmOutFormData.alarmTimes"
                            :disabled="!alarmOutFormData.audioSwitch || alarmOutFormData.alarmTimesDisabled"
                            :min="1"
                            :max="50"
                        />
                    </el-form-item>
                    <!-- 音量 -->
                    <el-form-item :label="Translate('IDCS_ALARM_VOLUME')">
                        <BaseNumberInput
                            v-model="alarmOutFormData.audioVolume"
                            :disabled="!alarmOutFormData.audioSwitch || alarmOutFormData.audioVolumeDisabled"
                            :min="0"
                            :max="100"
                            @change="changeAudioVolume"
                        />
                    </el-form-item>
                    <!-- 语言 -->
                    <el-form-item :label="Translate('IDCS_LANGUAGE')">
                        <el-select-v2
                            v-model="alarmOutFormData.languageType"
                            :disabled="!alarmOutFormData.audioSwitch || alarmOutFormData.audioType >= 100"
                            :options="alarmOutFormData.langArr"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_SCHEDULE')">
                        <BaseScheduleSelect
                            v-model="alarmOutFormData.schedule"
                            :options="pageData.scheduleList"
                            :disabled="!alarmOutList.length || alarmOutList[pageData.alarmOutIndex].id === ''"
                            @edit="pageData.isSchedulePop = true"
                        />
                    </el-form-item>
                    <div class="base-btn-box">
                        <el-button
                            :disabled="editAlarmOutFormData.disabled.value"
                            @click="setAlarmOutData"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </template>
                <!-- 声音设备 -->
                <template v-if="pageData.ipcAudioTab === 'audioDevice'">
                    <!-- 通道 -->
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select-v2
                            v-model="pageData.deviceIndex"
                            :options="deviceList"
                            :disabled="!deviceList.length || deviceFormData.id === ''"
                            :props="{
                                value: 'index',
                                label: 'name',
                                disabled: 'none',
                            }"
                            @change="changeDeviceChl"
                        />
                        <span v-show="deviceFormData.id && deviceFormData.disabled">{{ Translate('IDCS_OFFLINE') }}</span>
                    </el-form-item>
                    <!-- 声音设备 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_DEVICE')">
                        <el-checkbox
                            v-model="deviceFormData.audioInSwitch"
                            :disabled="deviceFormData.disabled"
                            :label="Translate('IDCS_ENABLE')"
                        />
                    </el-form-item>
                    <!-- 音频输入设备 -->
                    <el-form-item :label="Translate('IDCS_DEVICE_AUDIO_IN')">
                        <el-select-v2
                            v-model="deviceFormData.audioInput"
                            :options="deviceFormData.audioInputType"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.audioInput"
                        />
                    </el-form-item>
                    <!-- 音频输入音量 -->
                    <el-form-item :label="Translate('IDCS_IN_VOLUME')">
                        <BaseSliderInput
                            v-if="deviceFormData.audioInput === 'MIC'"
                            v-model="deviceFormData.micInVolume"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.micOrLinEnabled"
                            :max="deviceFormData.micMaxValue"
                            :value-on-disabled="null"
                        />
                        <BaseSliderInput
                            v-else
                            v-model="deviceFormData.linInVolume"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.micOrLinEnabled"
                            :max="deviceFormData.linMaxValue"
                            :value-on-disabled="null"
                        />
                    </el-form-item>
                    <!-- 扬声器（内置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_BUILT_IN')">
                        <el-select-v2
                            v-model="deviceFormData.loudSpeaker"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.loudSpeaker || deviceFormData.audioOutputswitch"
                            :options="deviceFormData.audioOutputType"
                        />
                        <el-checkbox
                            v-show="deviceFormData.isSpeakerMutex"
                            v-model="deviceFormData.loudSpeakerswitch"
                            :disabled="!deviceFormData.audioInSwitch"
                            @change="changeLoudSpeakerswitch"
                        />
                    </el-form-item>
                    <!-- LOUT（外置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_LINE_OUT')">
                        <el-select-v2
                            v-model="deviceFormData.audioOutput"
                            :options="deviceFormData.audioOutputType"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.audioOutput || deviceFormData.loudSpeakerswitch"
                        />
                        <el-checkbox
                            v-show="deviceFormData.isSpeakerMutex"
                            v-model="deviceFormData.audioOutputswitch"
                            :disabled="!deviceFormData.audioInSwitch"
                            @change="changeAudioOutputswitch"
                        />
                    </el-form-item>
                    <!-- 音频输出音量 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_OUT_VOLUME')">
                        <BaseSliderInput
                            v-model="deviceFormData.audioOutVolume"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.audioOutEnabled"
                            :max="deviceFormData.audioOutMaxValue"
                            :value-on-disabled="null"
                        />
                    </el-form-item>
                    <!-- 音频输入编码 -->
                    <el-form-item :label="Translate('IDCS_ENCODE_AUDIO_IN')">
                        <el-select-v2
                            v-model="deviceFormData.audioEncode"
                            :options="deviceFormData.audioEncodeType"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.audioEncode"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ENCODE_AUDIO_IN')">
                        <el-select-v2
                            v-model="deviceFormData.audioDenoise"
                            :options="deviceFormData.audioDenoiseType"
                            :disabled="!deviceFormData.audioInSwitch || !deviceFormData.audioDenoiseEnabled"
                        />
                    </el-form-item>
                    <div class="base-btn-box">
                        <el-button
                            :disabled="editDeviceFormData.disabled.value"
                            @click="setDeviceData"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </template>
            </el-form>
        </div>
        <!-- 本地声音报警 -->
        <div v-show="pageData.audioTab === 'nvrAudio' || pageData.audioTab === 'ipSpeaker'">
            <el-form
                v-show="pageData.audioTab === 'nvrAudio'"
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                    <BaseScheduleSelect
                        v-model="localFormData.audioSchedule"
                        :options="pageData.scheduleList"
                        @change="setLocalAudio"
                        @edit="pageData.isSchedulePop = true"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ALARM_VOLUME')">
                    <BaseSliderInput
                        v-model="localFormData.volume"
                        :min="0"
                        :max="100"
                        @change="setLocalAudio"
                    />
                </el-form-item>
                <div class="base-btn-box flex-start">{{ Translate('IDCS_FILE_LIST') }}</div>
            </el-form>
            <el-form
                v-show="pageData.audioTab === 'ipSpeaker'"
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_IPSPEAKER')">
                    <el-select-v2
                        v-model="pageData.ipSpeakerId"
                        :options="ipSepeakerList"
                        @change="changeIPSpeaker"
                    />
                    <span v-show="!ipSpeakerFormData.online">{{ Translate('IDCS_OFFLINE') }}</span>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_AUDIO_OUT_VOLUME')">
                    <BaseSliderInput
                        v-model="ipSpeakerFormData.volume"
                        :min="ipSpeakerFormData.volumeMin"
                        :max="ipSpeakerFormData.volumeMax"
                        :disabled="!ipSpeakerFormData.online"
                        @change="setIpSpeakerVolume"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SCHEDULE')">
                    <BaseScheduleSelect
                        v-model="ipSpeakerFormData.schedule"
                        :options="pageData.scheduleList"
                        :disabled="!ipSpeakerFormData.online"
                        @change="setIpSpeakerSchedule"
                        @edit="pageData.isSchedulePop = true"
                    />
                </el-form-item>
                <div class="base-btn-box flex-start">{{ Translate('IDCS_FILE_LIST') }}</div>
            </el-form>
            <div class="local">
                <el-table
                    ref="localTableRef"
                    v-title
                    :data="localFormData.list"
                    @row-click="handleRowClick"
                    @selection-change="handleSelectionChange"
                >
                    <el-table-column
                        type="selection"
                        width="55"
                    />
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_FILE_NAME')"
                        show-overflow-tooltip
                    />
                </el-table>
                <div class="local-btns">
                    <el-button @click="addAudio">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button
                        :disabled="!pageData.selectedLocalAudio.length"
                        @click="deleteLocalAudio"
                    >
                        {{ Translate('IDCS_DELETE') }}
                    </el-button>
                    <el-button
                        v-show="pageData.audioTab === 'ipSpeaker'"
                        :disabled="pageData.selectedLocalAudio.length !== 1"
                        @click="listenLocalAudio"
                    >
                        {{ Translate('IDCS_AUDITION') }}
                    </el-button>
                </div>
            </div>
        </div>
        <AudioUploadPop
            v-model="pageData.isImportAudioDialog"
            :type="pageData.audioTab"
            :ipc-data="alarmOutFormData"
            :format="pageData.audioTab === 'ipcAudio' ? [alarmOutFormData.audioFormat] : localFormData.formatType"
            :sample-rate="pageData.audioTab === 'ipcAudio' ? alarmOutFormData.sampleRate : ''"
            :audio-depth="pageData.audioTab === 'ipcAudio' ? alarmOutFormData.audioDepth : '16bit'"
            :audio-channel="pageData.audioTab === 'ipcAudio' ? alarmOutFormData.audioChannel : ''"
            :file-limit-size="pageData.audioTab === 'ipcAudio' ? alarmOutFormData.audioFileLimitSize : 1.5 * 1024 * 1024"
            @apply="confirmAddAudio"
            @close="closeAddAudio"
        />
        <!-- 排程管理弹窗 -->
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
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

.local {
    display: flex;
    margin-top: 10px;

    .el-table {
        width: 415px;
        height: 200px;
    }

    &-btns {
        display: flex;
        width: 80px;
        height: 180px;
        flex-direction: column;
        justify-content: center;
        margin-left: 10px;

        .el-button + .el-button {
            margin-left: 0 !important;
            margin-top: 10px;
        }
    }
}
</style>
