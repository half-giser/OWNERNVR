<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 15:16:31
 * @Description: UI1-D 客制化 顶层布局页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-27 09:43:42
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
                            <BaseImgSprite
                                :file="route.meta.icon"
                                :index="isMenu1Active(route) ? 1 : 0"
                                :chunk="2"
                            />
                            {{ Translate(String(route?.meta?.lk)) }}
                            <!-- <span class="menu-split"></span> -->
                        </el-menu-item>
                    </template>
                </el-menu>
            </div>
        </el-header>
        <el-main id="layoutMainBody">
            <div id="layoutMainContent">
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
    padding: 0px;
    height: auto;
    flex: auto 0 0;
    position: relative;
    border-bottom: 1px solid #fff;
}

#MainHeaderLine1 {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

#MainHeaderLine2 {
    position: absolute;
    bottom: 0;
    right: 20px;

    .el-menu--horizontal {
        border-bottom: none;
        height: 33px;

        & > .el-menu-item {
            margin: 0px 2px;
            padding: 0 10px;
            font-family: 'Microsoft YaHei', Arial, Helvetica, sans-serif;
            font-style: normal;
            font-weight: bold;
            font-size: 16px;
            color: var(--header-menu-text);
            line-height: 33px;
            text-align: left;
            min-width: 170px;
            background-color: var(--header-menu-bg);
            display: flex;
            justify-content: flex-start;

            &:hover {
                color: var(--header-menu-text-hover);
                background-color: var(--header-menu-bg);
            }

            &.is-active,
            &.is-active:hover {
                background-color: var(--header-menu-bg-active);
                color: var(--header-menu-text-active);
            }
        }
    }
}

#logo {
    margin: 8px 0px 0px 14px;
    width: 350px;
    height: 90px;
    background: var(--img-logo) no-repeat;
    text-align: right;

    div {
        overflow: hidden;
        margin: 12px 0px 0px 0px;
    }
}

#topRight {
    font-size: 14px;
    margin: 0 60px 0px 0px;
    display: flex;

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
        // margin: 0 20px;
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
    color: var(--footer-text);
    background-color: var(--footer-bg);
    // border-top: 1px solid var(--main-border);
    flex-shrink: 0;
}
</style>
