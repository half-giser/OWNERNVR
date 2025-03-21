<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-10 09:15:11
 * @Description: 智能分析 - 车辆搜索
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left base-intel-left-column">
            <el-radio-group
                v-model="pageData.searchType"
                size="large"
                class="inline hide-border-top hide-border-inline"
                @change="changeSearchType"
            >
                <el-radio-button
                    v-for="item in pageData.searchOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <IntelBaseDateTimeSelector v-model="formData.dateRange" />
                    <IntelBaseChannelSelector
                        v-model="formData.chl"
                        :mode="pageData.searchType === 'event' ? 'channel' : 'park'"
                        @ready="getChlMap"
                    />
                    <IntelBaseEventSelector
                        v-show="pageData.searchType === 'event'"
                        v-model="formData.event"
                        mode="checkbox"
                        :range="['vehicle']"
                    />
                    <IntelBaseAttributeSelector
                        v-show="pageData.searchType === 'event'"
                        :model-value="[formData.target, []]"
                        :range="['vehicle']"
                        placeholder-type="target"
                        @update:model-value="changeTarget"
                    />
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'event'"
                        v-model="formData.attribute"
                        placeholder-type="spread"
                        :range="formData.target"
                    />
                    <IntelBaseVehicleDirectionSelector
                        v-show="pageData.searchType === 'park'"
                        v-model="formData.direction"
                    />
                    <el-form
                        :style="{
                            '--form-label-width': 'auto',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_LICENSE_PLATE_NUM')">
                            <el-input
                                v-model="formData.plateNumber"
                                :placeholder="Translate('IDCS_ENTER_PLATE_NUM')"
                            />
                        </el-form-item>
                    </el-form>
                    <div class="base-intel-row">
                        <el-button @click="getData">{{ Translate('IDCS_SEARCH') }}</el-button>
                        <IntelBaseCollect
                            :storage-key="cacheKey"
                            :data="{
                                dateRange: formData.dateRange,
                                chl: formData.chl,
                                event: formData.event,
                                profile: formData.attribute,
                                attribute: [formData.target, []],
                                plateNumber: formData.plateNumber,
                                direction: formData.direction,
                            }"
                            @change="changeCollect"
                        />
                    </div>
                </div>
                <div class="base-intel-playback-box">
                    <h3>{{ playerData.chlName + Translate('IDCS_REPLAY') }}</h3>
                    <div class="player">
                        <BaseVideoPlayer
                            ref="playerRef"
                            type="record"
                            only-wasm
                            @time="handlePlayerTimeUpdate"
                        />
                    </div>
                    <div class="control-bar">
                        <span class="start-time">{{ displayTime(playerData.startTime) }}</span>
                        <el-slider
                            v-model="playerData.currentTime"
                            :show-tooltip="false"
                            :min="playerData.startTime"
                            :max="playerData.endTime"
                            :disabled="playerData.startTime === 0 || playerData.endTime === 0"
                            @mousedown="handleSliderMouseDown"
                            @mouseup="handleSliderMouseUp"
                            @change="handleSliderChange"
                        />
                        <span class="end-time">{{ displayTime(playerData.endTime) }}</span>
                    </div>
                    <div class="current-time">{{ displayDateTime(playerData.currentTime) }}</div>
                </div>
            </div>
        </div>
        <div class="base-intel-right">
            <div class="base-intel-row flex-start">
                <el-radio-group
                    v-model="pageData.chartType"
                    :style="{
                        '--form-radio-button-width': '160px',
                    }"
                >
                    <el-radio-button
                        v-for="item in pageData.chartTypeOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
            </div>
            <div class="base-intel-row space-between">
                <div>
                    <el-radio-group
                        v-show="pageData.chartType === 'list' && pageData.searchType === 'event'"
                        v-model="pageData.listType"
                        :style="{
                            '--form-radio-button-width': '160px',
                        }"
                    >
                        <el-radio-button
                            v-for="item in pageData.listTypeOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                </div>
                <div>
                    <el-radio-group
                        v-show="pageData.searchType === 'event'"
                        v-model="pageData.sortType"
                        @change="changeSortType"
                    >
                        <el-radio-button
                            v-for="item in pageData.sortOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                </div>
                <div>
                    <el-checkbox
                        :model-value="sliceTableData.length && sliceTableData.length === selectionIds.length"
                        :disabled="!sliceTableData.length"
                        :label="Translate('IDCS_SELECT_ALL')"
                        @update:model-value="handleSelectAll"
                    />
                </div>
            </div>
            <el-scrollbar
                v-show="pageData.chartType === 'list'"
                class="base-intel-pics-box"
            >
                <div class="base-intel-pics-content">
                    <IntelBaseSnapItem
                        v-for="(item, index) in sliceTableData"
                        :key="getUniqueKey(item)"
                        :model-value="selectionIds.includes(getUniqueKey(item))"
                        :src="pageData.listType === 'snap' ? item.pic : item.panorama"
                        :play="playerData.playId === getUniqueKey(item)"
                        :type="pageData.listType"
                        :disabled="item.isDelSnap || item.isNoData || !item.pic || !item.panorama"
                        :error-text="item.isDelSnap ? Translate('IDCS_DELETED') : item.isNoData ? Translate('IDCS_NO_RECORD_DATA') : ''"
                        @update:model-value="handleSelect(index, $event)"
                        @click="play(item)"
                        @detail="showDetail(index)"
                    >
                        {{ displayDateTime(item.timestamp) }}<br />{{ item.chlName }}
                    </IntelBaseSnapItem>
                </div>
            </el-scrollbar>
            <div
                v-show="pageData.chartType === 'table'"
                class="base-table-box"
            >
                <el-table
                    ref="tableRef"
                    show-overflow-tooltip
                    :data="sliceTableData"
                    @row-click="handleTableRowClick"
                    @selection-change="handleTableSelectionChange"
                >
                    <el-table-column
                        :label="Translate('IDCS_SERIAL_NUMBER')"
                        type="index"
                        width="60"
                    />
                    <el-table-column
                        type="selection"
                        :selectable="getTableSelectable"
                    />
                    <el-table-column :label="Translate('IDCS_SNAP_TIME')">
                        <template #default="{ row }: TableColumn<IntelSearchList>">
                            {{ displayDateTime(row.timestamp) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="formData.searchType === 'park' ? Translate('IDCS_SEARCH_ENTRANCE_AND_EXIT') : Translate('IDCS_CHANNEL')"
                        prop="chlName"
                    />
                    <el-table-column
                        :label="Translate('IDCS_LICENSE_PLATE_NUM')"
                        prop="plateNumber"
                    />
                    <el-table-column
                        v-if="formData.searchType === 'park'"
                        :label="Translate('IDCS_VEHICLE_DIRECTION')"
                    >
                        <template #default="{ row }: TableColumn<IntelSearchList>">
                            {{ displayDirection(row.direction) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        width="100"
                        :label="Translate('IDCS_DETAIL_INFO')"
                    >
                        <template #default="{ $index }: TableColumn<IntelSearchList>">
                            <BaseImgSpriteBtn
                                file="browser"
                                @click="showDetail($index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div
                v-show="pageData.isSupportBackUp"
                class="base-btn-box space-between"
            >
                <div>
                    <el-checkbox
                        v-model="pageData.isBackUpPic"
                        :label="`${Translate('IDCS_BACKUP_PICTURE')}${sliceTableData.length && isSupportCSV ? ` (${Translate('IDCS_LICENSE_PLATE_NUM_LIST')})` : ''}`"
                    />
                    <el-checkbox
                        v-model="pageData.isBackUpVideo"
                        :label="Translate('IDCS_BACKUP_RECORD')"
                    />
                </div>
                <BasePagination
                    v-model:current-page="formData.pageIndex"
                    v-model:page-size="formData.pageSize"
                    :page-sizes="[formData.pageSize]"
                    :total="tableData.length"
                    @current-change="changePage"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!selectionIds.length || (!pageData.isBackUpPic && !pageData.isBackUpVideo)"
                    @click="backUp"
                >
                    {{ Translate('IDCS_BACKUP') }}
                </el-button>
            </div>
        </div>
        <IntelBaseSnapPop
            v-model="pageData.isDetailPop"
            :list="sliceTableData"
            :index="pageData.detailIndex"
            @close="pageData.isDetailPop = false"
            @add="addPlate"
            @play-rec="playRec"
        />
        <BasePlaybackPop
            v-model="pageData.isPlaybackPop"
            :play-list="pageData.playbackList"
            @close="pageData.isPlaybackPop = false"
        />
        <BackupPop
            v-model="pageData.isBackUpPop"
            mode="h5"
            :backup-list="[]"
            @confirm="confirmBackUp"
            @close="pageData.isBackUpPop = false"
        />
        <BackupLocalPop
            v-model="pageData.isBackUpLocalPop"
            :auth="auth"
            :max-single-size="500 * 1024 * 1024"
            :backup-list="pageData.backupList"
            download-type="zip"
            @record-file="downloadVideo"
            @close="pageData.isBackUpLocalPop = false"
        />
        <IntelLicencePlateDBAddPlatePop
            v-model="pageData.isAddPlatePop"
            type="register"
            :data="{
                plateNumber: pageData.addPlateNumber,
            }"
            @confirm="pageData.isAddPlatePop = false"
            @close="pageData.isAddPlatePop = false"
        />
    </div>
</template>

<script lang="ts" src="./IntelVehicleSearch.v.ts"></script>

<style lang="scss" scoped>
.base-intel-left {
    padding: 0;

    .el-radio-group {
        flex-shrink: 0;
    }

    & > .base-intel-left-column {
        padding: 20px 10px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
}
</style>
