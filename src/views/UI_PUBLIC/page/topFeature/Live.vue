<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 19:53:54
 * @Description: 现场预览
-->
<template>
    <div class="live">
        <LiveChannelPanel
            ref="chlRef"
            :mode="mode"
            :playing-list="pageData.playingList"
            @ready="getChlMap"
            @refresh="getChlMap"
            @play="playChl"
            @polling="playChlGroup"
            @custom="playCustomView"
            @trigger="clearTargetDetect"
        />
        <div class="center">
            <div class="center-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    :split="pageData.split"
                    :enable-pos="systemCaps.supportPOS"
                    @ready="handlePlayerReady"
                    @select="handlePlayerSelect"
                    @success="handlePlayerSuccess"
                    @stop="handlePlayerStop"
                    @play-status="handlePlayerStatus"
                    @error="handlePlayerError"
                    @record-file="handlePlayerRecordFile"
                    @message="notify"
                    @audioerror="handlePlayerAudioError"
                />
                <BaseTargetSearchPanel
                    v-model:visible="pageData.isDetectTarget"
                    type="live"
                    :mode="mode"
                    :snap-pic="getSnapBase64"
                    :win-index="pageData.winData.winIndex"
                />
            </div>
            <LiveScreenPanel
                :mode="mode"
                :win-data="pageData.winData"
                :split="pageData.split"
                :osd="pageData.osd"
                :preview="pageData.allPreview"
                :client-record="pageData.allClientRecord"
                :remote-record="pageData.allRemoteRecord"
                :talk="pageData.allTalk"
                :detect-target="pageData.isDetectTarget"
                @update:client-record="toggleAllClientRecord"
                @update:remote-record="toggleAllRemoteRecord"
                @update:preview="toggleAllPreview"
                @update:osd="toggleOSD"
                @update:split="updateSplit"
                @update:talk="toggleAllTalk"
                @fullscreen="fullScreen"
                @stream-type="changeAllStreamType"
                @update:detect-target="pageData.isDetectTarget = $event"
                @trigger="clearTargetDetect"
            />
        </div>
        <div class="right">
            <LiveAsidePanel
                :mode="mode"
                :win-data="pageData.winData"
                :support-az="pageData.supportAz"
                :support-fish-eye="pageData.supportFishEye"
                :chl="pageData.chlMap"
                :auth="userAuth"
            >
                <template #default="{ index }">
                    <LiveSnapPanel
                        v-if="isSnapPanel"
                        v-show="index === 0"
                        :auth="userAuth"
                    />
                    <LiveControlPanel
                        v-show="index === 1"
                        :mode="mode"
                        :split="pageData.split"
                        :win-data="pageData.winData"
                        :auth="userAuth"
                        :chl="pageData.chlMap"
                        :remote="pageData.remoteRecord"
                        :volume="pageData.volume"
                        @snap="snap"
                        @close-img="closeImg"
                        @zoom="zoom3D"
                        @zoom-in="zoomIn"
                        @zoom-out="zoomOut"
                        @original-display="displayOriginal"
                        @local-record="recordLocal"
                        @remote-record="recordRemote"
                        @stream-type="changeStreamType"
                        @volume="setVolume"
                        @audio="setAudio"
                        @talk="toggleTalk"
                        @trigger="clearTargetDetect"
                    />
                    <LiveLensPanel
                        v-show="index === 2"
                        :mode="mode"
                        :win-data="pageData.winData"
                        @update-support-az="updateSupportAz"
                        @trigger="clearTargetDetect"
                    />
                    <LivePtzPanel
                        v-show="index === 3"
                        :win-data="pageData.winData"
                        :chl="pageData.chlMap"
                        :mode="mode"
                        @trigger="clearTargetDetect"
                    />
                    <LiveFishEyePanel
                        v-if="isFishEyePanel"
                        v-show="index === 4"
                        ref="fisheyeRef"
                        :win-data="pageData.winData"
                        @update-support-fish-eye="updateSupportFishEye"
                        @fish-eye-mode="changeFishEyeMode"
                        @trigger="clearTargetDetect"
                    />
                </template>
            </LiveAsidePanel>
        </div>
    </div>
</template>

<script lang="ts" src="./Live.v.ts"></script>

<style lang="scss" scoped>
.live {
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
        height: calc(100% - 50px);
        position: relative;
    }
}
</style>
