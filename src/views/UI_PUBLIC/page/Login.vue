<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 登录页
-->
<template>
    <div class="login">
        <div class="login-lang">
            <el-select-v2
                v-model="pageData.langId"
                :options="pageData.langTypes"
                @change="changeLang"
            />
            <el-select-v2
                v-show="pageData.calendarOptions.length"
                v-model="formData.calendarType"
                :options="pageData.calendarOptions"
            />
        </div>
        <div class="login-content">
            <el-form
                ref="formRef"
                label-position="top"
                :rules="rules"
                :model="formData"
            >
                <el-form-item prop="userName">
                    <el-input
                        v-model="formData.userName"
                        :placeholder="Translate('IDCS_USERNAME_TIP')"
                        type="text"
                        tabindex="1"
                        size="large"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="formData.password"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        type="password"
                        tabindex="2"
                        size="large"
                        show-password
                        @paste.capture.prevent=""
                        @copy.capture.prevent=""
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        class="login-submit"
                        size="large"
                        :disabled="pageData.btnDisabled"
                        @click="handleLogin"
                        @keyup.enter="keyUp"
                    >
                        <span v-clean-html="Translate('IDCS_LOGIN_NBSP')"></span>
                    </el-button>
                </el-form-item>
                <div
                    class="login-error"
                    v-text="pageData.errorMsg"
                ></div>
            </el-form>
        </div>
        <LoginPrivacyPop
            v-model="pageData.isPrivacy"
            @close="closePrivacy"
        />
        <BasePluginDownload />
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
    background-color: var(--login-bg, var(--main-bg));
}

.login-content {
    position: relative;
    width: 713px;
    height: 296px;
    background-image: var(--img-login-content);
    background-color: var(--login-content-bg, var(--main-bg));
    background-position: center top;
    background-repeat: no-repeat;
    padding-inline: 10px;

    #n9web & {
        :deep(.el-form) {
            margin-top: 13px;
            position: relative;
        }

        .el-input {
            width: 264px;
            height: 50px;
        }

        :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: 0;
            background-color: var(--login-input-bg);
        }

        :deep(.el-input__inner) {
            color: var(--login-input-text);
        }

        :deep(.el-form-item) {
            margin: 0 0 0 438px;
            font-size: 16px;
            padding: 0 0 28px;

            &:last-child {
                padding-bottom: 0;
            }
        }

        .login-submit {
            --el-button-border-color: transparent;
            --el-button-hover-border-color: transparent;
            --el-button-active-border-color: transparent;
            --el-button-text-color: var(--login-btn-text);
            --el-button-hover-text-color: var(--login-btn-text);

            width: 314px;
            height: 50px;
            font-size: 18px;
            margin-left: -50px;
            background: var(--img-login-btn);
            transition: none;

            &:hover {
                background-position: 0 -50px;
            }

            &.is-disabled {
                background-position: 0 -150px;
            }
        }
    }
}

.login-lang {
    position: absolute;
    top: 20px;
    right: 30px;
    width: 180px;

    .el-select {
        margin-bottom: 10px;
    }
}

.login-error {
    position: absolute;
    top: 100%;
    left: 390px;
    color: var(--color-error);
    font-size: 18px;
}
</style>
