<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 10:52:49
 * @Description: UPnP上报
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 11:43:14
-->
<template>
    <div>
        <el-form
            ref="formRef"
            class="stripe"
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-input-width': '200px',
            }"
            label-position="left"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    @change="changeSwitch"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SERVER_ADDRESS')">
                <el-input
                    v-model="formData.serverAddr"
                    :disabled="!formData.switch"
                    :maxlength="nameByteMaxLen"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SERVER_ADDRESS')">
                <el-input-number
                    v-model="formData.port"
                    :disabled="!formData.switch"
                    :controls="false"
                    :min="10"
                    :max="65535"
                    value-on-clear="min"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UPNP_REPORT_MANID')">
                <el-input
                    v-model="formData.manId"
                    :disabled="!formData.switch"
                    maxlength="255"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./UpnpReport.v.ts"></script>
