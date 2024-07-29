<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:45:40
 * @Description: 现场预览-目标检测视图-渲染单个抓拍元素组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 10:33:18
-->
<template>
    <div
        class="item"
        :class="{ border }"
    >
        <div class="item-top">
            <div
                class="item-left"
                @click="$emit('detail')"
            >
                <img :src="displayBase64Img(data.snap_pic)" />
                <div class="item-menu">
                    <el-tooltip
                        :content="Translate('IDCS_REGISTER')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            v-show="isAddBtn"
                            file="live_add"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('add')"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :content="Translate('IDCS_SEARCH')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="live_search"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('search')"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :content="Translate('IDCS_REPLAY')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="live_play"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="$emit('playRec')"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :content="Translate('IDCS_MORE')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="live_more"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="$emit('detail')"
                        />
                    </el-tooltip>
                </div>
            </div>
            <div class="item-right">
                <div>{{ data.chlName }}</div>
                <div>{{ displayTime(data.detect_time) }}</div>
            </div>
        </div>
        <div
            class="item-bottom"
            :style="{
                opacity: msgOpacity,
            }"
            :class="{
                border: msgBorder,
            }"
        >
            <span>{{ displayTip }}</span>
            <span :dir="data.type === 'vehicle_plate' ? getTextDir() : 'ltr'">{{ displayMsg }}</span>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveSnapItem.v.ts"></script>

<style lang="scss" scoped>
.item {
    width: 235px;
    margin: 5px auto;
    padding: 5px;
    border: 1px solid var(--border-dark);
    box-sizing: border-box;
    font-size: 12px;

    &.border {
        border-color: var(--border-snap-history);
    }

    &-top {
        display: flex;
        justify-content: center;
    }

    &-left {
        position: relative;
        width: 100px;
        height: 120px;
        background-color: var(--bg-table);
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: fill;
        }

        &:hover .item-menu {
            opacity: 1;
        }
    }

    &-menu {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 30px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        background-color: var(--bg-color-opacity2);

        span {
            margin: 0 1px;
            cursor: pointer;
        }
    }

    &-right {
        line-height: 22px;
        margin-left: 5px;
        padding-top: 10px;
        width: 100%;
    }

    &-bottom {
        width: 100%;
        margin-top: 20px;
        display: flex;
        justify-content: center;
        line-height: 16px;
        color: var(--primary--04);

        &.border {
            border: 1px solid var(--primary--02);
        }

        .rtl {
            direction: rtl;
        }
    }
}
</style>
