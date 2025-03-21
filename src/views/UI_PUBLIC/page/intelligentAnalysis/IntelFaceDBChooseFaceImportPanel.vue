<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:58:12
 * @Description: 智能分析 - 选择人脸 - 从外部导入
-->
<template>
    <div class="upload">
        <input
            id="upload-import"
            type="file"
            hidden
            :accept="type === 'import' ? '.csv,.txt,.jpg,.jpeg' : '.jpg,.jpeg'"
            multiple
            @change="handleH5Import"
        />
        <label
            v-show="mode === 'h5'"
            for="upload-import"
            class="el-button"
        >
            {{ btnName }}
        </label>
        <el-button
            v-show="mode === 'ocx'"
            @click="handleOCXImport"
        >
            {{ btnName }}
        </el-button>
        <p>{{ tips }}</p>
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
