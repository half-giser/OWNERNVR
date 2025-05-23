<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:07:36
 * @Description: 端口
-->
<template>
    <div>
        <!-- 端口 -->
        <el-form
            ref="portFormRef"
            v-title
            :model="portFormData"
            :rules="portFormRule"
            class="stripe"
        >
            <div class="base-head-box">{{ Translate('IDCS_PORT') }}</div>
            <el-form-item
                :label="Translate('IDCS_HTTP_PORT')"
                prop="httpPort"
            >
                <BaseNumberInput
                    v-model="portFormData.httpPort"
                    :min="10"
                    :max="65535"
                    :disabled="pageData.wirelessSwitch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_HTTPS_PORT')"
                prop="httpsPort"
            >
                <BaseNumberInput
                    v-model="portFormData.httpsPort"
                    :min="10"
                    :max="65535"
                    :disabled="pageData.wirelessSwitch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SERVE_PORT')"
                prop="netPort"
            >
                <BaseNumberInput
                    v-model="portFormData.netPort"
                    :min="10"
                    :max="65535"
                    :disabled="pageData.wirelessSwitch"
                />
            </el-form-item>
            <el-form-item
                v-show="pageData.isPosPort"
                :label="Translate('IDCS_POS_PORT')"
                prop="posPort"
            >
                <BaseNumberInput
                    v-model="portFormData.posPort"
                    :min="10"
                    :max="65535"
                    :disabled="pageData.wirelessSwitch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_AUTO_REPORT_PORT')"
                prop="autoReportPort"
            >
                <BaseNumberInput
                    v-model="portFormData.autoReportPort"
                    :min="10"
                    :max="65535"
                    :disabled="pageData.wirelessSwitch"
                />
            </el-form-item>
            <!-- <el-form-item v-show="pageData.isVirtualPortEnabled">
                <el-checkbox :label="Translate('IDCS_VIRTUAL_HOST')" />
            </el-form-item> -->
        </el-form>
        <!-- API SERVER -->
        <el-form
            v-show="!pageData.isAppServer"
            class="stripe"
        >
            <div class="base-head-box">{{ Translate('IDCS_API_SERVER') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="apiServerFormData.apiserverSwitch"
                    :disabled="pageData.wirelessSwitch"
                    :label="Translate('IDCS_ENABLE')"
                    @change="changeApiServerSwitch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ENCRYPTION_TYPE')">
                <el-select-v2
                    v-model="apiServerFormData.authenticationType"
                    :disabled="!apiServerFormData.apiserverSwitch || pageData.wirelessSwitch"
                    :options="pageData.apiVerificationOptions"
                />
            </el-form-item>
        </el-form>
        <!-- RTSP -->
        <el-form
            ref="rtspServerFormRef"
            :model="rtspServerFormData"
            :rules="rtspServerFormRule"
            class="stripe"
        >
            <div
                v-show="!pageData.isAppServer"
                class="base-head-box"
            >
                {{ Translate('IDCS_RTSP') }}
            </div>
            <el-form-item v-show="!pageData.isAppServer">
                <el-checkbox
                    v-model="rtspServerFormData.rtspServerSwitch"
                    :disabled="pageData.wirelessSwitch"
                    :label="Translate('IDCS_ENABLE')"
                    @change="changeRtspServerSwitch"
                />
            </el-form-item>
            <el-form-item
                v-show="!pageData.isAppServer"
                :label="Translate('IDCS_ENCRYPTION_TYPE')"
            >
                <el-select-v2
                    v-model="rtspServerFormData.rtspAuthType"
                    :disabled="!rtspServerFormData.rtspServerSwitch || pageData.wirelessSwitch"
                    :options="pageData.rtspAuthenticationOptions"
                />
            </el-form-item>
            <el-form-item
                prop="rtspPort"
                :label="Translate('IDCS_RTSP_PORT')"
            >
                <BaseNumberInput
                    v-model="rtspServerFormData.rtspPort"
                    :disabled="!rtspServerFormData.rtspServerSwitch || pageData.wirelessSwitch"
                    :min="10"
                    :max="65535"
                />
                <el-checkbox
                    v-model="rtspServerFormData.anonymousAccess"
                    :disabled="!rtspServerFormData.rtspServerSwitch || pageData.wirelessSwitch"
                    :label="Translate('IDCS_RTSP_ANONYMOUS_ACCESS')"
                    @change="changeAnonymous"
                />
            </el-form-item>
            <el-form-item
                prop="rtspPort"
                :label="Translate('IDCS_RTSP_URLEXAMPLE')"
            >
                rtsp://IP:Port/chID=1&streamType=main
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.wirelessSwitch || (watchEditPortForm.disabled.value && watchEditRtspServerForm.disabled.value && watchEditApiServerForm.disabled.value)"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./Port.v.ts"></script>
