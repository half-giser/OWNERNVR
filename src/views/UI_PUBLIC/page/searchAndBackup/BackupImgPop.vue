<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 17:23:56
 * @Description: 备份图像弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :width="500"
    >
        <el-form
            :style="{
                '--form-label-width': '100px',
            }"
        >
            <el-form-item :label="Translate('IDCS_DESTINATION')">
                <el-select-v2
                    v-model="formData.destination"
                    :options="pageData.destinationOptions"
                />
            </el-form-item>
            <el-form-item v-show="formData.destination === 'local'">
                <el-text class="text-error">{{ Translate('IDCS_IMG_UNENCRYPTED_TIP') }}</el-text>
            </el-form-item>
            <el-form-item
                v-show="formData.destination === 'remote'"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <el-select-v2
                    v-model="formData.remoteDeviceName"
                    :options="pageData.remoteDeviceOptions"
                    :props="{
                        value: 'name',
                        label: 'name',
                    }"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupImgPop.v.ts"></script>
