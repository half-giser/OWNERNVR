<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-人（人脸、人体、人属性）
-->
<template>
    <div class="base-intel-box">
        <div
            v-show="!pageData.isDetailOpen"
            class="base-intel-left"
        >
            <!-- 人脸、人体、人属性 tab -->
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
            <!-- 时间、通道、属性、图片选择等条件筛选 -->
            <div class="base-intel-left-column">
                <div class="base-intel-left-form">
                    <!-- 时间选择 -->
                    <IntelBaseDateTimeSelector v-model="pageData.dateRange" />
                    <!-- 通道选择 -->
                    <IntelBaseChannelSelector
                        v-model="pageData.chlIdList"
                        @ready="getChlIdNameMap"
                    />
                    <!-- 属性选择 - 人属性 -->
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byPersonAttribute'"
                        v-model="pageData.attributeForPersonAttribute"
                        placeholder-type="spread"
                        :range="['person']"
                    />
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
            <div class="base-intel-row space-between">
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
                    <!-- 人脸 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byFace'">
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SORT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                    class="sort_item"
                                >
                                    <span>{{ opt.label }}</span>
                                    <BaseImgSprite
                                        file="sortDes"
                                        :chunk="4"
                                        class="icon_right"
                                    />
                                </div>
                            </template>
                        </el-dropdown>
                        <el-checkbox
                            :label="Translate('IDCS_SELECT_ALL')"
                            @update:model-value="handleSelectAll"
                        />
                    </div>
                    <!-- 人体 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byBody'">
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SORT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                    class="sort_item"
                                >
                                    <span>{{ opt.label }}</span>
                                    <BaseImgSprite
                                        file="sortDes"
                                        :chunk="4"
                                        class="icon_right"
                                    />
                                </div>
                            </template>
                        </el-dropdown>
                        <el-checkbox
                            :label="Translate('IDCS_SELECT_ALL')"
                            @update:model-value="handleSelectAll"
                        />
                    </div>
                    <!-- 人属性 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byPersonAttribute'">
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SORT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                    class="sort_item"
                                >
                                    <span>{{ opt.label }}</span>
                                    <BaseImgSprite
                                        file="sortDes"
                                        :chunk="4"
                                        class="icon_right"
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
            </div>
            <!-- 抓拍图容器 -->
            <el-scrollbar class="base-intel-pics-box">
                <!-- 人脸 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byFace'"
                    id="byFaceSearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="item in pageData.targetDatasForFace"
                        :key="item.targetID"
                        :target-data="item"
                    />
                </div>
                <!-- 人体 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byBody'"
                    id="byBodySearchContentPic"
                    class="base-intel-pics-content"
                >
                    人体-IntelBaseSnapItem
                </div>
                <!-- 人属性 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byPersonAttribute'"
                    id="byPersonAttributeSearchContentPic"
                    class="base-intel-pics-content"
                >
                    人属性-IntelBaseSnapItem
                </div>
            </el-scrollbar>
            <!-- 分页器容器 -->
            <div class="base-btn-box">
                <!-- 人脸 - 分页器 -->
                <BasePagination
                    v-show="pageData.searchType === 'byFace'"
                    v-model:current-page="pageData.pageIndexForFace"
                    v-model:page-size="pageData.pageSizeForFace"
                    :page-sizes="[pageData.pageSizeForFace]"
                    :total="pageData.targetIndexDatasForFace.length"
                    @current-change="handleChangePage"
                />
                <!-- 人体 - 分页器 -->
                <BasePagination
                    v-show="pageData.searchType === 'byBody'"
                    v-model:current-page="pageData.pageIndexForBody"
                    v-model:page-size="pageData.pageSizeForBody"
                    :page-sizes="[pageData.pageSizeForBody]"
                    :total="pageData.targetIndexDatasForBody.length"
                    @current-change="handleChangePage"
                />
                <!-- 人属性 - 分页器 -->
                <BasePagination
                    v-show="pageData.searchType === 'byPersonAttribute'"
                    v-model:current-page="pageData.pageIndexForPersonAttribute"
                    v-model:page-size="pageData.pageSizeForPersonAttribute"
                    :page-sizes="[pageData.pageSizeForPersonAttribute]"
                    :total="pageData.targetIndexDatasForPersonAttribute.length"
                    @current-change="handleChangePage"
                />
            </div>
            <!-- 备份/全部备份按钮容器 -->
            <div class="base-btn-box">
                <el-button>
                    {{ Translate('IDCS_BACKUP') }}
                </el-button>
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
            详情容器
        </div>
    </div>
</template>

<script lang="ts" src="./IntelPersonSearch.v.ts"></script>

<style lang="scss" scoped>
* {
    box-sizing: border-box !important;
}

.base-intel-left {
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .el-radio-group.tab_container {
        flex-shrink: 0;
        width: 100%;
        height: 50px;

        .el-radio-button {
            height: 100%;
            :deep(.el-radio-button__inner) {
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                border-left: none;
                border-right: none;
                box-shadow: none;

                &:hover {
                    background-color: transparent !important;
                }
            }
            :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
                background-color: transparent !important;
                color: var(--primary) !important;
            }
        }
    }

    & > .base-intel-left-column {
        padding: 10px;
        width: 100%;

        .base-intel-left-form {
            padding: 0px;
        }

        :deep(.el-form) {
            height: 30px;
            margin-bottom: 10px !important;
            .el-form-item {
                padding: 0px !important;
                .el-input__inner {
                    height: 30px;
                }
            }
        }
    }
}

.base-intel-center {
    position: relative;
    .base-intel-row {
        .el-radio-button {
            :deep(.el-radio-button__inner) {
                width: auto !important;
            }
        }
        .el-dropdown {
            margin-right: 30px;
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
        right: 0px;
    }
    &.detail_open {
        border-right: 1px solid var(--content-border);
        .resize_icon_left {
            left: 0px;
        }
        .resize_icon_right {
            right: -10px;
        }
    }
}

.sort_item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0px 14px;
    cursor: pointer;
    font-size: 14px;
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
