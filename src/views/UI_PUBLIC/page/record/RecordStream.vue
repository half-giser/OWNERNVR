<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:21
 * @Description: 
-->
<template>
    <div>
        <RecordBaseStreamTable
            :v-model="pageData.init"
            :mode="pageData.mode"
            :pop="false"
        />
    </div>
</template>

<script lang="ts" src="./RecordStream.v.ts"></script>
