<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 10:36:43
 * @Description: 回放-操作视图
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
                    :disabled="disabled"
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
                    :disabled="disabled"
                    @click="closeImg"
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
                :model-value="winData.streamType"
                :disabled="streamTypeDisabled"
                class="nowrap"
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
    </div>
</template>

<script lang="ts" src="./PlaybackControlPanel.v.ts"></script>

<style lang="scss" scoped>
.ctrl {
    display: block;

    &-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-left: 40px;

        & > * {
            margin: 2px 10px;
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
