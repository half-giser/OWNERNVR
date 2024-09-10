<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 17:42:11
 * @Description: 智能分析 - 人体搜索
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-09 19:21:29
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left base-intel-left-column">
            <div>
                <IntelBaseDateTimeSelector
                    :model-value="formData.dateRange"
                    @update:model-value="changeDateRange"
                />
                <IntelBaseChannelSelector
                    :model-value="formData.chl"
                    @update:model-value="changeChl"
                    @ready="getChlMap"
                />
                <IntelBaseEventSelector
                    :model-value="formData.event"
                    mode="checkbox"
                    :range="['person']"
                    @update:model-value="changeEvent"
                />
                <IntelBaseProfileSelector
                    :model-value="formData.attribute"
                    :range="['person']"
                    @update:model-value="changeAttribute"
                />
                <div class="base-intel-row">
                    <el-button @click="getData">{{ Translate('IDCS_SEARCH') }}</el-button>
                    <IntelBaseCollect
                        storage-key="intel_body_search"
                        :data="{
                            dateRange: formData.dateRange,
                            chl: formData.chl,
                            event: formData.event,
                            profile: formData.attribute,
                        }"
                        @change="changeCollect"
                    />
                </div>
            </div>
            <div class="base-intel-playback-box">
                <h3>{{ Translate('IDCS_REPLAY') }}</h3>
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        :split="1"
                        type="record"
                        only-wasm
                        @ontime="handlePlayerTimeUpdate"
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
                        >{{ item.label }}</el-radio-button
                    >
                </el-radio-group>
            </div>
            <div class="base-intel-row space-between">
                <div>
                    <el-radio-group
                        v-show="pageData.chartType === 'list'"
                        v-model="pageData.listType"
                        :style="{
                            '--form-radio-button-width': '160px',
                        }"
                    >
                        <el-radio-button
                            v-for="item in pageData.listTypeOptions"
                            :key="item.value"
                            :value="item.value"
                            >{{ item.label }}</el-radio-button
                        >
                    </el-radio-group>
                </div>
                <div>
                    <el-radio-group
                        v-model="pageData.sortType"
                        @change="changeSortType"
                    >
                        <el-radio-button
                            v-for="item in pageData.sortOptions"
                            :key="item.value"
                            :value="item.value"
                            >{{ item.label }}</el-radio-button
                        >
                    </el-radio-group>
                </div>
                <div>
                    <el-checkbox
                        :model-value="sliceTableData.length && sliceTableData.length === selectionIds.length"
                        :disabled="!sliceTableData.length"
                        @update:model-value="handleSelectAll"
                        >{{ Translate('IDCS_SELECT_ALL') }}</el-checkbox
                    >
                </div>
            </div>
            <div
                v-show="pageData.chartType === 'list'"
                class="pics"
            >
                <IntelBaseSnapItem
                    v-for="(item, index) in sliceTableData"
                    :key="`${item.imgId}:${item.timestamp}`"
                    :model-value="selectionIds.includes(`${item.imgId}:${item.timestamp}`)"
                    :src="pageData.listType === 'snap' ? item.pic : item.panorama"
                    :play="playerData.playId === `${item.imgId}:${item.timestamp}`"
                    :type="pageData.listType"
                    :disabled="item.isDelSnap || !item.pic || !item.panorama"
                    @update:model-value="handleSelect(index, $event)"
                    @click="play(item)"
                    @detail="showDetail(index)"
                >
                    {{ displayDateTime(item.timestamp) }}<br />{{ item.chlName }}
                </IntelBaseSnapItem>
            </div>
            <div
                v-show="pageData.chartType === 'table'"
                class="base-table-box"
            >
                <el-table
                    ref="tableRef"
                    border
                    stripe
                    :data="sliceTableData"
                    @row-click="handleTableRowClick"
                    @selection-change="handleTableSelectionChange"
                >
                    <el-table-column
                        :label="Translate('IDCS_SERIAL_NUMBER')"
                        type="index"
                        width="60"
                    >
                    </el-table-column>
                    <el-table-column
                        type="selection"
                        :selectable="getTableSelectable"
                    />
                    <el-table-column :label="Translate('IDCS_SNAP_TIME')">
                        <template #default="scope">
                            {{ displayDateTime(scope.row.timestamp) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL')"
                        prop="chlName"
                    >
                    </el-table-column>
                    <el-table-column
                        width="100"
                        :label="Translate('IDCS_DETAIL_INFO')"
                    >
                        <template #default="scope">
                            <BaseImgSprite
                                file="browser"
                                :index="0"
                                :hover-index="1"
                                :chunk="4"
                                @click="showDetail(scope.$index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div
                v-show="pageData.isSupportBackUp"
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <el-checkbox v-model="pageData.isBackUpPic">{{ Translate('IDCS_BACKUP_PICTURE') }}</el-checkbox>
                    <el-checkbox v-model="pageData.isBackUpVideo">{{ Translate('IDCS_BACKUP_RECORD') }}</el-checkbox>
                </div>
                <el-pagination
                    v-model:current-page="formData.pageIndex"
                    v-model:page-size="formData.pageSize"
                    :page-sizes="[formData.pageSize]"
                    layout="total, sizes, prev, pager, next"
                    :total="tableData.length"
                    size="small"
                    @current-change="changePage"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!selectionIds.length || (!pageData.isBackUpPic && !pageData.isBackUpVideo)"
                    @click="backUp"
                    >{{ Translate('IDCS_BACKUP') }}</el-button
                >
            </div>
        </div>
        <IntelBaseSnapPop
            v-model="pageData.isDetailPop"
            :list="sliceTableData"
            :index="pageData.detailIndex"
            @close="pageData.isDetailPop = false"
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
    </div>
</template>

<script lang="ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>

<style lang="scss" scoped>
.pics {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    border: 1px solid var(--border-color8);
    overflow-y: scroll;
}
</style>
