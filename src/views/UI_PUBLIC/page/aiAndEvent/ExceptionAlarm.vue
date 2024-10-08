<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-29 15:02:22
-->
<template>
    <div class="base-flex-box">
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            :header-title="pageData.alarmOutHeaderTitle"
            :source-title="pageData.alarmOutSourceTitle"
            :target-title="pageData.alarmOutTargetTitle"
            :source-data="pageData.alarmOutList"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        >
        </BaseTransferDialog>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                highlight-current-row
                show-overflow-tooltip
            >
                <!-- 事件类型 -->
                <el-table-column
                    prop="eventType"
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="375px"
                >
                    <template #default="scope">
                        <span>{{ formatEventType(scope.row.eventType) }}</span>
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    prop="sysAudio"
                    width="155px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_AUDIO') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleSysAudioChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.sysAudio"
                            prop="sysAudio"
                            value-key="value"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.audioList"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.audioList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column
                    prop="msgPush"
                    width="194px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_PUSH') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleMsgPushChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.msgPush"
                            prop="schedule"
                            value-key="value"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.enableList"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 报警输出   -->
                <el-table-column
                    prop="alarmOut"
                    width="215px"
                >
                    <template #header>
                        <el-dropdown
                            ref="alarmOutRef"
                            trigger="click"
                            :hide-on-click="false"
                            placement="bottom-end"
                        >
                            <span
                                class="el-dropdown-link"
                                @click="alarmOutDropdownOpen"
                            >
                                {{ Translate('IDCS_ALARM_OUT') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        <BaseTransferPop
                                            v-if="pageData.alarmOutIsShowAll"
                                            :source-title="pageData.alarmOutSourceTitle"
                                            :target-title="pageData.alarmOutTargetTitle"
                                            :source-data="pageData.alarmOutList"
                                            :linked-list="pageData.alarmOutChosedIdsAll"
                                            :type="pageData.alarmOutType"
                                            @confirm="alarmOutConfirmAll"
                                            @close="alarmOutCloseAll"
                                        >
                                        </BaseTransferPop>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="alarmOutSwitchChange(scope.row)"
                            ></el-checkbox>
                            <el-button
                                :disabled="!scope.row.alarmOut.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 蜂鸣器   -->
                <el-table-column
                    prop="beeper"
                    width="260px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_BUZZER') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleBeeperChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.beeper"
                            prop="beeper"
                            value-key="value"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.enableList"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 消息框弹出   -->
                <el-table-column
                    prop="msgBoxPopup"
                    width="260px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleMsgBoxPopupChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.msgBoxPopup"
                            prop="msgBoxPopup"
                            value-key="value"
                            :disabled="scope.row.rowDisable"
                            :options="pageData.enableList"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- email   -->
                <el-table-column
                    prop="email"
                    width="260px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                Email <el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleEmailChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.email"
                            prop="email"
                            value-key="value"
                            :disabled="scope.row.rowDisable || scope.row.emailDisable"
                            :options="pageData.enableList"
                            @change="addEditRow()"
                        >
                            <el-option
                                v-for="item in pageData.enableList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-row
            class="base-btn-box"
            :span="2"
        >
            <div>
                {{ Translate('IDCS_DISK_FAILURE_TIPS').formatForLang(Translate('IDCS_DISK_FAILURE')) }}
            </div>
            <div>
                <el-button
                    :disabled="pageData.applyDisable"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-row>
    </div>
</template>

<script lang="ts" src="./ExceptionAlarm.v.ts"></script>

<style lang="scss" scoped>
.row-together {
    width: fit-content;
    .table_btn {
        margin-left: 5px;
    }
}
:deep(.el-table .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
