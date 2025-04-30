<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 顶层布局页
-->
<template>
    <el-container id="layoutMain">
        <el-header id="layoutMainHeader">
            <div id="Top">
                <div
                    v-show="pageData.logoShow"
                    id="logo"
                    :style="{
                        backgroundImage: userSession.appType === 'STANDARD' ? 'var(--img-logo)' : 'var(--img-authcodelogin-logo)',
                    }"
                >
                    <div v-text="pageData.logoProductModel"></div>
                </div>
                <div id="topRight">
                    <div
                        v-if="pageData.isPluginDownloadBtn"
                        class="nav-item"
                    >
                        <span
                            class="dlPlugin effective"
                            @click="handleDownloadPlugin"
                        >
                            <span
                                class="dlPlugin-text"
                                v-text="Translate('IDCS_PLUGIN_DOWNLOAD')"
                            ></span>
                        </span>
                        <BaseImgSprite
                            class="icon_aq"
                            file="aq"
                            :title="Translate('IDCS_PLUGIN_DOWNLOAD_INSTRUCTIONS')"
                            :index="1"
                            :hover-index="2"
                            :chunk="3"
                        />
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
                    <div
                        v-show="pageData.isModifyPasswordBtn"
                        class="nav-item"
                    >
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
                            :chunk="4"
                        />
                        <a
                            class="divLocalCfg effective"
                            @click="showLocalConfig"
                        >
                            {{ Translate('IDCS_LOCAL_CONFIG') }}
                        </a>
                    </div>
                </div>
            </div>
            <div>
                <el-menu
                    id="mainMenu"
                    mode="horizontal"
                    :router="true"
                    :ellipsis="false"
                >
                    <el-menu-item
                        v-for="(route, key) in allMenu1Items"
                        :key
                        :index="route.meta.fullPath"
                        :class="{
                            'is-active': isMenu1Active(route),
                        }"
                        @click="goToPath(route)"
                    >
                        <span
                            v-title
                            v-text="Translate(String(route?.meta?.lk))"
                        ></span>
                        <span class="menu-split"></span>
                    </el-menu-item>
                </el-menu>
            </div>
        </el-header>
        <el-main id="layoutMainBody">
            <div id="layoutMainContent">
                <router-view />
            </div>
            <div
                id="divCopyRight"
                v-text="Translate('IDCS_COPYRIGHT')"
            ></div>
        </el-main>
        <ChangePasswordPop
            v-model="pageData.isPasswordDialogVisible"
            :forced="pageData.mustBeModifiedPassword"
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
    position: fixed;
    width: 100%;
    min-width: 1000px;
    top: 0;
    left: 0;
    padding: 0;
    height: auto;
    flex: auto 0 0;
    background-color: var(--header-bg);
    z-index: 1000;
}

#Top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 65px;
    align-items: center;
    background-color: var(--header-bg);

    @if $GLOBAL_UI_TYPE == UI2-A {
        height: 73px;
    }
}

#logo {
    margin-left: 12px;
    width: 50%;
    height: 65px;
    background-position: 0 70%;
    background-repeat: no-repeat;
    text-align: right;

    div {
        overflow: hidden;
        padding: 42px 0 0 295px;
        font-weight: bold;
        font-size: 16px;
        color: var(--header-menu-text);
        text-align: left;
    }
}

#topRight {
    font-size: 14px;
    margin: 0 56px 12px 0;
    display: flex;
    color: var(--header-text);

    .icon_aq {
        margin-left: 5px;
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
        margin: 0 4px;
    }

    .nav-item {
        display: flex;

        &:not(:first-child)::before {
            content: '|';
            margin: 0 12px;
        }

        .divLocalCfg {
            margin-left: 5px;
        }
    }
}

#mainMenu {
    --el-menu-active-color: var(--primary);
    --el-menu-base-level-padding: 10px;

    background-color: var(--header-bg);
    height: 34px;

    @if $GLOBAL_UI_TYPE == UI2-A {
        padding-top: 3px;
    }
}

.el-menu--horizontal {
    background-color: var(--main-bg);
    border-bottom: solid 1px var(--header-border);
    --el-menu-active-color: var(--header-menu-text-active);

    & > .el-menu-item {
        margin: 0 10px;
        line-height: 29px;
        font-weight: bold;
        font-size: 16px;
        padding-bottom: 2px;
        color: var(--header-menu-text);
        background-color: var(--header-menu-bg);
        border-bottom: 6px solid var(--header-menu-border);

        &:hover {
            background-color: var(--header-menu-bg-hover);
            color: var(--header-menu-text-hover);
            border-bottom-color: var(--header-menu-border-hover);
        }

        &:focus {
            background-color: var(--header-menu-bg-hover);
            color: var(--header-menu-text-hover);
            border-bottom-color: var(--header-menu-border-hover);
        }

        &:first-of-type {
            margin-left: 64px;
        }

        & > .menu-split {
            display: none;
        }

        &.is-active,
        &.is-active:hover {
            background-color: var(--header-menu-bg-active);
            color: var(--header-menu-border-active);
            border-bottom-color: var(--header-menu-border-active);
        }
    }
}

#layoutMainBody {
    width: 100%;
    padding: 0;
    padding-top: 100px;
    overflow-y: auto;
}

#layoutMainContent {
    position: relative;
    padding-block: 25px;
    padding-inline: 49px;
    width: 100%;
    height: calc(100vh - 65px - 34px - 19px);
    min-height: fit-content;
    box-sizing: border-box;

    @if $GLOBAL_UI_TYPE == UI2-A {
        height: calc(100vh - 65px - 34px - 19px - 11px);
    }
}

#divCopyRight {
    text-align: center;
    font-size: 11px;
    padding: 1px 0;
    height: 18px;
    width: 100%;
    border-top: 1px solid var(--header-border);
    color: var(--footer-text);
    background-color: var(--footer-bg);
}
</style>
