<!--
 * @Date: 2025-05-04 16:02:54
 * @Description: 找回密码
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="forget-pwd">
        <div class="content">
            <div class="title">{{ Translate('IDCS_RESTORE_PASSWORD') }}</div>
            <!-- PRIVACY -->
            <div v-show="pageData.pageType === 'privacy'">
                <div class="box">
                    <div class="center">
                        <h2>{{ Translate('IDCS_PRIVACY') }}</h2>
                        <div>{{ Translate('IDCS_PRIVATE_POLICY_TEXT') }}</div>
                    </div>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="pageData.isPrivacyPop = true">{{ Translate('IDCS_PRIVATE_POLICY_GET') }}</el-button>
                    <el-button @click="handlePrivacyNext">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                </div>
            </div>
            <!-- UNSET -->
            <div v-show="pageData.pageType === 'no-setting'">
                <div class="box">
                    <div class="center">
                        <BaseImgSprite file="retrieve_caution" />
                        <h2>{{ Translate('IDCS_NOT_SECURITY_CFG') }}</h2>
                    </div>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                </div>
            </div>
            <!-- OFFLINE -->
            <div v-show="pageData.pageType === 'cloud-offline'">
                <div class="box">
                    <div class="center">
                        <h2>{{ Translate('IDCS_EMAIL_SEND_FAILED_TIP') }}</h2>
                    </div>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                </div>
            </div>
            <!-- CAPCHA -->
            <div v-show="pageData.pageType === 'email'">
                <div class="box">
                    <h3>{{ Translate('IDCS_SECURITY_EMAIL_TIP').formatForLang(pageData.email, 5 + Translate('IDCS_MINUTES')) }}</h3>
                    <el-form v-title>
                        <el-form-item :label="Translate('IDCS_EMAIL_ADDRESS')">
                            <el-input
                                v-model="formData.email"
                                :placeholder="Translate('IDCS_EMAIL_ADDRESS_INPUT').formatForLang(Translate('IDCS_EMAIL_ADDRESS'))"
                                maxlength="256"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_VERIFICATION_CODE')">
                            <el-input
                                v-model="formData.captcha"
                                :placeholder="Translate('IDCS_EMAIL_ADDRESS_INPUT').formatForLang(Translate('IDCS_VERIFICATION_CODE'))"
                                maxlength="16"
                                :formatter="formatCode"
                                :parser="formatCode"
                            />
                            <el-button
                                :disabled="pageData.captchaDisabled"
                                @click="getVerificationCode"
                            >
                                {{ pageData.captchaTime ? pageData.captchaTime : Translate('IDCS_SECURITY_CODE_GET') }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="base-btn-box padding">
                    <el-button
                        :disabled="!formData.captcha"
                        @click="handleEmailNext"
                        >{{ Translate('IDCS_NEXT_STEP') }}</el-button
                    >
                    <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                </div>
            </div>
            <!-- NEW PASSWORD -->
            <div v-show="pageData.pageType === 'new-password'">
                <div class="box">
                    <el-form
                        v-title
                        :style="{
                            '--form-input-width': '100%',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_NEW_PASSWORD')">
                            <BasePasswordInput
                                v-model="formData.password"
                                maxlength="16"
                                :placeholder="Translate('IDCS_PASSWORD_TIP')"
                            />
                        </el-form-item>
                        <el-form-item>
                            <BasePasswordStrength :strength />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')">
                            <BasePasswordInput
                                v-model="formData.confirmPassword"
                                maxlength="16"
                                :placeholder="Translate('IDCS_PASSWORD_TIP')"
                            />
                        </el-form-item>
                        <el-form-item>
                            <div
                                v-clean-html="noticeMsg"
                                class="notice base-rich-text"
                            ></div>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                </div>
            </div>
        </div>
        <LoginPrivacyPop
            v-model="pageData.isPrivacyPop"
            :force-allow="false"
            @close="pageData.isPrivacyPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ForgetPassword.v.ts"></script>

<style lang="scss" scoped>
.forget-pwd {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    .base-btn-box.padding {
        padding-inline: 20px;
    }
}

.content {
    position: relative;
    width: 744px;
    height: 380px;
    border: 1px solid var(--content-border);
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;

    & > div:not(.title) {
        width: 100%;
        height: 100%;
    }
}

.box {
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 40px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    h2 {
        font-size: 20px;
        text-align: center;
        font-weight: normal;
        margin: 0 0 20px;
    }

    h3 {
        font-size: 14px;
        font-weight: normal;
        margin: 0 0 20px;
    }

    .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .el-form {
        width: 450px;
    }
}

.title {
    height: 40px;
    line-height: 40px;
    width: 100%;
    text-align: center;
    font-size: 20px;
    background-color: var(--primary);
    color: var(--btn-text);
}
</style>
