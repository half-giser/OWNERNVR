<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 20:09:32
 * @Description: OVNIF 新增/编辑用户弹窗
-->
<template>
    <el-dialog
        :title="type === 'add' ? Translate('IDCS_ADD') : Translate('IDCS_EDIT')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
        >
            <el-form-item
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <el-input
                    v-model="formData.userName"
                    maxlength="32"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                    @formatter="formatUserName"
                    @parser="formatUserName"
                />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    <div class="base-label-box">
                        <span>{{ type === 'add' ? Translate('IDCS_PASSWORD') : Translate('IDCS_CHANGE_PWD') }}</span>
                        <el-checkbox
                            v-show="type === 'edit'"
                            v-model="pageData.passwordSwitch"
                        />
                    </div>
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="type === 'edit' && !pageData.passwordSwitch"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
            <el-form-item>
                <BasePasswordStrength :strength />
            </el-form-item>
            <div
                v-clean-html="pageData.passwordTip"
                class="tip"
            ></div>
            <el-form-item
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    :disabled="type === 'edit' && !pageData.passwordSwitch"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USER_TYPE')">
                <el-radio-group
                    v-model="formData.userLevel"
                    class="line-break"
                >
                    <el-radio
                        v-for="item in pageData.levelList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ONVIFUserAddPop.v.ts"></script>

<style lang="scss" scoped>
.tip {
    margin-bottom: 10px;
    // padding-left: 15px;
}
</style>
