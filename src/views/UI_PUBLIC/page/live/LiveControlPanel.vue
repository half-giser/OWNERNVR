<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-18 14:45:58
 * @Description: 现场预览-操作视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 16:05:34
-->
<template>
    <div class="ctrl">
        <div class="ctrl-btns">
            <!-- 抓拍 -->
            <el-tooltip :content="Translate('IDCS_SNAP')">
                <BaseImgSprite
                    file="capture"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="snapDisabled"
                    @click="snap"
                />
            </el-tooltip>
            <!-- 关闭图像 -->
            <el-tooltip :content="Translate('IDCS_CLOSE_IMAGE')">
                <BaseImgSprite
                    file="close_chl"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="closeImgDisabled"
                    @click="closeImg"
                />
            </el-tooltip>
            <!-- 本地录像 -->
            <el-tooltip :content="winData.localRecording ? Translate('IDCS_CLIENT_RECORD_OFF') : Translate('IDCS_CLIENT_RECORD_ON')">
                <BaseImgSprite
                    :file="winData.localRecording ? 'recing' : 'rec (2)'"
                    :index="winData.localRecording ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="localRecordDisabled"
                    @click="localRecord(!winData.localRecording)"
                />
            </el-tooltip>
            <!-- 远程录像 -->
            <el-tooltip :content="remote ? Translate('IDCS_REMOTE_MANUAL_RECORD_OFF') : Translate('IDCS_REMOTE_MANUAL_RECORD_ON')">
                <BaseImgSprite
                    :file="remote ? 'remote_recing' : 'remote_rec'"
                    :index="remote ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="remoteRecordDisabled"
                    @click="remoteRecord(!remote)"
                />
            </el-tooltip>
            <!-- 放大 -->
            <el-tooltip :content="Translate('IDCS_ZOOM_IN')">
                <BaseImgSprite
                    file="magnify"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :disabled
                    :chunk="4"
                    @click="zoomIn"
                />
            </el-tooltip>
            <!-- 缩小 -->
            <el-tooltip :content="Translate('IDCS_ZOOM_OUT')">
                <BaseImgSprite
                    file="minify"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :disabled
                    :chunk="4"
                    @click="zoomOut"
                />
            </el-tooltip>
            <!-- 3D放大 -->
            <el-tooltip :content="Translate('IDCS_3D_ZOOM_IN')">
                <BaseImgSprite
                    file="magnify3d"
                    :index="winData.magnify3D ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :disabled="zoom3DDisabled"
                    :chunk="4"
                    @click="zoom3D"
                />
            </el-tooltip>
            <!-- 对讲 -->
            <el-tooltip :content="winData.talk ? Translate('IDCS_TALKBACK_OFF') : Translate('IDCS_TALKBACK_ON')">
                <BaseImgSprite
                    v-show="mode === 'ocx'"
                    :file="winData.talk ? 'ipcTalkBacking' : 'ipcTalkBack'"
                    :index="winData.talk ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :disabled="talkDisabled"
                    :chunk="4"
                    @click="talk(!winData.talk)"
                />
            </el-tooltip>
            <!-- 原始比例 -->
            <el-tooltip :content="Translate('IDCS_ORIGINAL_DISPLAY')">
                <BaseImgSprite
                    :file="winData.original ? 'originalDisplaying' : 'originalDisplay'"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="originalDisplayDisabled"
                    @click="originalDisplay"
                />
            </el-tooltip>
            <!-- 开门 -->
            <el-tooltip :content="Translate('IDCS_MANU_OPEN_DOOR')">
                <BaseImgSprite
                    v-show="!openDoorDisabled"
                    file="openDoor"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="openDoorDisabled"
                    @click="openDoor"
                />
            </el-tooltip>
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
        <div class="stream-menu">
            <el-radio-group
                class="nowrap"
                :model-value="winData.streamType"
                :disabled="streamTypeDisabled || pageData.isRTSP || winData.PLAY_STATUS !== 'play'"
                @update:model-value="changeStreamType"
            >
                <el-radio-button
                    v-for="item in pageData.streamMenuOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
        </div>

        <div
            v-show="winData.streamType === 2 && !streamTypeDisabled && winData.PLAY_STATUS === 'play'"
            class="stream-param"
        >
            <el-form
                class="narrow"
                :style="{
                    '--form-label-width': '100px',
                    '--form-input-width': '130px',
                }"
            >
                <el-form-item :label="Translate('IDCS_RESOLUTION_RATE')">
                    <el-select
                        v-model="streamFormData.resolution"
                        :disabled="streamOptionDisabled"
                        @change="changeResolution"
                    >
                        <el-option
                            v-for="item in pageData.resolutionOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FRAME_RATE')">
                    <el-select
                        v-model="streamFormData.frameRate"
                        :disabled="streamOptionDisabled"
                    >
                        <el-option
                            v-for="frameRate in pageData.maxFps"
                            :key="frameRate"
                            :label="frameRate"
                            :value="frameRate"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_VIDEO_QUALITY')">
                    <el-select
                        v-model="streamFormData.quality"
                        :disabled="streamOptionDisabled || streamQualityDisabled"
                    >
                        <el-option
                            v-for="item in displayQualityOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="pageData.isRTSP"
                        @click="setStreamData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
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
