<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 17:23:56
 * @Description: 备份图像弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :width="450"
        @open="open"
    >
        <el-form v-title>
            <el-form-item :label="Translate('IDCS_DESTINATION')">
                <BaseSelect
                    v-model="formData.destination"
                    :options="pageData.destinationOptions"
                />
            </el-form-item>
            <el-form-item v-show="formData.destination === 'local'">
                <span class="text-error">{{ Translate('IDCS_IMG_UNENCRYPTED_TIP') }}</span>
            </el-form-item>
            <el-form-item
                v-show="formData.destination === 'remote'"
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
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupImgPop.v.ts"></script>
