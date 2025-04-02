<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:45:57
 * @Description: 现场预览-目标检测面板-渲染单个结构化抓拍元素
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
                <img
                    :src="displayBase64Img(data.snap_pic)"
                    @load="loadImg"
                />
                <div class="item-menu">
                    <BaseImgSpriteBtn
                        v-show="isAddBtn"
                        file="live_add"
                        :title="Translate('IDCS_REGISTER')"
                        @click="$emit('add')"
                    />
                    <BaseImgSpriteBtn
                        file="live_search"
                        :title="Translate('IDCS_SEARCH')"
                        @click="$emit('search')"
                    />
                    <BaseImgSpriteBtn
                        file="live_play"
                        :title="Translate('IDCS_REPLAY')"
                        @click="$emit('playRec')"
                    />
                    <BaseImgSpriteBtn
                        file="live_more"
                        :title="Translate('IDCS_MORE')"
                        @click="$emit('detail')"
                    />
                </div>
            </div>
            <ul class="item-right">
                <li
                    v-for="(item, key) in infoList"
                    :key
                >
                    <BaseImgSprite :file="item.icon" />
                    <span>{{ item.value }}</span>
                </li>
                <!-- <div>{{ data.chlName }}</div>
                <div>{{ displayTime(data.detect_time) }}</div> -->
            </ul>
        </div>
        <div class="item-bottom">
            <span>{{ data.chlName }}</span>
            <span>{{ displayTime(data.detect_time) }}</span>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveSnapStructItem.v.ts"></script>

<style lang="scss" scoped>
.item {
    width: 235px;
    margin: 5px auto;
    padding: 5px;
    border: 1px solid var(--panel-snap-border);
    box-sizing: border-box;
    // font-size: 12px;

    &.border {
        border-color: var(--panel-snap-history-border);
    }

    &-top {
        display: flex;
        justify-content: center;
        height: 134px;
    }

    &-left {
        position: relative;
        width: 100px;
        height: 134px;
        background-color: var(--bg-table);
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            background-color: var(--panel-menu-bg);
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
        background-color: var(--panel-snap-btn-bg);

        span {
            margin: 0 1px;
        }
    }

    &-right {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 100%;
        line-height: 22px;
        margin: 0;
        margin-left: 10px;
        padding: 0;

        li {
            list-style: none;

            span:last-child {
                margin-left: 10px;
            }
        }
    }

    &-bottom {
        width: 100%;
        margin-top: 10px;
        display: flex;
        justify-content: center;
        line-height: 16px;

        span {
            width: 50%;
            text-align: center;
        }
    }
}
</style>
