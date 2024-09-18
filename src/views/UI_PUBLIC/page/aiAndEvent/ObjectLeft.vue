<template>
    <div class="obj_left_detection">
        <div class="row_padding">
            <el-checkbox v-model="objectLeftData.enabledSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
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
                                    v-show="pageData.isShowAllAreaCheckBox"
                                    v-model="pageData.isShowAllArea"
                                    :style="{ flex: '1' }"
                                    @change="showAllArea"
                                    >{{ Translate('IDCS_DISPLAY_ALL_AREA') }}</el-checkbox
                                >
                                <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                <el-button
                                    v-show="pageData.isShowAllClearBtn"
                                    @click="clearAllArea"
                                    >{{ Translate('IDCS_FACE_CLEAR_ALL') }}</el-button
                                >
                            </div>
                            <span class="draw_area_tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</span>
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
                                <el-select v-model="objectLeftData.schedule">
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
                            <!-- 规则 -->
                            <div class="title">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select v-model="objectLeftData.holdTime">
                                    <el-option
                                        v-for="item in objectLeftData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        :empty-values="[undefined, null]"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 类型 -->
                            <el-form-item :label="Translate('IDCS_TYPE')">
                                <el-select v-model="objectLeftData.oscType">
                                    <el-option
                                        v-for="item in objectLeftData.oscTypeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 警戒区域 -->
                            <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                <el-radio-group
                                    v-model="pageData.warnArea"
                                    class="area_radio_group"
                                    @change="warnAreaChange"
                                >
                                    <el-radio-button
                                        v-for="index in objectLeftData.areaMaxCount"
                                        :key="index - 1"
                                        :label="index"
                                        :value="index - 1"
                                        :class="{ configured_area: pageData.configuredArea[index - 1] }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <!-- 区域名称 -->
                            <el-form-item :label="Translate('IDCS_AREA_NAME')">
                                <el-input
                                    v-model="pageData.areaName"
                                    @input="areaNameInput"
                                    @keyup.enter="enterBlur($event)"
                                ></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <!-- 联动方式 -->
                <el-tab-pane
                    :label="Translate('IDCS_LINKAGE_MODE')"
                    name="linkage"
                >
                    <el-form
                        class="narrow"
                        :style="{
                            '--form-input-width': '215px',
                        }"
                        label-position="left"
                    >
                        <el-form-item
                            v-show="supportAlarmAudioConfig"
                            :label="Translate('IDCS_VOICE_PROMPT')"
                        >
                            <el-select v-model="objectLeftData.sysAudio">
                                <el-option
                                    v-for="item in pageData.voiceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <!-- 常规联动 -->
                    <div
                        class="linkage_box"
                        :style="{ marginLeft: '15px' }"
                    >
                        <el-checkbox
                            v-model="normalParamCheckAll"
                            class="normal_param_title"
                            @change="handleNormalParamCheckAll"
                            >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
                        >
                        <el-checkbox-group
                            v-model="normalParamCheckList"
                            @change="handleNormalParamCheck"
                        >
                            <el-checkbox
                                v-for="item in normalParamList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <!-- 录像 -->
                    <div class="linkage_box">
                        <div class="linkage_title">
                            <span>{{ `${Translate('IDCS_RECORD')} ` }}</span>
                            <el-button
                                size="small"
                                @click="pageData.recordIsShow = true"
                                >{{ Translate('IDCS_CONFIG') }}</el-button
                            >
                        </div>
                        <el-table
                            :data="objectLeftData.record"
                            :show-header="false"
                        >
                            <el-table-column prop="label" />
                        </el-table>
                    </div>
                    <!-- 报警输出 -->
                    <div class="linkage_box">
                        <div class="linkage_title">
                            <span>{{ `${Translate('IDCS_ALARM_OUT')} ` }}</span>
                            <el-button
                                size="small"
                                @click="pageData.alarmOutIsShow = true"
                                >{{ Translate('IDCS_CONFIG') }}</el-button
                            >
                        </div>
                        <el-table
                            :data="objectLeftData.alarmOut"
                            :show-header="false"
                        >
                            <el-table-column prop="label" />
                        </el-table>
                    </div>
                    <!-- 联动预置点 -->
                    <div
                        class="linkage_box"
                        :style="{ width: '350px' }"
                    >
                        <div
                            class="linkage_title"
                            :style="{ width: '330px' }"
                        >
                            <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
                        </div>
                        <el-table
                            stripe
                            border
                            :data="PresetTableData"
                        >
                            <el-table-column
                                prop="name"
                                width="180px"
                                :label="Translate('IDCS_CHANNEL_NAME')"
                            >
                            </el-table-column>
                            <el-table-column
                                width="170px"
                                :label="Translate('IDCS_PRESET_NAME')"
                            >
                                <template #default="scope">
                                    <el-select
                                        v-model="scope.row.preset.value"
                                        size="small"
                                        :empty-values="[undefined, null]"
                                        @change="presetChange(scope.row)"
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
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="page_bottom">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="applyObjectLeftData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
    <!-- 排程管理弹窗 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="
            () => {
                pageData.scheduleManagPopOpen = false
            }
        "
    />
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.recordList"
        :linked-list="objectLeftData.record?.map((item) => item.value) || []"
        type="record"
        @confirm="recordConfirm"
        @close="recordClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.alarmOutIsShow"
        header-title="IDCS_TRIGGER_ALARM_OUT"
        source-title="IDCS_ALARM_OUT"
        target-title="IDCS_TRIGGER_ALARM_OUT"
        :source-data="pageData.alarmOutList"
        :linked-list="objectLeftData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./ObjectLeft.v.ts"></script>

<style lang="scss" scoped>
.obj_left_detection {
    height: calc(100vh - 360px);
    position: relative;
    .menu_tab {
        :deep(.el-tabs__header) {
            border-bottom: 1px solid var(--border-color2);
        }
        :deep(.el-tabs__item) {
            width: 100px !important;
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
        padding: 5px 20px;
        :deep(.el-checkbox__label) {
            font-size: 15px;
            color: #000;
        }
    }
    .title {
        border-left: 3px solid var(--border-color2);
        font-size: 15px;
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
    } // 参数设置
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
            :deep(.el-form-item) {
                padding: 5px 15px;
                margin-bottom: 0;
            }
            .area_radio_group {
                :deep(.el-radio-button) {
                    margin-right: 15px;
                    border-radius: 2px;
                    .el-radio-button__inner {
                        //修改按钮样式
                        width: 50px !important;
                        height: 24px;
                        line-height: 24px;
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
        }
    }
    // 联动方式下的盒子样式
    .linkage_box {
        float: left;
        width: 250px;
        height: 400px;
        margin-right: 2px;
        border: 1px solid #888888;
        :deep(.el-checkbox) {
            width: 200px;
            height: 45px;
            padding-left: 10px;
            color: #000;
        }
        .normal_param_title {
            width: 230px;
            height: 25px;
            padding: 4px 10px;
            background: #d0d0d0;
        }
        .linkage_title {
            text-align: center;
            font-size: 15px;
            width: 230px;
            height: 25px;
            padding: 4px 10px;
            background: #d0d0d0;
        }
        :deep(.el-table) {
            width: 100%;
            height: 350px;
        }
        :deep(.el-table__cell) {
            padding: 3px;
            height: 46px;
            border-bottom: none;
        }
    }
    .page_bottom {
        position: absolute;
        right: 0;
        bottom: 0;
    }
}
</style>
