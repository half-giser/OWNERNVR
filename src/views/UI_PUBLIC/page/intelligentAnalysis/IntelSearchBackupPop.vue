<!--
 * @Author: xujipeng
 * @Date: 2025-05-23 14:42:46
 * @Description: 智能分析 -- 搜索 -- 备份
 * 搜索 = 人（人脸、人体和属性）+ 车（机动车、非机动车和车牌号）+ 停车场（进出记录）
 * 备份 = 图片（抓拍图、原图、可见光图、热成像图） + 录像 + （图片+录像）
-->
<template>
    <el-dialog
        v-model="pageData.isShowDialog"
        :title="pageData.title"
        :show-close="pageData.isShowDialogClose"
        :width="500"
    >
        <el-form
            v-show="pageData.isShowForm"
            ref="formRef"
            v-title
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_DESTINATION')">
                <BaseSelect
                    v-model="pageData.destination"
                    :options="pageData.destinationList"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_FORMAT')">
                <BaseSelect
                    v-model="pageData.format"
                    :options="pageData.formatList"
                />
            </el-form-item>
        </el-form>
        <div
            v-show="pageData.isShowProgress"
            class="box"
        >
            <el-progress
                :percentage="pageData.progress"
                :stroke-width="8"
            />
            <div class="chunk">{{ pageData.currentTask }} / {{ pageData.taskNum }}</div>
            <p class="tip">{{ Translate('IDCS_BACKUP_HOLD_ON') }}</p>
        </div>
        <div class="base-btn-box">
            <el-button
                v-show="pageData.isShowOKBtn"
                @click="handleBackup()"
            >
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="pageData.isShowDialog = false">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelSearchBackupPop.v.ts"></script>

<style lang="scss" scoped>
.box {
    margin-top: 10px;
}

.tip {
    text-align: center;
}
</style>
