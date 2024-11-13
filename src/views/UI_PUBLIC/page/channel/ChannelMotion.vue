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
                    :split="1"
                    @onready="onReady"
                />
            </div>
            <div class="motionCtrl">
                <div class="notePic"></div>
                <el-button @click="handleSelAll">{{ Translate('IDCS_ALL') }}</el-button>
                <el-button @click="handleSelReverse">{{ Translate('IDCS_REVERSE') }}</el-button>
                <el-button @click="handleClear">{{ Translate('IDCS_CLEAR') }}</el-button>
            </div>
            <el-form
                ref="formRef"
                :model="formData"
                :style="{
                    '--form-label-width': '150px',
                }"
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="selectedChlId"
                        @change="handleChlSel"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="index"
                            :value="item.id"
                            :label="item.name || ' '"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ENABLE')">
                    <el-select
                        v-model="formData.switch"
                        :disabled="formData.disabled"
                        @change="handleChangeVal"
                    >
                        <el-option
                            v-for="item in switchOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SENSITIVITY')">
                    <el-slider
                        v-model="formData.sensitivity"
                        :min="formData.sensitivityMinValue"
                        :max="formData.sensitivityMaxValue"
                        :disabled="formData.disabled"
                        show-input
                        @change="handleChangeVal"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_DURATION')">
                    <el-select
                        v-model="formData.holdTime"
                        :disabled="formData.disabled || formData.holdTime === ''"
                        @change="handleChangeVal"
                    >
                        <el-option
                            v-for="item in formData.holdTimeList"
                            :key="item"
                            :value="item"
                            :label="getTranslateForSecond(Number(item))"
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
                    />
                    <el-checkbox
                        v-if="formData.supportSMD && formData.objectFilterCar !== undefined"
                        v-model="formData.objectFilterCar"
                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                        @change="handleChangeVal"
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
                    border
                    stripe
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus
                                :icon="scope.row.status"
                                :error-text="scope.row.statusTip"
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
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.switch"
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal"
                            >
                                <el-option
                                    v-for="item in switchOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SENSITIVITY')"
                        min-width="180"
                    >
                        <template #default="scope">
                            <BaseNumberInput
                                v-model="scope.row.sensitivity"
                                :min="scope.row.sensitivityMinValue"
                                :max="scope.row.sensitivityMaxValue"
                                :disabled="scope.row.disabled"
                                @change="handleChangeVal"
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
                                            :key="item"
                                            @click="handleChangeAll('holdTime', item)"
                                            >{{ getTranslateForSecond(Number(item)) }}</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.holdTime"
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal"
                            >
                                <el-option
                                    v-for="item in scope.row.holdTimeList"
                                    :key="item"
                                    :value="item"
                                    :label="getTranslateForSecond(Number(item))"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
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
                    :disabled="btnOKDisabled"
                    @click="save"
                    >{{ Translate('IDCS_APPLY') }}
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
