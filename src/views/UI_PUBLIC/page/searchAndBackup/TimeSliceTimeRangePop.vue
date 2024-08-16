<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 09:41:57
 * @Description: 设置时间范围弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 17:30:23
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_BACKUP_TIME')"
        :width="500"
        align-center
        draggable
        @open="open"
    >
        <el-form label-position="left">
            <el-form-item :label="Translate('IDCS_START_TIME')">
                <el-time-picker
                    v-model="formData.startTime"
                    :format="timeFormat"
                    :value-format="timeFormat"
                    :disabled-hours="disabledStartTimeHours"
                    :disabled-minutes="disabledStartTimeMinutes"
                    :disabled-seconds="disabledStartTimeSeconds"
                    :clearable="false"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_END_TIME')">
                <el-time-picker
                    v-model="formData.endTime"
                    :format="timeFormat"
                    :value-format="timeFormat"
                    :disabled-hours="disabledEndTimeHours"
                    :disabled-minutes="disabledEndTimeMinutes"
                    :disabled-seconds="disabledEndTimeSeconds"
                    :clearable="false"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./TimeSliceTimeRangePop.v.ts"></script>
