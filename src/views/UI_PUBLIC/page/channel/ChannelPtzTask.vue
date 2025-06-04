<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:58:09
 * @Description: 云台-任务
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="handlePlayerReady"
                />
            </div>
            <el-form
                ref="formRef"
                v-title
                :model="formData"
                :rules="formRule"
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
                        :persistent="true"
                        popper-class="intersect-ocx"
                        @change="changeChl"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FUNCTION')">
                    <el-select-v2
                        v-model="formData.type"
                        :options="pageData.typeOptions"
                        :disabled="!tableData.length"
                        :persistent="true"
                        popper-class="intersect-ocx"
                        @change="changeType"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_NAME')"
                    prop="editIndex"
                >
                    <el-select-v2
                        v-model="formData.editIndex"
                        :persistent="true"
                        popper-class="intersect-ocx"
                        :options="getNameOption(tableData[pageData.tableIndex], formData.type)"
                        :disabled="!tableData.length"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <BaseTimePicker
                        v-model="formData.startTime"
                        unit="minute"
                        :disabled="!tableData.length"
                        :range="[null, formData.endTime]"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_END_TIME')"
                    prop="endTime"
                >
                    <BaseTimePicker
                        v-model="formData.endTime"
                        unit="minute"
                        :disabled="!tableData.length"
                        :range="[formData.startTime, null]"
                    />
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="!tableData.length || !getNameOption(tableData[pageData.tableIndex], formData.type).length"
                        @click="setData"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                </div>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="getRowKey"
                    :expand-row-key="pageData.expandRowKey"
                    :border="false"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="{ row }: TableColumn<ChannelPtzTaskChlDto>">
                            {{ Translate('IDCS_TASK_NUM_D').formatForLang(row.tasks.length) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="data">
                            <el-table
                                v-title
                                :data="data.row.tasks"
                                highlight-current-row
                                show-overflow-tooltip
                                height="300"
                                class="expand-table"
                            >
                                <el-table-column
                                    :label="Translate('IDCS_SERIAL_NUMBER')"
                                    type="index"
                                    width="60"
                                />
                                <el-table-column :label="Translate('IDCS_ENABLE')">
                                    <template #header>
                                        <el-dropdown>
                                            <BaseTableDropdownLink>
                                                {{ Translate('IDCS_ENABLE') }}
                                            </BaseTableDropdownLink>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="changeTaskStatus">
                                                        {{ data.row.status ? Translate('IDCS_OFF') : Translate('IDCS_ON') }}
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                    <template #default>
                                        {{ data.row.status ? Translate('IDCS_ON') : Translate('IDCS_OFF') }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_START_TIME')">
                                    <template #default="{ row }: TableColumn<ChannelPtzTaskDto>">
                                        {{ displayTime(row.startTime) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_END_TIME')">
                                    <template #default="{ row }: TableColumn<ChannelPtzTaskDto>">
                                        {{ displayTime(row.endTime) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_FUNCTION')">
                                    <template #default="{ row }: TableColumn<ChannelPtzTaskDto>">
                                        {{ displayType(row.type) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_NAME')">
                                    <template #default="{ row }: TableColumn<ChannelPtzTaskDto>">
                                        {{ displayName(row.editIndex, row.type, data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column>
                                    <template #header>
                                        <el-dropdown>
                                            <BaseTableDropdownLink>
                                                {{ Translate('IDCS_OPERATION') }}
                                            </BaseTableDropdownLink>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="deleteAllTask(data)">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                    <template #default="{ row, $index }: TableColumn<ChannelPtzTaskDto>">
                                        <div class="base-cell-box">
                                            <BaseImgSpriteBtn
                                                file="edit2"
                                                @click="editTask(row, data.row)"
                                            />
                                            <BaseImgSpriteBtn
                                                file="del"
                                                @click="deleteTask($index, data.row)"
                                            />
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelPtzTaskEditPop
            v-model="pageData.isEditPop"
            :data="pageData.editData"
            :row="pageData.editRow"
            @confirm="confirmEditTask"
            @close="closeEditTask"
        />
    </div>
</template>

<script lang="ts" src="./ChannelPtzTask.v.ts"></script>
