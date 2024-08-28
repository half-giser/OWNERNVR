<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:15:18
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ACTIVATE')"
        width="460"
        align-center
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="auto"
            label-position="left"
        >
            <el-row class="config-row">
                <el-col :span="8"></el-col>
                <el-col :span="16">
                    <el-checkbox
                        v-model="useDefaultPwdSwitch"
                        :label="Translate('IDCS_USE_DEFAULT_PASSWORD')"
                        @change="formRef?.clearValidate()"
                    />
                </el-col>
            </el-row>
            <el-row class="config-row">
                <el-col :span="8">{{ Translate('IDCS_PASSWORD') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="password">
                        <el-input
                            v-model="formData.password"
                            type="password"
                            :disabled="useDefaultPwdSwitch"
                            @input="(e) => (formData.password = e.replace(/\s/g, ''))"
                            @paste.capture.prevent=""
                            @copy.capture.prevent=""
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row class="config-row">
                <el-col :span="8">{{ Translate('IDCS_CONFIRM_PASSWORD') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="confirmPassword">
                        <el-input
                            v-model="formData.confirmPassword"
                            type="password"
                            :disabled="useDefaultPwdSwitch"
                            @input="(e) => (formData.confirmPassword = e.replace(/\s/g, ''))"
                            @paste.capture.prevent=""
                            @copy.capture.prevent=""
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-row class="config-row">
            <el-col
                :span="24"
                class="el-col-flex-end"
            >
                <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddActivateIPCPop.v.ts"></script>
