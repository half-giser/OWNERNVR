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
                    @click="$emit('update:split', seg.split, seg.type), $emit('trigger', true)"
                />
            </template>
            <template v-else-if="mode === 'ocx'">
                <BasePopover
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
                            @click="$emit('update:split', seg.split, seg.type), $emit('trigger', true)"
                        />
                    </div>
                </BasePopover>
            </template>
            <!-- OSD按钮 -->
            <BaseImgSpriteBtn
                file="OSD"
                :title="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :active="osd"
                @click="$emit('update:osd', !osd), $emit('trigger', true)"
            />
            <!-- 全屏按钮 -->
            <BaseImgSpriteBtn
                file="full_screen"
                :title="Translate('IDCS_FULLSCREEN')"
                @click="$emit('fullscreen'), $emit('trigger', true)"
            />
        </div>
        <div class="ctrl-center">
            <!-- 停止播放 -->
            <BaseImgSpriteBtn
                file="stop_rec"
                :title="Translate('IDCS_STOP')"
                :disabled
                @click="$emit('stop'), $emit('trigger', false)"
            />
            <!-- 倒放 -->
            <BaseImgSpriteBtn
                v-if="mode === 'ocx'"
                v-show="['stop', 'pause', 'play'].includes(playStatus)"
                file="bkPlay"
                :title="Translate('IDCS_PLAY_FORWARD')"
                :disabled
                @click="$emit('backwards'), $emit('trigger', false)"
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
                @click="$emit('resume'), $emit('trigger', false)"
            />
            <!-- 慢进 -->
            <BaseImgSpriteBtn
                file="bkSpeed"
                :title="Translate('IDCS_PLAY_FAST_REWIND')"
                :disabled="rewindDisabled"
                @click="rewind"
            />
            <!-- 1倍速 -->
            <BaseImgSpriteBtn
                file="playOriginIcon"
                :title="Translate('IDCS_NORMAL_SPEED')"
                :disabled="resetSpeedDisabled"
                @click="resetSpeed"
            />
            <!-- 快进 -->
            <BaseImgSpriteBtn
                file="fwSpeed"
                :title="Translate('IDCS_PLAY_FAST_FORWARD')"
                :disabled="forwardDisabled"
                @click="forward"
            />
            <!-- 上一帧 -->
            <BaseImgSpriteBtn
                v-if="mode === 'ocx'"
                file="preFrame"
                :title="Translate('IDCS_PLAY_PREVIOUS_FRAME')"
                :disabled="nextFrameDisabled"
                @click="$emit('prevFrame'), $emit('trigger', false)"
            />
            <!-- 下一帧 -->
            <BaseImgSpriteBtn
                file="nextFrame"
                :title="Translate('IDCS_PLAY_NEXT_FRAME')"
                :disabled="nextFrameDisabled"
                @click="$emit('nextFrame'), $emit('trigger', false)"
            />
            <!-- 跳转播放 -->
            <BaseSelect
                v-model="pageData.forwardValue"
                class="fw-select"
                :options="pageData.forwardOptions"
                :disabled
                @visible-change="$emit('trigger', true)"
            />
            <BaseImgSprite
                file="bk30s"
                :index="0"
                :hover-index="0"
                :disabled-index="3"
                :disabled
                :chunk="4"
                class="fw-btn"
                @click="$emit('jump', -pageData.forwardValue), $emit('trigger', false)"
            />
            <BaseImgSprite
                file="fw30s"
                :index="0"
                :hover-index="0"
                :disabled-index="3"
                :disabled
                :chunk="4"
                class="fw-btn"
                @click="$emit('jump', pageData.forwardValue), $emit('trigger', false)"
            />
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
            <!-- <BaseImgSpriteBtn
                v-show="pageData.isPosBtn"
                file="POS"
                :title="pos ? Translate('IDCS_CANCEL_POS') : Translate('IDCS_VIEW_POS')"
                :active="pos"
                :disabled="posDisabled"
                @click="$emit('update:pos', !pos)"
            /> -->
            <BaseImgSpriteBtn
                v-if="systemCaps.supportREID"
                file="target_retrieval"
                :title="Translate('IDCS_REID')"
                :active="detectTarget"
                :disabled="detectTargetDisabled"
                @click="$emit('update:detectTarget', !detectTarget)"
            />
            <!-- 开始裁切 -->
            <BaseImgSpriteBtn
                file="backupStart"
                :title="Translate('IDCS_BACKUP_START_TIME')"
                :disabled
                @click="$emit('clipStart'), $emit('trigger', true)"
            />
            <!-- 结束裁切 -->
            <BaseImgSpriteBtn
                file="backupEnd"
                :title="Translate('IDCS_BACKUP_END_TIME')"
                :disabled
                @click="$emit('clipEnd'), $emit('trigger', true)"
            />
            <!-- 备份 -->
            <BaseImgSpriteBtn
                file="backup"
                :title="Translate('IDCS_BACKUP')"
                :disabled="backUpDisabled"
                @click="backUp"
            />
            <BaseImgSpriteBtn
                file="playStrategy"
                :title="Translate('IDCS_PLAY_STRATEGY')"
                @click="openStrategyPop"
            />
            <BasePopover
                trigger="hover"
                popper-class="no-padding"
            >
                <template #reference>
                    <BaseImgSpriteBtn
                        file="more"
                        :title="Translate('IDCS_MORE')"
                    />
                </template>
                <div class="detail-btns">
                    <!-- 水印按钮 -->
                    <div @click="$emit('update:watermark', !watermark), $emit('trigger', true)">
                        <BaseImgSpriteBtn
                            file="backupWaterMark"
                            :active="watermark"
                        />
                        <span class="detail-btns-text">{{ Translate('IDCS_WATER_MARK') }}</span>
                    </div>
                    <!-- POS按钮 -->
                    <div
                        v-show="systemCaps.supportPOS"
                        @click="$emit('update:pos', !pos), $emit('trigger', true)"
                    >
                        <BaseImgSpriteBtn
                            file="POS_rec"
                            :active="pos"
                            :disabled="!hasPosEvent"
                        />
                        <span class="detail-btns-text">{{ Translate('IDCS_POS') }}</span>
                    </div>
                    <!-- 备份状态 -->
                    <div @click="$emit('showBackUp'), $emit('trigger', true)">
                        <BaseImgSpriteBtn
                            file="backUpTask"
                            :active="isBackUpList"
                        />
                        <span class="detail-btns-text">{{ Translate('IDCS_BACKUP_STATE') }}</span>
                    </div>
                </div>
            </BasePopover>
        </div>
        <el-dialog
            v-model="pageData.isStrategyPop"
            :title="Translate('IDCS_PLAY_STRATEGY')"
            width="500"
        >
            <el-form>
                <el-form-item>
                    <el-checkbox
                        v-model="pageData.strategy"
                        :label="Translate('IDCS_SKID_ORDINARY_RECORD')"
                    />
                </el-form-item>
                <el-form-item>
                    {{ Translate('IDCS_SKIP_NORMAL_TIP') }}
                </el-form-item>
            </el-form>
            <div class="base-btn-box">
                <el-button @click="confirmStrategy">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="pageData.isStrategyPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-dialog>
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
            margin: 0 3px;
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
            margin: 0 3px;
        }
    }
}

.fw-select {
    width: 70px;
    margin: 0 3px;
}

.fw-btn {
    border: 1px solid var(--panel-btn-bg);
    border-radius: 2px;

    &.disabled {
        border-color: var(--panel-btn-bg-disabled);
    }

    &:hover(:not(.disabled)) {
        border-color: var(--primary);
        // opacity: 0.6;
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

.detail-btns {
    & > div {
        padding: 5px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;

        &:not(:last-child) {
            border-bottom: 1px solid var(--content-border);
        }

        .Sprite {
            &::before {
                position: absolute;
                top: -5px;
                left: -5px;
                width: 200px;
                height: 100%;
                content: '';
            }
        }
    }

    &-text {
        margin-left: 5px;
    }
}
</style>
