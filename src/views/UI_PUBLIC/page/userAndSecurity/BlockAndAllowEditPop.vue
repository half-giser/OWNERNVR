<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 10:38:40
 * @Description: 编辑黑白名单弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 11:51:51
-->
<template>
    <el-dialog
        draggable
        center
        width="600px"
        :title
        @open="handleOpen"
    >
        <el-form
            ref="formRef"
            class="stripe"
            label-position="left"
            inline-message
            :rules
            :model="formData"
            :style="{
                '--form-input-width': '220px',
                '--form-label-width': '80px',
            }"
            hide-required-asterisk
        >
            <el-form-item>
                <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <el-form-item v-if="formData.addressType !== 'mac'">
                <el-radio-group v-model="formData.addressType">
                    <el-radio value="ip">{{ Translate('IDCS_IP_WHOLE') }}</el-radio>
                    <el-radio value="iprange">{{ Translate('IDCS_IP_SEGMENT') }}</el-radio>
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
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        class="btn-ok"
                        @click="verify"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
                    <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BlockAndAllowEditPop.v.ts"></script>
