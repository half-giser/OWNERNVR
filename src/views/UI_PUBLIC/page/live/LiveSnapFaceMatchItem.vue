<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:42:37
 * @Description: 现场预览-目标检测视图-人脸比对项组件
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
                    <!-- <BaseImgSpriteBtn
                        file="live_add"
                        :title="Translate('IDCS_REGISTER')"
                        @click="$emit('add')"
                    /> -->
                    <BaseImgSpriteBtn
                        file="live_search"
                        :title="Translate('IDCS_SEARCH')"
                        @click="$emit('search', '')"
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
            <div
                class="item-right"
                @click="$emit('faceDetail')"
            >
                <img
                    :src="displayBase64Img(data.repo_pic)"
                    @load="loadImg"
                />
                <div class="item-menu">
                    <BaseImgSpriteBtn
                        file="live_search"
                        :title="Translate('IDCS_SEARCH')"
                        @click="$emit('search', 'featureImg')"
                    />
                    <BaseImgSpriteBtn
                        file="live_play"
                        :title="Translate('IDCS_REPLAY')"
                        @click="$emit('playRec')"
                    />
                    <BaseImgSpriteBtn
                        file="live_more"
                        :title="Translate('IDCS_MORE')"
                        @click="$emit('faceDetail')"
                    />
                </div>
            </div>
        </div>
        <div class="item-center">
            <div>{{ data.chlName }}</div>
            <div>{{ data.info?.similarity }}%</div>
            <div>{{ displayTime(data.detect_time) }}</div>
        </div>
        <div class="item-bottom">
            <span>{{ data.info?.text_tip || data.info?.group_name }}</span>
            <span>({{ data.info?.remarks || data.info?.name }})</span>
            <span></span>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveSnapFaceMatchItem.v.ts"></script>

<style lang="scss" scoped>
.item {
    width: 235px;
    margin: 5px auto;
    padding: 5px;
    border: 1px solid var(--panel-snap-border);
    font-size: 12px;
    box-sizing: border-box;

    &.border {
        border-color: var(--panel-snap-history-border);
    }

    &-top {
        display: flex;
        justify-content: center;
    }

    &-left,
    &-right {
        position: relative;
        width: 100px;
        height: 120px;

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
        margin-left: 10px;
    }

    &-center {
        margin-top: 5px;
        line-height: 22px;
        display: flex;
        justify-content: space-around;

        & > div {
            margin: 0 5px;

            &:nth-child(2) {
                padding: 0 5px;
                border: 1px solid var(--table-border);
                border-radius: 11px;
            }
        }
    }

    &-bottom {
        margin-top: 5px;
        width: 100%;
        display: flex;
        justify-content: center;
        line-height: 16px;
        color: var(--primary);

        &.border {
            border: 1px solid var(--primary);
        }

        .rtl {
            direction: rtl;
        }
    }
}
</style>
