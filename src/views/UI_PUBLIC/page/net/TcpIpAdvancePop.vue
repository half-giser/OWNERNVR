<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 18:58:43
 * @Description: TCP/IP高级配置弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADVANCE_TCPIP')"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :rules="formRule"
            :model="formData"
            :style="{
                '--form-label-width': '100px',
            }"
        >
            <el-form-item v-show="formData.mtu.length === 1">
                <el-checkbox
                    v-model="formData.secondIpSwitch"
                    :disabled="formData.dhcpSwitch"
                    :label="Translate('IDCS_ENABLE_SECOND_IP')"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.mtu.length === 1"
                :label="Translate('IDCS_IP_ADDRESS')"
                prop="secondIp"
            >
                <BaseIpInput
                    v-model="formData.secondIp"
                    :disabled="!formData.secondIpSwitch"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.mtu.length === 1"
                :label="Translate('IDCS_SUBNET_MASK')"
                prop="secondMask"
            >
                <BaseIpInput
                    v-model="formData.secondMask"
                    :disabled="!formData.secondIpSwitch"
                />
            </el-form-item>
            <template
                v-for="(_mtu, index) in formData.mtu"
                :key="index"
            >
                <div
                    v-show="formData.mtu.length > 1"
                    class="base-subheading-box"
                >
                    {{ displayTitle(index) }}
                </div>
                <el-form-item :label="Translate('IDCS_MTU')">
                    <BaseNumberInput
                        v-model="formData.mtu[index]"
                        :min="1280"
                        :max="1500"
                    />
                </el-form-item>
            </template>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./TcpIpAdvancePop.v.ts"></script>
