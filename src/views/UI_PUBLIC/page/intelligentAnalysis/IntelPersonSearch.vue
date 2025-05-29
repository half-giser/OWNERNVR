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
                    <IntelBaseChannelSelector v-model="pageData.chlIdList" />
                    <!-- 属性选择 - 人属性 -->
                    <IntelBaseProfileSelector
                        v-show="pageData.searchType === 'byPersonAttribute'"
                        v-model="pageData.attributeForPersonAttribute"
                        :range="['person']"
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
                            v-show="item.show"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                </div>
                <div>
                    <!-- 排序 -->
                    <el-dropdown>
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_SORT') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <template
                                    v-for="opt in pageData.sortOptions"
                                    :key="opt.value"
                                >
                                    <el-dropdown-item
                                        v-if="pageData.searchType === 'byPersonAttribute' || (pageData.isByPic && opt.value !== 'chl') || (!pageData.isByPic && opt.value !== 'similarity')"
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
                                </template>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <!-- 全选 -->
                    <el-checkbox
                        v-model="pageData.isCheckedAll"
                        :label="Translate('IDCS_SELECT_ALL')"
                        @change="handleCheckedAll"
                    />
                </div>
            </div>
            <!-- 抓拍图容器 -->
            <div
                v-show="!pageData.isTrail"
                class="base-intel-center-center base-intel-pics-box"
            >
                <div class="base-intel-pics-content">
                    <IntelBaseSnapItem
                        v-for="(item, index) in getCurrTargetDatas()"
                        :key="index"
                        :target-data="item"
                        :detail-index="openDetailIndex"
                        :show-compare="showCompare"
                        :choose-pics="choosePics"
                        :search-type="pageData.searchType"
                        :grid="snapItemGrid"
                        :ratio="snapItemRatio"
                        @detail="showDetail(item)"
                        @checked="handleChecked"
                        @search="handleSearch"
                        @backup="handleBackupCurrentTarget"
                        @register="handleRegister"
                    />
                </div>
            </div>
            <!-- 分页器、备份/全部备份按钮容器 -->
            <div
                v-show="!pageData.isTrail"
                class="base-intel-center-bottom"
            >
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
            <!-- 人脸 - 轨迹容器 -->
            <IntelFaceSearchTrackMapPanel
                v-show="pageData.searchType === 'byFace' && pageData.isTrail"
                :data="trackChlId"
            />
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
    <IntelSearchBackupPop
        ref="backupPopRef"
        :auth="auth"
    />
    <!-- 人脸注册弹框 -->
    <IntelFaceDBSnapRegisterPop
        v-model="pageData.isRegisterPop"
        :pic="pageData.registerPic"
        @confirm="pageData.isRegisterPop = false"
        @close="pageData.isRegisterPop = false"
    />
</template>

<script lang="ts" src="./IntelPersonSearch.v.ts"></script>

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
