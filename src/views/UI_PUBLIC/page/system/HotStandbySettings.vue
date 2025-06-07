<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-06-04 17:18:19
 * @Description: 热备机配置
-->
<template>
    <div>
        <el-form
            v-title
            class="config"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WORK_PATTERN')">
                <BaseSelect
                    v-model="formData.workMode"
                    :options="pageData.options"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="apply"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
        <!-- 热备机信息 -->
        <div
            v-if="initialSwitch && initialWorkMode === 'workMachineMode'"
            class="hot_standby_info"
        >
            <div class="base-head-box">{{ Translate('IDCS_HOT_STANDBY_MACHINE_INFO') }}</div>
            <el-form v-title>
                <el-form-item :label="Translate('IDCS_HOT_STANDBY_HOT_STANDBYMACHINE_IP')">
                    <span>{{ pageData.hotStandbyIp }}</span>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CONNECTION_STATUS')">
                    <span>{{ HOT_STANDBY_CONNECT_STATUS_MAPPING[pageData.hotStandbyConnectStatus] }}</span>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_HOT_STANDBY_WORK_STATUS')">
                    <span>{{ HOT_STANDBY_WORK_STATUS_MAPPING[pageData.hotStandbyWorkStatus] }}</span>
                </el-form-item>
            </el-form>
        </div>
        <!-- 工作机信息 -->
        <div
            v-if="initialSwitch && initialWorkMode === 'hotStandbyMode'"
            class="work_machine_info"
        >
            <div class="base-btn-box">
                <span>{{ Translate('IDCS_WORK_MACHINE_MANAGEMENT') }}</span>
                <el-button @click="addWorkMachine">
                    {{ Translate('IDCS_ADD') }}
                </el-button>
            </div>
            <div class="base-table-box">
                <el-table :data="tableData">
                    <!-- 序号 -->
                    <el-table-column
                        :label="Translate('IDCS_SERIAL_NUMBER')"
                        width="70"
                        show-overflow-tooltip
                    >
                        <template #default="{ row }: TableColumn<SystemWorkMachineDto>">
                            {{ displaySerialNum(row) }}
                        </template>
                    </el-table-column>
                    <!-- ip -->
                    <el-table-column
                        :label="Translate('IDCS_IP')"
                        prop="ip"
                        width="234"
                    />
                    <!-- 连接状态 -->
                    <el-table-column
                        :label="Translate('IDCS_CONNECTION_STATUS')"
                        width="170"
                        show-overflow-tooltip
                    >
                        <template #default="{ row }: TableColumn<SystemWorkMachineDto>">
                            {{ HOT_STANDBY_CONNECT_STATUS_MAPPING[row.connectStatus] }}
                        </template>
                    </el-table-column>
                    <!-- 工作状态 -->
                    <el-table-column
                        :label="Translate('IDCS_HOT_STANDBY_WORK_STATUS')"
                        width="170"
                        show-overflow-tooltip
                    >
                        <template #default="{ row }: TableColumn<SystemWorkMachineDto>">
                            {{ displayWorkStatus(row) }}
                        </template>
                    </el-table-column>
                    <!-- 编辑 -->
                    <el-table-column
                        :label="Translate('IDCS_EDIT')"
                        width="100"
                    >
                        <template #default="{ row }: TableColumn<SystemWorkMachineDto>">
                            <BaseImgSpriteBtn
                                file="edit2"
                                @click="editWorkMachine(row)"
                            />
                        </template>
                    </el-table-column>
                    <!-- 删除/全部删除 -->
                    <el-table-column
                        :label="Translate('IDCS_DELETE')"
                        width="100"
                    >
                        <template #header>
                            <BaseDropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_DELETE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="delAllWorkMachine">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </BaseDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<SystemWorkMachineDto>">
                            <BaseImgSpriteBtn
                                file="del"
                                @click="delWorkMachine(row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
    <!-- 鉴权弹框 -->
    <BaseCheckAuthPop
        v-model="pageData.isCheckAuthPop"
        @confirm="setData"
        @close="pageData.isCheckAuthPop = false"
    />
    <!-- 添加、编辑工作机弹框 -->
    <HotStandbyWorkMachineAddPop
        v-model="pageData.isWorkMachinePop"
        :type="pageData.workMachinePopType"
        :work-machine-data="pageData.currOperateRow"
        @confirm="confirmWorkMachine"
        @close="pageData.isWorkMachinePop = false"
    />
</template>

<script lang="ts" src="./HotStandbySettings.v.ts"></script>

<style lang="scss" scoped>
.config {
    margin-bottom: 30px !important;
}

.work_machine_info {
    .base-btn-box {
        justify-content: flex-start;
        align-items: center;

        span {
            margin-right: 24px;
        }
    }

    .base-table-box {
        width: 844px;
        height: 444px;
        margin-top: 24px;
    }
}
</style>
