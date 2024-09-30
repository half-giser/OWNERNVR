<!--
 * @Description: AI/事件——事件通知——推送
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:05
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-29 13:51:53
-->
<template>
    <el-form
        ref="pushRef"
        :model="pushFormData"
        class="stripe"
        :style="{
            '--form-input-width': '215px',
        }"
        label-position="left"
        inline-message
    >
        <div class="base-subheading-box">{{ Translate('IDCS_PUSH_MESSAGE') }}</div>
        <el-form-item>
            <el-checkbox v-model="pushFormData.chkEnable">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
        </el-form-item>
        <el-form-item
            prop="popVideoDuration"
            :label="Translate('IDCS_PUSH_SCHEDULE')"
        >
            <el-select
                v-model="pushFormData.pushSchedule"
                :disabled="!pushFormData.chkEnable"
            >
                <el-option
                    v-for="item in pageData.scheduleOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                >
                </el-option>
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
        @close="pageData.scheduleManagPopOpen = false"
    />
</template>

<script lang="ts" src="./Push.v.ts"></script>
