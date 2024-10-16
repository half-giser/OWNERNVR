<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:24
 * @Description: 恢复出厂设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 09:42:24
-->
<template>
    <div>
        <el-form>
            <el-form-item>
                <el-radio-group
                    v-model="formData.exceptNetworkConfigSwitch"
                    class="line-break"
                >
                    <el-radio value="false">{{ Translate('IDCS_FULL') }}</el-radio>
                    <el-radio value="true">{{ Translate('IDCS_RESET_EXCEPT_NETWORK') }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>{{ pageData.factoryResetTip }}</el-form-item>
            <div
                class="base-btn-box padding"
                span="start"
            >
                <el-button @click="verify">{{ Translate('IDCS_RECOVERY_DEFAULT_SET') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isAuthDialog"
            :tip="pageData.recoverDefaultTip"
            @confirm="confirm"
        />
    </div>
</template>

<script lang="ts" src="./FactoryDefault.v.ts"></script>
