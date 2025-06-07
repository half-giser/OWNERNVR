<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:21
 * @Description: 业务应用-停车场管理-出入口
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column
                    type="index"
                    width="70"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                />
                <el-table-column
                    prop="channelName"
                    min-width="200"
                    :label="Translate('IDCS_ENTRY_AND_EXIT_LANE_NAME')"
                />
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_DIRECTION')"
                >
                    <template #default="{ row }: TableColumn<BusinessParkEnterExitManageList>">
                        <BaseSelect
                            v-model="row.direction"
                            :options="row.directionList"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="ipc"
                    width="400"
                    :label="Translate('IPC')"
                />
                <el-table-column
                    width="150"
                    :label="Translate('IDCS_COMMON_STATE')"
                >
                    <template #default="{ row }: TableColumn<BusinessParkEnterExitManageList>">
                        <span :class="getChlStatus(row.id)">{{ getChlStatus(row.id) === 'text-online' ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    width="150"
                    :label="Translate('IDCS_ALARM_OUT')"
                    min-width="200"
                >
                    <template #default="{ row }: TableColumn<BusinessParkEnterExitManageList>">
                        <!-- 不支持【报警输出】的摄像机（例如：9823型号），报警输出字段置灰不可编辑 -->
                        <BaseSelect
                            v-model="row.relateAlarmOuts"
                            :options="pageData.relateAlarmOutsList"
                            :disabled="!pageData.supportAudioAlarmOutChlList.includes(row.id)"
                        />
                        <!-- <BaseSelect
                            v-else
                            model-value=""
                            :options="[]"
                            disabled
                        /> -->
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_ENABLE_LED_SCREEN')"
                >
                    <template #default="{ row }: TableColumn<BusinessParkEnterExitManageList>">
                        <el-checkbox
                            v-model="row.enableLEDScreen"
                            :disabled="!row.enableLEDScreenValid"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    min-width="200"
                    :label="Translate('IDCS_RELATION_LED_SCREEN')"
                >
                    <template #default="{ row }: TableColumn<BusinessParkEnterExitManageList>">
                        <BaseSelect
                            v-model="row.LEDScreenType"
                            :options="pageData.screenList"
                            :disabled="!row.LEDScreenTypeValid"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box padding">
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./ParkEnterExitManage.v.ts"></script>
