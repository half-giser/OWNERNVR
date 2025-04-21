<!--
 * @Date: 2025-02-24 16:41:20
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Description: 密码输入框 1. 禁用复制粘贴; 2. 默认展示小眼睛
-->
<template>
    <el-input
        ref="input"
        :show-password="showPassword"
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
        showPassword?: boolean
    }>(),
    {
        showPassword: true,
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
