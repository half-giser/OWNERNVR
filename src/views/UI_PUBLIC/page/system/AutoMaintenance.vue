<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 17:25:13
 * @Description: 自动维护
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-24 18:30:24
-->
<template>
    <div>
        <el-form
            ref="formRef"
            class="stripe"
            label-position="left"
            hide-required-asterisk
            inline-message
            :rules
            :model="formData"
            :style="{
                '--form-input-width': '220px',
                '--form-label-width': '150px',
            }"
        >
            <el-form-item>
                <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_INTERVAL_DAYS')"
                prop="interval"
            >
                <el-input
                    v-model="formData.interval"
                    type="number"
                    :placeholder="Translate('IDCS_INTERVAL_DAYS')"
                />
                <span class="date_span">{{ Translate('IDCS_DAYS') }}</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_POINT_TIME')"
                prop="time"
            >
                <el-time-picker
                    v-model="formData.time"
                    format="HH:mm"
                    editable
                    prefix-icon=""
                    :placeholder="Translate('IDCS_POINT_TIME')"
                />
            </el-form-item>
            <p
                v-show="pageData.isAutoResttartTip"
                class="tip"
            >
                {{ pageData.autoRestartTip }}
            </p>
            <div class="base-btn-box">
                <el-button
                    class="btn-ok"
                    @click="verify"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./AutoMaintenance.v.ts"></script>

<style lang="scss" scoped>
.tip {
    margin: 0;
    padding-top: 10px;
    padding-left: 15px;
    font-size: 15px;
}
</style>
