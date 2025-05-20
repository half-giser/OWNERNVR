<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 09:37:10
 * @Description: 按事件搜索
-->
<template>
    <div class="by-event">
        <div class="left">
            <el-form
                v-title
                label-position="top"
                :style="{
                    '--form-input-width': '100%',
                }"
            >
                <el-form-item>
                    <el-input
                        v-model="formData.pos"
                        :disabled="!enablePos"
                        :placeholder="Translate('IDCS_POS_KEY')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <BaseDatePicker
                        v-model="formData.startTime"
                        type="datetime"
                        :placeholder="Translate('IDCS_START_TIME')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <BaseDatePicker
                        v-model="formData.endTime"
                        type="datetime"
                        :placeholder="Translate('IDCS_END_TIME')"
                    />
                </el-form-item>
            </el-form>
            <div class="chl">
                <el-text>{{ Translate('IDCS_CHANNEL') }}</el-text>
                <el-checkbox
                    :model-value="isChlAll"
                    :label="Translate('IDCS_ALL')"
                    @change="toggleAllChl"
                />
            </div>
            <div class="chl-box">
                <BaseListBox>
                    <el-checkbox-group v-model="formData.chls">
                        <BaseListBoxItem
                            v-for="item in pageData.chlList"
                            :key="item.id"
                            :show-hover="false"
                        >
                            <el-checkbox
                                :value="item.id"
                                :label="item.value"
                                :disabled="isChlAll && !formData.chls.includes(item.id)"
                            />
                        </BaseListBoxItem>
                    </el-checkbox-group>
                </BaseListBox>
                <div class="base-btn-box">
                    <el-button
                        :disabled="!formData.chls.length"
                        @click="search"
                    >
                        {{ Translate('IDCS_SEARCH') }}
                    </el-button>
                </div>
            </div>
        </div>
        <div class="main">
            <div class="center">
                <div class="base-head-box">
                    <span class="filter-title">{{ Translate('IDCS_EVENT_FILTER') }}</span>
                    <BaseImgSprite
                        file="filterBtn"
                        :index="0"
                        :hover-index="0"
                        class="filter-btn"
                        @click="openEventSelector"
                    />
                    <span class="filter-event text-ellipsis">{{ `( ${eventsStr} )` }}</span>
                </div>
                <div class="base-table-box">
                    <el-table
                        ref="tableRef"
                        v-title
                        :data="filterTableData"
                        show-overflow-tooltip
                        @row-click="handleRecClick"
                        @selection-change="handleRecChange"
                    >
                        <el-table-column
                            :label="Translate('IDCS_SERIAL_NUMBER')"
                            min-width="50"
                        >
                            <template #default="{ $index }: TableColumn<PlaybackRecLogList>">
                                {{ displayIndex($index) }}
                            </template>
                        </el-table-column>
                        <el-table-column type="selection" />
                        <el-table-column
                            :label="Translate('IDCS_CHANNEL_NAME')"
                            prop="chlName"
                            min-width="150"
                        />
                        <el-table-column
                            :label="Translate('IDCS_TYPE')"
                            min-width="100"
                        >
                            <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                                <span>{{ displayEvent(row) }}</span>
                                <BaseImgSprite
                                    v-if="displayEventIcon(row)"
                                    :file="row.event"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_START_TIME')"
                            min-width="150"
                        >
                            <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                                {{ displayDateTime(row.startTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_END_TIME')"
                            min-width="150"
                        >
                            <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                                {{ displayDateTime(row.endTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_RECORD_TIME')"
                            prop="duration"
                            min-width="100"
                        />
                        <el-table-column
                            :label="Translate('IDCS_BIG_SMALL')"
                            prop="size"
                            min-width="100"
                        />
                        <el-table-column :label="Translate('IDCS_PLAY')">
                            <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                                <BaseImgSpriteBtn
                                    file="preview"
                                    @click="playRec(row)"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column :label="Translate('IDCS_INFORMATION')">
                            <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                                <BaseImgSpriteBtn
                                    v-if="row.event === 'POS'"
                                    file="detail"
                                    @click="showPosInfo(row)"
                                />
                                <span v-else>--</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="base-pagination-box">
                    <BasePagination
                        v-model:current-page="pageData.currentPage"
                        v-model:page-size="pageData.pageSize"
                        :total="tableData.length"
                        :page-sizes="[20, 30, 50]"
                    />
                </div>
                <div class="base-btn-box space-between">
                    <div>
                        <BaseImgSprite file="caution" />
                        <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_BACKUP')) }}</span>
                    </div>
                    <el-button
                        :disabled="!pageData.selectedRecList.length"
                        @click="backUp"
                    >
                        {{ Translate('IDCS_BACKUP') }}
                    </el-button>
                </div>
            </div>
        </div>
        <BackupPop
            v-model="pageData.isBackUpPop"
            :mode="mode"
            :backup-list="pageData.backupRecList"
            @confirm="confirmBackUp"
            @close="pageData.isBackUpPop = false"
        />
        <BackupPosInfoPop
            v-model="pageData.isPosInfoPop"
            :item="pageData.posInfo"
            :keyword="formData.pos"
            @close="pageData.isPosInfoPop = false"
        />
        <BackupLocalPop
            v-model="pageData.isLocalBackUpPop"
            :auth="userAuth"
            :backup-list="pageData.backupRecList"
            @close="pageData.isLocalBackUpPop = false"
        />
        <BasePlaybackPop
            v-model="pageData.isPlaybackPop"
            :play-list="pageData.playbackList"
            @close="pageData.isPlaybackPop = false"
        />
        <RecordBaseEventSelector
            ref="baseEventSelectorRef"
            v-model="pageData.events"
        />
    </div>
</template>

<script lang="ts" src="./SearchAndBackupByEvent.v.ts"></script>

<style lang="scss" scoped>
.by-event {
    width: 100%;
    display: flex;
}

.event {
    display: flex;
    padding: 10px 15px 5px;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    &-box {
        width: calc(100% - 50px);
        margin: 0 auto 15px;
        border: 1px solid var(--input-border);
        padding: 10px;
    }

    &-item {
        margin: 0 6px;
    }

    &-list {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }

    &-target {
        .el-checkbox {
            margin-left: 10px;
            display: flex;
        }
    }
}

.left {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: var(--content-height);
    padding-top: 14px;
    .el-form {
        flex-shrink: 0;
        margin-bottom: 0 !important;
    }
}

.chl {
    display: flex;
    padding: 10px 15px 5px;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    &-box {
        width: calc(100% - 30px);
        height: calc(100% - 300px);
        display: flex;
        flex-direction: column;
        margin: 0 auto 15px;
        border: 1px solid var(--input-border);
        padding-bottom: 10px;

        .BaseListBox {
            height: 100%;
        }

        .el-button {
            margin-right: 10px;
        }
    }
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--input-border);
}

.center {
    padding: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    .base-head-box {
        height: 44px;
        padding: 10px;
        margin-bottom: 10px;
        box-sizing: border-box;
        background-color: transparent;
        border: 1px solid var(--content-border);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-weight: unset;
        .filter-title,
        .filter-event {
            padding-top: 2px;
        }
        .filter-btn {
            margin: 0px 10px;
        }
    }
}

.backup {
    &-tip {
        flex-shrink: 0;
        margin-top: 5px;
        margin-bottom: 15px;
        padding-left: 15px;
        display: flex;
        align-items: center;

        span:last-child {
            padding-left: 5px;
        }
    }
}
</style>
