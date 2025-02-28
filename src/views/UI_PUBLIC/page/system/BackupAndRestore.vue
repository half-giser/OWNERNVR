<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:50:00
 * @Description: 备份与恢复
-->
<template>
    <div>
        <el-form
            :style="{
                '--form-input-width': '200px',
                '--form-label-width': '100px',
            }"
        >
            <div class="base-subheading-box">{{ Translate('IDCS_SYSTEM_LOADINCONFIG_LOG') }}</div>
            <el-form-item :label="Translate('IDCS_PATH')">
                <el-input
                    type="text"
                    readonly
                    :model-value="importFormData.filePath"
                />
                <el-button
                    v-if="!isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                    @click="handleOCXUpload"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
                <label
                    v-if="isSupportH5"
                    class="el-button"
                    for="h5BrowerImport"
                    :class="{
                        'is-disabled': pageData.isUploadDisabled,
                    }"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </label>
                <el-button
                    :disabled="pageData.isImportDisabled"
                    @click="handleImport"
                >
                    {{ Translate('IDCS_IMPORT') }}
                </el-button>
                <input
                    id="h5BrowerImport"
                    type="file"
                    hidden
                    :disabled="pageData.isUploadDisabled"
                    @change="handleH5Upload"
                />
            </el-form-item>
            <el-form-item>{{ pageData.importNote }} &nbsp;</el-form-item>
        </el-form>
        <el-form
            :style="{
                '--form-input-width': '200px',
                '--form-label-width': '100px',
            }"
        >
            <div class="base-subheading-box">{{ Translate('IDCS_SYSTEM_BACKUPCONFIG_LOG') }}</div>
            <el-form-item :label="isSupportH5 ? '' : Translate('IDCS_PATH')">
                <el-input
                    v-if="!isSupportH5"
                    type="text"
                    readonly
                    :model-value="exportFormData.filePath"
                />
                <el-button
                    v-if="!isSupportH5"
                    @click="handleBrowse"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
                <el-button
                    :disabled="pageData.isExportDisabled"
                    @click="handleExport"
                >
                    {{ Translate('IDCS_EXPORT') }}
                </el-button>
                <el-checkbox-group
                    v-model="exportFormData.configSwitch"
                    class="inline"
                >
                    <el-checkbox
                        v-for="item in pageData.configSwitchOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>{{ pageData.exportNote }} &nbsp;</el-form-item>
        </el-form>
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
