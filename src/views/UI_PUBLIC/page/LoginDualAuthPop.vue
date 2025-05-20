<!--
 * @Date: 2025-04-27 14:03:11
 * @Description: 登录双重认证弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DOUBLE_VERIFICATION_USER')"
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
                <el-input v-model="formData.userName" />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <BasePasswordInput v-model="formData.password" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box flex-start text-error">
            {{ errMsg }}
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script src="./LoginDualAuthPop.v.ts"></script>
