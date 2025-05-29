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
                    <el-dropdown>
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_SORT') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                    class="sort_item"
                                    @click="handleSort(opt.value)"
                                >
                                    <span class="sort_item_label">{{ opt.label }} </span>
                                    <BaseImgSprite
                                        :file="opt.status === 'up' ? 'sortAsc' : 'sortDes'"
                                        :chunk="4"
                                        :index="pageData.sortType === opt.value ? 1 : 3"
                                    />
                                </el-dropdown-item>
                            </el-dropdown-menu>
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
                <!-- 汽车 - 抓拍图容器 -->
                <div class="base-intel-pics-content">
                    <IntelBaseSnapItem
                        v-for="(item, index) in getCurrTargetDatas()"
                        :key="index"
                        :target-data="item"
                        :detail-index="openDetailIndex"
                        :show-compare="false"
                        :search-type="pageData.searchType"
                        :grid="pageData.isDetailOpen ? 4 : 6"
                        @detail="showDetail(item)"
                        @checked="handleChecked"
                        @backup="handleBackupCurrentTarget"
                        @register="handleRegister"
                    />
                </div>
            </div>
            <!-- 分页器、备份/全部备份按钮容器 -->
            <div class="base-intel-center-bottom">
                <!-- 分页器 -->
                <div class="base-btn-box">
                    <BasePagination
                        :current-page="getCurrPageIndex()"
                        :page-size="pageData.pageSize"
                        :page-sizes="[pageData.pageSize]"
                        :total="getCurrTargetIndexDatas().length"
                        @update:current-page="setCurrPageIndex"
                        @current-change="handleChangePage"
                    />
                </div>
                <!-- 备份/全部备份按钮 -->
                <div class="base-btn-box">
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
                                    v-for="item in pageData.searchType === 'byPlateNumber' ? pageData.backupPlateTypeOptions : pageData.backupTypeOptions"
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
                <BaseImgSpriteBtn
                    :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
                    class="icon_left"
                    @click="switchDetail"
                />
            </div>
            <div class="resize_icon_right">
                <BaseImgSpriteBtn
                    :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
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
                @backup="handleBackupCurrentTarget"
            />
        </div>
    </div>
    <IntelSearchBackupPop
        ref="backupPopRef"
        :auth="auth"
    />
    <!-- 车牌注册弹框 -->
    <IntelLicencePlateDBAddPlatePop
        v-model="pageData.isRegisterPop"
        type="register"
        :data="{
            plateNumber: pageData.registerPlateNumber,
        }"
        @confirm="pageData.isRegisterPop = false"
        @close="pageData.isRegisterPop = false"
    />
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
    }
}

.base-intel-center {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    flex: 1;

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

    &_label {
        flex: 1;
        text-align: center;
    }

    &:hover {
        color: var(--primary);
    }

    .Sprite {
        transform: scale(0.7);
    }
}
</style>
