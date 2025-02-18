<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-27 11:55:36
 * @Description: 通道 - 图像参数配置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                />
            </div>
            <el-form
                ref="formRef"
                :style="{
                    '--form-label-width': '160px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-model="selectedChlId"
                        :options="chlOptions"
                        @change="handleChlSel"
                    />
                </el-form-item>
                <el-form-item
                    v-show="formData.isSupportThermal"
                    :label="Translate('IDCS_COLOR_CODE')"
                >
                    <el-select-v2
                        v-model="formData.paletteCode"
                        :disabled="formData.disabled"
                        :options="formData.paletteList"
                        @change="handlePaletteCode()"
                    />
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_BRIGHTNESS')"
                >
                    <div class="slider_wrap">
                        <el-slider
                            v-model="formData.bright"
                            :min="formData.brightMinValue === undefined ? 0 : formData.brightMinValue"
                            :max="formData.brightMaxValue === undefined ? 100 : formData.brightMaxValue"
                            :disabled="formData.disabled || formData.brightMinValue === formData.brightMaxValue || formData.bright === -1"
                            @change="handleInputChange(formData.bright, formData.id, 'bright')"
                        />
                        <el-input
                            :model-value="formData.bright"
                            readonly
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_CONTRAST')"
                >
                    <div class="slider_wrap">
                        <el-slider
                            v-model="formData.contrast"
                            :min="formData.contrastMinValue === undefined ? 0 : formData.contrastMinValue"
                            :max="formData.contrastMaxValue === undefined ? 100 : formData.contrastMaxValue"
                            :disabled="formData.disabled || formData.contrastMinValue === formData.contrastMaxValue || formData.contrast === -1"
                            @change="handleInputChange(formData.contrast, formData.id, 'contrast')"
                        />
                        <el-input
                            :model-value="formData.contrast"
                            readonly
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_SATURATION')"
                >
                    <div class="slider_wrap">
                        <el-slider
                            v-model="formData.saturation"
                            :min="formData.saturationMinValue === undefined ? 0 : formData.saturationMinValue"
                            :max="formData.saturationMaxValue === undefined ? 100 : formData.saturationMaxValue"
                            :disabled="formData.disabled || formData.saturationMinValue === formData.saturationMaxValue || formData.saturation === -1"
                            @change="handleInputChange(formData.saturation, formData.id, 'saturation')"
                        />
                        <el-input
                            :model-value="formData.saturation"
                            readonly
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_TONE')"
                >
                    <div class="slider_wrap">
                        <el-slider
                            v-model="formData.hue"
                            :min="formData.hueMinValue === undefined ? 0 : formData.hue === -1 ? -1 : formData.hueMinValue"
                            :max="formData.hueMaxValue === undefined ? 100 : formData.hueMaxValue"
                            :disabled="formData.disabled || formData.hueMinValue === formData.hueMaxValue || formData.hue === -1"
                            @change="handleInputChange(formData.hue, formData.id, 'hue')"
                        />
                        <el-input
                            v-if="formData.hue !== -1"
                            :model-value="formData.hue"
                            readonly
                        />
                        <div
                            v-else
                            class="empty_content"
                        ></div>
                    </div>
                </el-form-item>
            </el-form>
            <div class="base-btn-box space-between">
                <div>
                    <div id="divTip">
                        <BaseFloatError
                            v-model:message="floatErrorMessage"
                            :type="floatErrorType"
                        />
                    </div>
                </div>
                <div>
                    <el-button
                        :disabled="formData.disabled || formData.isSupportThermal"
                        @click="handleAdvanced"
                    >
                        {{ Translate('IDCS_ADVANCED') }}
                    </el-button>
                    <el-button
                        :disabled="formData.disabled"
                        @click="handleRestoreVal"
                    >
                        {{ Translate('IDCS_RESTORE_VALUE') }}
                    </el-button>
                </div>
            </div>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    :row-key="(row) => row.id"
                    :expand-row-keys="expandedRowKeys"
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="160"
                    />
                    <el-table-column
                        :label="Translate('IDCS_BRIGHTNESS')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <span v-if="row.isSpeco"></span>
                            <span v-else-if="row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="row.bright"
                                :min="row.brightMinValue"
                                :max="row.brightMaxValue"
                                :disabled="row.disabled"
                                @change="handleInputChange(row.bright, row.id, 'bright')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CONTRAST')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <span v-if="row.isSpeco"></span>
                            <span v-else-if="row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="row.contrast"
                                :min="row.contrastMinValue"
                                :max="row.contrastMaxValue"
                                :disabled="row.disabled"
                                @change="handleInputChange(row.contrast, row.id, 'contrast')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SATURATION')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <span v-if="row.isSpeco"></span>
                            <span v-else-if="row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="row.saturation"
                                :min="row.saturationMinValue"
                                :max="row.saturationMaxValue"
                                :disabled="row.disabled"
                                @change="handleInputChange(row.saturation, row.id, 'saturation')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TONE')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <span v-if="row.isSpeco"></span>
                            <span v-else-if="row.isSupportThermal || row.hue === -1">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="row.hue"
                                :min="row.hueMinValue"
                                :max="row.hueMaxValue"
                                :disabled="row.disabled"
                                @change="handleInputChange(row.hue, row.id, 'hue')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        type="expand"
                        :label="Translate('IDCS_ADVANCED')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <div class="expandContent">
                                <div class="page_content">
                                    <el-scrollbar>
                                        <div
                                            v-show="row.activeTab === tabKeys.imageAdjust"
                                            class="page_content_item"
                                        >
                                            <el-form
                                                ref="imageAdjustFormRef"
                                                :style="{
                                                    '--form-label-width': '200px',
                                                }"
                                            >
                                                <el-form-item :label="Translate('IDCS_CONFIG_FILE')">
                                                    <el-select-v2
                                                        v-model="row.cfgFile"
                                                        :disabled="row.configFileTypeEnum.length === 0"
                                                        :options="row.configFileTypeEnum"
                                                        @change="handleCfgFileChange"
                                                    />
                                                </el-form-item>
                                                <el-divider />
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-if="row.sharpenSwitchEnable"
                                                            v-model="row.sharpenSwitch"
                                                            :label="Translate('IDCS_SHARPNESS')"
                                                            :disabled="row.sharpenMaxValue === undefined"
                                                            @change="setAZData()"
                                                        />
                                                        <span v-else>{{ Translate('IDCS_SHARPNESS') }}</span>
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.sharpenValue"
                                                            :disabled="!row.sharpenSwitch || row.sharpenMaxValue === undefined"
                                                            :min="row.sharpenMinValue === undefined ? 0 : row.sharpenMinValue"
                                                            :max="row.sharpenMaxValue === undefined ? 100 : row.sharpenMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.sharpenMaxValue === undefined ? 0 : row.sharpenValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="row.WDRSwitch"
                                                            :label="Translate('IDCS_WDR')"
                                                            :disabled="row.WDRMaxValue === undefined"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.WDRValue"
                                                            :disabled="!row.WDRSwitch || row.WDRMaxValue === undefined"
                                                            :min="row.WDRMinValue === undefined ? 0 : row.WDRMinValue"
                                                            :max="row.WDRMaxValue === undefined ? 100 : row.WDRMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.WDRMaxValue === undefined ? 0 : row.WDRValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="row.denoiseSwitch"
                                                            :label="Translate('IDCS_DENOISE')"
                                                            :disabled="row.denoiseMaxValue === undefined"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.denoiseValue"
                                                            :disabled="!row.denoiseSwitch || row.denoiseMaxValue === undefined"
                                                            :min="row.denoiseMinValue === undefined ? 0 : row.denoiseMinValue"
                                                            :max="row.denoiseMaxValue === undefined ? 100 : row.denoiseMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.denoiseMaxValue === undefined ? 0 : row.denoiseValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-if="row.defogSwitch !== undefined"
                                                            v-model="row.defogSwitch"
                                                            :label="Translate('IDCS_DEFOG')"
                                                            @change="setAZData()"
                                                        />
                                                        <el-checkbox
                                                            v-else
                                                            :label="Translate('IDCS_DEFOG')"
                                                            disabled
                                                        />
                                                    </template>
                                                    <div
                                                        v-if="row.defogSwitch !== undefined"
                                                        class="slider_wrap"
                                                    >
                                                        <el-slider
                                                            v-model="row.defogValue"
                                                            :disabled="!row.defogSwitch"
                                                            :min="row.defogMinValue === undefined ? 0 : row.defogMinValue"
                                                            :max="row.defogMaxValue === undefined ? 100 : row.defogMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.defogValue"
                                                            readonly
                                                        />
                                                    </div>
                                                    <div
                                                        v-else
                                                        class="slider_wrap"
                                                    >
                                                        <el-slider disabled />
                                                        <el-input
                                                            :model-value="0"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_IMAGE_SHIFT')">
                                                    <div class="slider_wrap with-btn">
                                                        <el-slider
                                                            v-model="row.imageValue"
                                                            :min="row.imageMinValue === undefined ? 0 : row.imageMinValue"
                                                            :max="row.imageMaxValue === undefined ? 100 : row.imageMaxValue"
                                                            :disabled="row.chlType !== 'analog' || row.imageMaxValue === undefined"
                                                            class="slider slider_sp"
                                                            @change="setAZData()"
                                                        />
                                                        <div class="custom_btn_slider_wrap">
                                                            <div
                                                                class="custom_btn_slider custom_btn_slider_decr"
                                                                :class="{ disabled: row.chlType !== 'analog' || row.imageMaxValue === undefined }"
                                                                @click="handleImageValueChange(-1)"
                                                            ></div>
                                                            <div
                                                                class="custom_btn_slider custom_btn_slider_incr"
                                                                :class="{ disabled: row.chlType !== 'analog' || row.imageMaxValue === undefined }"
                                                                @click="handleImageValueChange(1)"
                                                            ></div>
                                                        </div>
                                                        <el-input
                                                            :model-value="row.chlType !== 'analog' || row.imageMaxValue === undefined ? 0 : row.imageValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_BACKLIGHT_COMPENSATION')">
                                                    <el-select-v2
                                                        v-if="row.BLCMode === undefined || row.chlType === 'analog'"
                                                        model-value="OFF"
                                                        :options="[]"
                                                        disabled
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        v-model="row.BLCMode"
                                                        :options="row.BLCModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.BLCMode === 'HWDR'"
                                                    :label="Translate('IDCS_GRADE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.HWDRLevel"
                                                        :disabled="row.HWDRLevel === undefined"
                                                        :options="row.HWDRLevelArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_WB')">
                                                    <el-select-v2
                                                        v-model="row.whiteBalanceMode"
                                                        :disabled="row.whiteBalanceMode === undefined"
                                                        :options="row.whiteBalanceModeEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_RED_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.redValue"
                                                            :min="row.redMinValue === undefined ? 0 : row.redMinValue"
                                                            :max="row.redMaxValue === undefined ? 100 : row.redMaxValue"
                                                            :disabled="row.redMaxValue === undefined"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.redMaxValue === undefined ? 0 : row.redValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_BLUE_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.blueValue"
                                                            :min="row.blueMinValue === undefined ? 0 : row.blueMinValue"
                                                            :max="row.blueMaxValue === undefined ? 100 : row.blueMaxValue"
                                                            :disabled="row.blueMaxValue === undefined"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.blueMaxValue === undefined ? 0 : row.blueValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_ANTI_FLICKER')">
                                                    <el-select-v2
                                                        v-model="row.antiflicker"
                                                        :disabled="row.antiflicker === undefined"
                                                        :options="row.antiflickerModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.exposureModeArray.length > 0"
                                                    :label="Translate('IDCS_EXPOSURE_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.exposureMode"
                                                        :disabled="row.exposureMode === undefined"
                                                        :options="row.exposureModeArray"
                                                        @change="handleExposureModeChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.exposureMode === 'manual'"
                                                    :label="Translate('IDCS_EXPOSURE_VALUE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.exposureModeValue"
                                                        :disabled="row.exposureModeValue === undefined"
                                                        :options="row.exposureValueArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <!-- 1、NT2-3947 当有ShowGainMode字段且为false时，为4.2.1版本的ipc，认为不支持隐藏增益模式，，隐藏增益模式下拉框，否则认为是支持；2、协议返回增益模式的枚举只有一个，则为5.2版本的ipc，隐藏增益模式下拉框-->
                                                <el-form-item
                                                    v-if="row.ShowGainMode && row.gainModeEnum.length > 1"
                                                    :label="Translate('IDCS_GAIN_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.gainMode"
                                                        :options="row.gainModeEnum"
                                                        :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.gainMode === '1'"
                                                    :label="Translate('IDCS_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.gainValue"
                                                            :min="row.gainMinValue === undefined ? 0 : row.gainMinValue"
                                                            :max="row.gainMaxValue === undefined ? 100 : row.gainMaxValue"
                                                            :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.gainValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.gainMode === '0'"
                                                    :label="Translate('IDCS_GAIN_LIMIT')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.gainAGC"
                                                            :min="row.gainMinValue === undefined ? 0 : row.gainMinValue"
                                                            :max="row.gainMaxValue === undefined ? 100 : row.gainMaxValue"
                                                            :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.gainAGC"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportHallway"
                                                    :label="Translate('IDCS_CORRIDOR_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.imageRotate"
                                                        :options="pageData.imgRotateOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_MIRROR')">
                                                    <el-radio-group
                                                        v-if="row.mirrorSwitch !== undefined"
                                                        v-model="row.mirrorSwitch"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="row.mirrorSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                    <el-radio-group
                                                        v-else
                                                        v-model="defaultRadioVal"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="row.mirrorSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_FLIP')">
                                                    <el-radio-group
                                                        v-if="row.flipSwitch !== undefined"
                                                        v-model="row.flipSwitch"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="row.flipSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                    <el-radio-group
                                                        v-else
                                                        v-model="defaultRadioVal"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="row.flipSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.HFR !== undefined"
                                                    :label="Translate('IDCS_HFR')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.HFR"
                                                        :options="pageData.switchOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_DN_MODE')">
                                                    <el-select-v2
                                                        v-if="row.isSupportIRCutMode && row.IRCutMode !== undefined"
                                                        v-model="row.IRCutMode"
                                                        :disabled="!row.isSupportIRCutMode"
                                                        :options="row.IRCutModeArray.length ? row.IRCutModeArray : pageData.icCutModeOptions"
                                                        @change="setAZData()"
                                                    />
                                                    <el-select-v2
                                                        v-else-if="row.isSupportIRCutMode"
                                                        v-model="defaultIRCutMode"
                                                        :disabled="!row.isSupportIRCutMode"
                                                        :options="row.IRCutModeArray.length ? row.IRCutModeArray : pageData.icCutModeOptions"
                                                        @change="handleIRCutModeChange"
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        model-value=""
                                                        disabled
                                                        :options="[]"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'auto' && row.IRCutConvSen2 !== undefined"
                                                    :label="Translate('IDCS_DN_SEN')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.IRCutConvSen"
                                                        :disabled="!row.isSupportIRCutMode"
                                                        :options="row.IRCutConvSenArray.length ? row.IRCutConvSenArray : pageData.irCutConvSenOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'time' && row.IRCutDayTime !== undefined"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.IRCutDayTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'time' && row.IRCutNightTime !== undefined"
                                                    :label="Translate('IDCS_DN_NIGHT_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.IRCutNightTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.smartIrMode || row.smartIrSwitch !== undefined"
                                                    :label="Translate('IDCS_SMART_IR')"
                                                >
                                                    <el-select-v2
                                                        v-if="row.smartIrMode"
                                                        v-model="row.smartIrMode"
                                                        :options="row.SmartIrArray"
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        v-model="row.smartIrSwitch"
                                                        :options="pageData.switchOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="(row.smartIrMode || row.smartIrSwitch !== undefined) && row.smartIrSwitch"
                                                    :label="Translate('IDCS_GRADE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.smartIrLevel"
                                                        :options="pageData.smartIrLevelOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="(row.smartIrMode || row.smartIrSwitch !== undefined) && row.smartIrMode === 'manual'"
                                                    :label="Translate('IDCS_LIGHT_LEVEL')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.lightLevelValue"
                                                            :min="row.lightLevelMinValue === undefined ? 0 : row.lightLevelMinValue"
                                                            :max="row.lightLevelMaxValue === undefined ? 100 : row.lightLevelMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.lightLevelValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'auto' && row.delayTimeValue !== undefined"
                                                    :label="Translate('IDCS_DELAY_TIME_SECOND')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.delayTimeValue"
                                                            :min="row.delayTimeMinValue === undefined ? 0 : row.delayTimeMinValue"
                                                            :max="row.delayTimeMaxValue === undefined ? 100 : row.delayTimeMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.delayTimeValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_SHUTTER_MODE')">
                                                    <el-select-v2
                                                        v-model="row.shutterMode"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterModeEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.shutterMode !== undefined && row.shutterMode !== '0'"
                                                    :label="Translate('IDCS_SHUTTER')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.shutterValue"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterValueEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.shutterMode !== undefined && row.shutterMode !== '1' && row.shutterUpLimit !== undefined"
                                                    :label="Translate('IDCS_SHUTTER_UPPER_LIMIT')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.shutterUpLimit"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterValueEnum"
                                                        @change="handleShutterUpLimitChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.shutterMode !== undefined && row.shutterMode !== '1' && row.shutterLowLimit !== undefined"
                                                    :label="Translate('IDCS_SHUTTER_LOWER_LIMIT')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.shutterLowLimit"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterValueEnum"
                                                        @change="handleShutterLowLimitChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_INFRARE_MODE')">
                                                    <el-select-v2
                                                        v-model="row.InfraredMode"
                                                        :disabled="row.InfraredMode === undefined"
                                                        :options="row.InfraredModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode"
                                                    :label="Translate('IDCS_WHITE_LIGHT')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.whitelightMode"
                                                        :options="pageData.whitelightModeOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode && row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_WHITE_STRENGTH')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="row.whitelightStrength"
                                                            :min="row.whitelightStrengthMin === undefined ? 0 : row.whitelightStrengthMin"
                                                            :max="row.whitelightStrengthMax === undefined ? 100 : row.whitelightStrengthMax"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="row.whitelightStrength"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode && row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_START_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.whitelightOnTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode && row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_END_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.whitelightOffTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                            </el-form>
                                        </div>
                                        <div
                                            v-show="row.activeTab === tabKeys.scheduleCtrl"
                                            class="page_content_item"
                                        >
                                            <el-form
                                                :style="{
                                                    '--form-label-width': '150px',
                                                }"
                                            >
                                                <el-form-item :label="Translate('IDCS_SCHEDULE')">
                                                    <el-select-v2
                                                        v-model="row.scheduleInfo.scheduleType"
                                                        :disabled="!row.supportSchedule"
                                                        :options="filteredScheduleInfoEnum(row.scheduleInfo.scheduleInfoEnum, false)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.scheduleInfo.scheduleType !== 'time'"
                                                    :label="Translate('IDCS_CONFIG_FILE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.scheduleInfo.program"
                                                        :disabled="!row.supportSchedule"
                                                        :options="filteredScheduleInfoEnum(row.scheduleInfo.scheduleInfoEnum, true)"
                                                        @change="handleProgramChange(row)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.scheduleInfo.scheduleType === 'time'"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                    :style="{
                                                        '--form-input-width': '125px',
                                                    }"
                                                >
                                                    <el-time-picker
                                                        v-model="row.scheduleInfo.dayTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="handleChangeTime('day')"
                                                    />
                                                    <el-text class="time-splitter"> -- </el-text>
                                                    <el-time-picker
                                                        v-model="row.scheduleInfo.nightTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        @change="handleChangeTime('night')"
                                                    />
                                                </el-form-item>
                                                <div
                                                    v-if="row.scheduleInfo.scheduleType === 'time'"
                                                    class="base-btn-box center"
                                                >
                                                    <BaseScheduleLine
                                                        id="scheduleLineId"
                                                        ref="scheduleLine"
                                                        :width="440"
                                                        readonly
                                                        :time-mode="timeMode"
                                                    />
                                                </div>
                                                <div
                                                    v-if="row.scheduleInfo.scheduleType === 'time'"
                                                    class="base-btn-box center"
                                                >
                                                    <div class="legend-icon"></div>
                                                    <span class="legend-text">{{ Translate('IDCS_DN_DAY') }}</span>
                                                    <div class="legend-icon night"></div>
                                                    <span class="legend-text">{{ Translate('IDCS_DN_NIGHT') }}</span>
                                                </div>
                                            </el-form>
                                            <div class="base-btn-box">
                                                <el-button @click="setAZData(true)">{{ Translate('IDCS_SAVE') }}</el-button>
                                            </div>
                                        </div>
                                        <div
                                            v-show="row.activeTab === tabKeys.sceneCtrl"
                                            class="page_content_item3"
                                        >
                                            <el-form
                                                :style="{
                                                    '--form-label-width': '150px',
                                                }"
                                            >
                                                <div class="row_scene_title">{{ Translate('IDCS_SCENE_CONTROL') }}</div>
                                                <div class="row_scene_control scene_item">
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('ZoomOut', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedSlow"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                        />
                                                    </div>
                                                    <BaseImgSprite
                                                        file="arr_left"
                                                        :chunk="1"
                                                        :index="0"
                                                    />
                                                    <div>{{ Translate('IDCS_ZOOM') }}</div>
                                                    <BaseImgSprite
                                                        file="arr_right"
                                                        :chunk="1"
                                                        :index="0"
                                                    />
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('ZoomIn', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedQuick"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                        />
                                                    </div>
                                                </div>
                                                <el-form-item :label="Translate('IDCS_FOCUS_MODE')">
                                                    <el-select-v2
                                                        v-if="curLensCtrl.focusTypeList.length"
                                                        v-model="curLensCtrl.focusType"
                                                        :disabled="!curLensCtrl.supportAz"
                                                        :options="curLensCtrl.focusTypeList"
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        v-model="defaultFocusMode"
                                                        disabled
                                                        :options="pageData.focusModeOptions"
                                                    />
                                                </el-form-item>
                                                <div
                                                    v-if="!curLensCtrl.supportAz || (curLensCtrl.supportAz && curLensCtrl.focusType !== 'auto')"
                                                    class="row_scene_control"
                                                >
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('Far', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedSlow"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                        />
                                                    </div>
                                                    <BaseImgSprite
                                                        file="arr_left"
                                                        :chunk="1"
                                                        :index="0"
                                                    />
                                                    <div>{{ Translate('IDCS_FOCUS') }}</div>
                                                    <BaseImgSprite
                                                        file="arr_right"
                                                        :chunk="1"
                                                        :index="0"
                                                    />
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('Near', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedQuick"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                        />
                                                    </div>
                                                    <el-button
                                                        class="btn_auto_focus text-ellipsis"
                                                        :title="Translate('IDCS_ONE_KEY_FOCUS')"
                                                        :disabled="!curLensCtrl.supportAz"
                                                        @mousedown="addCmd('OneKeyFocus', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        {{ Translate('IDCS_ONE_KEY_FOCUS') }}
                                                    </el-button>
                                                </div>
                                                <el-form-item
                                                    v-else-if="curLensCtrl.supportAz || (curLensCtrl.supportAz && curLensCtrl.focusType === 'auto')"
                                                    :label="Translate('IDCS_FOCUS_TIME')"
                                                >
                                                    <el-select-v2
                                                        v-model="curLensCtrl.timeInterval"
                                                        :disabled="!curLensCtrl.supportAz"
                                                        :options="curLensCtrl.timeIntervalList"
                                                    />
                                                </el-form-item>
                                                <el-form-item>
                                                    <el-text class="row_focus_model_tip">{{ Translate('IDCS_FOCUS_MODEL_TIP') }}</el-text>
                                                </el-form-item>
                                                <el-form-item>
                                                    <el-checkbox
                                                        v-model="curLensCtrl.IrchangeFocus"
                                                        :label="Translate('IDCS_AUTO_FOCUS_TIP')"
                                                        :disabled="curLensCtrl.IrchangeFocusDisabled"
                                                    />
                                                </el-form-item>
                                            </el-form>
                                            <div class="base-btn-box space-between">
                                                <div>
                                                    <div id="divLensTip">
                                                        <BaseFloatError
                                                            v-model:message="floatLensMessage"
                                                            :type="floatErrorType"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <el-button
                                                        :disabled="!curLensCtrl.supportAz"
                                                        @click="saveLensCtrlData"
                                                    >
                                                        {{ Translate('IDCS_SAVE') }}
                                                    </el-button>
                                                </div>
                                            </div>
                                        </div>
                                    </el-scrollbar>
                                </div>
                                <div class="base-btn-box center">
                                    <el-radio-group v-model="row.activeTab">
                                        <el-radio-button
                                            v-for="item in tabs"
                                            :key="item.key"
                                            :value="item.key"
                                            :label="Translate(item.text)"
                                        />
                                    </el-radio-group>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelImage.v.ts"></script>

<style scoped lang="scss">
.slider_wrap {
    width: 100%;
    display: flex;
    align-items: center;

    .custom_btn_slider_wrap {
        display: flex;
        width: 40px;
        justify-content: space-between;
        margin-right: 10px;
        flex-shrink: 0;

        .custom_btn_slider {
            width: 0;
            height: 0;
            border-width: 7px;
            border-style: solid;
            cursor: pointer;

            &.disabled {
                cursor: not-allowed;
            }
        }

        .custom_btn_slider_decr {
            border-color: transparent var(--slider-btn-border) transparent transparent;

            &.disabled {
                border-color: transparent var(--slider-btn-border-disabled) transparent transparent;
            }
        }

        .custom_btn_slider_incr {
            border-color: transparent transparent transparent var(--slider-btn-border);

            &.disabled {
                border-color: transparent transparent transparent var(--slider-btn-border-disabled);
            }
        }
    }

    :deep(.el-input) {
        --form-input-width: 46px;

        padding: 0;
        flex-shrink: 0;
    }

    :deep(.el-input__wrapper) {
        padding: 0;
    }

    :deep(.el-input__inner) {
        text-align: center;
    }

    .empty_content {
        width: 46px;
        flex-shrink: 0;
    }

    .slider_opertion {
        display: flex;
        align-items: center;
    }

    .el-slider {
        flex-grow: 1;
        padding: 0 10px 0 0;
    }

    &.with-btn {
        .el-slider {
            padding: 0;
        }
    }
}

.expandContent {
    height: 420px;
    overflow: hidden;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
}

.page_content {
    width: 100%;

    .el-scrollbar {
        width: 100%;
        display: flex;
        justify-content: center;
        height: 360px;
    }
}

.page_content_item,
.page_content_item3 {
    width: 500px;
    height: 360px;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.page_content_item3 {
    width: 450px;
}

.row_scene_title {
    font-size: 16px;
    padding: 10px 15px;
}

.row_scene_item {
    align-items: center;
}

.row_scene_control {
    display: flex;
    width: 100%;
    align-items: center;
    padding: 10px 15px;
    box-sizing: border-box;

    & > .Sprite {
        margin: 0 5px;

        &:first-child {
            margin: 0;
        }
    }
}

.scene_control_btn_wrap {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    box-sizing: content-box;
    display: flex;
    justify-content: center;
    align-items: center;

    &.disabled {
        background-color: var(--btn-bg-disabled);
        border-color: var(--btn-border-disabled);
    }
}

.btn_auto_focus {
    margin: 0 0 0 10px;
}

.row_focus_model_tip {
    color: var(--color-error);
    line-height: 1.2;
    text-align: left;
}

.legend {
    &-icon {
        width: 20px;
        height: 20px;
        background-color: var(--primary);

        &.night {
            background-color: var(--content-border);
        }
    }

    &-text {
        margin: 0 20px 0 10px;
    }
}

.time-splitter {
    margin: 0 10px;
}
</style>
