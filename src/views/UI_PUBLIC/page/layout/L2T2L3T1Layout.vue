<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--三级类型1布局页--适用于“智能分析-搜索”、“业务应用-停车场管理”等
-->
<template>
    <el-container id="layout3">
        <el-aside id="layout3Left">
            <el-menu
                :default-active="activeIndex"
                popper-effect="light"
                :router="true"
            >
                <el-menu-item
                    v-for="menu3 in menu3Items"
                    :key="menu3.meta.fullPath"
                    :index="menu3.meta.fullPath"
                    :route="menu3"
                >
                    <template #default>
                        <BaseImgSprite :file="menu3.meta.icon" />
                    </template>
                    <template #title>
                        <span
                            v-title
                            class="text-ellipsis"
                            v-text="Translate(menu3.meta.lk || '')"
                        ></span>
                    </template>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main id="layout3Content">
            <RouterView />
            <!-- <RouterView v-slot="{ Component }">
                <KeepAlive :max="4">
                    <component :is="Component" />
                </KeepAlive>
            </RouterView> -->
        </el-main>
    </el-container>
</template>

<script lang="ts" src="./L2T2L3T1Layout.v.ts"></script>

<style lang="scss" scoped>
#layout3 {
    width: 100%;
    background-color: var(--main-bg);
}

#layout3Left {
    width: 100px;
    border-right: solid 1px var(--content-border);
    background-color: var(--main-bg);

    .el-menu {
        border-right: 0;
        background-color: var(--main-bg);

        .el-menu-item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 0 !important;
            height: 90px;
            color: var(--sidebar-text);

            --el-menu-hover-bg-color: var(--sidebar-bg-hover);
            --el-menu-text-color: var(--sidebar-text);

            &.is-active {
                background-color: var(--sidebar-bg-active);
                border: 0;
                color: var(--sidebar-text-active);

                &:hover {
                    color: var(--sidebar-text-active);
                }
            }

            &:hover {
                color: var(--sidebar-text-hover);
            }

            span {
                width: 100%;
                font-size: 12px;
                line-height: 30px;
                display: block;
            }
        }
    }
}

#layout3Content {
    background-color: var(--main-bg);
    padding: 0;
}
</style>
