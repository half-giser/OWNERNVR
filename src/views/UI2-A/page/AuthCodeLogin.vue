<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:37:52
 * @Description: UI2-A客制化 登录
-->
<template>
    <div class="authCodeLogin">
        <div class="authCodeLogin-lang">
            <el-select-v2
                v-model="pageData.langId"
                :options="lang.langTypes.value"
                :props="{
                    label: 'name',
                    value: 'id',
                }"
                @change="changeLang"
            />
            <el-select-v2
                v-show="pageData.calendarOptions.length"
                v-model="formData.calendarType"
                :options="pageData.calendarOptions"
            />
        </div>
        <div class="authCodeLogin-main">
            <div class="authCodeLogin-logo"></div>
            <div class="authCodeLogin-content">
                <el-form
                    ref="formRef"
                    :rules="rules"
                    :model="formData"
                >
                    <el-form-item prop="sn">
                        <div class="authCodeLogin-item disabled">
                            <div class="authCodeLogin-icon icon-sn"></div>
                            <div class="authCodeLogin-input">
                                <el-input
                                    v-model="formData.sn"
                                    type="text"
                                    tabindex="1"
                                    size="large"
                                    disabled
                                />
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item prop="code">
                        <div class="authCodeLogin-item">
                            <div class="authCodeLogin-icon icon-code"></div>
                            <div class="authCodeLogin-input">
                                <el-input
                                    v-model="formData.code"
                                    :placeholder="`${Translate('IDCS_AUTHCODE_TIP')} ${pageData.authCodeIndex}`"
                                    tabindex="2"
                                    size="large"
                                    type="password"
                                    @paste.capture.prevent=""
                                    @copy.capture.prevent=""
                                />
                            </div>
                            <div class="authCodeLogin-btns">
                                <el-button
                                    v-show="pageData.expireTime <= 0"
                                    class="authCodeLogin-obtain"
                                    link
                                    :disabled="pageData.authCodeDisabled"
                                    @click="getAuthCode"
                                    >{{ Translate('IDCS_OBTAIN') }}</el-button
                                >
                                <div
                                    v-show="pageData.expireTime > 0"
                                    class="authCodeLogin-expiretime"
                                >
                                    {{ expireTime }}
                                </div>
                                <el-tooltip :content="Translate('IDCS_AUTHCODE_RECV_TIP')">
                                    <div
                                        v-show="pageData.expireTime > 0"
                                        class="authCodeLogin-question"
                                    ></div>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            class="authCodeLogin-submit"
                            size="large"
                            :disabled="pageData.btnDisabled"
                            @click="verify"
                            @keyup.enter="verify"
                        >
                            {{ Translate('IDCS_LOGIN_NBSP') }}
                        </el-button>
                    </el-form-item>
                    <div
                        class="authCodeLogin-error"
                        v-text="pageData.errorMsg"
                    ></div>
                </el-form>
            </div>
        </div>
        <!-- <div class="authCodeLogin-footer">
            <p>{{ pageData.copyright }}</p>
            <a
                v-if="pageData.icp"
                href="https://beian.miit.gov.cn/"
                target="_blank"
                ><p>{{ pageData.icp }}</p></a
            >
        </div> -->
    </div>
</template>

<script lang="ts" src="@/views/UI_PUBLIC/page/AuthCodeLogin.v.ts"></script>

<style lang="scss" scoped>
.authCodeLogin {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--authcode-bg);
}

.authCodeLogin-main {
    width: 100%;
    height: 467px;
    background-color: var(--authcode-content-bg);
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

.authCodeLogin-item {
    position: relative;
    width: 290px;
    height: 50px;
    font-size: 16px;
    border: 1px solid var(--color-black);
    display: flex;
    background-color: var(--input-bg);

    &.disabled {
        background-color: var(--authcode-input-bg-disabled);
    }
}

.authCodeLogin-icon {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 100%;
    flex-shrink: 0;
    background: var(--img-authcodelogin-icon);
    border-right: 1px solid var(--color-black);

    &.icon-code {
        background-position: 0 -134px;
    }
}

.authCodeLogin-input {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.authCodeLogin-logo {
    width: 693px;
    height: 36px;
    margin-bottom: 20px;
    background-image: var(--img-login-logo);
    background-position: center left;
    background-repeat: no-repeat;
}

.authCodeLogin-content {
    position: relative;
    width: 713px;
    height: 262px;
    background: no-repeat var(--img-authcodelogin-content);
    background-position: center center;
    background-repeat: no-repeat;
    background-color: var(--authcode-content-bg, var(--main-bg));
    padding-inline: 10px;

    #n9web & {
        .el-form {
            margin-top: 30px;
            margin-left: 400px;
        }

        .el-input {
            --el-disabled-text-color: var(--authcode-input-text-disabled);

            width: 240px;

            :deep(.el-input__wrapper) {
                background: transparent;
            }
        }

        :deep(.el-input__wrapper) {
            box-shadow: none;
        }

        .el-form-item {
            margin-bottom: 30px;
            padding: 0;
            font-size: 16px;
        }

        :deep(.el-form-item__error) {
            margin: 2px 0 0 55px;
        }

        .authCodeLogin-submit {
            --el-button-border-color: transparent;
            --el-button-hover-border-color: transparent;
            --el-button-active-border-color: transparent;
            --el-button-text-color: var(--authcode-btn-text);
            --el-button-hover-text-color: var(--authcode-btn-text);

            width: 290px;
            height: 50px;
            font-size: 18px;
            transition: none;
            background: var(--img-login-btn);

            &:hover {
                background-position: 0 -50px;
            }
        }
    }
}

.authCodeLogin-btns {
    position: absolute;
    height: 100%;
    width: 200px;
    display: flex;
    left: 300px;
    align-items: center;

    .el-button.is-link {
        margin-left: 10px;
        font-size: 18px;
        color: var(--primary);

        &:hover {
            color: var(--primary);
            opacity: 0.8;
        }
    }
}

.authCodeLogin-lang {
    position: absolute;
    top: 20px;
    right: 30px;
    width: 180px;

    .el-select {
        margin-bottom: 10px;
    }
}

.authCodeLogin-error {
    position: absolute;
    top: calc(100% + 20px);
    left: 20px;
    color: var(--color-error);
}

// .authCodeLogin-footer {
//     position: absolute;
//     left: 0;
//     bottom: 10px;
//     width: 100%;
//     color: var(--header-menu-text);

//     p {
//         width: 100%;
//         margin: 0;
//         padding: 0;
//         text-align: center;
//         font-size: 13px;
//     }

//     a {
//         color: var(--primary);
//     }
// }
</style>
