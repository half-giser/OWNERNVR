<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-23 15:33:22
 * @Description: 新增人脸组弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-24 10:50:12
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_GROUP')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            label-position="left"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_GROUP_NAME')"
                prop="name"
            >
                <el-input v-model="formData.name" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./LiveSnapAddFaceGroupPop.v.ts"></script>
