<template>
    <div class="lot">
        <!-- 头部操作区域 -->
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
        <div class="center">
            <div class="base-intel-box">
                <div
                    v-show="!pageData.isDetailOpen"
                    class="base-intel-left"
                >
                    <!-- 时间选择 -->
                    <div class="label label1">{{ Translate('IDCS_TIME') }}</div>
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
                    <div class="label label2">{{ Translate('IDCS_CHANNEL') }}</div>
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
                    <div class="label label3">{{ Translate('IDCS_OPERATE_SNAPSHOT_MSPB') }}</div>
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
                            @change="getAllTargetIndexDatas"
                        />
                    </div>
                    <!-- 搜索按钮 -->
                    <div class="base-intel-row">
                        <el-button @click="getAllTargetIndexDatas">{{ Translate('IDCS_SEARCH') }}</el-button>
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
                                v-model="pageData.isCheckedAll"
                                :label="Translate('IDCS_SELECT_ALL')"
                                @change="handleCheckedAll"
                            />
                        </div>
                    </div>
                    <!-- 抓拍图容器 -->
                    <div class="base-intel-center-center base-intel-pics-box">
                        <!-- 目标检索 - 抓拍图容器 -->
                        <div
                            id="bySearchTargetSearchContentPic"
                            class="base-intel-pics-content"
                        >
                            <IntelBaseSnapItem
                                v-for="(item, index) in pageData.targetDatasForSearchTarget"
                                :key="index"
                                :target-data="item"
                                :detail-index="pageData.openDetailIndexForSearchTarget"
                                :show-compare="false"
                                search-type="bySearchTarget"
                                @detail="showDetail(item)"
                                @checked="handleChecked"
                            />
                        </div>
                    </div>
                    <!-- 分页器、备份/全部备份按钮容器 -->
                    <div class="base-intel-center-bottom">
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
                            <el-dropdown placement="top-end">
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
                            </el-dropdown>
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
    justify-content: space-between;
    align-items: center;
    background-color: var(--parklog-bg);
    box-sizing: border-box;
    padding: 5px 20px;
    position: relative;
    border-bottom: 1px solid var(--content-border);

    &-left,
    &-right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        &-label {
            margin-left: 4px;
        }
    }

    &-right {
        .Sprite {
            transform: scale(0.5);
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

    .base-intel-left {
        padding: 14px;

        .label {
            margin-bottom: 4px;
        }

        .label2,
        .label3 {
            margin-top: 24px;
        }
    }

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
        margin: 24px 0;
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
