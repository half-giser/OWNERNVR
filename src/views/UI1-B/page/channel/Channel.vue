<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-29 13:48:55
 * @Description: 
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-29 13:50:11
-->

<!-- it is just a demo, feel free to modify it -->
<template>
    <Channel />
</template>

<script lang="ts" setup>
import Channel from '@/views/UI_PUBLIC/page/channel/Channel.vue'
</script>

<style scoped lang="scss">
:deep(.status.online) {
    color: yellowgreen;
}
:deep(.status.offline) {
    color: pink;
}
</style>
