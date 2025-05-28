<template>
    <el-dialog
        width="500"
        :title="
            type === 'add' ? Translate('IDCS_ADD_XXX').formatForLang(Translate('IDCS_DOUBLE_VERIFICATION_USER')) : Translate('IDCS_EDIT_XXX').formatForLang(Translate('IDCS_DOUBLE_VERIFICATION_USER'))
        "
        @opened="open"
        @close="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            class="stripe"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <BaseTextInput
                    v-model="formData.userName"
                    :maxlength="formData.userNameMaxByteLen"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                    :formatter="formatName"
                />
            </el-form-item>
            <el-form-item
                v-if="type === 'edit'"
                :label="Translate('IDCS_CHANGE_PWD')"
            >
                <el-checkbox v-model="pageData.isChangePassword" />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="16"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    :disabled="!pageData.isChangePassword"
                />
            </el-form-item>
            <el-form-item>
                <BasePasswordStrength :strength="strength" />
            </el-form-item>
            <el-form-item
                prop="confirmPassword"
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    maxlength="16"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    :disabled="!pageData.isChangePassword"
                />
            </el-form-item>
            <div
                v-clean-html="noticeMsg"
                class="notice base-rich-text"
            ></div>
            <el-form-item
                class="login-user-item"
                :label="Translate('IDCS_LOGIN_USER')"
            >
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    height="150"
                >
                    <el-table-column
                        type="selection"
                        width="80"
                    />
                    <el-table-column prop="userName" />
                </el-table>
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmSetData"
            @close="pageData.isCheckAuthPop = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./DualAuthConfigAddPop.v.ts"></script>

<style lang="scss" scoped>
.el-dialog {
    .notice {
        margin: 5px 0 10px;
        font-size: 12px;
    }

    #n9web & {
        .el-form {
            :deep(.login-user-item) {
                background-color: transparent;
            }
        }
    }
}
</style>
