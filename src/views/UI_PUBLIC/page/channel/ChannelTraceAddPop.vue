<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 10:40:18
 * @Description: 新增轨迹弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_TRACE')"
        width="500"
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
                :label="Translate('IDCS_TRACE_NAME')"
                prop="name"
            >
                <el-input
                    v-model="formData.name"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelTraceAddPop.v.ts"></script>
