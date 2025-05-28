<!--
 * @Date: 2025-04-18 15:41:30
 * @Description: 排程选择器，包含排程管理选项
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-select-v2
        :model-value="modelValue"
        :options="scheduleList"
        :disabled="disabled"
        @visible-change="open"
        @update:model-value="update"
    />
</template>

<script lang="ts" src="./BaseScheduleSelect.v.ts"></script>
