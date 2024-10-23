<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-14 17:06:01
 * @Description: 报警服务器
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-22 11:16:02
-->
<template>
    <div class="base-flex-box">
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        >
        </ScheduleManagPop>
        <el-dialog
            v-model="pageData.showAlarmTransfer"
            :title="Translate('IDCS_ALARM_TYPE')"
            width="615px"
            draggable
            center
            :visible="pageData.showAlarmTransfer"
            @close="pageData.showAlarmTransfer = false"
        >
            <el-transfer
                v-model="pageData.linkedAlarmList"
                :data="pageData.alarmList"
                :props="{
                    key: 'id',
                    label: 'value',
                }"
                :titles="[Translate('IDCS_ALARM'), Translate('IDCS_SEND_ALARM')]"
            />
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="setAlarmTypes()">{{ Translate('IDCS_OK') }}</el-button>
                        <el-button @click="pageData.showAlarmTransfer = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
        <div class="base-subheading-box">{{ Translate('IDCS_ALARM_SERVER') }}</div>
        <!-- 表单 -->
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="form narrow inline-message"
            label-position="left"
            label-width="172px"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item
                prop="enable"
                label-width="0px"
            >
                <el-checkbox v-model="formData.enable">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <!-- 多UI -->
            <!-- deviceId -->
            <el-form-item
                v-if="pageData.isAnothorUI || pageData.deviceIdShow"
                prop="deviceId"
                :label="Translate('IDCS_ID')"
            >
                <el-input
                    v-model="formData.deviceId"
                    maxlength="6"
                    :disabled="!formData.enable"
                />
            </el-form-item>
            <!-- Token -->
            <el-form-item
                v-if="pageData.isAnothorUI"
                prop="Token"
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
                    @input="checkAddress"
                />
            </el-form-item>
            <!-- url -->
            <el-form-item
                prop="url"
                :label="Translate('IDCS_SERVER_URL')"
            >
                <el-input
                    v-model="formData.url"
                    :disabled="!(formData.enable && !pageData.urlDisabled)"
                    maxlength="60"
                    @input="checkUrl"
                />
            </el-form-item>
            <!-- port -->
            <el-form-item
                prop="port"
                :label="Translate('IDCS_PORT')"
            >
                <BaseNumberInput
                    v-model="formData.port"
                    :disabled="!formData.enable"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <!-- protocol -->
            <el-form-item
                prop="protocol"
                :label="Translate('IDCS_PROTOCOL')"
            >
                <el-select
                    v-model="formData.protocol"
                    :disabled="!formData.enable"
                    value-key="value"
                    :options="pageData.protocolOptions"
                    @change="handleProtocolChange()"
                >
                    <el-option
                        v-for="item in pageData.protocolOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <br />
            <!-- heartEnable -->
            <el-form-item
                prop="heartEnable"
                label-width="0px"
            >
                <el-checkbox
                    v-model="formData.heartEnable"
                    :disabled="!(formData.enable && !pageData.heartEnableDisabled)"
                    >{{ Translate('IDCS_SEND_HEARTBEAT') }}</el-checkbox
                >
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
                <el-select
                    v-model="formData.schedule"
                    prop="schedule"
                    :disabled="!formData.enable"
                    value-key="value"
                    :options="pageData.scheduleList"
                >
                    <el-option
                        v-for="item in pageData.scheduleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-button
                    class="btn"
                    :disabled="!formData.enable"
                    @click="pageData.scheduleManagePopOpen = true"
                >
                    {{ Translate('IDCS_MANAGE') }}
                </el-button>
            </el-form-item>
        </el-form>
        <!-- 表格 -->
        <div class="base-table-box">
            <el-table
                v-show="pageData.showAlarmTypeCfg"
                :data="tableData"
                class="table"
                border
            >
                <el-table-column
                    prop="alarmType"
                    :label="Translate('IDCS_ALARM_TYPE')"
                >
                    <template #header>
                        <el-row class="tabel_header">
                            <span>{{ Translate('IDCS_ALARM_TYPE') }}</span>
                            <el-button
                                class="btn"
                                :disabled="!formData.enable"
                                @click="pageData.showAlarmTransfer = true"
                                >{{ Translate('IDCS_CONFIG') }}</el-button
                            >
                        </el-row>
                    </template>
                    <template #default="scope">
                        <span class="table_item">{{ scope.row.value }}</span>
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
                @click="testAlarmServer()"
                >{{ Translate('IDCS_TEST') }}</el-button
            >
            <el-button @click="applyAlarmSever()">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./AlarmServer.v.ts"></script>

<style lang="scss" scoped>
.base-table-box {
    width: 438px;
}

.tabel_header {
    width: 428px;
    display: flex;
    justify-content: space-between;
}

.table_item {
    width: 428px;
    text-align: left;
    display: block;
}
</style>
