<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:58:12
 * @Description: 人脸库 - 选择人脸 - 从外部导入
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 17:52:57
-->
<template>
    <div class="upload">
        <input
            id="upload-import"
            type="file"
            hidden
            accept=".csv,.txt,.jpg,.jpeg"
            multiple
            @change="handleH5Import"
        />
        <label
            v-show="mode === 'h5'"
            for="upload-import"
            class="el-button"
        >
            {{ Translate('IDCS_IMPORT') }}
        </label>
        <el-button
            v-show="mode === 'ocx'"
            @click="handleOCXImport"
        >
            {{ Translate('IDCS_IMPORT') }}
        </el-button>
        <p>{{ Translate('IDCS_OPERATE_SNAPSHOT_MSPB') }} : *.jpg,*.jpeg {{ Translate('IDCS_FEATURE_LIBRARY_PICTRUE_LIMITE') }}</p>
    </div>
</template>

<script lang="ts" src="./IntelFaceDBChooseFaceImportPanel.v.ts"></script>

<style lang="scss" scoped>
.upload {
    width: 922px;
    height: 460px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>
