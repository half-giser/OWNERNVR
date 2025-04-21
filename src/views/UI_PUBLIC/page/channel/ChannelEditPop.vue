<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:17:55
 * @Description: 通道 - 编辑弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_IP_CAMERA')"
        width="450"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item
                :label="Translate('IDCS_CHANNEL_NAME')"
                prop="name"
            >
                <el-input
                    v-model="formData.name"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                />
            </el-form-item>
            <el-form-item
                :label="ipTitle"
                prop="ip"
            >
                <BaseIpInput
                    v-if="showIpInput"
                    v-model="formData.ip"
                    :disabled="ipDisabled"
                />
                <el-input
                    v-else
                    v-model="formData.ip"
                    :placeholder="ipPlaceholder"
                    :disabled="ipDisabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PORT')">
                <el-input
                    v-if="portDisabled"
                    :model-value="formData.port < 10 ? '' : formData.port"
                    disabled
                />
                <BaseNumberInput
                    v-else
                    v-model="formData.port"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-input
                    v-model="formData.manufacturer"
                    disabled
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PRODUCT_MODEL')">
                <el-input
                    v-model="formData.productModel.innerText"
                    disabled
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_USERNAME')"
                prop="userName"
            >
                <el-input
                    v-model="formData.userName"
                    :disabled="inputDisabled"
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    {{ Translate('IDCS_PASSWORD') }}
                    <el-checkbox
                        v-model="editPwdSwitch"
                        :disabled="inputDisabled"
                    />
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!editPwdSwitch"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save(false)">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelEditPop.v.ts"></script>
