<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 13:36:09
 * @Description: POS连接设置
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONNECTION_SETTINGS')"
        width="600"
        @open="open"
    >
        <el-form
            ref="formRef"
            class="stripe"
            :model="formData"
            :rules="rules"
            :style="{
                '--form-input-width': '200px',
                '--form-label-width': '100px',
            }"
            inline-message
        >
            <el-form-item
                :label="Translate('IDCS_POS_IP')"
                prop="ip"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <el-form-item v-if="data.connectionType === 'TCP-Listen'">
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_POS_PORT')"
                    @change="changeSwitch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_POS_PORT')"
                prop="port"
            >
                <BaseNumberInput
                    v-model="formData.port"
                    :disabled="data.connectionType === 'TCP-Listen' && !formData.switch"
                    :min="10"
                    :max="65535"
                    :value-on-clear="data.connectionType === 'TCP-Listen' && !formData.switch ? null : 'min'"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PosConnectionSettingPop.v.ts"></script>
