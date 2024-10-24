<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 视频丢失配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 17:32:21
-->
<template>
    <div class="base-flex-box">
        <BaseTransferDialog
            v-model="pageData.snapIsShow"
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="getSnapListSingle(tableData[pageData.triggerDialogIndex] || [])"
            :linked-list="tableData[pageData.triggerDialogIndex]?.snapList || []"
            :type="pageData.snapType"
            @confirm="snapConfirm"
            @close="snapClose"
        >
        </BaseTransferDialog>
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="pageData.alarmOutTargetTitle"
            :source-data="getAlarmOutListSingle(tableData[pageData.triggerDialogIndex] || [])"
            :linked-list="tableData[pageData.triggerDialogIndex]?.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        >
        </BaseTransferDialog>
        <SetPresetPop
            v-model="pageData.isPresetPopOpen"
            :filter-chl-id="pageData.presetChlId"
            :linked-list="pageData.presetLinkedList"
            :handle-preset-linked-list="handlePresetLinkedList"
            @close="presetClose"
        />
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                highlight-current-row
                show-overflow-tooltip
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status"></BaseTableRowStatus>
                    </template>
                </el-table-column>
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_NAME')"
                    width="205"
                />
                <!-- 抓图   -->
                <el-table-column width="195">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.snapPopoverVisible"
                            trigger="click"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_SNAP') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.snapPopoverVisible"
                                source-title="IDCS_TRIGGER_CHANNEL_SNAP"
                                target-title="IDCS_CHANNEL"
                                :source-data="pageData.snapList"
                                :linked-list="pageData.snapChosedIdsAll"
                                :type="pageData.snapType"
                                @confirm="snapConfirmAll"
                                @close="snapCloseAll"
                            >
                            </BaseTransferPop>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                :disabled="scope.row.rowDisable"
                                @change="checkChange(scope.$index, 'snap')"
                            ></el-checkbox>
                            <el-button
                                :disabled="!scope.row.snap.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="setSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column width="170">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
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
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
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
                <el-table-column width="195">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.alarmOutPopoverVisible"
                            trigger="click"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ALARM_OUT') }}
                                </BaseTableDropdownLink>
                            </template>
                            <BaseTransferPop
                                v-if="pageData.alarmOutPopoverVisible"
                                source-title="IDCS_TRIGGER_CHANNEL_SNAP"
                                target-title="IDCS_CHANNEL"
                                :source-data="pageData.alarmOutList"
                                :linked-list="pageData.alarmOutChosedIdsAll"
                                :type="pageData.alarmOutType"
                                @confirm="alarmOutConfirmAll"
                                @close="alarmOutCloseAll"
                            >
                            </BaseTransferPop>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.rowDisable"
                                @change="checkChange(scope.$index, 'alarmOut')"
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
                <!-- 预置点名称   -->
                <el-table-column
                    align="center"
                    width="195"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="scope">
                        <el-row class="row-together">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                :disabled="scope.row.rowDisable"
                                @change="presetSwitchChange(scope.row)"
                            ></el-checkbox>
                            <el-button
                                :disabled="!scope.row.preset.switch || scope.row.rowDisable"
                                class="table_btn"
                                @click="openPresetPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- FTPSnap   -->
                <!-- <el-table-column
                v-if="pageData.supportFTP"
                width="175"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_SNAP_TO_FTP') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in pageData.enableList"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                    @click="handleFtpSnapChangeAll(item.value)"
                                >
                                    {{ item.label }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-select
                        v-model="scope.row.ftpSnap"
                        :disabled="scope.row.rowDisable"
                        @change="addEditRow(scope.row)"
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
            </el-table-column> -->
                <!-- 蜂鸣器   -->
                <el-table-column width="124">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
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
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
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
                <!-- 视频弹出   -->
                <el-table-column width="140">
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            max-height="400"
                        >
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoPopupList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleVideoPopupChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoPopupInfo.chl.value"
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.videoPopupList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 消息框弹出   -->
                <el-table-column width="175">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
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
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
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
                <el-table-column width="115">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink> Email </BaseTableDropdownLink>
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
                            :disabled="scope.row.rowDisable"
                            @change="addEditRow(scope.row)"
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
        <div class="row_pagination">
            <el-pagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :page-sizes="pageData.pageDataCountItems"
                layout="prev, pager, next, sizes, total, jumper"
                :total="pageData.totalCount"
                size="small"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.applyDisable"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./VideoLoss.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
:deep(.el-table .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
