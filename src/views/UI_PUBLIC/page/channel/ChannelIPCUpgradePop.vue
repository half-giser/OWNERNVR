<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 16:04:24
 * @Description:
-->
<template>
    <el-dialog
        v-model="ipcUpgradePopVisiable"
        :title="Translate('IDCS_UPGRADE')"
        width="440"
        align-center
        draggable
        @opened="opened"
    >
        <div class="ipcUpgrade">
            <el-row
                v-show="type === 'multiple'"
                class="elRowProductModel"
            >
                <el-col :span="7">{{ Translate('IDCS_PRODUCT_MODEL') }}: </el-col>
                <el-col :span="12">
                    <el-select v-model="selectedProductModel">
                        <el-option
                            v-for="item in productModelOptionList"
                            :key="item"
                            :value="item"
                            :label="item"
                        />
                    </el-select>
                </el-col>
            </el-row>
            <el-row class="elRowFileSel">
                <el-col :span="7">{{ Translate('IDCS_WEB_UPGRADE_S_1') }}</el-col>
                <el-col :span="12">
                    <el-input
                        v-model="fileName"
                        readonly
                    />
                </el-col>
                <el-col
                    :span="5"
                    class="elColImportBtn"
                >
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
                </el-col>
            </el-row>
        </div>
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

<style scoped lang="scss">
.ipcUpgrade {
    height: 85px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .elRowProductModel {
        margin-bottom: 20px;
        align-items: center;
    }

    .elRowFileSel {
        align-items: center;

        .elColImportBtn {
            padding-left: 5px;
        }
    }
}
</style>
