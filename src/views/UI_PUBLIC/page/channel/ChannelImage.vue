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
                v-title
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
                        @change="changePaletteCode()"
                    />
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_BRIGHTNESS')"
                >
                    <BaseSliderInput
                        v-model="formData.bright"
                        :min="formData.brightMin"
                        :max="formData.brightMax"
                        :disabled="formData.disabled || formData.bright === undefined"
                        @change="changeHSL(formData.bright, formData.id, 'bright')"
                    />
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_CONTRAST')"
                >
                    <BaseSliderInput
                        v-model="formData.contrast"
                        :min="formData.contrastMin"
                        :max="formData.contrastMax"
                        :disabled="formData.disabled || formData.contrast === undefined"
                        @change="changeHSL(formData.contrast, formData.id, 'contrast')"
                    />
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_SATURATION')"
                >
                    <BaseSliderInput
                        v-model="formData.saturation"
                        :min="formData.saturationMin"
                        :max="formData.saturationMax"
                        :disabled="formData.disabled || formData.saturation === undefined"
                        @change="changeHSL(formData.saturation, formData.id, 'saturation')"
                    />
                </el-form-item>
                <el-form-item
                    v-show="!formData.isSupportThermal"
                    :label="Translate('IDCS_TONE')"
                >
                    <BaseSliderInput
                        v-model="formData.hue"
                        :min="formData.hueMin"
                        :max="formData.hueMax"
                        :disabled="formData.disabled || formData.hue === undefined"
                        @change="changeHSL(formData.hue, formData.id, 'hue')"
                    />
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
                        @click="showMore"
                    >
                        {{ Translate('IDCS_ADVANCED') }}
                    </el-button>
                    <el-button
                        :disabled="formData.disabled"
                        @click="resetData"
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
                    v-title
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
                                :min="row.brightMin"
                                :max="row.brightMax"
                                :disabled="row.disabled"
                                @blur="changeHSL(row.bright, row.id, 'bright')"
                                @keyup.enter="blurInput"
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
                                :min="row.contrastMin"
                                :max="row.contrastMax"
                                :disabled="row.disabled"
                                @blur="changeHSL(row.contrast, row.id, 'contrast')"
                                @keyup.enter="blurInput"
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
                                :min="row.saturationMin"
                                :max="row.saturationMax"
                                :disabled="row.disabled"
                                @blur="changeHSL(row.saturation, row.id, 'saturation')"
                                @keyup.enter="blurInput"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TONE')"
                        min-width="160"
                    >
                        <template #default="{ row }: TableColumn<ChannelImageDto>">
                            <span v-if="row.isSpeco"></span>
                            <span v-else-if="row.isSupportThermal || row.hue === undefined">--</span>
                            <BaseNumberInput
                                v-else
                                v-model="row.hue"
                                :min="row.hueMin"
                                :max="row.hueMax"
                                :disabled="row.disabled"
                                @blur="changeHSL(row.hue, row.id, 'hue')"
                                @keyup.enter="blurInput"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        type="expand"
                        :label="Translate('IDCS_ADVANCED')"
                        width="100"
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
                                                v-title
                                                :style="{
                                                    '--form-label-width': '200px',
                                                }"
                                            >
                                                <el-form-item :label="Translate('IDCS_CONFIG_FILE')">
                                                    <el-select-v2
                                                        v-model="row.cfgFile"
                                                        :disabled="!row.cfgFileList.length"
                                                        :options="row.cfgFileList"
                                                        @change="changeCfgFile"
                                                    />
                                                </el-form-item>
                                                <el-divider />
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-if="row.sharpenSwitchEnable || typeof row.sharpenSwitchEnable === 'undefined'"
                                                            v-model="row.sharpenSwitch"
                                                            :label="Translate('IDCS_SHARPNESS')"
                                                            :disabled="row.sharpen === undefined"
                                                            @change="setAZData()"
                                                        />
                                                        <span v-else>{{ Translate('IDCS_SHARPNESS') }}</span>
                                                    </template>
                                                    <BaseSliderInput
                                                        v-model="row.sharpen"
                                                        :disabled="!row.sharpenSwitch || row.sharpen === undefined"
                                                        :min="row.sharpenMin"
                                                        :max="row.sharpenMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="row.WDRSwitch"
                                                            :label="Translate('IDCS_WDR')"
                                                            :disabled="row.WDR === undefined"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <BaseSliderInput
                                                        v-model="row.WDR"
                                                        :disabled="!row.WDRSwitch || row.WDR === undefined"
                                                        :min="row.WDRMin"
                                                        :max="row.WDRMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="row.denoiseSwitch"
                                                            :label="Translate('IDCS_DENOISE')"
                                                            :disabled="row.denoise === undefined"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <BaseSliderInput
                                                        v-model="row.denoise"
                                                        :disabled="!row.denoiseSwitch || row.denoise === undefined"
                                                        :min="row.denoiseMin"
                                                        :max="row.denoiseMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item>
                                                    <template #label>
                                                        <el-checkbox
                                                            v-model="row.defogSwitch"
                                                            :label="Translate('IDCS_DEFOG')"
                                                            :disabled="row.defog === undefined"
                                                            @change="setAZData()"
                                                        />
                                                    </template>
                                                    <BaseSliderInput
                                                        v-model="row.defog"
                                                        :disabled="!row.defogSwitch || row.defog === undefined"
                                                        :min="row.defogMin"
                                                        :max="row.defogMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_IMAGE_SHIFT')">
                                                    <BaseSliderInput
                                                        v-model="row.imageShift"
                                                        :min="row.imageShiftMin"
                                                        :max="row.imageShiftMax"
                                                        show-control
                                                        :disabled="row.chlType !== 'analog' || row.imageShift === undefined"
                                                        @change="setAZData()"
                                                    />
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
                                                        :options="row.BLCModeList"
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
                                                        :options="row.HWDRLevelList"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_WB')">
                                                    <el-select-v2
                                                        v-model="row.whiteBalanceMode"
                                                        :disabled="row.whiteBalanceMode === undefined"
                                                        :options="row.whiteBalanceModeList"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_RED_GAIN')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.red"
                                                        :min="row.redMin"
                                                        :max="row.redMax"
                                                        :disabled="row.red === undefined"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whiteBalanceMode === 'manual'"
                                                    :label="Translate('IDCS_BLUE_GAIN')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.blue"
                                                        :min="row.blueMin"
                                                        :max="row.blueMax"
                                                        :disabled="row.blue === undefined"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_ANTI_FLICKER')">
                                                    <el-select-v2
                                                        v-model="row.antiflicker"
                                                        :disabled="row.antiflicker === undefined"
                                                        :options="row.antiflickerModeList"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.exposureModeList.length"
                                                    :label="Translate('IDCS_EXPOSURE_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.exposureMode"
                                                        :disabled="row.exposureMode === undefined"
                                                        :options="row.exposureModeList"
                                                        @change="changeExposureMode"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.exposureMode === 'manual'"
                                                    :label="Translate('IDCS_EXPOSURE_VALUE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.exposureMode"
                                                        :disabled="row.exposureMode === undefined"
                                                        :options="row.exposureList"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <!-- 1、NT2-3947 当有ShowGainMode字段且为false时，为4.2.1版本的ipc，认为不支持隐藏增益模式，，隐藏增益模式下拉框，否则认为是支持；2、协议返回增益模式的枚举只有一个，则为5.2版本的ipc，隐藏增益模式下拉框-->
                                                <el-form-item
                                                    v-if="row.ShowGainMode && row.gainModeList.length > 1"
                                                    :label="Translate('IDCS_GAIN_MODE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.gainMode"
                                                        :options="row.gainModeList"
                                                        :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.gainMode === '1'"
                                                    :label="Translate('IDCS_GAIN')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.gain"
                                                        :min="row.gainMin"
                                                        :max="row.gainMax"
                                                        :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.gainMode === '0'"
                                                    :label="Translate('IDCS_GAIN_LIMIT')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.gainAGC"
                                                        :min="row.gainMin"
                                                        :max="row.gainMax"
                                                        :disabled="row.BLCMode === 'HWDR' || (row.BLCMode !== 'HWDR' && row.gainMode === undefined)"
                                                        @change="setAZData()"
                                                    />
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
                                                        v-model="row.mirrorSwitch"
                                                        :disabled="row.mirrorSwitch === undefined"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
                                                        />
                                                    </el-radio-group>
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_FLIP')">
                                                    <el-radio-group
                                                        v-model="row.flipSwitch"
                                                        :disabled="row.flipSwitch === undefined"
                                                        @change="setAZData()"
                                                    >
                                                        <el-radio
                                                            v-for="item in pageData.switchOptions"
                                                            :key="item.label"
                                                            :value="item.value"
                                                            :label="item.label"
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
                                                        :options="row.IRCutModeList.length ? row.IRCutModeList : pageData.icCutModeOptions"
                                                        @change="setAZData()"
                                                    />
                                                    <el-select-v2
                                                        v-else-if="row.isSupportIRCutMode"
                                                        v-model="defaultIRCutMode"
                                                        :disabled="!row.isSupportIRCutMode"
                                                        :options="row.IRCutModeList.length ? row.IRCutModeList : pageData.icCutModeOptions"
                                                        @change="changeIRCutMode"
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
                                                        :options="row.IRCutConvSenList.length ? row.IRCutConvSenList : pageData.irCutConvSenOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'time' && row.IRCutDayTime !== undefined"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.IRCutDayTime"
                                                        :format="dateTime.hourMinuteFormat"
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
                                                        :format="dateTime.hourMinuteFormat"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.smartIrMode !== undefined"
                                                    :label="Translate('IDCS_SMART_IR')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.smartIrMode"
                                                        :options="row.SmartIrList"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.smartIrSwitch !== undefined"
                                                    :label="Translate('IDCS_SMART_IR')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.smartIrSwitch"
                                                        :options="pageData.switchOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.smartIrMode && row.smartIrSwitch"
                                                    :label="Translate('IDCS_GRADE')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.smartIrLevel"
                                                        :options="pageData.smartIrLevelOptions"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.smartIrSwitch !== undefined && row.smartIrMode === 'manual'"
                                                    :label="Translate('IDCS_LIGHT_LEVEL')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.lightLevel"
                                                        :min="row.lightLevelMin"
                                                        :max="row.lightLevelMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.isSupportIRCutMode && row.IRCutMode === 'auto' && row.delayTime !== undefined"
                                                    :label="Translate('IDCS_DELAY_TIME_SECOND')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.delayTime"
                                                        :min="row.delayTimeMin"
                                                        :max="row.delayTimeMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_SHUTTER_MODE')">
                                                    <el-select-v2
                                                        v-model="row.shutterMode"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterModeList"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.shutterMode !== undefined && row.shutterMode !== '0'"
                                                    :label="Translate('IDCS_SHUTTER')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.shutter"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterList"
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
                                                        :options="row.shutterList"
                                                        @change="changeShutterUpLimit"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.shutterMode !== undefined && row.shutterMode !== '1' && row.shutterLowLimit !== undefined"
                                                    :label="Translate('IDCS_SHUTTER_LOWER_LIMIT')"
                                                >
                                                    <el-select-v2
                                                        v-model="row.shutterLowLimit"
                                                        :disabled="row.shutterMode === undefined"
                                                        :options="row.shutterList"
                                                        @change="changeShutterLowLimit"
                                                    />
                                                </el-form-item>
                                                <el-form-item :label="Translate('IDCS_INFRARE_MODE')">
                                                    <el-select-v2
                                                        v-model="row.InfraredMode"
                                                        :disabled="row.InfraredMode === undefined"
                                                        :options="row.InfraredModeList"
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
                                                    v-if="row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_WHITE_STRENGTH')"
                                                >
                                                    <BaseSliderInput
                                                        v-model="row.whitelightStrength"
                                                        :min="row.whitelightStrengthMin"
                                                        :max="row.whitelightStrengthMax"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_START_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.whitelightOnTime"
                                                        :format="dateTime.hourMinuteFormat"
                                                        value-format="HH:mm"
                                                        @change="setAZData()"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.whitelightMode === 'manual'"
                                                    :label="Translate('IDCS_END_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.whitelightOffTime"
                                                        :format="dateTime.hourMinuteFormat"
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
                                                v-title
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
                                                        @change="changeProgram(row)"
                                                    />
                                                </el-form-item>
                                                <el-form-item
                                                    v-if="row.scheduleInfo.scheduleType === 'time'"
                                                    :label="Translate('IDCS_DN_DAY_TIME')"
                                                >
                                                    <el-time-picker
                                                        v-model="row.scheduleInfo.time"
                                                        is-range
                                                        range-separator="-"
                                                        value-format="HH:mm"
                                                        :format="dateTime.hourMinuteFormat"
                                                        @change="changeTimeType()"
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
                                                v-title
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
                                                        <BaseImgSpriteBtn
                                                            file="SpeedSlow"
                                                            :index="[1, 0, 2, 1]"
                                                            :disabled="!curLensCtrl.supportAz"
                                                        />
                                                    </div>
                                                    <BaseImgSprite file="arr_left" />
                                                    <div>{{ Translate('IDCS_ZOOM') }}</div>
                                                    <BaseImgSprite file="arr_right" />
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('ZoomIn', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSpriteBtn
                                                            file="SpeedQuick"
                                                            :index="[1, 0, 2, 1]"
                                                            :disabled="!curLensCtrl.supportAz"
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
                                                        <BaseImgSpriteBtn
                                                            file="SpeedSlow"
                                                            :index="[1, 0, 2, 1]"
                                                            :disabled="!curLensCtrl.supportAz"
                                                        />
                                                    </div>
                                                    <BaseImgSprite file="arr_left" />
                                                    <div>{{ Translate('IDCS_FOCUS') }}</div>
                                                    <BaseImgSprite file="arr_right" />
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                        @mousedown="addCmd('Near', curLensCtrl.id)"
                                                        @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                    >
                                                        <BaseImgSpriteBtn
                                                            file="SpeedQuick"
                                                            :index="[1, 0, 2, 1]"
                                                            :disabled="!curLensCtrl.supportAz"
                                                        />
                                                    </div>
                                                    <el-button
                                                        class="btn_auto_focus text-ellipsis"
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
                    @size-change="changePageSize"
                    @current-change="changePage"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelImage.v.ts"></script>

<style scoped lang="scss">
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
