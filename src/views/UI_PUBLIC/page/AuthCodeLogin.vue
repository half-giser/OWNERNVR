<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-20 09:10:11
 * @Description: P2P授权码登录
-->
<template>
    <div class="authCodeLogin">
        <div class="authCodeLogin-bg"></div>
        <div class="authCodeLogin-mask"></div>
        <div class="authCodeLogin-main">
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
                                <BasePasswordInput
                                    v-model="formData.code"
                                    :placeholder="`${Translate('IDCS_AUTHCODE_TIP')} ${pageData.authCodeIndex}`"
                                    tabindex="2"
                                    size="large"
                                    @keyup.enter="verify"
                                />
                            </div>
                            <div class="authCodeLogin-btns">
                                <el-button
                                    v-show="pageData.expireTime <= 0"
                                    class="authCodeLogin-obtain"
                                    link
                                    :disabled="pageData.authCodeDisabled"
                                    @click="getAuthCode"
                                >
                                    {{ Translate('IDCS_OBTAIN') }}
                                </el-button>
                                <div
                                    v-show="pageData.expireTime > 0"
                                    class="authCodeLogin-expiretime"
                                >
                                    {{ expireTime }}
                                </div>
                                <div
                                    v-show="pageData.expireTime > 0"
                                    :title="Translate('IDCS_AUTHCODE_RECV_TIP')"
                                    class="authCodeLogin-question"
                                ></div>
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
                            <span v-clean-html="Translate('IDCS_LOGIN_NBSP')"></span>
                        </el-button>
                    </el-form-item>
                    <div
                        class="authCodeLogin-error"
                        v-text="pageData.errorMsg"
                    ></div>
                </el-form>
            </div>
            <div class="authCodeLogin-lang">
                <BaseSelect
                    v-model="pageData.langId"
                    :options="lang.langTypes"
                    :props="{
                        label: 'name',
                        value: 'id',
                    }"
                    append-to=".authCodeLogin"
                    @change="changeLang"
                />
                <BaseSelect
                    v-show="pageData.calendarOptions.length"
                    v-model="formData.calendarType"
                    :options="pageData.calendarOptions"
                    append-to=".authCodeLogin"
                />
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
    </div>
</template>

<script lang="ts" src="./AuthCodeLogin.v.ts"></script>

<style lang="scss" scoped>
@use '@/scss/function' as *;

.authCodeLogin {
    #n9web.css_use114 & {
        --primary: #1fb1a5;
        --primary-light: #1fb1a5b5;
    }

    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: var(--authcode-bg);

    &-lang {
        position: absolute;
        top: 10px;
        right: 15px;
        width: 180px;

        .el-select {
            margin-bottom: 10px;
        }
    }

    &-bg {
        background: var(--img-authcodelogin-bg) no-repeat;
        background-size: 100% 100%;
        height: 467px;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -233px;
    }

    &-mask {
        background: var(--img-authcodelogin-mask) no-repeat;
        background-size: 100% 100%;
        height: 318px;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -159px;
    }
}

.authCodeLogin-main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.authCodeLogin-item {
    position: relative;
    width: 290px;
    height: 50px;
    font-size: 16px;
    border: 1px solid var(--color-black);
    display: flex;
    background-color: #fff; // var(--input-bg);

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
    background-position: -1px -1px;
    background-repeat: no-repeat;

    .css_use114 & {
        background-position: 4px 10px;
    }

    &.icon-code {
        background-position: 0 -130px;

        .css_use114 & {
            background-position: 5px -118px;
        }
    }
}

.authCodeLogin-input {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.authCodeLogin-content {
    position: relative;
    width: 693px;
    height: 262px;
    background: no-repeat var(--img-authcodelogin-content);
    background-position: center center;
    background-repeat: no-repeat;
    background-color: var(--authcode-content-bg);
    padding-inline: 10px;

    #n9web & {
        .el-form {
            margin-top: 30px;
            margin-left: 390px;
        }

        .el-input {
            --el-disabled-text-color: var(--authcode-input-text-disabled);

            width: 240px;

            :deep(.el-input__wrapper) {
                background: transparent;
            }

            :deep(.el-input__inner) {
                color: var(--authcode-input-text);
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
            height: 49px;
            font-size: 18px;
            transition: none;
            background: var(--img-authcodelogin-btn);

            &:hover {
                background-position: 0 -51px;
            }

            &.is-disabled {
                background-position: 0 -151px;
            }
        }
    }
}

.authCodeLogin-btns {
    position: absolute;
    height: 100%;
    width: 200px;
    display: flex;
    align-items: center;

    @if $GLOBAL_UI_TYPE == UI1-E {
        left: 310px;
    } @else {
        left: 300px;
    }

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

.authCodeLogin-question {
    width: 20px;
    height: 20px;
    background: var(--img-authcodelogin-question);
    margin-left: 10px;
}

.authCodeLogin-expiretime {
    font-size: 18px;
    color: var(--primary);
}

.authCodeLogin-error {
    position: absolute;
    color: var(--color-error);
    font-size: 18px;

    @if $GLOBAL_UI_TYPE == UI1-E {
        top: calc(100% + 30px);
        left: 0;
    } @else {
        top: calc(100% - 5px);
        left: 400px;
    }
}
</style>
