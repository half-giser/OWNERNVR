<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:09:35
 * @Description: 磁盘模式
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 16:41:38
-->
<template>
    <div class="DiskMode">
        <el-checkbox
            v-model="formData.enable"
            @change="changeDiskMode"
            >{{ Translate('IDCS_RAID_USE') }}</el-checkbox
        >
        <BaseCheckAuthPop
            v-model="pageData.isAuthDialog"
            @close="close"
            @confirm="setData"
        />
    </div>
</template>

<script lang="ts" src="./DiskMode.v.ts"></script>
