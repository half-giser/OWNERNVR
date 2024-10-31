<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 14:24:19
 * @Description: 业务应用-人脸签到
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 10:52:16
-->
<template>
    <div class="base-flex-box">
        <div class="form">
            <el-form
                class="inline-message narrow"
                :style="{
                    '--form-input-width': '200px',
                    '--form-label-width': '150px',
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
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_START_TIME')">
                            <el-time-picker
                                v-model="formData.startTime"
                                format="HH:mm:ss"
                                value-format="HH:mm:ss"
                                :disabled-hours="pickerRange.disabledStartTimeHours"
                                :disabled-minutes="pickerRange.disabledStartTimeMinutes"
                                :disabled-seconds="pickerRange.disabledStartTimeSeconds"
                                :clearable="false"
                            />
                        </el-form-item>
                        <el-form-item
                            :label="Translate('IDCS_END_TIME')"
                            class="end-time"
                        >
                            <el-time-picker
                                v-model="formData.endTime"
                                format="HH:mm:ss"
                                value-format="HH:mm:ss"
                                :disabled-hours="pickerRange.disabledEndTimeHours"
                                :disabled-minutes="pickerRange.disabledEndTimeMinutes"
                                :disabled-seconds="pickerRange.disabledEndTimeSeconds"
                                :clearable="false"
                            />
                        </el-form-item>
                    </el-form-item>
                    <el-form-item></el-form-item>
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
            <div
                class="base-btn-box padding"
                span="end"
            >
                <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
                <el-button @click="exportData">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                :data="sliceTableData"
                border
                stripe
            >
                <el-table-column :label="Translate('No.')">
                    <template #default="scope">
                        {{ displayIndex(scope.$index) }}
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
                <el-table-column :label="Translate('IDCS_ATTENDANCE_CHECKED')">
                    <template #default="scope">
                        {{ displayStatus(scope.row.checked) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_ATTENDANCE_UNCHECK')">
                    <template #default="scope">
                        <span class="text-error">{{ displayStatus(scope.row.unchecked) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DETAIL')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="showDetail(scope.$index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-pagination
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

<script lang="ts" src="./FaceCheck.v.ts"></script>

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

    .el-checkbox {
        margin-right: 0;
    }

    .base-btn-box {
        width: 10%;
        align-items: flex-end;
        padding-bottom: 10px;
    }
}

.end-time {
    padding-left: 15px;
}
</style>
