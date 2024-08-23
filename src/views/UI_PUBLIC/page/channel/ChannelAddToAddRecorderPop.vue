<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:36:59
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_RECORDER_CHANNEL')"
        width="660"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="130px"
            label-position="left"
        >
            <el-row>
                <el-col :span="18">
                    <el-form-item
                        prop="ip"
                        :label="Translate('IDCS_IP_ADDRESS')"
                    >
                        <BaseIpInput
                            v-show="!formData.chkDomain"
                            v-model="formData.ip"
                            :disabled="eleIpDisabled"
                        />
                        <el-input
                            v-show="formData.chkDomain"
                            v-model="formData.domain"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="5">
                    <el-form-item
                        prop="chkDomain"
                        label-width="0"
                    >
                        <el-checkbox
                            v-model="formData.chkDomain"
                            :label="Translate('IDCS_DOMAIN')"
                            :disabled="eleChkDomainDisabled"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="11">
                    <el-form-item
                        prop="servePort"
                        :label="Translate('IDCS_SERVE_PORT')"
                    >
                        <el-input
                            v-model="formData.servePort"
                            v-numericalRange:[formData].servePort="[10, 65535]"
                            :disabled="eleServePortDisabled"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="2"></el-col>
                <el-col :span="11">
                    <el-form-item
                        prop="channelCount"
                        :label="Translate('IDCS_CHANNELS')"
                    >
                        <el-input
                            v-model="formData.channelCount"
                            v-numericalRange:[formData].channelCount="[1, 128]"
                            :disabled="eleChlCountDisabled"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="11">
                    <el-form-item
                        prop="userName"
                        :label="Translate('IDCS_USERNAME')"
                    >
                        <el-input
                            v-model="formData.userName"
                            :disabled="eleUserNameDisabled"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="2"></el-col>
                <el-col :span="11">
                    <el-form-item
                        prop="password"
                        :label="Translate('IDCS_PASSWORD')"
                    >
                        <el-input
                            v-model="formData.password"
                            type="password"
                            autocomplete="new-password"
                            :disabled="formData.useDefaultPwd"
                            @paste.capture.prevent=""
                            @copy.capture.prevent=""
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row v-show="showDefaultPwdRow">
                <el-col :span="13"></el-col>
                <el-col :span="11">
                    <el-form-item :label="Translate('IDCS_DEV_DEFAULT_PWD')">
                        <el-checkbox v-model="formData.useDefaultPwd" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-table
            ref="tableRef"
            border
            stripe
            :data="formData.recorderList"
            height="340px"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="selection"
                width="50px"
            />
            <el-table-column
                prop="index"
                :label="Translate('IDCS_REMOTE_CHANNEL_NUMBER')"
                min-width="170px"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_IP_CHANNEL')"
                min-width="150px"
            >
                <template #default="scope">
                    <span>{{ scope.row.name || '' }}</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="productModel"
                :label="Translate('IDCS_PRODUCT_MODEL')"
                min-width="220px"
            />
        </el-table>
        <template #footer>
            <el-row>
                <el-col
                    :span="10"
                    class="el-col-flex-start"
                >
                    <span>{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span>
                </el-col>
                <el-col
                    :span="14"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="eleBtnTestDisabled"
                        @click="test"
                        >{{ Translate('IDCS_TEST') }}</el-button
                    >
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddToAddRecorderPop.v.ts"></script>

<style scoped lang="scss">
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: var(--el-text-color-regular);
}
</style>
