<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:42:03
 * @Description: 现场预览-云台视图-轨迹
-->
<template>
    <div class="base-home-ptz">
        <BaseListBox>
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @click="changeActive(index)"
                @dblclick="playCurrentTrace(index)"
            >
                <span class="base-home-ptz-text">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :title="Translate('IDCS_DELETE')"
                    :index="1"
                    :disabled-index="0"
                    :chunk="2"
                    :disabled="!enabled"
                    @click.stop="deleteTrace(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="base-home-ptz-btns">
            <div>
                <el-text
                    v-show="pageData.recordTime < pageData.maxRecordTime && pageData.recordTime >= 0"
                    class="base-home-ptz-seconds"
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
                    :disabled-index="3"
                    :chunk="4"
                    :disabled="!enabled"
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
