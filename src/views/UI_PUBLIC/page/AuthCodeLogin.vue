<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-20 09:10:11
 * @Description: P2P授权码登录
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-20 16:47:44
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
                                <el-tooltip
                                    :content="Translate('IDCS_AUTHCODE_RECV_TIP')"
                                    :show-after="500"
                                >
                                    <div
                                        v-show="pageData.expireTime > 0"
                                        class="authCodeLogin-question"
                                    ></div>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-form-item>
                    <div>
                        <el-button
                            class="authCodeLogin-submit"
                            size="large"
                            :disabled="pageData.btnDisabled"
                            @click="verify"
                            @keyup.enter="verify"
                        >
                            {{ Translate('IDCS_LOGIN_NBSP') }}
                        </el-button>
                    </div>
                    <div
                        class="authCodeLogin-error"
                        v-text="pageData.errorMsg"
                    ></div>
                </el-form>
            </div>
            <el-select
                v-model="pageData.langId"
                class="authCodeLogin-lang"
                @change="changeLang"
            >
                <el-option
                    v-for="(item, key) in lang.langTypes.value"
                    :key="key"
                    :label="item.name"
                    :value="item.id"
                />
            </el-select>
            <div class="authCodeLogin-footer">
                <p>{{ pageData.copyright }}</p>
                <a
                    v-if="pageData.icp"
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    ><p>{{ pageData.icp }}</p></a
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./AuthCodeLogin.v.ts"></script>

<style lang="scss">
.authCodeLogin {
    position: relative;
    width: 100vw;
    height: 100vh;

    &-lang {
        position: absolute;
        top: 20px;
        right: 30px;
        width: 180px;
    }

    &-bg {
        background: url('/mainBg.png') no-repeat;
        background-size: 100% 100%;
        height: 467px;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -233px;
    }

    &-mask {
        background: url('/mainBgMask.png') no-repeat;
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
    width: 300px;
    height: 50px;
    // margin-bottom: 30px;
    font-size: 16px;
    border: 1px solid var(--border-color1);
    display: flex;
    background-color: var(--bg-color);

    &.disabled {
        background-color: var(--bg-button-disabled);
    }
}

.authCodeLogin-icon {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 100%;
    flex-shrink: 0;
    background: url('/loginIcon.png');
    border-right: 1px solid var(--border-color1);

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

.authCodeLogin-content {
    position: relative;
    width: 693px;
    height: 262px;
    background: no-repeat url('/AuthCodeLoginContent.png');

    #n9web & {
        .el-form {
            margin-top: 38px;
            margin-left: 400px;
        }

        .el-input {
            width: 240px;

            .el-input__wrapper {
                background: transparent;
            }
        }

        .el-input__wrapper {
            box-shadow: none;
        }

        .el-form-item {
            margin-bottom: 30px;
            padding: 0;
            font-size: 16px;
        }

        .el-form-item__error {
            margin: 2px 0px 0px 55px;
        }

        .authCodeLogin-submit {
            --el-button-border-color: var(--primary--04);
            --el-button-bg-color: var(--primary--03);
            --el-button-text-color: var(--page-bg);
            --el-button-hover-text-color: var(--page-bg);
            --el-button-hover-bg-color: var(--primary--02);
            --el-button-hover-border-color: var(--primary--03);
            --el-button-active-text-color: var(--page-bg);
            --el-button-active-border-color: var(--primary--05);
            --el-button-active-bg-color: var(--primary--04);

            width: 300px;
            height: 50px;
            font-size: 18px;
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
        color: var(--primary--04);
        &:hover {
            color: var(--primary--02);
        }
    }
}

.authCodeLogin-question {
    width: 20px;
    height: 20px;
    background: url(/question.png);
    margin-left: 10px;
}

.authCodeLogin-expiretime {
    font-size: 18px;
    color: var(--primary--04);
}

.authCodeLogin-footer {
    position: absolute;
    left: 0;
    bottom: 10px;
    width: 100%;
    color: var(--text-menu-01);

    p {
        width: 100%;
        margin: 0;
        padding: 0;
        text-align: center;
        font-size: 13px;
    }

    a {
        color: var(--primary--04);
    }
}

.authCodeLogin-error {
    position: relative;
    margin-top: 20px;
    color: var(--error--01);
    font-size: 18px;
}
</style>
