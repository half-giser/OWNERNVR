<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:44
 * @Description: 通道组 - 编辑弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_GROUP')"
        width="460"
        @opened="opened"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_GROUP_NAME')"
            >
                <el-input
                    v-model="formData.name"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STAY_TIME')">
                <el-select-v2
                    v-model="formData.dwellTime"
                    :options="timeList"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelGroupEditPop.v.ts"></script>
