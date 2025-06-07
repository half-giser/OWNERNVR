<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 回放
-->
<template>
    <div class="playback">
        <PlaybackChannelPanel
            ref="chlRef"
            :mode="mode"
            @search="handleChlSearch"
            @change="handleChlChange"
            @play="handleChlPlay"
            @trigger="clearTargetDetect"
        >
            <PlaybackEventPanel
                @change="changeEvent"
                @ready="getAllEventList"
            />
        </PlaybackChannelPanel>
        <div class="center">
            <div class="center-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    :split="pageData.split"
                    :enable-pos="systemCaps.supportPOS"
                    :enable-draw="false"
                    type="record"
                    @ready="handlePlayerReady"
                    @time="handlePlayerTimeUpdate"
                    @select="handlePlayerSelect"
                    @success="handlePlayerSuccess"
                    @stop="handlePlayerStop"
                    @play-status="handlePlayerStatus"
                    @error="handlePlayerError"
                    @dblclickchange="handlePlayerDblclickChange"
                    @winexchange="updateTimeline"
                    @message="notify"
                    @audioerror="handlePlayerAudioError"
                />
                <BaseTargetSearchPanel
                    v-model:visible="pageData.isDetectTarget"
                    type="record"
                    :mode="mode"
                    :start-time="pageData.detectTargetTime"
                    :end-time="pageData.detectTargetTime + 60 * 1000"
                    :win-index="pageData.winData.winIndex"
                    :chl-id="pageData.winData.chlID"
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
                    :has-pos-event="pageData.hasPosEvent"
                    :strategy="pageData.strategy"
                    :is-back-up-list="pageData.isBackUpList"
                    :detect-target="pageData.isDetectTarget"
                    :rec-list="pageData.recLogList"
                    @update:detect-target="changeDetectTarget"
                    @fullscreen="fullScreen"
                    @update:split="changeSplit"
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
                    @show-back-up="pageData.isBackUpList = true"
                    @update:strategy="changeStrategy"
                    @trigger="clearTargetDetect"
                />
                <PlaybackBackUpPanel
                    ref="backUpRef"
                    v-model:visible="pageData.isBackUpList"
                    :mode
                />
            </div>
            <div class="bottom">
                <BaseCalendar
                    v-model="pageData.calendarDate"
                    :badge="pageData.recTimeList"
                />
                <div class="timeline">
                    <div class="timeline-view">
                        <BaseTimeline
                            ref="timelineRef"
                            :colors-map="pageData.legend"
                            @seek="handleTimelineSeek"
                            @set-offset-x="pageData.timelineOffsetX = $event"
                            @set-max-coordinate-x="pageData.timelineMaxCoordinateX = $event"
                            @set-current-pointer-time="pageData.timelineCurrentPointerTime = $event"
                            @clip-range="pageData.timelineClipRange = $event"
                        />
                    </div>
                    <div class="legend">
                        <div
                            v-for="item in pageData.legend.toReversed()"
                            v-show="item.value !== 'otherType'"
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
            <template #default="{ index }">
                <PlaybackControlPanel
                    v-show="index === 0"
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
                    @trigger="clearTargetDetect"
                />
                <PlaybackFisheyePanel
                    v-if="isFishEyePanel"
                    v-show="index === 1"
                    ref="fisheyeRef"
                    :win-data="pageData.winData"
                    :install-type="pageData.fishEye"
                    @fish-eye-mode="changeFishEyeMode"
                    @trigger="clearTargetDetect"
                />
            </template>
        </PlaybackAsidePanel>
        <BackupPop
            v-model="pageData.isBackUpPop"
            :mode
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
    </div>
</template>

<script lang="ts" src="./Playback.v.ts"></script>

<style lang="scss" scoped>
.playback {
    width: 100%;
    height: 100%;
    min-height: calc(var(--main-min-height) - 150px);
    border: 1px solid var(--live-border);
    display: flex;
    font-size: 14px;
}

.center {
    width: 100%;
    height: 100%;
    border-left: 1px solid var(--live-border);
    border-right: 1px solid var(--live-border);
    background-color: var(--main-bg);

    &-player {
        width: 100%;
        height: calc(100% - 222px);
        position: relative;
    }

    &-ctrl {
        padding: 0 0 0 5px;
        height: 50px;
        display: flex;
        align-items: center;
    }
}

.bottom {
    height: 172px;
    display: flex;
}

.timeline {
    width: 100%;
    height: 100%;

    &-view {
        height: calc(100% - 20px);
    }
}

.legend {
    background-color: var(--timeline-legend-bg);
    color: var(--timeline-scale-text-01);
    height: 20px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    margin-right: 10px;
    font-size: 12px;

    div {
        margin: 0 5px;
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
