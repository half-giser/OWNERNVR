<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-14 17:06:01
 * @Description: 
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-23 14:43:51
-->
<template>
    <div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="pageData.scheduleManagePopOpen = false"
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
        <div class="content_main">
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                class="form"
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
                <el-form-item
                    v-show="pageData.isAnothorUI || pageData.deviceIdShow"
                    prop="deviceId"
                    :label="Translate('IDCS_ID')"
                >
                    <el-input
                        v-model="formData.deviceId"
                        :maxlength="pageData.maxDeviceIdLength"
                        :disabled="!formData.enable"
                    />
                </el-form-item>
                <el-form-item
                    v-show="pageData.isAnothorUI"
                    prop="Token"
                    :label="Translate('Token')"
                >
                    <el-input
                        v-model="formData.token"
                        :disabled="!formData.enable"
                    />
                </el-form-item>
                <el-form-item
                    prop="address"
                    :label="Translate('IDCS_SERVER_ADDRESS')"
                >
                    <el-input
                        v-model="formData.address"
                        :disabled="!formData.enable"
                    />
                </el-form-item>
                <el-form-item
                    prop="url"
                    :label="Translate('IDCS_SERVER_URL')"
                >
                    <el-input
                        v-model="formData.url"
                        :disabled="!(formData.enable && !pageData.urlDisabled)"
                    />
                </el-form-item>
                <el-form-item
                    prop="port"
                    :label="Translate('IDCS_PORT')"
                >
                    <el-input-number
                        v-model="formData.port"
                        :disabled="!formData.enable"
                        :min="10"
                        :max="65535"
                        :controls="false"
                    />
                </el-form-item>
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
                <el-form-item
                    prop="interval"
                    :label="Translate('IDCS_INTERVAL_TIME')"
                >
                    <el-input-number
                        v-model="formData.interval"
                        :disabled="!(formData.heartEnable && formData.enable)"
                        :min="5"
                        :max="65535"
                        :controls="false"
                    />
                </el-form-item>
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
            <el-table
                v-show="pageData.showAlarmTypeCfg"
                :data="tableData"
                class="table"
                stripe
                border
            >
                <el-table-column
                    prop="alarmType"
                    :label="Translate('IDCS_ALARM_TYPE')"
                >
                    <template #header>
                        <el-row class="tabel_header">
                            <span class="table_cell_header">{{ Translate('IDCS_ALARM_TYPE') }}</span>
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
            <div class="btn-box">
                <el-button
                    class="btn"
                    :disabled="!formData.enable"
                    @click="testAlarmServer()"
                    >{{ Translate('IDCS_TEST') }}</el-button
                >
                <el-button
                    class="btn"
                    @click="applyAlarmSever()"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./AlarmServer.v.ts"></script>

<style lang="scss" scoped>
#n9web .el-form .el-form-item {
    padding: 1px 0px 2px 15px;
    margin-bottom: 0;
    :deep(.el-form-item__error) {
        padding: 0;
        margin-top: -22px;
        margin-left: -40px;
        text-align: right;
    }
}
.el-form {
    --el-form-label-font-size: 15px;
    .el-checkbox {
        color: black;
        --el-checkbox-font-size: 15px;
    }
}
.content_main {
    padding: 20px 0px 0px 0px;
    .form {
        width: 600px;
        font-size: 15px;

        .el-form-item {
            font-size: 15px;
            .span {
                font-size: 15px;
            }
            .btn {
                height: 28px;
                width: 80px;
            }
        }
    }
    .table {
        margin-left: 10px;
        width: 428px;
        height: 285px;
        display: flex;
        .tabel_header {
            display: flex;
            .table_cell_header {
                margin-right: 260px;
            }
            .btn {
                height: 28px;
                width: 80px;
            }
        }
        .table_item {
            display: flex;
            justify-content: flex-start;
            margin-left: 4px;
        }
    }
    .btn-box {
        width: 438px;
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
        .btn {
            height: 28px;
            width: 80px;
            margin-left: 30px;
        }
    }
}
</style>
