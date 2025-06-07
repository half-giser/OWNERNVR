<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-01 10:23:43
 * @Description: 备份录像弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_BACKUP')"
        :width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_DESTINATION')">
                <BaseSelect
                    v-model="formData.destination"
                    :options="pageData.destinationOptions"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.destination === 'local'"
                :label="Translate('IDCS_FORMAT')"
            >
                <BaseSelect
                    v-model="formData.localFormat"
                    :options="pageData.localFormatOptions"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.destination === 'local' && mode === 'ocx'"
                :label="Translate('IDCS_PATH')"
                prop="localPath"
                class="path"
            >
                <el-input
                    :model-value="formData.localPath"
                    readonly
                    class="path-input"
                />
                <BaseImgSpriteBtn
                    file="filechooser"
                    @click="openFolder"
                />
            </el-form-item>
            <div
                v-if="formData.destination === 'local'"
                class="base-btn-box flex-start"
            >
                <span class="text-error">{{ Translate('IDCS_AVI_UNENCRYPTED_TIP') }}</span>
            </div>
            <el-form-item
                v-if="formData.destination === 'remote'"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <BaseSelect
                    v-model="formData.remoteDeviceName"
                    :options="pageData.remoteDeviceOptions"
                    :props="{
                        value: 'name',
                        label: 'name',
                    }"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.destination === 'remote'"
                :label="Translate('IDCS_FORMAT')"
            >
                <BaseSelect
                    v-model="formData.remoteFormat"
                    :options="pageData.remoteFormatOptions"
                />
            </el-form-item>
        </el-form>
        <BackupRemoteEncryptPop
            v-model="pageData.isRemoteEncryptPop"
            :encrypt="formData.remoteFormat !== 'AVI'"
            @confirm="confirmCreateRecBackupTask"
            @close="pageData.isRemoteEncryptPop = false"
        />
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupPop.v.ts"></script>

<style lang="scss" scoped>
.path {
    :deep(.el-form-item__content) {
        flex-wrap: nowrap !important;
    }

    :deep(.el-input) {
        flex-shrink: 1 !important;
    }

    :deep(.el-button) {
        margin-right: 0 !important;
    }
}
</style>
