<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:24
 * @Description: 恢复出厂设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 14:28:26
-->
<template>
    <div>
        <el-form>
            <el-form-item>
                <el-radio-group
                    v-model="formData.exceptNetworkConfigSwitch"
                    class="radio-group"
                >
                    <el-radio value="false">{{ Translate('IDCS_FULL') }}</el-radio>
                    <el-radio value="true">{{ Translate('IDCS_RESET_EXCEPT_NETWORK') }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <p class="tip">{{ pageData.factoryResetTip }}</p>
            <div
                class="base-btn-box"
                span="start"
            >
                <el-button
                    class="btn-ok"
                    @click="verify"
                    >{{ Translate('IDCS_RECOVERY_DEFAULT_SET') }}</el-button
                >
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

<style lang="scss" scoped>
.tip {
    margin: 0;
    margin-bottom: 15px;
    padding-left: 15px;
    font-size: 15px;
}

.radio-group {
    display: block;

    :deep(.el-radio) {
        display: flex;
    }
}
</style>
