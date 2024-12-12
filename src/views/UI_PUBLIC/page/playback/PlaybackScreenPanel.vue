<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 10:36:16
 * @Description: 回放-底部控制视图
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
                    popper-class="keep-ocx"
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
            <BaseImgSprite
                file="OSD"
                :title="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :index="osd ? 2 : 0"
                :hover-index="1"
                :chunk="4"
                @click="$emit('update:osd', !osd)"
            />
            <!-- 全屏按钮 -->
            <BaseImgSprite
                file="full_screen"
                :title="Translate('IDCS_FULLSCREEN')"
                :index="0"
                :hover-index="1"
                :chunk="4"
                @click="$emit('fullscreen')"
            />
        </div>
        <div class="ctrl-center">
            <!-- 停止播放 -->
            <BaseImgSprite
                file="stop (3)"
                :title="Translate('IDCS_STOP')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="stop"
            />
            <!-- 倒放 -->
            <BaseImgSprite
                v-if="mode === 'ocx'"
                v-show="['stop', 'pause', 'play'].includes(playStatus)"
                file="bkPlay"
                :title="Translate('IDCS_PLAY_FORWARD')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="backwards"
            />
            <!-- 暂停播放 -->
            <BaseImgSprite
                v-show="playStatus === 'play' || playStatus === 'backwards'"
                file="pause"
                :title="Translate('IDCS_PAUSE')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="pause"
            />
            <!-- 播放 -->
            <BaseImgSprite
                v-show="['stop', 'pause', 'backwards'].includes(playStatus)"
                file="fwPlay"
                :title="Translate('IDCS_PLAY_FORWARD')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="resume"
            />
            <!-- 慢进 -->
            <BaseImgSprite
                file="bkSpeed"
                :title="Translate('IDCS_PLAY_FAST_REWIND')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="rewindDisabled"
                @click="rewind"
            />
            <!-- 快进 -->
            <BaseImgSprite
                file="fwSpeed"
                :title="Translate('IDCS_PLAY_FAST_FORWARD')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="forwardDisabled"
                @click="forward"
            />
            <!-- 1倍速 -->
            <BaseImgSprite
                file="playOriginIcon"
                :title="Translate('IDCS_NORMAL_SPEED')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="resetSpeedDisabled"
                @click="resetSpeed"
            />
            <!-- 上一帧 -->
            <BaseImgSprite
                v-if="mode === 'ocx'"
                file="preFrame"
                :title="Translate('IDCS_PLAY_PREVIOUS_FRAME')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="nextFrameDisabled"
                @click="prevFrame"
            />
            <!-- 下一帧 -->
            <BaseImgSprite
                file="nextFrame"
                :title="Translate('IDCS_PLAY_NEXT_FRAME')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="nextFrameDisabled"
                @click="nextFrame"
            />
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
                    <BaseImgSprite
                        file="bk30s"
                        :title="Translate('IDCS_PLAY_DEC_30_SECONDS')"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled
                        @click="jump(-30)"
                    />
                    <BaseImgSprite
                        file="fw30s"
                        :title="Translate('IDCS_PLAY_INC_30_SECONDS')"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :chunk="4"
                        :disabled
                        @click="jump(30)"
                    />
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
            <BaseImgSprite
                v-show="pageData.isPosBtn"
                file="POS"
                :title="pos ? Translate('IDCS_CANCEL_POS') : Translate('IDCS_VIEW_POS')"
                :index="pos ? 2 : 0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="posDisabled"
                @click="togglePos(!pos)"
            />
            <!-- 水印按钮 -->
            <BaseImgSprite
                file="backupWaterMark"
                :title="watermark ? Translate('IDCS_CANCEL_WATER_MARK') : Translate('IDCS_VIEW_WATER_MARK')"
                :index="watermark ? 2 : 0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="$emit('update:watermark', !watermark)"
            />
            <!-- 开始裁切 -->
            <BaseImgSprite
                file="backupStart"
                :title="Translate('IDCS_BACKUP_START_TIME')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="setClipStart"
            />
            <!-- 结束裁切 -->
            <BaseImgSprite
                file="backupEnd"
                :title="Translate('IDCS_BACKUP_END_TIME')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled
                @click="setClipEnd"
            />
            <!-- 备份 -->
            <BaseImgSprite
                file="backup"
                :title="Translate('IDCS_BACKUP')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                :disabled="backUpDisabled"
                @click="backUp"
            />
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
            color: var(--primary);
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
