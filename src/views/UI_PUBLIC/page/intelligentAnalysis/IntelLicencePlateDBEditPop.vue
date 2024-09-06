<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 15:04:03
 * @Description: 车牌库- 新增/编辑分组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-03 11:35:59
-->
<template>
    <el-dialog
        :title="type === 'edit' ? Translate('IDCS_EDIT_GROUP') : Translate('IDCS_ADD_GROUP')"
        width="400"
        align-center
        draggable
        append-to-body
        @open="open"
    >
        <el-form
            ref="formRef"
            label-position="left"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_GROUP_NAME')"
                prop="groupName"
            >
                <el-input v-model="formData.groupName" />
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

<script lang="ts" src="./IntelLicencePlateDBEditPop.v.ts"></script>
