<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 15:16:31
 * @Description: UI1-D 客制化 顶层布局页
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
            <div id="Top2">
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
                        <BaseImgSprite
                            :file="route.meta.icon"
                            :active="isMenu1Active(route)"
                            :active-index="1"
                            :chunk="2"
                        />
                        {{ Translate(String(route?.meta?.lk)) }}
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

<script lang="ts" src="@/views/UI_PUBLIC/page/layout/MainLayout.v.ts"></script>

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
    position: relative;
    border-bottom: 1px solid var(--header-border);
}

#Top {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

#Top2 {
    position: absolute;
    bottom: 2px;
    right: 20px;

    .el-menu--horizontal {
        border-bottom: none;
        height: 33px;
        background-color: var(--header-bg);
        --el-menu-active-color: var(--header-menu-text-active);

        & > .el-menu-item {
            margin: 0 2px;
            padding: 0 10px 0 20px;
            font-weight: bold;
            font-size: 16px;
            color: var(--header-menu-text);
            line-height: 33px;
            text-align: left;
            min-width: 170px;
            background-color: var(--header-menu-bg);
            display: flex;
            justify-content: flex-start;
            border-bottom: 2px solid var(--header-menu-border);

            &:hover {
                color: var(--header-menu-text-hover);
                background-color: var(--header-menu-bg);
                border-bottom-color: var(--header-menu-border-hover);
            }

            &.is-active,
            &.is-active:hover {
                background-color: var(--header-menu-bg-active);
                color: var(--header-menu-text-active);
                border-bottom-color: var(--header-menu-border-active);
            }
        }
    }
}

#logo {
    margin: 8px 0 0 14px;
    width: 50%;
    height: 90px;
    background: var(--img-logo) no-repeat;
    text-align: right;

    div {
        overflow: hidden;
        padding: 42px 0 0 295px;
        font-weight: bold;
        font-size: 16px;
        color: var(--main-text);
        text-align: left;
    }
}

#topRight {
    font-size: 14px;
    margin: 0 60px 0 0;
    display: flex;

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
        padding-top: 12px;

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
    height: 35px;
    --el-menu-active-color: var(--primary);
    --el-menu-base-level-padding: 10px;
}

#layoutMainBody {
    padding: 0;
    flex: auto 1 1;
    overflow-y: auto;
    max-height: calc(100vh - 65px - 34px - 18px);
}

#layoutMainContent {
    position: relative;
    padding-top: 25px;
    padding-inline: 49px;
    width: 100%;
    height: calc(100% - 25px);
    flex-shrink: 1;
    min-height: 150px;
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
    color: var(--footer-text);
    background-color: var(--footer-bg);
    flex-shrink: 0;
}
</style>
