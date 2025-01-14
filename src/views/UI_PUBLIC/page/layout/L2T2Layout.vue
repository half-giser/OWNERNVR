<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--适用于“搜索和备份”、“智能分析”、“业务应用”等
-->
<template>
    <el-container id="layout2">
        <el-header id="layout2Header">
            <el-menu
                class="tab-style"
                mode="horizontal"
            >
                <el-menu-item
                    v-for="menu2 in menu2Items"
                    :key="menu2.meta.fullPath"
                    :index="menu2.meta.fullPath"
                    :class="{ active: isMenu2Actice(menu2) }"
                    @click="goToPath(menu2)"
                >
                    <span>{{ Translate(menu2.meta.lk || '') }}</span>
                </el-menu-item>
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
    border: solid 1px var(--content-border);
    min-height: 100%;
    width: 100%;
}

#layout2Header {
    background-color: var(--main-bg);
    padding: 0;
    height: 38px;
    border-bottom: solid 1px var(--content-border);
}

#layout2Main {
    flex: auto 1 1;
    padding: 0;
    background-color: var(--main-bg);
    display: flex;
}

.tab-style {
    height: 38px;
    justify-content: center;
    align-items: center;
    border: 0;
    border-bottom: 1px solid var(--content-border);
    background-color: var(--main-bg);

    :deep(.el-menu-item) {
        --el-menu-active-color: var(--tabbar-text);
        --el-menu-text-color: var(--tabbar-text);
        --el-menu-hover-bg-color: var(--tabbar-bg);

        border-top: solid 1px var(--content-border);
        border-bottom: solid 1px var(--content-border);
        border-right: solid 1px var(--content-border);
        margin: 0;
        line-height: 30px;
        height: 30px;
        background-color: var(--tabbar-bg);
        padding: 0 15px;

        &:first-of-type {
            border-left: solid 1px var(--content-border);
        }

        &:hover {
            color: var(--tabbar-text-hover);
            background-color: var(--tabbar-bg-hover, var(--primary-light));
        }

        &.active {
            background-color: var(--tabbar-bg-active);
            color: var(--tabbar-text-active) !important;
        }
    }
}
</style>
