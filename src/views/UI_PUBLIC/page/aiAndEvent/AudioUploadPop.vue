<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_UPLOAD_VOICE')"
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
                    :accept="accept"
                    @change="uploadFile"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box flex-start">
            <div class="text-error">
                <span v-if="type === 'ipcAudio'">{{ Translate('IDCS_FILE_SIZE_LIMIT_TIP').formatForLang(displayFileSize, 10 - ipcData.audioTypeList.customize.length) }}</span>
                <span v-else>{{ Translate('IDCS_FILE_MAX_SIZE_LIMIT_TIP').formatForLang(displayFileSize) }}</span>
                <br />
                <span>{{ tips }}</span>
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
