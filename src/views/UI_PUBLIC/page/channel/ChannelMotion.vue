<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-18 13:54:46
 * @Description: 通道 - 移动侦测配置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                    @message="notify"
                />
            </div>
            <div class="motionCtrl">
                <div class="notePic"></div>
                <el-button @click="handleSelAll">{{ Translate('IDCS_ALL') }}</el-button>
                <el-button @click="handleSelReverse">{{ Translate('IDCS_REVERSE') }}</el-button>
                <el-button @click="handleClear">{{ Translate('IDCS_CLEAR') }}</el-button>
            </div>
            <el-form
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-model="selectedChlId"
                        :options="chlOptions"
                        @change="handleChlSel"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ENABLE')">
                    <el-select-v2
                        v-model="formData.switch"
                        :disabled="formData.disabled"
                        :options="switchOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                    <BaseSliderInput
                        v-model="formData.sensitivity"
                        :min="formData.sensitivityMinValue"
                        :max="formData.sensitivityMaxValue"
                        :disabled="formData.disabled"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_DURATION')">
                    <el-select-v2
                        v-if="formData.isOnvifChl"
                        model-value=""
                        disabled
                        :options="[]"
                    />
                    <el-select-v2
                        v-else
                        v-model="formData.holdTime"
                        :disabled="formData.disabled"
                        :options="formData.holdTimeList"
                        :height="170"
                    />
                </el-form-item>
                <el-form-item
                    v-if="formData.supportSMD"
                    :label="Translate('IDCS_DETECTION_TARGET')"
                >
                    <el-checkbox
                        v-if="formData.supportSMD && !formData.SMDHumanDisabled"
                        v-model="formData.SMDHuman"
                        :label="Translate('IDCS_DETECTION_PERSON')"
                    />
                    <el-checkbox
                        v-if="formData.supportSMD && !formData.SMDVehicleDisabled"
                        v-model="formData.SMDVehicle"
                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                    />
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <span v-if="showNote">{{ Translate('IDCS_MOTION_DETECTION_ING') }}</span>
                    </template>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    v-title
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelMotionDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="180"
                    />
                    <el-table-column
                        :label="Translate('IDCS_ENABLE')"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ENABLE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="handleChangeAll('switch', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelMotionDto>">
                            <el-select-v2
                                v-model="row.switch"
                                :disabled="row.disabled"
                                :options="switchOptions"
                                @focus="handleRowClick(row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SENSITIVITY')"
                        min-width="180"
                    >
                        <template #default="{ row }: TableColumn<ChannelMotionDto>">
                            <BaseNumberInput
                                v-model="row.sensitivity"
                                :min="row.sensitivityMinValue"
                                :max="row.sensitivityMaxValue"
                                :disabled="row.disabled"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_DURATION')"
                        min-width="180"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_DURATION') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in holdTimeList"
                                            :key="item.value"
                                            @click="handleChangeAll('holdTime', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelMotionDto>">
                            <el-select-v2
                                v-if="row.isOnvifChl"
                                model-value=""
                                :options="[]"
                                disabled
                            />
                            <el-select-v2
                                v-else
                                v-model="row.holdTime"
                                :disabled="row.disabled"
                                :options="row.holdTimeList"
                                @focus="handleRowClick(row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button @click="handleDisposeWayClick">{{ Translate('IDCS_DISPOSE_WAY') }} </el-button>
                <el-button
                    :disabled="!editRows.size()"
                    @click="save"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelMotion.v.ts"></script>

<style scoped lang="scss">
.motionCtrl {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 5px;

    .notePic {
        width: 77px;
        height: 67px;
        background-image: var(--img-motion-note);
        background-repeat: no-repeat;
        margin-right: 30px;
    }
}
</style>
