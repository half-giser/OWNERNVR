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
            :model="portFormData"
            :rules="portFormRule"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
            inline-message
        >
            <div class="base-subheading-box">{{ Translate('IDCS_PORT') }}</div>
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
            <el-form-item v-show="pageData.isVirtualPortEnabled">
                <el-checkbox :label="Translate('IDCS_VIRTUAL_HOST')" />
            </el-form-item>
        </el-form>
        <!-- API SERVER -->
        <el-form
            v-show="!pageData.isAppServer"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
            inline-message
        >
            <div class="base-subheading-box">{{ Translate('IDCS_API_SERVER') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="apiServerFormData.apiserverSwitch"
                    :disabled="pageData.wirelessSwitch"
                    :label="Translate('IDCS_API_SERVER')"
                    @change="changeApiServerSwitch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ENCRYPTION_TYPE')">
                <el-select
                    v-model="apiServerFormData.authenticationType"
                    :disabled="!apiServerFormData.apiserverSwitch || pageData.wirelessSwitch"
                >
                    <el-option
                        v-for="item in pageData.apiVerificationOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <!-- RTSP -->
        <el-form
            ref="rtspServerFormRef"
            :model="rtspServerFormData"
            :rules="rtspServerFormRule"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
            inline-message
        >
            <div
                v-show="!pageData.isAppServer"
                class="base-subheading-box"
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
                <el-select
                    v-model="rtspServerFormData.rtspAuthType"
                    :disabled="!rtspServerFormData.rtspServerSwitch || pageData.wirelessSwitch"
                >
                    <el-option
                        v-for="item in pageData.rtspAuthenticationOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                prop="rtspPort"
                :model="rtspServerFormData"
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
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.wirelessSwitch"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./Port.v.ts"></script>
