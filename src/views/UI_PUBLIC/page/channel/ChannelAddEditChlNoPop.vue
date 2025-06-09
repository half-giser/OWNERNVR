<!--
 * @Date: 2025-05-12 10:10:02
 * @Description: 新增通道 - 编辑通道号弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT')"
        width="450"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_IP_ADDRESS')">
                <el-input
                    :model-value="data.ip"
                    disabled
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CHANNEL_NO')">
                <BaseSelect
                    v-model="formData.chlNum"
                    :options="options"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddEditChlNoPop.v.ts"></script>
