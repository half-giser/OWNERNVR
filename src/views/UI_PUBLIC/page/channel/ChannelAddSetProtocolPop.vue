<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-05 17:16:40
 * @Description: 添加通道 - 设置协议弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_PROTOCOL_MANAGE')"
        width="1000"
        @opened="opened"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <el-form-item :label="Translate('IDCS_PROTOCOL_LOGO')">
                    <BaseSelect
                        v-model="currentProtocolLogo"
                        :options="protocolManageList"
                        :props="{
                            value: 'id',
                        }"
                        @change="handleProtocolLogoChange"
                    />
                </el-form-item>
                <el-form-item />
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_STATE')">
                    <BaseSelect
                        v-model="formData.enabled"
                        :options="pageData.enabledOptions"
                    />
                </el-form-item>
                <el-form-item
                    prop="displayName"
                    :label="Translate('IDCS_SHOW_NAME')"
                >
                    <el-input
                        v-model="formData.displayName"
                        :disabled="!formData.enabled"
                        maxlength="11"
                        :formatter="formatName"
                        :parser="formatName"
                    />
                </el-form-item>
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            v-title
            :data="formData.resourcesPath"
            show-overflow-tooltip
            highlight-current-row
        >
            <el-table-column
                :label="Translate('IDCS_CODE_STREAM_TYPE')"
                min-width="260"
            >
                <template #default="{ row }: TableColumn<ChannelResourcesPathDto>">
                    {{ row.streamType === 'Main' ? Translate('IDCS_MAIN_STREAM') : Translate('IDCS_SUB_STREAM') }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TYPE')"
                min-width="130"
            >
                <template #default="{ row }: TableColumn<ChannelResourcesPathDto>">
                    <BaseSelect
                        v-model="row.protocol"
                        :disabled="!formData.enabled"
                        :options="pageData.protocolOptions"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TRANSFER_PROTOCOL')"
                min-width="130"
            >
                <template #default="{ row }: TableColumn<ChannelResourcesPathDto>">
                    <BaseSelect
                        v-model="row.transportProtocol"
                        :disabled="!formData.enabled"
                        :options="pageData.transferProtocolOptions"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_PORT')"
                min-width="130"
            >
                <template #default="{ row }: TableColumn<ChannelResourcesPathDto>">
                    <BaseNumberInput
                        v-model="row.port"
                        :min="10"
                        :max="65535"
                        :disabled="!formData.enabled"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_RESOURCE_PATH')"
                min-width="210"
            >
                <template #default="{ row }: TableColumn<ChannelResourcesPathDto>">
                    <el-input
                        v-model="row.path"
                        :disabled="!formData.enabled"
                        :formatter="formatPath"
                        :parser="formatPath"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box flex-start text-tips">
            {{ Translate('IDCS_CHANGE_PROTOCOL_TIP') }}
        </div>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddSetProtocolPop.v.ts"></script>
