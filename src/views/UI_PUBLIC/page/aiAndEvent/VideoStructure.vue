<template>
    <div class="vsd">
        <div class="left">
            <div
                v-if="pageData.tab === 'image'"
                class="osd_show_list"
            >
                <p
                    v-for="(value, index) in pageData.osdShowList"
                    :key="index"
                >
                    {{ value }}
                </p>
            </div>
            <div
                v-if="mode === 'h5' || pageData.tab !== 'image'"
                class="player"
            >
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <div v-else>
                <div class="player">
                    <BaseVideoPlayer
                        ref="osdPlayerRef"
                        type="live"
                    />
                </div>
            </div>
            <div v-show="pageData.tab === 'param'">
                <div class="base-btn-box">
                    <el-checkbox
                        v-model="pageData.isShowAllArea"
                        :style="{ flex: '1' }"
                        @change="showAllArea"
                        >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                    >
                    <el-button
                        size="small"
                        @click="clearArea"
                        >{{ Translate('IDCS_CLEAR') }}</el-button
                    >
                    <el-button
                        size="small"
                        @click="clearAllArea"
                        >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                    >
                </div>
                <span class="draw_area_tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
            </div>
        </div>
        <div class="row_padding">
            <el-checkbox v-model="vsdData.enabledSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
        </div>
        <div :style="{ position: 'relative' }">
            <el-tabs
                v-model="pageData.tab"
                class="menu_tab"
                @tab-change="tabChange"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="param"
                >
                    <div class="param_right">
                        <el-form
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-position="left"
                            inline-message
                        >
                            <!-- 排程 -->
                            <div class="title">{{ Translate('IDCS_SCHEDULE') }}</div>
                            <!-- 排程配置 -->
                            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                                <el-select
                                    v-model="vsdData.schedule"
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                                <el-button
                                    size="small"
                                    class="form_btn"
                                    @click="pageData.scheduleManagPopOpen = true"
                                    >{{ Translate('IDCS_MANAGE') }}</el-button
                                >
                            </el-form-item>
                            <!-- 区域 -->
                            <div class="title">{{ Translate('IDCS_AREA') }}</div>
                            <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                <el-radio-group
                                    v-model="pageData.detectArea"
                                    class="area_radio_group"
                                    @change="detectAreaChange"
                                >
                                    <el-radio-button
                                        v-for="(value, name, index) in vsdData.detectAreaInfo"
                                        :key="index"
                                        :label="index + 1"
                                        :value="index"
                                        :class="{ configured_area: pageData.detectConfiguredArea[index] }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                <el-radio-group
                                    v-model="pageData.maskArea"
                                    class="area_radio_group"
                                    @change="maskAreaChange"
                                >
                                    <el-radio-button
                                        v-for="(value, name, index) in vsdData.maskAreaInfo"
                                        :key="index"
                                        :label="index + 1"
                                        :value="index"
                                        :class="{ configured_area: pageData.maskConfiguredArea[index] }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- OSD叠加 -->
                            <div class="title">{{ Translate('IDCS_OSD') }}</div>
                            <!-- 显示OSD -->
                            <el-form-item>
                                <el-checkbox
                                    v-model="vsdData.countOSD.switch"
                                    @change="setEnableOSD"
                                    >{{ Translate('IDCS_STATIST_OSD') }}</el-checkbox
                                >
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_HUMAN_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdPersonName"
                                    :disabled="!vsdData.countOSD.supportOsdPersonName"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_VEHICLE_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdCarName"
                                    :disabled="!vsdData.countOSD.supportOsdCarName"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_BIKE_COUNT')">
                                <el-input
                                    v-model="vsdData.countOSD.osdBikeName"
                                    :disabled="!vsdData.countOSD.supportBikeName"
                                    size="small"
                                ></el-input>
                            </el-form-item>
                            <!-- 重置信息 -->
                            <div class="title">{{ Translate('IDCS_RESET_INFO') }}</div>
                            <!-- 自动重置 -->
                            <el-form-item :label="Translate('IDCS_AUTO_RESET')">
                                <el-checkbox
                                    v-model="pageData.autoReset"
                                    @change="autoResetChange"
                                >
                                    {{ Translate('IDCS_ENABLE') }}
                                </el-checkbox>
                            </el-form-item>
                            <!-- 模式 -->
                            <el-form-item :label="Translate('IDCS_MODE')">
                                <el-select
                                    v-model="pageData.timeType"
                                    :disabled="!pageData.autoReset"
                                    size="small"
                                    @change="timeTypeChange"
                                >
                                    <el-option
                                        v-for="item in pageData.countCycleTypeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 时间 -->
                            <el-form-item
                                :label="Translate('IDCS_TIME')"
                                :style="{
                                    '--form-input-width': '105px',
                                }"
                            >
                                <el-row>
                                    <el-col
                                        :span="11"
                                        class="timeSet"
                                    >
                                        <el-select
                                            v-if="pageData.timeType === 'week'"
                                            v-model="vsdData.countPeriod['week'].date"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in pageData.weekOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                        <el-select
                                            v-if="pageData.timeType === 'month'"
                                            v-model="vsdData.countPeriod['month'].date"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in pageData.monthOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col
                                        :span="11"
                                        :style="{
                                            marginLeft: pageData.timeType === 'day' ? '-33px' : '0',
                                        }"
                                    >
                                        <el-time-picker
                                            v-if="pageData.timeType === 'day'"
                                            v-model="vsdData.countPeriod['day']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                        />
                                        <el-time-picker
                                            v-if="pageData.timeType === 'week'"
                                            v-model="vsdData.countPeriod['week']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                        />
                                        <el-time-picker
                                            v-if="pageData.timeType === 'month'"
                                            v-model="vsdData.countPeriod['month']['dateTime']"
                                            :disabled="!pageData.autoReset"
                                            size="small"
                                            value-format="HH:mm:ss"
                                        />
                                    </el-col>
                                </el-row>
                            </el-form-item>
                            <!-- 手动重置 -->
                            <el-form-item :label="Translate('IDCS_MANUAL_RESET')">
                                <el-button
                                    size="small"
                                    class="form_btn"
                                    @click="manualResetData"
                                >
                                    {{ Translate('IDCS_RESET') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 检测目标 -->
                <el-tab-pane
                    :label="Translate('IDCS_DETECTION_TARGET')"
                    name="detection"
                    class="param"
                >
                    <div class="param_right">
                        <el-form
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-width="auto"
                            label-position="left"
                            inline-message
                        >
                            <!-- 检测目标 -->
                            <div class="title">{{ Translate('IDCS_DETECTION_TARGET') }}</div>
                            <!-- 人灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <el-checkbox v-model="vsdData.objectFilter.person"></el-checkbox>
                                    <span>{{ Translate('IDCS_DETECTION_PERSON') }}</span>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.personSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.personSensitivity }}</span>
                                </template>
                            </el-form-item>
                            <!-- 汽车灵敏度 -->
                            <el-form-item>
                                <template #label>
                                    <el-checkbox v-model="vsdData.objectFilter.car"></el-checkbox>
                                    <span>{{ Translate('IDCS_DETECTION_VEHICLE') }}</span>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.carSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.carSensitivity }}</span>
                                </template>
                            </el-form-item>
                            <!-- 摩托车灵敏度 -->
                            <!-- 热成像通道不显示非机动车配置 -->
                            <el-form-item v-if="prop.chlData.accessType === '0'">
                                <template #label>
                                    <el-checkbox v-model="vsdData.objectFilter.motorcycle"></el-checkbox>
                                    <span>{{ Translate('IDCS_NON_VEHICLE') }}</span>
                                </template>
                                <template #default>
                                    <span>{{ Translate('IDCS_SENSITIVITY') }}</span>
                                    <el-slider
                                        v-model="vsdData.objectFilter.motorSensitivity"
                                        class="detection_slider"
                                        :min="1"
                                        :max="100"
                                    />
                                    <span class="detection_span">{{ vsdData.objectFilter.motorSensitivity }}</span>
                                </template>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 图片叠加 -->
                <el-tab-pane
                    :label="Translate('IDCS_IMAGE_OSD')"
                    name="image"
                    class="param"
                >
                    <div class="param_left"></div>
                    <div class="param_right">
                        <el-form
                            class="narrow"
                            :style="{
                                '--form-input-width': '215px',
                            }"
                            label-position="left"
                            inline-message
                        >
                            <!-- 图片叠加 -->
                            <div class="title">{{ Translate('IDCS_IMAGE_OSD') }}</div>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select
                                    v-model="vsdData.osdType"
                                    size="small"
                                    @change="osdTypeChange"
                                >
                                    <el-option
                                        v-for="item in pageData.imgOsdTypeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 全选 -->
                            <el-form-item>
                                <el-checkbox
                                    v-model="pageData.osdCheckAll"
                                    :style="{ width: '600px' }"
                                    @change="checkAllOsdType"
                                    >{{ Translate('IDCS_ALL') }}</el-checkbox
                                >
                                <el-checkbox-group
                                    v-model="osdCfgCheckedList"
                                    class="osd_checkbox_group"
                                    @change="osdCfgCheckListChange"
                                >
                                    <el-checkbox
                                        v-for="item in pageData.osdCfgList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    >
                                    </el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <!-- 高级设置 -->
            <div>
                <div
                    class="more_wrap"
                    @click="advancedVisible = !advancedVisible"
                >
                    <span>{{ Translate('IDCS_ADVANCED') }}</span>
                    <BaseImgSprite
                        class="moreBtn"
                        file="arrow"
                        :index="0"
                        :chunk="4"
                    />
                </div>
                <div
                    v-show="advancedVisible"
                    class="advanced_box"
                >
                    <div class="title">
                        {{ Translate('IDCS_VIDEO_SAVE_PIC') }}
                    </div>
                    <el-checkbox
                        v-model="pageData.isSaveSourcePicChecked"
                        :disabled="pageData.isSavePicDisabled"
                        @change="saveSourcePicChange"
                        >{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</el-checkbox
                    >
                    <el-checkbox
                        v-model="pageData.isSaveTargetPicChecked"
                        :disabled="pageData.isSavePicDisabled"
                        @change="saveTargetPicChange"
                        >{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</el-checkbox
                    >
                    <el-form
                        class="narrow"
                        :style="{
                            '--form-input-width': '200px',
                        }"
                        label-width="110px"
                        label-position="left"
                        inline-message
                    >
                        <!-- 识别模式 -->
                        <div class="title">{{ Translate('IDCS_RECOGNITION_MODE') }}</div>
                        <!-- 识别模式 -->
                        <el-form-item :label="Translate('IDCS_RECOGNITION_MODE')">
                            <el-select
                                v-model="vsdData.algoChkModel"
                                :disabled="pageData.algoModelDisabled"
                                @change="algoModelChange"
                            >
                                <el-option
                                    v-for="item in pageData.algoModelList"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <!-- 时间间隔（秒） -->
                        <el-form-item
                            v-show="pageData.algoHoldTimeShow"
                            :label="Translate('IDCS_INTERVAL_TIME')"
                        >
                            <el-input
                                v-model="vsdData.intervalCheck"
                                :disabled="pageData.algoModelDisabled"
                                type="number"
                                @blur="algoHoldTimeBlur"
                            ></el-input>
                        </el-form-item>
                    </el-form>

                    <div class="base-btn-box">
                        <el-button
                            size="small"
                            class="form_btn"
                            @click="advancedVisible = false"
                            >{{ Translate('IDCS_CLOSE') }}</el-button
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="page_bottom">
            <el-button
                :disabled="pageData.applyDisabled"
                class="form_btn"
                size="small"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="
                () => {
                    pageData.scheduleManagPopOpen = false
                }
            "
        />
    </div>
</template>

<script lang="ts" src="./VideoStructure.v.ts"></script>

<style lang="scss" scoped>
#n9web .el-form.narrow .el-form-item {
    padding: 1px 0px 2px 12px;
    margin-bottom: 0;
}
.form_btn {
    width: fit-content;
    height: 25px;
    font-size: 14px;
}
.vsd {
    height: calc(100vh - 360px);
    position: relative;
    .menu_tab {
        :deep(.el-tabs__header) {
            border-bottom: 1px solid var(--border-color2);
        }
        :deep(.el-tabs__item) {
            width: fit-content;
            font-size: 15px;
            border: none;
            padding: 0 20px !important;
        }
        /* 长分割线 */
        :deep(.el-tabs__nav-wrap::after) {
            position: static !important; //可以去掉长分割线
            // background-color: var(--border-color2);
        }

        /* 去掉下划线 */
        :deep(.el-tabs__active-bar) {
            background-color: transparent !important;
        }

        :deep(.el-tabs__item:first-child) {
            margin-left: 30px;
        }
        /* 鼠标选中时样式 */
        :deep(.el-tabs__item.is-active) {
            color: var(--primary--04);
            background-color: transparent;
            border: none;
        }
        /* 鼠标悬浮时样式 */
        :deep(.el-tabs__item:hover) {
            color: var(--primary--04);
            cursor: pointer;
            background-color: transparent;
        }
    }
    .row_padding {
        padding: 0 20px;
        :deep(.el-checkbox__label) {
            font-size: 15px;
            color: #000;
        }
    }
    // 高级设置
    .more_wrap {
        position: absolute;
        right: 20px;
        top: 10px;
        cursor: pointer;
    }
    .title {
        border-left: 3px solid var(--border-color2);
        font-size: 15px;
        height: 30px;
        line-height: 30px;
        padding-left: 8px;
    }
    .title:first-child {
        margin-bottom: 10px;
    }
    .title:not(:first-child) {
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .advanced_box {
        position: absolute;
        right: 17px;
        top: 39px;
        width: 350px;
        border: 1px solid black;
        padding: 20px;
        background-color: #e5e5e5;
        :deep(.el-checkbox) {
            width: 100px;
            margin-left: 10px;
            color: #000;
        }
    }

    .left {
        width: 400px;
        padding: 0 100px 0 20px;
        position: absolute;
        z-index: 1;
        top: 88px;
        .osd_show_list {
            width: 400px;
            height: 120px;
            background-color: #000;
            p {
                display: inline-block;
                width: 90px;
                height: 30px;
                border: 2px #fff dashed;
                color: #fff;
                line-height: 25px;
                text-align: center;
                box-sizing: border-box;
                margin: 5px;
                margin-bottom: 1px;
                padding: 1px;
                font-size: 12px;
                overflow: hidden;
            }
        }
        .player {
            width: 400px;
            height: 300px;
        }
        .draw_area_tip {
            font-size: 12px;
            color: #8d8d8d;
        }
    }
    // 参数设置
    .param {
        width: 100%;
        display: flex;

        &_right {
            margin-left: 520px;
            width: calc(100% - 520px);
            height: calc(100vh - 450px);
            overflow: auto;
            :deep(.el-form-item) {
                padding: 5px 15px;
                margin-bottom: 0;
                .el-form-item__label {
                    font-size: 15px;
                }
            }
            .timeSet .el-select {
                margin-right: 30px;
            }
            .area_radio_group {
                :deep(.el-radio-button) {
                    margin-right: 15px;
                    border-radius: 2px;
                    .el-radio-button__inner {
                        //修改按钮样式
                        width: 50px !important;
                        height: 22px;
                        line-height: 22px;
                        padding: 0;
                        border: 1px solid var(--border-color4) !important;
                    }
                }
                :deep(.el-radio-button.is-active) {
                    .el-radio-button__inner {
                        color: #fff;
                    }
                }
                .configured_area {
                    :deep(.el-radio-button__inner) {
                        border: 1px solid #00bbdb !important;
                        color: #00bbdb;
                    }
                }
            }
            .detection_slider {
                margin: 0 20px;
            }
            .detection_span {
                width: 30px;
                height: 20px;
                line-height: 20px;
                text-align: center;
                border: 1px solid var(--border-color4);
            }
        }
    }
    .osd_checkbox_group {
        width: 600px;
        margin-left: 0 !important;
        :deep(.el-checkbox) {
            width: 200px;
            margin: 15px 0 !important;
            overflow: hidden;
        }
    }
    .page_bottom {
        position: absolute;
        right: 20px;
        bottom: 0;
    }
}
</style>
