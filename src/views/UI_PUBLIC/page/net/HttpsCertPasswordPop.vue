<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 14:38:17
 * @Description: 证书加密密码弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CERT_ENCRY_PWD')"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item>
                <el-radio-group
                    v-model="formData.encryption"
                    class="line-break"
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
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./HttpsCertPasswordPop.v.ts"></script>
