<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 16:42:08
 * @Description: 更改其他用户密码的弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_PWD')"
        width="450"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe odd"
        >
            <el-form-item
                prop="currentPassword"
                :label="Translate('IDCS_CURRENT_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.currentPassword"
                    maxlength="16"
                />
            </el-form-item>
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.newPassword"
                    maxlength="16"
                />
            </el-form-item>
            <el-form-item>
                <BasePasswordStrength :strength />
            </el-form-item>
            <el-form-item
                prop="confirmNewPassword"
                :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.confirmNewPassword"
                    maxlength="16"
                />
            </el-form-item>
            <div class="base-btn-box flex-start">
                <span
                    v-clean-html="noticeMsg"
                    class="base-rich-text"
                ></span>
            </div>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            title="IDCS_CERTIFICATION_RIGHT"
            @close="pageData.isCheckAuthPop = false"
            @confirm="doUpdateUserPassword"
        />
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPasswordPop.v.ts"></script>
