<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 17:22:51
 * @Description: 新增预置点弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-20 19:19:09
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_PRESET')"
        width="500"
        @open="open"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item :label="Translate('IDCS_PRESET')">
                <el-select v-model="formData.index">
                    <el-option
                        v-for="item in pageData.presetOptions"
                        :key="item"
                        :value="item"
                        :label="item"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PRESET_NAME')"
                prop="name"
            >
                <el-input
                    v-model="formData.name"
                    :maxlength="nameByteMaxLen"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="!pageData.presetOptions.length"
                        @click="verify"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelPresetAddPop.v.ts"></script>
