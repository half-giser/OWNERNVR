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
            :class="['moduleItem', moduleItem.meta.plClass]"
        >
            <BaseImgSprite
                :file="moduleItem.meta.icon"
                :chunk="2"
                class="icon"
            />
            <div class="menuContent">
                <div class="mainMenu">
                    <span
                        @click="toDefault(moduleItem)"
                        v-text="Translate(moduleItem.meta.lk)"
                    ></span>
                </div>
                <div class="subMenus">
                    <span
                        v-for="subMenu in moduleItem.children"
                        :key="subMenu.meta.fullPath"
                        @click="router.push(subMenu.meta.fullPath)"
                        v-text="Translate(subMenu.meta.lk)"
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
    margin: 35px auto 0px auto;
    display: flex;
    flex-wrap: wrap;

    .moduleItem {
        position: relative;
        padding: 10px 0px 0px 20px;
        overflow: hidden;
        border: solid 2px var(--border-color3);
        height: 135px;
        margin: 0px 8px 10px 0px;
        display: flex;

        &:hover {
            border: solid 2px var(--primary--04);
        }

        .subMenus {
            color: var(--text-menu-05);
            span {
                font-size: 15px;
                text-decoration: none;
                cursor: pointer;
                display: inline-block;
                zoom: 1;
                margin: 0px 0px 3px 0px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                &:not(:last-of-type):after {
                    content: '';
                    display: inline-block;
                    margin: 0px 2px;
                    position: relative;
                    top: 2px;
                    width: 1px;
                    height: 15px;
                    background-color: var(--border-color2);
                }

                &:hover {
                    text-decoration: underline;
                    color: var(--primary--04);
                }
            }
        }

        &.md1 {
            width: 336px;
            .subMenus {
                width: 255px;
                span {
                    max-width: 228px;
                }
            }
        }

        &.md2 {
            width: 354px;
            .subMenus {
                width: 275px;
                span {
                    max-width: 170px;
                }
            }
        }

        &.md3 {
            width: 232px;
            .subMenus {
                width: 156px;
                span {
                    max-width: 146px;
                }
            }
        }

        .icon {
            margin: 20px 0px 0px 0px;
            flex-shrink: 0;
        }

        i {
            width: 60px;
            height: 60px;
            margin: 20px 0px 0px 0px;
            background-color: aqua;
            flex-shrink: 0;
        }
    }

    .menuContent {
        display: flex;
        flex-direction: column;
    }

    .mainMenu {
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        color: var(--text-menu-04);
        margin: 6px 0px 0px 8px;
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .subMenus {
        position: relative;
        width: 275px;
        margin: 8px 0px 0px 10px;
        padding: 4px 6px 0px 0px;
    }
}
</style>
