<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:21
 * @Description: 
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-12 15:04:33
-->
<template>
    <div>
        <RecordStreamTable
            :v-model="pageData.init"
            :mode="pageData.mode"
        ></RecordStreamTable>
    </div>
</template>

<script lang="ts" src="./RecordStream.v.ts"></script>
