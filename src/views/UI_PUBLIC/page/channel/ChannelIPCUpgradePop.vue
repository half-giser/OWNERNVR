<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 16:04:24
 * @Description: 通道 - IPC升级弹窗
-->
<template>
    <el-dialog
        v-model="ipcUpgradePopVisiable"
        :title="Translate('IDCS_UPGRADE')"
        width="470"
        @opened="opened"
    >
        <el-form v-title>
            <el-form-item
                v-show="type === 'multiple'"
                :label="Translate('IDCS_PRODUCT_MODEL')"
            >
                <el-select-v2
                    v-model="selectedProductModel"
                    :options="productModelOptionList"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WEB_UPGRADE_S_1')">
                <el-input
                    v-model="fileName"
                    readonly
                />
                <el-button
                    v-if="!isSupportH5"
                    @click="handleOCXUpload"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
                <label
                    v-if="isSupportH5"
                    class="el-button"
                    for="h5Import"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </label>
                <input
                    id="h5Import"
                    type="file"
                    hidden
                    @change="handleH5Upload"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="btnOKDisabled"
                @click="save"
            >
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="ipcUpgradePopVisiable = false">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelIPCUpgradePop.v.ts"></script>
