<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:31
 * @Description: 现场预览-云台视图-巡航线
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
                @click="pageData.active = index"
                @dblclick="playCurrentCruise(index)"
            >
                <span class="base-home-ptz-text text-ellipsis">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :title="Translate('IDCS_DELETE')"
                    :index="1"
                    :disabled-index="0"
                    :chunk="2"
                    :disabled="!enabled"
                    @click="deleteCruise(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="base-home-ptz-btns">
            <BaseImgSpriteBtn
                file="preset_Add"
                :title="Translate('IDCS_ADD')"
                :disabled="!enabled"
                @click="addCruise"
            />
            <BaseImgSpriteBtn
                file="start_cruise"
                :title="Translate('IDCS_START_CRUISE')"
                @click="playCruise"
            />
            <BaseImgSpriteBtn
                file="stop_cruise"
                :title="Translate('IDCS_STOP_CRUISE')"
                @click="stopCruise"
            />
        </div>
        <ChannelCruiseAddPop
            v-model="pageData.isAddPop"
            :max="pageData.maxCount"
            :cruise="listData"
            :chl-id="chlId"
            @confirm="confirmAddCruise"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzCruisePanel.v.ts"></script>
