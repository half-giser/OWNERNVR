<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-01 10:55:14
 * @Description: 本地备份任务 进度弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :show-close="false"
        :width="600"
        @open="open"
    >
        <div>
            <el-progress
                :percentage="pageData.progress"
                :stroke-width="14"
            />
            <div class="chunk">{{ pageData.currentTask }} / {{ backupList.length }}</div>
            <p class="tip">{{ Translate('IDCS_BACKUP_HOLD_ON') }}</p>
        </div>
        <div class="base-btn-box">
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupLocalPop.v.ts"></script>

<style lang="scss" scoped>
.chunk {
    margin-top: 10px;
}

.tip {
    text-align: center;
}
</style>
