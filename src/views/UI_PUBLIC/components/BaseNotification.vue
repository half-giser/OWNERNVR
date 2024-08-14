<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 17:20:48
 * @Description:
-->
<template>
    <div
        v-show="!hiddenNotify"
        class="notification-container"
        :class="containerClass"
    >
        <div id="title">
            <div>{{ Translate('IDCS_INFO_TIP') }}</div>
            <BaseImgSprite
                file="close"
                :chunk="2"
                :index="0"
                :hover-index="1"
                :active-index="1"
                class="remove-button"
                @click="removeNotification"
            />
        </div>
        <div id="content">
            <el-scrollbar height="calc(100% - 30px)">
                <div
                    v-for="(notification, index) in notificationList"
                    :key="index"
                    class="notification"
                    :class="{ selected: selectedNotificationIndex === index }"
                    @click="selectedNotificationIndex = index"
                >
                    {{ notification }}
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script lang="ts" src="./BaseNotification.v.ts" />

<style lang="scss" scoped>
.notification-container {
    border: 1px solid var(--border-color8);
    background-color: var(--page-bg);
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 9999;
    width: 300px;
    min-height: 90px;
    height: 272px;
}

.notification {
    padding: 3px 8px;
    font-size: 13px;
    word-wrap: break-word;
    &:hover {
        background-color: var(--primary--01);
    }
    &.selected {
        background-color: var(--primary--04);
    }
}

#title {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    line-height: 24px;
    padding: 8px 8px 8px 13px;
    color: var(--text-menu-01);
    border-bottom: 1px solid var(--border-color8);
}

#content {
    height: 230px;
    min-height: 70px;
    overflow-y: hidden;
    overflow-x: hidden;
    padding: 15px;
}

.position-left-bottom {
    bottom: 20px;
    left: 20px;
}

.position-left-top {
    top: 20px;
    left: 20px;
}

.position-right-bottom {
    bottom: 0;
    right: 0;
}

.position-right-top {
    top: 20px;
    right: 20px;
}
</style>
