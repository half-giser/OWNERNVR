<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 前端掉线
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <BaseTableRowStatus :icon="row.status" />
                    </template>
                </el-table-column>
                <!-- 通道名 -->
                <el-table-column
                    :label="Translate('IDCS_NAME')"
                    width="205"
                    show-overflow-tooltip
                    prop="name"
                />
                <!-- 抓图   -->
                <el-table-column width="195">
                    <template #header>
                        <AlarmBaseSnapPop
                            :visible="pageData.isSnapPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            exclude
                            @confirm="changeSnap"
                        />
                    </template>
                    <template #default="{ row, $index }: TableColumn<AlarmEventDto>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="row.snap.switch"
                                :disabled="row.disabled"
                                @change="switchSnap($index)"
                            />
                            <el-button
                                :disabled="!row.snap.switch || row.disabled"
                                @click="openSnap($index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 音频   -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="145"
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.sysAudio"
                            :options="pageData.audioList"
                            :disabled="row.disabled"
                        />
                    </template>
                </el-table-column>
                <!-- 消息推送   -->
                <el-table-column width="170">
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.msgPush"
                            :disabled="row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- 报警输出   -->
                <el-table-column width="195">
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.isAlarmOutPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="{ row, $index }: TableColumn<AlarmEventDto>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="row.alarmOut.switch"
                                :disabled="row.disabled"
                                @change="switchAlarmOut($index)"
                            />
                            <el-button
                                :disabled="!row.alarmOut.switch || row.disabled"
                                @click="openAlarmOut($index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 预置点名称   -->
                <el-table-column
                    align="center"
                    width="195"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="{ row, $index }: TableColumn<AlarmEventDto>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="row.preset.switch"
                                :disabled="row.disabled"
                                @change="switchPreset($index)"
                            />
                            <el-button
                                :disabled="!row.preset.switch || row.disabled"
                                @click="openPreset($index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- FTPSnap   -->
                <!-- <el-table-column
                v-if="pageData.supportFTP"
                width="175"
            >
                <template #header>
                    <el-dropdown >
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_SNAP_TO_FTP') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in pageData.enableList"
                                    :key="item.value"
                                    @click="handleFtpSnapChangeAll(item.value)"
                                >
                                    {{ item.label }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }: TableColumn<AlarmEventDto>">
                    <el-select-v2
                        v-model="row.ftpSnap"
                        :disabled="row.disabled"
                        :options="pageData.enableList"
                    />
                </template>
            </el-table-column> -->
                <!-- 蜂鸣器   -->
                <el-table-column width="124">
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.beeper"
                            :options="pageData.enableList"
                            :disabled="row.disabled"
                        />
                    </template>
                </el-table-column>
                <!-- 视频弹出   -->
                <el-table-column width="140">
                    <template #header>
                        <el-dropdown max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoPopupList"
                                        :key="item.value"
                                        @click="changeAllVideoPopUp(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.videoPopupInfo.chl.value"
                            :disabled="row.disabled"
                            :options="row.videoPopupList"
                        />
                    </template>
                </el-table-column>
                <!-- 消息框弹出   -->
                <el-table-column width="175">
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.msgBoxPopup"
                            :disabled="row.disabled"
                            :options="pageData.enableList"
                        />
                    </template>
                </el-table-column>
                <!-- email   -->
                <el-table-column width="115">
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
                    <template #default="{ row }: TableColumn<AlarmEventDto>">
                        <el-select-v2
                            v-model="row.email"
                            :disabled="row.disabled"
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
    </div>
</template>

<script lang="ts" src="./IpcOffline.v.ts"></script>
