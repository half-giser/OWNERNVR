<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 登录页
-->
<template>
    <div
        class="login"
        :style="{ opacity }"
    >
        <div class="login-lang">
            <BaseSelect
                v-model="pageData.langId"
                :options="langOptions"
                @change="changeLang"
            />
            <BaseSelect
                v-show="calendarOptions.length"
                v-model="formData.calendarType"
                :options="calendarOptions"
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
                    />
                </el-form-item>
                <el-form-item
                    prop="password"
                    class="no-padding"
                >
                    <BasePasswordInput
                        v-model="formData.password"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        tabindex="2"
                        @keyup.enter="keyUp"
                    />
                </el-form-item>
                <div class="base-btn-box collapse">
                    <el-button
                        link
                        @click="forgetPassword"
                    >
                        {{ Translate('IDCS_FORGOT_PASSWORD') }}
                    </el-button>
                </div>
                <el-form-item>
                    <el-button
                        class="login-submit"
                        :disabled="btnDisabled"
                        @click="handleLogin"
                        @keyup.enter="keyUp"
                    >
                        <span v-clean-html="Translate('IDCS_LOGIN_NBSP')"></span>
                    </el-button>
                </el-form-item>
                <div
                    class="login-error"
                    v-text="errorMsg"
                ></div>
            </el-form>
        </div>
        <LoginPrivacyPop
            v-model="pageData.isPrivacy"
            @close="closePrivacy"
        />
        <LoginDualAuthPop
            v-model="pageData.isDualAuthPop"
            :err-msg="pageData.dualAuthErrMsg"
            @confirm="handleDualAuthLogin"
            @close="pageData.isDualAuthPop = false"
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
            margin-top: 18px;
            position: relative;
        }

        .el-input {
            width: 254px;
            height: 40px;
        }

        :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: 0;
            background-color: var(--login-input-bg);
            padding-inline: 10px;
        }

        :deep(.el-input__inner) {
            color: var(--login-input-text);
            font-size: 16px;
        }

        :deep(.el-form-item) {
            margin: 0 0 0 444px;
            font-size: 16px;
            padding: 0 0 38px;

            &.no-padding {
                padding-bottom: 0;
            }

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
            margin-left: -56px;
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

    .base-btn-box.collapse {
        padding: 5px 0;
        width: calc(100% - 10px);

        #n9web & .el-button {
            padding: 0;
            text-decoration: underline;
            min-width: unset;
        }
    }

    @if $GLOBAL_UI_TYPE == UI1-E {
        height: 236px;
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
    top: 100%;
    left: 390px;
    color: var(--color-error);
    font-size: 18px;
    width: 570px;
}
</style>
