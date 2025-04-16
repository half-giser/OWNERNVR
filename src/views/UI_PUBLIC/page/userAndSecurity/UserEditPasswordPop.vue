<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 16:42:08
 * @Description: 更改其他用户密码的弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_PWD')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.newPassword"
                    maxlength="16"
                />
            </el-form-item>
            <BasePasswordStrength :strength />
            <el-form-item
                prop="confirmNewPassword"
                :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.confirmNewPassword"
                    maxlength="16"
                />
            </el-form-item>
            <el-form-item>
                <span
                    v-clean-html="noticeMsg"
                    class="base-rich-text"
                ></span>
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
        <BaseCheckAuthPop
            v-model="isAuthDialog"
            @close="isAuthDialog = false"
            @confirm="doUpdateUserPassword"
        />
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPasswordPop.v.ts"></script>
