<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-13 09:09:24
 * @Description: 时间切片-时间线界面
-->
<template>
    <div class="content">
        <div class="left">
            <h3>{{ Translate('IDCS_REPLAY') }}</h3>
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    only-wasm
                    type="record"
                    :split="1"
                    @ontime="handlePlayerTimeUpdate"
                />
            </div>
            <div class="control-bar">
                <span class="start-time">{{ displayTime(playerData.startTime) }}</span>
                <el-slider
                    v-model="playerData.currentTime"
                    :show-tooltip="false"
                    :min="playerData.startTime"
                    :max="playerData.endTime"
                    :disabled="playerData.startTime === 0 || playerData.endTime === 0"
                    @mousedown="handleSliderMouseDown"
                    @mouseup="handleSliderMouseUp"
                    @change="handleSliderChange"
                />
                <span class="end-time">{{ displayTime(playerData.endTime) }}</span>
            </div>
            <div
                class="current-time"
                :style="{
                    opacity: playerData.currentTime ? 1 : 0,
                }"
            >
                {{ displayDateTime(playerData.currentTime) }}
            </div>
            <h3>{{ Translate('IDCS_ARCHIVE_INFO') }}</h3>
            <el-form
                v-show="pageData.mode === 'day' && (formData.startTime || formData.endTime)"
                :class="{
                    '--form-label-width': '150px',
                }"
            >
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <el-input
                        :model-value="displayTime(formData.startTime)"
                        readonly
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <el-input
                        :model-value="displayTime(formData.endTime)"
                        readonly
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_RECORD_TIME')">
                    <el-text>{{ duration }}</el-text>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_DATA_LENGTH')">
                    <el-text>{{ displaySize(formData.size) }}</el-text>
                </el-form-item>
            </el-form>
            <div v-show="pageData.mode === 'day' && !formData.startTime && !formData.endTime">
                <el-button @click="showTimeRange">{{ Translate('IDCS_SET_BACKUP_TIME') }}</el-button>
            </div>
        </div>
        <div class="right">
            <div class="right-top">
                <div class="right-timeline">
                    <div class="right-timeline-view">
                        <BaseTimeline
                            ref="timelineRef"
                            :day-format="dateTime.dateTimeFormat"
                            :colors-map="pageData.legend"
                            :disable-zoom="true"
                            :disable-drag="true"
                            :color-set="2"
                            :enable-mask="pageData.timelineEnableMask"
                            @seek="handleTimelineSeek"
                            @dblclick="handleTimelineDblclick"
                            @change-mask="handleTimelineChangeMask"
                            @clear-mask="handleTimelineClearMask"
                        />
                    </div>
                    <div class="right-legend">
                        <div
                            v-for="item in pageData.legend"
                            :key="item.value"
                        >
                            <span :style="{ backgroundColor: item.color }"></span>
                            <span>{{ item.name }}</span>
                        </div>
                    </div>
                </div>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-radio-group
                            v-model="pageData.mode"
                            class="always-border"
                            @change="changeMode"
                        >
                            <el-radio-button
                                v-for="item in pageData.modeOptions"
                                v-show="item.hidden !== pageData.mode"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-radio-group>
                    </el-col>
                </el-row>
            </div>
            <div class="right-bottom">
                <div class="right-type">
                    <el-form
                        :style="{
                            '--form-label-width': '80px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_PICTURE')">
                            <el-select
                                v-model="pageData.sliceType"
                                :disabled="modeItem.disabled"
                                @change="changeSliceType"
                            >
                                <el-option
                                    v-for="item in modeItem.options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <div class="count">
                        <span>{{ pageData.timeSliceCount }}</span>
                        <span>/</span>
                        <span>{{ pageData.timeSliceList.length }}</span>
                    </div>
                </div>
                <div class="list-box">
                    <TimeSliceChlCard
                        v-for="item in pageData.timeSliceList"
                        :key="item.taskId"
                        mode="thumbnail"
                        :time="displayThumbnailTime(item.startTime)"
                        :pic="item.imgUrl"
                        :size="pageData.sliceType === 'minute' ? 'small' : 'normal'"
                        :active="!!pageData.activeTimeSlice && pageData.activeTimeSlice === item.taskId"
                        @click="playTimeSlice(item.startTime, item.endTime, item.taskId)"
                        @dblclick="changeTimeSlice(item.startTime)"
                    />
                </div>
            </div>
            <div class="base-btn-box padding">
                <el-button
                    :disabled="formData.size === 0"
                    @click="backUp"
                    >{{ Translate('IDCS_BACKUP') }}</el-button
                >
            </div>
        </div>
        <BasePluginNotice />
        <BackupPop
            v-model="pageData.isBackUpPop"
            :mode="mode"
            :backup-list="pageData.backupRecList"
            @confirm="confirmBackUp"
            @close="pageData.isBackUpPop = false"
        />
        <BackupLocalPop
            v-model="pageData.isLocalBackUpPop"
            :auth="userAuth"
            :backup-list="pageData.backupRecList"
            @close="pageData.isLocalBackUpPop = false"
        />
        <TimeSliceTimeRangePop
            v-model="pageData.isTimeRangePop"
            :date="chlStartTime"
            @confirm="confirmTimeRange"
            @close="pageData.isTimeRangePop = false"
        />
    </div>
</template>

<script lang="ts" src="./TimeSliceTimelinePanel.v.ts"></script>

<style lang="scss" scoped>
.content {
    width: 100%;
    height: 100%;
    display: flex;
}

.left {
    box-sizing: border-box;
    width: 438px;
    height: 100%;
    flex-shrink: 0;
    padding: 20px;
    border-right: 1px solid var(--input-border);

    h3 {
        font-size: 14px;
        padding-bottom: 10px;
        margin: 0;
    }
}

.player {
    width: 398px;
    height: 268px;
}

.control-bar {
    margin-top: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    height: 22px;
}

.start-time,
.end-time {
    padding: 5px;
    font-size: 12px;
    width: 80px;
    flex-shrink: 0;
    text-align: left;
    line-height: 1;
}

.end-time {
    text-align: right;
}

.current-time {
    width: 100%;
    margin-top: 10px;
    height: 40px;
    text-align: center;
}

.right {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &-top {
        padding: 20px 20px 10px;
        width: 100%;
        box-sizing: border-box;
        flex-shrink: 0;
        border-bottom: 1px solid var(--input-border);
    }

    &-timeline {
        border: 1px solid var(--input-border);
        margin-bottom: 10px;

        &-view {
            height: 75px;
        }
    }

    &-legend {
        border-top: 1px solid var(--input-border);
        height: 20px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        box-sizing: border-box;
        margin-right: 10px;
        font-size: 12px;

        div {
            margin: 0 10px;
            display: flex;
            align-items: center;
            height: 100%;

            span:first-child {
                width: 12px;
                height: 12px;
                margin-right: 5px;
            }
        }
    }

    &-bottom {
        height: 100%;
        overflow-y: scroll;
    }

    &-type {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > form:first-child {
            width: 300px;
        }
    }

    .count {
        display: flex;
        justify-content: flex-end;
        margin-right: 15px;
    }
}

.base-btn-box {
    margin-bottom: 10px;
}

.list-box {
    width: 100%;
    display: flex;
    padding: 20px;
    box-sizing: border-box;
    flex-wrap: wrap;
}
</style>
