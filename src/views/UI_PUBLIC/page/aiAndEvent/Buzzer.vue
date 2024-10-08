<!--
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:28
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-29 13:34:58
-->
<template>
    <el-form
        ref="popVideoRef"
        :model="formData"
        class="stripe"
        :style="{
            '--form-input-width': '215px',
        }"
        label-position="left"
        inline-message
    >
        <el-form-item
            prop="popVideoDuration"
            :label="Translate('IDCS_DELAY')"
        >
            <el-select v-model="formData.buzzerDuration">
                <el-option
                    v-for="value in pageData.buzzerDurationOption"
                    :key="value"
                    :value="value"
                    :label="displayDurationOption(value)"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <div
            class="base-btn-box"
            :style="{ paddingTop: '10px' }"
        >
            <el-button
                class="btn-ok"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </el-form>
</template>

<script lang="ts" src="./Buzzer.v.ts"></script>
