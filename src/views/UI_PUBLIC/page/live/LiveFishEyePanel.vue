<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-25 13:42:29
 * @Description: 现场预览-鱼眼视图
-->
<template>
    <div class="fisheye">
        <h2>{{ Translate('IDCS_FISHEYE_MODE') }}</h2>
        <div class="fisheye-btns">
            <div
                v-for="item in pageData.menu"
                v-show="pageData.supportMenu.includes(item.value)"
                :key="item.value"
            >
                <BaseImgSpriteBtn
                    :file="item.file"
                    :title="item.label"
                    :active="pageData.installType === item.value"
                    :disabled="!supportFishEye"
                    @click="changeInstallType(item.value)"
                />
            </div>
        </div>
        <h2>{{ Translate('IDCS_FISHEYE_DISPLAY') }}</h2>
        <div
            v-for="item in pageData.menu"
            v-show="pageData.installType === item.value"
            :key="item.value"
            class="fisheye-btns2"
        >
            <div
                v-for="child in item.children"
                v-show="pageData.supportMenu.includes(`${item.value}_${child.value}`)"
                :key="child.value"
            >
                <BaseImgSpriteBtn
                    :file="child.file"
                    :title="child.label"
                    :active="pageData.fishEyeMode === child.value"
                    :disabled="!supportFishEye"
                    @click="changeFishEyeMode(child.value)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveFishEyePanel.v.ts"></script>

<style lang="scss" scoped>
.fisheye {
    h2 {
        font-weight: normal;
        font-size: 14px;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 20px;
        border-bottom: 1px solid var(--content-border);
        color: var(--dialog-title);
        margin: 5px;
    }

    &-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-left: 20px;

        & > * {
            margin: 10px 5px;
        }
    }

    &-btns2 {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-left: 17px;

        & > * {
            margin: 18px 17px;
        }
    }
}
</style>
