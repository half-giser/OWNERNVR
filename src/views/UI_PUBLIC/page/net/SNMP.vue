<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:21:02
 * @Description: SNMP配置
-->
<template>
    <div>
        <el-form
            ref="formRef"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '340px',
            }"
            inline-message
            class="stripe"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.snmpv1Switch"
                    :label="Translate('IDCS_ENABLE_SNMP_V1')"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.snmpv2Switch"
                    :label="Translate('IDCS_ENABLE_SNMP_V2')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SNMP_PORT')"
                prop="snmpPort"
            >
                <BaseNumberInput
                    v-model="formData.snmpPort"
                    :disabled
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SNMP_READ_COMMUNITY')"
                prop="readCommunity"
            >
                <el-input
                    v-model="formData.readCommunity"
                    :disabled
                    maxlength="32"
                    :formatter="formatCommunity"
                    :parser="formatCommunity"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SNMP_WRITE_COMMUNITY')"
                prop="writeCommunity"
            >
                <el-input
                    v-model="formData.writeCommunity"
                    :disabled
                    maxlength="32"
                    :formatter="formatCommunity"
                    :parser="formatCommunity"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_TRAP_ADDRESS')"
                prop="trapAddress"
            >
                <BaseIpInput
                    v-model="formData.trapAddress"
                    :disabled
                    invalidate-mode="REPLACE"
                    @change="formRef?.validateField('trapAddress')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_TRAP_PORT')"
                prop="trapPort"
            >
                <BaseNumberInput
                    v-model="formData.trapPort"
                    :disabled
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./SNMP.v.ts"></script>
