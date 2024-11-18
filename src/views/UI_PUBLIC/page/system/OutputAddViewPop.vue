<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 20:56:15
 * @Description: 收藏视图
-->
<template>
    <el-dialog
        :title="Translate('IDCS_Add_CUSTOM_VIEW')"
        width="400"
        @open="open"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                prop="name"
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
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./OutputAddViewPop.v.ts"></script>
