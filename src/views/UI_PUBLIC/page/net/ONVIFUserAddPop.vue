<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 20:09:32
 * @Description: OVNIF 新增/编辑用户弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 18:15:49
-->
<template>
    <el-dialog
        :title="type === 'add' ? Translate('IDCS_ADD') : Translate('IDCS_EDIT')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            label-position="left"
        >
            <el-form-item
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <el-input
                    v-model="formData.userName"
                    maxlength="32"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    {{ type === 'add' ? Translate('IDCS_PASSWORD') : Translate('IDCS_CHANGE_PWD') }}
                    <el-checkbox
                        v-show="type === 'edit'"
                        v-model="pageData.passwordSwitch"
                    ></el-checkbox>
                </template>
                <el-input
                    v-model="formData.password"
                    type="password"
                    :disabled="type === 'edit' && !pageData.passwordSwitch"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <BasePasswordStrength :strength />
            <el-form-item label=" ">
                <el-text class="tip">{{ Translate('IDCS_PASSWORD_STRONG_MIDDLE').formatForLang(8, 16) }}</el-text>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
                prop="confirmPassword"
            >
                <el-input
                    v-model="formData.confirmPassword"
                    type="password"
                    :disabled="type === 'edit' && !pageData.passwordSwitch"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
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
                        >{{ item.label }}</el-radio
                    >
                </el-radio-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ONVIFUserAddPop.v.ts"></script>

<style lang="scss" scoped>
.tip {
    font-size: 12px;
    line-height: 1.4;
}
</style>
