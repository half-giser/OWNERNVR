<!--
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:15
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
                        />
                        <span
                            v-show="alarmOutList[pageData.alarmOutIndex].disabled"
                            class="state"
                        >
                            {{ Translate('IDCS_QUERY_DATA_FAIL').replace(/，/g, '') }}
                        </span>
                    </el-form-item>
                    <!-- 声音 -->
                    <el-form-item :label="Translate('IDCS_AUDIO')">
                        <el-checkbox
                            v-model="alarmOutList[pageData.alarmOutIndex].audioSwitch"
                            :disabled="alarmOutList[pageData.alarmOutIndex].disabled"
                            :label="Translate('IDCS_ENABLE')"
                        />
                    </el-form-item>
                    <!-- 语音 -->
                    <el-form-item :label="Translate('IDCS_ALERT_VOICE')">
                        <el-select-v2
                            v-model="alarmOutList[pageData.alarmOutIndex].audioType"
                            :disabled="alarmOutList[pageData.alarmOutIndex].disabled || !alarmOutList[pageData.alarmOutIndex].audioSwitch"
                            :options="alarmOutList[pageData.alarmOutIndex].audioTypeList"
                        />
                        <div class="state">
                            <el-button
                                :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch"
                                @click="addAudio"
                            >
                                {{ Translate('IDCS_ADD') }}
                            </el-button>
                            <el-button
                                :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch || alarmOutList[pageData.alarmOutIndex].audioType < 100"
                                @click="deleteAudio"
                            >
                                {{ Translate('IDCS_DELETE') }}
                            </el-button>
                            <el-button
                                :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch"
                                @click="listenAudio"
                            >
                                {{ Translate('IDCS_AUDITION') }}
                            </el-button>
                        </div>
                    </el-form-item>
                    <!-- 次数 -->
                    <el-form-item :label="Translate('IDCS_TIMES')">
                        <BaseNumberInput
                            v-model="alarmOutList[pageData.alarmOutIndex].alarmTimes"
                            :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch || alarmOutList[pageData.alarmOutIndex].alarmTimesDisabled"
                            :min="1"
                            :max="50"
                            value-on-clear="min"
                        />
                    </el-form-item>
                    <!-- 音量 -->
                    <el-form-item :label="Translate('IDCS_ALARM_VOLUME')">
                        <BaseNumberInput
                            v-model="alarmOutList[pageData.alarmOutIndex].audioVolume"
                            :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch || alarmOutList[pageData.alarmOutIndex].audioVolumeDisabled"
                            :min="0"
                            :max="100"
                            value-on-clear="min"
                            @change="changeAudioVolume"
                        />
                    </el-form-item>
                    <!-- 语言 -->
                    <el-form-item :label="Translate('IDCS_LANGUAGE')">
                        <el-select-v2
                            v-model="alarmOutList[pageData.alarmOutIndex].languageType"
                            :disabled="!alarmOutList[pageData.alarmOutIndex].audioSwitch || alarmOutList[pageData.alarmOutIndex].audioType >= 100"
                            :options="alarmOutList[pageData.alarmOutIndex].langArr"
                        />
                    </el-form-item>
                </template>
                <!-- 声音设备 -->
                <template v-if="pageData.ipcAudioTab === 'audioDevice'">
                    <!-- 通道 -->
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select-v2
                            v-model="pageData.deviceIndex"
                            :options="deviceList"
                            :disabled="!deviceList.length || deviceList[pageData.deviceIndex].id === ''"
                            :props="{
                                value: 'index',
                                label: 'name',
                                disabled: 'none',
                            }"
                        />
                        <span v-show="deviceList[pageData.deviceIndex].id && deviceList[pageData.deviceIndex].disabled">{{ Translate('IDCS_OFFLINE') }}</span>
                    </el-form-item>
                    <!-- 声音设备 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_DEVICE')">
                        <el-checkbox
                            v-model="deviceList[pageData.deviceIndex].audioInSwitch"
                            :disabled="deviceList[pageData.deviceIndex].disabled"
                            :label="Translate('IDCS_ENABLE')"
                        />
                    </el-form-item>
                    <!-- 音频输入设备 -->
                    <el-form-item :label="Translate('IDCS_DEVICE_AUDIO_IN')">
                        <el-select-v2
                            v-model="deviceList[pageData.deviceIndex].audioInput"
                            :options="deviceList[pageData.deviceIndex].audioInputType"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].audioInput"
                        />
                    </el-form-item>
                    <!-- 音频输入音量 -->
                    <el-form-item :label="Translate('IDCS_IN_VOLUME')">
                        <BaseSliderInput
                            v-if="deviceList[pageData.deviceIndex].audioInput === 'MIC'"
                            v-model="deviceList[pageData.deviceIndex].micInVolume"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].micOrLinEnabled"
                            :max="deviceList[pageData.deviceIndex].micMaxValue"
                            :value-on-disabled="null"
                        />
                        <BaseSliderInput
                            v-else
                            v-model="deviceList[pageData.deviceIndex].linInVolume"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].micOrLinEnabled"
                            :max="deviceList[pageData.deviceIndex].linMaxValue"
                            :value-on-disabled="null"
                        />
                    </el-form-item>
                    <!-- 扬声器（内置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_BUILT_IN')">
                        <el-select-v2
                            v-model="deviceList[pageData.deviceIndex].loudSpeaker"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].loudSpeaker"
                            :options="deviceList[pageData.deviceIndex].audioOutputType"
                        />
                    </el-form-item>
                    <!-- LOUT（外置） -->
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_LINE_OUT')">
                        <el-select-v2
                            v-model="deviceList[pageData.deviceIndex].audioOutput"
                            :options="deviceList[pageData.deviceIndex].audioOutputType"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].audioOutput"
                        />
                    </el-form-item>
                    <!-- 音频输出音量 -->
                    <el-form-item :label="Translate('IDCS_AUDIO_OUT_VOLUME')">
                        <BaseSliderInput
                            v-model="deviceList[pageData.deviceIndex].audioOutVolume"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].audioOutEnabled"
                            :max="deviceList[pageData.deviceIndex].audioOutMaxValue"
                            :value-on-disabled="null"
                        />
                    </el-form-item>
                    <!-- 音频输入编码 -->
                    <el-form-item :label="Translate('IDCS_ENCODE_AUDIO_IN')">
                        <el-select-v2
                            v-model="deviceList[pageData.deviceIndex].audioEncode"
                            :options="deviceList[pageData.deviceIndex].audioEncodeType"
                            :disabled="!deviceList[pageData.deviceIndex].audioInSwitch || !deviceList[pageData.deviceIndex].audioEncode"
                        />
                    </el-form-item>
                </template>
            </el-form>
            <el-form v-title>
                <!-- 排程 -->
                <div class="base-head-box">{{ Translate('IDCS_AUDIO_LINK_SCHEDULE') }}</div>
                <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                    <BaseScheduleSelect
                        v-model="pageData.schedule"
                        :options="pageData.scheduleList"
                        @change="pageData.isScheduleChanged = true"
                        @edit="pageData.isSchedulePop = true"
                    />
                </el-form-item>
                <el-form-item>
                    <span class="text-tips">*{{ Translate('IDCS_AUDIO_LINK_SCHEDULE_TIPS') }}</span>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="btnDisabled"
                        @click="setData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </el-form>
        </el-tab-pane>
        <!-- 本地声音报警 -->
        <el-tab-pane
            v-if="pageData.supportAlarmAudioConfig"
            :name="pageTabs[1].name"
            :label="pageTabs[1].label"
        >
            <div class="base-btn-box flex-start collapse">{{ Translate('IDCS_FILE_LIST') }}</div>
            <div class="local">
                <el-table
                    ref="localTableRef"
                    v-title
                    :data="localList"
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
                        show-overflow-tooltip
                    />
                </el-table>
                <div class="local-btns">
                    <el-button @click="addAudio">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button @click="deleteLocalAudio">{{ Translate('IDCS_DELETE') }}</el-button>
                </div>
            </div>
        </el-tab-pane>
    </el-tabs>
    <AudioUploadPop
        v-model="pageData.isImportAudioDialog"
        :type="pageData.audioTab"
        :ipc-audio-chl="alarmOutList[pageData.alarmOutIndex].id"
        :ipc-row-data="alarmOutList[pageData.alarmOutIndex]"
        @apply="confirmAddAudio"
        @close="closeAddAudio"
    />
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.isSchedulePop"
        @close="closeSchedulePop"
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

.local {
    display: flex;
    margin-top: 10px;

    .el-table {
        width: 450px;
        height: 180px;
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
