<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-08 16:33:15
 * @Description: 备份状态
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
                width="100%"
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
                    width="60"
                />
                <el-table-column
                    :label="Translate('IDCS_TIME_SEGMENT')"
                    prop="startEndTime"
                    min-width="300"
                />
                <el-table-column
                    :label="Translate('IDCS_RECORD_TIME')"
                    prop="duration"
                    min-width="100"
                />
                <el-table-column
                    :label="Translate('IDCS_BIG_SMALL')"
                    prop="dataSize"
                    min-width="100"
                />
                <el-table-column :label="Translate('IDCS_DESTINATION')">
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        {{ displayDestination(row.destination) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PATH')"
                    prop="backupPath"
                    min-width="150"
                />
                <el-table-column
                    :label="Translate('IDCS_CREATE_USER')"
                    prop="creator"
                    min-width="100"
                />
                <el-table-column
                    :label="Translate('IDCS_PROGRESS')"
                    prop="progress"
                    width="100"
                />
                <el-table-column :label="Translate('IDCS_OPERATION')">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_OPERATION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="pauseAllTask">{{ Translate('IDCS_PAUSE_ALL') }}</el-dropdown-item>
                                    <el-dropdown-item @click="resumeAllTask">{{ Translate('IDCS_RESUME_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
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
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteAllTask">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<PlaybackBackUpTaskList>">
                        <el-button @click="deleteTask(row)">{{ Translate('IDCS_DELETE') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="backup-tip">
            <BaseImgSprite file="caution" />
            <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_BACKUP')) }}</span>
        </div>
    </div>
</template>

<script lang="ts" src="./SearchAndBackupState.v.ts"></script>

<style lang="scss" scoped>
.backup {
    flex-shrink: 0;
    margin: 0 5px;

    &-tip {
        margin-top: 5px;
        padding-left: 10px;
        display: flex;
        align-items: center;

        span:last-child {
            padding-left: 5px;
        }
    }
}
</style>
