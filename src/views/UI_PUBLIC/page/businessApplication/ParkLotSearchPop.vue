<!--
 * @Date: 2025-05-24 11:06:41
 * @Description: 停车场-车辆进出记录搜索弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="target-search">
        <div class="target-search-wrap">
            <div class="target-search-title">
                <div>
                    <BaseImgSprite file="enter_exit_record" />
                    <span class="target-search-title-text">{{ Translate('IDCS_VEHICLE_ENTRY_EXIT_RECORD') }}</span>
                </div>
                <div>
                    <BaseImgSprite
                        file="close"
                        :index="0"
                        :hover-index="1"
                        :chunk="2"
                        @click="$emit('close')"
                    />
                </div>
            </div>
            <div class="base-intel-box">
                <div
                    v-show="!pageData.isDetailOpen"
                    class="base-intel-left"
                >
                    <div class="base-intel-left-column">
                        <div class="base-intel-left-form">
                            <!-- 时间选择 -->
                            <IntelBaseDateTimeSelector v-model="pageData.dateRange" />
                            <!-- 通道选择 -->
                            <IntelBaseChannelSelector
                                v-model="pageData.chlIdList"
                                mode="park"
                                @ready="getChlIdNameMap"
                            />
                            <IntelBaseVehicleDirectionSelector v-model="pageData.direction" />
                            <el-form
                                class="no-padding"
                                :style="{
                                    '--form-label-width': '100px',
                                    '--form-input-width': '100%',
                                }"
                            >
                                <el-form-item :label="Translate('IDCS_LICENSE_PLATE')">
                                    <el-input
                                        v-model="pageData.plateNumber"
                                        :placeholder="Translate('IDCS_ENTER_PLATE_NUM')"
                                        maxlength="31"
                                    />
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <!-- 搜索按钮 -->
                    <div class="base-intel-row">
                        <el-button @click="getList">{{ Translate('IDCS_SEARCH') }}</el-button>
                    </div>
                </div>
                <div
                    class="base-intel-center"
                    :class="{
                        detail_open: pageData.isDetailOpen,
                    }"
                >
                    <!-- 抓拍图 排序tab -->
                    <div class="base-intel-center-top base-intel-row space-between">
                        <el-radio-group
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
                        <div>
                            <el-checkbox
                                :model-value="selectAll"
                                :label="Translate('IDCS_SELECT_ALL')"
                                :disabled="!peerSliceTableData.length"
                                @update:model-value="handleSelectAll"
                            />
                        </div>
                    </div>
                    <div class="base-intel-pics-box">
                        <div class="base-intel-pics-content">
                            <IntelBaseSnapItem
                                v-for="(item, index) in peerSliceTableData"
                                :key="item.targetID"
                                :target-data="item"
                                :detail-index="`${pageData.detailIndex}`"
                                search-type="byPassRecord"
                                :grid="pageData.isDetailOpen ? 2 : 3"
                                ratio="60%"
                                @detail="showDetail(index)"
                                @backup="backUpItem(index)"
                            />
                        </div>
                    </div>
                    <div class="base-intel-center-bottom">
                        <div class="base-btn-box">
                            <BasePagination
                                v-model:current-page="pageData.pageIndex"
                                v-model:page-size="pageData.pageSize"
                                :page-sizes="[40]"
                                :total="tableData.length"
                                @current-change="changePage"
                            />
                        </div>
                        <div class="base-btn-box">
                            <el-dropdown
                                placement="top-end"
                                :disabled="!hasSelected"
                            >
                                <el-button :disabled="!hasSelected">
                                    {{ Translate('IDCS_BACKUP') }}
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.backupTypeOptions"
                                            :key="item.value"
                                            @click="backUp(item.value)"
                                        >
                                            {{ Translate(item.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                    <BaseImgSpriteBtn
                        file="left_open"
                        class="base-intel-toggle-left"
                        :class="{ open: pageData.isDetailOpen }"
                        @click="switchDetail"
                    />
                    <BaseImgSpriteBtn
                        file="left_open"
                        class="base-intel-toggle-right"
                        :class="{ open: pageData.isDetailOpen }"
                        @click="switchDetail"
                    />
                </div>
                <!-- 详情容器 -->
                <div
                    v-show="pageData.isDetailOpen"
                    class="base-intel-right"
                >
                    <ParkLotSnapPanel
                        layout="search"
                        :current="pageData.detail"
                        :current-index="pageData.detailIndex"
                        :total="sliceTableData.length"
                        @prev="handlePrev"
                        @next="handleNext"
                    />
                    <div class="info">
                        <div class="info-title">{{ Translate('IDCS_VEHICLE_IN_OUT_DETAIL') }}</div>
                        <ParkLotInfoPanel
                            :current="pageData.detail"
                            type="read"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="copyright">{{ Translate('IDCS_COPYRIGHT') }}</div>
        <IntelSearchBackupPop
            ref="backupPopRef"
            :auth="auth"
        />
    </div>
</template>

<script lang="ts" src="./ParkLotSearchPop.v.ts"></script>

<style lang="scss" scoped>
.target-search {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-width: 1920px;
    height: 100vh;
    z-index: 10;
    background-color: var(--main-bg);
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &-wrap {
        margin: 20px;
        width: 1880px;
        height: calc(100% - 70px);
        box-sizing: border-box;
        border: 1px solid var(--content-border);
        flex-direction: column;
        display: flex;
    }

    &-title {
        width: 100%;
        height: 60px;
        flex-shrink: 0;
        border-bottom: 1px solid var(--content-border);
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        &-text {
            margin-left: 10px;
        }
    }

    .base-intel-box {
        height: calc(100% - 60px);
    }
}

.base-intel-center {
    &.detail_open {
        border-right: 1px solid var(--content-border);
    }

    &-center {
        overflow-y: scroll;
    }
}

.base-intel-right {
    width: 826px;
}

.info {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    margin-top: 10px;

    &-title {
        color: var(--primary);
        border-bottom: 1px solid var(--content-border);
        font-weight: bolder;
        line-height: 1.8;
    }
}

.copyright {
    text-align: center;
    font-size: 11px;
    padding: 1px 0;
    height: 18px;
    width: 100%;
    color: var(--header-menu-text);
    background-color: var(--main-bg);
    border-top: 1px solid var(--main-border);
    flex-shrink: 0;
}
</style>
