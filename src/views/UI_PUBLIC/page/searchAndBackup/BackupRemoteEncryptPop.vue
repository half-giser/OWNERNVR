<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-01 10:55:38
 * @Description: 回放-远程备份任务 加密弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SELECT_ENCRYPTION')"
        :width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item>
                <el-radio-group
                    v-model="formData.encrypt"
                    :disabled="!encrypt"
                >
                    <el-radio
                        value="encrypted"
                        :label="Translate('IDCS_ENCRYPTION')"
                    />
                    <el-radio
                        value="unencrypted"
                        :label="Translate('IDCS_NO_ENCRYPTION')"
                    />
                </el-radio-group>
            </el-form-item>
            <el-form-item
                v-show="formData.encrypt === 'encrypted'"
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :show-text="pageData.showPassword"
                    :disabled="formData.encrypt === 'unencrypted'"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.encrypt === 'encrypted'"
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    :show-text="pageData.showPassword"
                    :disabled="formData.encrypt === 'unencrypted'"
                />
            </el-form-item>
            <el-form-item v-show="formData.encrypt === 'encrypted'">
                <el-checkbox
                    v-model="pageData.showPassword"
                    :label="Translate('IDCS_SHOW_PASSWORD')"
                />
            </el-form-item>
            <el-form-item v-show="formData.encrypt === 'unencrypted'">
                {{ Translate('IDCS_PLAY_VIDEO_NO_PASSWORD') }}
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupRemoteEncryptPop.v.ts"></script>
