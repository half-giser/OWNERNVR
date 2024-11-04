<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 18:30:11
 * @Description: 回放-备份任务列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-01 17:56:54
-->
<template>
    <div class="backup">
        <el-popover
            :visible="pageData.visible"
            :width="1000"
            placement="top-end"
            popper-class="no-padding"
            @update:visible="$emit('update:visible', $event)"
        >
            <template #reference>
                <div>
                    <el-tooltip :content="Translate('IDCS_BACKUP_TASKS')">
                        <BaseImgSprite
                            file="backUpTask"
                            :index="0"
                            :hover-index="1"
                            :disabled-index="3"
                            :chunk="4"
                        />
                    </el-tooltip>
                </div>
            </template>
            <el-table
                :data="tableData"
                border
                stripe
                height="400"
                show-overflow-tooltip
            >
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
                    <template #default="scope">
                        {{ displayDestination(scope.row.description) }}
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
                <el-table-column :label="Translate('IDCS_OPERATION')">
                    <template #header>
                        <el-dropdown :teleported="false">
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
                    <template #default="scope">
                        <el-button
                            v-if="scope.row.status === 'ongoing'"
                            @click="pauseTask(scope.row)"
                            >{{ Translate('IDCS_PAUSE') }}</el-button
                        >
                        <el-button
                            v-else-if="scope.row.status === 'pause'"
                            @click="resumeTask(scope.row)"
                            >{{ Translate('IDCS_RESUME') }}</el-button
                        >
                        <el-text v-else-if="scope.row.status === 'failed'">{{ Translate('IDCS_FAILED') }}</el-text>
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #header>
                        <el-dropdown :teleported="false">
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
                    <template #default="scope">
                        <el-button @click="deleteTask(scope.row)">{{ Translate('IDCS_DELETE') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="backup-tip">
                <BaseImgSprite file="caution" />
                <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_REPLAY')) }}</span>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./PlaybackBackUpPanel.v.ts"></script>

<style lang="scss" scoped>
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
:deep(.el-table__header-wrapper) {
    overflow: unset !important;
}
:deep(.cell) {
    overflow: unset !important;
}
:deep(.el-dropdown-menu__item) {
    font-weight: normal;
}
:deep(.el-dropdown__popper) .el-popper__arrow::before {
    background-color: var(--color-white) !important;
}
</style>
