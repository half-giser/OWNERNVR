<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
-->
<template>
    <el-dialog
        :title="pageData.title"
        width="500"
        height="220"
        @open="open"
    >
        <el-form
            :style="{
                '--form-label-width': '100px',
                '--form-input-width': '230px',
            }"
        >
            <el-form-item :label="Translate('IDCS_PATH')">
                <el-input v-model="pageData.uploadFileName" />
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
        <div class="tips">
            <div v-show="pageData.isIpcTipsShow">
                <span>{{ pageData.audioFilesSizeTips }}</span>
            </div>
            <div v-show="pageData.isLocalTipsShow">
                <span>{{ pageData.localFilesSizeTips }}</span>
                <!-- <span>{{ Translate('IDCS_SELECT_MP3_FILE') }}</span> -->
            </div>
            <div class="fileFormatTips">{{ pageData.audioFormatTips }}</div>
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
