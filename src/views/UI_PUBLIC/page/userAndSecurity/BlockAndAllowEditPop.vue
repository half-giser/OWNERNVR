<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 10:38:40
 * @Description: 编辑黑白名单弹窗
-->
<template>
    <el-dialog
        width="450"
        :title
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :rules
            :model="formData"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item v-if="formData.addressType !== 'mac'">
                <el-radio-group v-model="formData.addressType">
                    <el-radio
                        value="ip"
                        :label="Translate('IDCS_IP_WHOLE')"
                    />
                    <el-radio
                        value="iprange"
                        :label="Translate('IDCS_IP_SEGMENT')"
                    />
                </el-radio-group>
            </el-form-item>
            <el-form-item
                v-if="formData.addressType === 'ip'"
                prop="ip"
                :label="Translate('IDCS_IP_ADDRESS')"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <el-form-item
                v-if="formData.addressType === 'iprange'"
                prop="startIp"
                :label="Translate('IDCS_IP_START')"
            >
                <BaseIpInput v-model="formData.startIp" />
            </el-form-item>
            <el-form-item
                v-if="formData.addressType === 'iprange'"
                prop="endIp"
                :label="Translate('IDCS_IP_END')"
            >
                <BaseIpInput v-model="formData.endIp" />
            </el-form-item>
            <el-form-item
                v-show="formData.addressType === 'mac'"
                prop="mac"
                :label="Translate('IDCS_MAC_ADDRESS')"
            >
                <BaseMacInput v-model="formData.mac" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BlockAndAllowEditPop.v.ts"></script>
