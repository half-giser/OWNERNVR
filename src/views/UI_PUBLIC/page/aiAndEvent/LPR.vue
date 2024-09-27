<!--
 * @Description: AI 事件——车牌识别
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-09 09:56:14
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-26 15:26:09
-->
<template>
    <!-- 通道名称及选择器 -->
    <el-form
        class="stripe narrow"
        :style="{
            '--form-input-width': '430px',
            '--el-form-label-font-size': '15px',
        }"
        label-position="left"
        inline-message
    >
        <el-form-item
            :label="Translate('IDCS_CHANNEL_NAME')"
            label-width="108px"
        >
            <el-select
                v-model="pageData.curChl"
                class="chl_select"
                popper-class="eloption"
                @change="chlChange"
            >
                <el-option
                    v-for="item in pageData.vehicleChlList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    class="chl_item"
                >
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <el-tabs
        v-model="pageData.vehicleTab"
        class="vehicle_tab"
        @tab-change="vehicleTabChange"
    >
        <!-- 侦测 -->
        <el-tab-pane
            :label="Translate('IDCS_DETECTION')"
            name="vehicleDetection"
            :disabled="pageData.vehicleDetectionDisabled"
            :style="{ height: 'calc(100vh - 344px)' }"
        >
            <div>
                <div class="row_padding">
                    <el-checkbox v-model="vehicleDetectionData.enabledSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
                </div>
                <div :style="{ position: 'relative' }">
                    <el-tabs
                        v-model="detectionPageData.detectionTab"
                        class="menu_tab"
                    >
                        <!-- 参数设置 -->
                        <el-tab-pane
                            :label="Translate('IDCS_PARAM_SETTING')"
                            name="param"
                            class="param"
                        >
                            <div class="param_left">
                                <div class="player">
                                    <BaseVideoPlayer
                                        ref="playerRef"
                                        type="live"
                                        @onready="handlePlayerReady"
                                    />
                                </div>
                                <div>
                                    <div class="base-btn-box">
                                        <el-checkbox
                                            v-model="detectionPageData.isShowAllArea"
                                            :style="{ flex: '1' }"
                                            @change="showAllArea"
                                            >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                                        >
                                        <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                        <el-button @click="clearAllArea">{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button>
                                    </div>
                                    <span class="draw_area_tip">{{ detectionPageData.drawAreaTip }}</span>
                                </div>
                            </div>
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
                                        <el-select v-model="vehicleDetectionData.schedule">
                                            <el-option
                                                v-for="item in pageData.scheduleList"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            >
                                            </el-option>
                                        </el-select>
                                        <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
                                    </el-form-item>
                                    <!-- 区域 -->
                                    <div class="title">{{ Translate('IDCS_AREA') }}</div>
                                    <el-form-item :label="Translate('IDCS_DETECTION_AREA')">
                                        <el-radio-group
                                            v-model="detectionPageData.regionArea"
                                            class="area_radio_group"
                                            @change="regionAreaChange"
                                        >
                                            <el-radio-button
                                                v-for="(item, index) in vehicleDetectionData.regionInfo"
                                                :key="index"
                                                :label="index + 1"
                                                :value="index"
                                                :class="{ configured_area: detectionPageData.reginConfiguredArea[index] }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_MASK_AREA')">
                                        <el-radio-group
                                            v-model="detectionPageData.maskArea"
                                            class="area_radio_group"
                                            @change="maskAreaChange"
                                        >
                                            <el-radio-button
                                                v-for="(value, name, index) in vehicleDetectionData.maskAreaInfo"
                                                :key="index"
                                                :label="index + 1"
                                                :value="index"
                                                :class="{ configured_area: detectionPageData.maskConfiguredArea[index] }"
                                            />
                                        </el-radio-group>
                                    </el-form-item>
                                    <!-- 规则 -->
                                    <div class="title">{{ Translate('IDCD_RULE') }}</div>
                                    <el-form-item :label="Translate('IDCS_PLATE_DETECTION_AREA')">
                                        <el-select
                                            v-model="detectionPageData.continentValue"
                                            :disabled="detectionPageData.continentDisabled"
                                            :style="{ width: '130px' }"
                                            @change="refreshArea"
                                        >
                                            <el-option
                                                v-for="item in detectionPageData.continentOption"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            >
                                            </el-option>
                                        </el-select>
                                        <el-select
                                            v-model="vehicleDetectionData.plateSupportArea"
                                            :disabled="detectionPageData.plateAreaDisabled"
                                            :style="{ width: '130px' }"
                                        >
                                            <el-option
                                                v-for="item in detectionPageData.plateAreaOption"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            >
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_LICENSE_PLATE_EXPOSURE')">
                                        <el-checkbox v-model="vehicleDetectionData.exposureChecked"></el-checkbox>
                                        <el-slider
                                            v-model="vehicleDetectionData.exposureValue"
                                            :show-tooltip="false"
                                            :min="detectionPageData.exposureMin"
                                            :max="detectionPageData.exposureMax"
                                            :disabled="!vehicleDetectionData.exposureChecked"
                                        />
                                        <span class="exposure_span">{{ vehicleDetectionData.exposureValue }}</span>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="vehicleDetectionData.plateAbsenceCheceked"
                                            :disabled="detectionPageData.plateAbsenceDisabled"
                                            >{{ Translate('IDCS_SNAP_NO_PLATE_VIHICLE') }}</el-checkbox
                                        >
                                    </el-form-item>
                                    <!-- 车牌大小(范围) -->
                                    <div class="title">{{ detectionPageData.plateSizeRangeTitle }}</div>
                                    <el-form-item :label="Translate('IDCS_MIN')">
                                        <el-input
                                            v-model="vehicleDetectionData.plateSize.minWidth"
                                            :min="vehicleDetectionData.plateSize.min"
                                            :max="vehicleDetectionData.plateSize.max"
                                            type="number"
                                            @blur="minVehicleBlur"
                                        ></el-input
                                        >%
                                    </el-form-item>
                                    <el-form-item :label="Translate('IDCS_MAX')">
                                        <el-input
                                            v-model="vehicleDetectionData.plateSize.maxWidth"
                                            :min="vehicleDetectionData.plateSize.min"
                                            :max="vehicleDetectionData.plateSize.max"
                                            type="number"
                                            @blur="maxVehicleBlur"
                                        ></el-input
                                        >%
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="detectionPageData.isDispalyRangeChecked"
                                            @change="showDisplayRange"
                                            >{{ Translate('IDCS_DISPLAY_RANGE_BOX') }}</el-checkbox
                                        >
                                    </el-form-item>
                                </el-form>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 高级设置 -->
                    <div v-show="detectionPageData.isShowDirection">
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
                            <el-form
                                class="stripe narrow"
                                :style="{
                                    '--form-input-width': '170px',
                                }"
                                label-width="80px"
                                label-position="left"
                                inline-message
                            >
                                <el-form-item
                                    :label="Translate('IDCS_RECOGNITION_MODE')"
                                    :style="{ padding: '20px 0' }"
                                >
                                    <el-select v-model="vehicleDetectionData.direction">
                                        <el-option
                                            v-for="item in detectionPageData.directionOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <div class="base-btn-box">
                                <el-button
                                    small
                                    @click="advancedVisible = false"
                                    >{{ Translate('IDCS_CLOSE') }}</el-button
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="page_bottom">
                    <el-button
                        :disabled="detectionPageData.applyDisabled"
                        @click="applyVehicleDetectionData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 识别 -->
        <el-tab-pane
            :label="Translate('IDCS_RECOGNITION')"
            name="vehicleCompare"
            :disabled="pageData.vehicleCompareDisabled"
            :style="{ height: 'calc(100vh - 344px)' }"
        >
            <div>
                <div class="row_padding">
                    <span :style="{ marginRight: '30px' }">{{ Translate('IDCS_ENABLE') }}</span>
                    <el-checkbox>{{ Translate('IDCS_SUCCESSFUL_RECOGNITION') }}</el-checkbox>
                    <el-checkbox>{{ Translate('IDCS_STRANGE_PLATE') }}</el-checkbox>
                </div>
                <div :style="{ position: 'relative' }">
                    <el-tabs
                        v-model="comparePageData.compareTab"
                        class="menu_tab"
                        @tab-change="compareTabChange"
                    >
                        <el-tab-pane
                            v-for="item in taskTabs"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        >
                            <template #default>
                                <SuccessfulRecognition
                                    :curr-task-data="compareLinkData(item.value)"
                                    :group-data="vehicleGroupData"
                                    :schedule-list="pageData.scheduleList"
                                    :voice-list="pageData.voiceList"
                                    :record-list="pageData.recordList"
                                    :alarm-out-list="pageData.alarmOutList"
                                    :snap-list="pageData.snapList"
                                ></SuccessfulRecognition>
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                    <!-- 增加/删除任务 -->
                    <div class="taskBtn">
                        <span @click="addTask">+</span>
                        <span
                            :class="{ removeDisabled: comparePageData.removeDisabled }"
                            @click="removeTask"
                            >-</span
                        >
                    </div>
                </div>
                <div class="page_bottom">
                    <el-button
                        :disabled="comparePageData.applyDisabled"
                        @click="applyVehicleCompareData"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </div>
            </div>
        </el-tab-pane>
        <!-- 车牌库跳转 -->
        <el-tab-pane
            name="vehicleLibrary"
            :disabled="!supportPlateMatch"
        >
            <template #label>
                <span :title="Translate('IDCS_VEHICLE_DATABASE')">{{ Translate('IDCS_VEHICLE_DATABASE') }}</span>
                <BaseImgSprite
                    class="link-icon"
                    file="jumpto"
                />
            </template>
        </el-tab-pane>
    </el-tabs>
    <div
        v-if="pageData.notChlSupport"
        :style="{ width: '100%', height: 'calc(100vh - 340px)', position: 'relative' }"
    >
        <div class="notChlSupportTip">{{ pageData.notSupportTip }}</div>
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
</template>

<script lang="ts" src="./LPR.v.ts"></script>

<style>
/* 选择器的下拉框样式必须全局才能生效 */
.eloption .el-select-dropdown {
    max-width: 430px;
    height: 150px;
}
</style>

<style lang="scss" scoped>
.chl_select {
    :deep(.el-select__selection) {
        text-align: center;
    }
}
.chl_item {
    float: left;
    width: 120px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--border-color2);
}
.narrow {
    padding: 5px 0 5px 5px;
    font-size: 15px;
}
// 人脸识别下的tab，侦测/识别/人脸库跳转
.vehicle_tab {
    :deep(.el-tabs__item) {
        width: 170px;
        border: 2px solid var(--border-color2);
        margin-right: -2px; // 处理border重合
        padding: 0;
        span {
            display: block !important;
            line-height: 36px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    /* 长分割线 */
    :deep(.el-tabs__nav-wrap::after) {
        // position: static !important; 可以去掉长分割线
        background-color: var(--border-color2);
    }

    /* 去掉下划线 */
    :deep(.el-tabs__active-bar) {
        background-color: transparent !important;
    }
    :deep(.el-tabs__item.is-active) {
        color: var(--text-active);
        background-color: var(--primary--04);
    }
    :deep(.el-tabs__item:hover) {
        color: var(--text-active);
        background-color: var(--primary--04);
    }
    :deep(.el-tabs__item.is-disabled) {
        background: #aeabab;
        color: #797979;
    }
    :deep(.el-form-item) {
        padding: 5px 15px;
        margin-bottom: 0;
        .el-form-item__label {
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
// 侦测和识别下的菜单tab
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
        padding-left: 5px;
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
    padding-left: 10px;
}
.advanced_box {
    position: absolute;
    right: 17px;
    top: 39px;
    width: 280px;
    height: 120px;
    border: 1px solid #ccc;
    padding: 10px;
    background-color: #e5e5e5;
    :deep(.el-checkbox) {
        width: 200px;
        margin-left: 10px;
        color: #000;
    }
}
// 参数设置
.param {
    width: 100%;
    display: flex;

    &_left {
        width: 400px;
        height: 100%;
        padding: 0 100px 0 20px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        margin-right: 5px;
        overflow: hidden;
        .player {
            width: 400px;
            height: 300px;
        }
        .draw_area_tip {
            font-size: 12px;
            color: #8d8d8d;
        }
    }
    &_right {
        width: 100%;

        :deep(.el-table) {
            width: 100%;

            tbody {
                cursor: pointer;
            }
        }
        :deep(.el-checkbox__label) {
            color: #000;
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
        .exposure_span {
            width: 30px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            border: 1px solid var(--border-color4);
        }
    }
}
.page_bottom {
    position: absolute;
    right: 10px;
    bottom: 0px;
}
.notChlSupportTip {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    font-size: 20px;
}
.taskBtn {
    position: absolute;
    right: 20px;
    top: 3px;
    span {
        font-size: 30px;
        padding: 0 5px;
        cursor: pointer;
    }
    .removeDisabled {
        color: #797979;
    }
}
.dropdownBox {
    width: 300px;
    height: 100px;
    padding: 10px;
}
.btnBox {
    margin-top: 10px;
}
</style>
