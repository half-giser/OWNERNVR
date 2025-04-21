<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 09:41:57
 * @Description: 设置时间范围弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_BACKUP_TIME')"
        :width="450"
        @open="open"
    >
        <el-form
            v-title
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_START_TIME')">
                <BaseTimePicker
                    v-model="formData.startTime"
                    :range="[null, formData.endTime]"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_END_TIME')">
                <BaseTimePicker
                    v-model="formData.endTime"
                    :range="[formData.startTime, null]"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./TimeSliceTimeRangePop.v.ts"></script>
