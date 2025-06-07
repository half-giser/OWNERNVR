<!--
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:28
-->
<template>
    <el-form
        v-title
        class="stripe"
    >
        <el-form-item :label="Translate('IDCS_DELAY')">
            <BaseSelect
                v-model="formData.buzzerDuration"
                :options="pageData.buzzerDurationOption"
                empty-text=""
            />
        </el-form-item>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </el-form>
</template>

<script lang="ts" src="./Buzzer.v.ts"></script>
