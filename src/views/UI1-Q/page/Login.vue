<!--
 * @Date: 2025-04-27 19:40:11
 * @Description: UI1-Q客制化登录
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
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
        <div class="login-content">
            <el-form
                ref="formRef"
                :rules="rules"
                :model="formData"
                :style="{
                    '--form-label-width': '100px',
                    '--form-input-width': '250px',
                }"
            >
                <el-form-item
                    :label="Translate('IDCS_NAME')"
                    prop="userName"
                >
                    <el-input
                        v-model="formData.userName"
                        :placeholder="Translate('IDCS_USERNAME_TIP')"
                        type="text"
                        tabindex="1"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_PASSWORD')"
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
                <el-form-item
                    :label="Translate('IDCS_LANGUAGE')"
                    class="no-padding"
                >
                    <el-select-v2
                        v-model="pageData.langId"
                        :options="pageData.langTypes"
                        @change="changeLang"
                    />
                </el-form-item>
                <el-form-item
                    label=" "
                    class="no-padding"
                >
                    <el-select-v2
                        v-show="calendarOptions.length"
                        v-model="formData.calendarType"
                        :options="calendarOptions"
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

<script lang="ts" src="@/views/UI_PUBLIC/page/Login.v.ts"></script>

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
    width: 693px;
    height: 236px;
    background-image: var(--img-login-content);
    background-color: var(--login-content-bg, var(--main-bg));
    background-position: center top;
    background-repeat: no-repeat;
    padding-inline: 10px;
    border: 1px solid var(--color-white);

    #n9web & {
        :deep(.el-form) {
            margin-top: 5px;
            position: relative;
        }

        .el-form {
            padding-left: 370px;
        }

        .el-input,
        .el-select {
            height: 30px;
        }

        :deep(.el-select__wrapper) {
            height: 30px;
        }

        :deep(.el-form-item__label) {
            color: var(--color-white);
        }

        :deep(.el-form-item) {
            padding-inline: 0;
        }

        .login-submit {
            --el-button-border-color: transparent;
            --el-button-hover-border-color: transparent;
            --el-button-active-border-color: transparent;
            --el-button-text-color: var(--login-btn-text);
            --el-button-hover-text-color: var(--login-btn-text);

            width: 325px;
            height: 50px;
            font-size: 18px;
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
        padding: 2px 0;

        #n9web & .el-button {
            padding: 0;
            min-width: unset;
            text-decoration: underline;
            color: var(--color-white);
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
