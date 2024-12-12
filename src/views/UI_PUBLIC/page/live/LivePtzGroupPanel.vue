<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:50
 * @Description: 现场预览-云台视图-巡航线组
-->
<template>
    <div class="ptz-group">
        <BaseListBox class="ptz-group-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @click="pageData.active = index"
                @dblclick="playCurrentCruiseGroup(item.index)"
            >
                <span class="ptz-group-text text-ellipsis">{{ item.name }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :title="Translate('IDCS_DELETE')"
                    :index="0"
                    :disabled-index="1"
                    :chunk="2"
                    :disabled="!enabled"
                    @click.stop="deleteCruiseGroup(item.index, item.name)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-group-btns">
            <BaseImgSprite
                file="preset_Add"
                :title="Translate('IDCS_ADD')"
                :index="0"
                :hover-index="1"
                :disabled-index="0"
                :chunk="4"
                :disabled="!enabled"
                @click="addCruiseGroup"
            />
            <BaseImgSprite
                file="start_cruise"
                :title="Translate('IDCS_START')"
                :index="0"
                :hover-index="1"
                :chunk="4"
            />
            <BaseImgSprite
                file="stop_cruise"
                :title="Translate('IDCS_PAUSE')"
                :index="0"
                :hover-index="1"
                :chunk="4"
            />
        </div>
        <ChannelCruiseGroupAddPop
            v-model="pageData.isAddPop"
            :max="pageData.maxCount"
            :cruise="listData"
            :chl-id="chlId"
            @confirm="confirmAddCruiseGroup"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./LivePtzGroupPanel.v.ts"></script>

<style lang="scss" scoped>
.ptz-group {
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
