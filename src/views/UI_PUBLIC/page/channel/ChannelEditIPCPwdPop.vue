<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-23 10:00:35
 * @Description: 通道 - 编辑IPC密码弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_MODIFY_IPC_PASSWORD')"
        width="550"
        @opened="opened"
        @closed="formRef?.resetFields()"
    >
        <el-table
            ref="tableRef"
            :data="tableData"
            height="245"
            show-overflow-tooltip
            highlight-current-row
            @row-click="handleRowClick"
        >
            <el-table-column
                type="selection"
                width="50"
            />
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                min-width="240"
            />
            <el-table-column
                prop="chlStatus"
                :label="Translate('IDCS_CONNECT_STATUS')"
                width="120"
            />
        </el-table>
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="password"
                :label="Translate('IDCS_NEW_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
            <el-form-item
                prop="confirmPassword"
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
            >
                <BasePasswordInput
                    v-model="formData.confirmPassword"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelEditIPCPwdPop.v.ts"></script>

<style scoped lang="scss">
.el-form {
    margin: 20px auto;
}
</style>
