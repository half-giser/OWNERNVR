<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 16:46:13
 * @Description: UI1-D客制化 功能面板
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 10:49:28
-->
<template>
    <div class="config-home">
        <div class="config-wrapper">
            <div class="config-menu">
                <div
                    v-for="(moduleItem, key) in configModules"
                    :key="moduleItem.meta.fullPath"
                    class="config-menu-item"
                    :class="{
                        active: key === pageData.mainMenuIndex,
                    }"
                    @click="changeMainMenu(key)"
                    @mouseenter="hoverMainMenu(key, true)"
                    @mouseleave="hoverMainMenu(key, false)"
                >
                    <BaseImgSprite
                        :file="moduleItem.meta.icon"
                        :index="key === pageData.mainMenuIndex || key === pageData.hoverMenuIndex ? 1 : 0"
                        :chunk="2"
                    />
                    <div class="config-menu-text">{{ Translate(moduleItem.meta.lk || '') }}</div>
                </div>
            </div>
            <div class="config-submenu">
                <div
                    v-for="(moduleItem, key) in configModules"
                    v-show="pageData.mainMenuIndex === key"
                    :key="moduleItem.meta.fullPath"
                    class="config-submenu-content"
                >
                    <div>
                        <BaseImgSprite :file="`${moduleItem.meta.icon}_l`" />
                        <BaseImgSprite file="separator" />
                    </div>
                    <div>
                        <div
                            v-for="subMenu in moduleItem.children"
                            :key="subMenu.meta.fullPath"
                            class="config-submenu-item"
                            @click.stop="router.push(subMenu.meta.fullPath)"
                            v-text="Translate(subMenu.meta.lk || '')"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="@/views/UI_PUBLIC/page/topFeature/FunctionPanel.v.ts"></script>

<style lang="scss" scoped>
.config {
    &-home {
        width: 100%;
        height: var(--content-height);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &-wrapper {
        width: 714px;
        border: 1px solid var(--border-color1);
    }

    &-menu {
        display: flex;
        width: 100%;
        height: 100px;
        justify-content: space-between;

        &-item {
            width: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: var(--text-menu-04);
            background-color: var(--bg-menu-04);
            font-size: 14px;
            cursor: pointer;
            margin: 0 1px;

            div {
                text-align: center;
            }

            &:hover {
                color: var(--text-menu-04-hover);
                background-color: var(--bg-menu-04-hover);
            }

            &.active {
                color: var(--text-menu-04-active);
                background-color: var(--bg-menu-04-hover);

                &:hover {
                    color: var(--text-menu-04-active);
                    background-color: var(--bg-menu-04-active);
                }
            }
        }
    }

    &-submenu {
        width: 100%;
        height: 310px;
        background-color: var(--bg-menu-05);

        &-content {
            padding: 20px 20px 20px 80px;
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            box-sizing: border-box;

            span:last-child {
                margin-left: 20px;
            }

            & > div:first-child {
                width: 200px;
            }
        }

        &-item {
            line-height: 2;
            cursor: pointer;
            color: var(--text-menu-05);

            &:hover {
                color: var(--text-menu-05-hover);
            }
        }
    }
}
</style>
