<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:45:21
 * @Description: S.M.A.R.T信息
-->
<template>
    <div class="base-flex-box">
        <el-form
            v-title
            class="stripe"
            :style="{
                '--form-label-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_DISK')">
                <BaseSelect
                    v-model="pageData.diskIndex"
                    :options="pageData.diskList"
                    :props="{
                        value: 'index',
                        label: 'diskNum',
                    }"
                    empty-text=""
                    @change="getDetail"
                />
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
                v-title
                :data="tableData"
                show-overflow-tooltip
                highlight-current-row
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
