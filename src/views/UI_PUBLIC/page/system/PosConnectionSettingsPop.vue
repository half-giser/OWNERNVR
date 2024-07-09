<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 13:36:09
 * @Description: POS连接设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-03 15:27:44
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONNECTION_SETTINGS')"
        width="600"
        draggable
        center
        open="open"
    >
        <div class="PosConnectionSettings">
            <el-form
                ref="formRef"
                class="form"
                :model="formData"
                :rules="rules"
                label-position="left"
                inline-message
                hide-required-asterisk
                flexible
            >
                <el-form-item
                    :label="Translate('IDCS_POS_IP')"
                    prop="ip"
                >
                    <BaseIpInput v-model:value="formData.ip" />
                </el-form-item>
                <el-form-item v-if="data.connectionType === 'TCP-Listen'">
                    <el-checkbox v-model="formData.switch">{{ Translate('IDCS_POS_PORT') }}</el-checkbox>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_POS_PORT')"
                    prop="port"
                >
                    <el-input-number
                        v-model="formData.port"
                        :disabled="data.connectionType === 'TCP-Listen' && !formData.switch"
                        :min="0"
                        :max="65535"
                    />
                </el-form-item>
            </el-form>
        </div>
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

<script lang="ts" src="./PosConnectionSettingPop.v.ts"></script>

<style lang="scss" scoped>
.PosConnectionSettings {
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

        :deep(.el-form-item__content) {
            flex-wrap: nowrap;
        }

        :deep(.IpInput) {
            max-width: 200px;
            width: 200px;
            flex-shrink: 0;
        }

        .el-input-number {
            width: 224px;
            flex-shrink: 0;
        }

        // .el-input {
        //     width: 340px;
        //     flex-shrink: 0;
        // }
    }
}
</style>
