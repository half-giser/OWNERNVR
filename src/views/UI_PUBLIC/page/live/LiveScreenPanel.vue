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
                    placement="right-start"
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
                            :file="seg.file ? seg.file : `seg_${seg.split}`"
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
            <LiveScreenAlarmOutPop />
            <!-- 关闭/开启图像 -->
            <BaseImgSprite
                :file="preview ? 'close_all_chl' : 'open_all_chl'"
                :title="preview ? Translate('IDCS_CLOSE_ALL_IMAGE') : Translate('IDCS_PREVIEW_ALL')"
                :index="0"
                :hover-index="1"
                :chunk="4"
                @click="$emit('update:preview', !preview)"
            />
            <!-- 本地录像 -->
            <BaseImgSprite
                :file="clientRecord ? 'stop_rec_all_chl' : 'start_rec_all_chl'"
                :title="clientRecord ? Translate('IDCS_CLIENT_RECORD_ALL_OFF') : Translate('IDCS_CLIENT_RECORD_ALL_ON')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="4"
                @click="$emit('update:clientRecord', !clientRecord)"
            />
            <!-- 远程录像 -->
            <BaseImgSprite
                :file="remoteRecord ? 'stop_remote_rec_all_chl' : 'start_remote_rec_all_chl'"
                :title="remoteRecord ? Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_OFF') : Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_ON')"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :disabled="remoteRecordDisabled"
                :chunk="4"
                @click="recordRemote(!remoteRecord)"
            />
            <!-- 对讲 -->
            <BaseImgSprite
                v-show="isTalk"
                :file="talk ? 'stop_talk' : 'start_talk'"
                :title="talk ? Translate('IDCS_TALKBACK_OFF') : Translate('IDCS_TALKBACK_ON')"
                :index="0"
                :hover-index="1"
                :chunk="4"
                @click="$emit('update:talk', !talk)"
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

        & > span {
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
}
</style>
