<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型1布局页--适用于所有配置页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-24 11:44:02
-->
<template>
    <el-container id="layout2">
        <el-aside id="layout2Left">
            <div
                v-for="(menuGroup, key) in sortedGroups"
                :key
                class="menu-group"
                :class="{
                    'is-active': route.meta.group === menuGroup[0],
                }"
                @click="toDefault(menuGroup[0])"
            >
                <div class="main-menu">
                    <BaseImgSprite
                        :file="menuGroup[1].icon || ''"
                        :index="0"
                        :chunk="2"
                    />
                    <span v-text="Translate(menuGroup[1].lk || '')"> </span>
                </div>
                <div class="sub-menus">
                    <span
                        v-for="(menu3, menu3Key) in groupMenuMap[menuGroup[0]]"
                        :key="menu3Key"
                        @click.stop="router.push(menu3.meta.fullPath)"
                        v-text="Translate(menu3.meta.lk || '')"
                    ></span>
                </div>
            </div>
            <div class="rest"></div>
        </el-aside>
        <el-main id="layout2Right">
            <div id="layout2RightTopBar">
                <div id="layout2RightTopBarNav">
                    <router-link
                        v-for="(navItem, key) in navList"
                        :key
                        :to="navItem.meta.fullPath"
                        >{{ Translate(navItem.meta.lk || '') }}
                        <BaseImgSprite
                            v-show="key !== navList.length - 1"
                            file="nav"
                        />
                    </router-link>
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
                    <div>
                        <component
                            :is="Component"
                            ref="chilComponent"
                        />
                    </div>
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
    width: 100%;
    border: solid 1px var(--content-border);
    min-height: 100%;
    // min-height: calc(100vh - 172px);
    position: relative;
}

#layout2Left {
    width: 237px;
    min-height: 100%;
    position: relative;
    top: 0px;
    left: 0px;
    margin: -1px 0px -1px -1px;
    overflow: hidden;
    z-index: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--config-aside-bg);
}

.menu-group {
    width: 237px;
    border: solid 1px var(--content-border);
    padding: 20px;
    margin: 0px 0px -1px 0px;
    position: relative;
    flex-shrink: 0;
    background-color: var(--config-aside-item-bg, var(--config-aside-bg));

    &.is-active {
        background-color: var(--config-aside-item-bg-active);

        .main-menu span {
            color: var(--config-aside-text-active);
            &:hover {
                color: var(--config-aside-text-active);
            }
        }

        .sub-menus span {
            color: var(--config-aside-text-active);
            &:not(:last-of-type):after {
                background-color: var(--config-aside-text-active);
            }
            &:hover {
                color: var(--config-aside-text-active);
            }
        }
    }

    &:hover {
        border: solid 1px var(--primary);
        z-index: 100;
    }

    &:last-of-type {
        margin: 0px 0px 0px 0px;
    }
}

.rest {
    width: 237px;
    border: solid 1px var(--content-border);
    height: 100%;
}

.main-menu {
    display: flex;
    align-items: center;

    span {
        margin-right: 8px;
        display: inline-block;
        font-size: 16px;
        text-decoration: none;
        cursor: pointer;
        font-weight: bold;
        color: var(--config-aside-text);

        &:hover {
            color: var(--config-aside-text-hover);
            text-decoration: underline;
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
        color: var(--config-aside-text);

        &:hover {
            color: var(--config-aside-text-hover);
            text-decoration: underline;
        }

        &:not(:last-of-type):after {
            content: '';
            display: inline-block;
            margin: 0px 3px;
            position: relative;
            top: 2px;
            width: 1px;
            height: 15px;
            background-color: var(--config-aside-text);
        }
    }
}

.el-menu {
    border-bottom: solid 1px var(--content-border);
    border-right: solid 1px var(--content-border);
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
    background-color: var(--main-bg);

    #layout2RightTopBar {
        display: flex;
        width: 100%;
        height: 35px;
        border-bottom: solid 1px var(--content-border);
        background-color: var(--bg-nav, transparent);

        #layout2RightTopBarNav {
            display: flex;
            height: 100%;
            width: 50%;
            align-items: center;
            padding: 0 10px;
            box-sizing: border-box;

            a {
                font-size: 15px;
                text-decoration: none;
                margin: 0 3px 0 3px;
                display: inline-block;
                color: var(--breadcrumb-text);

                &:hover {
                    color: var(--primary);
                }

                span {
                    margin-left: 5px;
                }
            }
        }

        #layout2RightTopBarToolBar {
            display: flex;
            width: 50%;
            height: 100%;
            align-items: center;
            justify-content: flex-end;
            padding: 0 10px;
            box-sizing: border-box;

            .toolBarText {
                width: 200px;
                height: 25px;
                float: left;

                :deep(.el-input__inner) {
                    height: 25px;
                }
            }
            .toolBarIconBtn {
                width: 25px;
                height: 25px;
                float: left;
                margin: 0 0 0 5px;
                padding: 0;
            }
        }
    }

    #layout2Content {
        position: relative;
        padding: 10px;
    }
}
</style>
