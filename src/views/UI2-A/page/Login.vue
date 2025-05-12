<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:37:52
 * @Description: UI2-A客制化 登录
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
        <div class="login-main">
            <div class="login-logo"></div>
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
                        <BasePasswordInput
                            v-model="formData.password"
                            :placeholder="Translate('IDCS_PASSWORD_TIP')"
                            tabindex="2"
                            size="large"
                            @keyup.enter="keyUp"
                        />
                    </el-form-item>
                    <div class="base-btn-box">
                        <el-button
                            type="text"
                            @click="forgetPassword"
                        >
                            {{ Translate('IDCS_FORGOT_PASSWORD') }}
                        </el-button>
                    </div>
                    <el-form-item>
                        <el-button
                            class="login-submit"
                            size="large"
                            :disabled="btnDisabled"
                            @click="handleLogin"
                            @keyup.enter="keyUp"
                        >
                            <span v-clean-html="Translate('IDCS_LOGIN_NBSP')"></span>
                        </el-button>
                    </el-form-item>
                </el-form>
                <div
                    class="login-error"
                    v-text="errorMsg"
                ></div>
            </div>
        </div>
        <LoginPrivacyPop
            v-model="pageData.isPrivacy"
            @close="closePrivacy"
        />
        <BasePluginDownload />
    </div>
</template>

<script lang="ts" src="@/views/UI_PUBLIC/page/Login.v.ts"></script>

<style lang="scss" scoped>
.login {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--login-bg, var(--main-bg));

    .base-btn-box {
        margin-top: -20px;
        width: 685px;

        #n9web & .el-button {
            padding: 0;
            min-width: unset;
            text-decoration: underline;
        }
    }
}

.login-main {
    width: 100%;
    height: 467px;
    background-color: var(--login-content-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-bottom: 3px solid var(--primary);
    position: relative;

    &::after {
        content: '';
        width: 62%;
        position: absolute;
        bottom: -3px;
        left: 0;
        border-bottom: 3px solid var(--color-black);
    }
}

.login-logo {
    width: 693px;
    height: 36px;
    margin-bottom: 20px;
    background-image: var(--img-login-logo);
    background-position: center left;
    background-repeat: no-repeat;
}

.login-content {
    position: relative;
    width: 693px;
    height: 236px;
    background-image: var(--img-login-content);
    background-position: center top;
    background-repeat: no-repeat;

    #n9web & {
        :deep(.el-form) {
            margin-top: 13px;
        }

        .el-input {
            width: 254px;
            height: 50px;
        }

        :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: 0;
            background-color: var(--login-input-bg);
        }

        :deep(.el-input__inner) {
            color: var(--login-input-text);
            font-size: 16px;
        }

        :deep(.el-form-item) {
            margin: 0 0 0 428px;
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
            margin-left: -55px;
            // margin: 0 0px 0px 378px;
            background: var(--img-login-btn);
            transition: none;

            &:hover {
                background-position: 0 -50px;
            }
        }
    }
}

.login-lang {
    position: absolute;
    top: 10px;
    right: 15px;
    width: 180px;

    .el-select {
        margin-bottom: 10px;
    }
}

.login-error {
    position: absolute;
    top: calc(100% + 20px);
    left: 376px;
    // margin: 30px 0px 0px 10px;
    color: var(--color-error);
    width: 570px;
}
</style>
