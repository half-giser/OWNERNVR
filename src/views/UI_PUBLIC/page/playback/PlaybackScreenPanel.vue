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
                <BaseImgSpriteBtn
                    v-for="seg in pageData.wasmSeg"
                    :key="`${seg.type}_${seg.split}`"
                    :file="`seg_${seg.split}`"
                    :active="seg.split === split"
                    @click="$emit('update:split', seg.split, seg.type)"
                />
            </template>
            <template v-else-if="mode === 'ocx'">
                <el-popover
                    placement="bottom-start"
                    trigger="hover"
                    :width="pageData.ocxSeg.length * 45 + 22"
                    :disabled="winData.isDwellPlay"
                >
                    <template #reference>
                        <BaseImgSpriteBtn
                            file="seg_selector"
                            :disabled="winData.isDwellPlay"
                        />
                    </template>
                    <div class="segs">
                        <BaseImgSpriteBtn
                            v-for="seg in pageData.ocxSeg"
                            :key="`${seg.type}_${seg.split}`"
                            :file="`seg_${seg.split}`"
                            :active="seg.split === split"
                            @click="$emit('update:split', seg.split, seg.type)"
                        />
                    </div>
                </el-popover>
            </template>
            <!-- OSD按钮 -->
            <BaseImgSpriteBtn
                file="OSD"
                :title="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :active="osd"
                @click="$emit('update:osd', !osd)"
            />
            <!-- 全屏按钮 -->
            <BaseImgSpriteBtn
                file="full_screen"
                :title="Translate('IDCS_FULLSCREEN')"
                @click="$emit('fullscreen')"
            />
        </div>
        <div class="ctrl-center">
            <!-- 停止播放 -->
            <BaseImgSpriteBtn
                file="stop_rec"
                :title="Translate('IDCS_STOP')"
                :disabled
                @click="$emit('stop')"
            />
            <!-- 倒放 -->
            <BaseImgSpriteBtn
                v-if="mode === 'ocx'"
                v-show="['stop', 'pause', 'play'].includes(playStatus)"
                file="bkPlay"
                :title="Translate('IDCS_PLAY_FORWARD')"
                :disabled
                @click="$emit('backwards')"
            />
            <!-- 暂停播放 -->
            <BaseImgSpriteBtn
                v-show="playStatus === 'play' || playStatus === 'backwards'"
                file="pause"
                :title="Translate('IDCS_PAUSE')"
                :disabled
                @click="pause"
            />
            <!-- 播放 -->
            <BaseImgSpriteBtn
                v-show="['stop', 'pause', 'backwards'].includes(playStatus)"
                file="fwPlay"
                :title="Translate('IDCS_PLAY_FORWARD')"
                :disabled
                @click="$emit('resume')"
            />
            <!-- 慢进 -->
            <BaseImgSpriteBtn
                file="bkSpeed"
                :title="Translate('IDCS_PLAY_FAST_REWIND')"
                :disabled="rewindDisabled"
                @click="rewind"
            />
            <!-- 快进 -->
            <BaseImgSpriteBtn
                file="fwSpeed"
                :title="Translate('IDCS_PLAY_FAST_FORWARD')"
                :disabled="forwardDisabled"
                @click="forward"
            />
            <!-- 1倍速 -->
            <BaseImgSpriteBtn
                file="playOriginIcon"
                :title="Translate('IDCS_NORMAL_SPEED')"
                :disabled="resetSpeedDisabled"
                @click="resetSpeed"
            />
            <!-- 上一帧 -->
            <BaseImgSpriteBtn
                v-if="mode === 'ocx'"
                file="preFrame"
                :title="Translate('IDCS_PLAY_PREVIOUS_FRAME')"
                :disabled="nextFrameDisabled"
                @click="$emit('prevFrame')"
            />
            <!-- 下一帧 -->
            <BaseImgSpriteBtn
                file="nextFrame"
                :title="Translate('IDCS_PLAY_NEXT_FRAME')"
                :disabled="nextFrameDisabled"
                @click="$emit('nextFrame')"
            />
            <!-- 跳转播放 -->
            <div class="seek">
                <BaseImgSprite
                    file="30s_bk"
                    :disabled-index="1"
                    :disabled
                    :chunk="2"
                />
                <div>
                    <BaseImgSpriteBtn
                        file="bk30s"
                        :title="Translate('IDCS_PLAY_DEC_30_SECONDS')"
                        :disabled
                        @click="$emit('jump', -30)"
                    />
                    <BaseImgSpriteBtn
                        file="fw30s"
                        :title="Translate('IDCS_PLAY_INC_30_SECONDS')"
                        :disabled
                        @click="$emit('jump', 30)"
                    />
                </div>
            </div>
            <BaseImgSpriteBtn
                v-show="playStatus === 'backwards'"
                file="bkPlay"
                :class="{ hide: disabled }"
                active
            />
            <BaseImgSpriteBtn
                v-show="playStatus !== 'play' && playStatus !== 'backwards'"
                file="pause"
                :class="{ hide: disabled }"
                active
            />
            <BaseImgSpriteBtn
                v-show="playStatus === 'play' || playStatus === 'stop'"
                file="fwPlay"
                active
            />
            <p>{{ displaySpeed }}</p>
        </div>
        <div class="ctrl-right">
            <!-- POS按钮 -->
            <BaseImgSpriteBtn
                v-show="pageData.isPosBtn"
                file="POS"
                :title="pos ? Translate('IDCS_CANCEL_POS') : Translate('IDCS_VIEW_POS')"
                :active="pos"
                :disabled="posDisabled"
                @click="$emit('update:pos', !pos)"
            />
            <!-- 水印按钮 -->
            <BaseImgSpriteBtn
                file="backupWaterMark"
                :title="watermark ? Translate('IDCS_CANCEL_WATER_MARK') : Translate('IDCS_VIEW_WATER_MARK')"
                :active="watermark"
                :disabled
                @click="$emit('update:watermark', !watermark)"
            />
            <!-- 开始裁切 -->
            <BaseImgSpriteBtn
                file="backupStart"
                :title="Translate('IDCS_BACKUP_START_TIME')"
                :disabled
                @click="$emit('clipStart')"
            />
            <!-- 结束裁切 -->
            <BaseImgSpriteBtn
                file="backupEnd"
                :title="Translate('IDCS_BACKUP_END_TIME')"
                :disabled
                @click="$emit('clipEnd')"
            />
            <!-- 备份 -->
            <BaseImgSpriteBtn
                file="backup"
                :title="Translate('IDCS_BACKUP')"
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
            width: 65px;
        }

        .hide {
            display: none;
            // visibility: hidden;
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
