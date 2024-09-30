<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 14:26:53
 * @Description: 智能分析 - 人脸脸照选项框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 16:41:41
-->
<template>
    <div class="avatar">
        <div
            class="avatar-box"
            @click="changeValue(!modelValue)"
        >
            <div class="avatar-cbx">
                <el-checkbox
                    v-if="type === 'checkbox'"
                    :model-value
                    :disabled
                />
                <BaseImgSprite
                    v-if="icon === 'success' || icon === 'error'"
                    file="floatTip"
                    :index="icon === 'success' ? 1 : 2"
                    :chunk="5"
                />
            </div>
            <div class="avatar-pic">
                <img :src />
                <BaseImgSprite
                    v-if="icon === 'identity'"
                    file="identify_icon"
                    class="identity"
                />
            </div>
        </div>
        <div class="avatar-text"><slot></slot></div>
    </div>
</template>

<script lang="ts" src="./IntelBaseFaceItem.v.ts"></script>

<style lang="scss" scoped>
.avatar {
    width: 102px;
    margin: 5px 20px;

    &-cbx {
        padding: 0 2px;
        display: flex;
        width: 100%;
        height: 20px;
        box-sizing: border-box;
        justify-content: space-between;
        line-height: 10px;

        .el-checkbox {
            height: 20px;
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
    }

    &-pic {
        width: 100%;
        height: 100px;
        position: relative;
    }

    img {
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

    &.active &-box {
        border-color: var(--primary);
    }
}
</style>
