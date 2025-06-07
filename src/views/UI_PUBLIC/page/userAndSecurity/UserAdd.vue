<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:47:30
 * @Description: 添加用户页面
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :rules="rules"
            :model="formData"
        >
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USERNAME')"
            >
                <el-input
                    v-model.trim="formData.userName"
                    type="text"
                    :formatter="formatInputUserName"
                    :parser="formatInputUserName"
                    maxlength="63"
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="16"
                />
            </el-form-item>
            <el-form-item>
                <BasePasswordStrength
                    class="strength"
                    :strength
                />
            </el-form-item>
            <el-form-item
                prop="confirmPassword"
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    maxlength="16"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RIGHT_GROUP')">
                <BaseSelect
                    v-model="formData.authGroup"
                    :options="authGroupOptions"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALLOW_CHANGE_PWD')">
                <el-checkbox
                    v-model="formData.allowModifyPassword"
                    :label="Translate('IDCS_ENABLE')"
                />
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
                <el-input v-model="formData.email" />
            </el-form-item>
            <!-- <el-form-item :label="Translate('IDCS_BING_MAC')">
                <el-input />
                <el-checkbox />
            </el-form-item> -->
            <el-form-item>
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
            <div
                v-clean-html="noticeMsg"
                class="notice base-rich-text"
            ></div>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            title="IDCS_CERTIFICATION_RIGHT"
            @close="pageData.isCheckAuthPop = false"
            @confirm="doCreateUser"
        />
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./UserAdd.v.ts"></script>

<style lang="scss" scoped>
.strength {
    width: calc(var(--form-input-width) + var(--form-label-width));
}

.notice {
    margin: 15px;
    font-size: 15px;
}
</style>
