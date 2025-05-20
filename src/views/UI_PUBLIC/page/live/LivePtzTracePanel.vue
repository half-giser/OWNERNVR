<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:42:03
 * @Description: 现场预览-云台视图-轨迹
-->
<template>
    <div class="base-home-ptz">
        <BaseListBox>
            <BaseListBoxItem
                v-for="(item, index) in formData.trace"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @mouseup="changeActive(index)"
                @dblclick="playCurrentTrace(index)"
            >
                <span class="base-home-ptz-text">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete_ptz"
                    :title="Translate('IDCS_DELETE')"
                    :index="1"
                    :disabled-index="0"
                    :chunk="2"
                    :disabled="!enabled"
                    @click="deleteTrace(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="base-home-ptz-btns">
            <div>
                <el-text
                    v-show="pageData.recordTime < formData.traceMaxHoldTime && pageData.recordTime >= 0"
                    class="base-home-ptz-seconds"
                >
                    {{ pageData.recordTime }} s
                </el-text>
            </div>
            <div>
                <BaseImgSpriteBtn
                    file="preset_Add"
                    :title="Translate('IDCS_ADD')"
                    :disabled="!enabled"
                    @click="addTrace"
                />
                <BaseImgSpriteBtn
                    v-show="!pageData.playStatus"
                    file="start_cruise"
                    :title="Translate('IDCS_TRACK_PLAY')"
                    @click="playTrace"
                />
                <BaseImgSpriteBtn
                    v-show="pageData.playStatus"
                    file="stop_cruise"
                    :title="Translate('IDCS_TRACK_STOP')"
                    @click="stopTrace"
                />
                <BaseImgSpriteBtn
                    v-show="!pageData.recordStatus"
                    file="noRecord"
                    :title="Translate('IDCS_START_RECORD')"
                    :disabled="!enabled"
                    @click="startRecord"
                />
                <BaseImgSpriteBtn
                    v-show="pageData.recordStatus"
                    file="record"
                    :title="Translate('IDCS_STOP_RECORD')"
                    :disabled="!enabled"
                    @click="stopRecord(pageData.active)"
                />
            </div>
        </div>
        <ChannelTraceAddPop
            v-model="pageData.isAddPop"
            :data="formData"
            @confirm="confirmAddTrace"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzTracePanel.v.ts"></script>
