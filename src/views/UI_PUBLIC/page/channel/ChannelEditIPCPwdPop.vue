<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-23 10:00:35
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_MODIFY_IPC_PASSWORD')"
        width="550"
        align-center
        @opened="opened"
    >
        <el-table
            ref="tableRef"
            border
            stripe
            :data="tableData"
            height="245px"
            table-layout="fixed"
            show-overflow-tooltip
            highlight-current-row
            empty-text=" "
            @row-click="handleRowClick"
        >
            <el-table-column
                type="selection"
                width="50px"
            />
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80px"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                min-width="240px"
            />
            <el-table-column
                prop="chlStatus"
                :label="Translate('IDCS_CONNECT_STATUS')"
                width="120px"
            />
        </el-table>
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150px"
            label-position="left"
            class="ruleForm"
        >
            <el-row class="config-row">
                <el-form-item
                    prop="password"
                    :label="Translate('IDCS_NEW_PASSWORD')"
                >
                    <el-input
                        v-model="formData.password"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        class="passwordInput"
                    />
                </el-form-item>
            </el-row>
            <el-row class="config-row">
                <el-form-item
                    prop="confirmPassword"
                    :label="Translate('IDCS_CONFIRM_PASSWORD')"
                >
                    <el-input
                        v-model="formData.confirmPassword"
                        :placeholder="Translate('IDCS_PASSWORD_TIP')"
                        class="passwordInput"
                    />
                </el-form-item>
            </el-row>
        </el-form>
        <el-row>
            <el-col class="el-col-flex-end">
                <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelEditIPCPwdPop.v.ts"></script>

<style scoped lang="scss">
.ruleForm {
    width: 420px;
    margin: 20px auto;

    .passwordInput {
        width: 270px;
    }
}
</style>
