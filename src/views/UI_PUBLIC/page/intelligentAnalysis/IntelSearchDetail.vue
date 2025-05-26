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
        <div class="pageCenter">
            <div
                class="picVideoWrap"
                @mouseenter="showSnap(true)"
                @mouseleave="showSnap(false)"
            >
                <!--抓拍图+原图模块 -->
                <div
                    v-show="pageData.detailType === 'snap'"
                    class="target"
                >
                    <!-- 原图 -->
                    <img
                        class="target-pano"
                        :src="pageData.panoramaImg"
                    />
                    <!-- 抓拍图 -->
                    <img
                        v-show="pageData.isShowSnap"
                        ref="snapImg"
                        :src="pageData.snapImg"
                        :class="isCoverTargetBoxTopRight ? 'target-snap-left' : 'target-snap-right'"
                        @load="loadImg"
                    />
                    <div class="target-wrap">
                        <div
                            id="target-wrap-box"
                            class="target-wrap-box"
                        >
                            <canvas
                                ref="canvasRef"
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
                                {{ pageData.targetTypeTxt }}
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
                </div>
                <!--叠加在图片上的上一个、下一个按钮 -->
                <div
                    v-show="pageData.isShowPrevNextBtn"
                    class="btns"
                    @mouseenter="handleMouseMove(true)"
                    @mouseleave="handleMouseMove(false)"
                >
                    <div
                        class="btn"
                        :disabled="pageData.detailIndex === 0"
                        :class="{
                            disabled: pageData.detailIndex === 0,
                        }"
                        @click="handlePrev"
                    >
                        {{ Translate('IDCS_PREVIOUS') }}
                    </div>
                    <div
                        id="next"
                        class="btn"
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
            <div
                v-show="pageData.detailType === 'record'"
                class="control-bar"
            >
                <span class="start-time">{{ displayTime(pageData.startTimeStamp) }}</span>
                <el-slider
                    v-model="pageData.progress"
                    :show-tooltip="false"
                    :min="pageData.startTimeStamp"
                    :max="pageData.endTimeStamp"
                    :disabled="pageData.iconDisabled"
                    @mousedown="handleSliderMouseDown"
                    @mouseup="handleSliderMouseUp"
                    @change="handleSliderChange"
                />
                <span class="end-time">{{ displayTime(pageData.endTimeStamp) }}</span>
            </div>

            <div class="btn-bar">
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
                        <div class="speedBtnTitle">
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
                        </div>
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
                            :title="Translate('IDCS_PLAY_DEC_10_SECONDS')"
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
                            v-show="pageData.detailType === 'record' && !pageData.enableAudio"
                            class="btn"
                            file="soundClose"
                            :disabled="pageData.iconDisabled"
                            @click="handleVoice"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_AUDIO')">
                        <BaseImgSpriteBtn
                            v-show="pageData.detailType === 'record' && pageData.enableAudio"
                            class="btn"
                            file="soundOpen"
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
                            v-show="pageData.detailType === 'snap'"
                            class="btn"
                            file="export_btn"
                            :disabled="pageData.iconDisabled"
                            @click="handleExportPic"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_EXPORT')">
                        <BaseImgSpriteBtn
                            v-show="pageData.detailType === 'record'"
                            class="btn"
                            file="export_btn"
                            :disabled="pageData.iconDisabled"
                            @click="handleExportVideo"
                        />
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_FULLSCREEN')">
                        <BaseImgSpriteBtn
                            class="btn"
                            file="full_screen"
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
                            <a>&nbsp;|&nbsp;</a>
                            <el-text class="">{{ `${currDetailData.similarity}%` }}</el-text>
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
                <el-scrollbar
                    v-if="pageData.targetMenuType === 'targetEvent'"
                    vertical
                    height="175"
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
                </el-scrollbar>
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
    height: 100%;
    padding: 15px;

    .pageHead {
        height: 28px;
        position: relative;
    }

    .pageCenter {
        position: relative;
        width: 98%;
        height: 520px;
        margin-top: 2px;

        .picVideoWrap {
            width: 100%;
            height: calc(100% - 90px);
            position: relative;

            .target {
                float: left;
                position: relative;
                width: 100%;
                height: 100%;

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
                        width: 100%;
                        height: 100%;
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
            }

            .videoPlayer {
                width: 100%;
                height: 100%;
                border: 2px solid var(--subheading-bg);
            }

            .btns {
                position: absolute;
                width: 136px;
                height: 48px;
                left: 0;
                bottom: 20px;
                z-index: 11;
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
        }

        .control-bar {
            align-items: center;
            display: flex;
            height: 22px;
            margin-top: 10px;
            width: 100%;

            .start-time,
            .end-time {
                flex-shrink: 0;
                font-size: 14px;
                line-height: 1;
                padding: 5px 0;
                text-align: left;
                width: 90px;
            }

            .end-time {
                text-align: right;
            }
        }

        .btn-bar {
            position: absolute;
            width: 100%;
            height: 48px;
            left: 5px;
            bottom: 5px;
            user-select: none;

            .left-wrap {
                position: absolute;
                left: 0;
                bottom: 0;
                width: 50%;
                height: 100%;
                line-height: 58px;
                text-align: left;
                z-index: 6;
                display: flex;
                justify-content: flex-start;
                align-items: center;

                .el-select {
                    width: 75px;
                    display: inline-block;
                    height: 20px;
                    line-height: 20px;
                    margin-left: 4px;
                    vertical-align: middle;
                }

                .speedWrap {
                    position: relative;
                    display: inline-block;
                    width: 34px;
                    height: 34px;
                    vertical-align: middle;
                    cursor: pointer;
                    margin-right: 4px;

                    .speedBtnTitle .Sprite {
                        position: absolute;
                        top: 0;
                        left: 0;
                    }

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
                position: absolute;
                right: 3px;
                bottom: 0;
                width: 50%;
                height: 100%;
                line-height: 58px;
                z-index: 9;
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
        height: calc(100% - 569px);

        .picVideoMode {
            height: 100%;

            .el-divider--horizontal {
                /* stylelint-disable-next-line length-zero-no-unit */
                margin: 0px;
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
                height: calc(100% - 50px);
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
