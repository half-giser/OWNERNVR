<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-05 18:18:24
 * @Description: 业务应用-人脸考勤
-->

<template>
    <div id="faceAttendanceView">
        <div class="faceAttendanceTop">
            <!-- 通道 -->
            <el-row>
                <el-col :span="3">
                    <el-text
                        class="label"
                        :title="Translate('IDCS_CHANNEL')"
                        truncated
                    >
                        {{ Translate('IDCS_CHANNEL') }}
                    </el-text>
                </el-col>
                <el-col :span="5">
                    <el-button
                        class="wideBtn"
                        type="primary"
                        size="small"
                        @click="handleSelectChl"
                    >
                        {{ Translate('IDCS_MORE') }}
                    </el-button>
                    <el-checkbox
                        v-model="pageData.chlSelectedAllFlg"
                        :label="Translate('IDCS_ALL')"
                        size="small"
                        @change="handleChlSelectedAllFlgChange"
                    />
                </el-col>
                <el-col :span="16">
                    <el-text
                        class="label"
                        :title="pageData.chlSelectedNameListStr"
                        truncated
                    >
                        {{ pageData.chlSelectedNameListStr }}
                    </el-text>
                </el-col>
            </el-row>
            <!-- 人脸分组 -->
            <el-row>
                <el-col :span="3">
                    <el-text
                        class="label"
                        :title="Translate('IDCS_ADD_FACE_GROUP')"
                        truncated
                    >
                        {{ Translate('IDCS_ADD_FACE_GROUP') }}
                    </el-text>
                </el-col>
                <el-col :span="5">
                    <el-button
                        class="wideBtn"
                        type="primary"
                        size="small"
                        @click="handleSelectFaceGroup"
                    >
                        {{ Translate('IDCS_CONFIGURATION') }}
                    </el-button>
                    <el-checkbox
                        v-model="pageData.faceGroupSelectedAllFlg"
                        :label="Translate('IDCS_ALL')"
                        size="small"
                        @change="handleFaceGroupSelectedAllFlgChange"
                    />
                </el-col>
                <el-col :span="16">
                    <el-text
                        class="label"
                        :title="pageData.faceGroupSelectedNameListStr"
                        truncated
                    >
                        {{ pageData.faceGroupSelectedNameListStr }}
                    </el-text>
                </el-col>
            </el-row>
            <!-- 日期 -->
            <el-row>
                <el-col :span="3">
                    <el-text
                        class="label"
                        :title="pageData.selectedDateInfo.selectedDateForLabel"
                        truncated
                    >
                        {{ pageData.selectedDateInfo.selectedDateForLabel }}
                    </el-text>
                </el-col>
                <el-col :span="5">
                    <BaseDateSelectPreNextBtn
                        :date-time-format="pageData.dateTimeFormat"
                        :selected-date-info="pageData.selectedDateInfo"
                        :handle-pre-date="handlePreDateCallback"
                        :handle-next-date="handleNextDateCallback"
                    />
                </el-col>
                <el-col :span="16">
                    <BaseDateSelectTab
                        :date-time-format="pageData.dateTimeFormat"
                        :selected-date-info="pageData.selectedDateInfo"
                        :handle-select-date="handleSelectDateCallback"
                    />
                </el-col>
            </el-row>
            <!-- 考勤周期 -->
            <el-row>
                <el-col :span="3">
                    <el-text
                        class="label"
                        :title="Translate('IDCS_ATTENDANCE_WEEK')"
                        truncated
                    >
                        {{ Translate('IDCS_ATTENDANCE_WEEK') }}
                    </el-text>
                </el-col>
                <el-col :span="5">
                    <el-checkbox-group v-model="pageData.attendanceCycleDayArr">
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_SUNDAY')"
                            :value="0"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_MONDAY')"
                            :value="1"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_TUESDAY')"
                            :value="2"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_WEDNESDAY')"
                            :value="3"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_THURSDAY')"
                            :value="4"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_FRIDAY')"
                            :value="5"
                            size="small"
                        />
                        <el-checkbox
                            :label="Translate('IDCS_CALENDAR_SATURDAY')"
                            :value="6"
                            size="small"
                        />
                    </el-checkbox-group>
                </el-col>
                <el-col :span="11">
                    <div class="el_time_picker_container">
                        <el-text
                            class="label"
                            :title="Translate('IDCS_ATTENDANCE_START_TIME')"
                            truncated
                        >
                            {{ Translate('IDCS_ATTENDANCE_START_TIME') }}
                        </el-text>
                        <el-time-picker
                            v-model="pageData.attendanceStartTime"
                            :value-format="pageData.dateTimeFormat.timeFormat"
                            :clearable="false"
                            size="small"
                            @change="handleCompareAttdStartAndEndTime($event, 'start')"
                        />
                    </div>
                    <div class="el_time_picker_container">
                        <el-text
                            class="label"
                            :title="Translate('IDCS_ATTENDANCE_END_TIME')"
                            truncated
                        >
                            {{ Translate('IDCS_ATTENDANCE_END_TIME') }}
                        </el-text>
                        <el-time-picker
                            v-model="pageData.attendanceEndTime"
                            :value-format="pageData.dateTimeFormat.timeFormat"
                            :clearable="false"
                            size="small"
                            @change="handleCompareAttdStartAndEndTime($event, 'end')"
                        />
                    </div>
                </el-col>
                <el-col :span="5">
                    <div class="search_export_container">
                        <el-button
                            type="primary"
                            @click="searchData"
                        >
                            {{ Translate('IDCS_SEARCH') }}
                        </el-button>
                        <el-button
                            type="primary"
                            @click="exportData"
                        >
                            {{ Translate('IDCS_EXPORT') }}
                        </el-button>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="faceAttendanceContent"></div>
    </div>
    <!-- 选择通道弹框 -->
    <BaseTableSelectItemPop
        v-model="selectChlPopVisiable"
        :title="Translate('IDCS_CHANNEL_SELECT')"
        :datas="pageData.chlList"
        :selected-datas="pageData.chlSelectedList"
        :confirm="setChlSelectedDataCallBack"
        :cancel="handleSelectChlPopClose"
    />
    <!-- 选择人脸分组弹框 -->
    <BaseTableSelectItemPop
        v-model="selectFaceGroupPopVisiable"
        :title="Translate('IDCS_CONFIGURATION')"
        :datas="pageData.faceGroupList"
        :selected-datas="pageData.faceGroupSelectedList"
        :confirm="setFaceGroupSelectedDataCallBack"
        :cancel="handleSelectFaceGroupPopClose"
    />
</template>

<script lang="ts" src="./faceAttendance.v.ts"></script>

<style lang="scss" scoped>
#faceAttendanceView {
    width: 100%;
    height: 100%;
    .faceAttendanceTop {
        padding: 0 15px;
        :deep(.el-row) {
            margin: 10px 0;
            .el-col {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                .label {
                    color: var(--text-dark);
                    cursor: text;
                }
                .wideBtn {
                    min-width: 80px;
                    margin-right: 10px;
                }
                .el-menu {
                    width: 100%;
                    justify-content: flex-start;
                }
                .el-checkbox-group {
                    .el-checkbox {
                        margin-right: 10px;
                    }
                }
                .el_time_picker_container {
                    display: flex;
                    align-items: center;
                    margin-right: 60px;
                    .el-input {
                        width: 100px;
                        margin-left: 10px;
                    }
                }
                .search_export_container {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                }
            }
        }
    }
}
</style>
