<!--
 * @Date: 2025-05-10 13:20:23
 * @Description: IP Speaker - 编辑弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_XXX').formatForLang(Translate('IDCS_IPSPEAKER'))"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                :label="Translate('IDCS_IPV4')"
                prop="ip"
            >
                <el-input
                    v-model="formData.devName"
                    maxlength="64"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_IPV4')"
                prop="ip"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-select-v2
                    v-model="formData.protocolType"
                    :options="pageData.protocolTypeOptions"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PORT')"
                prop="port"
            >
                <BaseNumberInput
                    v-model="formData.port"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USERNAME')">
                <el-input
                    v-model="formData.userName"
                    maxlength="64"
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    <div class="base-label-box">
                        <span>{{ Translate('IDCS_PASSWORD') }}</span>
                        <el-checkbox v-model="formData.defaultPwd" />
                    </div>
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="64"
                    :disabled="!formData.defaultPwd"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_IPSPEAKER_ASSOCIATION')">
                <el-select-v2
                    v-model="formData.associatedDeviceID"
                    :options="pageData.devList"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelIpSpeakerEditPop.v.ts"></script>
