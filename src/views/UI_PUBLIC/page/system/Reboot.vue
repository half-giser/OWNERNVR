<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:48
 * @Description: 系统重启
-->
<template>
    <el-form>
        <el-form-item>
            <el-button @click="verify">{{ Translate('IDCS_SYSTEM_REBOOT') }}</el-button>
        </el-form-item>
        <el-form-item>{{ Translate('IDCS_REBOOT_NOTE') }}</el-form-item>
    </el-form>
    <BaseCheckAuthPop
        v-model="pageData.isAuthPop"
        :tip="Translate('IDCS_REBOOT_CONFIRM')"
        @confirm="confirm"
    />
</template>

<script lang="ts" src="./Reboot.v.ts"></script>
