<!--
 * @Description: AI 事件——更多——异常侦测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:27
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-19 10:40:44
-->
<template>
    <div class="abnormal_dispose_detection">
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
                            <!-- 规则 -->
                            <div class="title">{{ Translate('IDCD_RULE') }}</div>
                            <!-- 持续时间 -->
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select v-model="abnormalDisposeData.holdTime">
                                    <el-option
                                        v-for="item in abnormalDisposeData.holdTimeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 场景变更 -->
                            <el-form-item :label="Translate('IDCS_SCENE_CHANGE')">
                                <el-select
                                    v-model="abnormalDisposeData.sceneChangeSwitch"
                                    :disabled="abnormalDisposeData.sceneChangeSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 视频模糊 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_BLUR')">
                                <el-select
                                    v-model="abnormalDisposeData.clarityAbnormalSwitch"
                                    :disabled="abnormalDisposeData.clarityAbnormalSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 视频偏色 -->
                            <el-form-item :label="Translate('IDCS_VIDEO_COLOR')">
                                <el-select
                                    v-model="abnormalDisposeData.colorAbnormalSwitch"
                                    :disabled="abnormalDisposeData.colorAbnormalSwitch === ''"
                                    placeholder=""
                                >
                                    <el-option
                                        v-for="item in pageData.enableList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 灵敏度 -->
                            <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                                <el-slider
                                    v-model="abnormalDisposeData.sensitivity"
                                    :show-tooltip="false"
                                    :min="1"
                                    :max="100"
                                    :style="{ width: '175px' }"
                                />
                                <span class="sensitivity_span">{{ abnormalDisposeData.sensitivity }}</span>
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
                            <el-select v-model="abnormalDisposeData.sysAudio">
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
                            :data="abnormalDisposeData.record"
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
                            :data="abnormalDisposeData.alarmOut"
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
                @click="applyAbnormalDisposeData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="pageData.recordList"
        :linked-list="abnormalDisposeData.record?.map((item) => item.value) || []"
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
        :linked-list="abnormalDisposeData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./AbnormalDispose.v.ts"></script>

<style lang="scss" scoped>
.abnormal_dispose_detection {
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
            .sensitivity_span {
                width: 30px;
                height: 20px;
                line-height: 20px;
                text-align: center;
                border: 1px solid var(--border-color4);
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
