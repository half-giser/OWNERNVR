<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 用户更改密码弹窗
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="600"
        :before-close="handleBeforeClose"
        @close="close"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="currentPassword"
                :label="Translate('IDCS_CURRENT_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.currentPassword"
                    @change="changePassword"
                />
            </el-form-item>
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <BasePasswordInput v-model="formData.newPassword" />
            </el-form-item>
            <BasePasswordStrength :strength />
            <el-form-item
                prop="confirmNewPassword"
                :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
            >
                <BasePasswordInput v-model="formData.confirmNewPassword" />
            </el-form-item>
            <el-form-item>{{ noticeMsg }}</el-form-item>
        </el-form>
        <div class="base-btn-box space-between">
            <div>
                <BaseFloatError v-model:message="errorMessage" />
            </div>
            <div>
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChangePasswordPop.v.ts"></script>
