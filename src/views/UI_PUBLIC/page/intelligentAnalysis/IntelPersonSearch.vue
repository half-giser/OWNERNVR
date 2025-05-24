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
                    <!-- 图片选择、相似度 - 人脸 -->
                    <div v-show="pageData.searchType === 'byFace' && showPicChooser">
                        <!-- 图片 -->
                        <div class="add_pic_container">
                            <div
                                v-for="(item, index) in pageData.picCacheListForFace"
                                :key="item.pic"
                                class="add_pic_item"
                            >
                                <img
                                    v-if="item.pic"
                                    :src="item.pic"
                                />
                                <div class="pic_operation">
                                    <el-button @click="handleChangePic(index)">{{ Translate('IDCS_CHANGE') }}</el-button>
                                    <el-button @click="handleDeletePic(index)">{{ Translate('IDCS_DELETE') }}</el-button>
                                </div>
                            </div>
                            <div
                                v-if="pageData.picCacheListForFace.length < 5"
                                class="add_pic_item"
                            >
                                <BaseImgSpriteBtn
                                    file="addFF"
                                    :index="[0, 2, 2, 3]"
                                    @click.stop="openChoosePicPop"
                                />
                            </div>
                        </div>
                        <!-- 相似度 -->
                        <div
                            v-show="pageData.picCacheListForFace.length > 0"
                            class="similarity_container"
                        >
                            <span class="base-ai-slider-label">{{ Translate('IDCS_SIMILARITY') }}</span>
                            <BaseSliderInput
                                v-model="pageData.similarityForFace"
                                :min="1"
                                :max="100"
                            />
                        </div>
                    </div>
                    <!-- 图片选择、相似度 - 人体 -->
                    <div v-show="pageData.searchType === 'byBody' && showPicChooser">
                        <!-- 图片 -->
                        <div class="add_pic_container">
                            <div
                                v-for="(item, index) in pageData.picCacheListForBody"
                                :key="item.pic"
                                class="add_pic_item"
                            >
                                <img
                                    v-if="item.pic"
                                    :src="item.pic"
                                />
                                <div class="pic_operation">
                                    <el-button @click="handleChangePic(index)">{{ Translate('IDCS_CHANGE') }}</el-button>
                                    <el-button @click="handleDeletePic(index)">{{ Translate('IDCS_DELETE') }}</el-button>
                                </div>
                            </div>
                            <div
                                v-if="pageData.picCacheListForBody.length < 5"
                                class="add_pic_item"
                            >
                                <BaseImgSpriteBtn
                                    file="addFF"
                                    :index="[0, 2, 2, 3]"
                                    @click.stop="openChoosePicPop"
                                />
                            </div>
                        </div>
                        <!-- 相似度 -->
                        <div
                            v-show="pageData.picCacheListForBody.length > 0"
                            class="similarity_container"
                        >
                            <span class="base-ai-slider-label">{{ Translate('IDCS_SIMILARITY') }}</span>
                            <BaseSliderInput
                                v-model="pageData.similarityForBody"
                                :min="1"
                                :max="100"
                            />
                        </div>
                    </div>
                    <!-- 属性选择 - 人属性 -->
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byPersonAttribute'"
                        v-model="pageData.attributeForPersonAttribute"
                        :range="['person']"
                    />
                </div>
            </div>
            <!-- 搜索按钮 -->
            <div class="base-intel-row">
                <el-button @click="getAllTargetIndexDatas()">{{ Translate('IDCS_SEARCH') }}</el-button>
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
                        <el-dropdown ref="faceSortDropdown">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SORT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div
                                    v-for="opt in pageData.sortOptions"
                                    v-show="(pageData.isByPic && opt.value !== 'chl') || (!pageData.isByPic && opt.value !== 'similarity')"
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
                    <!-- 人体 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byBody'">
                        <el-dropdown ref="bodySortDropdown">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SORT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <div
                                    v-for="opt in pageData.sortOptions"
                                    v-show="(pageData.isByPic && opt.value !== 'chl') || (!pageData.isByPic && opt.value !== 'similarity')"
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
                    <!-- 人属性 - 排序、全选 -->
                    <div v-show="pageData.searchType === 'byPersonAttribute'">
                        <el-dropdown ref="personAttributeSortDropdown">
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
                        :detail-index="pageData.openDetailIndexForFace"
                        :show-compare="showCompare"
                        :choose-pics="pageData.picCacheListForFace"
                        search-type="byFace"
                        @detail="showDetail(item)"
                        @search="handleSearch"
                    />
                </div>
                <!-- 人体 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byBody'"
                    id="byBodySearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="item in pageData.targetDatasForBody"
                        :key="item.targetID"
                        :target-data="item"
                        :detail-index="pageData.openDetailIndexForBody"
                        :show-compare="showCompare"
                        :choose-pics="pageData.picCacheListForBody"
                        search-type="byBody"
                        @detail="showDetail(item)"
                        @search="handleSearch"
                    />
                </div>
                <!-- 人属性 - 抓拍图容器 -->
                <div
                    v-show="pageData.searchType === 'byPersonAttribute'"
                    id="byPersonAttributeSearchContentPic"
                    class="base-intel-pics-content"
                >
                    <IntelBaseSnapItem
                        v-for="item in pageData.targetDatasForPersonAttribute"
                        :key="item.targetID"
                        :target-data="item"
                        :detail-index="pageData.openDetailIndexForPersonAttribute"
                        :show-compare="false"
                        search-type="byPersonAttribute"
                        @detail="showDetail(item)"
                        @search="handleSearch"
                    />
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
    <!-- 人脸/人体 - 选择图片弹框 -->
    <IntelFaceSearchChooseFacePop
        v-model="pageData.isChoosePicPop"
        :type="pageData.picType"
        :open-type="pageData.searchType"
        :snap-face="pageData.snapFace"
        :snap-body="pageData.snapBody"
        :face="pageData.featureFace"
        @choose-face-snap="chooseFaceSnap"
        @choose-body-snap="chooseBodySnap"
        @choose-face="chooseFace"
    />
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
            padding: 0;

            .add_pic_container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;

                .add_pic_item {
                    width: 130px;
                    height: 150px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    border: 1px solid var(--content-border);
                    margin: 3px;

                    img {
                        width: 100%;
                        height: 100%;
                        position: absolute;
                        inset: 0;
                        margin: auto;
                        z-index: 1;
                    }

                    .pic_operation {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 20px;
                        text-align: right;
                        visibility: hidden;
                        z-index: 2;

                        &:hover {
                            visibility: visible;
                        }

                        .el-button {
                            min-width: 35px !important;
                            height: 20px !important;
                            padding: 2px 4px !important;
                            font-size: 10px;
                        }
                    }

                    img:hover ~ .pic_operation {
                        visibility: visible;
                    }
                }
            }

            .similarity_container {
                width: 100%;
                padding: 0 44px;
                margin-top: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
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

    .base-intel-row {
        margin-top: 24px;
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
