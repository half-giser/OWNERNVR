<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:47:30
 * @Description: 添加用户页面
-->
<template>
    <div>
        <el-form
            ref="formRef"
            class="stripe"
            :rules
            :model="formData"
            :style="{
                '--form-input-width': '340px',
                '--form-label-width': '200px',
            }"
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
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                    @copy.capture.prevent=""
                    @paste.capture.prevent=""
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
                <el-input
                    v-model="formData.confirmPassword"
                    type="password"
                    @copy.capture.prevent=""
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALLOW_CHANGE_PWD')">
                <el-checkbox v-model="formData.allowModifyPassword" />
            </el-form-item>
            <el-form-item
                prop="email"
                :label="Translate('IDCS_EMAIL_ADDRESS')"
            >
                <BaseSensitiveEmailInput v-model="formData.email" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RIGHT_GROUP')">
                <el-select-v2
                    v-model="formData.authGroup"
                    :options="authGroupOptions"
                />
            </el-form-item>
            <div class="notice">{{ noticeMsg }}</div>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="isAuthDialog"
            @close="isAuthDialog = false"
            @confirm="doCreateUser"
        />
    </div>
</template>

<script lang="ts" src="./UserAdd.v.ts"></script>

<style lang="scss" scoped>
.strength {
    width: calc(var(--form-input-width) + var(--form-label-width) + 15px);
}

.notice {
    margin: 15px;
    font-size: 15px;
}
</style>
