<!--
 * @Description: 车牌颜色选择弹窗
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2025-05-20 17:07:12
-->
<template>
    <div>
        <div
            class="base-intel-placeholder"
            @click="pageData.isPop = !pageData.isPop"
        >
            <div class="text-ellipsis">{{ content }}</div>
            <BaseImgSprite
                file="arrow"
                :chunk="4"
            />
        </div>
        <el-dialog
            v-model="pageData.isPop"
            width="600"
            :title="Translate('IDCS_COLOR')"
            @open="open"
        >
            <div class="color_enable">
                <el-checkbox
                    v-model="pageData.enable"
                    :label="Translate('IDCS_PLATE_COLOR')"
                />
            </div>
            <div
                v-title
                class="color_list"
            >
                <span
                    v-for="(item, index) in pageData.colors"
                    :key="index"
                    class="color_item"
                    :class="{ active: item.selected }"
                >
                    <BaseImgSpriteBtn
                        :title="item.label"
                        :file="`${item.value}Btn`"
                        :active="item.selected"
                        @click="chooseColor(item.value)"
                    />
                </span>
            </div>
            <div class="base-btn-box">
                <el-button @click="reset">
                    {{ Translate('IDCS_RESET') }}
                </el-button>
                <el-button @click="confirm">
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="close">
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./IntelBasePlateColorPop.v.ts"></script>

<style lang="scss" scoped>
.color_enable {
    display: flex;
    align-items: center;
    margin: 20px 0;
}

.color_list {
    width: 100%;
    height: 70px;
    display: flex;
    justify-content: space-between;

    .color_item {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--main-text);

        &.active {
            border: 1px solid var(--primary);
        }
    }
}
</style>
