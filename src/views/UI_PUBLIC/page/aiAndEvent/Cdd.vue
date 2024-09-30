<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:14
 * @Description: 人群密度检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-27 13:59:18
-->
<template>
    <div class="tripwire_setting_pane">
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="pageData.scheduleManagePopOpen = false"
        >
        </ScheduleManagPop>
        <!-- record弹窗 -->
        <BaseTransferDialog
            v-model="pageData.recordIsShow"
            :header-title="pageData.recordHeaderTitle"
            :source-title="pageData.recordSourceTitle"
            :target-title="pageData.recordTargetTitle"
            :source-data="pageData.recordSource"
            :linked-list="pageData.recordList || []"
            :type="pageData.recordType"
            @confirm="recordConfirm"
            @close="recordClose"
        ></BaseTransferDialog>
        <!-- alarmOut弹窗 -->
        <BaseTransferDialog
            v-model="pageData.alarmOutIsShow"
            :header-title="pageData.alarmOutHeaderTitle"
            :source-title="pageData.alarmOutSourceTitle"
            :target-title="pageData.alarmOutTargetTitle"
            :source-data="pageData.alarmOutSource"
            :linked-list="pageData.alarmOutList || []"
            :type="pageData.alarmOutType"
            @confirm="alarmOutConfirm"
            @close="alarmOutClose"
        ></BaseTransferDialog>
        <div
            v-if="pageData.notSupportTipShow"
            class="notSupportBox"
        >
            {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
        </div>
        <div
            v-if="pageData.requireDataFail"
            class="notSupportBox"
        >
            {{ Translate('IDCS_QUERY_DATA_FAIL') }}
        </div>
        <div v-if="!pageData.notSupportTipShow && !pageData.requireDataFail">
            <!-- 检测开启及ai按钮 -->
            <el-row class="row-padding">
                <el-checkbox
                    v-model="pageData.detectionEnable"
                    @change="pageData.applyDisable = false"
                ></el-checkbox>
                <span class="checkbox_text">{{ Translate('IDCS_ENABLE') }}</span>
            </el-row>
            <!-- 只存在一个播放器，因此放于tab区域外 -->
            <div
                v-show="pageData.fuction === 'param'"
                class="left"
            >
                <div class="player">
                    <BaseVideoPlayer
                        id="player"
                        ref="playerRef"
                        type="live"
                        @onready="handlePlayerReady"
                    />
                </div>
                <div
                    v-if="pageData.fuction === 'param'"
                    class="player_config"
                >
                    <el-row
                        :style="{
                            marginTop: '10px',
                        }"
                    >
                        <el-col :span="16">
                            <div
                                v-if="pageData.showDrawAvailable"
                                class="showAllArea"
                            >
                                <el-checkbox
                                    v-model="pageData.isDrawAvailable"
                                    @change="handleDrawAvailableChange"
                                ></el-checkbox>
                                <span class="checkbox_text">{{ Translate('IDCS_DRAW_WARN_SURFACE') }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="clear_btns">
                                <el-button
                                    size="small"
                                    @click="clearArea"
                                    >{{ Translate('IDCS_CLEAR') }}</el-button
                                >
                            </div>
                        </el-col>
                    </el-row>
                    <span id="draw_tip">{{ Translate('IDCS_DRAW_RECT_TIP') }}</span>
                </div>
            </div>
            <!-- 两种功能 -->
            <el-tabs
                v-model="pageData.fuction"
                class="function-tabs"
                @tab-click="handleFunctionTabClick"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="tripwire_param"
                >
                    <div class="right">
                        <el-form
                            :model="pageData"
                            label-width="200px"
                            label-position="left"
                            class="form"
                        >
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCS_SCHEDULE') }}</span>
                            </div>
                            <!-- 排程 -->
                            <el-form-item
                                :label="Translate('IDCS_SCHEDULE_CONFIG')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.schedule"
                                    value-key="value"
                                    :options="pageData.scheduleList"
                                    size="small"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                                <el-button
                                    class="form_btn"
                                    size="small"
                                    @click="pageData.scheduleManagePopOpen = true"
                                >
                                    {{ Translate('IDCS_MANAGE') }}
                                </el-button>
                            </el-form-item>
                            <div class="form_span">
                                <el-divider direction="vertical"></el-divider>
                                <span>{{ Translate('IDCD_RULE') }}</span>
                            </div>
                            <!-- 持续时间 -->
                            <el-form-item
                                :label="Translate('IDCS_DURATION')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.holdTime"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.holdTimeList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.holdTimeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 刷新频率 -->
                            <el-form-item
                                :label="Translate('IDCS_REFRESH_FREQUENCY')"
                                :style="{
                                    '--form-input-width': '215px',
                                }"
                            >
                                <el-select
                                    v-model="pageData.refreshFrequency"
                                    value-key="value"
                                    size="small"
                                    :options="pageData.refreshFrequencyList"
                                    @change="pageData.applyDisable = false"
                                >
                                    <el-option
                                        v-for="item in pageData.refreshFrequencyList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 报警阈值 -->
                            <el-form-item
                                :label="Translate('IDCS_ALARM_THRESHOLD')"
                                :style="{
                                    '--form-input-width': '275px',
                                }"
                            >
                                <el-slider
                                    v-model="pageData.triggerAlarmLevel"
                                    size="small"
                                    :show-input-controls="false"
                                    show-input
                                    :style="{
                                        marginLeft: '10px',
                                    }"
                                    @change="pageData.applyDisable = false"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="apply_area">
                        <el-button
                            class="apply_btn"
                            :disabled="pageData.applyDisable"
                            @click="handleApply"
                        >
                            {{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="trigger"
                    class="tripwire_trigger"
                >
                    <div class="trigger_box">
                        <!-- 音频 -->
                        <div
                            v-if="pageData.supportAlarmAudioConfig"
                            class="audio_row"
                        >
                            <span>{{ Translate('IDCS_VOICE_PROMPT') }}</span>
                            <el-select
                                v-model="pageData.sysAudio"
                                value-key="value"
                                size="small"
                                class="audio_select"
                                :options="pageData.voiceList"
                                @change="pageData.applyDisable = false"
                            >
                                <el-option
                                    v-for="item in pageData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </div>
                        <div class="trigger_content">
                            <!-- 常规联动 -->
                            <div class="trigger_normal">
                                <div class="title">
                                    <div class="checkbox">
                                        <el-checkbox
                                            v-model="pageData.triggerSwitch"
                                            class="table_title"
                                            @change="handleTriggerSwitch"
                                        ></el-checkbox>
                                        <span class="span_text">{{ Translate('IDCS_TRIGGER_NOMAL') }}</span>
                                    </div>
                                </div>
                                <el-table
                                    height="367px"
                                    :data="triggerData"
                                    :show-header="false"
                                    :header-cell-style="{ 'text-align': 'left' }"
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <el-checkbox
                                                v-model="scope.row.value"
                                                class="table_item"
                                                @change="handleTrigger(scope.row)"
                                                >{{ Translate(scope.row.label) }}
                                            </el-checkbox>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- record -->
                            <div class="trigger_rec">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_RECORD') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="pageData.recordIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367px"
                                    :data="pageData.record.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- alarm -->
                            <div class="trigger_alarm">
                                <div class="title">
                                    <el-row>
                                        <span class="table_cell_span">{{ Translate('IDCS_ALARM_OUT') }}</span>
                                        <el-button
                                            class="form_btn"
                                            size="small"
                                            @click="pageData.alarmOutIsShow = true"
                                            >{{ Translate('IDCS_CONFIG') }}
                                        </el-button>
                                    </el-row>
                                </div>
                                <el-table
                                    :show-header="false"
                                    height="367px"
                                    :data="pageData.alarmOut.chls"
                                    empty-text=" "
                                >
                                    <el-table-column>
                                        <template #default="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- preset -->
                            <div class="trigger_preset">
                                <div class="title">
                                    <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                                </div>
                                <el-table
                                    border
                                    stripe
                                    height="367px"
                                    :data="pageData.presetSource"
                                >
                                    <el-table-column
                                        prop="name"
                                        :label="Translate('IDCS_CHANNEL_NAME')"
                                    ></el-table-column>
                                    <el-table-column :label="Translate('IDCS_PRESET_NAME')">
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.preset.value"
                                                size="small"
                                                :empty-values="[undefined, null]"
                                                :options="scope.row.presetList"
                                                @change="pageData.applyDisable = false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.presetList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                            <div class="apply_area">
                                <el-button
                                    class="apply_btn"
                                    :disabled="pageData.applyDisable"
                                    @click="handleApply"
                                >
                                    {{ Translate('IDCS_APPLY') }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./Cdd.v.ts"></script>

<style lang="scss" scoped>
.el-divider--vertical {
    border-right-width: 3px;
    height: 30px;
    color: #999;
    width: 3px;
    margin: 0;
    border-left: 3px solid #999;
    padding-left: 5px;
}
#draw_tip {
    color: #8d8d8d;
    font-size: 12px;
}
.row-padding {
    padding-left: 20px;
}
.el-form {
    --el-form-label-font-size: 15px;
    .el-checkbox {
        color: black;
        --el-checkbox-font-size: 15px;
    }
}
#n9web .el-form .el-form-item {
    padding: 1px 0px 2px 12px;
    margin-bottom: 0;
}
.form > .form_span:first-child {
    padding-bottom: 10px;
    font-size: 15px;
    display: flex;
    align-items: center;
}
.form > .form_span:not(:first-child) {
    padding: 10px 0;
    font-size: 15px;
    display: flex;
    align-items: center;
}
.el-form-item > .el-select {
    width: 300px;
}
.form_btn {
    width: fit-content;
    height: 25px;
    font-size: 14px;
}
.apply_btn {
    width: content;
    height: 25px;
}
#n9web .el-form .el-checkbox + * {
    margin-left: 5px;
}
.el-form-item {
    --font-size: 15px;
}
#n9web .el-form .el-slider {
    margin-left: 15px;
}
.clear_btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.showAllArea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.player_config {
    margin-top: 5px;
}
.table_cell_span {
    margin-right: 5px;
    font-size: 15px;
}
.notSupportBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    //background-color: #fff;
    height: 567px;
    z-index: 3;
    font-size: 20px;
}
.tripwire_setting_pane {
    position: relative;
    :deep() {
        .el-form .el-input-number.is-without-controls .el-input__wrapper {
            padding-left: 9px;
            padding-right: 9px;
        }
    }
    .checkbox_text {
        margin-left: 5px;
        width: fit-content;
        font-size: 15px;
    }
    .aiResource {
        margin-left: 1253px;
    }
    .more {
        position: absolute;
        top: 41px;
        right: 12px;
        z-index: 1;
    }
    .left {
        width: 400px;
        height: 450px;
        position: absolute;
        z-index: 1;
        padding-left: 20px;
        top: 82px;
        .player {
            margin-top: 5px;
            width: 400px;
            height: 300px;
        }
    }
    .function-tabs {
        :deep(.el-tabs__header) {
            border-bottom: 1px solid var(--border-color2);
        }
        :deep(.el-tabs__item) {
            padding: 0 20px;
            width: fit-content;
            font-size: 15px;
            border: none;
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
        .tripwire_param {
            display: flex;
            flex-direction: row;
            min-height: 481px;
            .right {
                // height: 480px;
                margin-left: 500px;
                padding-left: 20px;
                width: calc(100% - 500px);
            }
            .apply_area {
                display: flex;
                justify-content: center;
                align-items: flex-end;
            }
        }
        .tripwire_trigger {
            display: flex;
            flex-direction: column;
            height: 481px;
            //background-color: #fff;
            :deep() {
                .el-table td.el-table__cell {
                    border-bottom: 0;
                }
            }
            .trigger_box {
                z-index: 3;
                height: 481px;
                //background-color: #fff;
            }
            .audio_row {
                display: flex;
                align-items: center;
                width: 280px;
                margin-left: 10px;
                margin-bottom: 5px;
                .audio_select {
                    width: 200px;
                    margin-left: 20px;
                }
            }
            .trigger_content {
                display: flex;
                flex-direction: row;
                padding-left: 20px;
                height: 481px;
                .title {
                    height: 33px;
                    background-color: #d0d0d0;
                    color: black;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .trigger_normal {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    .title {
                        justify-content: flex-start;
                        .checkbox {
                            margin-left: 9px;
                        }
                    }
                    .span_text {
                        margin-left: 8px;
                    }
                    :deep() {
                        .el-table .cell {
                            padding: 0px 9px;
                        }
                        .el-checkbox__label {
                            font-size: 15px;
                            color: black;
                        }
                    }
                    .table_item {
                        display: flex;
                        justify-content: flex-start;
                    }
                }
                .trigger_rec {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .trigger_alarm {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .trigger_snap {
                    width: 250px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .trigger_preset {
                    width: 350px;
                    height: 400px;
                    border: 1px solid #888888;
                    margin-left: 2px;
                }
                .apply_area {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    margin-left: 318px;
                    padding-left: 30px;
                }
            }
        }
        :deep(.el-slider) {
            width: 515px;
        }
    }
}
</style>
