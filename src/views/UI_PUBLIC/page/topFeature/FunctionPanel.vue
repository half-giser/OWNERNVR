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
            @click="toDefault(moduleItem)"
        >
            <BaseImgSprite
                :file="moduleItem.meta.icon"
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
                        @click.stop="router.push(subMenu.meta.fullPath)"
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
        background-color: var(--bg-menu-04);

        &:hover {
            border-color: var(var(--border-menu-04-hover), var(--primary--04));
            background-color: var(--bg-menu-04-hover);
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
        width: 100%;
        box-sizing: border-box;
        padding-right: 5px;
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

        &:hover {
            color: var(--text-menu-04-hover);
        }
    }

    .subMenus {
        position: relative;
        margin: 8px 0px 0px 8px;
        padding: 4px 6px 0px 0px;
        color: var(--text-menu-05);
        span {
            font-size: 15px;
            text-decoration: none;
            cursor: pointer;
            display: inline-block;
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
                background-color: var(--text-menu-05);
            }

            &:hover {
                text-decoration: underline;
                color: var(--text-menu-05-hover);
            }
        }
    }
}
</style>
