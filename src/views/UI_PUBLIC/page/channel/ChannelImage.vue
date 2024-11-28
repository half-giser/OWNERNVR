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
            <div
                class="base-btn-box"
                span="2"
            >
                <div>
                    <div id="divTip"></div>
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
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
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
                        min-width="160"
                    />
                    <el-table-column
                        :label="Translate('IDCS_BRIGHTNESS')"
                        min-width="160"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="scope.row.bright"
                                :min="scope.row.brightMinValue"
                                :max="scope.row.brightMaxValue"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.bright, scope.row.id, 'bright')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CONTRAST')"
                        min-width="160"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="scope.row.contrast"
                                :min="scope.row.contrastMinValue"
                                :max="scope.row.contrastMaxValue"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.contrast, scope.row.id, 'contrast')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SATURATION')"
                        min-width="160"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="scope.row.saturation"
                                :min="scope.row.saturationMinValue"
                                :max="scope.row.saturationMaxValue"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.saturation, scope.row.id, 'saturation')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TONE')"
                        min-width="160"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal || scope.row.hue === -1">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="scope.row.hue"
                                :min="scope.row.hueMinValue"
                                :max="scope.row.hueMaxValue"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.hue, scope.row.id, 'hue')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        type="expand"
                        :label="Translate('IDCS_ADVANCED')"
                        min-width="160"
                    >
                        <template #default="scope">
                            <div class="expandContent">
                                <div class="page_content">
                                    <el-scrollbar>
                                        <div
                                            v-show="scope.row.activeTab === tabKeys.imageAdjust"
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
                                                        v-model="scope.row.cfgFile"
                                                        :disabled="scope.row.configFileTypeEnum.length === 0"
                                                        :options="scope.row.configFileTypeEnum"
                                                        @change="handleCfgFileChange"
                                                    />
                                                </el-form-item>
                                                <el-divider />
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-if="scope.row.sharpenSwitchEnable"
                                                            v-model="scope.row.sharpenSwitch"
                                                            :label="Translate('IDCS_SHARPNESS')"
                                                            :disabled="isNaN(scope.row.sharpenMaxValue)"
                                                            @change="setAZData()"
                                                        />
                                                        <span v-else>{{ Translate('IDCS_SHARPNESS') }}</span>
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.sharpenValue"
                                                            :disabled="!scope.row.sharpenSwitch || isNaN(scope.row.sharpenMaxValue)"
                                                            :min="isNaN(scope.row.sharpenMinValue) ? 0 : scope.row.sharpenMinValue"
                                                            :max="isNaN(scope.row.sharpenMaxValue) ? 100 : scope.row.sharpenMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="isNaN(scope.row.sharpenMaxValue) ? 0 : scope.row.sharpenValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="scope.row.WDRSwitch"
                                                            :label="Translate('IDCS_WDR')"
                                                            :disabled="isNaN(scope.row.WDRMaxValue)"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.WDRValue"
                                                            :disabled="!scope.row.WDRSwitch || isNaN(scope.row.WDRMaxValue)"
                                                            :min="isNaN(scope.row.WDRMinValue) ? 0 : scope.row.WDRMinValue"
                                                            :max="isNaN(scope.row.WDRMaxValue) ? 100 : scope.row.WDRMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="isNaN(scope.row.WDRMaxValue) ? 0 : scope.row.WDRValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="scope.row.denoiseSwitch"
                                                            :label="Translate('IDCS_DENOISE')"
                                                            :disabled="isNaN(scope.row.denoiseMaxValue)"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.denoiseValue"
                                                            :disabled="!scope.row.denoiseSwitch || isNaN(scope.row.denoiseMaxValue)"
                                                            :min="isNaN(scope.row.denoiseMinValue) ? 0 : scope.row.denoiseMinValue"
                                                            :max="isNaN(scope.row.denoiseMaxValue) ? 100 : scope.row.denoiseMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="isNaN(scope.row.denoiseMaxValue) ? 0 : scope.row.denoiseValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-if="scope.row.defogSwitch !== undefined"
                                                            v-model="scope.row.defogSwitch"
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
                                                        v-if="scope.row.defogSwitch !== undefined"
                                                        class="slider_wrap"
                                                    >
                                                        <el-slider
                                                            v-model="scope.row.defogValue"
                                                            :disabled="!scope.row.defogSwitch"
                                                            :min="isNaN(scope.row.defogMinValue) ? 0 : scope.row.defogMinValue"
                                                            :max="isNaN(scope.row.defogMaxValue) ? 100 : scope.row.defogMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.defogValue"
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
                                                            v-model="scope.row.imageValue"
                                                            :min="isNaN(scope.row.imageMinValue) ? 0 : scope.row.imageMinValue"
                                                            :max="isNaN(scope.row.imageMaxValue) ? 100 : scope.row.imageMaxValue"
                                                            :disabled="scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue)"
                                                            class="slider slider_sp"
                                                            @change="setAZData()"
                                                        />
                                                        <div class="custom_btn_slider_wrap">
                                                            <div
                                                                class="custom_btn_slider custom_btn_slider_decr"
                                                                :class="{ disabled: scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue) }"
                                                                @click="handleImageValueChange(-1)"
                                                            ></div>
                                                            <div
                                                                class="custom_btn_slider custom_btn_slider_incr"
                                                                :class="{ disabled: scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue) }"
                                                                @click="handleImageValueChange(1)"
                                                            ></div>
                                                        </div>
                                                        <el-input
                                                            :model-value="scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue) ? 0 : scope.row.imageValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_BACKLIGHT_COMPENSATION')">
                                                    <el-select-v2
                                                        v-if="scope.row.BLCMode === undefined || scope.row.chlType === 'analog'"
                                                        model-value="OFF"
                                                        :options="[]"
                                                        disabled
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        v-model="scope.row.BLCMode"
                                                        :options="scope.row.BLCModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.BLCMode === 'HWDR'"
                                                    :label="Translate('IDCS_GRADE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.HWDRLevel"
                                                        :disabled="scope.row.HWDRLevel === undefined"
                                                        :options="scope.row.HWDRLevelArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_WB')">
                                                    <el-select-v2
                                                        v-model="scope.row.whiteBalanceMode"
                                                        :disabled="scope.row.whiteBalanceMode === undefined"
                                                        :options="scope.row.whiteBalanceModeEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_RED_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.redValue"
                                                            :min="isNaN(scope.row.redMinValue) ? 0 : scope.row.redMinValue"
                                                            :max="isNaN(scope.row.redMaxValue) ? 100 : scope.row.redMaxValue"
                                                            :disabled="isNaN(scope.row.redMaxValue)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="isNaN(scope.row.redMaxValue) ? 0 : scope.row.redValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_BLUE_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.blueValue"
                                                            :min="isNaN(scope.row.blueMinValue) ? 0 : scope.row.blueMinValue"
                                                            :max="isNaN(scope.row.blueMaxValue) ? 100 : scope.row.blueMaxValue"
                                                            :disabled="isNaN(scope.row.blueMaxValue)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="isNaN(scope.row.blueMaxValue) ? 0 : scope.row.blueValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_ANTI_FLICKER')">
                                                    <el-select-v2
                                                        v-model="scope.row.antiflicker"
                                                        :disabled="scope.row.antiflicker === undefined"
                                                        :options="scope.row.antiflickerModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.exposureModeArray.length > 0"
                                                    :label="Translate('IDCS_EXPOSURE_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.exposureMode"
                                                        :disabled="scope.row.exposureMode === undefined"
                                                        :options="scope.row.exposureModeArray"
                                                        @change="handleExposureModeChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.exposureMode === 'manual'"
                                                    :label="Translate('IDCS_EXPOSURE_VALUE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.exposureModeValue"
                                                        :disabled="scope.row.exposureModeValue === undefined"
                                                        :options="scope.row.exposureValueArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <!-- 1、NT2-3947 当有ShowGainMode字段且为false时，为4.2.1版本的ipc，认为不支持隐藏增益模式，，隐藏增益模式下拉框，否则认为是支持；2、协议返回增益模式的枚举只有一个，则为5.2版本的ipc，隐藏增益模式下拉框-->
                                                <el-form-item
                                                    v-if="scope.row.ShowGainMode && scope.row.gainModeEnum.length > 1"
                                                    :label="Translate('IDCS_GAIN_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.gainMode"
                                                        :options="scope.row.gainModeEnum"
                                                        :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.gainMode === '1'"
                                                    :label="Translate('IDCS_GAIN')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.gainValue"
                                                            :min="isNaN(scope.row.gainMinValue) ? 0 : scope.row.gainMinValue"
                                                            :max="isNaN(scope.row.gainMaxValue) ? 100 : scope.row.gainMaxValue"
                                                            :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.gainValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.gainMode === '0'"
                                                    :label="Translate('IDCS_GAIN_LIMIT')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.gainAGC"
                                                            :min="isNaN(scope.row.gainMinValue) ? 0 : scope.row.gainMinValue"
                                                            :max="isNaN(scope.row.gainMaxValue) ? 100 : scope.row.gainMaxValue"
                                                            :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.gainAGC"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.isSupportHallway"
                                                    :label="Translate('IDCS_CORRIDOR_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.imageRotate"
                                                        :options="pageData.imgRotateOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_MIRROR')">
                                                    <el-radio-group
                                                        v-if="scope.row.mirrorSwitch !== undefined"
                                                        v-model="scope.row.mirrorSwitch"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="scope.row.mirrorSwitch === undefined"
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
                                                            :disabled="scope.row.mirrorSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_FLIP')">
                                                    <el-radio-group
                                                        v-if="scope.row.flipSwitch !== undefined"
                                                        v-model="scope.row.flipSwitch"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :disabled="scope.row.flipSwitch === undefined"
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
                                                            :disabled="scope.row.flipSwitch === undefined"
                                                        />
                                                    </el-radio-group>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.HFR !== undefined"
                                                    :label="Translate('IDCS_HFR')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.HFR"
                                                        :options="pageData.switchOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_DN_MODE')">
                                                    <el-select-v2
                                                        v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode !== undefined"
                                                        v-model="scope.row.IRCutMode"
                                                        :disabled="!scope.row.isSupportIRCutMode"
                                                        :options="scope.row.IRCutModeArray.length ? scope.row.IRCutModeArray : pageData.icCutModeOptions"
                                                        @change="setAZData()"
                                                    />
                                                    <el-select-v2
                                                        v-else-if="scope.row.isSupportIRCutMode"
                                                        v-model="defaultIRCutMode"
                                                        :disabled="!scope.row.isSupportIRCutMode"
                                                        :options="scope.row.IRCutModeArray.length ? scope.row.IRCutModeArray : pageData.icCutModeOptions"
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
                                                    v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'auto' && scope.row.IRCutConvSen2 !== undefined"
                                                    :label="Translate('IDCS_DN_SEN')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.IRCutConvSen"
                                                        :disabled="!scope.row.isSupportIRCutMode"
                                                        :options="scope.row.IRCutConvSenArray.length ? scope.row.IRCutConvSenArray : pageData.irCutConvSenOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'time' && scope.row.IRCutDayTime !== undefined"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="scope.row.IRCutDayTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'time' && scope.row.IRCutNightTime !== undefined"
                                                    :label="Translate('IDCS_DN_NIGHT_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="scope.row.IRCutNightTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined"
                                                    :label="Translate('IDCS_SMART_IR')"
                                                >
                                                    <el-select-v2
                                                        v-if="scope.row.smartIrMode"
                                                        v-model="scope.row.smartIrMode"
                                                        :options="scope.row.SmartIrArray"
                                                    />
                                                    <el-select-v2
                                                        v-else
                                                        v-model="scope.row.smartIrSwitch"
                                                        :options="pageData.switchOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="(scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined) && scope.row.smartIrSwitch"
                                                    :label="Translate('IDCS_GRADE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.smartIrLevel"
                                                        :options="pageData.smartIrLevelOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="(scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined) && scope.row.smartIrMode === 'manual'"
                                                    :label="Translate('IDCS_LIGHT_LEVEL')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.lightLevelValue"
                                                            :min="isNaN(scope.row.lightLevelMinValue) ? 0 : scope.row.lightLevelMinValue"
                                                            :max="isNaN(scope.row.lightLevelMaxValue) ? 100 : scope.row.lightLevelMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.lightLevelValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'auto' && !isNaN(scope.row.delayTimeValue)"
                                                    :label="Translate('IDCS_DELAY_TIME_SECOND')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.delayTimeValue"
                                                            :min="isNaN(scope.row.delayTimeMinValue) ? 0 : scope.row.delayTimeMinValue"
                                                            :max="isNaN(scope.row.delayTimeMaxValue) ? 100 : scope.row.delayTimeMaxValue"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.delayTimeValue"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_SHUTTER_MODE')">
                                                    <el-select-v2
                                                        v-model="scope.row.shutterMode"
                                                        :disabled="scope.row.shutterMode === undefined"
                                                        :options="scope.row.shutterModeEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '0'"
                                                    :label="Translate('IDCS_SHUTTER')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.shutterValue"
                                                        :disabled="scope.row.shutterMode === undefined"
                                                        :options="scope.row.shutterValueEnum"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '1' && scope.row.shutterUpLimit !== undefined"
                                                    :label="Translate('IDCS_SHUTTER_UPPER_LIMIT')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.shutterUpLimit"
                                                        :disabled="scope.row.shutterMode === undefined"
                                                        :options="scope.row.shutterValueEnum"
                                                        @change="handleShutterUpLimitChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '1' && scope.row.shutterLowLimit !== undefined"
                                                    :label="Translate('IDCS_SHUTTER_LOWER_LIMIT')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.shutterLowLimit"
                                                        :disabled="scope.row.shutterMode === undefined"
                                                        :options="scope.row.shutterValueEnum"
                                                        @change="handleShutterLowLimitChange"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_INFRARE_MODE')">
                                                    <el-select-v2
                                                        v-model="scope.row.InfraredMode"
                                                        :disabled="scope.row.InfraredMode === undefined"
                                                        :options="scope.row.InfraredModeArray"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whitelightMode"
                                                    :label="Translate('IDCS_WHITE_LIGHT')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.whitelightMode"
                                                        :options="pageData.whitelightModeOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whitelightMode && scope.row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_WHITE_STRENGTH')"
                                                >
                                                    <div class="slider_wrap">
                                                        <el-slider
                                                            v-model="scope.row.whitelightStrength"
                                                            :min="isNaN(scope.row.whitelightStrengthMin) ? 0 : scope.row.whitelightStrengthMin"
                                                            :max="isNaN(scope.row.whitelightStrengthMax) ? 100 : scope.row.whitelightStrengthMax"
                                                            @change="setAZData()"
                                                        />
                                                        <el-input
                                                            :model-value="scope.row.whitelightStrength"
                                                            readonly
                                                        />
                                                    </div>
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whitelightMode && scope.row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_START_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="scope.row.whitelightOnTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.whitelightMode && scope.row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_END_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="scope.row.whitelightOffTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                            </el-form>
                                        </div>
                                        <div
                                            v-show="scope.row.activeTab === tabKeys.scheduleCtrl"
                                            class="page_content_item"
                                        >
                                            <el-form
                                                :style="{
                                                    '--form-label-width': '150px',
                                                }"
                                            >
                                                <el-form-item :label="Translate('IDCS_SCHEDULE')">
                                                    <el-select-v2
                                                        v-model="scope.row.scheduleInfo.scheduleType"
                                                        :disabled="!scope.row.supportSchedule"
                                                        :options="filteredScheduleInfoEnum(scope.row.scheduleInfo.scheduleInfoEnum, false)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.scheduleInfo.scheduleType !== 'time'"
                                                    :label="Translate('IDCS_CONFIG_FILE')"
                                                >
                                                    <el-select-v2
                                                        v-model="scope.row.scheduleInfo.program"
                                                        :disabled="!scope.row.supportSchedule"
                                                        :options="filteredScheduleInfoEnum(scope.row.scheduleInfo.scheduleInfoEnum, true)"
                                                        @change="handleProgramChange(scope.row)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="scope.row.scheduleInfo.scheduleType === 'time'"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                    :style="{
                                                        '--form-input-width': '125px',
                                                    }"
                                                >
                                                    <el-time-picker
                                                        v-model="scope.row.scheduleInfo.dayTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="handleChangeTime('day')"
                                                    />
                                                    <el-text class="time-splitter"> -- </el-text>
                                                    <el-time-picker
                                                        v-model="scope.row.scheduleInfo.nightTime"
                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                        value-format="HH:mm"
                                                        :clearable="false"
                                                        @change="handleChangeTime('night')"
                                                    />
                                                </el-form-item>
                                                <div
                                                    v-if="scope.row.scheduleInfo.scheduleType === 'time'"
                                                    class="base-btn-box"
                                                    span="center"
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
                                                    v-if="scope.row.scheduleInfo.scheduleType === 'time'"
                                                    class="base-btn-box"
                                                    span="center"
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
                                            v-show="scope.row.activeTab === tabKeys.sceneCtrl"
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
                                            <div
                                                class="base-btn-box"
                                                span="2"
                                            >
                                                <div>
                                                    <div id="divLensTip"></div>
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
                                <div
                                    class="base-btn-box"
                                    span="center"
                                >
                                    <el-radio-group v-model="scope.row.activeTab">
                                        <el-radio-button
                                            v-for="item in tabs"
                                            :key="item.key"
                                            :value="item.key"
                                            >{{ Translate(item.text) }}</el-radio-button
                                        >
                                    </el-radio-group>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <el-pagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
        <BaseFloatError
            v-model:message="floatErrorMessage"
            :to="floatErrorTo"
            :type="floatErrorType"
        />
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
