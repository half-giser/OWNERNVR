<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 10:35:19
 * @Description: AI-联动-报警输出-选择面板
-->
<template>
    <div class="base-ai-linkage-box">
        <div class="base-ai-linkage-title">
            <span>{{ Translate('IDCS_ALARM_OUT') }}</span>
            <el-button @click="pageData.isPop = true">{{ Translate('IDCS_CONFIG') }}</el-button>
        </div>
        <el-scrollbar
            vertical
            height="367"
        >
            <ul class="base-ai-linkage-list">
                <li
                    v-for="item in modelValue"
                    :key="item.value"
                    v-title
                >
                    {{ item.label }}
                </li>
            </ul>
        </el-scrollbar>
        <BaseTransferPop
            v-model="pageData.isPop"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="pageData.alarmOutList"
            :linked-list="modelValue.map((item) => item.value) || []"
            limit-tip="IDCS_ALARMOUT_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseAlarmOutSelector.v.ts"></script>
