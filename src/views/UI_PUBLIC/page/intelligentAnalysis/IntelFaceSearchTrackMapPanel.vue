<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-13 09:25:11
 * @Description: 智能分析 - 人脸搜索 - 轨迹
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-14 09:09:38
-->
<template>
    <div class="track">
        <div
            class="map"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
        >
            <img :src="pageData.emap" />
            <canvas
                ref="canvas"
                :width="pageData.width"
                :height="pageData.height"
                class="canvas"
            ></canvas>
            <div class="map-area">
                <div
                    v-for="(item, key) in pageData.points"
                    v-show="pageData.isEdit || item.count"
                    :key
                    class="map-point"
                    :class="`map-point-${key}`"
                    @mousedown="handleMouseDown($event, key)"
                >
                    <BaseImgSprite :file="pageData.playStatus !== 'stop' && data[pageData.playingIndex]?.chlId === item.hotPointId ? 'track_camera_on_play' : 'track_camera'" />
                    <div
                        class="chlname text-ellipsis"
                        :style="{ color: pageData.fontColor }"
                    >
                        {{ item.chlName }}
                    </div>
                    <div
                        v-show="!pageData.isEdit"
                        class="badge"
                    >
                        <BaseImgSprite
                            file="num_background"
                            :index="1"
                            :chunk="4"
                        />
                        <span>{{ item.count }}</span>
                    </div>
                    <BaseImgSprite
                        v-show="pageData.isEdit"
                        class="close"
                        file="list_close"
                        :index="0"
                        :chunk="4"
                        @click.stop="deletePoint(key)"
                    />
                </div>
            </div>
        </div>
        <div class="control">
            <div class="control-btns">
                <!-- 停止播放 -->
                <el-tooltip
                    :content="Translate('IDCS_STOP')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        file="stop (3)"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="pageData.playStatus === 'stop'"
                        :chunk="4"
                        @click="stop"
                    />
                </el-tooltip>
                <!-- 暂停播放 -->
                <el-tooltip
                    :content="Translate('IDCS_PAUSE')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        v-show="pageData.playStatus === 'play'"
                        file="pause"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        @click="pause"
                    />
                </el-tooltip>
                <!-- 播放 -->
                <el-tooltip
                    :content="Translate('IDCS_PLAY_FORWARD')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        v-show="pageData.playStatus !== 'play'"
                        file="fwPlay"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        @click="play"
                    />
                </el-tooltip>
                <!-- 上一个 -->
                <el-tooltip
                    :content="Translate('IDCS_PREVIOUS')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        file="preFrame"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled="prevFrameDisabled"
                        @click="prevFrame"
                    />
                </el-tooltip>
                <!-- 下一个 -->
                <el-tooltip
                    :content="Translate('IDCS_NEXT')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        file="nextFrame"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled="nextFrameDisabled"
                        @click="nextFrame"
                    />
                </el-tooltip>
                <!-- 轨迹播放 -->
                <el-tooltip
                    :content="Translate('IDCS_TRACK_PLAY')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        v-show="pageData.trackStatus === 'stop'"
                        file="start_track"
                        :index="0"
                        :hover-index="2"
                        :chunk="4"
                        @click="playTrack"
                    />
                </el-tooltip>
                <!-- 停止轨迹播放 -->
                <el-tooltip
                    :content="Translate('IDCS_TRACK_STOP')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        v-show="pageData.trackStatus === 'play'"
                        file="stop_track"
                        :index="0"
                        :hover-index="2"
                        :chunk="4"
                        @click="stopTrack"
                    />
                </el-tooltip>
                <el-tooltip
                    :content="Translate('IDCS_EDIT_COLOR')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        file="track_color_edit"
                        :index="0"
                        :hover-index="2"
                        :chunk="4"
                        @click="pageData.isColorPop = true"
                    />
                </el-tooltip>
            </div>
            <div class="control-settings">
                <el-checkbox
                    v-model="pageData.isEdit"
                    :disabled="pageData.playStatus !== 'stop' || pageData.trackStatus !== 'stop'"
                    @change="changeEditMap"
                    >{{ Translate('IDCS_EDIT_MAP') }}</el-checkbox
                >
                <el-button
                    :disabled="pageData.playStatus !== 'stop' || pageData.trackStatus !== 'stop'"
                    @click="pageData.isChlPop = true"
                    >{{ Translate('IDCS_ADD_CHANNEL') }}</el-button
                >
            </div>
        </div>
        <IntelFaceSearchTrackMapColorPop
            v-model="pageData.isColorPop"
            :colors="pageData.colorOptions"
            :line-color="pageData.lineColor"
            :font-color="pageData.fontColor"
            @confirm="changeColor"
            @close="pageData.isColorPop = false"
        />
        <BaseTableSelectPop
            v-model="pageData.isChlPop"
            :title="Translate('IDCS_CHANNEL_SELECT')"
            :data="filterChlOptions"
            :current="[]"
            :label-title="Translate('IDCS_CHANNEL_NAME')"
            @confirm="changeChl"
        />
    </div>
</template>

<script lang="ts" src="./IntelFaceSearchTrackMapPanel.v.ts"></script>

<style lang="scss" scoped>
.track {
    margin-top: 10px;
    width: 960px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.map {
    position: relative;
    width: 960px;
    height: 500px;
    border: 1px solid var(--border-color8);

    img {
        width: 100%;
        height: 100%;

        &[src=''] {
            opacity: 0;
        }
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        background: transparent;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    &-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    &-point {
        position: absolute;
        top: 0;
        left: 0;
        user-select: none;
        width: 36px;
        height: 36px;
        cursor: pointer;

        .chlname {
            // margin-top: 5px;
            // white-space: nowrap;
            width: 90px;
            font-size: 14px;
            cursor: pointer;
        }

        .badge {
            position: absolute;
            top: -8px;
            left: -18px;
            width: 24px;
            height: 24px;

            span {
                position: absolute;
                width: 24px;
                line-height: 24px;
                text-align: center;
                font-size: 14px;
                display: block;
                color: var(--primary--04);
            }
        }

        .close {
            position: absolute;
            right: -12px;
            top: -5px;
        }
    }
}

.control {
    width: 100%;
    display: flex;
    justify-content: space-around;

    &-btns {
        span {
            margin: 0 5px;
        }
    }

    &-settings {
        display: flex;
        align-items: center;

        .el-checkbox {
            margin-right: 10px;
        }
    }
}
</style>
