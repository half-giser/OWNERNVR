<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:47
 * @Description: 移动侦测
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                highlight-current-row
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status" />
                    </template>
                </el-table-column>
                <!-- 通道名 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="150"
                    show-overflow-tooltip
                    prop="name"
                />
                <!-- 排程 -->
                <el-table-column width="130">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        @click="changeAllSchedule(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.schedule"
                            :disabled="scope.row.disabled"
                            :options="pageData.scheduleList"
                            @change="changeSchedule(scope.row)"
                        />
                    </template>
                </el-table-column>
                <!-- 录像   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseRecordPop
                            :visible="pageData.isRecordPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeRecord"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.record.switch"
                                :disabled="scope.row.disabled"
                                @change="switchRecord(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.record.switch || scope.row.disabled"
                                @click="openRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 抓图   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseSnapPop
                            :visible="pageData.isSnapPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeSnap"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                :disabled="scope.row.disabled"
                                @change="switchSnap(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.snap.switch || scope.row.disabled"
                                @click="openSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="165"
                >
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
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.sysAudio"
                            :options="pageData.audioList"
                            :disabled="scope.row.disabled"
                        />
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column width="150">
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
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.msgPush"
                            :disabled="scope.row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 报警输出   -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.isAlarmOutPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                :disabled="scope.row.disabled"
                                @change="switchAlarmOut(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch || scope.row.disabled"
                                @click="openAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 预置点名称   -->
                <el-table-column
                    width="180"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                :disabled="scope.row.disabled"
                                @change="switchPreset(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.preset.switch || scope.row.disabled"
                                @click="openPreset(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 蜂鸣器   -->
                <el-table-column width="119">
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
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.beeper"
                            :disabled="scope.row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 视频弹出   -->
                <el-table-column width="135">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        @click="changeAllVideoPopUp(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.videoPopup"
                            :disabled="scope.row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- email   -->
                <el-table-column width="110">
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
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.email"
                            :disabled="scope.row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-pagination-box">
            <BasePagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :total="pageData.totalCount"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button @click="handleMotionSetting">
                {{ Translate('IDCS_MOTION_SETTING') }}
            </el-button>
            <el-button
                :disabled="!editRows.size()"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <AlarmBasePresetPop
            v-model="pageData.isPresetPop"
            :data="tableData"
            :index="pageData.triggerDialogIndex"
            @confirm="changePreset"
        />
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./MotionEventConfig.v.ts"></script>
