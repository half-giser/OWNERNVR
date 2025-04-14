<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 13:37:47
 * @Description: 现场预览-镜头控制视图
-->
<template>
    <div class="lens">
        <el-form
            v-title
            :style="{
                '--form-label-width': '100px',
                '--form-input-width': '130px',
            }"
        >
            <div class="lens-ctrl lens-ctrl1">
                <div
                    class="lens-btn"
                    @mousedown="addCmd('ZoomOut')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSpriteBtn
                        file="SpeedSlow"
                        :index="[0, 2, 2, 3]"
                    />
                </div>

                <BaseImgSprite
                    class="arrow"
                    file="arr_left"
                />
                <span class="lens-txt">{{ Translate('IDCS_ZOOM') }}</span>
                <BaseImgSprite
                    class="arrow"
                    file="arr_right"
                />
                <div
                    class="lens-btn"
                    @mousedown="addCmd('ZoomIn')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSpriteBtn
                        file="SpeedQuick"
                        :index="[0, 2, 2, 3]"
                    />
                </div>
            </div>
            <el-form-item :label="Translate('IDCS_FOCUS_MODE')">
                <el-select-v2
                    v-model="formData.focusType"
                    :options="pageData.focusOptions"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.focusType === 'auto'"
                :label="Translate('IDCS_FOCUS_TIME')"
            >
                <el-select-v2
                    v-model="formData.focusTime"
                    :options="pageData.timeIntervalOptions"
                />
            </el-form-item>
            <div
                v-show="formData.focusType === 'manual'"
                class="lens-ctrl lens-ctrl2"
            >
                <div
                    class="lens-btn"
                    @mousedown="addCmd('Far')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSpriteBtn
                        file="SpeedSlow"
                        :index="[0, 2, 2, 3]"
                    />
                </div>
                <BaseImgSprite
                    class="arrow"
                    file="arr_left"
                />
                <span class="lens-txt">{{ Translate('IDCS_FOCUS') }}</span>
                <BaseImgSprite
                    class="arrow"
                    file="arr_right"
                />
                <div
                    class="lens-btn"
                    @mousedown="addCmd('Near')"
                    @mouseup="addCmd('Stop')"
                >
                    <BaseImgSpriteBtn
                        file="SpeedQuick"
                        :index="[0, 2, 2, 3]"
                    />
                </div>
                <el-button
                    class="lens-onekeyfocus"
                    @mousedown="addCmd('OneKeyFocus')"
                    @mouseup="addCmd('Stop')"
                >
                    {{ Translate('IDCS_ONE_KEY_FOCUS') }}
                </el-button>
            </div>
            <div class="lens-tip">
                <span class="text-error">{{ Translate('IDCS_FOCUS_MODEL_TIP') }}</span>
            </div>
            <!-- <p class="focus-tip"></p> -->
            <el-form-item>
                <el-checkbox
                    v-model="formData.irchangeFocus"
                    :disabled="formData.focusType === 'auto' && !formData.focusTime"
                    :label="Translate('IDCS_AUTO_FOCUS_TIP')"
                />
            </el-form-item>
            <div class="base-btn-box space-between">
                <div>
                    <BaseFloatError
                        v-model:message="pageData.errorMessage"
                        :type="pageData.errorMessageType"
                    />
                </div>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./LiveLensPanel.v.ts"></script>

<style lang="scss" scoped>
.lens {
    padding-top: 15px;

    &-ctrl {
        display: flex;
        padding: 15px 10px 0;
        height: 32px;
        line-height: 32px;
        align-items: center;

        &1 {
            padding-bottom: 40px;
        }

        &2 {
            padding: 20px 10px 10px;
        }
    }

    .arrow {
        margin: 0 3px;
    }

    &-btn {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--btn-border);
        cursor: pointer;
        margin: 0 5px;

        &:hover {
            background-color: var(--primary-light);
        }
    }

    &-txt {
        flex-shrink: 0;
        margin: 0 3px;
    }

    &-tip {
        padding: 10px 10px 40px;
    }

    &-onekeyfocus {
        margin-right: 0 !important;
    }
}
</style>
