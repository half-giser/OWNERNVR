<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-05 17:16:40
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_PROTOCOL_MANAGE')"
        width="1000px"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="protocolManageForm"
            label-width="150px"
            label-position="left"
        >
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="Translate('IDCS_PROTOCOL_LOGO')">
                        <el-select
                            v-model="currentProtocolLogo"
                            class="col_select_item"
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
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="Translate('IDCS_STATE')">
                        <el-select
                            v-model="formData.enabled"
                            class="col_select_item"
                        >
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
                </el-col>
                <el-col :span="12">
                    <el-form-item
                        prop="displayName"
                        :label="Translate('IDCS_SHOW_NAME')"
                    >
                        <el-input
                            v-model="formData.displayName"
                            class="col_input_item"
                            :disabled="!formData.enabled"
                            maxlength="11"
                            @input="handleDisplayNameInput"
                        ></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-table
            ref="tableRef"
            border
            stripe
            :data="formData.resourcesPath"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
        >
            <el-table-column
                prop="streamType"
                :label="Translate('IDCS_CODE_STREAM_TYPE')"
                min-width="260px"
            >
                <template #default="scope">
                    <span>{{ scope.row.streamType === 'Main' ? Translate('IDCS_MAIN_STREAM') : Translate('IDCS_SUB_STREAM') }}</span>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TYPE')"
                width="130px"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.protocol"
                        size="small"
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
                width="130px"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.transportProtocol"
                        size="small"
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
                width="130px"
            >
                <template #default="scope">
                    <el-input-number
                        v-model="scope.row.port"
                        :min="10"
                        :max="65535"
                        value-on-clear="min"
                        :controls="false"
                        size="small"
                        :disabled="!formData.enabled"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_RESOURCE_PATH')"
                min-width="210px"
            >
                <template #default="scope">
                    <el-input
                        v-model="scope.row.path"
                        size="small"
                        :disabled="!formData.enabled"
                    />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-row class="elRowTip">
                <el-col class="el-col-flex-start">
                    <span>{{ Translate('IDCS_CHANGE_PROTOCOL_TIP') }}</span>
                </el-col>
            </el-row>
            <el-row>
                <el-col class="el-col-flex-end">
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddSetProtocolPop.v.ts"></script>

<style scoped lang="scss">
.protocolManageForm {
    margin: 10px 0;

    .col_select_item,
    .col_input_item {
        width: 200px;
    }
}

.elRowTip {
    margin-bottom: 10px;
    font-size: 14px;
}
</style>
