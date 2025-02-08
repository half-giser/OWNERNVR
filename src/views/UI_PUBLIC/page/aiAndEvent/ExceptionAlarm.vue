<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                highlight-current-row
                show-overflow-tooltip
            >
                <!-- 事件类型 -->
                <el-table-column
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="375"
                >
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        {{ formatEventType(scope.row.eventType) }}
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column v-if="pageData.supportAudio">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_AUDIO') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioList"
                                        :key="item.value"
                                        @click="changeAllAudio(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <el-select-v2
                            v-model="scope.row.sysAudio"
                            :options="pageData.audioList"
                        />
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="changeAllMsgPush(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <el-select-v2
                            v-model="scope.row.msgPush"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 报警输出   -->
                <el-table-column>
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.isAlarmOutPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                @change="switchAlarmOut(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch"
                                @click="openAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 蜂鸣器   -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="changeAllBeeper(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <el-select-v2
                            v-model="scope.row.beeper"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 消息框弹出   -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="changeAllMsgPopUp(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <el-select-v2
                            v-model="scope.row.msgBoxPopup"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- email   -->
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink> Email </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="changeAllEmail(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope: TableColumn<AlarmExceptionDto>">
                        <el-select-v2
                            v-model="scope.row.email"
                            :disabled="scope.row.emailDisable"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between">
            <div class="tips_text">
                {{ Translate('IDCS_DISK_FAILURE_TIPS').formatForLang(Translate('IDCS_DISK_FAILURE')) }}
            </div>
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./ExceptionAlarm.v.ts"></script>
