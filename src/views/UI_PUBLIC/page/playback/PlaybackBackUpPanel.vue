<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 18:30:11
 * @Description: 回放-备份任务列表
-->
<template>
    <div class="backup">
        <BasePopover
            :visible="pageData.visible"
            :width="1000"
            placement="top-end"
            popper-class="no-padding"
            @update:visible="$emit('update:visible', $event)"
        >
            <template #reference>
                <span class="refer"></span>
            </template>
            <el-table
                v-title
                :data="tableData"
                height="400"
                show-overflow-tooltip
            >
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        <BaseTableRowStatus
                            :icon="row.status === 'failed' ? 'error' : ''"
                            :error-text="row.statusTip"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                    width="50"
                />
                <el-table-column
                    :label="Translate('IDCS_TIME_SEGMENT')"
                    prop="startEndTime"
                />
                <el-table-column
                    :label="Translate('IDCS_RECORD_TIME')"
                    prop="duration"
                />
                <el-table-column
                    :label="Translate('IDCS_BIG_SMALL')"
                    prop="dataSize"
                />
                <el-table-column :label="Translate('IDCS_DESTINATION')">
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        {{ displayDestination(row.destination) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PATH')"
                    prop="backupPath"
                />
                <el-table-column
                    :label="Translate('IDCS_CREATE_USER')"
                    prop="creator"
                />
                <el-table-column
                    :label="Translate('IDCS_PROGRESS')"
                    prop="progress"
                />
                <el-table-column width="110">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_OPERATION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="pauseAllTask">{{ Translate('IDCS_PAUSE_ALL') }}</el-dropdown-item>
                                    <el-dropdown-item @click="resumeAllTask">{{ Translate('IDCS_RESUME_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        <el-button
                            v-if="row.status === 'ongoing'"
                            @click="pauseTask(row)"
                        >
                            {{ Translate('IDCS_PAUSE') }}
                        </el-button>
                        <el-button
                            v-else-if="row.status === 'pause'"
                            @click="resumeTask(row)"
                        >
                            {{ Translate('IDCS_RESUME') }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="110"
                >
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteAllTask">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        <el-button @click="deleteTask(row)">{{ Translate('IDCS_DELETE') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="backup-tip">
                <BaseImgSprite file="caution" />
                <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_REPLAY')) }}</span>
            </div>
        </BasePopover>
    </div>
</template>

<script lang="ts" src="./PlaybackBackUpPanel.v.ts"></script>

<style lang="scss" scoped>
.refer {
    display: block;
    height: 50px;
    width: 1px;
}

.backup {
    flex-shrink: 0;
    margin: 0 5px;

    &-tip {
        margin: 5px;
        display: flex;
        align-items: center;

        span:last-child {
            padding-left: 5px;
        }
    }
}

:deep(.el-table__header .el-table__cell) {
    z-index: 2;
}

:deep(.el-dropdown-menu__item) {
    font-weight: normal;
}
</style>
