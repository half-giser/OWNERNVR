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
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            label-position="left"
            inline-message
            class="inline-message"
        >
            <el-form-item
                v-show="type === 'multiple'"
                :label="Translate('IDCS_PRODUCT_MODEL')"
            >
                <el-select v-model="selectedProductModel">
                    <el-option
                        v-for="item in productModelOptionList"
                        :key="item"
                        :value="item"
                        :label="item"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WEB_UPGRADE_S_1')">
                <el-input
                    v-model="fileName"
                    readonly
                />
                <el-upload
                    v-if="isSupportH5"
                    ref="upload"
                    :limit="1"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleChange"
                >
                    <template #trigger>
                        <el-button>{{ Translate('IDCS_BROWSE') }}</el-button>
                    </template>
                </el-upload>
                <el-button
                    v-else
                    @click="handleOcxBtnClick"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button
                    :disabled="btnOKDisabled"
                    @click="save"
                    >{{ Translate('IDCS_OK') }}</el-button
                >
                <el-button @click="ipcUpgradePopVisiable = false">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelIPCUpgradePop.v.ts"></script>
