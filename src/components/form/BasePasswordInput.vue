<!--
 * @Date: 2025-02-24 16:41:20
 * @Description: 密码输入框（禁用复制粘贴）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-input
        :type="showText ? 'text' : 'password'"
        autocomplete="new-password"
        @copy.capture.prevent=""
        @paste.capture.prevent=""
    />
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        showText?: boolean
    }>(),
    {
        showText: false,
    },
)
</script>
