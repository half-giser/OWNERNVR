<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:15:37
 * @Description: 云台-任务-编辑弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_OPERATION')"
        width="500"
        @open="open"
        @before-close="close"
    >
        <el-form
            ref="formRef"
            :style="{
                '--form-label-width': '100px',
            }"
            :model="formData"
            :rules="formRule"
        >
            <el-form-item :label="Translate('IDCS_FUNCTION')">
                <el-select
                    v-model="formData.type"
                    @change="changeType"
                >
                    <el-option
                        v-for="item in pageData.typeOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_NAME')"
                prop="name"
            >
                <el-select v-model="formData.name">
                    <el-option
                        v-for="item in pageData.nameOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_START_TIME')">
                <el-time-picker
                    v-model="formData.startTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    parser=""
                    editable
                    prefix-icon=""
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_END_TIME')"
                prop="endTime"
            >
                <el-time-picker
                    v-model="formData.endTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    editable
                    prefix-icon=""
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="base-btn-box">
                <el-button
                    :disabled="!formData.name"
                    @click="verify"
                    >{{ Translate('IDCS_OK') }}</el-button
                >
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelPtzTaskEditPop.v.ts"></script>
