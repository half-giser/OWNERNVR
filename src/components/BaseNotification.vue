<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 17:20:48
 * @Description:
-->
<template>
    <transition
        enter-from-class="notification-from"
        leave-to-class="notification-to"
    >
        <div
            v-show="notifications.length"
            class="notification"
            :class="containerClass"
        >
            <div class="notification-title">
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
            <div class="notification-content">
                <el-scrollbar height="calc(100% - 30px)">
                    <div
                        v-for="(notification, index) in notifications"
                        :key="index"
                        class="notification-item"
                        :class="{ selected: selectedIndex === index }"
                        @click="selectedIndex = index"
                    >
                        {{ notification }}
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </transition>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        /**
         * @property 通知文本
         */
        notifications: string[]
        /**
         * @property 弹窗持续时间
         */
        duration?: number
        /**
         * @property 弹窗位置
         */
        position?: string
    }>(),
    {
        duration: 10000,
        position: 'right-bottom',
    },
)

const emit = defineEmits<{
    (e: 'update:notifications', notification: string[]): void
}>()

const selectedIndex = ref(0)
let timer: NodeJS.Timeout | number = 0

watch(
    () => props.notifications,
    (val) => {
        clearTimeout(timer)
        if (val.length) {
            hideNotification()
        }
    },
)

const containerClass = computed(() => `position-${props.position}`)

/**
 * @description 定时关闭弹窗
 */
const hideNotification = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        removeNotification()
        selectedIndex.value = 0
    }, props.duration)
}

/**
 * @description 移除通知 关闭弹窗
 */
const removeNotification = () => {
    emit('update:notifications', [])
}

onBeforeUnmount(() => {
    clearTimeout(timer)
})
</script>

<style lang="scss">
.notification-from {
    transform: translate3d(100%, 0, 0);
    transition: transform ease 0.2s;
}

.notification-to {
    opacity: 0;
    transform: none;
    transition: opacity ease 0.2s;
}
</style>

<style lang="scss" scoped>
.notification {
    border: 1px solid var(--content-border);
    background-color: var(--main-bg);
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 9999;
    width: 300px;
    height: 272px;
    transition:
        transform ease 0.2s,
        opacity ease 0.2s;

    &-item {
        padding: 5px 8px;
        margin-right: 10px;
        font-size: 13px;
        word-wrap: break-word;

        &:hover {
            background-color: var(--primary-light);
        }

        &.selected {
            background-color: var(--primary);
        }
    }

    &-title {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        line-height: 24px;
        padding: 8px 8px 8px 13px;
        color: var(--header-menu-text);
        border-bottom: 1px solid var(--content-border);
    }

    &-content {
        height: 230px;
        min-height: 70px;
        overflow: hidden;
        padding: 10px;
    }
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
