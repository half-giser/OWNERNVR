<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-13 11:45:40
 * @Description: 智能分析 - 人脸搜索 - 轨迹 - 修改颜色
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-13 17:55:39
-->
<template>
    <el-dialog
        :title="Translate('IDCS_COLOR')"
        width="480"
        align-center
        draggable
        @open="open"
    >
        <div class="colors">
            <div class="colors-item">
                <div class="colors-label">
                    <BaseImgSprite file="track_name_color" />
                    <div>{{ Translate('IDCS_CAMERANAME_COLOR') }}</div>
                </div>
                <div class="colors-list">
                    <div
                        v-for="item in colors"
                        :key="item"
                        :class="{
                            active: pageData.fontColor === item,
                        }"
                        @click="pageData.fontColor = item"
                    >
                        <div :style="{ background: item }" />
                    </div>
                </div>
            </div>
            <div class="colors-item">
                <div class="colors-label">
                    <BaseImgSprite file="track_line_color" />
                    <div>{{ Translate('IDCS_LINE_COLOR') }}</div>
                </div>
                <div class="colors-list">
                    <div
                        v-for="item in colors"
                        :key="item"
                        :class="{
                            active: pageData.lineColor === item,
                        }"
                        @click="pageData.lineColor = item"
                    >
                        <div :style="{ background: item }" />
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceSearchTrackMapColorPop.v.ts"></script>

<style lang="scss" scoped>
.colors {
    &-item {
        display: flex;
    }

    &-label {
        width: 80px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        span {
            background-color: var(--primary);
        }
    }

    &-list {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        & > div {
            width: 32px;
            height: 32px;
            margin: 5px;
            box-sizing: border-box;
            border: 1px solid transparent;

            &.active {
                border-color: var(--intel-snap-border);
            }

            div {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 1px solid var(--intel-snap-border);
            }
        }
    }
}
</style>
