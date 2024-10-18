<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-17 11:56:00
 * @Description: 基于ElInputNumber, 设置ElInputNumber默认属性，并禁止输入小数、小数点、e、+-符号，隐藏控制按钮
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 13:47:42
-->
<template>
    <el-input-number
        step-strictly
        :controls="false"
        @keydown="handleKeyPress"
    />
</template>

<script lang="ts" setup>
const handleKeyPress = (e: KeyboardEvent) => {
    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault()
    }
    return false
}
</script>
