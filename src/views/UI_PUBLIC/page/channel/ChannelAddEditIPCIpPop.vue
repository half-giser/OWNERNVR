<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-27 18:02:39
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_IP')"
        width="450"
        align-center
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            label-width="160px"
            label-position="left"
        >
            <el-form-item
                prop="mac"
                :label="Translate('IDCS_MAC_ADDRESS')"
            >
                <el-input
                    v-model="formData.mac"
                    disabled
                />
            </el-form-item>
            <el-form-item
                prop="ip"
                :label="Translate('IDCS_ADDRESS')"
            >
                <BaseIpInput v-model:value="formData.ip" />
            </el-form-item>
            <el-form-item
                prop="mask"
                :label="Translate('IDCS_SUBNET_MASK')"
            >
                <BaseIpInput
                    v-model:value="formData.mask"
                    :disable="maskDisabled"
                />
            </el-form-item>
            <el-form-item
                prop="gateway"
                :label="Translate('IDCS_GATEWAY')"
            >
                <BaseIpInput
                    v-model:value="formData.gateway"
                    :disable="gatewayDisabled"
                />
            </el-form-item>
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USERNAME')"
            >
                <el-input
                    v-model="formData.userName"
                    disabled
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                    maxlength="16"
                    autocomplete="new-password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    :title="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddEditIPCIpPop.v.ts"></script>

<style scoped lang="scss"></style>
