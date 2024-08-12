<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 10:36:16
 * @Description: 回放-底部控制视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-07 10:02:55
-->
<template>
    <div class="ctrl">
        <div class="ctrl-left">
            <!-- 分屏切换按钮 -->
            <template v-if="mode === 'h5'">
                <BaseImgSprite
                    v-for="seg in pageData.wasmSeg"
                    :key="`${seg.type}_${seg.split}`"
                    :file="`seg_${seg.split}`"
                    :index="seg.split === split ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="2"
                    :chunk="4"
                    @click="$emit('update:split', seg.split, seg.type)"
                />
            </template>
            <template v-else-if="mode === 'ocx'">
                <el-popover
                    placement="bottom-start"
                    trigger="hover"
                    :width="pageData.ocxSeg.length * 45 + 22"
                    :disabled="winData.isDwellPlay"
                    popper-class="popper"
                >
                    <template #reference>
                        <BaseImgSprite
                            file="seg_selector"
                            :index="0"
                            :hover-index="1"
                            :disabled-index="2"
                            :disabled="winData.isDwellPlay"
                            :chunk="4"
                        />
                    </template>
                    <div class="segs">
                        <BaseImgSprite
                            v-for="seg in pageData.ocxSeg"
                            :key="`${seg.type}_${seg.split}`"
                            :file="`seg_${seg.split}`"
                            :index="seg.split === split ? 2 : 0"
                            :hover-index="1"
                            :disabled-index="2"
                            :chunk="4"
                            @click="$emit('update:split', seg.split, seg.type)"
                        />
                    </div>
                </el-popover>
            </template>
            <!-- OSD按钮 -->
            <el-tooltip
                :content="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="OSD"
                    :index="osd ? 2 : 0"
                    :hover-index="1"
                    :chunk="4"
                    @click="$emit('update:osd', !osd)"
                />
            </el-tooltip>
            <!-- 全屏按钮 -->
            <el-tooltip
                :content="Translate('IDCS_FULLSCREEN')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="full_screen"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="$emit('fullscreen')"
                />
            </el-tooltip>
        </div>
        <div class="ctrl-center">
            <!-- 停止播放 -->
            <el-tooltip
                :content="Translate('IDCS_STOP')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="stop (3)"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="stop"
                />
            </el-tooltip>
            <!-- 倒放 -->
            <template v-if="mode === 'ocx'">
                <el-tooltip
                    :content="Translate('IDCS_PLAY_FORWARD')"
                    :show-after="500"
                    placement="bottom"
                >
                    <BaseImgSprite
                        v-show="['stop', 'pause', 'play'].includes(playStatus)"
                        file="bkPlay"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled
                        @click="backwards"
                    />
                </el-tooltip>
            </template>
            <!-- 暂停播放 -->
            <el-tooltip
                :content="Translate('IDCS_PAUSE')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    v-show="playStatus === 'play' || playStatus === 'backwards'"
                    file="pause"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="pause"
                />
            </el-tooltip>
            <!-- 播放 -->
            <el-tooltip
                :content="Translate('IDCS_PLAY_FORWARD')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    v-show="['stop', 'pause', 'backwards'].includes(playStatus)"
                    file="fwPlay"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="resume"
                />
            </el-tooltip>
            <!-- 慢进 -->
            <el-tooltip
                :content="Translate('IDCS_PLAY_FAST_REWIND')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="bkSpeed"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="rewindDisabled"
                    @click="rewind"
                />
            </el-tooltip>
            <!-- 快进 -->
            <el-tooltip
                :content="Translate('IDCS_PLAY_FAST_FORWARD')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="fwSpeed"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="forwardDisabled"
                    @click="forward"
                />
            </el-tooltip>
            <!-- 1倍速 -->
            <el-tooltip
                :content="Translate('IDCS_NORMAL_SPEED')"
                :show-after="500"
                placement="bottom"
            >
                <BaseImgSprite
                    file="playOriginIcon"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="resetSpeedDisabled"
                    @click="resetSpeed"
                />
            </el-tooltip>
            <!-- 上一帧 -->
            <template v-if="mode === 'ocx'">
                <el-tooltip
                    :content="Translate('IDCS_PLAY_PREVIOUS_FRAME')"
                    :show-after="500"
                    placement="bottom"
                >
                    <BaseImgSprite
                        file="preFrame"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled="nextFrameDisabled"
                        @click="prevFrame"
                    />
                </el-tooltip>
            </template>
            <!-- 下一帧 -->
            <el-tooltip
                :content="Translate('IDCS_PLAY_NEXT_FRAME')"
                :show-after="500"
                placement="bottom"
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
            <!-- 跳转播放 -->
            <div class="seek">
                <BaseImgSprite
                    file="30s_bk"
                    :index="0"
                    :disabled-index="1"
                    :disabled
                    :chunk="2"
                />
                <div>
                    <el-tooltip
                        :content="Translate('IDCS_PLAY_DEC_30_SECONDS')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="bk30s"
                            :index="0"
                            :hover-index="1"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled
                            @click="jump(-30)"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :content="Translate('IDCS_PLAY_INC_30_SECONDS')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="fw30s"
                            :index="0"
                            :hover-index="1"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled
                            @click="jump(30)"
                        />
                    </el-tooltip>
                </div>
            </div>
            <BaseImgSprite
                v-show="playStatus === 'backwards'"
                file="bkPlay"
                :class="{ hide: disabled }"
                :index="2"
                :disabled-index="3"
                :chunk="4"
            />
            <BaseImgSprite
                v-show="playStatus !== 'play' && playStatus !== 'backwards'"
                file="pause"
                :class="{ hide: disabled }"
                :index="2"
                :disabled-index="3"
                :chunk="4"
            />
            <BaseImgSprite
                v-show="playStatus === 'play'"
                file="fwPlay"
                :class="{ hide: disabled }"
                :index="2"
                :disabled-index="3"
                :chunk="4"
            />
            <p :class="{ hide: disabled }">{{ displaySpeed }}</p>
        </div>
        <div class="ctrl-right">
            <!-- POS按钮 -->
            <el-tooltip
                :content="pos ? Translate('IDCS_CANCEL_POS') : Translate('IDCS_VIEW_POS')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="POS"
                    :index="pos ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="posDisabled"
                    @click="togglePos(!pos)"
                />
            </el-tooltip>
            <!-- 水印按钮 -->
            <el-tooltip
                :content="watermark ? Translate('IDCS_CANCEL_WATER_MARK') : Translate('IDCS_VIEW_WATER_MARK')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="backupWaterMark"
                    :index="watermark ? 2 : 0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="$emit('update:watermark', !watermark)"
                />
            </el-tooltip>
            <!-- 开始裁切 -->
            <el-tooltip
                :content="Translate('IDCS_BACKUP_START_TIME')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="backupStart"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="setClipStart"
                />
            </el-tooltip>
            <!-- 结束裁切 -->
            <el-tooltip
                :content="Translate('IDCS_BACKUP_END_TIME')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="backupEnd"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled
                    @click="setClipEnd"
                />
            </el-tooltip>
            <!-- 备份 -->
            <el-tooltip
                :content="Translate('IDCS_BACKUP')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="backup"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="backUpDisabled"
                    @click="backUp"
                />
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts" src="./PlaybackScreenPanel.v.ts"></script>

<style lang="scss" scoped>
.ctrl {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    &-left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 100%;

        & > span {
            margin: 0 5px;
            flex-shrink: 0;
        }
    }

    &-center {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        & > span {
            margin: 0 3px;
            flex-shrink: 0;
        }

        p {
            font-size: 22px;
            color: var(--primary--04);
            margin: 0;
        }

        .hide {
            visibility: hidden;
        }
    }

    &-right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        & > span {
            margin: 0 5px;
        }
    }
}

.seek {
    position: relative;

    div {
        position: absolute;
        top: 0;
        left: 0;
        width: 67px;
        height: 23px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        span:first-child {
            margin-left: 2px;
        }
        span:last-child {
            margin-right: 2px;
        }
    }
}

.segs {
    display: flex;
    justify-content: flex-start;

    & > span {
        margin: 0 5px;
    }
}
</style>
