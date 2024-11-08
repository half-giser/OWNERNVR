<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:05
 * @Description: AI/事件——事件通知——推送
-->
<template>
    <el-form
        ref="pushRef"
        :model="pushFormData"
        :style="{
            '--form-input-width': '215px',
            '--form-label-width': '200px',
        }"
        inline-message
    >
        <div class="base-subheading-box">{{ Translate('IDCS_PUSH_MESSAGE') }}</div>
        <el-form-item>
            <el-checkbox
                v-model="pushFormData.chkEnable"
                :label="Translate('IDCS_ENABLE')"
            />
        </el-form-item>
        <el-form-item :label="Translate('IDCS_PUSH_SCHEDULE')">
            <el-select
                v-model="pushFormData.pushSchedule"
                :disabled="!pushFormData.chkEnable"
            >
                <el-option
                    v-for="item in pageData.scheduleOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-select>
        </el-form-item>
        <div class="base-btn-box">
            <el-button
                :disabled="!pushFormData.chkEnable"
                @click="testMobile"
                >{{ Translate('IDCS_TEST') }}</el-button
            >
            <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button>
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </el-form>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="handleSchedulePopClose"
    />
</template>

<script lang="ts" src="./Push.v.ts"></script>
