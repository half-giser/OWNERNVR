<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:33:02
 * @Description: 智能分析 - 抓拍选项框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-12 09:10:09
-->
<template>
    <div
        class="snap"
        :class="{ panorama: type === 'panorama', match: type === 'match' }"
    >
        <div
            class="snap-box"
            @click="changeValue(!modelValue)"
        >
            <div class="snap-cbx">
                <el-checkbox
                    :model-value
                    :disabled
                    @update:model-value="changeValue"
                    @click.stop
                />
                <BaseImgSprite
                    v-show="play"
                    file="track_camera_on_play"
                />
                <BaseImgSprite
                    file="face_search_more"
                    :index="3"
                    :hover-index="2"
                    :chunk="4"
                    @click.stop="$emit('detail')"
                />
            </div>
            <div class="snap-pic">
                <div class="snap-404">{{ errorText }}</div>
                <img :src />
                <img
                    v-show="type === 'match'"
                    :src="matchSrc"
                />
                <BaseImgSprite
                    v-show="identity"
                    class="identity"
                    file="identify_icon"
                />
            </div>
        </div>
        <div class="snap-text"><slot></slot></div>
    </div>
</template>

<script lang="ts" src="./IntelBaseSnapItem.v.ts"></script>

<style lang="scss" scoped>
.snap {
    width: 102px;
    margin: 5px 20px;
    user-select: none;

    &.panorama {
        width: 234px;
        // object-fit: cover;

        .snap-pic {
            height: 130px;
        }

        .snap-404 {
            line-height: 130px;
        }
    }

    &.match {
        width: 234px;

        img {
            width: 114px;
            object-fit: cover;
            &:nth-of-type(2) {
                left: unset;
                right: 0;
            }
        }

        .snap-404 {
            width: 102px;
            line-height: 130px;
        }

        .snap-pic {
            height: 130px;
        }

        .snap-404 {
            line-height: 130px;
        }
    }

    &-cbx {
        padding: 0 5px;
        display: flex;
        width: 100%;
        height: 25px;
        box-sizing: border-box;
        justify-content: space-between;
        align-items: center;
        line-height: 10px;
        background-color: var(--subheading-bg);

        .el-checkbox {
            height: 25px;
        }
    }

    &-box {
        position: relative;
        width: 100%;
        border: 1px solid var(--intel-snap-border);
        box-sizing: border-box;
    }

    &-text {
        width: 100%;
        text-align: center;
        margin-top: 2px;
        font-size: 14px;
    }

    &-pic {
        width: 100%;
        height: 120px;
        position: relative;
    }

    &-404 {
        line-height: 120px;
        width: 100%;
        text-align: center;
    }

    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;

        &[src=''] {
            opacity: 0;
        }
    }

    .identity {
        position: absolute;
        top: 0;
        right: 0;
    }
}
</style>
