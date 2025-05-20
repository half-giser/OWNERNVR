<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 16:34:23
 * @Description: 系统升级-备份弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_BACKUP')"
        width="450"
        :show-close="false"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :rules
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_PATH')"
                prop="filePath"
            >
                <el-input
                    :model-value="formData.filePath"
                    readonly
                />
                <BaseImgSpriteBtn
                    file="filechooser"
                    @click="chooseFile"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./UpgradeBackUpPop.v.ts"></script>
