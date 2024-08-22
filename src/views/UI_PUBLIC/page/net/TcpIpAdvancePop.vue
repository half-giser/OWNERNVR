<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 18:58:43
 * @Description: TCP/IP高级配置弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-20 11:11:55
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADVANCE_TCPIP')"
        width="500"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
            label-position="left"
            :style="{
                '--form-label-width': '100px',
            }"
        >
            <el-form-item v-show="formData.mtu.length === 1">
                <el-checkbox
                    v-model="formData.secondIpSwitch"
                    :disabled="formData.dhcpSwitch"
                    >{{ Translate('IDCS_ENABLE_SECOND_IP') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item
                v-show="formData.mtu.length === 1"
                :label="Translate('IDCS_IP_ADDRESS')"
                prop="secondIp"
            >
                <BaseIpInput
                    v-model:value="formData.secondIp"
                    :disable="!formData.secondIpSwitch"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.mtu.length === 1"
                :label="Translate('IDCS_SUBNET_MASK')"
                prop="secondMask"
            >
                <BaseIpInput
                    v-model:value="formData.secondMask"
                    :disable="!formData.secondIpSwitch"
                />
            </el-form-item>
            <template
                v-for="(mtu, index) in formData.mtu"
                :key="index"
            >
                <div
                    v-show="formData.mtu.length > 1"
                    class="base-subheading-box"
                >
                    {{ displayTitle(index) }}
                </div>
                <el-form-item :label="Translate('IDCS_MTU')">
                    <el-input-number
                        v-model="formData.mtu[index]"
                        :min="1280"
                        :max="1500"
                        :controls="false"
                    />
                </el-form-item>
            </template>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./TcpIpAdvancePop.v.ts"></script>
