<template>
    <div id="ChannelMotion">
        <div class="main">
            <div class="left">
                <div class="playerWrap">
                    <BaseVideoPlayer
                        ref="playerRef"
                        :split="1"
                        @onready="onReady"
                    />
                </div>
                <div class="motionCtrl">
                    <div id="notePic"></div>
                    <el-button @click="handleSelAll">{{ Translate('IDCS_ALL') }}</el-button>
                    <el-button @click="handleSelReverse">{{ Translate('IDCS_REVERSE') }}</el-button>
                    <el-button @click="handleClear">{{ Translate('IDCS_CLEAR') }}</el-button>
                </div>
                <el-form
                    ref="formRef"
                    :model="formData"
                    label-width="160px"
                    label-position="left"
                >
                    <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                        <el-select
                            v-model="selectedChlId"
                            placeholder=" "
                            @change="handleChlSel"
                        >
                            <el-option
                                v-for="(item, index) in tableData"
                                :key="index"
                                :value="item.id"
                                :label="item.name || ' '"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ENABLE')">
                        <el-select
                            v-model="formData.switch"
                            placeholder=" "
                            :disabled="formData.disabled"
                            @change="handleChangeVal"
                        >
                            <el-option
                                :value="true"
                                :label="Translate('IDCS_ON')"
                            />
                            <el-option
                                :value="false"
                                :label="Translate('IDCS_OFF')"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                        <div class="slider_wrap">
                            <el-slider
                                v-model="formData.sensitivity"
                                :min="isNaN(formData.sensitivityMinValue) ? 0 : formData.sensitivityMinValue"
                                :max="isNaN(formData.sensitivityMaxValue) ? 8 : formData.sensitivityMaxValue"
                                :disabled="formData.disabled"
                                class="slider"
                                @change="handleChangeVal"
                            />
                            <div>
                                <el-input
                                    v-model="formData.sensitivity"
                                    readonly
                                    class="custom_slider_input"
                                />
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_DURATION')">
                        <el-select
                            v-model="formData.holdTime"
                            placeholder=" "
                            :disabled="formData.disabled || formData.holdTime === ''"
                            @change="handleChangeVal"
                        >
                            <el-option
                                v-for="(item, index) in formData.holdTimeList"
                                :key="index"
                                :value="item.value"
                                :label="item.text"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        v-if="formData.supportSMD"
                        :label="Translate('IDCS_DETECTION_TARGET')"
                    >
                        <el-checkbox
                            v-if="formData.supportSMD && formData.objectFilterPerson !== undefined"
                            v-model="formData.objectFilterPerson"
                            :label="Translate('IDCS_DETECTION_PERSON')"
                            @change="handleChangeVal"
                        ></el-checkbox>
                        <el-checkbox
                            v-if="formData.supportSMD && formData.objectFilterCar !== undefined"
                            v-model="formData.objectFilterCar"
                            :label="Translate('IDCS_DETECTION_VEHICLE')"
                            @change="handleChangeVal"
                        ></el-checkbox>
                    </el-form-item>
                    <el-form-item label-width="0">
                        <span v-if="showNote">{{ Translate('IDCS_MOTION_DETECTION_ING') }}</span>
                    </el-form-item>
                </el-form>
            </div>
            <div class="right">
                <el-table
                    ref="tableRef"
                    border
                    stripe
                    :data="tableData"
                    table-layout="fixed"
                    show-overflow-tooltip
                    empty-text=" "
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus
                                :icon="scope.row.status"
                                :error-text="scope.row.statusTip"
                            ></BaseTableRowStatus>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="180px"
                    >
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_ENABLE')"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_ENABLE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="handleChangeAll('switch', true)">{{ Translate('IDCS_ON') }}</el-dropdown-item>
                                        <el-dropdown-item @click="handleChangeAll('switch', false)">{{ Translate('IDCS_OFF') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.switch"
                                size="small"
                                placeholder=" "
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal"
                            >
                                <el-option
                                    :value="true"
                                    :label="Translate('IDCS_ON')"
                                />
                                <el-option
                                    :value="false"
                                    :label="Translate('IDCS_OFF')"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SENSITIVITY')"
                        min-width="180px"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.sensitivity"
                                size="small"
                                :disabled="scope.row.disabled"
                                @change="handleChangeVal"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_DURATION')"
                        min-width="180px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_DURATION') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(item, index) in holdTimeList"
                                            :key="index"
                                            :value="item.value"
                                            @click="handleChangeAll('holdTime', item.value)"
                                            >{{ item.text }}</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.holdTime"
                                size="small"
                                placeholder=" "
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal"
                            >
                                <el-option
                                    v-for="(item, index) in scope.row.holdTimeList"
                                    :key="index"
                                    :value="item.value"
                                    :label="item.text"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
                <el-row class="row_pagination">
                    <el-pagination
                        v-model:current-page="pageIndex"
                        v-model:page-size="pageSize"
                        :page-sizes="DefaultPagerSizeOptions"
                        size="small"
                        :background="false"
                        :layout="DefaultPagerLayout"
                        :total="pageTotal"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </el-row>
                <el-row class="row_operation_btn">
                    <el-col class="el-col-flex-end">
                        <el-button @click="handleDisposeWayClick">{{ Translate('IDCS_DISPOSE_WAY') }} </el-button>
                        <el-button
                            :disabled="btnOKDisabled"
                            @click="save"
                            >{{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div></div>
    </div>
</template>

<script lang="ts" src="./ChannelMotion.v.ts"></script>

<style scoped lang="scss">
#ChannelMotion {
    .main {
        display: flex;
        width: 100%;

        .left {
            width: 400px;
            margin-right: 10px;

            .playerWrap {
                width: 400px;
                height: 300px;
            }

            .motionCtrl {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                margin: 5px;

                #notePic {
                    width: 77px;
                    height: 67px;
                    background-image: url('@/views/UI_PUBLIC/publicStyle/img/motionNote.gif');
                    background-repeat: no-repeat;
                    margin-right: 30px;
                }
            }

            .slider_wrap {
                width: 100%;
                display: flex;
                align-items: center;

                .custom_slider_input {
                    width: 55px;
                    margin-right: 0;

                    :deep(.el-input__inner) {
                        text-align: center;
                    }
                }

                .slider {
                    flex-grow: 1;
                    padding: 0 30px 0 10px;
                }
            }
        }
        .right {
            width: calc(100% - 410px);
            flex-grow: 1;

            :deep(.el-table) {
                width: 100%;
                height: calc(100vh - 335px);
            }

            .row_operation_btn {
                margin-top: 30px;
            }

            :deep(.custom_cell) {
                .cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
}
</style>
