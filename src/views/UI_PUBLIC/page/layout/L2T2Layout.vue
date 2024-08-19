<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--适用于“搜索和备份”、“智能分析”、“业务应用”等
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 18:04:39
-->

<template>
    <el-container id="layout2">
        <el-header id="layout2Header">
            <el-menu
                class="tab-style"
                mode="horizontal"
                :router="true"
            >
                <template
                    v-for="menu2 in menu2Items"
                    :key="menu2.meta.fullPath"
                >
                    <el-menu-item
                        v-if="isSubMenuShow(menu2)"
                        :index="menu2.meta.fullPath"
                        :route="menu2"
                        :class="{ 'is-active': isMenu2Actice(menu2) }"
                    >
                        <span
                            :title="Translate(menu2.meta.lk || '')"
                            v-text="Translate(menu2.meta.lk || '')"
                        ></span>
                        <span class="menu-split"></span>
                    </el-menu-item>
                    <el-menu-item
                        v-else-if="isMenuItemShow(menu2)"
                        :index="menu2.meta.fullPath"
                        :route="menu2"
                        :class="{ 'is-active': isMenu2Actice(menu2) }"
                    >
                        <span
                            :title="Translate(menu2.meta.lk || '')"
                            v-text="Translate(menu2.meta.lk || '')"
                        ></span>
                        <span class="menu-split"></span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-header>
        <el-main id="layout2Main">
            <RouterView />
        </el-main>
    </el-container>
</template>

<script lang="ts" src="./L2T2Layout.v.ts"></script>

<style lang="scss" scoped>
#layout2 {
    border: solid 1px var(--border-color2);
    min-height: calc(100vh - 172px);
    width: 100%;
}

#layout2Header {
    background-color: var(--page-bg);
    padding: 0px;
    height: 38px;
    border-bottom: solid 1px var(--border-color2);
}

#layout2Main {
    flex: auto 1 1;
    padding: 0px;
    background-color: var(--page-bg);
    display: flex;
}
</style>
