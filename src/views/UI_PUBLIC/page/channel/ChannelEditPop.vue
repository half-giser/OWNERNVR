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
            <el-form-item :label="Translate('IDCS_CHANNEL_NO')">
                <el-input
                    v-model="formData.chlNum"
                    disabled
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CHANNEL_NAME')"
                prop="name"
            >
                <BaseTextInput
                    v-model="formData.name"
                    :maxlength="formData.nameMaxByteLen"
                />
            </el-form-item>
            <el-form-item
                v-if="ipType === 'IPV4'"
                label="IPV4"
                prop="ip"
            >
                <BaseIpInput
                    v-model="formData.ip"
                    :disabled="ipDisabled"
                />
            </el-form-item>
            <el-form-item
                v-if="ipType === 'IPV6'"
                label="IPV6"
                prop="ip"
            >
                <el-input
                    v-model="formData.ip"
                    :placeholder="Translate('IDCS_INPUT_IPV6_ADDRESS_TIP')"
                    :disabled="ipDisabled"
                />
            </el-form-item>
            <el-form-item
                v-if="ipType === 'domain'"
                :label="Translate('IDCS_DOMAIN')"
                prop="ip"
            >
                <el-input
                    v-model="formData.ip"
                    :placeholder="Translate('IDCS_DOMAIN_TIP')"
                    :disabled="ipDisabled"
                />
            </el-form-item>
            <el-form-item
                v-if="rowData.autoReportID"
                :label="Translate('IDCS_SUB_DEVICE_ID')"
            >
                <el-input
                    v-model="formData.autoReportID"
                    :formatter="formatDigit"
                    :parser="formatDigit"
                    :disabled="rowData.isOnline"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_REMOTE_CHANNEL_NUMBER')">
                <el-input
                    v-model="formData.chlIndex"
                    disabled
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PORT')">
                <el-input
                    v-if="portDisabled"
                    :model-value="rowData.autoReportID ? '--' : formData.port < 10 ? '' : formData.port"
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
                <BaseTextInput
                    v-model="formData.userName"
                    :maxlength="formData.userNameMaxByteLen"
                    :disabled="rowData.isOnline || !formData.port"
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    <div class="base-label-box">
                        <span>{{ Translate('IDCS_PASSWORD') }}</span>
                        <el-checkbox
                            v-model="editPwdSwitch"
                            :disabled="rowData.isOnline || !formData.port"
                        />
                    </div>
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
