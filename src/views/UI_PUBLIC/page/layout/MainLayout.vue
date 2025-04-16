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
                        v-show="userSession.allowModifyPassword"
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
                <div class="layoutMainContentBottomHeight"></div>
            </div>
        </el-main>
        <div
            id="divCopyRight"
            v-text="Translate('IDCS_COPYRIGHT')"
        ></div>
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
    padding: 0;
    height: auto;
    flex: auto 0 0;
    background-color: var(--header-bg);
}

#Top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 65px;
    align-items: center;

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
        margin-top: 3px;
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
    padding: 0;
    flex: auto 1 1;
    overflow-y: auto;
    max-height: calc(100vh - 65px - 34px - 18px);

    @if $GLOBAL_UI_TYPE == UI2-A {
        max-height: calc(100vh - 65px - 34px - 21px);
    }
}

#layoutMainContent {
    position: relative;
    padding-top: 25px;
    padding-inline: 49px;
    width: 100%;
    height: calc(100% - 25px);
    flex-shrink: 1;
    min-height: 500px;

    @if $GLOBAL_UI_TYPE == UI2-A {
        padding-top: 25px;
    }
}

.layoutMainContentBottomHeight {
    width: 100%;
    height: 25px;
    flex-shrink: 0;
}

#divCopyRight {
    text-align: center;
    font-size: 11px;
    padding: 1px 0;
    height: 18px;
    width: 100%;
    border-top: 1px solid var(--header-border);
    flex-shrink: 0;
    color: var(--footer-text);
    background-color: var(--footer-bg);
}
</style>
