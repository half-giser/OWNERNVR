<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 10:36:00
 * @Description: 回放-右侧视图
-->
<template>
    <div class="base-home-panel right">
        <div
            v-show="pageData.isOpen"
            class="base-home-panel-content"
        >
            <div
                class="base-home-panel-top"
                @click="pageData.isOpen = false"
            >
                <i class="base-home-panel-arrow"></i>
                <div>
                    <span>{{ menu[pageData.activeMenu]?.label || '' }}</span>
                </div>
            </div>
            <div
                v-show="menu.length > 1"
                class="base-home-panel-menu"
            >
                <div
                    v-for="(item, index) in menu"
                    :key="item.tab"
                    class="base-home-panel-menu-item"
                    :class="{
                        active: pageData.activeMenu === index,
                        disabled: !getMenuEnable(item.value),
                    }"
                    :title="item.label"
                    @click="changeCtrlMenu(index)"
                >
                    <BaseImgSprite
                        :file="item.file"
                        :index="pageData.activeMenu === index ? 1 : 0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="!getMenuEnable(item.value)"
                        :chunk="4"
                    />
                </div>
            </div>
            <div class="base-home-panel-bottom">
                <slot :index="menu[pageData.activeMenu]?.tab || 0"></slot>
            </div>
        </div>
        <div
            v-show="!pageData.isOpen"
            class="base-home-panel-hide"
        >
            <div
                class="base-home-panel-top"
                @click="pageData.isOpen = true"
            >
                <i class="base-home-panel-arrow hide"></i>
                <div></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./PlaybackAsidePanel.v.ts"></script>
