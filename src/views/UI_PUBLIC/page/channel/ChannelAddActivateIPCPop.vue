<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:15:18
 * @Description: 添加通道 - 激活IPC弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ACTIVATE')"
        width="460"
        align-center
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="left"
        >
            <el-form-item>
                <el-checkbox
                    v-model="useDefaultPwdSwitch"
                    :label="Translate('IDCS_USE_DEFAULT_PASSWORD')"
                    @change="formRef?.clearValidate()"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <el-input
                    v-model.trim="formData.password"
                    type="password"
                    :disabled="useDefaultPwdSwitch"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <el-input
                    v-model.trim="formData.confirmPassword"
                    type="password"
                    :disabled="useDefaultPwdSwitch"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddActivateIPCPop.v.ts"></script>
