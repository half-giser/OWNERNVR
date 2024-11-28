<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 14:37:28
 * @Description: POS信息弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_POS_INFORMATION')"
        :width="600"
        @open="open"
    >
        <div>
            <el-form>
                <el-form-item :label="Translate('IDCS_POS_SOURCE')">
                    {{ pageData.name || item.chlName }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    {{ displayDateTime(item.startTime) }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    {{ displayDateTime(item.endTime) }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_INFORMATION')" />
                <div
                    v-clean-html="pageData.info"
                    class="textarea"
                ></div>
            </el-form>
        </div>
        <div class="base-btn-box">
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupPosInfoPop.v.ts"></script>

<style lang="scss" scoped>
.textarea {
    display: block;
    width: calc(100% - 20px);
    height: 300px;
    border: 1px solid var(--content-border);
    box-sizing: border-box;
    padding: 10px;
    margin: 10px;
}
</style>
