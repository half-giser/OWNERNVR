<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-22 17:33:15
 * @Description: 功能面板
-->
<template>
    <div id="configHomeContainer">
        <div
            v-for="moduleItem in configModules"
            :key="moduleItem.meta.fullPath"
            class="moduleItem"
            :class="[
                moduleItem.meta.plClass,
                {
                    disabled: getMenuDisabled(moduleItem),
                },
            ]"
            @click="goToDefaultPage(moduleItem)"
        >
            <BaseImgSprite
                :file="moduleItem.meta.icon"
                :index="getMenuDisabled(moduleItem) ? 1 : 0"
                :chunk="2"
                class="icon"
            />
            <div class="menuContent">
                <div class="mainMenu">
                    <span v-text="Translate(moduleItem.meta.lk || '')"></span>
                </div>
                <div class="subMenus">
                    <span
                        v-for="subMenu in moduleItem.children"
                        :key="subMenu.meta.fullPath"
                        :class="{
                            disabled: getMenuDisabled(subMenu),
                        }"
                        @click.stop="goToPage(subMenu, moduleItem)"
                        v-text="Translate(subMenu.meta.lk || '')"
                    ></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./FunctionPanel.v.ts"></script>

<style lang="scss" scoped>
#configHomeContainer {
    width: 1160px;
    margin: 35px auto 0px;
    display: flex;
    flex-wrap: wrap;

    .moduleItem {
        position: relative;
        padding: 10px 0px 0px 20px;
        overflow: hidden;
        border: solid 2px var(--config-menu-border);
        height: 135px;
        margin: 0px 8px 10px 0px;
        display: flex;
        background-color: var(--config-menu-bg);

        &:hover {
            border-color: var(--config-menu-border-hover);
            background-color: var(--config-menu-bg-hover);
        }

        &.md1 {
            width: 336px;
        }

        &.md2 {
            width: 354px;
        }

        &.md3 {
            width: 232px;
        }

        .icon {
            margin: 20px 0px 0px 0px;
            flex-shrink: 0;
        }

        &.disabled,
        &.disaebld:hover {
            border-color: var(--config-menu-border-disabled);
            background-color: var(--config-menu-bg-disabled);
            cursor: not-allowed;
        }

        &.disabled {
            .mainMenu,
            .mainMenu:hover {
                cursor: not-allowed;
                color: var(--config-menu-text-disabled);
            }

            .subMenus,
            .subMenus:hover {
                span {
                    cursor: not-allowed;
                    text-decoration: none;
                    color: var(--config-submenu-text-disabled);

                    &:not(:last-of-type):after {
                        background-color: var(--config-submenu-text-disabled);
                    }
                }
            }
        }
    }

    .menuContent {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        padding-right: 5px;
    }

    .mainMenu {
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        color: var(--config-menu-text);
        margin: 6px 0px 0px 8px;
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover {
            color: var(--config-menu-text-hover);
        }
    }

    .subMenus {
        position: relative;
        margin: 8px 0px 0px 8px;
        padding: 4px 6px 0px 0px;

        span {
            font-size: 15px;
            text-decoration: none;
            cursor: pointer;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--config-submenu-text);

            &:not(:last-of-type):after {
                content: '';
                display: inline-block;
                margin: 0px 2px;
                position: relative;
                top: 2px;
                width: 1px;
                height: 15px;
                background-color: var(--config-submenu-text);
            }

            &:hover {
                text-decoration: underline;
                color: var(--config-submenu-text-hover);
            }

            &.disabled,
            &.disabled:hover {
                cursor: not-allowed;
                text-decoration: none;
                color: var(--config-menu-text-disabled);
            }
        }
    }
}
</style>
