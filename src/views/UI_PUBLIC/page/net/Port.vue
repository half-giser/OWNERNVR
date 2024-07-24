<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:07:36
 * @Description: 端口
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 14:20:29
-->
<template>
    <div>
        <!-- 端口 -->
        <el-form
            ref="portFormRef"
            :model="portFormData"
            :rules="portFormRule"
            :style="{
                '--form-input-width': '200px',
            }"
            class="stripe"
            label-position="left"
            inline-message
        >
            <div class="base-subheading-box">{{ Translate('IDCS_PORT') }}</div>
            <el-form-item
                :label="Translate('IDCS_HTTP_PORT')"
                prop="httpPort"
            >
                <el-input-number
                    v-model="portFormData.httpPort"
                    :min="10"
                    :max="65535"
                    :controls="false"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_HTTPS_PORT')"
                prop="httpsPort"
            >
                <el-input-number
                    v-model="portFormData.httpsPort"
                    :min="10"
                    :max="65535"
                    :controls="false"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SERVE_PORT')"
                prop="netPort"
            >
                <el-input-number
                    v-model="portFormData.netPort"
                    :min="10"
                    :max="65535"
                    :controls="false"
                />
            </el-form-item>
            <el-form-item
                v-show="pageData.isPosPort"
                :label="Translate('IDCS_POS_PORT')"
                prop="posPort"
            >
                <el-input-number
                    v-model="portFormData.posPort"
                    :min="10"
                    :max="65535"
                    :controls="false"
                />
            </el-form-item>
            <el-form-item v-show="pageData.isVirtualPortEnabled">
                <el-checkbox>{{ Translate('IDCS_VIRTUAL_HOST') }}</el-checkbox>
            </el-form-item>
        </el-form>
        <!-- API SERVER -->
        <el-form
            v-show="!pageData.isUse44"
            label-position="left"
            class="stripe"
            :style="{
                '--form-input-width': '200px',
            }"
            inline-message
        >
            <div class="base-subheading-box">{{ Translate('IDCS_API_SERVER') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="apiServerFormData.apiserverSwitch"
                    @change="changeApiServerSwitch"
                    >{{ Translate('IDCS_API_SERVER') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ENCRYPTION_TYPE')">
                <el-select
                    v-model="apiServerFormData.authenticationType"
                    :disabled="!apiServerFormData.apiserverSwitch"
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
            class="stripe"
            :style="{
                '--form-input-width': '200px',
            }"
            label-position="left"
            inline-message
        >
            <div
                v-show="!pageData.isUse44"
                class="base-subheading-box"
            >
                {{ Translate('IDCS_RTSP') }}
            </div>
            <el-form-item v-show="!pageData.isUse44">
                <el-checkbox
                    v-model="rtspServerFormData.rtspServerSwitch"
                    @change="changeRtspServerSwitch"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item
                v-show="!pageData.isUse44"
                :label="Translate('IDCS_ENCRYPTION_TYPE')"
            >
                <el-select
                    v-model="rtspServerFormData.rtspAuthType"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
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
                <el-input-number
                    v-model="rtspServerFormData.rtspPort"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                    :min="10"
                    :max="65535"
                    :controls="false"
                />
                <el-checkbox
                    v-model="rtspServerFormData.anonymousAccess"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                    @change="changeAnonymous"
                    >{{ Translate('IDCS_RTSP_ANONYMOUS_ACCESS') }}</el-checkbox
                >
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./Port.v.ts"></script>
