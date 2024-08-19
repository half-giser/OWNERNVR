<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 14:02:17
 * @Description: 平台接入 设置Code ID弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 17:45:59
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_CODE_ID')"
        width="500"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            label-position="left"
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

<script lang="ts" src="./PlatformAccessCodeIdPop.v.ts"></script>
