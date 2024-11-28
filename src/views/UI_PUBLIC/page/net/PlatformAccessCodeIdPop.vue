<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 14:02:17
 * @Description: 平台接入 设置Code ID弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_CODE_ID')"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item :label="Translate('IDCS_NAME')">
                <el-input
                    v-model="formData.name"
                    disabled
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CODE_ID')"
                prop="code"
            >
                <el-input
                    v-model="formData.code"
                    :maxlength="20"
                    :formatter="formatDigit"
                    :parser="formatDigit"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PlatformAccessCodeIdPop.v.ts"></script>
