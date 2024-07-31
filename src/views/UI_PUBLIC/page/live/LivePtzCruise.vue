<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:31
 * @Description: 现场预览-云台视图-巡航线
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:01:29
-->
<template>
    <div class="ptz-cruise">
        <BaseListBox class="ptz-cruise-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.value"
                :class="{
                    active: pageData.active === index,
                }"
                @click="pageData.active = index"
                @dblclick="playCurrentCruise(index)"
            >
                <span class="ptz-cruise-text text-ellipsis">{{ item.label }}</span>
                <BaseImgSprite
                    file="delete (2)"
                    :index="1"
                    :disabled-index="1"
                    :chunk="2"
                    :disabled="!enabled"
                    @click.stop="deleteCruise(item.value, item.label)"
                />
            </BaseListBoxItem>
        </BaseListBox>
        <div class="ptz-cruise-btns">
            <el-tooltip
                :content="Translate('IDCS_ADD')"
                :show-after="500"
            >
                <BaseImgSprite
                    file="preset_Add"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="0"
                    :disabled="!enabled"
                    :chunk="4"
                />
            </el-tooltip>
            <el-tooltip
                :content="Translate('IDCS_START_CRUISE')"
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
                :content="Translate('IDCS_STOP_CRUISE')"
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
    </div>
</template>

<script lang="ts" src="./LivePtzCruise.v.ts"></script>

<style lang="scss" scoped>
.ptz-cruise {
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
        height: 100%;
        flex-shrink: 0;
    }
}
</style>
