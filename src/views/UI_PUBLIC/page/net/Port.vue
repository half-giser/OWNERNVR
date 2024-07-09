<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:07:36
 * @Description: 端口
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 19:44:31
-->
<template>
    <div class="Port">
        <!-- 端口 -->
        <el-form
            ref="portFormRef"
            class="form port"
            :model="portFormData"
            :rules="portFormRule"
            label-position="left"
        >
            <div class="title">{{ Translate('IDCS_PORT') }}</div>
            <el-form-item
                :label="Translate('IDCS_HTTP_PORT')"
                prop="httpPort"
            >
                <el-input-number
                    v-model="portFormData.httpPort"
                    :min="10"
                    :max="65535"
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
                />
            </el-form-item>
            <el-form-item v-show="pageData.isVirtualPortEnabled">
                <el-checkbox>{{ Translate('IDCS_VIRTUAL_HOST') }}</el-checkbox>
            </el-form-item>
        </el-form>
        <!-- API SERVER -->
        <el-form
            v-show="!pageData.isUse44"
            class="form api-server"
            label-position="left"
        >
            <div class="title">{{ Translate('IDCS_API_SERVER') }}</div>
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
            class="form rtsp"
            :model="rtspServerFormData"
            :rules="rtspServerFormRule"
            label-position="left"
        >
            <div
                v-show="!pageData.isUse44"
                class="title"
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
                />
                <el-checkbox
                    v-model="rtspServerFormData.anonymousAccess"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                    @change="changeAnonymous"
                    >{{ Translate('IDCS_RTSP_ANONYMOUS_ACCESS') }}</el-checkbox
                >
            </el-form-item>
        </el-form>
        <div class="btns">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./Port.v.ts"></script>

<style lang="scss" scoped>
.Port {
    .form {
        :deep(.el-form-item__label) {
            width: 150px;
        }

        .el-select,
        .el-input,
        .el-input-number {
            width: 200px;
            flex-shrink: 0;
            margin-right: 10px;
        }
    }

    .title {
        width: 100%;
        height: 35px;
        font-weight: bold;
        padding: 0 15px;
        margin-bottom: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 35px;
        background-color: var(--bg-color4);
        box-sizing: border-box;
        flex-shrink: 0;
    }

    .btns {
        margin-top: 15px;
        width: 450px;
        display: flex;
        justify-content: center;
    }
}
</style>
