<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:48
 * @Description: 系统重启
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 17:23:51
-->
<template>
    <div class="Reboot">
        <div class="btns">
            <el-button
                class="btn-ok"
                @click="verify"
                >{{ Translate('IDCS_SYSTEM_REBOOT') }}</el-button
            >
        </div>
        <p class="tip">{{ Translate('IDCS_REBOOT_NOTE') }}</p>
        <BaseCheckAuthPop
            v-model="pageData.isAuthDialog"
            :tip="Translate('IDCS_REBOOT_CONFIRM')"
            @confirm="confirm"
        />
    </div>
</template>

<script lang="ts" src="./Reboot.v.ts"></script>

<style lang="scss" scoped>
.Reboot {
    padding: 20px;

    .tip {
        margin: 0;
        padding-top: 20px;
        font-size: 15px;
    }
}
</style>
