<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 10:58:27
 * @Description: 普通事件——传感器
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
                highlight-current-row
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseTableRowStatus :icon="row.status" />
                    </template>
                </el-table-column>

                <!-- 序号 -->
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="120"
                    show-overflow-tooltip
                    prop="serialNum"
                />

                <!-- 名称 -->
                <el-table-column
                    width="150"
                    :label="Translate('IDCS_NAME')"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <el-input
                            v-model="row.name"
                            maxlength="32"
                            :disabled="row.disabled"
                            @focus="focusName(row.name)"
                            @blur="blurName(row)"
                            @keyup.enter="blurInput"
                        />
                    </template>
                </el-table-column>

                <!-- 排程 -->
                <el-table-column width="130">
                    <template #header>
                        <BaseScheduleTableDropdown
                            :options="pageData.scheduleList"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseScheduleSelect
                            v-model="row.schedule"
                            :disabled="row.disabled"
                            :options="pageData.scheduleList"
                            @edit="openSchedulePop"
                        />
                    </template>
                </el-table-column>

                <!-- 类型 -->
                <el-table-column width="100">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_TYPE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.typeList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'type')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.type"
                            :options="pageData.typeList"
                            :disabled="!row.type || row.alarmInType === 'virtual' || !row.isEditable || row.disabled"
                        />
                    </template>
                </el-table-column>

                <!-- 启用 -->
                <el-table-column width="100">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENABLE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'switch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.switch"
                            :options="pageData.switchList"
                            :disabled="row.disabled || !row.switch || !row.isEditable"
                        />
                    </template>
                </el-table-column>

                <!-- 持续时间 -->
                <el-table-column width="120">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DURATION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.durationList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'holdTime')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.holdTime"
                            :options="pageData.durationList"
                            :disabled="row.disabled || !row.holdTime || !row.isEditable"
                        />
                    </template>
                </el-table-column>

                <!-- 录像 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseRecordPop
                            :visible="pageData.isRecordPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeRecord"
                        />
                    </template>
                    <template #default="{ row, $index }: TableColumn<AlarmSensorEventDto>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="row.record.switch"
                                :disabled="row.disabled"
                                @change="switchRecord($index)"
                            />
                            <el-button
                                :disabled="!row.record.switch || row.disabled"
                                @click="openRecord($index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 抓图 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseSnapPop
                            :visible="pageData.isSnapPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeSnap"
                        />
                    </template>
                    <template #default="{ row, $index }: TableColumn<AlarmSensorEventDto>">
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

                <!-- 声音，supportAudio -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="190"
                >
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_AUDIO') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'sysAudio')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.sysAudio"
                            :options="pageData.audioList"
                            :disabled="row.disabled"
                        />
                    </template>
                </el-table-column>

                <!-- 推送 -->
                <el-table-column width="100">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'msgPushSwitch')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.msgPushSwitch"
                            :disabled="row.disabled"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>

                <!-- 报警输出 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.isAlarmOutPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="{ row, $index }: TableColumn<AlarmSensorEventDto>">
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

                <!-- 预置点名称 -->
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    width="180"
                >
                    <template #default="{ row, $index }: TableColumn<AlarmSensorEventDto>">
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

                <!-- 蜂鸣器 -->
                <el-table-column width="100">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'buzzerSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.buzzerSwitch"
                            :disabled="row.disabled"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>

                <!-- 视频弹出 -->
                <el-table-column width="125">
                    <template #header>
                        <BaseDropdown :max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoPopupChlList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'popVideo')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.popVideo"
                            :disabled="row.disabled"
                            :options="pageData.videoPopupChlList"
                        />
                    </template>
                </el-table-column>

                <!-- 消息框弹出 -->
                <el-table-column width="170">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'popMsgSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.popMsgSwitch"
                            :disabled="row.disabled"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>
                <!-- Email -->
                <el-table-column width="100">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink> Email </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'emailSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSensorEventDto>">
                        <BaseSelect
                            v-model="row.emailSwitch"
                            :disabled="row.disabled"
                            :options="pageData.switchList"
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
                @click="setData()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <!-- 预置点名称 -->
        <AlarmBasePresetPop
            v-model="pageData.isPresetPop"
            :data="tableData"
            :index="pageData.triggerDialogIndex"
            @confirm="changePreset"
        />
        <!-- 排程管理弹窗 -->
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./SensorEventConfig.v.ts"></script>
