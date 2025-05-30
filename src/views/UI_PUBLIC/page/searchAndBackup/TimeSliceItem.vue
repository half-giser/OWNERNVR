<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 17:41:35
 * @Description: 按时间切片 缩略图卡片
-->
<template>
    <div
        class="item"
        :class="[`mode_${mode}`, active && 'active', size]"
    >
        <div
            v-if="mode === 'thumbnail' && showTime"
            class="item-time"
        >
            {{ time || '--:--:--' }}
        </div>
        <div
            v-show="mode === 'thumbnail'"
            class="item-thumbnail"
        >
            <BaseImgSprite
                class="item-thumbnail-404"
                file="empty"
            />
            <img :src="pic" />
        </div>
        <el-tooltip :content="chlName">
            <div class="item-text text-ellipsis">
                <BaseImgSprite
                    v-show="mode === 'icon'"
                    file="chl_s"
                    :chunk="2"
                />
                <span class="text-ellipsis">{{ chlName }}</span>
            </div>
        </el-tooltip>
    </div>
</template>

<script lang="ts" src="./TimeSliceItem.v.ts"></script>

<style lang="scss" scoped>
.item {
    width: 148px;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;

    &.mode_thumbnail:hover,
    &.mode_thumbnail.active {
        .item-thumbnail {
            border-color: var(--primary);
        }

        .item-time {
            border-color: var(--primary);
            background-color: var(--primary);
        }
    }

    &.mode_icon {
        cursor: pointer;
        height: 40px;

        &:hover,
        &.active {
            .item-text {
                border-color: var(--primary);
            }
        }

        .item-text {
            display: flex;
            text-align: left;
            height: 40px;
            line-height: 40px;
            align-items: center;

            span:last-child {
                padding-left: 5px;
            }
        }
    }

    &.small {
        width: 98px;
        margin-right: 10px;
        margin-bottom: 10px;

        .item-thumbnail {
            height: 58px;

            &-404 {
                transform: translate3d(-50%, -50%, 0) scale(0.4);
            }
        }
    }

    &-thumbnail {
        width: 100%;
        height: 98px;
        position: relative;
        border: 1px solid var(--backup-snap-border);

        &-404 {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0) scale(0.6);
            pointer-events: none;
        }

        img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            &[src=''] {
                opacity: 0;
            }
        }
    }

    &-time {
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        text-align: center;
        background-color: var(--backup-snap-bg);
        color: var(--color-white);
        border: 1px solid var(--backup-snap-border);
        border-bottom: none;

        & + .item-thumbnail {
            border-top: none;
        }
    }

    &-text {
        line-height: 20px;
        font-size: 14px;
        width: 100%;
        text-align: center;
        border: 1px solid transparent;
        box-sizing: border-box;
        padding: 0 5px;
    }
}
</style>
