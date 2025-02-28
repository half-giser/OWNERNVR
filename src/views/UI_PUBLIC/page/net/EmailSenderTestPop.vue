<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 16:50:02
 * @Description: Email测试发送弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_RECIPIENT_ADDRESS')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-input-width': '240px',
            }"
        >
            <el-form-item
                :label="Translate('IDCS_RECIPIENT_ADDRESS')"
                prop="address"
            >
                <el-select-v2
                    v-model="formData.address"
                    filterable
                    allow-create
                    default-first-option
                    :options="pageData.list"
                    :props="{
                        value: 'address',
                        label: 'address',
                    }"
                />
                <el-button @click="addReceiver">{{ Translate('IDCS_ADD_ECIPIENT') }}</el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD')">
                <BasePasswordInput v-model="formData.password" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./EmailSenderTestPop.v.ts"></script>
