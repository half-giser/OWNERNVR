<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 14:24:19
 * @Description: 业务应用-人脸签到
-->
<template>
    <div class="base-flex-box">
        <div class="form">
            <el-form class="stripe">
                <el-form-item :label="Translate('IDCS_CHANNEL')">
                    <el-button @click="changeChl">{{ Translate('IDCS_MORE') }}</el-button>
                    <el-checkbox
                        v-model="pageData.isAllChl"
                        :label="Translate('IDCS_ALL')"
                        @change="changeAllChl"
                    />
                    <div
                        v-title
                        class="text-ellipsis"
                    >
                        {{ formData.chls.map((item) => item.label).join('; ') }}
                    </div>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-button @click="changeFaceGroup">{{ Translate('IDCS_CONFIGURATION') }}</el-button>
                    <el-checkbox
                        v-model="pageData.isAllFaceGroup"
                        :label="Translate('IDCS_ALL')"
                        @change="changeAllFaceGroup"
                    />
                    <div
                        v-title
                        class="text-ellipsis"
                    >
                        {{ formData.faceGroup.map((item) => item.name).join('; ') }}
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-form-item>
                        <template #label> {{ Translate('IDCS_DATE_TITLE') }}({{ daysInRange }}{{ Translate('IDCS_DAY_TIMES') }}) </template>
                        <BaseDateRange
                            :model-value="formData.dateRange"
                            :type="pageData.dateRangeType"
                            custom-type="minute"
                            @change="changeDateRange"
                        />
                    </el-form-item>
                    <el-form-item>
                        <BaseDateTab
                            :model-value="formData.dateRange"
                            custom-type="minute"
                            @change="changeDateRange"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_CHECKIN_START_TIME')">
                        <BaseTimePicker
                            v-model="formData.startTime"
                            :range="[null, formData.endTime]"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_CHECKIN_END_TIME')">
                        <BaseTimePicker
                            v-model="formData.endTime"
                            :range="[formData.startTime, null]"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-checkbox
                        v-model="formData.advanced"
                        :label="Translate('IDCS_ADVANCED')"
                    />
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
            <div class="base-btn-box padding gap">
                <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
                <el-button @click="exportData">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                v-title
                :data="sliceTableData"
                highlight-current-row
                show-overflow-tooltip
            >
                <el-table-column :label="Translate('No.')">
                    <template #default="{ $index }: TableColumn<BusinessFaceCheckList>">
                        {{ displayIndex($index) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_NAME')"
                    prop="name"
                    width="250"
                />
                <el-table-column
                    :label="Translate('IDCS_FACE_LIBRARY')"
                    prop="groupName"
                    width="250"
                />
                <el-table-column :label="Translate('IDCS_ATTENDANCE_CHECKED')">
                    <template #default="{ row }: TableColumn<BusinessFaceCheckList>">
                        {{ displayStatus(row.checked) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_ATTENDANCE_UNCHECK')">
                    <template #default="{ row }: TableColumn<BusinessFaceCheckList>">
                        <span class="text-error">{{ displayStatus(row.unchecked) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DETAIL')">
                    <template #default="{ $index }: TableColumn<BusinessFaceCheckList>">
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
            type="sign"
            @close="pageData.isDetailPop = false"
        />
    </div>
</template>

<script lang="ts" src="./FaceCheck.v.ts"></script>

<style lang="scss" scoped>
.form {
    padding: 10px;
    padding-bottom: 0;
}
</style>
