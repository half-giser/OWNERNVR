<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 回放
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 15:29:05
-->
<template>
    <div class="playback">
        <PlaybackChannelPanel
            :mode="mode"
            @search="handleChlSearch"
            @change="handleChlChange"
            @play="handleChlPlay"
        >
            <PlaybackEventPanel
                :smd-rec-log-play="pageData.smdRecLogPlay"
                @change="changeEvent"
            />
        </PlaybackChannelPanel>
        <div class="center">
            <div class="center-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    :split="pageData.split"
                    :enable-pos="systemCaps.supportPOS"
                    type="record"
                    @onready="handlePlayerReady"
                    @ontime="handlePlayerTimeUpdate"
                    @onselect="handlePlayerSelect"
                    @onsuccess="handlePlayerSuccess"
                    @onstop="handlePlayerStop"
                    @onplay-status="handlePlayerStatus"
                    @onerror="handlePlayerError"
                    @ondblclickchange="handlePlayerDblclickChange"
                    @onwinexchange="updateTimeline"
                />
            </div>
            <div class="center-ctrl">
                <PlaybackScreenPanel
                    :win-data="pageData.winData"
                    :play-status="pageData.playStatus"
                    :mode="mode"
                    :split="pageData.split"
                    :osd="pageData.osd"
                    :pos="pageData.pos"
                    :watermark="pageData.watermark"
                    :playing-list="playingListNum"
                    :clip-range="pageData.timelineClipRange"
                    @fullscreen="fullScreen"
                    @update:split="setSplit"
                    @update:osd="toggleOSD"
                    @update:watermark="toggleWatermark"
                    @update:pos="togglePos"
                    @pause="pause"
                    @pause-backwards="pauseBackwards"
                    @stop="stop"
                    @resume="resume"
                    @backwards="playBackwards"
                    @prev-frame="prevFrames"
                    @next-frame="nextFrame"
                    @set-speed="setSpeed"
                    @jump="jump"
                    @clip-start="clipStart"
                    @clip-end="clipEnd"
                    @back-up="backUp"
                />
                <PlaybackBackUpPanel
                    ref="backUpRef"
                    v-model:visible="pageData.isBackUpList"
                    :mode
                />
                <PlaybackRecLogPanel
                    :start-time="startTimeStamp"
                    :end-time="endTimeStamp"
                    :event-list="pageData.eventList"
                    :mode-type="pageData.eventModeType"
                    :date-time-format="dateTime.dateTimeFormat.value"
                    :chl="pageData.winData.chlID"
                    :play-status="pageData.playStatus"
                    :chls="pageData.chls"
                    @callback="handleRecLogCallback"
                    @play="handleRecLogPlay"
                    @download="handleRecLogDownload"
                    @error="handleRecLogError"
                />
            </div>
            <div class="bottom">
                <el-calendar v-model="calendar.date.value">
                    <template #header="scope">
                        <div class="calendar-header">
                            <span @click="calendar.prevMonth">&lt;</span>
                            <span>{{ scope.date }}</span>
                            <span @click="calendar.nextMonth">&gt;</span>
                        </div>
                    </template>
                    <template #date-cell="scope">
                        <div
                            :class="{
                                active: calendar.current.value.getTime() === scope.data.date.getTime(),
                                badge: calendar.highlight(pageData.recTimeList, scope.data.date),
                            }"
                            @click="calendar.change(scope.data.date)"
                        >
                            {{ scope.data.day.split('-')[2] }}
                        </div>
                    </template>
                </el-calendar>
                <div class="timeline">
                    <div class="timeline-view">
                        <BaseTimeline
                            ref="timelineRef"
                            :date-time-format="dateTime.dateTimeFormat.value"
                            :time-format="dateTime.timeFormat.value"
                            :colors-map="pageData.legend"
                            @seek="seek"
                            @set-offset-x="pageData.timelineOffsetX = $event"
                            @set-max-coordinate-x="pageData.timelineMaxCoordinateX = $event"
                            @set-current-pointer-time="pageData.timelineCurrentPointerTime = $event"
                            @clip-range="pageData.timelineClipRange = $event"
                        />
                    </div>
                    <div class="legend">
                        <div
                            v-for="item in pageData.legend"
                            :key="item.value"
                        >
                            <span :style="{ backgroundColor: item.color }"></span>
                            <span>{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PlaybackAsidePanel
            :mode="mode"
            :support-fish-eye="!!pageData.fishEye"
            :win-data="pageData.winData"
        >
            <template #default="scope">
                <PlaybackControlPanel
                    v-show="scope.index === 0"
                    :mode="mode"
                    :win-data="pageData.winData"
                    :volume="pageData.volume"
                    :split="pageData.split"
                    @snap="snap"
                    @close-img="closeImg"
                    @zoom-in="zoomIn"
                    @zoom-out="zoomOut"
                    @original-display="displayOriginal"
                    @stream-type="changeStreamType"
                    @volume="setVolume"
                    @audio="setAudio"
                />
                <PlaybackFisheyePanel
                    v-if="isFishEyePanel"
                    v-show="scope.index === 1"
                    ref="fisheyeRef"
                    :win-data="pageData.winData"
                    :install-type="pageData.fishEye"
                    @fish-eye-mode="changeFishEyeMode"
                />
            </template>
        </PlaybackAsidePanel>
        <PlaybackBackUpPop
            v-model="pageData.isBackUpPop"
            :mode
            :backup-list="pageData.backupRecList"
            @confirm="confirmBackUp"
            @close="pageData.isBackUpPop = false"
        />
        <PlaybackBackUpLocalPop
            v-model="pageData.isLocalBackUpPop"
            :auth="userAuth"
            :backup-list="pageData.backupRecList"
            @close="pageData.isLocalBackUpPop = false"
        />
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./Playback.v.ts"></script>

<style lang="scss" scoped>
.playback {
    width: 100%;
    height: calc(var(--content-height) + 70px);
    border: 1px solid var(--border-color7);
    display: flex;
    font-size: 14px;
    min-width: 1400px;
}

.center {
    width: 100%;
    height: 100%;
    border-left: 1px solid var(--border-color7);
    border-right: 1px solid var(--border-color7);

    &-player {
        width: 100%;
        height: calc(100% - 222px);
    }

    &-ctrl {
        padding: 0 10px;
        height: 50px;
        display: flex;
        align-items: center;
    }
}

.bottom {
    height: 170px;
    display: flex;

    .el-calendar {
        width: 250px;
        height: 170px;
        flex-shrink: 0;
    }
}

.calendar-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-menu-04);
    font-weight: bolder;
    background-color: var(---bg-table);

    span:first-child,
    span:last-child {
        font-size: 24px;
        font-weight: normal;
        cursor: pointer;
    }
}

.timeline {
    width: 100%;
    height: 100%;

    &-view {
        height: calc(100% - 20px);
    }
}

.legend {
    background-color: var(--timeline-legend-bg-color);
    color: var(--timeline-scale-text-color);
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
</style>
