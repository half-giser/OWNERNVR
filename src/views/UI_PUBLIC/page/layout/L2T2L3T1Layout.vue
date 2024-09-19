<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--三级类型1布局页--适用于“智能分析-搜索”、“业务应用-停车场管理”等
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 15:36:07
-->
<template>
    <el-container id="layout3">
        <el-aside id="layout3Left">
            <el-menu
                :default-active="activeIndex"
                popper-effect="light"
                :router="true"
            >
                <template
                    v-for="menu3 in menu3Items"
                    :key="menu3.meta.fullPath"
                >
                    <el-menu-item
                        v-if="isMenuItemShow(menu3)"
                        :index="menu3.meta.fullPath"
                        :route="menu3"
                    >
                        <template #default>
                            <BaseImgSprite :file="menu3.meta.icon" />
                        </template>
                        <template #title>
                            <span
                                :title="Translate(menu3.meta.lk || '')"
                                v-text="Translate(menu3.meta.lk || '')"
                            ></span>
                        </template>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-aside>
        <el-main id="layout3Content">
            <RouterView />
        </el-main>
    </el-container>
</template>

<script lang="ts" src="./L2T2L3T1Layout.v.ts"></script>

<style lang="scss" scoped>
#layout3 {
    width: 100%;
    background-color: var(--page-bg);
}

#layout3Left {
    width: 100px;
    border-right: solid 1px var(--border-color1);
    background-color: var(--page-bg);
}

#layout3Content {
    background-color: var(--page-bg);
    padding: 0;
}

.el-menu {
    border-right: 0px;
}

.el-menu-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0px !important;
    height: 90px;
    --el-menu-hover-bg-color: var(--primary--01);

    &.is-active {
        background-color: var(--primary--04);
        border: 0;
        color: var(--page-bg);
    }

    span {
        // line-height: 30px;
        width: 100%;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
    }
}
</style>
