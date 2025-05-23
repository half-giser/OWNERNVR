<!--
 * @Date: 2025-05-20 20:11:39
 * @Description: 
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DETAIL')"
        width="950"
        @open="open"
        @opened="opened"
        @close="close"
    >
        <div class="dialog">
            <!-- 普通页面 -->
            <div
                v-show="(pageData.type === 'normal' && !pageData.showPlateCompare) || (!pageData.showFaceCompare && pageData.type === 'faceCompare')"
                class="target"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <img
                    class="target-pano"
                    :src="pageData.showThermal ? displayImg(current.thermal_scene_pic) : displayImg(current.optical_scene_pic || current.thermal_scene_pic || current.scene_pic)"
                />
                <img
                    v-show="pageData.showSnap"
                    ref="snapImg"
                    :src="displayImg(current.snap_pic)"
                    :class="isCoverTargetBoxTopRight ? 'target-snap-left' : 'target-snap-right'"
                    @load="loadImg"
                />

                <div class="target-wrap">
                    <div class="target-wrap-box">
                        <canvas
                            ref="canvas"
                            :width="pageData.canvasWidth"
                            :height="pageData.canvasHeight"
                        ></canvas>
                    </div>
                    <div class="target-wrap-text">
                        <div
                            v-show="pageData.isShowTargetBoxTitle"
                            v-title
                            :style="{
                                left: `${pageData.attributeTitleLeft}px`,
                                top: `${pageData.attributeTitleTop}px`,
                                width: `${pageData.attributeTitleWidth}px`,
                                height: `${pageData.attributeTitleHeight}px`,
                            }"
                            class="target-wrap-text-title"
                        >
                            {{ targetTypeTxt }}
                        </div>
                        <div
                            v-show="attributeData.length > 0"
                            :style="{
                                left: `${pageData.attributeRectLeft}px`,
                                top: `${pageData.attributeRectTop}px`,
                                maxHeight: `${pageData.canvasHeight}px`,
                            }"
                            class="target-wrap-text-attribute"
                        >
                            <div
                                v-for="(item, index) in attributeData"
                                :key="index"
                                v-title
                                class="target-wrap-text-attribute-item"
                            >
                                {{ item.value }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="target-search">
                    <BaseTargetSearchPanel
                        v-model:visible="pageData.showTargetSearch"
                        type="image"
                        :pic="getCurrentPano"
                    />
                </div>
            </div>
            <!-- 热成像可见光切换 -->
            <div
                v-show="isThermalDouble"
                class="tab"
            >
                <span
                    class="tab-item"
                    :class="{
                        selected: pageData.showThermal,
                    }"
                    @click="pageData.showThermal = true"
                ></span>
                <span
                    class="tab-item"
                    :class="{
                        selected: !pageData.showThermal,
                    }"
                    @click="pageData.showThermal = false"
                ></span>
            </div>
            <!-- 人脸识别成功 -->
            <div
                v-if="pageData.type === 'faceCompare' && pageData.showFaceCompare"
                class="compare"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <div class="compare-snap">
                    <img :src="displayImg(current.snap_pic)" />
                </div>
                <div class="compare-info">
                    <img
                        class="compare-info-repo"
                        :src="displayImg(current.repo_pic)"
                    />
                    <div class="compare-info-form">
                        <el-form label-width="80px">
                            <div class="top-line">
                                <el-form-item :label="`${Translate('IDCS_NAME_PERSON')} ：`">
                                    <div class="text-ellipsis">{{ current.info?.name }}</div>
                                </el-form-item>
                                <div class="titleIcon"></div>
                                <span class="similarity">{{ `${current.info?.similarity}%` }}</span>
                            </div>
                            <el-form-item :label="`${Translate('IDCS_SEX')} ：`">
                                <div class="text-ellipsis">{{ displayGender(current.info?.gender) }}</div>
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_NUMBER')} ：`">
                                {{ current.info?.serial_number }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_PHONE_NUMBER')} ：`">
                                {{ current.info?.mobile_phone_number }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_BIRTHDAY')} ：`">
                                {{ displayDate(current.info?.birth_date) }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_NATIVE_PLACE')} ：`">
                                {{ current.info?.hometown }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_ADD_FACE_GROUP')} ：`">
                                {{ current.info?.group_name }}
                            </el-form-item>
                            <div class="split-line"></div>
                            <el-form-item :label="`${Translate('IDCS_ID_TYPE')} ：`">
                                {{ Translate('IDCS_ID_CARD') }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_ID_NUMBER')} ：`">
                                {{ current.info?.certificate_number }}
                            </el-form-item>
                            <el-form-item :label="`${Translate('IDCS_REMARK')} ：`">
                                {{ current.info?.remarks }}
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
            <!-- 人脸识别成功切换 -->
            <div
                v-show="pageData.type === 'faceCompare'"
                class="tab"
            >
                <span
                    class="tab-item"
                    :class="{
                        selected: pageData.showFaceCompare,
                    }"
                    @click="pageData.showFaceCompare = true"
                ></span>

                <span
                    class="tab-item"
                    :class="{
                        selected: !pageData.showFaceCompare,
                    }"
                    @click="pageData.showFaceCompare = false"
                ></span>
            </div>
            <!-- 车牌识别 -->
            <div
                v-if="current.type === 'vehicle_plate' && pageData.showPlateCompare"
                class="plate-compare"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <div class="plate-compare-snap">
                    <img :src="displayImg(current.snap_pic)" />
                </div>

                <div class="plate-compare-info">
                    <el-form label-width="80px">
                        <div class="number">{{ current.info?.plate }}</div>
                        <el-form-item :label="`${Translate('IDCS_VEHICLE_OWNER')}：`">
                            {{ current.info?.owner }}
                        </el-form-item>
                        <el-form-item :label="`${Translate('IDCS_PHONE_NUMBER')}：`">
                            {{ current.info?.mobile_phone_number }}
                        </el-form-item>
                        <el-form-item :label="`${Translate('IDCS_PLATE_LIBRARY_GROUP')}：`">
                            {{ current.info?.group_name }}
                        </el-form-item>
                        <el-form-item :label="`${Translate('IDCS_PLATE_COLOR')}：`">
                            {{ displayPlateColor(current.info?.platecolor) }}
                        </el-form-item>
                        <div class="split-line"></div>
                        <el-form-item :label="`${Translate('IDCS_VEHICLE_COLOR')}：`">
                            {{ displayVehicleColor(current.info?.color) }}
                        </el-form-item>
                        <el-form-item :label="`${Translate('IDCS_VEHICLE_TYPE_ALL')}：`">
                            {{ displayVehicleType(current.info?.type) }}
                        </el-form-item>
                        <el-form-item :label="`${Translate('IDCS_VEHICLE_BRAND')}：`">
                            {{ displayBrand(current.info?.brand_type) }}
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <!-- 车牌识别切换 -->
            <div
                v-show="current.type === 'vehicle_plate' && isPlateCompare"
                class="tab"
            >
                <span
                    class="tab-item"
                    :class="{
                        selected: pageData.showPlateCompare,
                    }"
                    @click="pageData.showPlateCompare = true"
                ></span>
                <span
                    class="tab-item"
                    :class="{
                        selected: !pageData.showPlateCompare,
                    }"
                    @click="pageData.showPlateCompare = false"
                ></span>
            </div>
            <!-- 上一张/下一张 -->
            <div
                v-show="pageData.showSnap"
                class="btns"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <div
                    class="btn"
                    :disabled="pageData.index === 0"
                    :class="{
                        disabled: pageData.index === 0,
                    }"
                    @click="handlePrev"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </div>
                <div
                    id="next"
                    class="btn"
                    :disabled="pageData.index === listData.length - 1"
                    :class="{
                        disabled: pageData.index === listData.length - 1,
                    }"
                    @click="handleNext"
                >
                    {{ Translate('IDCS_NEXT') }}
                </div>
            </div>
            <!-- 空白占据一行，防止弹窗大小变化 -->
            <div
                v-show="pageData.type === 'normal' && !(current.type === 'vehicle_plate' && isPlateCompare) && !isThermalDouble"
                class="tab"
            ></div>
        </div>
        <div class="base-btn-box space-between dialog-bottom">
            <div class="dialog-bottom-left">
                <div class="event-type">{{ eventType }}</div>
                <div class="event-info">
                    <div class="frame-time">{{ displayTime(current.frame_time) }}</div>
                    <div class="chl-name">{{ current.chlName }}</div>
                </div>
            </div>
            <div class="dialog-bottom-right">
                <BaseImgSpriteBtn
                    v-if="systemCaps.supportREID"
                    file="target_retrieval"
                    :active="pageData.searchTargetStatus === 'on'"
                    :disabled="pageData.searchTargetStatus === 'disabled'"
                    :title="Translate('IDCS_REID')"
                    @click="searchTarget"
                />
                <BaseImgSpriteBtn
                    file="snap_search"
                    :title="Translate('IDCS_SEARCH')"
                    @click="search"
                />
                <BaseImgSpriteBtn
                    v-if="isRegisterBtn"
                    file="register"
                    :title="Translate('IDCS_REGISTER')"
                    @click="register"
                />
                <BaseImgSpriteBtn
                    file="export_btn"
                    :title="Translate('IDCS_EXPORT')"
                    @click="exportPic"
                />
                <BaseImgSpriteBtn
                    file="recPlay"
                    :title="Translate('IDCS_REPLAY')"
                    @click="playRec"
                />
                <BaseImgSpriteBtn
                    file="snap_exit"
                    :title="Translate('IDCS_EXIT')"
                    @click="close"
                />
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./LiveSnapPop.v.ts"></script>

<style lang="scss" scoped>
.dialog {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100%;

    .target {
        display: flex;
        position: relative;
        width: 900px;
        height: 500px;

        &-pano {
            width: 100%;
            height: 100%;
            z-index: 0;
            object-fit: fill;
        }

        &-snap-right {
            position: absolute;
            display: flex;
            align-items: flex-start;
            top: 0;
            right: 0;
            width: 30%;
            max-height: 100%;
            z-index: 1;
        }

        &-snap-left {
            position: absolute;
            display: flex;
            align-items: flex-start;
            top: 0;
            left: 0;
            width: 30%;
            max-height: 100%;
            z-index: 1;
        }

        &-wrap {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;

            &-box {
                position: absolute;
            }

            &-text {
                &-title {
                    position: absolute;
                    color: var(--btn-text-disabled);
                    background-color: var(--attribute--title-bg);
                    box-sizing: border-box;
                    padding: 0 4px;
                }

                &-attribute {
                    width: auto;
                    height: auto;
                    position: absolute;
                    box-sizing: border-box;

                    &-item {
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px 10px;
                        margin-bottom: 1px;
                        border-radius: 4px;
                        font-size: 12px;
                        box-sizing: border-box;
                        user-select: none;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        color: var(--main-text-active);
                        background-color: var(--attribute-item-bg);
                    }
                }
            }
        }

        &-search {
            position: absolute;
            top: 0;
            left: 0;
            width: 900px;
            height: 500px;
            z-index: 2;
        }
    }

    .compare {
        display: flex;
        width: 900px;
        height: 500px;
        background-color: var(--panel-menu-bg);

        &-snap {
            margin-top: 74px;
            margin-left: 40px;
            width: 242px;
            height: 323px;

            & > img {
                width: 100%;
                height: 100%;
                object-fit: fill;
            }
        }

        &-info {
            width: 544px;
            height: 323px;
            background-color: var(--slider-btn-border-disabled);
            margin-top: 74px;
            margin-left: 35px;
            display: flex;

            &-repo {
                width: 204px;
                height: 272px;
                margin: 25px 0 0 10px;
            }

            &-form {
                height: 304px;
                width: 283px;
                margin-top: 20px;

                .top-line {
                    display: flex;
                    align-items: center;

                    .titleIcon {
                        width: 7px;
                        height: 25px;
                        margin: 0;
                        font-size: 20px;
                        border-left: 2px solid var(--btn-bg-disabled);
                    }

                    .similarity {
                        color: var(--main-text);
                        font-size: 20px;
                        font-weight: normal;
                        margin-left: 10px;
                    }
                }
            }

            .split-line {
                height: 1px;
                width: 296px;
                margin: 5px 0 5px 15px;
                background-color: var(--btn-bg-disabled);
            }
        }
    }

    .plate-compare {
        display: flex;
        width: 900px;
        height: 500px;
        background-color: var(--panel-menu-bg);

        &-snap {
            width: 242px;
            height: 182px;
            margin-top: 144px;
            margin-left: 39px;

            & > img {
                width: 100%;
                height: 100%;
                object-fit: fill;
            }
        }

        &-info {
            width: 542px;
            height: 323px;
            background-color: var(--slider-btn-border-disabled);
            margin: 75px 0 0 35px;
            padding: 0 0 0 2px;

            .number {
                margin: 20px 0 15px 15px;
                font-size: 20px;
            }

            .split-line {
                height: 1px;
                width: 405px;
                margin: 5px 0 5px 15px;
                background-color: var(--btn-bg-disabled);
            }
        }
    }

    .tab {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;
        margin-top: 3px;

        &-item {
            width: 10px;
            height: 10px;
            flex-shrink: 0;
            border-radius: 10px;
            cursor: pointer;
            background-color: var(--btn-bg-disabled);
        }

        &-item:nth-child(2) {
            margin-left: 14px;
        }

        &-item.selected {
            background-color: var(--tab-active-bg);
        }
    }

    &-bottom {
        height: 55px;

        &-left {
            display: flex;
            align-items: start;
            justify-content: start;
            flex-direction: column;
            width: 100%;

            .event-type {
                font-size: 16px;
                color: var(--main-text);
                font-weight: bold;
                align-self: flex-start;
                margin: 4px 0;
            }

            .event-info {
                display: flex;
                justify-content: start;
                width: 100%;
                margin: 5px 0;

                .frame-time {
                    font-size: 14px;
                    color: var(--main-text);
                    font-weight: normal;
                    width: 180px;
                }

                .chl-name {
                    font-size: 14px;
                    color: var(--main-text);
                    font-weight: normal;
                    margin-left: 10px;
                }
            }
        }

        &-right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
        }
    }

    .btns {
        position: absolute;
        width: 136px;
        height: 48px;
        left: 0;
        top: 430px;
        z-index: 3;
        background-color: var(--color-white);

        .btn {
            background-color: var(--color-white);
            color: var(--tooltip-text);
            border: 0;
            position: absolute;
            width: 55px;
            height: 22px;
            padding: 13px 5px;
            cursor: pointer;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;

            &.disabled {
                cursor: default;
                color: var(--btn-bg-disabled);
            }

            &:hover:not(.disabled) {
                background-color: var(--preNext-btn-bg-active);
            }
        }

        #next {
            right: 0;
        }
    }

    ::v-deep(.compare-info-form .top-line .el-form-item__content),
    ::v-deep(.compare-info-form .top-line .el-form-item__label) {
        height: 26px;
        line-height: 26px;
        font-size: 20px;
    }

    ::v-deep(.plate-compare-info .el-form-item__content),
    ::v-deep(.plate-compare-info .el-form-item__label),
    ::v-deep(.compare-info-form .el-form-item__content),
    ::v-deep(.compare-info-form .el-form-item__label) {
        line-height: 24px;
        height: 24px;
    }

    ::v-deep(.compare-info-form .top-line .el-form-item) {
        min-height: 26px !important;
        height: 26px;
    }

    ::v-deep(.plate-compare-info .el-form-item),
    ::v-deep(.compare-info-form .el-form-item) {
        min-height: 24px !important;
        height: 24px;
    }

    ::v-deep(.compare-info-form .top-line .el-form-item__content),
    ::v-deep(.compare-info-form .el-form-item__content) {
        max-width: 160px;
    }
}
</style>
