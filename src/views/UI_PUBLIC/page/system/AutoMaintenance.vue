<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 17:25:13
 * @Description: 自动维护
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :rules
            :model="formData"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_INTERVAL_DAYS')"
                prop="interval"
            >
                <BaseNumberInput
                    v-model="formData.interval"
                    :disabled="!formData.switch"
                    :min="1"
                    :max="365"
                />
                <span>{{ Translate('IDCS_DAYS') }}</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_POINT_TIME')"
                prop="time"
            >
                <BaseTimePicker
                    v-model="formData.time"
                    unit="minute"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item v-show="pageData.autoRestartTip">
                {{ pageData.autoRestartTip }}
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
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
