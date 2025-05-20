<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 10:52:49
 * @Description: UPnP上报
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                    @change="changeSwitch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SERVER_ADDRESS')">
                <BaseTextInput
                    v-model="formData.serverAddr"
                    :maxlength="formData.serverAddrMaxByteLen"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SERVER_ADDRESS')">
                <BaseNumberInput
                    v-model="formData.port"
                    :disabled="!formData.switch"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UPNP_REPORT_MANID')">
                <BaseTextInput
                    v-model="formData.manId"
                    :maxlength="formData.manIdMaxByteLen"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./UpnpReport.v.ts"></script>
