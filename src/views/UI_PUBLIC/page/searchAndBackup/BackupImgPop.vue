<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 17:23:56
 * @Description: 备份图像弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_BACKUP')"
        :width="500"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :style="{
                '--form-label-width': '100px',
            }"
        >
            <el-form-item :label="Translate('IDCS_DESTINATION')">
                <el-select v-model="formData.destination">
                    <el-option
                        v-for="item in pageData.destinationOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item v-show="formData.destination === 'local'">
                <el-text class="text-error">{{ Translate('IDCS_AVI_UNENCRYPTED_TIP') }}</el-text>
            </el-form-item>
            <el-form-item
                v-show="formData.destination === 'remote'"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <el-select v-model="formData.remoteDeviceName">
                    <el-option
                        v-for="item in pageData.remoteDeviceOptions"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="base-btn-box">
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BackupImgPop.v.ts"></script>
