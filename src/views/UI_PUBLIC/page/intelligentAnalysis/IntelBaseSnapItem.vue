<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-21 10:30:00
 * @Description: 智能分析-人、车
-->
<template>
    <div
        v-if="!showCompare"
        class="snap normal_snap"
    >
        <!-- 封面图区域 -->
        <div class="pic_show_container">
            <div
                v-if="targetData.isNoData"
                class="noData_pic"
            >
                <BaseImgSprite
                    file="noData"
                    :chunk="1"
                />
                <span class="tip_text">{{ Translate('IDCS_NO_RECORD_DATA') }}</span>
            </div>
            <div
                v-else-if="targetData.isDelete"
                class="deleted_pic"
            >
                <BaseImgSprite
                    file="hasDeleted"
                    :chunk="1"
                />
                <span class="tip_text">{{ Translate('IDCS_DELETED') }}</span>
            </div>
            <div
                v-else
                class="normal_pic"
                :class="{
                    checked: targetData.checked,
                    selected: targetData.index === detailIndex,
                }"
                @click="handleClickCover"
            >
                <div class="snap_pic">
                    <!-- 顶部操作区域（checkbox选择框） -->
                    <div class="top_operate">
                        <el-checkbox v-model="targetData.checked" />
                    </div>
                    <!-- 封面图 -->
                    <img
                        :src="targetData.objPicData.data"
                        class="center_operate"
                        @load="loadImg"
                    />
                    <!-- 底部操作区域（搜索、导出、注册） -->
                    <div class="bottom_operate">
                        <BaseImgSprite
                            v-if="showSearch"
                            file="snap_search"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleSearch"
                        />
                        <BaseImgSprite
                            v-if="showExport"
                            file="export_btn"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleExport"
                        />
                        <BaseImgSprite
                            v-if="showRegister"
                            file="register"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleRegister"
                        />
                    </div>
                </div>
            </div>
        </div>
        <!-- 描述信息区域 -->
        <div class="info_show_container">
            <div class="info_show_snap">
                <span class="frametime">{{ displayDateTime(targetData.timeStamp * 1000) }}</span>
                <span class="picChlName text-ellipsis">{{ targetData.channelName }}</span>
                <span
                    v-if="showPlateNumber"
                    class="plateNumber"
                >
                    {{ targetData.plateAttrInfo.plateNumber }}
                </span>
                <span
                    v-if="showSimilarity"
                    class="similarityValue"
                >
                    <span class="value">{{ `(${targetData.similarity} %)` }}</span>
                    <BaseImgSprite
                        file="Rectangle"
                        :chunk="1"
                    />
                </span>
            </div>
        </div>
    </div>
    <div
        v-else
        class="snap compare_snap"
    >
        <!-- 封面图区域 -->
        <div class="pic_show_container">
            <div
                v-if="targetData.isNoData"
                class="noData_pic"
            >
                <BaseImgSprite
                    file="noData"
                    :chunk="1"
                />
                <span class="tip_text">{{ Translate('IDCS_NO_RECORD_DATA') }}</span>
            </div>
            <div
                v-else-if="targetData.isDelete"
                class="deleted_pic"
            >
                <BaseImgSprite
                    file="hasDeleted"
                    :chunk="1"
                />
                <span class="tip_text">{{ Translate('IDCS_DELETED') }}</span>
            </div>
            <div
                v-else
                class="normal_pic"
                :class="{
                    checked: targetData.checked,
                    selected: targetData.index === detailIndex,
                }"
                @click="handleClickCover"
            >
                <div class="snap_pic">
                    <!-- 顶部操作区域（checkbox选择框） -->
                    <div class="top_operate">
                        <el-checkbox v-model="targetData.checked" />
                    </div>
                    <!-- 封面图 -->
                    <img
                        :src="targetData.objPicData.data"
                        class="center_operate"
                        @load="loadImg"
                    />
                    <!-- 底部操作区域（搜索、导出、注册） -->
                    <div class="bottom_operate">
                        <BaseImgSprite
                            v-if="showSearch"
                            file="snap_search"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleSearch"
                        />
                        <BaseImgSprite
                            v-if="showExport"
                            file="export_btn"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleExport"
                        />
                        <BaseImgSprite
                            v-if="showRegister"
                            file="register"
                            :chunk="4"
                            :hover-index="1"
                            class="operate_icon"
                            @click.stop="handleRegister"
                        />
                    </div>
                </div>
                <div class="compare_pic">
                    <!-- 封面图 -->
                    <img
                        :src="comparePicInfo?.pic"
                        class="center_operate"
                        @load="loadImg"
                    />
                </div>
            </div>
        </div>
        <!-- 描述信息区域 -->
        <div class="info_show_container">
            <div class="info_show_snap">
                <span class="frametime">{{ displayDateTime(targetData.timeStamp * 1000) }}</span>
                <span class="picChlName text-ellipsis">{{ targetData.channelName }}</span>
                <span
                    v-if="showSimilarity"
                    class="similarityValue"
                >
                    <span class="value">{{ `(${targetData.similarity} %)` }}</span>
                    <BaseImgSprite
                        file="Rectangle"
                        :chunk="1"
                    />
                </span>
            </div>
            <div class="info_show_compare">
                <span class="comparePicName">{{ comparePicInfo?.name || comparePicInfo?.note || Translate('IDCS_SAMPLE') }}</span>
            </div>
        </div>
    </div>
    <!-- 人脸注册弹框 -->
    <IntelFaceDBSnapRegisterPop
        v-model="pageData.isRegisterFacePop"
        :pic="targetData.objPicData.data"
        @confirm="pageData.isRegisterFacePop = false"
        @close="pageData.isRegisterFacePop = false"
    />
    <!-- 车牌注册弹框 -->
    <IntelLicencePlateDBAddPlatePop
        v-model="pageData.isRegisterPlatePop"
        type="register"
        :data="{
            plateNumber: targetData.plateAttrInfo.plateNumber,
        }"
        @confirm="pageData.isRegisterPlatePop = false"
        @close="pageData.isRegisterPlatePop = false"
    />
</template>

<script lang="ts" src="./IntelBaseSnapItem.v.ts"></script>

<style lang="scss" scoped>
* {
    box-sizing: border-box !important;
}

.snap {
    width: calc((100% - 35px) / 6);
    margin: 5px 0 30px 5px;
    user-select: none;

    .pic_show_container {
        width: 100%;
        position: relative;
        border: 1px solid var(--content-border);
        padding-top: calc(100% * 4 / 3);

        .normal_pic,
        .noData_pic,
        .deleted_pic {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            margin: auto;
        }

        .normal_pic {
            .snap_pic {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                margin: auto;
                border: 1px solid var(--content-border);

                .center_operate {
                    width: 100%;
                    height: 100%;
                }

                .top_operate,
                .bottom_operate {
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: 4;
                    margin: auto;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    visibility: hidden;
                }

                .top_operate {
                    top: 0;
                    padding: 2px 5px;
                }

                .bottom_operate {
                    bottom: 0;

                    .operate_icon {
                        transform: scale(0.7);
                        margin-right: -4px;
                    }
                }
            }

            &.checked {
                .top_operate {
                    visibility: visible;
                }
            }

            &.selected {
                border: 1px solid var(--primary);
            }

            &:hover {
                .top_operate,
                .bottom_operate {
                    visibility: visible;
                }
            }
        }

        .noData_pic,
        .deleted_pic {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .tip_text {
                font-size: 14px;
                color: var(--main-text-light);
            }
        }

        .deleted_pic {
            .Sprite {
                transform: scale(0.5);
            }

            .tip_text {
                position: relative;
                top: -15px;
            }
        }
    }

    .info_show_container {
        width: 100%;
        min-height: 50px;
        font-size: 14px;

        .info_show_snap {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            position: relative;

            > span {
                margin-top: 4px;
            }

            .similarityValue {
                width: 110px;
                height: 24px;
                position: absolute;
                top: -25px;
                left: 0;
                right: 0;
                margin: auto;
                margin-top: 0;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;

                .value {
                    z-index: 1;
                    font-size: 15px;
                    color: var(--color-white);
                }

                .Sprite {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    right: 0;
                    margin: auto;
                    z-index: 0;
                }
            }
        }
    }
}

.compare_snap {
    width: calc((100% - 80px) / 3);

    .pic_show_container {
        padding-top: calc(100% * 2 / 3);

        .normal_pic {
            .snap_pic {
                width: 50%;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: unset;
                margin: auto;
            }

            .compare_pic {
                width: 50%;
                position: absolute;
                top: 0;
                left: unset;
                bottom: 0;
                right: 0;
                margin: auto;
                border: 1px solid var(--content-border);

                .center_operate {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .info_show_container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .info_show_snap,
        .info_show_compare {
            width: 50%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;

            > span {
                margin-top: 4px;
            }
        }

        .info_show_snap {
            position: relative;

            .similarityValue {
                left: calc(100% - 55px);
            }
        }
    }
}
</style>
