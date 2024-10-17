<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 20:56:15
 * @Description: 收藏视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 15:40:40
-->
<template>
    <el-dialog
        :title="Translate('IDCS_Add_CUSTOM_VIEW')"
        width="400"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="left"
        >
            <el-form-item
                prop="currentPassword"
                :label="Translate('IDCS_CUSTOM_VIEW_NAME')"
            >
                <el-input
                    v-model="formData.name"
                    type="text"
                    maxlength="64"
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

<script lang="ts" src="./OutputAddViewPop.v.ts"></script>
