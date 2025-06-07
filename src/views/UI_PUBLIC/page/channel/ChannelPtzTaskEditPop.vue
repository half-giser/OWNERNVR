<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:15:37
 * @Description: 云台-任务-编辑弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_OPERATION')"
        width="450"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_FUNCTION')">
                <BaseSelect
                    v-model="formData.type"
                    :options="pageData.typeOptions"
                    @change="changeType"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_NAME')"
                prop="name"
            >
                <BaseSelect
                    v-model="formData.editIndex"
                    :options="nameOption"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_START_TIME')">
                <BaseTimePicker
                    v-model="formData.startTime"
                    unit="minute"
                    :range="[null, formData.endTime]"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_END_TIME')"
                prop="endTime"
            >
                <BaseTimePicker
                    v-model="formData.endTime"
                    unit="minute"
                    :range="[formData.startTime, null]"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!nameOption.length"
                    @click="verify"
                >
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-form>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelPtzTaskEditPop.v.ts"></script>
