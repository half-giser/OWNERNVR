<!--
 * @Date: 2025-05-12 11:17:36
 * @Description: IP规划弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DEV_CHANNEL_IP_PLANNING')"
        width="500"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form>
            <el-form-item>
                <el-checkbox
                    v-model="formData.enable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <div class="base-btn-box flex-start">
                <span>{{ Translate('IDCS_DEV_CHANNEL_IP_PLANNING_TEXT') }}</span>
            </div>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddDevChlIpPlanningPop.v.ts"></script>
