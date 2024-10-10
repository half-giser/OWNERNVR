<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-26 15:31:53
 * @Description: UI2-A 客制化功能面板
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-08 15:47:58
-->
<template>
    <div class="config-home">
        <div class="config-wrapper">
            <div class="config-main-menu">
                <div
                    v-for="(moduleItem, key) in configModules"
                    :key="moduleItem.meta.fullPath"
                    :class="{
                        active: key === pageData.mainMenuIndex,
                        disabled: getMenuDisabled(moduleItem),
                    }"
                    @click="changeMainMenu(key)"
                >
                    <BaseImgSprite
                        :file="moduleItem.meta.icon"
                        :chunk="2"
                        class="icon"
                    />
                    <div>{{ Translate(moduleItem.meta.lk || '') }}</div>
                </div>
            </div>
            <BaseImgSprite file="separator" />
            <div class="config-sub-menu">
                <div
                    v-for="item in subMenu"
                    :key="item[0]"
                    :class="{
                        active: item[0] === pageData.subMenuIndex,
                    }"
                    @click="changeSubMenu(item[0])"
                >
                    {{ Translate(item[1].lk || '') }}
                </div>
            </div>
            <BaseImgSprite file="separator" />
            <div class="config-tri-menu">
                <div
                    v-for="item in triMenu"
                    :key="item.meta.fullPath"
                    :class="{
                        disabled: getMenuDisabled(item),
                    }"
                    @click="goToPage(item)"
                >
                    {{ Translate(item.meta.lk || '') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./FunctionPanel.v.ts"></script>

<style lang="scss" scoped>
.config {
    &-home {
        width: 100%;
        height: var(--content-height);
    }

    &-wrapper {
        display: flex;

        & > span {
            flex-shrink: 0;
            margin-top: -20px;
        }
    }

    &-main-menu {
        width: 433px;
        flex-shrink: 0;
        margin-right: 10px;
        padding-top: 20px;

        & > div {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 50px;
            margin-bottom: 20px;
            cursor: pointer;

            &:hover {
                background-color: var(--primary);
            }

            &.active {
                background-color: var(--primary);
            }

            &.disabled,
            &.disabled:hover {
                cursor: not-allowed;
                background-color: transparent;
                color: var(--config-menu-text-disabled);
            }

            div {
                margin-left: 40px;
                font-size: 18px;
            }
        }
    }

    &-sub-menu {
        width: 300px;
        flex-shrink: 0;
        margin-inline: 10px;
        padding-top: 20px;

        & > div {
            margin-bottom: 10px;
            padding-inline: 10px;
            cursor: pointer;
            line-height: 2;

            &:hover {
                background-color: var(--primary);
            }

            &.active {
                background-color: var(--primary);
            }
        }
    }

    &-tri-menu {
        width: 100%;
        margin-inline: 10px;
        padding-top: 20px;

        & > div {
            margin-bottom: 10px;
            padding-inline: 10px;
            cursor: pointer;
            line-height: 2;

            &:hover {
                color: var(--config-submenu-text-hover);
            }

            &.disabled,
            &.disabled:hover {
                cursor: not-allowed;
                color: var(--config-submenu-text-disabled);
            }
        }
    }
}
</style>
