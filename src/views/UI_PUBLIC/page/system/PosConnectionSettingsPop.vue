<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 13:36:09
 * @Description: POS连接设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-21 17:34:10
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONNECTION_SETTINGS')"
        width="600"
        draggable
        center
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
            label-position="left"
            inline-message
            hide-required-asterisk
            flexible
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
                    @change="changeSwitch"
                    >{{ Translate('IDCS_POS_PORT') }}</el-checkbox
                >
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
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PosConnectionSettingPop.v.ts"></script>
