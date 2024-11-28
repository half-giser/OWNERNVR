<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 16:42:08
 * @Description: 更改其他用户密码的弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_PWD')"
        width="600"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <el-input
                    v-model="formData.newPassword"
                    type="password"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <BasePasswordStrength :strength />
            <el-form-item
                prop="confirmNewPassword"
                :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
            >
                <el-input
                    v-model="formData.confirmNewPassword"
                    type="password"
                    maxlength="16"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <div>
                {{ noticeMsg }}
            </div>
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
