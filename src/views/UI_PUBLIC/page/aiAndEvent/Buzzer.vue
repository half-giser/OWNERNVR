<!--
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:28
-->
<template>
    <el-form
        ref="popVideoRef"
        :model="formData"
        class="stripe"
        :style="{
            '--form-input-width': '215px',
        }"
        inline-message
    >
        <el-form-item :label="Translate('IDCS_DELAY')">
            <el-select v-model="formData.buzzerDuration">
                <el-option
                    v-for="item in pageData.buzzerDurationOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-select>
        </el-form-item>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </el-form>
</template>

<script lang="ts" src="./Buzzer.v.ts"></script>
