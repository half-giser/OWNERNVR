<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="450"
        @close="close"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    max-length="16"
                />
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
