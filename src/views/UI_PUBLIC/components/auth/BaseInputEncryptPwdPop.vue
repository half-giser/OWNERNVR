<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="500"
        @close="close"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150"
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
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button
                v-show="!upgradeFlag"
                @click="close"
            >
                {{ Translate('IDCS_CANCEL') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BaseInputEncryptPwdPop.v.ts"></script>
