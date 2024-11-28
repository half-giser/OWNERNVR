<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:40:41
 * @Description: 密码安全
-->
<template>
    <div>
        <el-form
            :style="{
                '--form-input-width': '340px',
            }"
        >
            <el-form-item :label="Translate('IDCS_MINIMUM_PASSWORD_LEVEL')">
                <el-select-v2
                    v-model="formData.passwordStrength"
                    :options="pageData.passwordStrengthOptions"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD_EXPIRATION_TIME')">
                <el-select-v2
                    v-model="formData.expirationTime"
                    :options="pageData.expirationTimeOptions"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="updateData">
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PasswordSecurity.v.ts"></script>
