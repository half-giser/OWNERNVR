<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 16:42:08
 * @Description: 更改其他用户密码的弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 19:52:46
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_PWD')"
        width="600"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150"
            label-position="left"
        >
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <el-input
                    v-model="formData.newPassword"
                    type="password"
                    :placeholder="Translate('IDCS_NEW_PASSWORD')"
                    :title="Translate('IDCS_NEW_PASSWORD')"
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
                    :placeholder="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
                    :title="Translate('IDCS_CONFIRM_NEW_PASSWORD')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <div>
                {{ noticeMsg }}
            </div>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
        <BaseCheckAuthPop
            v-model="isAuthDialog"
            @close="isAuthDialog = false"
            @confirm="doUpdateUserPassword"
        />
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPasswordPop.v.ts"></script>
