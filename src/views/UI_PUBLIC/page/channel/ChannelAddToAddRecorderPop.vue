<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:36:59
 * @Description: 添加通道 - 添加录像机通道弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_RECORDER_CHANNEL')"
        width="1000"
        @opened="opened"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <el-form-item
                    prop="ip"
                    :label="Translate('IDCS_IP_ADDRESS')"
                >
                    <el-input
                        v-if="formData.chkDomain"
                        v-model="formData.domain"
                        :disabled="eleUserNameDisabled"
                    />
                    <BaseIpInput
                        v-else
                        v-model="formData.ip"
                        :disabled
                    />
                    <el-checkbox
                        v-model="formData.chkDomain"
                        :label="Translate('IDCS_DOMAIN')"
                        :disabled
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_SERVE_PORT')">
                    <BaseNumberInput
                        v-model="formData.servePort"
                        :min="10"
                        :max="65535"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CHANNELS')">
                    <BaseNumberInput
                        v-model="formData.channelCount"
                        :min="1"
                        :max="128"
                        :disabled="eleChlCountDisabled"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_USERNAME')">
                    <el-input
                        v-model="formData.userName"
                        :disabled="eleUserNameDisabled"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PASSWORD')">
                    <BasePasswordInput
                        v-model="formData.password"
                        :disabled="formData.useDefaultPwd"
                        maxlength="16"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item v-show="editItem.ip">
                <el-form-item />
                <el-form-item :label="Translate('IDCS_DEV_DEFAULT_PWD')">
                    <el-checkbox v-model="formData.useDefaultPwd" />
                </el-form-item>
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            v-title
            :data="formData.recorderList"
            height="340"
            show-overflow-tooltip
            :row-class-name="handleRowClassName"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="selection"
                :selectable="isSelectable"
                width="50"
            />
            <el-table-column
                prop="index"
                :label="Translate('IDCS_REMOTE_CHANNEL_NUMBER')"
                min-width="170"
            />
            <el-table-column
                :label="Translate('IDCS_IP_CHANNEL')"
                min-width="150"
            >
                <template #default="{ row }: TableColumn<ChannelRecorderDto>">
                    {{ row.name || '' }}
                </template>
            </el-table-column>
            <el-table-column
                prop="productModel"
                :label="Translate('IDCS_PRODUCT_MODEL')"
                min-width="220"
            />
        </el-table>
        <div class="base-btn-box space-between">
            <div>
                {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, formData.recorderList.length) }}
            </div>
            <div>
                <el-button
                    :disabled="eleBtnTestDisabled"
                    @click="test"
                >
                    {{ Translate('IDCS_TEST') }}
                </el-button>
                <el-button
                    :disabled="selNum <= 0"
                    @click="save"
                >
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddToAddRecorderPop.v.ts"></script>
