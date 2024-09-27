<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 登录页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-26 17:37:28
-->
<template>
    <div class="login">
        <div class="login-lang">
            <el-select
                v-model="pageData.langId"
                @change="changeLang"
            >
                <el-option
                    v-for="(value, key) in pageData.langTypes"
                    :key="key"
                    :label="value"
                    :value="key"
                />
            </el-select>
            <el-select
                v-show="pageData.calendarOptions.length"
                v-model="formData.calendarType"
            >
                <el-option
                    v-for="item in pageData.calendarOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
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
                    >
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button
                        class="login-submit"
                        size="large"
                        :disabled="pageData.btnDisabled"
                        @click="handleLogin"
                        @keyup.enter="keyUp"
                    >
                        {{ Translate('IDCS_LOGIN_NBSP') }}
                    </el-button>
                </el-form-item>
            </el-form>
            <div
                class="login-error"
                v-text="pageData.errorMsg"
            ></div>
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
    background-color: var(--login-bg, var(--page-bg));
}

.login-content {
    position: relative;
    width: 713px;
    // height: 296px;
    background-image: var(--img-login-content);
    background-color: var(--login-content-bg, var(--page-bg));
    background-position: center top;
    background-repeat: no-repeat;
    padding-inline: 10px;

    #n9web & {
        :deep(.el-form) {
            margin-top: 13px;
        }

        .el-input {
            width: 264px;
            height: 50px;
        }

        :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: 0;
        }

        :deep(.el-form-item) {
            margin: 0 0px 0px 428px;
            font-size: 16px;
            padding: 0 0 28px 0;

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
            margin-left: -40px;
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
    top: 20px;
    right: 30px;
    width: 180px;

    .el-select {
        margin-bottom: 10px;
    }
}

.login-error {
    position: absolute;
    top: calc(100% + 30px);
    left: 405px;
    // margin: 30px 0px 0px 10px;
    color: var(--error--01);
}
</style>
