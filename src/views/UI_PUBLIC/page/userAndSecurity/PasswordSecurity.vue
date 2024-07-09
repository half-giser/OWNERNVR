<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:40:41
 * @Description: 密码安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 20:13:52
-->
<template>
    <div class="PasswordSecurity">
        <el-form
            class="form"
            label-position="left"
            :model="formData"
            hide-required-asterisk
            label-width="150px"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_MINIMUM_PASSWORD_LEVEL')">
                <el-select v-model="formData.passwordStrength">
                    <el-option
                        v-for="item in pageData.passwordStrengthOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD_EXPIRATION_TIME')">
                <el-select v-model="formData.expirationTime">
                    <el-option
                        v-for="item in pageData.expirationTimeOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="btns">
            <el-button
                class="btn-ok"
                @click="updateData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./PasswordSecurity.v.ts"></script>

<style lang="scss" scoped>
.PasswordSecurity {
    .form {
        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__content) {
            // justify-content: flex-start;
            flex-wrap: nowrap;
        }

        .el-input {
            width: 340px;
            flex-shrink: 0;
        }
        .el-select {
            width: 340px;
        }
    }

    .btns {
        width: 510px;
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>
