<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 10:33:36
 * @Description: AI-联动-抓图-选择面板
-->
<template>
    <div class="base-ai-linkage-box">
        <div class="base-ai-linkage-title">
            <span>{{ Translate('IDCS_SNAP') }}</span>
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
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.snapList"
            :linked-list="modelValue.map((item) => item.value) || []"
            limit-tip="IDCS_SNAP_CHANNEL_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseSnapSelector.v.ts"></script>
