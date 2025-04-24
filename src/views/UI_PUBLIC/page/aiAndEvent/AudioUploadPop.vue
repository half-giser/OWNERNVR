<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
-->
<template>
    <el-dialog
        :title="pageData.title"
        width="500"
        @open="open"
    >
        <el-form v-title>
            <el-form-item :label="Translate('IDCS_PATH')">
                <el-input
                    v-model="pageData.uploadFileName"
                    readonly
                />
                <label
                    for="upload-audio"
                    class="el-button"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </label>
                <input
                    id="upload-audio"
                    type="file"
                    hidden
                    :accept="pageData.uploadAccept"
                    @change="uploadFile"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box flex-start">
            <div class="text-error">
                <span v-if="pageData.isIpcTipsShow">{{ pageData.audioFilesSizeTips }}</span>
                <span v-if="pageData.isLocalTipsShow">{{ pageData.localFilesSizeTips }}</span>
                <br />
                <span>{{ pageData.audioFormatTips }}</span>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.btnApplyDisabled"
                @click="apply"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./AudioUploadPop.v.ts"></script>

<style lang="scss" scoped>
.audioUpload {
    :deep(.el-upload-list) {
        // 覆盖element上的样式
        margin-top: 0;
    }
}

.tips {
    color: var(--color-error);
    padding: 20px 0;
}
</style>
