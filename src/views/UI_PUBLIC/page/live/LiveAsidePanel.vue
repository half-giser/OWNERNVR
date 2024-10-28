<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-18 14:45:58
 * @Description: 现场预览-右侧视图 Layout
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-26 15:22:15
-->
<template>
    <div class="right">
        <div
            v-show="pageData.isOpen"
            class="right-content"
        >
            <div
                class="right-top"
                @click="pageData.isOpen = false"
            >
                <i></i>
                <div>
                    <span>{{ menu[pageData.activeMenu]?.label || '' }}</span>
                </div>
            </div>
            <div class="right-menu">
                <div
                    v-for="(item, index) in menu"
                    :key="item.tab"
                    :class="{
                        active: pageData.activeMenu === index,
                        disabled: !getMenuEnable(item.value),
                    }"
                    @click="changeCtrlMenu(index)"
                >
                    <el-tooltip :content="item.label">
                        <BaseImgSprite
                            :file="item.file"
                            :index="pageData.activeMenu === index ? 1 : 0"
                            :hover-index="1"
                            :disabled-index="3"
                            :disabled="!getMenuEnable(item.value)"
                            :chunk="4"
                        />
                    </el-tooltip>
                </div>
            </div>
            <div class="right-bottom">
                <slot :index="menu[pageData.activeMenu]?.tab || 0"></slot>
            </div>
        </div>
        <div
            v-show="!pageData.isOpen"
            class="right-hide"
        >
            <div
                class="right-top"
                @click="pageData.isOpen = true"
            >
                <i class="hide"></i>
                <div></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./LiveAsidePanel.v.ts"></script>

<style lang="scss" scoped>
.right {
    height: 100%;
    flex-shrink: 0;
    background-color: var(--panel-bg);

    &-content {
        width: 260px;
        height: 100%;
    }

    &-hide {
        width: 16px;
        height: 100%;
    }

    &-top {
        display: flex;
        width: 100%;
        height: 50px;
        align-items: center;
        justify-content: flex-start;
        color: var(--panel-header-text);
        background-color: var(--panel-header-bg);

        & > div {
            margin-right: 10px;
        }

        i {
            border-left: 8px solid var(--panel-header-text);
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 8px solid transparent;
            font-size: 0;
            width: 0;
            height: 0;
            line-height: 0;
            cursor: pointer;
            margin-left: 10px;
            position: relative;

            &:after {
                content: '';
                border-left: 4px solid var(--panel-header-bg);
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
                border-right: 4px solid transparent;
                position: absolute;
                width: 0;
                height: 0;
                right: 0;
                top: -4px;
            }

            &.hide {
                transform: rotate(180deg);
                margin-left: -5px;
            }
        }

        &:hover i {
            border-left-color: var(--primary);
        }
    }

    &-menu {
        height: 50px;
        background-color: var(--panel-menu-bg);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        flex-shrink: 0;

        & > div {
            background-color: transparent;
            width: 42px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 5px;
            border-top: 3px solid transparent;

            &.active {
                background-color: var(--panel-menu-bg-active);
                border-top-color: var(--primary);
            }
        }
    }

    &-bottom {
        height: calc(100% - 100px);
    }
}
</style>
