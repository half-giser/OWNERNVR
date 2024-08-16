<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 15:02:25
 * @Description: 搜索与备份-图片管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-12 17:08:05
-->
<template>
    <div class="img-mgr base-flex-box">
        <div class="form">
            <div>
                <label>{{ Translate('IDCS_START_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.startTime"
                    :value-format="dateTime.dateTimeFormat.value"
                    :format="dateTime.dateTimeFormat.value"
                    :cell-class-name="dateTime.highlightWeekend"
                    clear-icon=""
                    type="datetime"
                ></el-date-picker>
                <label>{{ Translate('IDCS_END_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.endTime"
                    :value-format="dateTime.dateTimeFormat.value"
                    :format="dateTime.dateTimeFormat.value"
                    :cell-class-name="dateTime.highlightWeekend"
                    clear-icon=""
                    type="datetime"
                ></el-date-picker>
                <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
            </div>
            <div>
                <el-button
                    link
                    @click="showBackupTipPop"
                    >{{ Translate('IDCS_EXPORT_NOTICE') }}</el-button
                >
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                :data="tableData"
                border
                stripe
                @row-click="handleRowClick"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    prop="index"
                />
                <el-table-column type="selection" />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="chlName"
                />
                <el-table-column
                    :label="Translate('IDCS_CAPTURE_MODE')"
                    prop="captureModeKey"
                />
                <el-table-column
                    :label="Translate('IDCS_CAPTURE_TIME')"
                    prop="captureTime"
                >
                    <template #default="scope">
                        {{ displayDateTime(scope.row.captureTimeStamp) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CREATE_USER')"
                    prop="creator"
                >
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_BROWSE')"
                    prop="browser"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="browser"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="browseImg(scope.$index)"
                        />
                    </template>
                </el-table-column>

                <el-table-column
                    :label="Translate('IDCS_EXPORT')"
                    prop="export"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_EXPORT') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="exportSelectedImg">{{ Translate('IDCS_EXPORT_SELECT') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="export"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="exportImg(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    prop="id"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_DELETE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteSelectedImg">{{ Translate('IDCS_DELETE_SELECT') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="deleteImg(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-pagination
                :current-page="formData.pageIndex"
                :page-size="formData.pageSize"
                :layout="DefaultPagerLayout"
                :total="pageData.totalCount"
                :page-sizes="[20, 30, 50]"
                @update:current-page="changePageIndex"
                @update:page-size="changePageSize"
            />
        </div>
        <BasePluginNotice />
        <BackupImgPop
            v-model="pageData.isBackUpPop"
            :backup-list="pageData.backupImgList"
            @close="pageData.isBackUpPop = false"
        />
        <BackupImgPlayerPop
            v-model="pageData.isBackupPlayerPop"
            :item="picItem"
            :total="pageData.totalCount"
            :date-time-format="dateTime.dateTimeFormat.value"
            @delete="handlePlayerDelete"
            @export="handlePlayerExport"
            @next="handlePlayerNext"
            @prev="handlePlayerPrev"
            @close="pageData.isBackupPlayerPop = false"
        />
        <el-dialog
            v-model="pageData.isBackUpTipPop"
            draggable
            :title="Translate('IDCS_EXPORT_NOTICE')"
            :width="500"
        >
            <div class="backup-tip">
                <BaseImgSprite
                    file="msg_type"
                    :index="3"
                    :chunk="5"
                />
                <div>
                    {{ Translate('IDCS_EXPORT_SELECT_ALARM') }}
                    <template v-if="browserType === 'chrome'">
                        <br />
                        <div v-clean-html="Translate('IDCS_EXPORT_ALARM_CHROME')"></div>
                    </template>
                </div>
            </div>
            <el-checkbox v-model="pageData.isBackUpTipNotAgain">{{ Translate('IDCS_NOT_SHOW_AGAIN') }}</el-checkbox>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="closeBackupTipPop">{{ Translate('IDCS_OK') }}</el-button>
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./SearchAndBackupImageManage.v.ts"></script>

<style lang="scss" scoped>
.img-mgr {
    padding: 10px;
}

.form {
    display: flex;
    justify-content: space-between;
    margin: 10px;

    label {
        padding-right: 20px;
        font-size: 13px;

        &:not(:first-child) {
            padding-left: 20px;
        }
    }

    .el-button {
        margin-left: 10px;
    }

    :deep(.el-button) {
        &.is-link {
            color: var(--text-primary);

            &:hover {
                text-decoration: underline;
                color: var(--primary--04);
            }
        }
    }
}

.backup-tip {
    display: flex;
    margin-bottom: 20px;

    & > div:last-child {
        margin-left: 15px;
    }
}
</style>
