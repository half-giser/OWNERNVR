<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:08:21
 * @Description: 日期与时间
-->
<template>
    <div>
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <div class="base-subheading-box">{{ Translate('IDCS_DATE_AND_TIME') }}</div>
            <el-form-item :label="Translate('IDCS_SYSTEM_TIME')">
                <el-date-picker
                    v-model="formData.systemTime"
                    :disabled="formData.isSync || formData.syncType === 'NTP'"
                    :value-format="formatSystemTime"
                    :format="formatSystemTime"
                    type="datetime"
                    :placeholder="Translate('IDCS_SYSTEM_TIME')"
                    @change="handleSystemTimeChange"
                    @visible-change="pendingSystemTimeChange"
                />
                <el-checkbox
                    v-model="formData.isSync"
                    class="is-sync"
                    :disabled="formData.syncType === 'NTP'"
                    :label="Translate('IDCS_SYNC_WITH_COMPUTER_TIME')"
                    @change="handleIsSyncChange"
                />
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
                <el-select-v2
                    v-model="formData.timeServer"
                    :options="pageData.timeServerOptions"
                    filterable
                    :disabled="formData.syncType !== 'NTP'"
                />
            </el-form-item>
            <div class="base-subheading-box">{{ Translate('IDCS_TIMEZONE_DST') }}</div>
            <el-form-item :label="Translate('IDCS_TIME_ZONE')">
                <el-select-v2
                    v-model="formData.timeZone"
                    :options="pageData.timeZoneOption"
                    :props="{ value: 'timeZone' }"
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

<style lang="scss" scoped>
.is-sync {
    margin-left: 10px;
}
</style>
