<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 15:04:03
 * @Description: 车牌库- 新增/编辑分组
-->
<template>
    <el-dialog
        :title="type === 'edit' ? Translate('IDCS_EDIT_GROUP') : Translate('IDCS_ADD_GROUP')"
        width="400"
        append-to-body
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_GROUP_NAME')"
                prop="groupName"
            >
                <el-input
                    v-model="formData.groupName"
                    maxlength="32"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelLicencePlateDBEditPop.v.ts"></script>
