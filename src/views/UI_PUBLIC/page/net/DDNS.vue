<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:13:08
 * @Description: DDNS
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DDNS_SERVER_TYPE')">
                <BaseSelect
                    v-model="formData.serverType"
                    :options="pageData.serverTypeOptions"
                    :disabled="!formData.switch"
                    :props="{
                        label: 'display',
                        value: 'serverType',
                    }"
                    @change="changeServerType"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SERVER_ADDRESS')"
                prop="serverAddr"
            >
                <el-input
                    v-model="formData.serverAddr"
                    :disabled="!formData.switch || !current.requireParam.includes('serverAddr')"
                    :placeholder="Translate('IDCS_SERVER_ADDRESS_TIP')"
                    :maxlength="formData.serverAddrMaxLen"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_DOMAIN_NAME')"
                prop="domainName"
            >
                <el-input
                    v-model="formData.domainName"
                    :maxlength="formData.domainNameMaxLen"
                    :formatter="formatDomainName"
                    :parser="formatDomainName"
                    :disabled="!formData.switch || !current.requireParam.includes('domainName')"
                    :placeholder="Translate('IDCS_DOMAIN_NAME_TIP')"
                />
                <el-text v-show="current.suffix">{{ current.suffix }}</el-text>
            </el-form-item>
            <el-form-item
                v-if="!current.hideParam.includes('userName')"
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <BaseTextInput
                    v-model="formData.userName"
                    :formatter="formatInputUserName"
                    :disabled="!formData.switch || !current.requireParam.includes('userName')"
                    :placeholder="Translate('IDCS_USERNAME_TIP')"
                    :maxlength="formData.userNameMaxByteLen"
                />
            </el-form-item>
            <el-form-item
                v-if="!current.hideParam.includes('password')"
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!formData.switch || !current.requireParam.includes('password')"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    maxlength="32"
                />
            </el-form-item>
            <el-form-item
                v-if="!current.hideParam.includes('heartbeatTime')"
                :label="Translate('IDCS_HEARTBEAT_INTERVAL')"
            >
                <BaseNumberInput
                    v-model="formData.heartbeatTime"
                    :disabled="!formData.switch || !current.requireParam.includes('heartbeatTime')"
                    :placeholder="Translate('IDCS_PLEARSE_ENTER_HEARTBEAT_TIME')"
                    :min="5"
                    :max="3600"
                    :value-on-clear="current.requireParam.includes('heartbeatTime') ? 'min' : null"
                />
                <span>s {{ Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(5, 3600) }}</span>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CONNECTION_STATUS')">
                {{ pageData.connectState }}
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    v-show="current.isRegisterBtn"
                    :disabled="!formData.switch"
                    @click="test"
                >
                    {{ Translate('IDCS_REGISTER') }}
                </el-button>
                <el-button
                    v-show="current.isTestBtn"
                    :disabled="!formData.switch"
                    @click="test"
                >
                    {{ Translate('IDCS_TEST') }}
                </el-button>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./DDNS.v.ts"></script>
