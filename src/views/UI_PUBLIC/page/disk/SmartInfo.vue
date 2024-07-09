<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:45:21
 * @Description: S.M.A.R.T信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 18:31:33
-->
<template>
    <div class="SmartInfo">
        <el-form
            class="form"
            inline-message
            label-width="250px"
            label-position="left"
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
                <el-text>{{ diskNum }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DISK_TYPE')">
                <el-text>{{ diskModel }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TEMPERATURE')">
                <el-text>{{ pageData.diskTemperature }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_POWER_ON_HOURS')">
                <el-text>{{ pageData.diskPowerOnHours }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DISK_SMART_STATE')">
                <el-text>{{ pageData.diskStatus }}</el-text>
            </el-form-item>
        </el-form>
        <el-table
            :data="tableData"
            border
            stripe
        >
            <el-table-column
                :label="Translate('IDCS_DISK_SMART_ID')"
                prop="id"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_ATTRIBUTE')"
                prop="attribute"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_SMART_VALUE')"
                prop="value"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_SMART_WORSTVALUE')"
                prop="worstValue"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_SMART_THRESHOLD')"
                prop="threshold"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_SMART_RAWVALUE')"
                prop="rawValue"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_STATE')"
                prop="smartStatus"
            >
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./SmartInfo.v.ts"></script>

<style lang="scss" scoped>
.SmartInfo {
    .form {
        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 5px 0 5px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }
        margin-bottom: 10px;

        .el-select {
            width: 340px;
        }
    }

    :deep(.el-table) {
        height: calc(100vh - 500px);
    }
}
</style>
