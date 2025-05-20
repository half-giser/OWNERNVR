<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:50
 * @Description: 现场预览-云台视图-巡航线组
-->
<template>
    <div class="base-home-ptz">
        <BaseListBox>
            <BaseListBoxItem
                v-for="(item, index) in formData.cruise"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @mouseup="pageData.active = index"
                @dblclick="playCurrentCruiseGroup(item.index)"
            >
                <span class="base-home-ptz-text text-ellipsis">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete_ptz"
                    :title="Translate('IDCS_DELETE')"
                    :index="1"
                    :disabled-index="0"
                    :chunk="2"
                    :disabled="!enabled"
                    @click="deleteCruiseGroup(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="base-home-ptz-btns">
            <BaseImgSpriteBtn
                file="preset_Add"
                :title="Translate('IDCS_ADD')"
                :disabled="!enabled"
                @click="addCruiseGroup"
            />
            <BaseImgSpriteBtn
                file="start_cruise"
                :title="Translate('IDCS_START')"
                @click="playCruiseGroup"
            />
            <BaseImgSpriteBtn
                file="stop_cruise"
                :title="Translate('IDCS_PAUSE')"
                @click="stopCruiseGroup"
            />
        </div>
        <ChannelCruiseGroupAddPop
            v-model="pageData.isAddPop"
            :cruise="formData.cruise"
            :chl-id="formData.chlId"
            :max="formData.maxCount"
            @confirm="confirmAddCruiseGroup"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzGroupPanel.v.ts"></script>
