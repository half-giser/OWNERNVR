<!--
 * @Description: 目标检索页面
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-26 14:21:56
-->
<template>
    <div class="lot">
        <!-- 头部操作区域 -->
        <div class="top">
            <div class="top-left">
                <BaseImgSpriteBtn
                    class="btn"
                    :hover-index="-1"
                    :active-index="0"
                    file="target_retrieval"
                    :title="Translate('IDCS_REID')"
                />
                <div class="top-left-label">{{ Translate('IDCS_REID') }}</div>
            </div>
            <div class="top-right">
                <BaseImgSprite
                    class="btn"
                    file="exit"
                    :index="0"
                    :hover-index="1"
                    :chunk="2"
                    :scale="0.5"
                    @click="handleExit"
                />
                <div
                    class="top-left-label"
                    @click="handleExit"
                >
                    {{ Translate('IDCS_EXIT') }}
                </div>
            </div>
        </div>
        <!-- 搜索条件、结果显示区域 -->
        <div class="base-intel-box">
            <!-- 左侧条件筛选 -->
            <div
                v-show="!pageData.isDetailOpen"
                class="base-intel-left"
            >
                <!-- 时间选择 -->
                <div class="label">{{ Translate('IDCS_TIME') }}</div>
                <div class="base-intel-row">
                    <BaseDateTab
                        :model-value="pageData.dateRange"
                        :layout="['date', 'week', 'custom', 'today']"
                        custom-type="day"
                        @change="changeDateRange"
                    />
                </div>
                <div class="base-intel-row">
                    <BaseDateRange
                        :model-value="pageData.dateRange"
                        :type="pageData.dateRangeType"
                        custom-type="day"
                        @change="changeDateRange"
                    />
                </div>
                <!-- 通道选择 -->
                <div class="label">{{ Translate('IDCS_CHANNEL') }}</div>
                <div class="base-intel-row">
                    <el-table
                        ref="tableRef"
                        v-title
                        width="370"
                        height="250"
                        :data="tableData"
                        row-key="value"
                        @selection-change="handleCurrentChange"
                    >
                        <el-table-column
                            type="selection"
                            width="50"
                        />
                        <el-table-column
                            :label="Translate('IDCS_CHANNEL_NAME')"
                            prop="label"
                            show-overflow-tooltip
                        />
                    </el-table>
                </div>
                <!-- 图片选择 -->
                <div class="label">{{ Translate('IDCS_OPERATE_SNAPSHOT_MSPB') }}</div>
                <!-- 图片 -->
                <div class="pic_container">
                    <img
                        v-if="pageData.pic"
                        :src="pageData.pic"
                    />
                </div>
                <!-- 相似度 -->
                <el-form class="no-padding">
                    <el-form-item :label="Translate('IDCS_SIMILARITY')">
                        <BaseSliderInput
                            v-model="pageData.similarity"
                            :min="1"
                            :max="100"
                            @change="getAllTargetIndexDatas"
                        />
                    </el-form-item>
                </el-form>
                <!-- 搜索按钮 -->
                <div class="base-intel-row">
                    <el-button @click="getAllTargetIndexDatas">{{ Translate('IDCS_SEARCH') }}</el-button>
                </div>
            </div>
            <!-- 中间抓拍图列表 -->
            <div
                class="base-intel-center"
                :class="{
                    detail_open: pageData.isDetailOpen,
                }"
            >
                <!-- 抓拍图/轨迹tab、排序、全选 -->
                <div class="base-btn-box collapse">
                    <!-- 排序、全选 -->
                    <BaseDropdown>
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_SORT') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                    class="base-intel-sort-item"
                                    @click="handleSort(opt.value)"
                                >
                                    <span class="base-intel-sort-item-label">{{ opt.label }}</span>
                                    <BaseImgSprite
                                        :file="opt.status === 'up' ? 'sortAsc' : 'sortDes'"
                                        :chunk="4"
                                        :scale="0.7"
                                        :index="pageData.sortType === opt.value ? 1 : 3"
                                    />
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </BaseDropdown>
                    <el-checkbox
                        v-model="pageData.isCheckedAll"
                        :label="Translate('IDCS_SELECT_ALL')"
                        @change="handleCheckedAll"
                    />
                </div>
                <!-- 抓拍图容器 -->
                <div class="base-intel-pics-box">
                    <!-- 目标检索 - 抓拍图容器 -->
                    <div class="base-intel-pics-content">
                        <IntelBaseSnapItem
                            v-for="(item, index) in pageData.targetDatasForSearchTarget"
                            :key="index"
                            :target-data="item"
                            :detail-index="pageData.openDetailIndexForSearchTarget"
                            :show-compare="false"
                            :grid="pageData.isDetailOpen ? 4 : 6"
                            search-type="bySearchTarget"
                            @detail="showDetail(item)"
                            @checked="handleChecked"
                            @backup="handleBackupCurrentTarget"
                        />
                    </div>
                </div>
                <!-- 分页器 -->
                <div class="base-btn-box">
                    <!-- 目标检索 - 分页器 -->
                    <BasePagination
                        v-model:current-page="pageData.pageIndexForSearchTarget"
                        v-model:page-size="pageData.pageSizeForSearchTarget"
                        :page-sizes="[pageData.pageSizeForSearchTarget]"
                        :total="pageData.targetIndexDatasForSearchTarget.length"
                        @current-change="handleChangePage"
                    />
                </div>
                <!-- 备份/全部备份按钮 -->
                <div class="base-btn-box">
                    <!-- 目标检索 -->
                    <el-button @click="handleBackupAll">
                        {{ Translate('IDCS_BACK_UP_ALL_FACE') }}
                    </el-button>
                    <BaseDropdown placement="top-end">
                        <el-button :disabled="!isEnableBackup">
                            {{ Translate('IDCS_BACKUP') }}
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in pageData.backupTypeOptions"
                                    :key="item.value"
                                    @click="handleBackup(item.value)"
                                >
                                    {{ Translate(item.label) }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </BaseDropdown>
                </div>
                <!-- 打开/关闭详情按钮 -->
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
            <!-- 右侧详情容器 -->
            <div
                v-show="pageData.isDetailOpen"
                class="base-intel-right"
            >
                <IntelSearchDetailPanel
                    ref="detailRef"
                    @change-item="handleChangeItem"
                    @backup="handleBackupCurrentTarget"
                    @search="handleRefresh"
                />
            </div>
        </div>
        <div class="copyright">{{ Translate('IDCS_COPYRIGHT') }}</div>
    </div>
    <IntelSearchBackupPop
        ref="backupPopRef"
        :auth="auth"
    />
</template>

<script lang="ts" src="./SearchTarget.v.ts"></script>

<style lang="scss" scoped>
.lot {
    width: 100vw;
    height: 100vh;
    min-height: var(--main-min-height);
    display: flex;
    flex-direction: column;
}

.hide {
    opacity: 0;
}

.btn {
    width: 140px;

    &-item {
        width: 108px;
    }
}

.top {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--parklog-bg);
    box-sizing: border-box;
    padding: 5px 20px;
    position: relative;
    border-bottom: 1px solid var(--content-border);
    flex-shrink: 0;

    &-left,
    &-right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        &-label {
            margin-left: 4px;
        }
    }
}

.back {
    width: 100px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.pic_container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > img {
        display: flex;
        justify-content: center;
        width: 150px;
        height: 150px;
    }
}

.base-intel-left {
    padding: 14px;

    .label {
        margin-top: 24px;
        margin-bottom: 4px;
    }
}

.base-intel-center {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    flex: 1;

    .base-btn-box:first-child {
        margin-bottom: 10px;

        .el-dropdown {
            margin-right: 30px;

            .BaseDropdownBtn {
                line-height: unset;
            }
        }
    }

    &.detail_open {
        border-right: 1px solid var(--content-border);
        max-width: calc(100% - 748px);
    }
}

.intelDetail {
    height: calc(100% - 10px) !important;
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
