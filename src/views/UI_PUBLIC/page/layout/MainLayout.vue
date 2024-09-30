<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 顶层布局页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-27 13:42:29
-->
<template>
    <el-container id="layoutMain">
        <el-header id="layoutMainHeader">
            <div id="MainHeaderLine1">
                <div
                    v-show="pageData.logoShow"
                    id="logo"
                    :style="{
                        backgroundImage: pageData.logoProductModel ? 'none' : 'var(--img-logo)',
                        marginLeft: pageData.logoProductModel ? '295px' : '14px',
                    }"
                >
                    &nbsp;
                    <div v-text="pageData.logoProductModel"></div>
                </div>
                <div id="topRight">
                    <div
                        v-show="pageData.isPluginDownloadBtn"
                        class="nav-item"
                    >
                        <span
                            id="http_dlPlugin"
                            class="dlPlugin effective"
                            @click="handleDownloadPlugin"
                        >
                            <span
                                class="dlPlugin-text"
                                v-text="Translate('IDCS_PLUGIN_DOWNLOAD')"
                            ></span>
                        </span>
                        <el-tooltip
                            :content="Translate('IDCS_PLUGIN_DOWNLOAD_INSTRUCTIONS')"
                            :show-after="500"
                        >
                            <BaseImgSprite
                                class="icon_aq"
                                file="aq"
                                :index="pageData.hoverPluginIconIndex"
                                :chunk="3"
                                @mouseenter="pageData.hoverPluginIconIndex = 2"
                                @mouseleave="pageData.hoverPluginIconIndex = 1"
                            />
                        </el-tooltip>
                    </div>
                    <div class="nav-item">
                        <span>{{ userName }}</span>
                        <span class="narrowline">|</span>
                        <a
                            class="effective"
                            @click="doLogout"
                            v-text="Translate('IDCS_LOGOUT')"
                        ></a>
                    </div>
                    <div class="nav-item">
                        <a
                            class="modifyPassword"
                            @click="showChangePwdPop"
                        >
                            <span
                                id="topChangePwd"
                                class="effective"
                                v-text="Translate('IDCS_CHANGE_PWD')"
                            ></span>
                        </a>
                    </div>
                    <div
                        v-show="pageData.isLocalConfigBtn"
                        class="nav-item"
                    >
                        <BaseImgSprite
                            file="localCfg"
                            :index="0"
                            :chunk="4"
                        />
                        <a
                            class="divLocalCfg effective"
                            @click="showLocalConfig"
                            >{{ Translate('IDCS_LOCAL_CONFIG') }}</a
                        >
                    </div>
                </div>
            </div>
            <div id="MainHeaderLine2">
                <el-menu
                    id="mainMenu"
                    mode="horizontal"
                    :router="true"
                    :ellipsis="false"
                >
                    <template v-for="(route, key) in allMenu1Items">
                        <el-menu-item
                            v-if="menu.isMenuItemShow(route)"
                            :key
                            :index="route.meta.fullPath"
                            :class="{
                                'is-active': isMenu1Active(route),
                            }"
                            @click="goToPath(route)"
                        >
                            <span
                                :title="Translate(String(route?.meta?.lk))"
                                v-text="Translate(String(route?.meta?.lk))"
                            ></span>
                            <span class="menu-split"></span>
                        </el-menu-item>
                    </template>
                </el-menu>
            </div>
        </el-header>
        <el-main id="layoutMainBody">
            <div id="layoutMainContent">
                <!-- <router-view v-slot="{ Component }">
                    <transition name="page-view">
                        <component
                            :is="Component"
                            :key
                        />
                    </transition>
                </router-view> -->
                <router-view />
            </div>
        </el-main>
        <div
            id="divCopyRight"
            v-text="Translate('IDCS_COPYRIGHT')"
        ></div>
        <ChangePasswordPop
            v-model="pageData.isPasswordDialogVisible"
            :forced="pageData.mustBeModifiedPassword"
            :title="pageData.passwordDialogTitle"
            :password-strength="pageData.passwordStrength"
            @close="closeChangePwdPop"
        />
    </el-container>
</template>

<script lang="ts" src="./MainLayout.v.ts"></script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#layoutMain {
    height: 100vh;
    background-color: var(--main-bg);
}

#layoutMainHeader {
    padding: 0px;
    height: auto;
    flex: auto 0 0;
    background-color: var(--header-bg);
}

#MainHeaderLine1 {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 65px;
    align-items: center;
}

#logo {
    margin-left: 14px;
    width: 350px;
    height: 65px;
    background: var(--img-logo) center left no-repeat;
    text-align: right;

    div {
        overflow: hidden;
        margin: 12px 0px 0px 0px;
    }
}

#topRight {
    font-size: 14px;
    margin: 20px 60px 0px 0px;
    display: flex;
    color: var(--header-text);

    .icon_aq {
        cursor: pointer;
    }

    .effective {
        cursor: pointer;

        &:hover {
            text-decoration: underline;
            color: var(--primary);
        }
    }

    .line {
        margin: 0 10px;
    }

    .narrowline {
        margin: 0 3px;
    }

    .nav-item {
        display: flex;

        &:not(:first-child)::before {
            content: '|';
            margin: 0 10px;
        }

        .divLocalCfg {
            margin-left: 5px;
        }
    }
}

#mainMenu {
    height: 40px;
    --el-menu-active-color: var(--primary);
    --el-menu-base-level-padding: 10px;
    background-color: var(--header-bg);
}

.el-menu--horizontal {
    background-color: var(--main-bg);
    border-bottom: solid 1px var(--main-border);

    & > .el-menu-item {
        margin: 0px 12px;
        line-height: 29px;
        font-family: 'Microsoft YaHei', Arial, Helvetica, sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        color: var(--header-menu-text);
        background-color: var(--header-menu-bg);
        border-bottom: solid 6px var(--header-menu-border);

        &:hover {
            background-color: var(--header-menu-bg-hover);
            color: var(--header-menu-text-hover);
            border-bottom: solid 6px var(--header-menu-border-hover);
        }

        &:focus {
            background-color: var(--header-menu-bg-hover);
            color: var(--header-menu-text-hover);
            border-bottom: solid 6px var(--header-menu-border-hover);
        }

        &:first-of-type {
            margin-left: 60px;
        }

        & > .menu-split {
            display: none;
        }

        &.is-active,
        &.is-active:hover {
            background-color: var(--header-menu-bg-active);
            color: var(--header-menu-border-active);
            border-bottom: solid 6px var(--header-menu-border-active);
        }
    }
}

#layoutMainBody {
    padding: 0px;
    flex: auto 1 1;
    overflow-y: auto;
}

#layoutMainContent {
    position: relative;
    padding: 25px 49px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    flex-shrink: 1;
}

#divCopyRight {
    text-align: center;
    font-size: 11px;
    padding: 1px 0px 1px 0px;
    height: 18px;
    width: 100%;
    border-top: 1px solid var(--main-border);
    flex-shrink: 0;
    color: var(--footer-text);
    background-color: var(--footer-bg);
}
</style>
