<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:50:00
 * @Description: 备份与恢复
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 19:41:53
-->
<template>
    <div class="BackupAndRestore">
        <div class="title">{{ Translate('IDCS_SYSTEM_LOADINCONFIG_LOG') }}</div>
        <el-form>
            <el-form-item :label="Translate('IDCS_PATH')">
                <el-input
                    type="text"
                    readonly
                    :model-value="importFormData.filePath"
                />
                <el-button
                    v-show="!isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                    @click="handleOCXUpload"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <input
                    id="h5BrowerImport"
                    type="file"
                    hidden
                    :disabled="pageData.isUploadDisabled"
                    @change="handleH5Upload"
                />
                <el-button
                    v-show="isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                >
                    <label
                        for="h5BrowerImport"
                        :class="{ disabled: pageData.isUploadDisabled }"
                    >
                        {{ Translate('IDCS_BROWSE') }}
                    </label>
                </el-button>
                <el-button
                    :disabled="pageData.isImportDisabled"
                    @click="handleImport"
                    >{{ Translate('IDCS_IMPORT') }}</el-button
                >
            </el-form-item>
        </el-form>
        <div class="note"></div>
        <div class="title">{{ Translate('IDCS_SYSTEM_BACKUPCONFIG_LOG') }}</div>
        <el-form>
            <el-form-item :label="isSupportH5 ? '' : Translate('IDCS_PATH')">
                <el-input
                    v-show="!isSupportH5"
                    type="text"
                    readonly
                    :model-value="exportFormData.filePath"
                />
                <el-button
                    v-show="!isSupportH5"
                    @click="handleBrowse"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <el-button
                    :disabled="pageData.isExportDisabled"
                    @click="handleExport"
                    >{{ Translate('IDCS_EXPORT') }}</el-button
                >
                <el-checkbox v-model="exportFormData.isIncludeNetworkConfig">{{ Translate('IDCS_INCLUDE_NETWORK') }}</el-checkbox>
                <el-checkbox v-model="exportFormData.isIncludeDataEncryptPwd">{{ Translate('IDCS_INCLUDE_DATA_ENCRYPT_PASSWORD') }}</el-checkbox>
            </el-form-item>
        </el-form>
        <div class="note"></div>
        <BasePluginNotice />
        <BaseNotification v-model:notifications="pageData.notifications" />
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            :tip="pageData.checkAuthTip"
            @confirm="confirmCheckAuth"
            @close="pageData.isCheckAuth = false"
        />
        <BaseInputEncryptPwdPop
            v-model="pageData.isEncryptPwd"
            :decrypt-flag="pageData.encryptPwdDecryptFlag"
            :title="pageData.encryptPwdTitle"
            @confirm="confirmInputEncryptPwd"
            @close="pageData.isEncryptPwd = false"
        />
    </div>
</template>

<script lang="ts" src="./BackupAndRestore.v.ts"></script>

<style lang="scss" scoped>
.BackupAndRestore {
    .title {
        font-size: 35px;
        line-height: 35px;
        width: 100%;
        box-sizing: border-box;
        padding-left: 15px;
        font-size: 15px;
        margin-bottom: 15px;
        background-color: var(--bg-color4);
        font-weight: bolder;
        color: var(--text-dark);
    }

    label {
        display: inline-block;

        &.disabled {
            cursor: not-allowed;
        }
    }

    .el-input {
        width: 250px;
    }

    :deep(.el-checkbox) {
        padding-left: 15px;
        margin-right: 15px;
        display: flex;
        align-items: center;
    }

    :deep(.el-form-item__content) > *:not(:first-child) {
        margin-left: 5px;
    }

    .note {
        font-size: 15px;
        margin: 10px 0px 0px 0px;
        height: 35px;
    }
}
</style>
