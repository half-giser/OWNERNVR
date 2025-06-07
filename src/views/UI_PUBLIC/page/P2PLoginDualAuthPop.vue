<!--
 * @Date: 2025-04-29 23:26:39
 * @Description: P2P双重验证弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :model-value="visible"
        :title="Translate('IDCS_DOUBLE_VERIFICATION_USER')"
        width="470"
        :show-close="false"
        @closed="close"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item
                prop="username"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input v-model="formData.username" />
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
            <el-button @click="destroy">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script src="./P2PLoginDualAuthPop.v.ts" lang="ts"></script>
