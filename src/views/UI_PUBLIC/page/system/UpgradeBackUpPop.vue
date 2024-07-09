<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 16:34:23
 * @Description: 系统升级-备份弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 19:29:24
-->
<template>
    <el-dialog
        :title="Translate('IDCS_BACKUP')"
        width="450"
        align-center
        draggable
        :show-close="false"
        @opened="opened"
    >
        <div class="UpgradeBackUp">
            <el-form
                ref="formRef"
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
                    ></el-input>
                    <el-button @click="chooseFile">
                        <BaseImgSprite
                            file="filechooser"
                            :index="1"
                            :chunk="4"
                        />
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./UpgradeBackUpPop.v.ts"></script>

<style lang="scss" scoped>
.UpgradeBackUp {
    .el-input {
        width: 250px;
    }
}
</style>
