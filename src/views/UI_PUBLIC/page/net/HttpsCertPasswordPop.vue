<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 14:38:17
 * @Description: 证书加密密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 17:21:11
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CERT_ENCRY_PWD')"
        width="500px"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item>
                <el-radio-group
                    v-model="formData.encryption"
                    class="radio-group"
                >
                    <el-radio
                        v-for="item in pageData.options"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
            </el-form-item>
            <el-form-item prop="password">
                <el-input
                    type="password"
                    maxlength="64"
                    :disabled="formData.encryption === 'unencrypted'"
                    :placeholder="Translate('IDCS_ENTER_CERT_ENCRY_PWD')"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./HttpsCertPasswordPop.v.ts"></script>

<style lang="scss" scoped>
.radio-group {
    display: block;

    :deep(.el-radio) {
        display: flex;
    }
}
</style>
