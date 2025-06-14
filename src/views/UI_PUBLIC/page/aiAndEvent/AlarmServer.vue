<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-14 17:06:01
 * @Description: 报警服务器
-->
<template>
    <div class="base-flex-box">
        <div class="base-head-box">{{ Translate('IDCS_ALARM_SERVER') }}</div>
        <!-- 表单 -->
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.enable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item
                v-if="(pageData.supportAdditionalServerSetting && formData.protocol === 'ARISAN') || formData.protocol === 'JSON'"
                prop="deviceId"
                :label="Translate('IDCS_ID')"
            >
                <el-input
                    v-model="formData.deviceId"
                    :maxlength="pageData.supportAdditionalServerSetting ? 16 : 6"
                    :disabled="!formData.enable"
                />
            </el-form-item>
            <!-- Token  -->
            <el-form-item
                v-if="pageData.supportAdditionalServerSetting && formData.protocol === 'ARISAN'"
                prop="token"
                :label="Translate('Token')"
            >
                <el-input
                    v-model="formData.token"
                    :disabled="!formData.enable"
                    maxlength="256"
                />
            </el-form-item>
            <!-- address -->
            <el-form-item
                prop="address"
                :label="Translate('IDCS_SERVER_ADDRESS')"
            >
                <el-input
                    v-model="formData.address"
                    :disabled="!formData.enable"
                    maxlength="60"
                    :formatter="formatUrl"
                    :parser="formatUrl"
                />
            </el-form-item>
            <!-- url -->
            <el-form-item :label="Translate('IDCS_SERVER_URL')">
                <el-input
                    v-model="formData.url"
                    :disabled="!formData.enable || formData.protocol !== 'XML'"
                    :formatter="formatUrl"
                    :parser="formatUrl"
                />
            </el-form-item>
            <!-- port -->
            <el-form-item :label="Translate('IDCS_PORT')">
                <BaseNumberInput
                    v-model="formData.port"
                    :disabled="!formData.enable"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <!-- protocol -->
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <BaseSelect
                    v-model="formData.protocol"
                    :disabled="!formData.enable"
                    :options="pageData.protocolOptions"
                />
            </el-form-item>
            <!-- heartEnable -->
            <el-form-item prop="heartEnable">
                <el-checkbox
                    v-model="formData.heartEnable"
                    :disabled="!formData.enable"
                    :label="Translate('IDCS_SEND_HEARTBEAT')"
                />
            </el-form-item>
            <!-- interval -->
            <el-form-item
                prop="interval"
                :label="Translate('IDCS_INTERVAL_TIME')"
            >
                <BaseNumberInput
                    v-model="formData.interval"
                    :disabled="!(formData.heartEnable && formData.enable)"
                    :min="5"
                    :max="65535"
                />
            </el-form-item>
            <!-- schedule -->
            <el-form-item
                prop="schedule"
                :label="Translate('IDCS_SCHEDULE')"
            >
                <BaseScheduleSelect
                    v-model="formData.schedule"
                    :options="pageData.scheduleList"
                    :disabled="!formData.enable"
                    @edit="pageData.isSchedulePop = true"
                />
            </el-form-item>
        </el-form>
        <!-- 表格 -->
        <div class="base-table-box">
            <el-table
                v-show="formData.protocol === 'XML'"
                :data="tableData"
                class="table"
            >
                <el-table-column>
                    <template #header>
                        <div class="tabel_header">
                            <span>{{ Translate('IDCS_ALARM_TYPE') }}</span>
                            <el-button
                                class="btn"
                                :disabled="!formData.enable"
                                @click="pageData.showAlarmTransfer = true"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                    <template #default="{ row }: TableColumn<SelectOption<string, string>>">
                        <span class="table_item">{{ row.label }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            :style="{
                '--form-input-width': '270px',
            }"
        >
            <el-button
                :disabled="!formData.enable"
                @click="testData()"
            >
                {{ Translate('IDCS_TEST') }}
            </el-button>
            <el-button @click="applyData()">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
        <BaseTransferPop
            v-model="pageData.showAlarmTransfer"
            header-title="IDCS_ALARM_TYPE"
            source-title="IDCS_ALARM"
            target-title="IDCS_SEND_ALARM"
            :source-data="pageData.alarmList"
            :linked-list="linkedAlarmList"
            :limit="10000"
            @confirm="setAlarmTypes"
            @close="pageData.showAlarmTransfer = false"
        />
    </div>
</template>

<script lang="ts" src="./AlarmServer.v.ts"></script>

<style lang="scss" scoped>
.base-table-box {
    width: 415px;
}

.tabel_header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;
}

.table_item {
    text-align: left;
    display: block;
}
</style>
