<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:08:21
 * @Description: 日期与时间
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="formRules"
        >
            <div class="base-head-box">{{ Translate('IDCS_DATE_AND_TIME') }}</div>
            <el-form-item :label="Translate('IDCS_SYSTEM_TIME')">
                <BaseDatePicker
                    v-model="formData.systemTime"
                    :disabled="formData.syncType === 'NTP'"
                    :format="formatSystemTime"
                    type="datetime"
                    :validate="handleBeforeSystemTimeChange"
                    @change="handleSystemTimeChange"
                    @visible-change="pendingSystemTimeChange"
                />
                <el-button
                    :disabled="formData.syncType === 'NTP'"
                    @click="handleIsSyncChange"
                >
                    {{ Translate('IDCS_SYNC_WITH_COMPUTER_TIME') }}
                </el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DATE_FORMAT')">
                <el-select-v2
                    v-model="formData.dateFormat"
                    :options="pageData.dateFormatOptions"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                <el-select-v2
                    v-model="formData.timeFormat"
                    :options="pageData.timeFormatOptions"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SYNC_WAY')">
                <el-select-v2
                    v-model="formData.syncType"
                    :options="pageData.syncTypeOptions"
                    @change="handleSyncTypeChange"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TIME_SERVER')">
                <BaseSelectInput
                    v-model="formData.timeServer"
                    :options="pageData.timeServerOptions"
                    :disabled="formData.syncType !== 'NTP'"
                    :maxlength="formData.timeServerMaxByteLen"
                    :validate="checkTimeServer"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.syncType === 'Gmouse'"
                :label="Translate('IDCS_BAUD_RATE')"
            >
                <BaseSelectInput
                    v-model="formData.gpsBaudRate"
                    :options="pageData.gpsBaudRateOptions"
                    :formatter="formatDigit"
                    :validate="checkGPSBaudRate"
                    :disabled="formData.syncType !== 'Gmouse'"
                />
            </el-form-item>
            <el-form-item
                :label="`${Translate('IDCS_NTP_INTERVAL')}[${Translate('IDCS_MINUTE')}]`"
                prop="ntpInterval"
            >
                <BaseNumberInput
                    v-model="formData.ntpInterval"
                    :min="formData.ntpIntervalMin"
                    :max="formData.ntpIntervalMax"
                    :disabled="formData.syncType === 'NTP'"
                    mode="blur"
                    @out-of-range="handleNtpIntervalOutOfRange"
                />
            </el-form-item>
            <div class="base-head-box">{{ Translate('IDCS_TIMEZONE_DST') }}</div>
            <el-form-item :label="Translate('IDCS_TIME_ZONE')">
                <el-select-v2
                    v-model="formData.timeZone"
                    :options="pageData.timeZoneOption"
                    :props="{ value: 'timeZone' }"
                    :persistent="true"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DST')">
                <el-checkbox
                    v-model="formData.enableDST"
                    :label="Translate('IDCS_ENABLE')"
                    :disabled="isDSTDisabled"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./DateAndTime.v.ts"></script>
