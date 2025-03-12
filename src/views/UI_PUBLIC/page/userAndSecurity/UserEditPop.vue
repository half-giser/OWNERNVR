<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 14:51:27
 * @Description: 编辑用户信息弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_USER_INFO')"
        width="600"
        @opened="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            class="stripe"
            :rules
            :model="formData"
            :class="{
                '--form-label-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_ENABLE')">
                <el-checkbox
                    v-model="formData.enabled"
                    :disabled="pageData.isEnableDisabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USERNAME')">
                <el-input
                    v-model="formData.userName"
                    disabled
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CLOSE_PERMISSION_CONTROL')">
                <el-checkbox
                    v-model="formData.authEffective"
                    :disabled="pageData.isAuthEffectiveDisabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALLOW_CHANGE_PWD')">
                <el-checkbox v-model="formData.allowModifyPassword" />
            </el-form-item>
            <el-form-item
                prop="email"
                :label="Translate('IDCS_EMAIL_ADDRESS')"
            >
                <BaseSensitiveEmailInput v-model="formData.email" />
            </el-form-item>
            <el-form-item
                v-show="pageData.isAuthGroup"
                :label="Translate('IDCS_RIGHT_GROUP')"
            >
                <el-select-v2
                    v-model="formData.authGroup"
                    :options="authGroupOptions"
                    :disabled="pageData.isAuthGroupDisabled"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                v-show="pageData.isChangePasswordBtn"
                @click="changePassword"
            >
                {{ Translate('IDCS_CHANGE_PWD') }}
            </el-button>
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPop.v.ts"></script>
