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
                :style="{
                    '--form-label-width': '100px',
                }"
                :model="formData"
                :rules="formRule"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
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
                        @change="changeType"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_NAME')"
                    prop="name"
                >
                    <el-select-v2
                        v-model="formData.name"
                        :options="pageData.nameOptions"
                        :disabled="!tableData.length"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <el-time-picker
                        v-model="formData.startTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        :disabled="!tableData.length"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_END_TIME')"
                    prop="endTime"
                >
                    <el-time-picker
                        v-model="formData.endTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        :disabled="!tableData.length"
                    />
                </el-form-item>
                <div class="base-btn-box padding">
                    <el-button
                        :disabled="!tableData.length || !formData.name"
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
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="{ row }: TableColumn<ChannelPtzTaskChlDto>">
                            {{ Translate('IDCS_TASK_NUM_D').formatForLang(row.taskItemCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="data">
                            <el-table
                                v-title
                                :data="pageData.expandRowKey.includes(data.row.chlId) ? taskTableData : []"
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
                                <el-table-column
                                    :label="Translate('IDCS_ENABLE')"
                                    prop="enable"
                                >
                                    <template #header>
                                        <el-dropdown>
                                            <BaseTableDropdownLink>
                                                {{ Translate('IDCS_ENABLE') }}
                                            </BaseTableDropdownLink>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="changeTaskStatus">
                                                        {{ pageData.taskStatus ? Translate('IDCS_OFF') : Translate('IDCS_ON') }}
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
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
                                        {{ displayName(row.name) }}
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
                                                    <el-dropdown-item @click="deleteAllTask">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                    <template #default="{ row }: TableColumn<ChannelPtzTaskDto>">
                                        <BaseImgSpriteBtn
                                            file="edit2"
                                            @click="editTask(row)"
                                        />
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
            :chl-id="pageData.editChlId"
            :data="pageData.editData"
            @confirm="confirmEditTask"
            @close="closeEditTask"
        />
    </div>
</template>

<script lang="ts" src="./ChannelPtzTask.v.ts"></script>
