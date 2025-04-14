<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 17:22:51
 * @Description: 新增预置点弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_PRESET')"
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
            <el-form-item :label="Translate('IDCS_PRESET')">
                <el-select-v2
                    v-model="formData.index"
                    :options="pageData.presetOptions"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PRESET_NAME')"
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
            <el-button
                :disabled="!pageData.presetOptions.length"
                @click="verify"
            >
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelPresetAddPop.v.ts"></script>
