<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:11:22
 * @Description: PPPoE
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
            <el-form-item
                :label="Translate('IDCS_ACCOUNT')"
                prop="userName"
            >
                <BaseTextInput
                    v-model="formData.userName"
                    :disabled="!formData.switch"
                    :maxlength="formData.userNameMaxByteLen"
                />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    <div class="base-label-box">
                        <span>{{ Translate('IDCS_PASSWORD') }}</span>
                        <el-checkbox
                            v-show="pageData.isPasswordSwitch"
                            v-model="pageData.passwordSwitch"
                            :disabled="!formData.switch || pageData.wirelessSwitch"
                        />
                    </div>
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!formData.switch || !pageData.passwordSwitch || pageData.wirelessSwitch"
                    :maxlength="32"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.wirelessSwitch"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PPPOE.v.ts"></script>
