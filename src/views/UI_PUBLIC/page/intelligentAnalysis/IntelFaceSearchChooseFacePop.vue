<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 10:39:32
 * @Description: 智能分析 - 人脸搜索 - 选择人脸弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD')"
        :model-value="modelValue"
        width="1130"
        append-to-body
        @open="open"
        @close="$emit('update:modelValue', false)"
    >
        <div class="choose">
            <div class="choose-left">
                <div>
                    <div
                        v-for="item in pageData.typeOptions"
                        :key="item.value"
                        :class="{ active: item.value === pageData.type }"
                        @click="changeType(item.value)"
                    >
                        {{ item.label }}
                    </div>
                </div>
            </div>
            <div class="choose-right">
                <IntelFaceDBChooseFaceFacePanel
                    v-show="pageData.type === 'face'"
                    :visible="pageData.isFaceOpen"
                    multiple
                    @change="chooseFace"
                />
                <IntelFaceDBChooseFaceSnapPanel
                    v-show="pageData.type === 'snap'"
                    :visible="modelValue"
                    :search-type="pageData.openType"
                    multiple
                    @change="chooseSnap"
                />
            </div>
        </div>
        <div class="base-btn-box">
            <el-button
                v-show="pageData.type !== 'import'"
                :disabled="pageData.type !== 'face' && pageData.type !== 'snap'"
                @click="confirm"
            >
                {{ Translate('IDCS_SELECT') }}
            </el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceSearchChooseFacePop.v.ts"></script>

<style lang="scss" scoped>
.choose {
    display: flex;

    &-left {
        width: 150px;
        height: 460px;
        border: 1px solid var(--content-border);
        flex-shrink: 0;
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        & > div {
            & > div {
                height: 50px;
                width: 100%;
                line-height: 50px;
                text-align: center;
                cursor: pointer;

                &.active {
                    color: var(--main-text-active);
                    background-color: var(--primary);
                }
            }
        }
    }

    &-right {
        height: 460px;
    }
}

.current {
    width: 922px;
    height: 450px;
    border: 1px solid var(--content-border);
    margin-top: 10px;

    &-scroll {
        border-bottom: 1px solid var(--content-border);
        height: calc(100% - 40px);
        width: 100%;
    }

    &-list {
        display: flex;
        flex-wrap: wrap;
        box-sizing: border-box;
        padding: 10px 0;
    }
}

.current-group {
    .el-table {
        width: 400px;
    }
}
</style>
