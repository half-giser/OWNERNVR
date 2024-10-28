<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:45:21
 * @Description: S.M.A.R.T信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-18 10:40:41
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="form narrow"
            inline-message
            label-width="250"
            :style="{
                '--form-input-width': '340px',
            }"
        >
            <el-form-item :label="Translate('IDCS_DISK')">
                <el-select
                    v-model="pageData.diskIndex"
                    @change="getDetail"
                >
                    <el-option
                        v-for="(item, key) in pageData.diskList"
                        :key
                        :value="key"
                        :label="item.diskNum"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DISK_SERIAL_NUMBER')">
                {{ diskSerialNum }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DISK_TYPE')">
                {{ diskModel }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TEMPERATURE')">
                {{ pageData.diskTemperature }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_POWER_ON_HOURS')">
                {{ pageData.diskPowerOnHours }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DISK_SMART_STATE')">
                {{ pageData.diskStatus }}
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                show-overflow-tooltip
            >
                <el-table-column
                    :label="Translate('IDCS_DISK_SMART_ID')"
                    prop="id"
                />
                <el-table-column
                    :label="Translate('IDCS_ATTRIBUTE')"
                    prop="attribute"
                    width="250"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_SMART_VALUE')"
                    prop="value"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_SMART_WORSTVALUE')"
                    prop="worstValue"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_SMART_THRESHOLD')"
                    prop="threshold"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_SMART_RAWVALUE')"
                    prop="rawValue"
                />
                <el-table-column
                    :label="Translate('IDCS_STATE')"
                    prop="smartStatus"
                />
            </el-table>
        </div>
    </div>
</template>

<script lang="ts" src="./SmartInfo.v.ts"></script>
