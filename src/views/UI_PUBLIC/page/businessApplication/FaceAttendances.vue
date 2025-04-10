<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-05 18:18:24
 * @Description: 业务应用-人脸考勤
-->
<template>
    <div class="base-flex-box">
        <div class="form">
            <el-form
                :style="{
                    '--form-input-width': '200px',
                }"
            >
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_CHANNEL')">
                        <el-button @click="changeChl">{{ Translate('IDCS_MORE') }}</el-button>
                        <el-checkbox
                            v-model="pageData.isAllChl"
                            :label="Translate('IDCS_ALL')"
                            @change="changeAllChl"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-text class="text-ellipsis">{{ formData.chls.map((item) => item.label).join(';') }}</el-text>
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                        <el-button @click="changeFaceGroup">{{ Translate('IDCS_CONFIGURATION') }}</el-button>
                        <el-checkbox
                            v-model="pageData.isAllFaceGroup"
                            :label="Translate('IDCS_ALL')"
                            @change="changeAllFaceGroup"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-text>{{ formData.faceGroup.map((item) => item.name).join(';') }}</el-text>
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item>
                        <template #label> {{ Translate('IDCS_DATE_TITLE') }}({{ daysInRange }}{{ Translate('IDCS_DAY_TIMES') }}) </template>
                        <BaseDateRange
                            :model-value="formData.dateRange"
                            :type="pageData.dateRangeType"
                            @change="changeDateRange"
                        />
                    </el-form-item>
                    <el-form-item>
                        <BaseDateTab
                            :model-value="formData.dateRange"
                            @change="changeDateRange"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_ATTENDANCE_WEEK')">
                        <el-checkbox-group v-model="formData.weekdays">
                            <el-checkbox
                                v-for="item in pageData.weekdayOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_ATTENDANCE_START_TIME')">
                            <el-time-picker
                                v-model="formData.startTime"
                                format="HH:mm:ss"
                                value-format="HH:mm:ss"
                                :disabled-hours="pickerRange.disabledStartTimeHours"
                                :disabled-minutes="pickerRange.disabledStartTimeMinutes"
                                :disabled-seconds="pickerRange.disabledStartTimeSeconds"
                            />
                        </el-form-item>
                        <el-form-item
                            :label="Translate('IDCS_ATTENDANCE_END_TIME')"
                            class="end-time"
                        >
                            <el-time-picker
                                v-model="formData.endTime"
                                format="HH:mm:ss"
                                value-format="HH:mm:ss"
                                :disabled-hours="pickerRange.disabledEndTimeHours"
                                :disabled-minutes="pickerRange.disabledEndTimeMinutes"
                                :disabled-seconds="pickerRange.disabledEndTimeSeconds"
                            />
                        </el-form-item>
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <el-checkbox
                            v-model="formData.advanced"
                            :label="Translate('IDCS_ADVANCED')"
                        />
                    </template>
                </el-form-item>
                <el-form-item v-show="formData.advanced">
                    <el-form-item>
                        <template #label>
                            <el-checkbox
                                v-model="formData.isName"
                                :label="Translate('IDCS_NAME_PERSON')"
                            />
                        </template>
                        <el-input
                            v-model="formData.name"
                            :disabled="!formData.isName"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox
                            v-model="formData.isType"
                            :label="Translate('IDCS_TYPE')"
                        />
                        <el-checkbox-group
                            v-model="formData.type"
                            :disabled="!formData.isType"
                        >
                            <el-checkbox
                                v-for="item in pageData.typeOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-checkbox-group>
                    </el-form-item>
                </el-form-item>
            </el-form>
            <div class="base-btn-box padding">
                <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
                <el-button @click="exportData">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                :data="sliceTableData"
                highlight-current-row
            >
                <el-table-column :label="Translate('No.')">
                    <template #default="{ $index }: TableColumn<BusinessFaceAttendanceList>">
                        {{ displayIndex($index) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_NAME')"
                    prop="name"
                />
                <el-table-column
                    :label="Translate('IDCS_FACE_LIBRARY')"
                    prop="groupName"
                />
                <el-table-column :label="Translate('IDCS_NORMAL')">
                    <template #default="{ row }: TableColumn<BusinessFaceAttendanceList>">
                        {{ displayStatus(row.normal) }}
                    </template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_LATE')">
                    <template #default="{ row }: TableColumn<BusinessFaceAttendanceList>">
                        <span class="text-online">{{ displayStatus(row.late) }}</span>
                    </template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_LEFT_EARLY')">
                    <template #default="{ row }: TableColumn<BusinessFaceAttendanceList>">
                        <span class="text-error">{{ displayStatus(row.leftEarly) }}</span>
                    </template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_ATTENDANCE_NONE')">
                    <template #default="{ row }: TableColumn<BusinessFaceAttendanceList>">
                        <span class="text-error">{{ displayStatus(row.absenteeism) }}</span>
                    </template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_ABNORMAL')">
                    <template #default="{ row }: TableColumn<BusinessFaceAttendanceList>">
                        <span class="text-exception">{{ displayStatus(row.abnormal) }}</span>
                    </template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_DETAIL')">
                    <template #default="{ $index }: TableColumn<BusinessFaceAttendanceList>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="showDetail($index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box padding">
            <BasePagination
                v-model:current-page="formData.currentPage"
                v-model:page-size="formData.pageSize"
                :total="tableData.length"
                :page-sizes="[formData.pageSize]"
            />
        </div>
        <BaseTableSelectPop
            v-model="pageData.isSelectChlPop"
            :title="Translate('IDCS_CHANNEL_SELECT')"
            :data="pageData.chlList"
            :current="formData.chls"
            :label-title="Translate('IDCS_CHANNEL_NAME')"
            @confirm="confirmChangeChl"
        />
        <BaseTableSelectPop
            v-model="pageData.isSelectFaceGroupPop"
            :title="Translate('IDCS_CONFIGURATION')"
            :data="pageData.faceGroupList"
            :current="formData.faceGroup"
            :label-title="Translate('IDCS_ADD_FACE_GROUP')"
            value="id"
            label="name"
            @confirm="confirmChangeFaceGroup"
        />
        <FaceDetailPop
            v-model="pageData.isDetailPop"
            :data="pageData.detail"
            @close="pageData.isDetailPop = false"
        />
    </div>
</template>

<script lang="ts" src="./FaceAttendances.v.ts"></script>

<style lang="scss" scoped>
.form {
    display: flex;

    & > .el-form {
        width: 90%;

        & > .el-form-item {
            & > .el-form-item__content {
                display: flex;

                & > .el-form-item:first-child {
                    width: 550px !important;
                    flex-shrink: 0;
                }

                & > .el-form-item:last-child {
                    width: calc(100% - 550px) !important;
                }
            }
        }
    }

    .base-btn-box {
        width: 10%;
        align-items: flex-end;
        padding-bottom: 10px;
        position: relative;
        z-index: 1;
    }
}

.end-time {
    padding-left: 15px;
}
</style>
