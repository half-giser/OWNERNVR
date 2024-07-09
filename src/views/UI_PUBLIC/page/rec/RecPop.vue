<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 11:34:14
 * @Description: 回放弹窗（OCX+H5）
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 11:35:43
-->
<template>
    <el-dialog
        :width="dialogWidth"
        :title="Translate('IDCS_REPLAY')"
        center
        @close="beforeClose"
        @open="open"
    >
        <div class="RecordPop">
            <div class="main">
                <div
                    v-show="playList.length > 1"
                    class="chl"
                >
                    <ul>
                        <li
                            v-for="(listItem, index) in playList"
                            :key="index"
                            @click="changeChannel(index)"
                        >
                            <BaseImgSprite
                                file="chl_icon"
                                :index="index === pageData.chlIndex ? 1 : 0"
                                :chunk="4"
                            />
                            <span>{{ listItem.chlName }}</span>
                        </li>
                    </ul>
                </div>
                <div class="player">
                    <BaseVideoPlayer
                        v-if="pageData.mounted"
                        ref="playerRef"
                        type="record"
                        :split="1"
                        :enable-pos="systemCaps.supportPOS"
                        @onready="handleReady"
                        @ontime="handleTime"
                        @onsuccess="handleSuccess"
                    />
                </div>
            </div>
            <div class="control-bar">
                <span class="start-time">{{ startTime }}</span>
                <el-slider
                    v-model="pageData.progress"
                    :show-tooltip="false"
                    :min="startTimeStamp"
                    :max="endTimeStamp"
                    :disabled="pageData.iconDisabled"
                    @mousedown="handleSliderMouseDown"
                    @mouseup="handleSliderMouseUp"
                    @change="handleSliderChange"
                />
                <span class="end-time">{{ endTime }}</span>
            </div>
            <div class="control-btns">
                <span class="current-time">{{ currentTime }}</span>
                <el-tooltip :content="Translate('IDCS_PAUSE')">
                    <BaseImgSprite
                        v-show="!pageData.paused"
                        class="btn"
                        file="image_preview_pause"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="pageData.iconDisabled ? 3 : -1"
                        :chunk="4"
                        @click="pause"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_PLAY')">
                    <BaseImgSprite
                        v-show="pageData.paused"
                        class="btn"
                        file="image_preview_play"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="pageData.iconDisabled ? 3 : -1"
                        :chunk="4"
                        @click="play"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_STOP')">
                    <BaseImgSprite
                        file="image_preview_stop"
                        class="btn"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="pageData.iconDisabled ? 3 : -1"
                        :chunk="4"
                        @click="stop"
                    />
                </el-tooltip>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="close">{{ Translate('IDCS_CLOSE') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./RecPop.v.ts"></script>

<style lang="scss" scoped>
.RecordPop {
    .main {
        width: 100%;
        display: flex;
        height: 350px;
    }

    .chl {
        width: 230px;
        height: 350px;
        overflow-y: auto;
        border: 1px solid var(--border-color8);

        ul {
            margin: 0;
            padding: 0;
        }

        li {
            list-style: none;
            padding: 5px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 13px;

            span:last-child {
                margin-left: 10px;
            }

            &:hover,
            &.active {
                border-color: var(--primary--04);
            }

            &.active {
                background-color: var(--primary--04);
                color: white;
            }
        }
    }

    .player {
        width: 600px;
        height: 350px;
        flex-shrink: 0;
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
        width: 72px;
        flex-shrink: 0;
        text-align: center;
        line-height: 1;
    }

    .control-btns {
        margin-top: 10px;
        width: 100%;
        height: 58px;
        display: flex;
        align-items: center;
    }

    .current-time {
        font-size: 18px;
        margin-left: 15px;
        margin-right: 70px;
    }

    .btn {
        margin-right: 30px;
    }
}
</style>
