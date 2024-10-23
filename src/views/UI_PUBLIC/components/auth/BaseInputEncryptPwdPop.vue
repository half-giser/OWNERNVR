<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-18 09:33:02
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="500"
        align-center
        draggable
        :close-on-click-modal="false"
        @close="close"
        @opened="reset"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150"
            label-position="left"
            hide-required-asterisk
        >
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    :type="isShowPassord ? 'text' : 'password'"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                v-show="!decryptFlag"
                :label="Translate('IDCS_SHOW_PASSWORD')"
            >
                <el-checkbox v-model="isShowPassord" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button
                        v-show="!upgradeFlag"
                        @click="close"
                        >{{ Translate('IDCS_CANCEL') }}</el-button
                    >
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BaseInputEncryptPwdPop.v.ts"></script>
