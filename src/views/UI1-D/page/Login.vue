<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:37:52
 * @Description: UI-D客制化 登录
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 10:29:22
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
                label-position="left"
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
                <el-radio-group v-model="pageData.quality">
                    <el-radio
                        v-for="item in pageData.qualityOptions"
                        :key="item.value"
                        size="large"
                        :value="item.value"
                        >{{ Translate(item.label) }}</el-radio
                    >
                </el-radio-group>
                <div
                    class="login-btns"
                    span="center"
                >
                    <el-button
                        class="login-submit"
                        size="large"
                        :disabled="pageData.btnDisabled"
                        @click="handleLogin"
                        @keyup.enter="keyUp"
                    >
                        {{ Translate('IDCS_LOGIN_NBSP') }}
                    </el-button>
                    <!-- 点击不会有任何作用 -->
                    <el-button
                        class="login-submit"
                        size="large"
                    >
                        {{ Translate('IDCS_CANCEL') }}
                    </el-button>
                </div>
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

<script lang="ts" src="@/views/UI_PUBLIC/page/Login.v.ts"></script>

<style lang="scss" scoped>
.login {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--page-bg);
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
        }

        :deep(.el-form-item) {
            margin: 0 0px 0px 419px;
            font-size: 16px;
            padding: 0 0 22px 0;
        }

        :deep(.el-radio-group) {
            padding-left: 367px;
            width: 365px;
            font-size: 18px;
            padding-bottom: 22px;
        }

        .login-submit {
            --el-button-border-color: var(--primary--04);
            --el-button-bg-color: var(--primary--04);
            --el-button-text-color: var(--text-button);
            --el-button-hover-text-color: var(--text-button);
            --el-button-hover-bg-color: var(--primary--04);
            --el-button-hover-border-color: var(--primary--04);
            --el-button-active-text-color: var(--text-button);
            --el-button-active-border-color: var(--primary--04);
            --el-button-active-bg-color: var(--primary--04);

            width: 150px;
            height: 50px;
            font-size: 18px;

            &:hover {
                filter: brightness(1.2);
            }

            &:active {
                filter: brightness(0.9);
            }
        }
    }
}

.login-btns {
    width: 313px;
    display: flex;
    padding-left: 367px;
    width: 365px;
    display: flex;
    justify-content: space-between;
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
    position: relative;
    margin: 30px 0px 0px 10px;
    color: var(--error--01);
}
</style>
