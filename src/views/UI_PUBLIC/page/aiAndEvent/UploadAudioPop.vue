<!--
 * @Description: 
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-15 16:33:09
-->
<template>
    <el-dialog
        :title="pageData.title"
        width="500"
        height="220"
        align-center
        draggable
        @open="open"
    >
        <el-form
            label-width="100px"
            label-position="left"
        >
            <el-form-item :label="Translate('IDCS_PATH')">
                <el-input
                    v-model="pageData.uploadFileName"
                    :style="{ width: '240px' }"
                ></el-input>
                <el-upload
                    class="audioUpload"
                    :accept="pageData.uploadAccept"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="uploadFile"
                >
                    <el-button>{{ Translate('IDCS_BROWSE') }}</el-button>
                </el-upload>
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
        <el-row>
            <el-col
                :span="24"
                class="el-col-flex-end"
            >
                <el-button
                    :disabled="pageData.btnApplyDisabled"
                    :style="{ marginRight: '20px' }"
                    @click="apply"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script lang="ts" src="./UploadAudioPop.v.ts"></script>

<style lang="scss" scoped>
.audioUpload {
    :deep(.el-upload-list) {
        // 覆盖element上的样式
        margin-top: 0;
    }
}

.tips {
    color: red;
    padding: 20px 0px;
}
</style>
