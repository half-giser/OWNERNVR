<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 09:41:57
 * @Description: 设置时间范围弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_BACKUP_TIME')"
        :width="500"
        @open="open"
    >
        <el-form>
            <el-form-item :label="Translate('IDCS_START_TIME')">
                <el-time-picker
                    v-model="formData.startTime"
                    :format="dateTime.timeFormat"
                    :value-format="dateTime.timeFormat"
                    :disabled-hours="pickerRange.disabledStartTimeHours"
                    :disabled-minutes="pickerRange.disabledStartTimeMinutes"
                    :disabled-seconds="pickerRange.disabledStartTimeSeconds"
                    :clearable="false"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_END_TIME')">
                <el-time-picker
                    v-model="formData.endTime"
                    :format="dateTime.timeFormat"
                    :value-format="dateTime.timeFormat"
                    :disabled-hours="pickerRange.disabledEndTimeHours"
                    :disabled-minutes="pickerRange.disabledEndTimeMinutes"
                    :disabled-seconds="pickerRange.disabledEndTimeSeconds"
                    :clearable="false"
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
