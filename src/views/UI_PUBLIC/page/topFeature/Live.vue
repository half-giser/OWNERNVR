<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 19:53:54
 * @Description: 现场预览
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 13:41:49
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
        />
        <div class="center">
            <div class="center-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    :split="pageData.split"
                    :enable-pos="systemCaps.supportPOS"
                    type="live"
                    @onready="handlePlayerReady"
                    @onselect="handlePlayerSelect"
                    @onsuccess="handlePlayerSuccess"
                    @onstop="handlePlayerStop"
                    @onplay-status="handlePlayerStatus"
                    @onerror="handlePlayerError"
                    @onrecord-file="handlePlayerRecordFile"
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
                @update:client-record="toggleAllClientRecord"
                @update:remote-record="toggleAllRemoteRecord"
                @update:preview="toggleAllPreview"
                @update:osd="toggleOSD"
                @update:split="updateSplit"
                @update:talk="toggleAllTalk"
                @fullscreen="fullScreen"
                @stream-type="changeAllStreamType"
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
                <template #default="scope">
                    <LiveSnapPanel
                        v-if="isSnapPanel"
                        v-show="scope.index === 0"
                        :auth="userAuth"
                    />
                    <LiveControlPanel
                        v-show="scope.index === 1"
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
                    />
                    <LiveLensPanel
                        v-show="scope.index === 2"
                        :mode="mode"
                        :win-data="pageData.winData"
                        @update-support-az="updateSupportAz"
                    />
                    <LivePtzPanel
                        v-show="scope.index === 3"
                        :win-data="pageData.winData"
                        :chl="pageData.chlMap"
                        :mode="mode"
                    />
                    <LiveFishEyePanel
                        v-if="isFishEyePanel"
                        v-show="scope.index === 4"
                        ref="fisheyeRef"
                        :win-data="pageData.winData"
                        @update-support-fish-eye="updateSupportFishEye"
                        @fish-eye-mode="changeFishEyeMode"
                    />
                </template>
            </LiveAsidePanel>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./Live.v.ts"></script>

<style lang="scss" scoped>
.live {
    width: 100%;
    height: var(--live-content-height);
    border: 1px solid var(--input-border);
    display: flex;
    font-size: 14px;
}

.center {
    width: 100%;
    height: 100%;
    border-left: 1px solid var(--input-border);
    border-right: 1px solid var(--input-border);

    &-player {
        width: 100%;
        height: calc(100% - 50px);
    }
}
</style>
