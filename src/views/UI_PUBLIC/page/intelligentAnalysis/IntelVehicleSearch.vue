<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-车（汽车、摩托车/单车、车牌号）
-->
<template>
    <div class="base-intel-box">
        <div
            v-show="!pageData.isDetailOpen"
            class="base-intel-left"
        >
            <!-- 汽车、摩托车/单车、车牌号 tab -->
            <el-radio-group
                v-model="pageData.searchType"
                size="large"
                class="inline hide-border-top hide-border-inline tab_container"
            >
                <el-radio-button
                    v-for="item in pageData.searchOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
            <!-- 时间、通道、属性、车牌号等条件筛选 -->
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <!-- 时间选择 -->
                    <IntelBaseDateTimeSelector v-model="pageData.dateRange" />
                    <!-- 通道选择 -->
                    <IntelBaseChannelSelector v-model="pageData.chlIdList" />
                    <!-- 属性选择 - 汽车 -->
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byCar'"
                        v-model="pageData.attributeForCar"
                        :range="['car']"
                    />
                    <!-- 属性选择 - 摩托车/单车 -->
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byMotorcycle'"
                        v-model="pageData.attributeForMotorcycle"
                        :range="['motor']"
                    />
                    <!-- 车牌号填写、车牌号颜色选择 -->
                    <el-form
                        v-show="pageData.searchType === 'byPlateNumber'"
                        v-title
                        class="no-padding plate_number_color"
                        :style="{
                            '--form-label-width': '100px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_LICENSE_PLATE')">
                            <el-input
                                v-model="pageData.plateNumber"
                                :placeholder="Translate('IDCS_ENTER_PLATE_NUM')"
                                maxlength="31"
                            />
                            <IntelBasePlateColorPop
                                :selected-colors="pageData.plateColors"
                                @confirm-color="handleChangePlateColor"
                            />
                        </el-form-item>
                    </el-form>
                </div>
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
                <!-- 抓拍图、轨迹 tab -->
                <div>
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
                </div>
                <!-- 排序、全选 -->
                <div>
                    <!-- 汽车 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byCar'">
                        <el-dropdown ref="carSortDropdown">
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
                    <!-- 摩托车/单车 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byMotorcycle'">
                        <el-dropdown ref="motorcycleSortDropdown">
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
                    <!-- 车牌号 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byPlateNumber'">
                        <el-dropdown ref="plateNumberSortDropdown">
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
            </div>
            <!-- 抓拍图容器 -->
            <div class="base-intel-center-center base-intel-pics-box">
                <!-- 汽车 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byCar'"
                    id="byCarSearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="(item, index) in pageData.targetDatasForCar"
                        :key="index"
                        :target-data="item"
                        :detail-index="pageData.openDetailIndexForCar"
                        :show-compare="false"
                        search-type="byCar"
                        @detail="showDetail(item)"
                        @checked="handleChecked"
                    />
                </div>
                <!-- 摩托车/单车 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byMotorcycle'"
                    id="byMotorcycleSearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="(item, index) in pageData.targetDatasForMotorcycle"
                        :key="index"
                        :target-data="item"
                        :detail-index="pageData.openDetailIndexForMotorcycle"
                        :show-compare="false"
                        search-type="byMotorcycle"
                        @detail="showDetail(item)"
                        @checked="handleChecked"
                    />
                </div>
                <!-- 车牌号 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byPlateNumber'"
                    id="byPlateNumberSearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="(item, index) in pageData.targetDatasForPlateNumber"
                        :key="index"
                        :target-data="item"
                        :detail-index="pageData.openDetailIndexForPlateNumber"
                        :show-compare="false"
                        search-type="byPlateNumber"
                        @detail="showDetail(item)"
                        @checked="handleChecked"
                    />
                </div>
            </div>
            <!-- 分页器、备份/全部备份按钮容器 -->
            <div class="base-intel-center-bottom">
                <!-- 分页器 -->
                <div class="base-btn-box">
                    <!-- 汽车 - 分页器 -->
                    <BasePagination
                        v-show="pageData.searchType === 'byCar'"
                        v-model:current-page="pageData.pageIndexForCar"
                        v-model:page-size="pageData.pageSizeForCar"
                        :page-sizes="[pageData.pageSizeForCar]"
                        :total="pageData.targetIndexDatasForCar.length"
                        @current-change="handleChangePage"
                    />
                    <!-- 摩托车/单车 - 分页器 -->
                    <BasePagination
                        v-show="pageData.searchType === 'byMotorcycle'"
                        v-model:current-page="pageData.pageIndexForMotorcycle"
                        v-model:page-size="pageData.pageSizeForMotorcycle"
                        :page-sizes="[pageData.pageSizeForMotorcycle]"
                        :total="pageData.targetIndexDatasForMotorcycle.length"
                        @current-change="handleChangePage"
                    />
                    <!-- 车牌号 - 分页器 -->
                    <BasePagination
                        v-show="pageData.searchType === 'byPlateNumber'"
                        v-model:current-page="pageData.pageIndexForPlateNumber"
                        v-model:page-size="pageData.pageSizeForPlateNumber"
                        :page-sizes="[pageData.pageSizeForPlateNumber]"
                        :total="pageData.targetIndexDatasForPlateNumber.length"
                        @current-change="handleChangePage"
                    />
                </div>
                <!-- 备份/全部备份按钮 -->
                <div class="base-btn-box">
                    <!-- 汽车 -->
                    <div v-show="pageData.searchType === 'byCar'">
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
                    <!-- 摩托车/单车 -->
                    <div v-show="pageData.searchType === 'byMotorcycle'">
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
                    <!-- 车牌号 -->
                    <div v-show="pageData.searchType === 'byPlateNumber'">
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
    <IntelSearchBackupPop ref="IntelSearchBackupPopRef" />
</template>

<script lang="ts" src="./IntelVehicleSearch.v.ts"></script>

<style lang="scss" scoped>
* {
    box-sizing: border-box !important;
}

.base-intel-left {
    padding: 0;

    & > .base-intel-left-column {
        padding: 10px;
        width: 100%;

        .base-intel-left-form {
            padding: 0;

            :deep(.el-form) {
                height: 30px;

                &.plate_number_color {
                    .el-form-item__label,
                    .el-input {
                        height: 30px;
                    }

                    .el-form-item__content {
                        height: 30px;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;

                        > div {
                            flex: 1;
                        }

                        > div.el-input {
                            flex: 1.5;
                        }

                        .base-intel-placeholder {
                            margin-bottom: 0;
                        }
                    }
                }
            }
        }

        :deep(.el-form) {
            height: 30px;
            margin-bottom: 10px !important;

            .el-form-item {
                padding: 0 !important;

                .el-input__inner {
                    height: 30px;
                }
            }
        }
    }
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
</style>
