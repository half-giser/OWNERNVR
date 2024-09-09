<!--
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:15
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-19 09:44:37
-->
<template>
    <el-tabs
        v-model="pageData.audioTab"
        class="audioTabs"
    >
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
                    height: '440px',
                }"
                label-position="left"
                inline-message
            >
                <el-form-item>
                    <el-radio-group
                        v-model="ipcAudioFormData.ipcRadio"
                        class="ipcRadio"
                    >
                        <el-radio-button value="audioAlarm">{{ Translate('IDCS_IPC_VOICE_BROADCAST') }}</el-radio-button>
                        <el-radio-button value="audioDevice">{{ Translate('IDCS_AUDIO_DEVICE') }}</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <div v-if="ipcAudioFormData.ipcRadio === 'audioAlarm'">
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select
                            v-model="ipcAudioFormData.audioChl"
                            :disabled="audioAlarmPageData.chlDisabled"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_AUDIO')">
                        <el-checkbox
                            v-model="ipcAudioFormData.audioChecked"
                            :disabled="audioAlarmPageData.audioCheckDisabled"
                            @change="changeAudioCheck"
                            >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                        >
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ALERT_VOICE')">
                        <el-select
                            v-model="ipcAudioFormData.voice"
                            :disabled="audioAlarmPageData.voiceDisabled"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_TIMES')">
                        <el-input
                            v-model="ipcAudioFormData.number"
                            :disabled="audioAlarmPageData.numberDisabled"
                            type="number"
                            :min="1"
                            :max="50"
                            @blur="blurNumber"
                        ></el-input>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ALARM_VOLUME')">
                        <el-input
                            v-model="ipcAudioFormData.volume"
                            :disabled="audioAlarmPageData.volumeDisabled"
                            type="number"
                            :min="0"
                            :max="100"
                            @blur="blurVolume"
                        ></el-input>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_LANGUAGE')">
                        <el-select
                            v-model="ipcAudioFormData.language"
                            :disabled="audioAlarmPageData.languageDisbaled"
                            placeholder=""
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
                </div>
                <div v-if="ipcAudioFormData.ipcRadio === 'audioDevice'">
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-select
                            v-model="ipcAudioFormData.deviceChl"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_AUDIO_DEVICE')">
                        <el-checkbox
                            v-model="ipcAudioFormData.deviceEnable"
                            :disabled="audioDevicePageData.deviceEnableDisabled"
                            @change="changeDeviceEnable"
                            >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                        >
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_DEVICE_AUDIO_IN')">
                        <el-select
                            v-model="ipcAudioFormData.deviceAudioInput"
                            :disabled="audioDevicePageData.deviceAudioInputDisabled"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_IN_VOLUME')">
                        <el-slider
                            v-model="ipcAudioFormData.micOrLinVolume"
                            :disabled="audioDevicePageData.micOrLinVolumeDisabled"
                            :min="0"
                            class="slider"
                            @change="changeMicOrLinVolume"
                        ></el-slider
                        ><span
                            v-show="!audioDevicePageData.micOrLinVolumeDisabled"
                            :style="{ marginLeft: '20px' }"
                            >{{ ipcAudioFormData.micOrLinVolume }}</span
                        >
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_BUILT_IN')">
                        <el-select
                            v-model="ipcAudioFormData.loudSpeaker"
                            :disabled="audioDevicePageData.loudSpeakerDisabled"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_DEVICE_SPEAKER_LINE_OUT')">
                        <el-select
                            v-model="ipcAudioFormData.deviceAudioOutput"
                            :disabled="audioDevicePageData.deviceAudioOutputDisabled"
                            placeholder=""
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
                    <el-form-item :label="Translate('IDCS_AUDIO_OUT_VOLUME')">
                        <el-slider
                            v-model="ipcAudioFormData.outputVolume"
                            :disabled="audioDevicePageData.outputVolumeDisabled"
                            :min="0"
                            class="slider"
                            @change="changeOutputVolume"
                        >
                        </el-slider
                        ><span
                            v-show="!audioDevicePageData.outputVolumeDisabled"
                            :style="{ marginLeft: '20px' }"
                            >{{ ipcAudioFormData.outputVolume }}</span
                        >
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ENCODE_AUDIO_IN')">
                        <el-select
                            v-model="ipcAudioFormData.audioEncode"
                            :disabled="audioDevicePageData.audioEncodeDisabled"
                            placeholder=""
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
                </div>
            </el-form>
            <el-form
                ref="popMsgRef"
                class="stripe narrow"
                :style="{
                    '--form-input-width': '215px',
                }"
                label-position="left"
                inline-message
            >
                <div class="base-subheading-box">{{ Translate('IDCS_AUDIO_LINK_SCHEDULE') }}</div>
                <el-form-item
                    prop="popMsgDuration"
                    :label="Translate('IDCS_SCHEDULE_CONFIG')"
                >
                    <el-select
                        v-model="pageData.audioSchedule"
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
                        class="btn-ok"
                        @click="setData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </el-form>
        </el-tab-pane>
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
                    table-layout="fixed"
                    empty-text=" "
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
        @close="pageData.scheduleManagPopOpen = false"
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
        background-color: var(--bg-color4);
        padding: 0 15px;
    }

    /* tab项的文字样式 */
    :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: bolder;
        color: var(--text-primary);
    }

    /* 鼠标选中时样式 */
    :deep(.el-tabs__item.is-active) {
        color: #00bbdb;
        opacity: 1;
    }
    /* 鼠标悬浮时样式 */
    :deep(.el-tabs__item:hover) {
        color: #00bbdb;
        cursor: pointer;
        opacity: 1;
    }
}

.ipcRadio {
    :deep(.el-radio-button.is-active) {
        --el-radio-button-checked-bg-color: #00bbdb;
        --el-radio-button-checked-border-color: #00bbdb;
    }

    :deep(.el-radio-button__inner:hover) {
        background-color: #e1fbff;
        color: var(--text-primary);
    }

    :deep(.el-radio-button.is-active .el-radio-button__inner:hover) {
        background-color: #00bbdb;
        color: #ffffff;
    }
}

.slider {
    width: 200px;
}

.ipcAudioTips {
    color: #8d8d8d;
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
