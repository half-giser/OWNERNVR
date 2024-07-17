<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 顶层布局页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 14:31:09
-->
<template>
    <el-container id="layoutMain">
        <el-header id="layoutMainHeader">
            <div id="MainHeaderLine1">
                <div
                    v-show="pageData.logoShow"
                    id="logo"
                    :style="{
                        backgroundImage: pageData.logoProductModel ? 'none' : 'var(--logo)',
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
                        <el-tooltip :content="Translate('IDCS_PLUGIN_DOWNLOAD_INSTRUCTIONS')">
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
                >
                    <template v-for="(route, key) in menu1Items">
                        <el-menu-item
                            v-if="menu.isMenuItemShow(route, systemCaps)"
                            :key
                            :index="String(key)"
                            :route
                            :class="{ 'is-active': isMenu1Active(route) }"
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
                <router-view />
            </div>
        </el-main>
        <div
            id="divCopyRight"
            v-text="Translate('IDCS_COPYRIGHT')"
        ></div>
        <BaseChangePwdPop
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
    background-color: var(--page-bg);
}

#layoutMainHeader {
    padding: 0px;
    height: auto;
    flex: auto 0 0;
}

#MainHeaderLine1 {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

#logo {
    margin: 8px 0px 0px 14px;
    width: 350px;
    height: 55px;
    background: var(--logo) no-repeat;
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

    .icon_aq {
        cursor: pointer;
    }

    .effective {
        cursor: pointer;

        &:hover {
            text-decoration: underline;
            color: var(--el-menu-active-color);
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
    }
}

#mainMenu {
    height: 40px;
    --el-menu-active-color: var(--primary--04);
    --el-menu-base-level-padding: 10px;
}

.el-menu--horizontal {
    background-color: var(--page-bg);
    border-bottom: solid 1px var(--border-color1);

    & > .el-menu-item {
        margin: 0px 12px;
        line-height: 29px;
        font-family: 'Microsoft YaHei', Arial, Helvetica, sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        color: var(--text-menu-01);

        background-color: var(--page-bg);
        border-bottom: solid 6px var(--page-bg);

        &:hover {
            background-color: var(--page-bg);
            color: var(--text-primary);
            border-bottom: solid 6px var(--primary--01);
        }

        &:first-of-type {
            margin-left: 60px;
        }

        & > .menu-split {
            display: none;
        }

        &.is-active {
            color: var(--primary--04);
            border-bottom: solid 6px var(--primary--04);
        }
    }
}

#layoutMainBody {
    padding: 0px;
    flex: auto 1 1;
    // height: 100%;
    // display: flex;
    // flex-direction: column;
    overflow-y: auto;

    #layoutMainContent {
        padding: 25px 49px;
        box-sizing: border-box;
        height: 100%;
        overflow-y: auto;
        // height: auto;
        flex-shrink: 1;
        // min-height: calc(100% - 21px); //calc(100vh - 222px);
    }
}

#divCopyRight {
    text-align: center;
    font-size: 11px;
    padding: 1px 0px 1px 0px;
    height: 18px;
    width: 100%;
    color: var(--text-menu-01);
    background-color: var(--page-bg);
    border-top: 1px solid var(--border-color1);
    flex-shrink: 0;
}
</style>
