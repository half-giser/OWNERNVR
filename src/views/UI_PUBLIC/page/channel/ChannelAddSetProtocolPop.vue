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
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item>
                <el-form-item :label="Translate('IDCS_PROTOCOL_LOGO')">
                    <el-select
                        v-model="currentProtocolLogo"
                        @change="handleProtocolLogoChange"
                    >
                        <el-option
                            v-for="item in protocolManageList"
                            :key="item.id"
                            :label="`${Translate('IDCS_CUSTOM_PROTOCOL')} ${item.id}`"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item></el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_STATE')">
                    <el-select v-model="formData.enabled">
                        <el-option
                            :label="Translate('IDCS_NIC_STATE_DISABLED')"
                            :value="false"
                        />
                        <el-option
                            :label="Translate('IDCS_ENABLE')"
                            :value="true"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item
                    prop="displayName"
                    :label="Translate('IDCS_SHOW_NAME')"
                >
                    <el-input
                        v-model="formData.displayName"
                        :disabled="!formData.enabled"
                        maxlength="11"
                        :formatter="handleDisplayNameInput"
                        :parser="handleDisplayNameInput"
                    />
                </el-form-item>
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            border
            stripe
            :data="formData.resourcesPath"
            show-overflow-tooltip
            highlight-current-row
        >
            <el-table-column
                :label="Translate('IDCS_CODE_STREAM_TYPE')"
                min-width="260"
            >
                <template #default="scope">
                    {{ scope.row.streamType === 'Main' ? Translate('IDCS_MAIN_STREAM') : Translate('IDCS_SUB_STREAM') }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TYPE')"
                minn-width="130"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.protocol"
                        :disabled="!formData.enabled"
                    >
                        <el-option
                            label="RTSP"
                            value="RTSP"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TRANSFER_PROTOCOL')"
                minn-width="130"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.transportProtocol"
                        :disabled="!formData.enabled"
                    >
                        <el-option
                            label="TCP"
                            value="TCP"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_PORT')"
                minn-width="130"
            >
                <template #default="scope">
                    <BaseNumberInput
                        v-model="scope.row.port"
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
                <template #default="scope">
                    <el-input
                        v-model="scope.row.path"
                        :disabled="!formData.enabled"
                    />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <div
                class="base-btn-box collapse"
                span="start"
            >
                {{ Translate('IDCS_CHANGE_PROTOCOL_TIP') }}
            </div>
            <div class="base-btn-box">
                <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddSetProtocolPop.v.ts"></script>
