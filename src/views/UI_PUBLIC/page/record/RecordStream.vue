<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:21
 * @Description: 
-->
<template>
    <RecordBaseStreamTable
        v-if="pageData.mode"
        :mode="pageData.mode"
        :pop="false"
    />
</template>

<script lang="ts" src="./RecordStream.v.ts"></script>
