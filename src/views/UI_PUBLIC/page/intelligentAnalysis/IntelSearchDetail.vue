/* stylelint-disable length-zero-no-unit */
<!--
 * @Description:智能分析-详情
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-20 10:20:17
-->
<template>
    <div class="intelDetail">
        <div class="pageHead">
            <el-radio-group
                v-model="pageData.detailType"
                :style="{
                    '--form-radio-button-width': '160px',
                }"
                @change="changeDetailMenu"
            >
                <el-radio-button
                    v-for="item in pageData.detailTypeOptions"
                    v-show="item.isVisible"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-radio-group>
        </div>
        <div
            id="intelDetail-center"
            class="pageCenter"
        >
            <div
                class="picVideoWrap"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <!--抓拍图+原图模块 -->
                <div
                    v-show="pageData.detailType === 'snap'"
                    class="pic"
                >
                    <!-- 原图 -->
                    <img
                        class="pic-pano"
                        :src="pageData.panoramaImg"
                    />
                    <!-- 抓拍图 -->
                    <img
                        v-show="pageData.isShowSnap"
                        ref="snapImg"
                        :src="pageData.snapImg"
                        :class="isCoverTargetBoxTopRight ? 'pic-snap-left' : 'pic-snap-right'"
                        @load="loadImg"
                    />
                    <div class="pic-wrap">
                        <div
                            id="pic-wrap-box"
                            class="pic-wrap-box"
                        >
                            <canvas
                                ref="canvasRef"
                                :width="pageData.canvasWidth"
                                :height="pageData.canvasHeight"
                            ></canvas>
                        </div>
                        <div class="pic-wrap-text">
                            <div
                                v-show="pageData.isShowTargetBoxTitle"
                                v-title
                                :style="{
                                    left: `${pageData.attributeTitleLeft}px`,
                                    top: `${pageData.attributeTitleTop}px`,
                                    width: `${pageData.attributeTitleWidth}px`,
                                    height: `${pageData.attributeTitleHeight}px`,
                                }"
                                class="pic-wrap-text-title"
                            >
                                {{ pageData.targetTypeTxt }}
                            </div>
                            <div
                                v-show="attributeData.length > 0"
                                :style="{
                                    left: `${pageData.attributeRectLeft}px`,
                                    top: `${pageData.attributeRectTop}px`,
                                    maxHeight: `${pageData.canvasHeight}px`,
                                }"
                                class="pic-wrap-text-attribute"
                            >
                                <div
                                    v-for="(item, index) in attributeData"
                                    :key="index"
                                    v-title
                                    class="pic-wrap-text-attribute-item"
                                >
                                    {{ item.value }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--视频播放器模块 -->
                <div class="videoPlayer">
                    <BaseVideoPlayer
                        v-show="pageData.detailType === 'record'"
                        ref="playerRef"
                        type="record"
                        :enable-pos="systemCaps.supportPOS"
                        :enable-detect="true"
                        @ready="handlePlayerReady"
                        @message="notify"
                        @time="handleTime"
                        @play-status="handlePlayerStatus"
                        @ontime="handlePlayerOntime"
                        @success="handlePlayerSuccess"
                        @play-complete="handlePlayComplete"
                        @error="handlePlayerError"
                    />
                    <BaseTargetSearchPanel
                        v-model:visible="pageData.isDetectTarget"
                        type="image"
                        :mode="mode"
                        :pic="pageData.detectTargetImg"
                        :route-type="searchTargetRouteType"
                        @search="handleGoToSearchTargetPage"
                    />
                </div>
                <!--叠加在图片上的上一个、下一个按钮 -->
                <div
                    v-show="pageData.isShowPrevNextBtn"
                    class="base-intel-target-btns"
                    @mouseenter="handleMouseMove(true)"
                    @mouseleave="handleMouseMove(false)"
                >
                    <div
                        class="base-intel-target-btn"
                        :disabled="pageData.detailIndex === 0"
                        :class="{
                            disabled: pageData.detailIndex === 0,
                        }"
                        @click="handlePrev"
                    >
                        {{ Translate('IDCS_PREVIOUS') }}
                    </div>
                    <div
                        class="base-intel-target-btn"
                        :disabled="pageData.detailIndex === detailData.length - 1"
                        :class="{
                            disabled: pageData.detailIndex === detailData.length - 1,
                        }"
                        @click="handleNext"
                    >
                        {{ Translate('IDCS_NEXT') }}
                    </div>
                </div>
            </div>
            <BasePlayerControl
                v-show="pageData.detailType === 'record'"
                v-model="pageData.progress"
                :start-time="pageData.startTimeStamp"
                :end-time="pageData.endTimeStamp"
                :highlight="[currDetailData.startTime, currDetailData.endTime]"
                :disabled="pageData.iconDisabled"
                :marks="marks"
                enable-highlight
                @mousedown="handleSliderMouseDown"
                @mouseup="handleSliderMouseUp"
                @change="handleSliderChange"
            />
            <div class="btn-bar">
                <div
                    v-show="pageData.detailType === 'snap'"
                    class="left-wrap"
                ></div>
                <!-- 视频底部左侧按钮模块 -->
                <div
                    v-show="pageData.detailType === 'record'"
                    class="left-wrap"
                >
                    <el-tooltip :content="Translate('IDCS_PAUSE')">
                        <BaseImgSpriteBtn
                            v-show="pageData.playStatus === 'play'"
                            class="btn"
                            file="pauseRec"
                            @click="pause"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_PLAY')">
                        <BaseImgSpriteBtn
                            v-show="pageData.playStatus !== 'play'"
                            class="btn"
                            file="playRec"
                            :disabled="pageData.iconDisabled"
                            @click="resume"
                        />
                    </el-tooltip>
                    <el-select-v2
                        v-model="pageData.recPlayTime"
                        class="btn"
                        :options="pageData.recPlayTimeList"
                        :disabled="pageData.iconDisabled"
                        @change="changeRecPlayTime"
                    />
                    <el-tooltip :content="Translate('IDCS_PLAY_NEXT_FRAME')">
                        <BaseImgSpriteBtn
                            v-show="isTrail"
                            class="btn"
                            file="next_frame"
                            :disabled="pageData.playStatus !== 'pause'"
                            @click="nextFrame"
                        />
                    </el-tooltip>
                    <div
                        class="speedWrap"
                        @mouseenter="hoverRecSpeed(true)"
                        @mouseleave="hoverRecSpeed(false)"
                    >
                        <el-tooltip
                            :content="pageData.speedBtnTitle"
                            placement="right"
                        >
                            <BaseImgSpriteBtn
                                class="btn"
                                :file="pageData.speedBtn"
                                :disabled="pageData.iconDisabled"
                            />
                        </el-tooltip>
                        <div
                            v-show="pageData.isHoverSpeed"
                            class="speedBtnList"
                        >
                            <BaseImgSpriteBtn
                                class="btn"
                                file="X1"
                                @click="changeRecSpeed(1)"
                            />
                            <BaseImgSpriteBtn
                                class="btn"
                                file="X2"
                                @click="changeRecSpeed(2)"
                            />
                            <BaseImgSpriteBtn
                                class="btn"
                                file="X4"
                                @click="changeRecSpeed(4)"
                            />
                        </div>
                    </div>
                    <el-tooltip :content="Translate('IDCS_PLAY_DEC_10_SECONDS')">
                        <BaseImgSpriteBtn
                            class="btn"
                            file="fw10s"
                            :disabled="pageData.iconDisabled"
                            @click="handleJump(-10)"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_PLAY_INC_10_SECONDS')">
                        <BaseImgSpriteBtn
                            class="btn"
                            file="bk10s"
                            :disabled="pageData.iconDisabled"
                            @click="handleJump(10)"
                        />
                    </el-tooltip>
                </div>
                <!-- 右侧按钮模块 -->
                <div class="right-wrap">
                    <el-tooltip :content="Translate('IDCS_REID')">
                        <BaseImgSpriteBtn
                            v-show="systemCaps.supportREID"
                            class="btn"
                            file="target_retrieval"
                            :active="pageData.enableREID"
                            :disabled="pageData.iconDisabled"
                            @click="handleSearchTarget"
                        />
                    </el-tooltip>
                    <el-tooltip :content="pageData.enableAI ? Translate('IDCS_INTELLIGENT_INFO_OFF') : Translate('IDCS_INTELLIGENT_INFO_ON')">
                        <BaseImgSpriteBtn
                            v-show="pageData.detailType === 'record'"
                            class="btn"
                            file="showAImsg"
                            :active="pageData.enableAI"
                            :disabled="pageData.iconDisabled"
                            @click="handleShowAIMsg"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_AUDIO')">
                        <BaseImgSpriteBtn
                            v-show="pageData.detailType === 'record'"
                            class="btn"
                            :file="pageData.enableAudio ? 'soundOpen' : 'soundClose'"
                            :disabled="pageData.iconDisabled"
                            @click="handleVoice"
                        />
                    </el-tooltip>
                    <el-tooltip :content="pageData.enablePos ? Translate('IDCS_CANCEL_POS') : Translate('IDCS_VIEW_POS')">
                        <BaseImgSpriteBtn
                            v-show="pageData.detailType === 'record' && systemCaps.supportPOS"
                            class="btn"
                            file="POS_rec"
                            :active="pageData.enablePos"
                            :disabled="pageData.iconDisabled"
                            @click="handlePos"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_EXPORT')">
                        <BaseImgSpriteBtn
                            class="btn"
                            file="export_btn"
                            :disabled="pageData.iconDisabled"
                            @click="handleExport"
                        />
                    </el-tooltip>
                    <el-tooltip :content="pageData.isFullScreen ? Translate('IDCS_EXIT_FULLSCREEN') : Translate('IDCS_FULLSCREEN')">
                        <BaseImgSpriteBtn
                            class="btn"
                            :file="pageData.isFullScreen ? 'exit_full_screen' : 'full_screen'"
                            :disabled="pageData.iconDisabled"
                            @click="handleFullScreen"
                        />
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="pageFooter">
            <div
                v-if="!isTrail"
                class="picVideoMode"
            >
                <el-radio-group
                    v-model="pageData.targetMenuType"
                    size="large"
                    class="inline hide-border-top hide-border-inline tab_container"
                >
                    <el-radio-button
                        v-for="item in pageData.targetMenuTypeOptions"
                        v-show="item.isVisible"
                        :key="item.value"
                        class="targetMenu"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-radio-group>
                <!-- 个人信息 -->
                <div
                    v-if="pageData.targetMenuType === 'personInfo'"
                    class="personInfoWrap"
                >
                    <el-form
                        v-title
                        :style="{
                            '--form-input-width': '100%',
                        }"
                    >
                        <el-form-item
                            :label="Translate('IDCS_NAME_PERSON')"
                            class="font-weight-bold"
                        >
                            <el-text>{{ personInfoData.name }}</el-text>
                            <span>&nbsp;|&nbsp;</span>
                            <el-text>{{ currDetailData.similarity }}%</el-text>
                        </el-form-item>
                        <el-divider />
                        <el-form-item :label="Translate('IDCS_SEX')">
                            <el-text>{{ personInfoData.sex }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_NUMBER')">
                            <el-text>{{ personInfoData.number }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                            <el-text>{{ personInfoData.mobile }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                            <el-text>{{ personInfoData.birthday }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_NATIVE_PLACE')">
                            <el-text>{{ personInfoData.nativePlace }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                            <el-text>{{ personInfoData.groupName || '--' }}</el-text>
                        </el-form-item>
                        <el-divider />
                        <el-form-item :label="Translate('IDCS_ID_TYPE')">
                            <el-text>{{ personInfoData.certificateType }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                            <el-text>{{ personInfoData.certificateNum }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_REMARK')">
                            <el-text>{{ personInfoData.note }}</el-text>
                        </el-form-item>
                    </el-form>
                </div>
                <!-- 目标事件 -->
                <div
                    v-if="pageData.targetMenuType === 'targetEvent'"
                    class="targetInfoWrap"
                >
                    <div
                        v-for="(item, index) in pageData.targetEventDataNoSort"
                        :key="index"
                        class="targetList"
                        @click="handleClickTarget(item)"
                    >
                        <div class="targetPicTitle">
                            <span class="eventType">{{ EVENT_TYPE_MAPPING[item.eventType] }}</span>
                        </div>
                        <div class="targetPicInfo">
                            <span
                                class="chlName"
                                :title="item.channelName"
                                >{{ item.channelName }}</span
                            >
                            <span
                                class="frametime"
                                :title="displayTime(item.timeStamp)"
                                >{{ displayDateTime(item.timeStamp) }}</span
                            >
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="isTrail"
                class="trailMode"
            >
                <div>{{ displayDateTime(currDetailData.timeStamp) }}</div>
                <div>{{ currDetailData.channelName }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelSearchDetail.v.ts"></script>

<style lang="scss" scoped>
.intelDetail {
    width: 100%;
    height: calc(var(--content-height) - 10px);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .pageHead {
        height: 28px;
        position: relative;
        flex-shrink: 0;
    }

    .pageCenter {
        position: relative;
        width: 98%;
        height: 520px;
        margin-top: 2px;
        flex-shrink: 0;
        background-color: var(--main-bg);

        .picVideoWrap {
            width: 100%;
            height: calc(100% - 90px);
            position: relative;

            .pic {
                float: left;
                position: relative;
                width: 100%;
                height: 100%;

                &-pano {
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    object-fit: fill;

                    &[src=''] {
                        opacity: 0;
                    }
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
                        width: 100%;
                        height: 100%;
                    }

                    &-text {
                        &-title {
                            position: absolute;
                            color: var(--btn-text-disabled);
                            background-color: var(--target-title-bg);
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
                                background-color: var(--target-attr-bg);
                            }
                        }
                    }
                }
            }

            .videoPlayer {
                width: 100%;
                height: 100%;
                border: 2px solid var(--subheading-bg);
                box-sizing: border-box;
            }
        }

        .btn-bar {
            width: 100%;
            height: 48px;
            user-select: none;
            display: flex;
            justify-content: space-between;

            .left-wrap {
                width: 50%;
                height: 100%;
                text-align: left;
                display: flex;
                justify-content: flex-start;
                align-items: center;

                .el-select {
                    width: 90px;
                    height: 20px;
                    line-height: 20px;
                    margin-left: 4px;
                }

                .speedWrap {
                    position: relative;
                    width: 34px;
                    height: 34px;
                    cursor: pointer;
                    margin-right: 4px;

                    .speedBtnList {
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        position: absolute;
                        top: 34px;
                    }
                }

                > .btn {
                    margin-right: 4px;
                }
            }

            .right-wrap {
                user-select: none;
                width: 50%;
                height: 100%;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                > .Sprite.btn {
                    margin-left: 4px;
                }
            }
        }
    }

    .pageFooter {
        width: 100%;
        height: calc(100% - 560px);

        .picVideoMode {
            width: 100%;
            height: 100%;

            .el-divider--horizontal {
                margin: 0;
            }

            .el-radio-group.tab_container {
                flex-shrink: 0;
                width: 100%;
                height: 30px;
                border-bottom: 2px solid var(--parklog-box-bg);

                .targetMenu {
                    width: auto !important;
                }

                .el-radio-button {
                    :deep(.el-radio-button__inner) {
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-left: none;
                        border-right: none;
                        box-shadow: none;
                        border: none;
                        font-weight: bold;

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

            .personInfoWrap {
                width: 100%;
                height: calc(100% - 15px);
                overflow-y: auto;

                .font-weight-bold {
                    font-weight: bold;

                    a,
                    .el-text {
                        padding: 0;
                        font-size: 18px;
                        line-height: 25px;
                    }
                }

                :deep(.el-form-item:first-child .el-form-item__label) {
                    font-size: 18px;
                    line-height: 25px;
                }

                .el-divider--horizontal {
                    border-width: 2px;
                }
            }

            .targetInfoWrap {
                width: 100%;
                height: calc(100% - 15px);
                overflow-y: auto;
            }

            .targetList {
                list-style: none;
                position: relative;
                width: 100%;
                float: left;
                border-bottom: 2px solid #ddd;
                padding-top: 4px;

                .targetPicTitle,
                .targetPicInfo {
                    margin: 10px;
                    height: 20px;
                    position: relative;

                    span {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                    }

                    .eventType {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 8px 0;
                    }

                    .chlName {
                        left: 0;
                        max-width: 444px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .frametime {
                        right: 0;
                    }
                }
            }
        }

        .trailMode {
            height: 100%;
            text-align: center;
        }
    }
}
</style>
