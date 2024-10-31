<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:08:21
 * @Description: 日期与时间
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 15:23:43
-->
<template>
    <div>
        <el-form
            class="stripe"
            :model="formData"
            inline-message
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
                <el-select v-model="formData.dateFormat">
                    <el-option
                        v-for="item in pageData.dateFormatOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                <el-select v-model="formData.timeFormat">
                    <el-option
                        v-for="item in pageData.timeFormatOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SYNC_WAY')">
                <el-select
                    v-model="formData.syncType"
                    @change="handleSyncTypeChange"
                >
                    <el-option
                        v-for="item in pageData.syncTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TIME_SERVER')">
                <el-select
                    v-model="formData.timeServer"
                    filterable
                >
                    <el-option
                        v-for="item in pageData.timeServerOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-subheading-box">{{ Translate('IDCS_TIMEZONE_DST') }}</div>
            <el-form-item :label="Translate('IDCS_TIME_ZONE')">
                <el-select v-model="formData.timeZone">
                    <el-option
                        v-for="(item, index) in pageData.timeZoneOption"
                        :key="item.timeZone"
                        :label="displayTimeZone(index)"
                        :value="item.timeZone"
                    />
                </el-select>
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
