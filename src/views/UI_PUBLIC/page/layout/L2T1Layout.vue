<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型1布局页--适用于所有配置页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-28 18:52:05
-->
<template>
    <el-container id="layout2">
        <!-- <div id="layout2LeftBorder"></div> -->
        <el-aside id="layout2Left">
            <div
                v-for="(menuGroup, key) in sortedGroups"
                :key
                class="menu-group"
                :class="{ 'is-active': route.meta.group === menuGroup[0] }"
            >
                <div class="main-menu">
                    <BaseImgSprite
                        :file="menuGroup[1].icon"
                        :index="0"
                        :chunk="2"
                    />
                    <span
                        @click="toDefault(menuGroup[0])"
                        v-text="Translate(menuGroup[1].lk || '')"
                    >
                    </span>
                </div>
                <div class="sub-menus">
                    <span
                        v-for="(menu3, menu3Key) in groupMenuMap.get(menuGroup[0])"
                        :key="menu3Key"
                        @click="router.push(menu3.meta.fullPath)"
                        v-text="Translate(menu3.meta.lk)"
                    ></span>
                </div>
            </div>
        </el-aside>
        <el-main id="layout2Right">
            <div id="layout2RightTopBar">
                <div id="layout2RightTopBarNav">
                    <router-link
                        v-for="(navItem, key) in navList"
                        :key
                        :to="navItem.meta.fullPath"
                        >{{ Translate(navItem.meta.lk) }}</router-link
                    >
                </div>
                <div id="layout2RightTopBarToolBar">
                    <router-view
                        v-slot="{ Component }"
                        name="toolBar"
                    >
                        <component
                            :is="Component"
                            @tool-bar-event="handleToolBarEvent"
                        />
                    </router-view>
                </div>
            </div>
            <div id="layout2Content">
                <router-view v-slot="{ Component }">
                    <component
                        :is="Component"
                        ref="chilComponent"
                    />
                </router-view>
            </div>
        </el-main>
    </el-container>
</template>

<script lang="ts" src="./L2T1Layout.v.ts"></script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#layout2 {
    border: solid 1px var(--border-color2);
    min-height: 100%;
    // min-height: calc(100vh - 172px);
    position: relative;
}

// #layout2LeftBorder {
//     background-color: var(--page-bg);
//     border-right: solid 1px var(--border-color2);
//     width: 236px;
//     min-height: 100%;
//     position: absolute;
//     top: 0px;
//     left: 0px;
// }

#layout2Left {
    width: 237px;
    min-height: 100%;
    position: relative;
    top: 0px;
    left: 0px;
    margin: -1px 0px -1px -1px;
    overflow: hidden;
    border-right: solid 1px var(--border-color2);
}

.menu-group {
    width: 237px;
    border: solid 1px var(--border-color2);
    padding: 20px;
    margin: 0px 0px -1px 0px;
    position: relative;

    &.is-active {
        background-color: var(--bg-color-cfg-menu-active);
    }

    &:hover {
        border: solid 1px var(--primary--04);
        z-index: 100;
    }

    &:last-of-type {
        margin: 0px 0px 0px 0px;
    }
}

.main-menu {
    display: flex;
    align-items: center;

    span {
        margin-right: 8px;
        display: inline-block;
        // padding: 2px 0px 0px 0px;
        font-size: 16px;
        text-decoration: none;
        cursor: pointer;
        font-weight: bold;
        color: var(--text-regular-02);

        &:hover {
            color: var(--primary--04);
        }
    }
}

.sub-menus {
    span {
        display: inline-block;
        padding: 2px 0px 0px 0px;
        font-size: 13px;
        text-decoration: none;
        cursor: pointer;
        color: var(--text-menu-03);

        &:hover {
            color: var(--primary--04);
        }

        &:not(:last-of-type):after {
            content: '';
            display: inline-block;
            margin: 0px 3px;
            position: relative;
            top: 2px;
            width: 1px;
            height: 15px;
            background-color: var(--border-color2);
        }
    }
}

.el-menu {
    border-bottom: solid 1px var(--border-color2);
    border-right: solid 1px var(--border-color2);
    overflow: hidden;

    .el-menu-item {
        display: inline-block;
        padding: 0px !important;
        height: auto !important;
    }
}

#layout2Right {
    position: relative;
    padding: 0px;
    background-color: var(--page-bg);

    #layout2RightTopBar {
        height: 35px;
        border-bottom: solid 1px var(--border-color2);

        #layout2RightTopBarNav {
            padding: 6px 0px 0px 5px;
            float: left;
            a {
                font-size: 15px;
                text-decoration: none;
                margin: 0 3px 0 3px;
                display: inline-block;
                color: var(--text-nav);

                &:hover {
                    color: var(--primary--04);
                }

                &:not(:last-of-type)::after {
                    content: '';
                    width: 7px;
                    height: 9px;
                    display: inline-block;
                    background: no-repeat var(--sprite) 0 0;
                    margin: 0px 0px 0px 8px;
                }
            }
        }

        #layout2RightTopBarToolBar {
            padding: 5px 5px 0px 0px;
            float: right;
        }
    }

    #layout2Content {
        position: relative;
        padding: 10px;
    }
}
</style>
