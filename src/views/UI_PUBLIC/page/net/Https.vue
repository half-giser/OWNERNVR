<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:19:49
 * @Description: HTTPS
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-16 19:46:46
-->
<template>
    <div>
        <el-form
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.httpsSwitch"
                    :disabled="pageData.httpSwitchDisabled"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
        </el-form>
        <!-- 已有证书 -->
        <el-form
            v-show="pageData.hasCert"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <div class="base-subheading-box">
                {{ Translate('IDCS_CERT_DETAILS') }}
            </div>
            <el-form-item :label="Translate('IDCS_INSTALLED_CERT')">
                <el-input
                    :model-value="certFormData.countryName"
                    readonly
                />
                <el-button
                    :disabled="pageData.isDeleteCertDisabled"
                    @click="deleteCertificate"
                    >{{ Translate('IDCS_DELETE') }}</el-button
                >
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DETAIL_INFO')">
                <el-input
                    :model-value="certFormData.content"
                    type="textarea"
                    class="textarea"
                    readonly
                />
            </el-form-item>
        </el-form>
        <!-- 证书安装 -->
        <el-form
            v-show="!pageData.hasCert"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <div class="base-subheading-box">
                {{ Translate('IDCS_CERT_INSTALLATION') }}
            </div>
            <el-form-item :label="Translate('IDCS_CERT_INSTALLATION')">
                <el-radio-group
                    v-model="formData.cert"
                    class="radio-group"
                >
                    <el-radio
                        v-for="item in pageData.certOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
            </el-form-item>
        </el-form>
        <!-- 创建私有证书 -->
        <el-form
            v-show="!pageData.hasCert && formData.cert === pageData.certOptions[0].value"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_CERT_DETAILS')">
                <el-button @click="createCertificate">{{ Translate('IDCS_CREATE') }}</el-button>
            </el-form-item>
        </el-form>
        <!-- 已有已签名证书，直接导入安装 -->
        <el-form
            v-show="!pageData.hasCert && formData.cert === pageData.certOptions[1].value"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_INSTALL_SIGNED_CERT')">
                <el-input
                    :model-value="directCertFormData.importFileName"
                    readonly
                />
                <el-button
                    v-show="!isSupportH5"
                    @click="handleOCXImport"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <input
                    id="h5BrowerImport2"
                    type="file"
                    hidden
                    accept=".crt"
                    :disabled="pageData.isBrowserImportCertDirectDisabled"
                    @change="handleH5Import"
                />
                <el-button
                    v-show="isSupportH5"
                    :disabled="pageData.isBrowserImportCertDirectDisabled"
                >
                    <label
                        for="h5BrowerImport2"
                        :class="{
                            disabled: pageData.isBrowserImportCertDirectDisabled,
                        }"
                        @click="preventH5Import"
                    >
                        {{ Translate('IDCS_BROWSE') }}
                    </label>
                </el-button>
                <el-button
                    :disabled="pageData.isImportCertDirectDisabled"
                    @click="inputCertPassword"
                    >{{ Translate('IDCS_IMPORT') }}</el-button
                >
            </el-form-item>
        </el-form>
        <!-- 创建证书请求 -->
        <el-form
            v-show="!pageData.hasCert && formData.cert === pageData.certOptions[2].value"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_CREATE_CERT_REQUEST')">
                <el-button
                    :disabled="pageData.isCreateCertReqDisabled"
                    @click="createCertificate"
                    >{{ Translate('IDCS_CREATE') }}</el-button
                >
                <el-text>{{ reqCertFormData.reqFileName || Translate('IDCS_NO_FILES') }}</el-text>
            </el-form-item>
            <!-- 导出证书请求 -->
            <el-form-item :label="Translate('IDCS_CERT_REQ_DOWNLOAD')">
                <el-input
                    v-show="!isSupportH5"
                    :model-value="reqCertFormData.exportFileName"
                    readonly
                />
                <el-button
                    v-show="!isSupportH5"
                    :disabled="pageData.isBrowseExportCertReqDisabled"
                    @click="browseExportCertificateRequest"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <el-button
                    :disabled="pageData.isExportCertReqDisabled"
                    @click="exportCertificateRequest"
                    >{{ Translate('IDCS_EXPORT') }}</el-button
                >
            </el-form-item>
            <!-- 删除证书请求 -->
            <el-form-item :label="Translate('IDCS_CERT_REQ_DELETION')">
                <el-button
                    :disabled="pageData.isDeleteCertReqDisabled"
                    @click="deleteCertificateRequest"
                    >{{ Translate('IDCS_DELETE') }}</el-button
                >
            </el-form-item>
            <!-- 导入证书请求 -->
            <el-form-item :label="Translate('IDCS_INSTALL_GENERATED_CERT')">
                <el-input
                    :model-value="reqCertFormData.importFileName"
                    readonly
                />
                <el-button
                    v-show="!isSupportH5"
                    @click="handleOCXImport"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <input
                    id="h5BrowerImport3"
                    type="file"
                    hidden
                    accept=".crt"
                    @change="handleH5Import"
                />
                <el-button v-show="isSupportH5">
                    <label
                        for="h5BrowerImport3"
                        @click="preventH5Import"
                    >
                        {{ Translate('IDCS_BROWSE') }}
                    </label>
                </el-button>
                <el-button
                    :disabled="pageData.isImportCertReqDisabled"
                    @click="importCertFile()"
                    >{{ Translate('IDCS_IMPORT') }}</el-button
                >
            </el-form-item>
        </el-form>
        <div
            class="base-btn-box"
            :style="{
                '--form-input-width': '335px',
            }"
        >
            <el-button @click="setNetPortConfig">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BasePluginNotice />
        <BaseNotification v-model:notifications="pageData.notifications" />
        <HttpsCertPasswordPop
            v-model="pageData.isCertPasswordPop"
            @confirm="importCertFile"
            @close="pageData.isCertPasswordPop = false"
        />
        <HttpsCreateCertPop
            v-model="pageData.isCreateCertPop"
            :type="formData.cert"
            @confirm="confirmCreateCertificate"
            @close="pageData.isCreateCertPop = false"
        />
    </div>
</template>

<script lang="ts" src="./Https.v.ts"></script>

<style lang="scss" scoped>
label {
    display: inline-block;

    &.disabled {
        cursor: not-allowed;
    }
}

.radio-group {
    display: block;

    :deep(.el-radio) {
        display: flex;
    }
}

.textarea :deep(.el-textarea__inner) {
    min-height: 100px !important;
}
</style>
