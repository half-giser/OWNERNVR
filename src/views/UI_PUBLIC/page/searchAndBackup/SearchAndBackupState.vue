<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-08 16:33:15
 * @Description: 备份状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-09 09:29:17
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                width="100%"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
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
                <el-table-column
                    :label="Translate('IDCS_OPERATION')"
                    prop="operate"
                >
                    <template #header>
                        <el-dropdown trigger="click">
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
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    prop="delete"
                >
                    <template #header>
                        <el-dropdown trigger="click">
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
        </div>
        <div class="backup-tip">
            <BaseImgSprite file="caution" />
            <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_BACKUP')) }}</span>
        </div>
        <BasePluginNotice />
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
