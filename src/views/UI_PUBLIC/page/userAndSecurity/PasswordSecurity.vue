<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:40:41
 * @Description: 密码安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 19:53:49
-->
<template>
    <div>
        <el-form
            label-position="left"
            :model="formData"
            hide-required-asterisk
            label-width="150"
            :style="{
                '--form-input-width': '340px',
            }"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_MINIMUM_PASSWORD_LEVEL')">
                <el-select v-model="formData.passwordStrength">
                    <el-option
                        v-for="item in pageData.passwordStrengthOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD_EXPIRATION_TIME')">
                <el-select v-model="formData.expirationTime">
                    <el-option
                        v-for="item in pageData.expirationTimeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    class="btn-ok"
                    @click="updateData"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PasswordSecurity.v.ts"></script>
