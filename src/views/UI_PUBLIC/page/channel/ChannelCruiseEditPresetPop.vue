<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:47:23
 * @Description: 云台-巡航线-新增/编辑预置点弹窗
-->
<template>
    <el-dialog
        :title="type === 'add' ? Translate('IDCS_ADD_PRESET') : Translate('IDCS_EDIT_PRESET')"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_PRESET_NAME')"
                prop="name"
            >
                <el-select-v2
                    v-model="formData.name"
                    :options="pageData.nameOptions"
                    :props="{
                        value: 'label',
                    }"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DURATION')">
                <el-select-v2
                    v-model="formData.holdTime"
                    :options="pageData.timeOptions"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SPEED')">
                <el-select-v2
                    v-model="formData.speed"
                    :options="pageData.speedOptions"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseEditPresetPop.v.ts"></script>
