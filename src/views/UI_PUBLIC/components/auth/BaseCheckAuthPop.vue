<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 账号密码权限认证弹窗
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="470"
        @open="open"
        @close="close"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input
                    v-model="formData.userName"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
        </el-form>
        <div
            v-show="tip"
            class="base-btn-box flex-start"
        >
            {{ tip }}
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate(confirmText) }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BaseCheckAuthPop.v.ts"></script>
