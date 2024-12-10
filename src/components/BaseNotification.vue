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
            v-show="modelValue.length"
            class="notification"
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
                    @click="hideNotification"
                />
            </div>
            <div class="notification-content">
                <el-scrollbar height="calc(100% - 30px)">
                    <div
                        v-for="(notification, index) in modelValue"
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
        modelValue: string[]
        /**
         * @property 弹窗持续时间
         */
        duration?: number
    }>(),
    {
        duration: 10000,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', notification: string[]): void
}>()

const router = useRouter()

const selectedIndex = ref(0)
let timer: NodeJS.Timeout | number = 0

watch(
    () => props.modelValue,
    (val) => {
        clearTimeout(timer)
        if (val.length) {
            timer = setTimeout(() => hideNotification(), props.duration)
        }
    },
)

/**
 * @description 关闭弹窗
 */
const hideNotification = () => {
    clearTimeout(timer)
    emit('update:modelValue', [])
    selectedIndex.value = 0
}

onBeforeUnmount(() => {
    clearTimeout(timer)
})

router.beforeEach(() => {
    hideNotification()
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
</style>
