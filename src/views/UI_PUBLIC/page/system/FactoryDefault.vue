<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:24
 * @Description: 恢复出厂设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 17:09:52
-->
<template>
    <div class="FactoryReset">
        <el-radio-group v-model="formData.exceptNetworkConfigSwitch">
            <el-radio value="false">{{ Translate('IDCS_FULL') }}</el-radio>
            <el-radio value="true">{{ Translate('IDCS_RESET_EXCEPT_NETWORK') }}</el-radio>
        </el-radio-group>
        <p class="tip">{{ pageData.factoryResetTip }}</p>
        <div class="btns">
            <el-button
                class="btn-ok"
                @click="verify"
                >{{ Translate('IDCS_RECOVERY_DEFAULT_SET') }}</el-button
            >
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isAuthDialog"
            :tip="pageData.recoverDefaultTip"
            @confirm="confirm"
        />
    </div>
</template>

<script lang="ts" src="./FactoryDefault.v.ts"></script>

<style lang="scss" scoped>
.FactoryReset {
    padding: 20px;

    .tip {
        margin: 0;
        padding-top: 20px;
        font-size: 15px;
    }

    :deep(.el-radio-group) {
        display: block;
    }

    .el-radio {
        display: block;
    }

    .btns {
        padding-top: 20px;
    }
}
</style>
