<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 08:56:29
 * @Description: 802.1x配置
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-input
                    v-model="formData.protocal"
                    disabled
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_8021X_EAPOL_VERSION')">
                <el-input
                    v-model="formData.version"
                    disabled
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <el-input
                    v-model="formData.userName"
                    :disabled="!formData.switch"
                    maxlength="32"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!formData.switch || !pageData.passwordSwitch"
                    maxlength="32"
                />
                <el-checkbox
                    v-model="pageData.passwordSwitch"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./P8021x.v.ts"></script>
