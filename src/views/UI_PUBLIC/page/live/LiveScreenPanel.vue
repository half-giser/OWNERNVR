<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 16:16:59
 * @Description: 现场预览-底部菜单栏视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-11 10:08:40
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
            <el-tooltip
                :content="osd ? Translate('IDCS_OSD_CLOSE') : Translate('IDCS_OSD_OPEN')"
                :show-after="500"
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
            >
                <BaseImgSprite
                    file="full_screen"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="$emit('fullscreen')"
                />
            </el-tooltip>
            <!-- 码流切换按钮 -->
            <el-radio-group
                v-show="mode === 'ocx'"
                :disabled="split > 4"
                :model-value="-1"
                @update:model-value="changeStreamType($event)"
            >
                <el-radio-button
                    v-for="item in pageData.streamMenuOptions"
                    :key="item.value"
                    :value="item.value"
                    >{{ item.label }}</el-radio-button
                >
            </el-radio-group>
        </div>
        <div class="ctrl-right">
            <LiveScreenAlarmOut />
            <el-tooltip
                :content="preview ? Translate('IDCS_CLOSE_ALL_IMAGE') : Translate('IDCS_PREVIEW_ALL')"
                :show-after="500"
            >
                <BaseImgSprite
                    :file="preview ? 'close_all_chl' : 'open_all_chl'"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="$emit('update:preview', !preview)"
                />
            </el-tooltip>
            <el-tooltip
                :content="clientRecord ? Translate('IDCS_CLIENT_RECORD_ALL_OFF') : Translate('IDCS_CLIENT_RECORD_ALL_ON')"
                :show-after="500"
            >
                <BaseImgSprite
                    :file="clientRecord ? 'stop_rec_all_chl' : 'start_rec_all_chl'"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :chunk="4"
                    @click="$emit('update:clientRecord', !clientRecord)"
                />
            </el-tooltip>
            <el-tooltip
                :content="remoteRecord ? Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_OFF') : Translate('IDCS_REMOTE_MANUAL_RECORD_ALL_ON')"
                :show-after="500"
            >
                <BaseImgSprite
                    :file="remoteRecord ? 'stop_remote_rec_all_chl' : 'start_remote_rec_all_chl'"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="3"
                    :disabled="remoteRecordDisabled"
                    :chunk="4"
                    @click="recordRemote(!remoteRecord)"
                />
            </el-tooltip>
            <el-tooltip
                :content="talk ? Translate('IDCS_TALKBACK_OFF') : Translate('IDCS_TALKBACK_ON')"
                :show-after="500"
            >
                <BaseImgSprite
                    v-show="isTalk"
                    :file="talk ? 'stop_talk' : 'start_talk'"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="$emit('update:talk', !talk)"
                />
            </el-tooltip>
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
