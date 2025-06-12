<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 16:16:59
 * @Description: 现场预览-底部菜单栏视图
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
                    @click="$emit('trigger'), $emit('update:split', seg.split, seg.type)"
                />
            </template>
            <template v-else-if="mode === 'ocx'">
                <BasePopover
                    placement="right-start"
                    trigger="hover"
                    :width="(pageData.ocxSeg.length + pageData.ocxRotateSeg.length) * 45 + 22"
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
                            :file="seg.file"
                            :active="seg.split === split && seg.type === pageData.splitType"
                            @click="changeSplit(seg.split, seg.type)"
                        />
                        <div
                            v-show="pageData.ocxRotateSeg.length"
                            class="segs-split"
                        ></div>
                        <BaseImgSpriteBtn
                            v-for="seg in pageData.ocxRotateSeg"
                            :key="`${seg.type}_${seg.split}`"
                            :file="seg.file"
                            :active="seg.split === split && seg.type === pageData.splitType"
                            @click="changeSplit(seg.split, seg.type)"
                        />
                    </div>
                </BasePopover>
            </template>
            <!-- OSD按钮 -->
            <BaseImgSpriteBtn
                file="OSD"
                :title="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :active="osd"
                @click="$emit('trigger'), $emit('update:osd', !osd)"
            />
            <!-- 目标检测 -->
            <BaseImgSpriteBtn
                v-if="systemCaps.supportREID"
                file="target_retrieval"
                :title="Translate('IDCS_REID')"
                :active="detectTarget"
                :disabled="winData.PLAY_STATUS !== 'play' || systemCaps.hotStandBy"
                @click="$emit('update:detectTarget', !detectTarget)"
            />
            <!-- 全屏按钮 -->
            <BaseImgSpriteBtn
                file="full_screen"
                :title="Translate('IDCS_FULLSCREEN')"
                @click="$emit('trigger'), $emit('fullscreen')"
            />
            <!-- 码流切换按钮 -->
            <el-radio-group
                v-show="mode === 'ocx'"
                :disabled="mainStreamDisabled"
                :model-value="-1"
                @update:model-value="changeStreamType($event)"
            >
                <el-radio-button
                    v-for="item in pageData.streamMenuOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
        </div>
        <div class="ctrl-right">
            <LiveScreenRS485Pop
                v-if="systemCaps.supportRS485"
                @trigger="$emit('trigger')"
            />
            <LiveScreenAlarmOutPop @trigger="$emit('trigger')" />
            <!-- 关闭/开启图像 -->
            <BaseImgSpriteBtn
                :file="preview ? 'close_all_chl' : 'open_all_chl'"
                :title="preview ? Translate('IDCS_CLOSE_ALL_IMAGE') : Translate('IDCS_PREVIEW_ALL')"
                @click="$emit('trigger'), $emit('update:preview', !preview)"
            />
            <!-- 本地录像 -->
            <BaseImgSpriteBtn
                :disabled="systemCaps.hotStandBy"
                :file="clientRecord ? 'stop_rec_all_chl' : 'start_rec_all_chl'"
                :title="clientRecord ? Translate('IDCS_CLIENT_RECORD_ALL_OFF') : Translate('IDCS_CLIENT_RECORD_ALL_ON')"
                @click="$emit('trigger'), $emit('update:clientRecord', !clientRecord)"
            />
            <!-- 远程录像 -->
            <BaseImgSpriteBtn
                v-show="!systemCaps.hotStandBy"
                :file="remoteRecord ? 'stop_remote_rec_all_chl' : 'start_remote_rec_all_chl'"
                :title="remoteRecord ? Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_OFF') : Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_ON')"
                :disabled="remoteRecordDisabled"
                @click="recordRemote(!remoteRecord)"
            />
            <!-- 对讲 -->
            <BaseImgSpriteBtn
                v-show="isTalk"
                :disabled="systemCaps.hotStandBy"
                :file="talk ? 'stop_talk' : 'start_talk'"
                :title="talk ? Translate('IDCS_TALKBACK_OFF') : Translate('IDCS_TALKBACK_ON')"
                @click="$emit('trigger'), $emit('update:talk', !talk)"
            />
        </div>
    </div>
</template>

<script lang="ts" src="./LiveScreenPanel.v.ts"></script>

<style lang="scss" scoped>
.ctrl {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 0 10px;

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

    &-right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        & > .Sprite {
            margin: 0 5px;
        }
    }
}

.segs {
    display: flex;
    justify-content: flex-start;

    & > span {
        margin: 0 5px;
    }

    &-split {
        height: 34px;
        width: 1px;
        border-left: 1px solid var(--content-border);
        margin: 0 5px;
    }
}
</style>
