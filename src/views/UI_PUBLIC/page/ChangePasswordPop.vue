<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 用户更改密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 19:55:27
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="600"
        align-center
        draggable
        :before-close="handleBeforeClose"
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
                prop="currentPassword"
                :label="Translate('IDCS_CURRENT_PASSWORD')"
            >
                <el-input
                    v-model="formData.currentPassword"
                    type="password"
                    :placeholder="Translate('IDCS_CURRENT_PASSWORD')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="newPassword"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <el-input
                    v-model="formData.newPassword"
                    type="password"
                    :placeholder="Translate('IDCS_NEW_PASSWORD')"
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
    </el-dialog>
</template>

<script lang="ts" src="./ChangePasswordPop.v.ts"></script>
