<!--
 * @Date: 2025-05-04 16:02:54
 * @Description: RS485 新增/编辑弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        width="500"
        :title="type === 'add' ? Translate('IDCS_ADD_OPERATION') : Translate('IDCS_EDIT_OPERATION')"
        @open="open"
        @close="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :rules="formRules"
            :model="formData"
            class="stripe"
        >
            <el-form-item
                :label="Translate('IDCS_OPERATION')"
                prop="name"
            >
                <BaseTextInput
                    v-model="formData.name"
                    :maxlength="16"
                    :formatter="formatName"
                    @out-of-range="handleNameOutOfRange"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_BAUD_RATE')">
                <el-select-v2
                    v-model="formData.baudrate"
                    :options="baudRateTypeList"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ADDRESS')">
                <BaseNumberInput
                    v-model="formData.addrID"
                    :min="0"
                    :max="255"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-select-v2
                    v-model="formData.protocol"
                    :options="protocolTypeList"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.protocol !== 'CUSTOMIZE'"
                :label="Translate('IDCS_CONTROL')"
            >
                <el-select-v2
                    v-model="formData.operate"
                    :options="operateTypeList"
                />
            </el-form-item>
            <el-form-item v-if="formData.protocol === 'CUSTOMIZE'">
                <el-input
                    v-model="formData.code"
                    maxlength="128"
                    :formatter="formatCode"
                    :parser="formatCode"
                />
                <span class="text-tips">{{ Translate('IDCS_RS485_EXAMPLE') }}</span>
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="test">{{ Translate('IDCS_TEST') }}</el-button>
            <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./RS485AddPop.v.ts"></script>
