<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 10:08:50
 * @Description: 创建私有证书弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CREATE')"
        width="600"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :rules="formRule"
            :model="formData"
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item
                :label="Translate('IDCS_COUNTRY')"
                prop="countryName"
            >
                <el-input v-model="formData.countryName" />
                <span>*</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_HOSTNAME_OR_IP')"
                prop="commonName"
            >
                <el-input v-model="formData.commonName" />
                <span>*</span>
            </el-form-item>
            <el-form-item
                v-if="type === 0"
                :label="Translate('IDCS_VALIDITY_PERIOD')"
                prop="validityPeriod"
            >
                <BaseNumberInput
                    v-model="formData.validityPeriod"
                    :min="1"
                    :max="5000"
                    :value-on-clear="null"
                />
                <span>{{ Translate('IDCS_DAYS') }} *</span>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD')">
                <BasePasswordInput v-model="formData.password" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STATE_OR_PROVINCE')">
                <el-input v-model="formData.stateOrProvinceName" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_LOCALITY')">
                <el-input v-model="formData.localityName" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ORGANIZATION')">
                <el-input v-model="formData.organizationName" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ORGANIZATION_UNIT')">
                <el-input v-model="formData.organizationalUnitName" />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_EMAIL')"
                prop="email"
            >
                <el-input v-model="formData.email" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify()">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./HttpsCreateCertPop.v.ts"></script>
