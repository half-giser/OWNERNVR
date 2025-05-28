<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 14:51:27
 * @Description: 编辑用户信息弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_USER_INFO')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
        >
            <el-form-item :label="Translate('IDCS_ENABLE')">
                <el-checkbox
                    v-model="formData.enabled"
                    :disabled="pageData.isEditAdmin"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USERNAME')">
                <el-input
                    v-model="formData.userName"
                    disabled
                />
            </el-form-item>
            <el-form-item
                v-if="!pageData.isEditAdmin"
                :label="Translate('IDCS_RIGHT_GROUP')"
            >
                <el-select-v2
                    v-model="formData.authGroup"
                    :options="authGroupOptions"
                    :disabled="pageData.isEditAdmin"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CLOSE_PERMISSION_CONTROL')">
                <el-checkbox
                    v-model="formData.authEffective"
                    :disabled="pageData.isEditAdmin"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALLOW_CHANGE_PWD')">
                <el-checkbox v-model="formData.allowModifyPassword" />
            </el-form-item>
            <el-form-item
                v-if="pageData.isAdmin"
                :label="Translate('IDCS_REMOTE_LOGIN_ACCESS_CODE')"
            >
                <el-checkbox
                    v-model="formData.accessCode"
                    :label="Translate('IDCS_ENABLE')"
                />
                <BaseImgSprite
                    file="question"
                    :index="0"
                    :hover-index="1"
                    :chunk="2"
                    :title="Translate('IDCS_REMOTE_LOGIN_ACCESS_CODE_TIP').formatForLang(1)"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_REMARK')">
                <BaseTextInput
                    v-model="formData.email"
                    :maxlength="formData.emailMaxByteLen"
                />
            </el-form-item>
            <el-form-item v-if="!pageData.isEditAdmin && !pageData.isEditDebug">
                <template #label>
                    <el-checkbox
                        v-model="formData.loginScheduleInfoEnabled"
                        :label="Translate('IDCS_LOGIN_SECHDULE')"
                    />
                </template>
                <BaseScheduleSelect
                    v-model="formData.loginScheduleInfo"
                    :options="pageData.scheduleList"
                    :disabled="!formData.loginScheduleInfoEnabled"
                    @edit="pageData.isSchedulePop = true"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                v-show="!pageData.isEditAdmin && !pageData.isEditSelf"
                @click="changePassword"
            >
                {{ Translate('IDCS_RESET_PASSWORD') }}
            </el-button>
            <el-button @click="doEditUser">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            title="IDCS_CERTIFICATION_RIGHT"
            @confirm="confirmEditUser"
            @close="pageData.isCheckAuthPop = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPop.v.ts"></script>
