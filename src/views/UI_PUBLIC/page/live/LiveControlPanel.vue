<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-18 14:45:58
 * @Description: 现场预览-操作视图
-->
<template>
    <div class="ctrl">
        <div class="ctrl-btns">
            <!-- 抓拍 -->
            <BaseImgSpriteBtn
                file="capture"
                :title="Translate('IDCS_SNAP')"
                :disabled="snapDisabled"
                @click="$emit('trigger'), $emit('snap')"
            />
            <!-- 关闭图像 -->
            <BaseImgSpriteBtn
                file="close_chl"
                :title="Translate('IDCS_CLOSE_IMAGE')"
                :disabled="closeImgDisabled"
                @click="$emit('trigger'), $emit('closeImg')"
            />
            <!-- 本地录像 -->
            <BaseImgSpriteBtn
                :file="winData.localRecording ? 'recing' : 'rec_client'"
                :title="winData.localRecording ? Translate('IDCS_CLIENT_RECORD_OFF') : Translate('IDCS_CLIENT_RECORD_ON')"
                :active="winData.localRecording"
                :disabled="localRecordDisabled"
                @click="$emit('trigger'), $emit('localRecord', !winData.localRecording)"
            />
            <!-- 远程录像 -->
            <BaseImgSpriteBtn
                v-show="!systemCaps.hotStandBy"
                :file="remote ? 'remote_recing' : 'remote_rec'"
                :title="remote ? Translate('IDCS_REMOTE_MANUAL_RECORD_OFF') : Translate('IDCS_REMOTE_MANUAL_RECORD_ON')"
                :active="remote"
                :disabled="remoteRecordDisabled"
                @click="remoteRecord(!remote)"
            />
            <!-- 放大 -->
            <BaseImgSpriteBtn
                file="magnify"
                :title="Translate('IDCS_ZOOM_IN')"
                :disabled
                @click="$emit('trigger'), $emit('zoomIn')"
            />
            <!-- 缩小 -->
            <BaseImgSpriteBtn
                file="minify"
                :title="Translate('IDCS_ZOOM_OUT')"
                :disabled
                @click="$emit('trigger'), $emit('zoomOut')"
            />
            <!-- 3D放大 -->
            <BaseImgSpriteBtn
                file="magnify3d"
                :title="Translate('IDCS_3D_ZOOM_IN')"
                :active="winData.magnify3D"
                :disabled="zoom3DDisabled"
                @click="$emit('trigger'), $emit('zoom', !winData.magnify3D)"
            />
            <!-- 对讲 -->
            <BaseImgSpriteBtn
                v-show="mode === 'ocx'"
                :file="winData.talk ? 'ipcTalkBacking' : 'ipcTalkBack'"
                :title="winData.talk ? Translate('IDCS_TALKBACK_OFF') : Translate('IDCS_TALKBACK_ON')"
                :active="winData.talk"
                :disabled="talkDisabled"
                @click="$emit('trigger'), $emit('talk', !winData.talk)"
            />
            <!-- 原始比例 -->
            <BaseImgSpriteBtn
                :file="winData.original ? 'originalDisplaying' : 'originalDisplay'"
                :title="Translate('IDCS_ORIGINAL_DISPLAY')"
                :disabled="originalDisplayDisabled"
                @click="$emit('trigger'), $emit('originalDisplay', !winData.original)"
            />
            <!-- 开门 -->
            <BaseImgSpriteBtn
                v-show="!openDoorDisabled"
                file="openDoor"
                :title="Translate('IDCS_MANU_OPEN_DOOR')"
                :disabled="openDoorDisabled"
                @click="openDoor"
            />
            <!-- 雨刷 -->
            <BaseImgSpriteBtn
                v-show="!wiperDisabled"
                file="ptzBrushOpen"
                :title="Translate('IDCS_RUN')"
                :disabled="wiperDisabled"
                @click="runWiper"
            />
            <BaseImgSpriteBtn
                v-show="!wiperDisabled"
                file="ptzBrushClose"
                :title="Translate('IDCS_STOP')"
                :disabled="wiperDisabled"
                @click="stopWiper"
            />
        </div>
        <!-- 音量控制 -->
        <div class="voice">
            <BaseVoiceCtrl
                :volume="volume"
                :mute="!winData.audio || winData.PLAY_STATUS !== 'play'"
                :disabled="audioDisabled"
                @update:volume="setVolume"
                @update:mute="setAudioStatus"
            />
        </div>
        <!-- 码流控制 -->
        <div
            v-show="!systemCaps.hotStandBy"
            class="stream-menu"
        >
            <!-- RTSP通道无子码流 -->
            <el-radio-group
                class="nowrap"
                :model-value="winData.streamType"
                :disabled="pageData.isRTSP || winData.PLAY_STATUS !== 'play'"
                @update:model-value="changeStreamType"
            >
                <el-radio-button
                    v-for="item in pageData.streamMenuOptions"
                    :key="item.value"
                    :value="item.value"
                    :disabled="streamTypeDisabled && item.value === 1"
                    :label="item.label"
                />
            </el-radio-group>
        </div>

        <div
            v-show="winData.streamType === 2 && winData.PLAY_STATUS === 'play' && !systemCaps.hotStandBy"
            class="stream-param"
        >
            <el-form
                v-title
                :style="{
                    '--form-label-width': '100px',
                    '--form-input-width': '130px',
                }"
            >
                <el-form-item :label="Translate('IDCS_RESOLUTION_RATE')">
                    <BaseSelect
                        v-model="streamFormData.resolution"
                        :disabled="streamOptionDisabled"
                        :options="pageData.resolutionOptions"
                        @change="changeResolution"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FRAME_RATE')">
                    <BaseSelect
                        v-model="streamFormData.frameRate"
                        :disabled="streamOptionDisabled"
                        :options="fpsOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_VIDEO_QUALITY')">
                    <BaseSelect
                        v-model="streamFormData.quality"
                        :disabled="streamOptionDisabled || streamQualityDisabled"
                        :options="displayQualityOptions"
                    />
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="streamOptionDisabled"
                        @click="setStreamData"
                    >
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveControlPanel.v.ts"></script>

<style lang="scss" scoped>
.ctrl {
    &-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-left: 20px;

        & > * {
            margin: 10px 2px;
        }
    }

    .hide {
        opacity: 0;
        pointer-events: none;
    }
}

.voice {
    width: 220px;
    margin: 0 auto;
}

.stream {
    &-menu {
        width: 100%;
        display: flex;
        justify-content: center;
        margin: 10px auto;
        cursor: pointer;
    }
}
</style>
