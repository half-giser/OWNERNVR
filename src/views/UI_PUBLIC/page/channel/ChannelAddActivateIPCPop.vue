<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:15:18
 * @Description: 添加通道 - 激活IPC弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ACTIVATE')"
        width="450"
        @closed="close"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="useDefaultPwdSwitch"
                    :label="Translate('IDCS_USE_DEFAULT_PASSWORD')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="16"
                    :disabled="useDefaultPwdSwitch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    maxlength="16"
                    :disabled="useDefaultPwdSwitch"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddActivateIPCPop.v.ts"></script>
