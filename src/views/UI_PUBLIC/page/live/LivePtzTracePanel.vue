<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:42:03
 * @Description: 现场预览-云台视图-轨迹
-->
<template>
    <div class="ptz-trace">
        <BaseListBox class="ptz-trace-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @click="changeActive(index)"
                @dblclick="playCurrentTrace(index)"
            >
                <span class="ptz-trace-text">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :title="Translate('IDCS_DELETE')"
                    :index="0"
                    :disabled-index="1"
                    :chunk="2"
                    :disabled="!enabled"
                    @click.stop="deleteTrace(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-trace-btns">
            <div>
                <el-text
                    v-show="pageData.recordTime < pageData.maxRecordTime && pageData.recordTime >= 0"
                    class="seconds"
                >
                    {{ pageData.recordTime }} s
                </el-text>
            </div>
            <div>
                <BaseImgSprite
                    file="preset_Add"
                    :title="Translate('IDCS_ADD')"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="addTrace"
                />
                <BaseImgSprite
                    v-show="!pageData.playStatus"
                    file="start_cruise"
                    :title="Translate('IDCS_TRACK_PLAY')"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="playTrace"
                />
                <BaseImgSprite
                    v-show="pageData.playStatus"
                    file="stop_cruise"
                    :title="Translate('IDCS_TRACK_STOP')"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="stopTrace"
                />
                <BaseImgSprite
                    v-show="!pageData.recordStatus"
                    file="noRecord"
                    :title="Translate('IDCS_START_RECORD')"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    :disabled-index="3"
                    :disabled="!enabled"
                    @click="startRecord"
                />
                <BaseImgSprite
                    v-show="pageData.recordStatus"
                    file="record"
                    :title="Translate('IDCS_STOP_RECORD')"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    :disabled-index="3"
                    :disabled="!enabled"
                    @click="stopRecord(pageData.active)"
                />
            </div>
        </div>
        <ChannelTraceAddPop
            v-model="pageData.isAddPop"
            :max="pageData.maxCount"
            :trace="listData"
            :chl-id="chlId"
            @confirm="confirmAddTrace"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzTracePanel.v.ts"></script>

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
        justify-content: space-between;
        flex-shrink: 0;
        width: 90%;
        margin: 0 5%;
        padding-top: 5px;
        border-top: 1px solid var(--btn-border);

        span {
            margin-left: 5px;
        }

        & > div:last-child {
            display: flex;
            justify-content: flex-end;
        }
    }

    &-text {
        width: 100%;
        height: 100%;
    }

    .seconds {
        color: var(--primary);
    }
}
</style>
