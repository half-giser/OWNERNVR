<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:33:02
 * @Description: 智能分析 - 抓拍选项框
-->
<template>
    <div
        class="snap"
        :class="{
            panorama: type === 'panorama',
            match: type === 'match',
            struct: type === 'struct',
        }"
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
                <BaseImgSpriteBtn
                    file="face_search_more"
                    :index="[3, 2, 2, 0]"
                    @click="$emit('detail')"
                />
            </div>
            <div class="snap-pic">
                <div class="snap-404">{{ errorText }}</div>
                <!-- 抓拍图 -->
                <img
                    :src
                    @load="loadImg"
                />
                <!-- 对比图 -->
                <img
                    v-show="type === 'match'"
                    :src="matchSrc"
                />
                <ul
                    v-if="type === 'struct'"
                    class="snap-info"
                >
                    <li
                        v-for="(item, key) in infoList"
                        :key
                    >
                        <BaseImgSprite :file="item.icon" />
                        <span>{{ item.value }}</span>
                    </li>
                </ul>
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

        .snap-pic {
            height: 130px;
        }

        .snap-404 {
            line-height: 130px;
        }
    }

    &.struct {
        width: 240px;

        .snap-pic {
            height: 175px;
        }

        img {
            width: 114px;
        }

        .snap-404 {
            line-height: 130px;
        }
    }

    &-info {
        position: absolute;
        right: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 120px;
        line-height: 22px;
        margin: 0;
        padding: 0;

        li {
            margin-left: 10px;
            list-style: none;
            font-size: 14px;

            &:not(:first-child) {
                margin-top: 10px;
            }

            span:last-child {
                margin-left: 10px;
            }
        }
    }

    &.match {
        width: 234px;

        img {
            width: 114px;

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
