<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:08:21
 * @Description: 日期与时间
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-25 09:51:12
-->

<template>
    <div class="DateTime">
        <el-form
            class="form"
            label-position="left"
            :model="formData"
            hide-required-asterisk
            inline-message
        >
            <div class="title">{{ Translate('IDCS_DATE_AND_TIME') }}</div>
            <el-form-item :label="Translate('IDCS_SYSTEM_TIME')">
                <el-date-picker
                    v-model="formData.systemTime"
                    :disabled="formData.isSync || formData.syncType === 'NTP'"
                    :value-format="formatSystemTime"
                    :format="formatSystemTime"
                    :cell-class-name="handleCalendarCellHighLight"
                    clear-icon=""
                    type="datetime"
                    :placeholder="Translate('IDCS_SYSTEM_TIME')"
                    @change="handleSystemTimeChange"
                />
                <el-checkbox
                    v-model="formData.isSync"
                    class="is-sync"
                    :disabled="formData.syncType === 'NTP'"
                    @change="handleIsSyncChange"
                    >{{ Translate('IDCS_SYNC_WITH_COMPUTER_TIME') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DATE_FORMAT')">
                <el-select v-model="formData.dateFormat">
                    <el-option
                        v-for="item in pageData.dateFormatOptions"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                <el-select v-model="formData.timeFormat">
                    <el-option
                        v-for="item in pageData.timeFormatOptions"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SYNC_WAY')">
                <el-select v-model="formData.syncType">
                    <el-option
                        v-for="item in pageData.syncTypeOptions"
                        :key="item.value"
                        :label="item.name"
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
                        :label="item.name"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="title">{{ Translate('IDCS_TIMEZONE_DST') }}</div>
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
                    :disabled="isDSTDisabled"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
        </el-form>
        <div class="btns">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./DateAndTime.v.ts"></script>

<style lang="scss" scoped>
.DateTime {
    .form {
        :deep(.el-form-item__label) {
            width: 200px;
        }

        & > * {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__content) {
            flex-wrap: nowrap;
        }

        :deep(.el-input) {
            width: 250px;
            flex-shrink: 0;
        }

        .el-select {
            width: 250px;
            flex-shrink: 0;
        }
    }

    .is-sync {
        margin-left: 10px;
    }

    .btns {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }

    .title {
        width: 100%;
        height: 35px;
        font-weight: bold;
        padding: 0 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 35px;
        background-color: var(--bg-color4);
        box-sizing: border-box;
    }
}
</style>
