<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:21:02
 * @Description: SNMP配置
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.snmpv1Switch"
                    :label="Translate('IDCS_ENABLE_GROUP').formatForLang('SNMPv1')"
                    :disabled="formData.snmpv3Switch"
                    @change="changeSNMPV1Switch"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.snmpv2Switch"
                    :label="Translate('IDCS_ENABLE_GROUP').formatForLang('SNMPv2')"
                    :disabled="formData.snmpv3Switch"
                    @change="changeSNMPV2Switch"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.snmpv3Switch"
                    :label="Translate('IDCS_ENABLE_GROUP').formatForLang('SNMPv3')"
                    @change="changeSNMPV3Switch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SNMP_PORT')"
                prop="snmpPort"
            >
                <BaseNumberInput
                    v-model="formData.snmpPort"
                    :disabled="!formData.snmpv1Switch && !formData.snmpv2Switch && !formData.snmpv3Switch"
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
                    :disabled="!formData.snmpv1Switch && !formData.snmpv2Switch"
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
                    :disabled="!formData.snmpv1Switch && !formData.snmpv2Switch"
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
                    :disabled="!formData.snmpv1Switch && !formData.snmpv2Switch && !formData.snmpv3Switch"
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
                    :disabled="!formData.snmpv1Switch && !formData.snmpv2Switch && !formData.snmpv3Switch"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_USERNAME')"
                prop="username"
            >
                <el-input
                    v-model="formData.username"
                    maxlength="32"
                    :disabled="!formData.snmpv3Switch"
                    :formatter="formatUserName"
                    :parser="formatUserName"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SECURITY_LEVEL')">
                <el-select-v2
                    v-model="formData.securityLevel"
                    :options="pageData.securityLevelOptions"
                    :disabled="!formData.snmpv3Switch"
                    @change="changeSecurityLevel"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_AUTH_TYPE')">
                <el-select-v2
                    v-model="formData.authType"
                    :options="pageData.authTypeOptions"
                    :disabled="!formData.snmpv3Switch || formData.securityLevel === 0"
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    {{ Translate('IDCS_AUTH_PASSWD') }}
                    <el-checkbox
                        v-model="pageData.authPassword"
                        :disabled="!formData.snmpv3Switch || formData.securityLevel === 0"
                        @change="changeAuthPasswordSwitch"
                    />
                </template>
                <BasePasswordInput
                    v-model="formData.authPassword"
                    maxlength="32"
                    :disabled="!formData.snmpv3Switch || !pageData.authPassword || formData.securityLevel === 0"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PRIVACY_TYPE')">
                <el-select-v2
                    v-model="formData.privType"
                    :options="pageData.privTypeOptions"
                    :disabled="!formData.snmpv3Switch || formData.securityLevel !== 2"
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    {{ Translate('IDCS_PRIVACY_PASSWD') }}
                    <el-checkbox
                        v-model="pageData.privPassword"
                        :disabled="!formData.snmpv3Switch || formData.securityLevel !== 2"
                        @change="changePrivPasswordSwitch"
                    />
                </template>
                <BasePasswordInput
                    v-model="formData.privPassword"
                    maxlength="32"
                    :disabled="!formData.snmpv3Switch || !pageData.privPassword || formData.securityLevel !== 2"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./SNMP.v.ts"></script>
