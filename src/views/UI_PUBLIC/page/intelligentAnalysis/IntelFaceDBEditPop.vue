<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 10:25:33
 * @Description: 人脸库- 新增/编辑分组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 18:16:35
-->
<template>
    <el-dialog
        :title="type === 'edit' ? Translate('IDCS_EDIT_GROUP') : Translate('IDCS_ADD_GROUP')"
        width="400"
        append-to-body
        @open="open"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_GROUP_NAME')"
                prop="groupName"
            >
                <el-input v-model="formData.groupName" />
            </el-form-item>
            <el-form-item v-show="type === 'edit'">
                <el-checkbox
                    v-model="formData.enableAlarmSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBEditPop.v.ts"></script>
