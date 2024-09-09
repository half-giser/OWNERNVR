<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:50
 * @Description: 现场预览-云台视图-巡航线组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 10:54:16
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
                <el-tooltip
                    :content="Translate('IDCS_DELETE')"
                    :show-after="500"
                >
                    <BaseImgSprite
                        file="delete (2)"
                        :index="0"
                        :disabled-index="1"
                        :chunk="2"
                        :disabled="!enabled"
                        @click.stop="deleteCruiseGroup(item.index, item.name)"
                    />
                </el-tooltip>
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-group-btns">
            <el-tooltip
                :content="Translate('IDCS_ADD')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="preset_Add"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="0"
                    :chunk="4"
                    :disabled="!enabled"
                    @click="addCruiseGroup"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_START')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="start_cruise"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_PAUSE')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="stop_cruise"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                />
            </el-tooltip>
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

<script lang="ts" src="./LivePtzGroup.v.ts"></script>

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
        border-top: 1px solid var(--border-color4);
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
