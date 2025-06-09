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
                @change="changeSearchType"
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
                        <div class="add_pic">
                            <div
                                v-for="(item, index) in pageData.picCacheListForFace"
                                :key="item.pic"
                                class="add_pic_item"
                            >
                                <img
                                    v-if="item.pic"
                                    :src="item.pic"
                                />
                                <div class="add_pic_btns">
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
                        <el-form
                            v-show="pageData.picCacheListForFace.length > 0"
                            class="no-padding"
                        >
                            <el-form-item :label="Translate('IDCS_SIMILARITY')">
                                <BaseSliderInput
                                    v-model="pageData.similarityForFace"
                                    :min="1"
                                    :max="100"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                    <!-- 图片选择、相似度 - 人体 -->
                    <div v-show="pageData.searchType === 'byBody' && showPicChooser">
                        <!-- 图片 -->
                        <div class="add_pic">
                            <div
                                v-for="(item, index) in pageData.picCacheListForBody"
                                :key="item.pic"
                                class="add_pic_item"
                            >
                                <img
                                    v-if="item.pic"
                                    :src="item.pic"
                                />
                                <div class="add_pic_btns">
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
                        <el-form
                            v-show="pageData.picCacheListForBody.length > 0"
                            class="no-padding"
                        >
                            <el-form-item :label="Translate('IDCS_SIMILARITY')">
                                <BaseSliderInput
                                    v-model="pageData.similarityForBody"
                                    :min="1"
                                    :max="100"
                                />
                            </el-form-item>
                        </el-form>
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
                            v-show="item.show"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-radio-group>
                </div>
                <div>
                    <!-- 排序 -->
                    <BaseDropdown>
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
                                        class="base-intel-sort-item"
                                        @click="handleSort(opt.value)"
                                    >
                                        <span class="base-intel-sort-item-label">{{ opt.label }} </span>
                                        <BaseImgSprite
                                            :file="opt.status === 'up' ? 'sortAsc' : 'sortDes'"
                                            :chunk="4"
                                            :index="pageData.sortType === opt.value ? 1 : 3"
                                            :scale="0.7"
                                        />
                                    </el-dropdown-item>
                                </template>
                            </el-dropdown-menu>
                        </template>
                    </BaseDropdown>
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
            <!-- 分页器 -->
            <div
                v-show="!pageData.isTrail"
                class="base-btn-box"
            >
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
            <div
                v-show="!pageData.isTrail"
                class="base-btn-box"
            >
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
            <!-- 人脸 - 轨迹容器 -->
            <IntelFaceSearchTrackMapPanel
                v-show="pageData.searchType === 'byFace' && pageData.isTrail"
                :data="trackChlId"
            />
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
        <!-- 详情容器 -->
        <div
            v-show="pageData.isDetailOpen"
            class="base-intel-right"
        >
            <IntelSearchDetailPanel
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
.base-intel-box {
    height: calc(var(--content-height) + 22px);
}

.add_pic {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    &_item {
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
    }

    &_btns {
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

    img:hover ~ .add_pic_btns {
        visibility: visible;
    }
}

.base-intel-center {
    max-width: calc(100% - 429px);

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

    .base-intel-center-center {
        width: 100%;
        height: 100%;
        overflow: auto;
    }
}
</style>
