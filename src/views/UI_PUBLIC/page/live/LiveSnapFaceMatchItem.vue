<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:42:37
 * @Description: 现场预览-目标检测视图-人脸比对项组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-27 13:34:48
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
                    <el-tooltip :content="Translate('IDCS_REGISTER')">
                        <BaseImgSprite
                            file="live_add"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('add')"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_SEARCH')">
                        <BaseImgSprite
                            file="live_search"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('search', '')"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_REPLAY')">
                        <BaseImgSprite
                            file="live_play"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="$emit('playRec')"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_MORE')">
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
            <div
                class="item-right"
                @click="$emit('faceDetail')"
            >
                <img :src="displayBase64Img(data.repo_pic)" />
                <div class="item-menu">
                    <el-tooltip :content="Translate('IDCS_SEARCH')">
                        <BaseImgSprite
                            file="live_search"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('search', 'face')"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_REPLAY')">
                        <BaseImgSprite
                            file="live_play"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('playRec')"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_MORE')">
                        <BaseImgSprite
                            file="live_more"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="$emit('faceDetail')"
                        />
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="item-center">
            <div>{{ data.chlName }}</div>
            <div>{{ data.info.similarity }}%</div>
            <div>{{ displayTime(data.detect_time) }}</div>
        </div>
        <div class="item-bottom">
            <span>{{ data.info.text_tip || data.info.group_name }}</span>
            <span>({{ data.info.remarks || data.info.name }})</span>
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
        background-color: var(--bg-table);

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
        background-color: var(--panel-snap-btn-bg);

        span {
            margin: 0 1px;
            cursor: pointer;
        }
    }

    &-right {
        margin-left: 10px;
    }

    &-center {
        margin-top: 5px;
        line-height: 22px;
        display: flex;

        & > div {
            margin: 0 5px;
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
