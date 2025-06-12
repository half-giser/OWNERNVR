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
            <div class="base-btn-box space-between collapse">
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
                                    <span class="base-intel-sort-item-label">{{ opt.label }} </span>
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
            </div>
            <!-- 抓拍图容器 -->
            <div class="base-intel-pics-box">
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
                <BaseDropdown placement="top-end">
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
                </BaseDropdown>
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
            <IntelSearchDetailPanel
                ref="detailRef"
                @change-item="handleChangeItem"
                @backup="handleBackupCurrentTarget"
                @search="handleLeaveToSearchTarget"
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
.base-intel-box {
    height: calc(var(--content-height) + 22px);
}

.base-intel-left-form {
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

.base-intel-center {
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
</style>
