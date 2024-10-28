<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-01 10:55:38
 * @Description: 回放-远程备份任务 加密弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 17:29:44
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SELECT_ENCRYPTION')"
        :width="500"
        @opened="open"
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
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <el-input
                    v-model="formData.password"
                    :type="pageData.showPassword ? 'text' : 'password'"
                    :disabled="formData.encrypt === 'unencrypted'"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <el-input
                    v-model="formData.confirmPassword"
                    :type="pageData.showPassword ? 'text' : 'password'"
                    :disabled="formData.encrypt === 'unencrypted'"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="pageData.showPassword"
                    :label="Translate('IDCS_SHOW_PASSWORD')"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BackupRemoteEncryptPop.v.ts"></script>
