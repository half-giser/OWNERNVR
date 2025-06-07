<!--
 * @Date: 2025-05-08 13:44:16
 * @Description: 客流量配置
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="config">
        <el-form
            v-title
            class="stripe"
        >
            <div class="base-business-subheading">{{ Translate('IDCS_BASIC_CONFIG') }}</div>
            <div class="base-btn-box space-between">
                <div>{{ Translate('IDCS_STATISTICAL_CHANNEL') }}</div>
                <el-button @click="openChlPop">{{ Translate('IDCS_CONFIG') }}</el-button>
            </div>
            <div class="base-btn-box">
                <el-table
                    :show-header="false"
                    height="250"
                    :data="formData.chlList"
                >
                    <el-table-column prop="label" />
                </el-table>
            </div>

            <div class="base-business-subheading">{{ Translate('IDCS_RESET_INFO') }}</div>
            <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                <el-checkbox v-model="formData.switch" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_MODE')">
                <BaseSelect
                    v-model="formData.resetMode"
                    :options="pageData.resetModeOptions"
                    :disabled="!formData.switch"
                    @change="changeResetMode"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_TIME')"
                :style="{
                    '--form-input-width': '121px',
                }"
            >
                <BaseSelect
                    v-if="['WEEK', 'MONTH'].includes(formData.resetMode)"
                    v-model="formData.resetDay"
                    :options="formData.resetMode === 'WEEK' ? pageData.weekOption : pageData.monthOption"
                    :disabled="!formData.switch"
                />
                <BaseTimePicker
                    v-model="formData.resetTime"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <BaseTransferPop
            v-model="pageData.isPop"
            header-title="IDCS_SELECT_CHANNEL"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_STATISTICAL_CHANNEL"
            :source-data="pageData.chlList"
            :linked-list="linkedChlList"
            limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
            @confirm="changeChl"
            @close="pageData.isPop = false"
        />
    </div>
</template>

<script lang="ts" src="./PassengerFlowConfig.v.ts"></script>

<style lang="scss" scoped>
.config {
    padding: 25px 20px;
}
</style>
