<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 17:18:39
 * @Description: 导出人脸库弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :show-close="false"
        :width="600"
        @open="open"
    >
        <div class="box">
            <el-progress
                :percentage="progress"
                :stroke-width="8"
            />
            <p class="tip">{{ Translate('IDCS_EXPORTING_FACE_LIB_INFO') }}</p>
        </div>
        <div class="base-btn-box">
            <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBExportPop.v.ts"></script>

<style lang="scss" scoped>
.box {
    margin-top: 10px;
}

.tip {
    text-align: center;
}
</style>
