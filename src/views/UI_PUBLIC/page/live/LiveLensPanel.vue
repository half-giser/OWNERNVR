<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 13:37:47
 * @Description: 现场预览-镜头控制视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-26 18:02:14
-->
<template>
    <div class="lens">
        <el-form
            label-position="left"
            :style="{
                '--form-label-width': '100px',
                '--form-input-width': '130px',
            }"
        >
            <div class="lens-ctrl">
                <div
                    class="lens-btn"
                    @mousedown="addCmd('ZoomOut')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSprite
                        file="SpeedSlow"
                        :index="0"
                        :chunk="4"
                    />
                </div>

                <BaseImgSprite file="arr_left" />
                <span class="lens-txt">{{ Translate('IDCS_ZOOM') }}</span>
                <BaseImgSprite file="arr_right" />
                <div
                    class="lens-btn"
                    @mousedown="addCmd('ZoomIn')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSprite
                        file="SpeedQuick"
                        :index="0"
                        :chunk="4"
                    />
                </div>
            </div>
            <el-form-item :label="Translate('IDCS_FOCUS_MODE')">
                <el-select v-model="formData.focusType">
                    <el-option
                        v-for="item in pageData.focusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                v-show="formData.focusType === 'auto'"
                :label="Translate('IDCS_FOCUS_TIME')"
            >
                <el-select v-model="formData.focusTime">
                    <el-option
                        v-for="item in pageData.timeIntervalOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div
                v-show="formData.focusType === 'manual'"
                class="lens-ctrl"
            >
                <div
                    class="lens-btn"
                    @mousedown="addCmd('Far')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSprite
                        file="SpeedSlow"
                        :index="0"
                        :hover-index="2"
                        :chunk="4"
                    />
                </div>
                <BaseImgSprite file="arr_left" />
                <span class="lens-txt">{{ Translate('IDCS_FOCUS') }}</span>
                <BaseImgSprite file="arr_right" />
                <div
                    class="lens-btn"
                    @mousedown="addCmd('Near')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSprite
                        file="SpeedQuick"
                        :index="0"
                        :hover-index="2"
                        :chunk="4"
                    />
                </div>
                <el-button
                    class="lens-onekeyfocus"
                    @mousedown="addCmd('OneKeyFocus')"
                    @mouseup="addCmd('Stop')"
                    >{{ Translate('IDCS_ONE_KEY_FOCUS') }}</el-button
                >
            </div>
            <el-form-item>
                <el-text class="lens-tip">{{ Translate('IDCS_FOCUS_MODEL_TIP') }}</el-text>
            </el-form-item>
            <!-- <p class="focus-tip"></p> -->
            <el-form-item>
                <el-checkbox
                    v-model="formData.irchangeFocus"
                    :disabled="formData.focusType === 'auto' && !formData.focusTime"
                    >{{ Translate('IDCS_AUTO_FOCUS_TIP') }}</el-checkbox
                >
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./LiveLensPanel.v.ts"></script>

<style lang="scss" scoped>
.lens {
    padding-top: 30px;

    &-ctrl {
        display: flex;
        padding: 15px 10px;
        height: 32px;
        line-height: 32px;
        align-items: center;
    }

    &-btn {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--border-dark);
        cursor: pointer;
        margin: 0 5px;

        &:hover {
            background-color: var(--primary--01);
        }
    }

    &-txt {
        flex-shrink: 0;
    }

    &-tip {
        color: var(--error--01);
    }

    &-onekeyfocus {
        margin-right: 0 !important;
    }
}
</style>
