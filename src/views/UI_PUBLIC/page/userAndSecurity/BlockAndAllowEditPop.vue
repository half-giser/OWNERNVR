<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 10:38:40
 * @Description: 编辑黑白名单弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 14:00:36
-->
<template>
    <el-dialog
        draggable
        center
        width="600px"
        :title
        @open="handleOpen"
    >
        <div class="EditBlockAndAllow">
            <el-form
                ref="formRef"
                class="form"
                label-position="left"
                inline-message
                :rules
                :model="formData"
                hide-required-asterisk
            >
                <el-form-item>
                    <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
                </el-form-item>
                <el-form-item v-if="formData.addressType !== 'mac'">
                    <el-radio-group v-model="formData.addressType">
                        <el-radio value="ip">{{ Translate('IDCS_IP_WHOLE') }}</el-radio>
                        <el-radio value="iprange">{{ Translate('IDCS_IP_SEGMENT') }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item
                    v-if="formData.addressType === 'ip'"
                    prop="ip"
                    :label="Translate('IDCS_IP_ADDRESS')"
                >
                    <BaseIpInput v-model:value="formData.ip"></BaseIpInput>
                </el-form-item>
                <el-form-item
                    v-if="formData.addressType === 'iprange'"
                    prop="startIp"
                    :label="Translate('IDCS_IP_START')"
                >
                    <BaseIpInput v-model:value="formData.startIp"></BaseIpInput>
                </el-form-item>
                <el-form-item
                    v-if="formData.addressType === 'iprange'"
                    prop="endIp"
                    :label="Translate('IDCS_IP_END')"
                >
                    <BaseIpInput v-model:value="formData.endIp"></BaseIpInput>
                </el-form-item>
                <el-form-item
                    v-show="formData.addressType === 'mac'"
                    prop="mac"
                    :label="Translate('IDCS_MAC_ADDRESS')"
                >
                    <BaseMacInput v-model:value="formData.mac"></BaseMacInput>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        class="btn-ok"
                        @click="verify"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
                    <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BlockAndAllowEditPop.v.ts"></script>

<style lang="scss" scoped>
.EditBlockAndAllow {
    .form {
        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__label) {
            width: 100px;
        }

        // .no-indent {
        // }

        :deep(.el-form-item__content) {
            // justify-content: flex-start;
            flex-wrap: nowrap;
        }

        :deep(.IpInput) {
            max-width: 200px;
            width: 200px;
            flex-shrink: 0;
        }

        :deep(.MacInput) {
            max-width: 200px;
            width: 200px;
            flex-shrink: 0;
        }

        .el-input {
            width: 340px;
            flex-shrink: 0;
        }
    }
}
</style>
