<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:37:52
 * @Description: UI-D客制化 登录
-->
<template>
    <div
        class="login"
        :style="{ opacity }"
    >
        <div class="login-lang">
            <el-select-v2
                v-model="pageData.langId"
                :options="pageData.langTypes"
                @change="changeLang"
            />
            <el-select-v2
                v-show="calendarOptions.length"
                v-model="formData.calendarType"
                :options="calendarOptions"
            />
        </div>
        <div class="login-content">
            <el-form
                ref="formRef"
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
                <el-form-item prop="password">
                    <BasePasswordInput
                        v-model="formData.password"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        tabindex="2"
                        @keyup.enter="keyUp"
                    />
                </el-form-item>
                <div class="login-other">
                    <el-radio-group
                        v-model="pageData.quality"
                        class="line-break"
                    >
                        <el-radio
                            v-for="item in qualityOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                    <el-button
                        link
                        @click="forgetPassword"
                    >
                        {{ Translate('IDCS_FORGOT_PASSWORD') }}
                    </el-button>
                </div>
                <div class="login-btns">
                    <el-button
                        class="login-submit"
                        :disabled="btnDisabled"
                        @click="handleLogin"
                        @keyup.enter="keyUp"
                    >
                        <span v-clean-html="Translate('IDCS_LOGIN_NBSP')"></span>
                    </el-button>
                    <!-- 点击不会有任何作用 -->
                    <el-button class="login-submit">
                        {{ Translate('IDCS_CANCEL') }}
                    </el-button>
                </div>
            </el-form>
            <div
                class="login-error"
                v-text="errorMsg"
            ></div>
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
    background-color: var(--main-bg);
}

.login-content {
    position: relative;
    width: 790px;
    height: 320px;
    background: no-repeat var(--img-login-content);

    #n9web & {
        :deep(.el-form) {
            margin-top: 53px;
        }

        .el-input {
            width: 313px;
            height: 42px;
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
            margin: 0 0 0 419px;
            font-size: 16px;
            padding: 0 0 22px;
        }

        :deep(.el-radio-group) {
            // padding-left: 367px;
            // width: 365px;
            font-size: 18px;
            // padding-bottom: 22px;
        }

        .login-submit {
            --el-button-border-color: transparent;
            --el-button-hover-border-color: transparent;
            --el-button-active-border-color: transparent;
            --el-button-text-color: var(--login-btn-text);
            --el-button-hover-text-color: var(--login-btn-text);

            width: 150px;
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
}

.login-btns {
    padding-left: 367px;
    width: 365px;
    display: flex;
    justify-content: space-between;
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
    position: relative;
    margin: 50px 0 0 365px;
    color: var(--color-error);
}

.login-other {
    width: 365px;
    margin-left: 365px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: -10px;
    margin-bottom: 10px;

    #n9web & .el-button {
        padding: 0;
        min-width: unset;
        text-decoration: underline;
    }
}
</style>
