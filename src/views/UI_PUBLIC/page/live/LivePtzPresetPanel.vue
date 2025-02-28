<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:40:58
 * @Description: 现场预览-云台视图-预置点
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
                @dblclick="callPreset(item.index, index)"
                @click="pageData.active = index"
            >
                <span class="base-home-ptz-text text-ellipsis">{{ item.name }}</span>
                <BaseImgSprite
                    file="call"
                    :title="Translate('IDCS_CALL')"
                    :active="pageData.active === index"
                    :active-index="1"
                    :chunk="2"
                    @click="callPreset(item.index, index)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="base-home-ptz-btns">
            <BaseImgSpriteBtn
                file="preset_Add"
                :title="Translate('IDCS_ADD')"
                :disabled="!enabled"
                @click="addPreset"
            />
            <BaseImgSpriteBtn
                file="preset_Delete"
                :title="Translate('IDCS_DELETE')"
                :disabled="!enabled"
                @click="deletePreset"
            />
            <BaseImgSpriteBtn
                file="preset_SavePosition"
                :title="Translate('IDCS_SAVE_POSITION')"
                :disabled="!enabled"
                @click="savePreset"
            />
        </div>
        <ChannelPresetAddPop
            v-model="pageData.isAddPop"
            :max="pageData.maxCount"
            :presets="listData"
            :chl-id="chlId"
            @confirm="confirmAddPreset"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzPresetPanel.v.ts"></script>
