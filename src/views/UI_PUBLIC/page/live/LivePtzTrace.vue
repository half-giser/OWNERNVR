<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:42:03
 * @Description: 现场预览-云台视图-轨迹
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:30:02
-->
<template>
    <div class="ptz-trace">
        <el-text v-show="pageData.recordTime < pageData.maxRecordTime && pageData.recordTime >= 0">{{ pageData.recordTime }} s</el-text>
        <BaseListBox class="ptz-trace-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.value"
                :class="{
                    active: pageData.active === index,
                }"
                @click="changeActive(index)"
                @dblclick="playCurrentTrace(index)"
            >
                <span class="ptz-trace-text">{{ item.label }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :index="1"
                    :disabled-index="1"
                    :chunk="2"
                    :disabled="!enabled"
                    @click.stop="deleteTrace(item.value, item.label)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-trace-btns">
            <el-tooltip
                :content="Translate('IDCS_ADD')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="preset_Add"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_TRACK_PLAY')"
                :show-after="500"
            >
                <BaseImgSprite
                    v-show="!pageData.playStatus"
                    file="start_cruise"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="playTrace"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_TRACK_STOP')"
                :show-after="500"
            >
                <BaseImgSprite
                    v-show="pageData.playStatus"
                    file="stop_cruise"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="stopTrace"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_START_RECORD')"
                :show-after="500"
            >
                <BaseImgSprite
                    v-show="!pageData.recordStatus"
                    file="noRecord"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    :disabled-index="0"
                    :disabled="!enabled"
                    @click="startRecord"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_STOP_RECORD')"
                :show-after="500"
            >
                <BaseImgSprite
                    v-show="pageData.recordStatus"
                    file="record"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    :disabled-index="0"
                    :disabled="!enabled"
                    @click="stopRecord"
                />
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts" src="./LivePtzTrace.v.ts"></script>

<style lang="scss" scoped>
.ptz-trace {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;

    &-content {
        height: 100%;
    }

    &-btns {
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
        width: 90%;
        margin: 0 5%;
        padding-top: 5px;
        border-top: 1px solid var(--border-color4);
        span {
            margin-left: 5px;
        }
    }

    &-text {
        width: 80%;
        flex-shrink: 0;
        height: 100%;
    }
}
</style>
