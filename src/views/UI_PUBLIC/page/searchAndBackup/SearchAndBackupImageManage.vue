<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 15:02:25
 * @Description: 搜索与备份-图片管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 14:39:43
-->
<template>
    <div class="img-mgr base-flex-box">
        <div class="form">
            <div>
                <label>{{ Translate('IDCS_START_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.startTime"
                    :value-format="dateTime.dateTimeFormat"
                    :format="dateTime.dateTimeFormat"
                    :cell-class-name="highlightWeekend"
                    clear-icon=""
                    type="datetime"
                ></el-date-picker>
                <label>{{ Translate('IDCS_END_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.endTime"
                    :value-format="dateTime.dateTimeFormat"
                    :format="dateTime.dateTimeFormat"
                    :cell-class-name="highlightWeekend"
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
                show-overflow-tooltip
                @row-click="handleRowClick"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    prop="index"
                    width="60"
                />
                <el-table-column type="selection" />
                <el-table-column
                    prop="chlName"
                    min-width="220"
                >
                    <template #header>
                        <div
                            class="sort-title"
                            :class="{
                                active: formData.sortField === 'chlName',
                            }"
                            @click="sort('chlName')"
                        >
                            <span>{{ Translate('IDCS_CHANNEL_NAME') }}</span>
                            <BaseImgSprite
                                :file="formData.sortType || 'asc'"
                                class="sort-icon"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="captureModeKey"
                    min-width="150"
                >
                    <template #header>
                        <div
                            class="sort-title"
                            :class="{
                                active: formData.sortField === 'captureModeKey',
                            }"
                            @click="sort('captureModeKey')"
                        >
                            <span>{{ Translate('IDCS_CAPTURE_MODE') }}</span>
                            <BaseImgSprite
                                :file="formData.sortType || 'asc'"
                                class="sort-icon"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column min-width="220">
                    <template #header>
                        <div
                            class="sort-title"
                            :class="{
                                active: formData.sortField === 'captureTime',
                            }"
                            @click="sort('captureTime')"
                        >
                            <span>{{ Translate('IDCS_CAPTURE_TIME') }}</span>
                            <BaseImgSprite
                                :file="formData.sortType || 'asc'"
                                class="sort-icon"
                            />
                        </div>
                    </template>
                    <template #default="scope">
                        {{ displayDateTime(scope.row.captureTimeStamp) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CREATE_USER')"
                    prop="creator"
                    min-width="220"
                >
                </el-table-column>
                <el-table-column :label="Translate('IDCS_BROWSE')">
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

                <el-table-column :label="Translate('IDCS_EXPORT')">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_EXPORT') }}
                            </BaseTableDropdownLink>
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
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
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
        <div class="row_pagination">
            <el-pagination
                :current-page="formData.pageIndex"
                :page-size="formData.pageSize"
                :layout="DefaultPagerLayout"
                :total="pageData.totalCount"
                :page-sizes="[10, 30, 50]"
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
    padding: 5px 10px;
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
            color: var(--main-text);

            &:hover {
                text-decoration: underline;
                color: var(--primary);
            }
        }
    }
}

.backup-tip {
    display: flex;
    margin-bottom: 20px;

    & > span:first-child {
        flex-shrink: 0;
    }

    & > div:last-child {
        margin-left: 15px;
        color: var(--main-text);
    }
}

.sort {
    &-title {
        position: relative;
        width: 100%;
        cursor: pointer;

        &:hover,
        &.active {
            .sort-icon {
                opacity: 1;
            }
        }
    }

    &-icon {
        position: absolute;
        left: 50%;
        top: 0;
        opacity: 0;
    }
}
</style>
