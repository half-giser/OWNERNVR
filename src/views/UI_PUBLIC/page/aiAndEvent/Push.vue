<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:05
 * @Description: AI/事件——事件通知——推送
-->
<template>
    <el-form
        ref="pushRef"
        :style="{
            '--form-input-width': '258px',
            '--form-label-width': '200px',
        }"
    >
        <div class="base-subheading-box">{{ Translate('IDCS_PUSH_MESSAGE') }}</div>
        <el-form-item>
            <el-checkbox
                v-model="formData.chkEnable"
                :label="Translate('IDCS_ENABLE')"
            />
        </el-form-item>
        <el-form-item :label="Translate('IDCS_PUSH_SCHEDULE')">
            <el-select-v2
                v-model="formData.pushSchedule"
                :options="pageData.scheduleOption"
                :disabled="!formData.chkEnable"
            />
        </el-form-item>
        <div class="base-btn-box">
            <el-button
                :disabled="!formData.chkEnable"
                @click="testData"
            >
                {{ Translate('IDCS_TEST') }}
            </el-button>
            <el-button @click="pageData.isSchedulePop = true">{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button>
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </el-form>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.isSchedulePop"
        @close="closeSchedulePop"
    />
</template>

<script lang="ts" src="./Push.v.ts"></script>
