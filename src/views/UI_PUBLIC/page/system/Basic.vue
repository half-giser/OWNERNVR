<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 10:57:01
 * @Description: 设备基本信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-27 17:36:11
-->
<template>
    <div class="SystemBasic">
        <div class="stripe">
            <div>
                <span>{{ Translate('IDCS_DEVICE_NAME') }}</span>
                <span>{{ formData.name }}</span>
            </div>
            <div>
                <span>{{ Translate('IDCS_DEVICE_NUMBER') }}</span>
                <span>{{ formData.deviceNumber }}</span>
            </div>
            <div>
                <span>{{ Translate('IDCS_DEVICE_MODEL') }}</span>
                <span>{{ formData.productModel }}</span>
            </div>
            <!-- <div>
                <span>{{ Translate('IDCS_ANALOG_NUM') }}</span>
                <span></span>
            </div> -->
            <!-- <div>
                <span>{{ Translate('IDCS_IP_NUM') }}</span>
                <span></span>
            </div> -->
            <div>
                <span>{{ Translate('IDCS_VIDEO_FORMAT') }}</span>
                <span>{{ formData.videoType }}</span>
            </div>
            <div>
                <span>{{ Translate('IDCS_ABOUT_THIS_MACHINE') }}</span>
                <span>
                    <el-button @click="showAbout">{{ Translate('IDCS_VIEW') }}</el-button>
                </span>
            </div>
            <div v-if="formData.showGDPR">
                <span>{{ Translate('IDCS_PRIVACY') }}</span>
                <span>
                    <el-button @click="showPrivacy">{{ Translate('IDCS_VIEW') }}</el-button>
                </span>
            </div>
            <div v-show="formData.showApp">
                {{ Translate('IDCS_DEVICE_SCAN_QRCODE_TIP') }}
            </div>
        </div>
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
        <el-dialog
            v-model="pageData.isShowPrivacy"
            width="800"
            align-center
            draggable
            :title="Translate('IDCS_PRIVACY')"
            :modal="true"
        >
            <div>
                <textarea
                    class="privacyContent"
                    :readonly="true"
                    :value="Translate('IDCS_PRIVACY_TEXT')"
                >
                </textarea>
            </div>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="pageData.isShowPrivacy = false">{{ Translate('IDCS_OK') }}</el-button>
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
        <!-- 关于本机弹窗 -->
        <el-dialog
            v-model="pageData.isShowAbout"
            width="800"
            align-center
            draggable
            :title="Translate('IDCS_ABOUT_THIS_MACHINE')"
            :modal="true"
        >
            <div class="stripe">
                <div>
                    <span>{{ Translate('IDCS_HARDWARE_VERSION') }}</span>
                    <span>{{ formData.hardwareVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_MCU_VERSION') }}</span>
                    <span>{{ formData.mcuVersion }}</span>
                </div>
                <!--
                    NT2-3047 设备端返回的内核版本不为空，则显示该项
                    NLYC-1 设备端返回的内核版本为空，则不显示
                -->
                <div v-if="formData.kenerlVersion">
                    <span>{{ Translate('IDCS_KERNEL_VERSION') }}</span>
                    <span>{{ formData.kenerlVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_FIRMWARE_VERSION') }}</span>
                    <span>{{ formData.softwareVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_RELEASE_DATE') }}</span>
                    <span>{{ formData.launchDate.split('.')[0] }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_ONVIF_CLIENT_VERSION') }}</span>
                    <span>{{ formData.onvifVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_ONVIF_DEVICE_VERSION') }}</span>
                    <span>{{ formData.onvifDevVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_OCX_VERSION') }}</span>
                    <span>{{ formData.ocxVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_API_VERSION') }}</span>
                    <span>{{ formData.apiVersion }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_PCBAV') }}</span>
                    <span>{{ formData.PCBAV }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_PN') }}</span>
                    <span>{{ formData.PN }}</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_PCUI') }}</span>
                    <span>{{ formData.PCUI }}</span>
                </div>
            </div>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="pageData.isShowAbout = false">{{ Translate('IDCS_OK') }}</el-button>
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./Basic.v.ts"></script>

<style lang="scss" scoped>
.SystemBasic {
    width: 100%;
}

.stripe {
    width: 100%;

    & > div {
        padding: 5px 10px;
        height: 40px;
        line-height: 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        font-size: 15px;

        span {
            &:first-child {
                width: 200px;
                flex-shrink: 0;
            }
        }

        &:nth-child(even) {
            background-color: var(--bg-color5);
        }
    }
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
        background-color: #fff;
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
        background-color: #8f8d8d;
    }

    &-text {
        margin-top: 10px;
        text-align: center;
        font-family: Consolas, Menlo, 'Microsoft YaHei', Arial, Helvetica, sans-serif;
    }
}

.privacyContent {
    height: 350px;
    overflow: auto;
    width: 754px;
    resize: none;
    box-sizing: border-box;
    padding: 10px;
}
</style>
