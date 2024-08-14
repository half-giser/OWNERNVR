<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-01 10:55:14
 * @Description: 回放-本地备份任务 进度弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-07 09:29:55
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :show-close="false"
        width="600"
        align-center
        draggable
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
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PlaybackBackUpLocalPop.v.ts"></script>

<style lang="scss" scoped>
.chunk {
    margin-top: 10px;
}

.tip {
    text-align: center;
}
</style>
