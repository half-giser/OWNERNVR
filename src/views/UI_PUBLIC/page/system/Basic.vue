<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 10:57:01
 * @Description: 设备基本信息
-->
<template>
    <div class="SystemBasic">
        <el-form class="stripe">
            <el-form-item :label="Translate('IDCS_DEVICE_NAME')">
                {{ formData.name }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DEVICE_NUMBER')">
                {{ formData.deviceNumber }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DEVICE_MODEL')">
                {{ formData.productModel }}
            </el-form-item>
            <!-- <el-form-item :label="Translate('IDCS_ANALOG_NUM')">
                {{ Translate('IDCS_ANALOG_NUM') }}
            </el-form-item :label="Translate('IDCS_IP_NUM')"> -->
            <!-- <el-form-item>
                {{ Translate('IDCS_IP_NUM') }}
            </el-form-item> -->
            <el-form-item :label="Translate('IDCS_VIDEO_FORMAT')">
                {{ formData.videoType }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ABOUT_THIS_MACHINE')">
                <el-button
                    link
                    @click="showAbout"
                >
                    {{ Translate('IDCS_VIEW') }}
                </el-button>
            </el-form-item>
            <el-form-item
                v-if="formData.showGDPR"
                :label="Translate('IDCS_PRIVACY')"
            >
                <el-button
                    link
                    @click="showPrivacy"
                >
                    {{ Translate('IDCS_VIEW') }}
                </el-button>
            </el-form-item>
            <el-form-item
                v-if="pageData.isShowOpenSourceLicence"
                :label="Translate('IDCS_OPEN_SOURCE_STATEMENT')"
            >
                <el-button
                    link
                    @click="showPrivacy"
                >
                    {{ Translate('IDCS_VIEW') }}
                </el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SECURITY_CODE')">
                <span class="security-code">{{ pageData.isShowSecurityCode ? formData.securityCode : '********' }}</span>
                <BaseImgSprite
                    file="icon_mask"
                    :index="pageData.isShowSecurityCode ? 0 : 2"
                    :hover-index="pageData.isShowSecurityCode ? 1 : 3"
                    :chunk="4"
                    @click="toggleSecurityCode"
                />
            </el-form-item>
            <el-form-item v-show="formData.showApp">
                {{ Translate('IDCS_DEVICE_SCAN_QRCODE_TIP') }}
            </el-form-item>
        </el-form>
        <!-- 二维码部分 -->
        <div
            v-show="formData.showApp"
            class="code"
        >
            <div>
                <div class="code-pic">
                    <img :src="pageData.snCode" />
                    <div
                        v-show="!formData.qrCodeContentIsEnabled"
                        class="code-cover"
                    ></div>
                    <div
                        v-show="!formData.qrCodeContentIsEnabled"
                        class="code-label"
                    >
                        {{ Translate('IDCS_NAT_DISABLE') }}
                    </div>
                </div>
                <p class="code-text">{{ Translate('txtSN') }}</p>
            </div>
            <div>
                <div class="code-pic">
                    <img :src="pageData.androidCode" />
                </div>
                <p class="code-text">{{ Translate('IDCS_ANDROID_DOWNLOAD_ADDR') }}</p>
            </div>
            <div>
                <div class="code-pic">
                    <img :src="pageData.iosCode" />
                </div>
                <p class="code-text">{{ Translate('IDCS_IOS_DOWNLOAD_ADDR') }}</p>
            </div>
        </div>
        <!-- 隐私政策弹窗 -->
        <LoginPrivacyPop
            v-model="pageData.isShowPrivacy"
            :force-allow="false"
            @close="pageData.isShowPrivacy = false"
        />
        <!-- 关于本机弹窗 -->
        <el-dialog
            v-model="pageData.isShowAbout"
            width="800"
            :title="Translate('IDCS_ABOUT_THIS_MACHINE')"
        >
            <el-form
                class="stripe"
                :style="{
                    '--form-label-width': '200px',
                }"
            >
                <el-form-item :label="Translate('IDCS_HARDWARE_VERSION')">
                    {{ formData.hardwareVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_MCU_VERSION')">
                    {{ formData.mcuVersion }}
                </el-form-item>
                <!--
                    NT2-3047 设备端返回的内核版本不为空，则显示该项
                    NLYC-1 设备端返回的内核版本为空，则不显示
                -->
                <el-form-item
                    v-if="formData.kenerlVersion"
                    :label="Translate('IDCS_KERNEL_VERSION')"
                >
                    {{ formData.kenerlVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FIRMWARE_VERSION')">
                    {{ formData.softwareVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_RELEASE_DATE')">
                    {{ formData.launchDate.split('.')[0] }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ONVIF_CLIENT_VERSION')">
                    {{ formData.onvifVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ONVIF_DEVICE_VERSION')">
                    {{ formData.onvifDevVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_OCX_VERSION')">
                    {{ formData.ocxVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_API_VERSION')">
                    {{ formData.apiVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PCBAV')">
                    {{ formData.PCBAV }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PN')">
                    {{ formData.PN }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PCUI')">
                    {{ formData.PCUI }}
                </el-form-item>
            </el-form>
            <div class="base-btn-box">
                <el-button @click="pageData.isShowAbout = false">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-dialog>
        <!-- 开源信息弹窗 -->
        <el-dialog
            v-model="pageData.isLicencePop"
            width="800"
            :title="Translate('IDCS_OPEN_SOURCE_STATEMENT')"
            :show-close="false"
        >
            <div>
                <el-input
                    type="textarea"
                    :readonly="true"
                    :model-value="Translate('IDCS_OPEN_SOURCE_LICENSE_TEXT')"
                />
            </div>
            <div class="base-btn-box space-between">
                <el-button @click="pageData.isLicencePop = false">
                    {{ Translate('IDCS_OK') }}
                </el-button>
            </div>
        </el-dialog>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="getSecurityCode"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./Basic.v.ts"></script>

<style lang="scss" scoped>
.security-code {
    margin-right: 10px;
}

.code {
    display: flex;
    flex-wrap: wrap;

    & > div {
        width: 230px;
        height: 230px;
        flex-shrink: 0;
        margin-left: 50px;
    }

    &-pic {
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;

        img {
            width: 100%;
            height: 100%;
        }
    }

    &-cover {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: var(--qrcode-bg);
        opacity: 0.95;
    }

    &-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: fit-content;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        background-color: var(--qrcode-label-bg);
    }

    &-text {
        margin-top: 10px;
        text-align: center;
        font-family: Consolas, Menlo, monospace;
    }
}
</style>
