<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 16:50:02
 * @Description: Email测试发送弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 14:02:00
-->
<template>
    <el-dialog
        :title="Translate('IDCS_RECIPIENT_ADDRESS')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            class="form"
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-input-width': '240px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item
                :label="Translate('IDCS_RECIPIENT_ADDRESS')"
                prop="address"
            >
                <el-select
                    v-model="formData.address"
                    filterable
                    allow-create
                    default-first-option
                    placeholder=" "
                >
                    <el-option
                        v-for="item in pageData.list"
                        :key="item.address"
                        :value="item.address"
                        :label="item.address"
                    />
                </el-select>
                <el-button @click="addReceiver">{{ Translate('IDCS_ADD_ECIPIENT') }}</el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD')">
                <el-input
                    v-model="formData.password"
                    type="password"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./EmailSenderTestPop.v.ts"></script>
