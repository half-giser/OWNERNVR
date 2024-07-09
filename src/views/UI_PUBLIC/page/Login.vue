<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 登录页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-28 09:04:16
-->
<template>
    <div class="login">
        <el-select
            v-model="langId"
            class="langSel"
        >
            <el-option
                v-for="(value, key) in langTypes"
                :key="key"
                :label="value"
                :value="key"
            />
        </el-select>
        <div id="content">
            <el-form
                ref="loginFormRef"
                label-position="top"
                :rules="rules"
                :model="pageData"
                :hide-required-asterisk="true"
            >
                <el-form-item prop="userName">
                    <el-input
                        v-model="pageData.userName"
                        :placeholder="Translate('IDCS_USERNAME_TIP')"
                        type="text"
                        tabindex="1"
                        size="large"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        ref="pwdRef"
                        v-model="pageData.password"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        type="password"
                        tabindex="2"
                        size="large"
                        show-password
                        @paste.capture.prevent=""
                        @copy.capture.prevent=""
                    >
                    </el-input>
                </el-form-item>
                <el-button
                    class="btnLogin"
                    size="large"
                    :disabled="loginBtnDisabled"
                    @click="handleLogin(loginFormRef)"
                    @keyup.enter="keyUp"
                >
                    {{ Translate('IDCS_LOGIN_NBSP') }}
                </el-button>
            </el-form>
            <div
                id="loginErrorMsg"
                v-text="loginErrorMessage"
            ></div>
        </div>
        <BasePluginDownload />
        <el-dialog
            v-model="isPrivacy"
            width="800"
            align-center
            draggable
            :title="Translate('IDCS_PRIVACY')"
            :show-close="false"
            :modal="true"
            :close-on-click-modal="false"
        >
            <div>
                <textarea
                    class="privacyContent"
                    :readonly="true"
                    :value="Translate('IDCS_PRIVACY_TEXT')"
                >
                </textarea>
                <el-checkbox v-model="isAllowPrivacy">
                    {{ Translate('IDCS_PRIVACY_ALLOW') }}
                </el-checkbox>
            </div>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button
                            :disabled="!isAllowPrivacy"
                            @click="closePrivacy()"
                            >{{ Translate('IDCS_OK') }}</el-button
                        >
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./Login.v.ts"></script>

<style lang="scss" scoped>
.login {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

#content {
    position: relative;
    width: 693px;
    height: 296px;
    // margin: 280px auto 0px auto;
    background: no-repeat var(--login-content);

    :deep(.el-form) {
        margin-top: -18px;
    }

    .el-input {
        width: 253px;
    }

    :deep(.el-input__wrapper) {
        box-shadow: none;
    }

    :deep(.el-form-item) {
        margin: 19px 0px 0px 430px;
        font-size: 16px;
        padding: 18px 0px 0px 0px;
    }
    :deep(.el-form-item__error) {
        margin: 8px 0px 0px 0px;
    }

    .btnLogin {
        --el-button-border-color: var(--primary--04);
        --el-button-bg-color: var(--primary--03);
        --el-button-text-color: var(--page-bg);
        --el-button-hover-text-color: var(--page-bg);
        --el-button-hover-bg-color: var(--primary--02);
        --el-button-hover-border-color: var(--primary--03);
        --el-button-active-text-color: var(--page-bg);
        --el-button-active-border-color: var(--primary--05);
        --el-button-active-bg-color: var(--primary--04);

        width: 314px;
        height: 50px;
        font-size: 18px;
        margin: 33px 0px 0px 378px;
    }
}

.langSel {
    position: absolute;
    top: 20px;
    right: 30px;
    width: 180px;
    // float: right;
    // margin: 20px 30px;
}

#loginErrorMsg {
    position: relative;
    margin: 30px 0px 0px 10px;
    color: var(--error--01);
}

.privacyContent {
    height: 350px;
    overflow: auto;
    width: 754px;
    resize: none;
    box-sizing: border-box;
    padding: 10px;
}
</style>
