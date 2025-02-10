<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:54:18
 * @Description: 智能分析-人脸搜索
-->
<template>
    <div class="base-intel-box">
        <div class="base-intel-left base-intel-left-column">
            <div class="tabs">
                <el-menu
                    :default-active="pageData.searchType"
                    mode="horizontal"
                    @select="pageData.searchType = $event"
                >
                    <el-menu-item
                        v-for="item in pageData.searchOptions"
                        :key="item.value"
                        :index="item.value"
                    >
                        {{ item.label }}
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <div class="base-intel-row">
                        <BaseDateTab
                            :model-value="formData.dateRange"
                            :layout="['date', 'week', 'custom', 'today']"
                            @change="changeDateRange"
                        />
                    </div>
                    <div class="base-intel-row">
                        <BaseDateRange
                            :model-value="formData.dateRange"
                            :type="pageData.dateRangeType"
                            @change="changeDateRange"
                        />
                    </div>
                    <div
                        v-show="pageData.searchType === 'face'"
                        class="base-intel-row"
                    >
                        <div
                            class="face-pic"
                            @click="pageData.isChoosePop = true"
                        >
                            <div
                                v-show="formData.face === ''"
                                class="face-pic-add"
                            >
                                <BaseImgSprite
                                    file="addFF"
                                    :hover-index="2"
                                    :chunk="4"
                                />
                            </div>
                            <div v-show="formData.face !== ''">
                                <div class="face-pic-btn">
                                    <el-button
                                        link
                                        @click.stop="pageData.isChoosePop = true"
                                    >
                                        {{ Translate('IDCS_CHANGE') }}
                                    </el-button>
                                    <el-button
                                        link
                                        @click.stop="resetFaceData"
                                    >
                                        {{ Translate('IDCS_CLEAR_AWAY') }}
                                    </el-button>
                                </div>
                                <div
                                    v-show="isMultiFacePic"
                                    class="face-pic-multi"
                                >
                                    <BaseImgSprite file="manypeople" />
                                </div>
                                <div
                                    v-show="!isMultiFacePic"
                                    class="face-pic-single"
                                >
                                    <img :src="formFacePic" />
                                </div>
                            </div>
                        </div>
                        <div
                            v-show="isFaceInfo"
                            class="face-info"
                        >
                            <div v-show="formData.featureFace.length === 1">
                                <div>
                                    <span>{{ Translate('IDCS_NAME_PERSON') }}</span>
                                    <span>{{ formFaceData.name }}</span>
                                </div>
                                <div>
                                    <span>{{ Translate('IDCS_BIRTHDAY') }}</span>
                                    <span>{{ formFaceData.birthday }}</span>
                                </div>
                                <div>
                                    <span>{{ Translate('IDCS_ID_NUMBER') }}</span>
                                    <span>{{ formFaceData.certificateNum }}</span>
                                </div>
                                <div>
                                    <span>{{ Translate('IDCS_PHONE_NUMBER') }}</span>
                                    <span>{{ formFaceData.mobile }}</span>
                                </div>
                            </div>
                            <div v-show="formData.snapFace.length === 1">
                                <div>
                                    <span>{{ Translate('IDCS_CHANNEL_NAME') }}</span>
                                    <span>{{ formSnapData.chlName }}</span>
                                </div>
                                <div>
                                    <span>{{ Translate('IDCS_SNAP_TIME') }}</span>
                                    <span>{{ displayDateTime(formSnapData.timestamp) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <el-form
                        :style="{
                            '--form-label-width': 'auto',
                        }"
                    >
                        <el-form-item v-show="pageData.searchType === 'event'">
                            <el-radio-group
                                v-model="formData.event"
                                class="base-intel-radio-group"
                            >
                                <el-radio
                                    v-for="item in pageData.eventOptions"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item
                            v-show="pageData.searchType === 'face'"
                            :label="Translate('IDCS_SIMILARITY')"
                        >
                            <BaseNumberInput
                                v-model="formData.similarity"
                                :min="0"
                                :max="100"
                            />
                            <el-text>%</el-text>
                        </el-form-item>
                    </el-form>
                    <div class="base-intel-row">
                        <el-button @click="getData">{{ Translate('IDCS_SEARCH') }}</el-button>
                    </div>
                </div>
                <div class="base-intel-playback-box">
                    <h3>{{ Translate('IDCS_REPLAY') }}</h3>
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
                        v-show="isChartOptionVisible(item.hide)"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
            </div>
            <div
                v-show="!isTrackVisible"
                class="base-intel-row space-between"
            >
                <div>
                    <el-radio-group
                        v-show="isChartGroupVisible"
                        v-model="pageData.listType"
                        :style="{
                            '--form-radio-button-width': '160px',
                        }"
                    >
                        <el-radio-button
                            v-for="item in pageData.listTypeOptions"
                            v-show="isListOptionVisible(item.hide)"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                </div>
                <div v-show="isSortVisible">
                    <el-radio-group
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
                    <el-button
                        class="chl-btn"
                        @click="pageData.isChlPop = true"
                    >
                        {{ Translate('IDCS_MORE') }}
                    </el-button>
                    <el-checkbox
                        :model-value="isSelectAll"
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
                        v-show="item.faceFeatureId !== -1000"
                        :key="`${item.imgId}:${item.frameTime}`"
                        :model-value="selectionIds.includes(getUniqueKey(item))"
                        :src="pageData.listType === 'panorama' ? item.panorama : item.pic"
                        :match-src="pageData.listType === 'match' ? item.match : ''"
                        :play="playerData.playId === getUniqueKey(item)"
                        :type="pageData.listType"
                        :disabled="item.isDelSnap || item.isNoData || !item.pic || !item.panorama"
                        :error-text="item.isDelSnap ? Translate('IDCS_DELETED') : item.isNoData ? Translate('IDCS_NO_RECORD_DATA') : ''"
                        :identity="isIdentityVisible && pageData.listType === 'snap' && item.identity"
                        @update:model-value="handleSelect(index, $event)"
                        @click="play(item)"
                        @detail="showDetail(item)"
                    >
                        <template v-if="pageData.listType === 'match'">
                            <div class="match-info">
                                <div>
                                    <div>{{ displayCardTime(item.timestamp) }}</div>
                                    <div>{{ item.chlName }}</div>
                                </div>
                                <div v-if="formData.faceType === 'face' || formData.faceType === 'group' || formData.eventType === 'byWhiteList'">
                                    <div>{{ item.info.name }}</div>
                                    <div>{{ displayFaceGroup(item.info.groupId) }}</div>
                                </div>
                                <div v-else>
                                    <div>{{ Translate('IDCS_SAMPLE') }}</div>
                                </div>
                            </div>
                            <div>({{ item.similarity }}%)</div>
                        </template>
                        <template v-else>
                            <div>{{ displayCardTime(item.timestamp) }}</div>
                            <div>{{ item.chlName }}</div>
                            <div v-show="!isSortVisible">({{ item.similarity }}%)</div>
                        </template>
                    </IntelBaseSnapItem>
                </div>
            </el-scrollbar>
            <div
                v-show="pageData.chartType === 'table'"
                class="base-table-box"
            >
                <el-table
                    ref="tableRef"
                    :show-header="formData.searchType === 'event'"
                    :span-method="handleTableSpanMethods"
                    :data="sliceTableData"
                    show-overflow-tooltip
                    @row-click="handleTableRowClick"
                    @selection-change="handleTableSelectionChange"
                >
                    <el-table-column
                        v-if="formData.searchType === 'event'"
                        :label="Translate('IDCS_SERIAL_NUMBER')"
                        type="index"
                        width="60"
                    />
                    <el-table-column
                        type="selection"
                        :selectable="getTableSelectable"
                    />
                    <el-table-column
                        v-if="formData.searchType === 'face'"
                        width="260"
                    >
                        <template #default="scope: TableColumn<IntelSearchFaceList>">
                            <div
                                v-if="scope.row.faceFeatureId === -1000"
                                class="table-date"
                            >
                                {{ displayDate(scope.row.timestamp) }}
                            </div>
                            <div
                                v-else
                                class="table-pic"
                            >
                                <img :src="scope.row.pic" />
                                <img :src="scope.row.match" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_SNAP_TIME')">
                        <template #default="scope: TableColumn<IntelSearchFaceList>">
                            {{ formData.searchType === 'event' ? displayDateTime(scope.row.timestamp) : displayTime(scope.row.timestamp) }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="formData.searchType === 'face'">
                        <template #default="scope: TableColumn<IntelSearchFaceList>"> {{ scope.row.info.name }} ({{ scope.row.similarity }}%) </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL')"
                        prop="chlName"
                    />
                    <el-table-column
                        width="100"
                        :label="Translate('IDCS_DETAIL_INFO')"
                    >
                        <template #default="scope: TableColumn<IntelSearchFaceList>">
                            <BaseImgSprite
                                file="browser"
                                :index="0"
                                :hover-index="1"
                                :chunk="4"
                                @click.stop="showDetail(scope.row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div
                v-show="pageData.isSupportBackUp && !isTrackVisible"
                class="base-btn-box space-between"
            >
                <div>
                    <el-checkbox
                        v-model="pageData.isBackUpPic"
                        :label="Translate('IDCS_BACKUP_PICTURE')"
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
            <div
                v-show="!isTrackVisible"
                class="base-btn-box"
            >
                <el-button
                    :disabled="!selectionIds.length || (!pageData.isBackUpPic && !pageData.isBackUpVideo)"
                    @click="backUp"
                >
                    {{ Translate('IDCS_BACKUP') }}
                </el-button>
            </div>
            <div v-show="isTrackVisible">
                <div
                    v-show="isTrackVisible && pageData.isMultiFaceSearch"
                    class="no-track"
                >
                    {{ Translate('IDCS_TRACK_SHOW_TIP') }}
                </div>
                <IntelFaceSearchTrackMapPanel
                    v-show="isTrackVisible && !pageData.isMultiFaceSearch"
                    :visible="isTrackVisible && !pageData.isMultiFaceSearch"
                    :data="pageData.trackMapList"
                    @play="play"
                    @pause="pause"
                    @stop="stop"
                    @resume="resume"
                />
            </div>
        </div>
        <IntelBaseSnapPop
            v-model="pageData.isDetailPop"
            :list="sliceTableData"
            :index="pageData.detailIndex"
            show-search
            @close="pageData.isDetailPop = false"
            @play-rec="playRec"
            @add="register"
            @search="searchSnap"
        />
        <IntelBaseFaceMatchPop
            v-model="pageData.isMatchPop"
            :list="matchList"
            :index="pageData.matchIndex"
            @close="pageData.isMatchPop = false"
            @play-rec="playRec"
            @search="searchSnap"
        />
        <IntelFaceSearchChooseFacePop
            v-model="pageData.isChoosePop"
            :type="formData.face"
            :snap="formData.snapFace"
            :face="formData.featureFace"
            :group="formData.featureFaceGroup"
            :external="formData.importFace"
            @choose-snap="changeSnap"
            @choose-group="changeFaceGroup"
            @choose-face="changeFace"
            @import-files="changeImportFace"
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
        <BaseTableSelectPop
            v-model="pageData.isChlPop"
            :title="Translate('IDCS_CHANNEL_SELECT')"
            :data="pageData.chlOptions"
            :current="formData.chls"
            :label-title="Translate('IDCS_CHANNEL_NAME')"
            @confirm="confirmChangeChl"
        >
            <el-checkbox
                v-show="isIdentityVisible"
                v-model="formData.identityFlag"
                :label="Translate('IDCS_IDENTITY_SNAPSHOT')"
            />
        </BaseTableSelectPop>
        <IntelFaceDBSnapRegisterPop
            v-model="pageData.isRegisterPop"
            :pic="pageData.registerPic"
            @close="pageData.isRegisterPop = false"
        />
    </div>
</template>

<script lang="ts" src="./IntelFaceSearch.v.ts"></script>

<style lang="scss" scoped>
.el-menu {
    border-bottom: 1px solid var(--main-border);
    background-color: transparent;
}

.el-menu--horizontal {
    height: 55px;
}

.el-menu--horizontal > .el-menu-item {
    color: var(--main-text);

    &.is-active {
        background-color: transparent;
    }

    &:hover {
        background-color: transparent;
    }
}

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

.chl-btn {
    margin-right: 5px;
}

.match-info {
    display: flex;
    justify-content: space-between;

    & > div {
        width: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}

.face-pic {
    width: 152px;
    height: 174px;
    border: 1px solid var(--content-border);
    flex-shrink: 0;

    &-add {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &-btn {
        height: 22px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        background-color: var(--btn-bg);

        .el-button {
            & + .el-button {
                margin-left: 0;
            }
        }
    }

    &-multi {
        position: relative;
        width: 100%;
        height: 152px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #1c1c1d;
    }

    img {
        width: 100%;
        height: 152px;
    }
}

.face-info {
    width: 150px;
    flex-shrink: 0;
    font-size: 14px;
    margin-left: 10px;
    line-height: 1.8;

    span:first-child::after {
        content: ': ';
    }
}

.table-date {
    height: 50px;
    text-align: left;
    margin-left: 50px;
    line-height: 50px;
    font-size: 18px;
}

.table-pic {
    width: 117 * 2px;
    height: 130px;

    img {
        width: 50%;
        height: 100%;

        &[src=''] {
            opacity: 0;
        }
    }
}

.no-track {
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
}
</style>
