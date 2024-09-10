<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:33:02
 * @Description: 智能分析 - 抓拍选项框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-09 15:12:27
-->
<template>
    <div
        class="snap"
        :class="{ panorama: type === 'panorama' }"
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
                <BaseImgSprite
                    v-show="!src"
                    class="snap-404"
                    file="empty"
                    :index="0"
                />
                <img :src />
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
        width: 242px;
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
        background-color: var(--bg-color4);

        .el-checkbox {
            height: 25px;
        }
    }

    &-box {
        position: relative;
        width: 100%;
        border: 1px solid var(--border-dark);
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
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0) scale(0.6) !important;
        pointer-events: none;
    }

    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;

        &[src=''] {
            opacity: 0;
        }
    }
}
</style>
