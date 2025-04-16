<!--
 * @Date: 2025-02-24 16:41:20
 * @Description: 密码输入框（禁用复制粘贴）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-input
        ref="input"
        :type="showText ? 'text' : 'password'"
        autocomplete="new-password"
        @copy.capture.prevent=""
        @paste.capture.prevent=""
    />
</template>

<script setup lang="ts">
import type { InputInstance } from 'element-plus'

withDefaults(
    defineProps<{
        /**
         * @property 是否显示明文
         */
        showText?: boolean
    }>(),
    {
        showText: false,
    },
)

const input = ref<InputInstance>()

const focus = () => {
    input.value?.focus()
}

const blur = () => {
    input.value?.blur()
}

const expose = {
    focus,
    blur,
}

export type BasePasswordReturnsType = typeof expose

defineExpose(expose)
</script>
