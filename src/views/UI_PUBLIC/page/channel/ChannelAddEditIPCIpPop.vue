<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-27 18:02:39
 * @Description: 添加通道 - 编辑IPC IP弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_IP')"
        width="450"
        @opened="opened"
        @closed="close"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules
            :style="{
                '--form-label-width': '160px',
            }"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_MAC_ADDRESS')">
                <el-input
                    v-model="formData.mac"
                    disabled
                />
            </el-form-item>
            <el-form-item
                prop="ip"
                :label="Translate('IDCS_ADDRESS')"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <el-form-item
                prop="mask"
                :label="Translate('IDCS_SUBNET_MASK')"
            >
                <BaseIpInput
                    v-model="formData.mask"
                    :disabled="maskDisabled"
                />
            </el-form-item>
            <el-form-item
                prop="gateway"
                :label="Translate('IDCS_GATEWAY')"
            >
                <BaseIpInput
                    v-model="formData.gateway"
                    :disabled="gatewayDisabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USERNAME')">
                <el-input
                    v-model="formData.userName"
                    disabled
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="16"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    :title="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddEditIPCIpPop.v.ts"></script>
