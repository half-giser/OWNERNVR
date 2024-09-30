<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 18:41:31
 * @Description: 现场预览-云台视图-巡航线
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-21 18:07:28
-->
<template>
    <div class="ptz-cruise">
        <BaseListBox class="ptz-cruise-content">
            <BaseListBoxItem
                v-for="(item, index) in listData"
                :key="item.index"
                :class="{
                    active: pageData.active === index,
                }"
                @click="pageData.active = index"
                @dblclick="playCurrentCruise(index)"
            >
                <span class="ptz-cruise-text text-ellipsis">{{ item.name }}</span>
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
                        @click.stop="deleteCruise(item.index, item.name)"
                    />
                </el-tooltip>
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
                    @click="addCruise"
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
                    @click="playCruise"
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
                    @click="stopCruise"
                />
            </el-tooltip>
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
