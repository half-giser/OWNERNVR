<template>
    <div class="lot">
        <!-- 头部提示 -->
        <div class="top">
            <div class="top-left">
                <el-tooltip :content="Translate('IDCS_REID')">
                    <BaseImgSpriteBtn
                        class="btn"
                        file="target_retrieval"
                    />
                </el-tooltip>
                <div class="top-left-label">{{ Translate('IDCS_REID') }}</div>
            </div>
            <div class="top-right">
                <BaseImgSpriteBtn
                    class="btn"
                    file="exit"
                    @click="hanbleExit"
                />
                <div
                    class="top-left-label"
                    @click="hanbleExit"
                >
                    {{ Translate('IDCS_EXIT') }}
                </div>
            </div>
        </div>
        <!-- 搜索条件、结果显示区域 -->
        <div class="center">
            <div class="base-intel-box">
                <div
                    v-show="!pageData.isDetailOpen"
                    class="base-intel-left"
                >
                    <!-- 时间选择 -->
                    <div>{{ Translate('IDCS_TIME') }}</div>
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
                    <div>{{ Translate('IDCS_CHANNEL') }}</div>
                    <div class="base-intel-row">
                        <el-table
                            ref="tableRef"
                            v-title
                            width="370"
                            height="250"
                            :data="tableData"
                            row-key="value"
                            @selection-change="handleCurrentChange"
                            @row-click="handleRowClick"
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
                    <div>{{ Translate('IDCS_OPERATE_SNAPSHOT_MSPB') }}</div>
                    <!-- 图片 -->
                    <div class="pic_container">
                        <img
                            v-if="pageData.pic"
                            :src="pageData.pic"
                        />
                    </div>
                    <!-- 相似度 -->
                    <div class="similarity_container">
                        <span class="base-ai-slider-label">{{ Translate('IDCS_SIMILARITY') }}</span>
                        <BaseSliderInput
                            v-model="pageData.similarity"
                            :min="1"
                            :max="100"
                            @change="getData"
                        />
                    </div>
                    <!-- 搜索按钮 -->
                    <div class="base-intel-row">
                        <el-button @click="getData">{{ Translate('IDCS_SEARCH') }}</el-button>
                    </div>
                </div>
                <div
                    class="base-intel-center"
                    :class="{
                        detail_open: pageData.isDetailOpen,
                    }"
                >
                    <!-- 抓拍图/轨迹tab、排序、全选 -->
                    <div class="base-intel-center-top base-intel-row space-between">
                        <!-- 排序、全选 -->
                        <div>
                            <el-dropdown ref="dropdownRef">
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_SORT') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <div
                                        v-for="opt in pageData.sortOptions"
                                        :key="opt.value"
                                        class="sort_item"
                                        @click="handleSort(opt.value)"
                                    >
                                        <span class="sort_item_label">{{ opt.label }}</span>
                                        <BaseImgSprite
                                            :file="opt.status === 'up' ? 'sortAsc' : 'sortDes'"
                                            :chunk="4"
                                            :index="pageData.sortType === opt.value ? 1 : 3"
                                        />
                                    </div>
                                </template>
                            </el-dropdown>
                            <el-checkbox
                                :label="Translate('IDCS_SELECT_ALL')"
                                @update:model-value="handleSelectAll"
                            />
                        </div>
                    </div>
                    <!-- 抓拍图容器 -->
                    <div class="base-intel-center-center base-intel-pics-box">
                        <!-- 人脸 - 抓拍图容器 -->
                        <div
                            id="byFaceSearchContentPic"
                            class="base-intel-pics-content"
                        >
                            <IntelBaseSnapItem
                                v-for="item in pageData.targetDatasForFace"
                                :key="item.targetID"
                                :target-data="item"
                                :detail-index="pageData.openDetailIndexForFace"
                                :show-compare="showCompare"
                                :choose-pics="pageData.choosePicsForFace"
                                search-type="byFace"
                                @detail="showDetail(item)"
                                @search="getData"
                            />
                        </div>
                    </div>
                    <!-- 分页器、备份/全部备份按钮容器 -->
                    <div class="base-intel-center-bottom">
                        <!-- 分页器 -->
                        <div class="base-btn-box">
                            <!-- 人脸 - 分页器 -->
                            <BasePagination
                                v-model:current-page="pageData.pageIndexForFace"
                                v-model:page-size="pageData.pageSizeForFace"
                                :page-sizes="[pageData.pageSizeForFace]"
                                :total="pageData.targetIndexDatasForFace.length"
                                @current-change="handleChangePage"
                            />
                        </div>
                        <!-- 备份/全部备份按钮 -->
                        <div class="base-btn-box">
                            <!-- 人脸 -->
                            <el-button @click="handleBackupAll">
                                {{ Translate('IDCS_BACK_UP_ALL_FACE') }}
                            </el-button>
                            <el-dropdown placement="top-end">
                                <el-button>
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
                            </el-dropdown>
                        </div>
                    </div>
                </div>
                <!-- 打开/关闭详情按钮 -->
                <div class="resize_icon_left">
                    <BaseImgSprite
                        :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
                        :chunk="4"
                        class="icon_left"
                        @click="switchDetail"
                    />
                </div>
                <div class="resize_icon_right">
                    <BaseImgSprite
                        :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
                        :chunk="4"
                        class="icon_right"
                        @click="switchDetail"
                    />
                </div>
            </div>
            <!-- 详情容器 -->
            <div
                v-show="pageData.isDetailOpen"
                class="base-intel-right"
            >
                <IntelSearchDetail
                    ref="detailRef"
                    @change-item="handleChangeItem"
                />
            </div>
        </div>
        <div class="copyright">{{ Translate('IDCS_COPYRIGHT') }}</div>
    </div>
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
    align-items: center;
    background-color: var(--parklog-bg);
    box-sizing: border-box;
    padding: 5px 20px;
    margin-bottom: 3px;
    position: relative;

    &-left {
        width: 300px;
        position: absolute;
        top: 0;
        left: 5px;
        bottom: 0;
        margin: auto;

        > span,
        > div {
            display: inline-block;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            margin: auto;
        }

        &-label {
            left: 44px !important;
            height: 22px;
        }
    }

    &-right {
        width: 130px;
        height: 47px;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        display: inline-block;

        .btn {
            width: 30px;
            height: 30px;
            cursor: pointer;
            background-size: auto 100%;
        }

        > span,
        > div {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            margin: auto;
        }

        &-label {
            left: 44px !important;
            height: 22px;
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

.center {
    width: 100%;
    height: calc(100% - 60px);
    position: relative;
    box-sizing: border-box;
    display: flex;
    padding: 0 10px;

    .pic_container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        > img {
            width: 150px;
            height: 150px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .similarity_container {
        width: 100%;
        padding: 0 44px;
        margin-top: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
    }

    .base-intel-center {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        .base-intel-row {
            .el-radio-button {
                :deep(.el-radio-button__inner) {
                    width: auto !important;
                }
            }

            .el-dropdown {
                margin-right: 30px;

                .BaseDropdownBtn {
                    line-height: unset;
                }
            }
        }

        .resize_icon_left,
        .resize_icon_right {
            cursor: pointer;
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
            width: 10px;
            height: 60px;

            &:hover {
                opacity: 0.8;
            }
        }

        .resize_icon_left {
            left: -10px;
        }

        .resize_icon_right {
            right: 0;
        }

        &.detail_open {
            border-right: 1px solid var(--content-border);

            .resize_icon_left {
                left: 0;
            }

            .resize_icon_right {
                right: -10px;
            }
        }

        .base-intel-center-top {
            width: 100%;
            height: 27px;
        }

        .base-intel-center-center {
            width: calc(100% - 30px);
            height: calc(100% - 139px);
            position: absolute;
            top: 52px;
            left: 15px;
            right: 15px;
            overflow: auto;
        }

        .base-intel-center-bottom {
            width: 100%;
            height: 72px;
        }
    }
}

.sort_item {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    max-width: 85px;
    cursor: pointer;
    font-size: 14px;
    border: solid 1px var(--content-border);
    background-color: var(--color-white);

    &_label {
        display: flex;
        flex: 1;
        padding-left: 10px;
        justify-content: flex-end;
        white-space: nowrap;
    }

    &:hover {
        color: var(--primary);
    }

    .Sprite {
        transform: scale(0.7);
    }
}

.base-intel-right {
    padding: 10px;
}

.base-btn-box {
    margin-bottom: 10px;
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
