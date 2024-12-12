<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:40:58
 * @Description: 现场预览-云台视图-预置点
-->
<template>
    <div class="ptz-preset">
        <BaseListBox class="ptz-preset-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @dblclick="callPreset(item.index, index)"
                @click="pageData.active = index"
            >
                <span class="ptz-preset-text text-ellipsis">{{ item.name }}</span>
                <BaseImgSprite
                    file="call"
                    :title="Translate('IDCS_CALL')"
                    :index="0"
                    :chunk="2"
                    @click.stop="callPreset(item.index, index)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-preset-btns">
            <BaseImgSprite
                file="preset_Add"
                :title="Translate('IDCS_ADD')"
                :index="0"
                :hover-index="1"
                :disabled-index="0"
                :chunk="4"
                :disabled="!enabled"
                @click="addPreset"
            />
            <BaseImgSprite
                file="preset_Delete"
                :title="Translate('IDCS_DELETE')"
                :index="0"
                :hover-index="1"
                :chunk="4"
                :disabled-index="0"
                :disabled="!enabled"
                @click="deletePreset"
            />
            <BaseImgSprite
                file="preset_SavePosition"
                :title="Translate('IDCS_SAVE_POSITION')"
                :index="0"
                :hover-index="1"
                :disabled-index="0"
                :chunk="4"
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

<style lang="scss" scoped>
.ptz-preset {
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
        border-top: 1px solid var(--btn-border);

        span {
            margin-left: 5px;
        }
    }

    &-text {
        width: 100%;
        height: 100%;
    }
}
</style>
