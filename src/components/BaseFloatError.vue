<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-12 16:58:29
 * @Description: 成功/错误浮动提示框
-->
<template>
    <teleport
        :disabled="!teleported"
        :to
    >
        <div
            v-if="!!message"
            class="tip_wrap"
            :class="index === 1 ? 'ok' : 'error'"
            @click="handleClick"
        >
            <BaseImgSprite
                file="floatTip"
                :chunk="5"
                :index="index"
            />
            <span class="tip_msg">
                {{ message }}
            </span>
        </div>
    </teleport>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        teleported?: boolean
        type?: string
        to?: string
        message: string
    }>(),
    {
        teleported: true,
        type: 'error',
        to: 'body',
        message: '',
    },
)

const emits = defineEmits<{
    (e: 'update:message', str: string): void
}>()

let timer: NodeJS.Timeout | number = 0

watch(
    () => props.message,
    (message) => {
        clearTimer()
        if (message) {
            timer = setTimeout(() => {
                emits('update:message', '')
            }, 5000)
        }
    },
)

const index = computed(() => {
    return props.type === 'ok' ? 1 : 2
})

const clearTimer = () => {
    if (timer) clearTimeout(timer)
}

const handleClick = () => {
    clearTimer()
    emits('update:message', '')
}
</script>

<style lang="scss" scoped>
.tip_wrap {
    display: flex;
    align-items: center;
    font-size: 12px;
    padding: 3px 5px 3px 3px;
    border: 1px solid;
    white-space: nowrap;
    position: relative;

    .tip_msg {
        margin-left: 3px;
    }

    &.ok {
        border-color: var(--float-ok);
        color: var(--float-ok);
    }

    &.error {
        border-color: var(--float-error);
        color: var(--float-error);
    }
}
</style>
