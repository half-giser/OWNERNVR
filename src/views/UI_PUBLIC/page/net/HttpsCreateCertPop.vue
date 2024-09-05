<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 10:08:50
 * @Description: 创建私有证书弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 20:07:12
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CREATE')"
        width="600"
        align-center
        draggable
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
            label-position="left"
            label-width="100px"
            :style="{
                '--form-input-width': '300px',
            }"
        >
            <el-form-item
                :label="Translate('IDCS_COUNTRY')"
                prop="countryName"
            >
                <el-input v-model="formData.countryName" />
                <el-text>*</el-text>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_HOSTNAME_OR_IP')"
                prop="commonName"
            >
                <el-input v-model="formData.commonName" />
                <el-text>*</el-text>
            </el-form-item>
            <el-form-item
                v-show="type === 0"
                :label="Translate('IDCS_VALIDITY_PERIOD')"
                prop="validityPeriod"
            >
                <el-input-number
                    v-model="formData.validityPeriod"
                    :controls="false"
                    :min="1"
                    :max="5000"
                />
                <el-text>{{ Translate('IDCS_DAYS') }} *</el-text>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PASSWORD')"
                prop="password"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                />
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
        <template #footer>
            <el-row>
                <el-col :span="8"> </el-col>
                <el-col
                    :span="16"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify()">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./HttpsCreateCertPop.v.ts"></script>
