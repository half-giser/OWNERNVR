<template>
    <div id="ChannelImage">
        <div class="main">
            <div class="left">
                <div class="playerWrap">
                    <BaseVideoPlayer
                        ref="playerRef"
                        :split="1"
                        @onready="onReady"
                    />
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
                            fit-input-width
                            @change="handleChlSel"
                        >
                            <el-option
                                v-for="(item, index) in tableData"
                                :key="index"
                                :value="item.id"
                                :label="item.name || ' '"
                                :title="item.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        v-show="formData.isSupportThermal"
                        :label="Translate('IDCS_COLOR_CODE')"
                    >
                        <el-select
                            v-model="formData.paletteCode"
                            placeholder=" "
                            fit-input-width
                            :disabled="formData.disabled"
                            @change="handlePaletteCode()"
                        >
                            <el-option
                                v-for="(item, index) in formData.paletteList"
                                :key="index"
                                :value="item.value"
                                :label="item.text"
                                :title="item.name"
                            />
                        </el-select>
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
                                class="slider"
                                @change="handleInputChange(formData.bright, formData.id, 'bright')"
                            />
                            <div>
                                <el-input
                                    v-model="formData.bright"
                                    readonly
                                    class="custom_slider_input"
                                />
                            </div>
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
                                class="slider"
                                @change="handleInputChange(formData.contrast, formData.id, 'contrast')"
                            />
                            <div>
                                <el-input
                                    v-model="formData.contrast"
                                    readonly
                                    class="custom_slider_input"
                                />
                            </div>
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
                                class="slider"
                                @change="handleInputChange(formData.saturation, formData.id, 'saturation')"
                            />
                            <div>
                                <el-input
                                    v-model="formData.saturation"
                                    readonly
                                    class="custom_slider_input"
                                />
                            </div>
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
                                class="slider"
                                @change="handleInputChange(formData.hue, formData.id, 'hue')"
                            />
                            <div>
                                <el-input
                                    v-if="formData.hue !== -1"
                                    v-model="formData.hue"
                                    readonly
                                    class="custom_slider_input"
                                />
                                <div
                                    v-else
                                    class="empty_content"
                                ></div>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
                <el-row>
                    <el-col
                        :span="12"
                        class="el-col-tip"
                    >
                        <div id="divTip"></div>
                    </el-col>
                    <el-col
                        :span="12"
                        class="el-col-flex-end"
                    >
                        <el-button
                            :disabled="formData.disabled || formData.isSupportThermal"
                            @click="handleAdvanced"
                            >{{ Translate('IDCS_ADVANCED') }}</el-button
                        >
                        <el-button
                            :disabled="formData.disabled"
                            @click="handleRestoreVal"
                            >{{ Translate('IDCS_RESTORE_VALUE') }}</el-button
                        >
                    </el-col>
                </el-row>
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
                    :row-key="(row) => row.id"
                    :expand-row-keys="expandedRowKeys"
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
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
                        min-width="160px"
                    />
                    <el-table-column
                        :label="Translate('IDCS_BRIGHTNESS')"
                        min-width="160px"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <el-input-number
                                v-else
                                v-model="scope.row.bright"
                                :min="scope.row.brightMinValue"
                                :max="scope.row.brightMaxValue"
                                value-on-clear="min"
                                :controls="false"
                                size="small"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.bright, scope.row.id, 'bright')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CONTRAST')"
                        min-width="160px"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <el-input-number
                                v-else
                                v-model="scope.row.contrast"
                                :min="scope.row.contrastMinValue"
                                :max="scope.row.contrastMaxValue"
                                value-on-clear="min"
                                :controls="false"
                                size="small"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.contrast, scope.row.id, 'contrast')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SATURATION')"
                        min-width="160px"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal">--</span>
                            <el-input-number
                                v-else
                                v-model="scope.row.saturation"
                                :min="scope.row.saturationMinValue"
                                :max="scope.row.saturationMaxValue"
                                value-on-clear="min"
                                :controls="false"
                                size="small"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.saturation, scope.row.id, 'saturation')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TONE')"
                        min-width="160px"
                    >
                        <template #default="scope">
                            <span v-if="scope.row.isSpeco"></span>
                            <span v-else-if="scope.row.isSupportThermal || scope.row.hue === -1">--</span>
                            <el-input-number
                                v-else
                                v-model="scope.row.hue"
                                :min="scope.row.hueMinValue"
                                :max="scope.row.hueMaxValue"
                                value-on-clear="min"
                                :controls="false"
                                size="small"
                                :disabled="scope.row.disabled"
                                @change="handleInputChange(scope.row.hue, scope.row.id, 'hue')"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        type="expand"
                        :label="Translate('IDCS_ADVANCED')"
                        min-width="160px"
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
                                                :model="scope.row"
                                            >
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_CONFIG_FILE') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.cfgFile"
                                                                placeholder=" "
                                                                :disabled="scope.row.configFileTypeEnum.length === 0"
                                                                @change="handleCfgFileChange"
                                                            >
                                                                <el-option
                                                                    v-for="item in scope.row.configFileTypeEnum"
                                                                    :key="item"
                                                                    :value="item"
                                                                    :label="configFileTypeMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row class="row_divide"></el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        <el-checkbox
                                                            v-if="scope.row.sharpenSwitchEnable"
                                                            v-model="scope.row.sharpenSwitch"
                                                            :label="Translate('IDCS_SHARPNESS')"
                                                            :disabled="isNaN(scope.row.sharpenMaxValue)"
                                                            @change="setAZData()"
                                                        ></el-checkbox>
                                                        <span v-else>{{ Translate('IDCS_SHARPNESS') }}</span>
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.sharpenValue"
                                                                    :disabled="!scope.row.sharpenSwitch || isNaN(scope.row.sharpenMaxValue)"
                                                                    :min="isNaN(scope.row.sharpenMinValue) ? 0 : scope.row.sharpenMinValue"
                                                                    :max="isNaN(scope.row.sharpenMaxValue) ? 100 : scope.row.sharpenMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-if="isNaN(scope.row.sharpenMaxValue)"
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                    <el-input
                                                                        v-else
                                                                        v-model="scope.row.sharpenValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        <el-checkbox
                                                            v-model="scope.row.WDRSwitch"
                                                            :label="Translate('IDCS_WDR')"
                                                            :disabled="isNaN(scope.row.WDRMaxValue)"
                                                            @change="setAZData()"
                                                        ></el-checkbox>
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.WDRValue"
                                                                    :disabled="!scope.row.WDRSwitch || isNaN(scope.row.WDRMaxValue)"
                                                                    :min="isNaN(scope.row.WDRMinValue) ? 0 : scope.row.WDRMinValue"
                                                                    :max="isNaN(scope.row.WDRMaxValue) ? 100 : scope.row.WDRMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-if="isNaN(scope.row.WDRMaxValue)"
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                    <el-input
                                                                        v-else
                                                                        v-model="scope.row.WDRValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        <el-checkbox
                                                            v-model="scope.row.denoiseSwitch"
                                                            :label="Translate('IDCS_DENOISE')"
                                                            :disabled="isNaN(scope.row.denoiseMaxValue)"
                                                            @change="setAZData()"
                                                        ></el-checkbox>
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.denoiseValue"
                                                                    :disabled="!scope.row.denoiseSwitch || isNaN(scope.row.denoiseMaxValue)"
                                                                    :min="isNaN(scope.row.denoiseMinValue) ? 0 : scope.row.denoiseMinValue"
                                                                    :max="isNaN(scope.row.denoiseMaxValue) ? 100 : scope.row.denoiseMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-if="isNaN(scope.row.denoiseMaxValue)"
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                    <el-input
                                                                        v-else
                                                                        v-model="scope.row.denoiseValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        <el-checkbox
                                                            v-if="scope.row.defogSwitch !== undefined"
                                                            v-model="scope.row.defogSwitch"
                                                            :label="Translate('IDCS_DEFOG')"
                                                            @change="setAZData()"
                                                        ></el-checkbox>
                                                        <el-checkbox
                                                            v-else
                                                            :label="Translate('IDCS_DEFOG')"
                                                            disabled
                                                        ></el-checkbox>
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div
                                                                v-if="scope.row.defogSwitch !== undefined"
                                                                class="slider_wrap"
                                                            >
                                                                <el-slider
                                                                    v-model="scope.row.defogValue"
                                                                    :disabled="!scope.row.defogSwitch"
                                                                    :min="isNaN(scope.row.defogMinValue) ? 0 : scope.row.defogMinValue"
                                                                    :max="isNaN(scope.row.defogMaxValue) ? 100 : scope.row.defogMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.defogValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div
                                                                v-else
                                                                class="slider_wrap"
                                                            >
                                                                <el-slider
                                                                    disabled
                                                                    class="slider"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_IMAGE_SHIFT') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.imageValue"
                                                                    :min="isNaN(scope.row.imageMinValue) ? 0 : scope.row.imageMinValue"
                                                                    :max="isNaN(scope.row.imageMaxValue) ? 100 : scope.row.imageMaxValue"
                                                                    :disabled="scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue)"
                                                                    class="slider slider_sp"
                                                                    @change="setAZData()"
                                                                />
                                                                <div class="slider_opertion">
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
                                                                    <div>
                                                                        <el-input
                                                                            v-if="scope.row.chlType !== 'analog' || isNaN(scope.row.imageMaxValue)"
                                                                            :value="0"
                                                                            readonly
                                                                            class="custom_slider_input custom_slider_input_sp"
                                                                        />
                                                                        <el-input
                                                                            v-else
                                                                            v-model="scope.row.imageValue"
                                                                            readonly
                                                                            class="custom_slider_input custom_slider_input_sp"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_BACKLIGHT_COMPENSATION') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-if="scope.row.BLCMode === undefined || scope.row.chlType === 'analog'"
                                                                placeholder=" "
                                                                value="OFF"
                                                                disabled
                                                            >
                                                                <el-option
                                                                    value="OFF"
                                                                    label="OFF"
                                                                />
                                                            </el-select>
                                                            <el-select
                                                                v-else
                                                                v-model="scope.row.BLCMode"
                                                                placeholder=" "
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.BLCModeArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="BLCMode[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.BLCMode === 'HWDR'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_GRADE') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.HWDRLevel"
                                                                :disabled="scope.row.HWDRLevel === undefined"
                                                                placeholder=" "
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.HWDRLevelArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="HWDRLevel[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_WB') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.whiteBalanceMode"
                                                                placeholder=" "
                                                                :disabled="scope.row.whiteBalanceMode === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.whiteBalanceModeEnum"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="whiteBalanceMode[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whiteBalanceMode === 'manual'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_RED_GAIN') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.redValue"
                                                                    :min="isNaN(scope.row.redMinValue) ? 0 : scope.row.redMinValue"
                                                                    :max="isNaN(scope.row.redMaxValue) ? 100 : scope.row.redMaxValue"
                                                                    :disabled="isNaN(scope.row.redMaxValue)"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-if="isNaN(scope.row.redMaxValue)"
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                    <el-input
                                                                        v-else
                                                                        v-model="scope.row.redValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whiteBalanceMode === 'manual'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_BLUE_GAIN') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.blueValue"
                                                                    :min="isNaN(scope.row.blueMinValue) ? 0 : scope.row.blueMinValue"
                                                                    :max="isNaN(scope.row.blueMaxValue) ? 100 : scope.row.blueMaxValue"
                                                                    :disabled="isNaN(scope.row.blueMaxValue)"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-if="isNaN(scope.row.blueMaxValue)"
                                                                        :value="0"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                    <el-input
                                                                        v-else
                                                                        v-model="scope.row.blueValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_ANTI_FLICKER') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.antiflicker"
                                                                placeholder=" "
                                                                :disabled="scope.row.antiflicker === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.antiflickerModeArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="antiFlickerMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.exposureModeArray.length > 0">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_EXPOSURE_MODE') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.exposureMode"
                                                                placeholder=" "
                                                                :disabled="scope.row.exposureMode === undefined"
                                                                @change="handleExposureModeChange"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.exposureModeArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="exposureModeMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.exposureMode === 'manual'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_EXPOSURE_VALUE') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.exposureModeValue"
                                                                placeholder=" "
                                                                :disabled="scope.row.exposureModeValue === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.exposureValueArray"
                                                                    :key="index"
                                                                    :value="Math.floor(scope.row.exposureModeMaxValue / (item === '1' ? 1 : parseInt(item.split('/')[1])))"
                                                                    :label="item"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <!-- 1、NT2-3947 当有ShowGainMode字段且为false时，为4.2.1版本的ipc，认为不支持隐藏增益模式，，隐藏增益模式下拉框，否则认为是支持；2、协议返回增益模式的枚举只有一个，则为5.2版本的ipc，隐藏增益模式下拉框-->
                                                <el-row v-if="scope.row.ShowGainMode && scope.row.gainModeEnum.length > 1">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                        >{{ Translate('IDCS_GAIN_MODE') }}</el-col
                                                    >
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.gainMode"
                                                                placeholder=" "
                                                                :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.gainModeEnum"
                                                                    :key="index"
                                                                    :value="index.toString()"
                                                                    :label="exposureModeMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.gainMode === '1'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_GAIN') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.gainValue"
                                                                    :min="isNaN(scope.row.gainMinValue) ? 0 : scope.row.gainMinValue"
                                                                    :max="isNaN(scope.row.gainMaxValue) ? 100 : scope.row.gainMaxValue"
                                                                    :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.gainValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.gainMode === '0'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_GAIN_LIMIT') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.gainAGC"
                                                                    :min="isNaN(scope.row.gainMinValue) ? 0 : scope.row.gainMinValue"
                                                                    :max="isNaN(scope.row.gainMaxValue) ? 100 : scope.row.gainMaxValue"
                                                                    :disabled="scope.row.BLCMode === 'HWDR' || (scope.row.BLCMode !== 'HWDR' && scope.row.gainMode === undefined)"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.gainAGC"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.isSupportHallway">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_CORRIDOR_MODE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.imageRotate"
                                                                placeholder=" "
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in [0, 90, 180, 270]"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="item"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_MIRROR') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-radio-group
                                                                v-if="scope.row.mirrorSwitch !== undefined"
                                                                v-model="scope.row.mirrorSwitch"
                                                                @change="setAZData()"
                                                            >
                                                                <el-radio
                                                                    :value="true"
                                                                    :disabled="scope.row.mirrorSwitch === undefined"
                                                                    >{{ Translate('IDCS_ON') }}</el-radio
                                                                >
                                                                <el-radio
                                                                    :value="false"
                                                                    :disabled="scope.row.mirrorSwitch === undefined"
                                                                    >{{ Translate('IDCS_OFF') }}</el-radio
                                                                >
                                                            </el-radio-group>
                                                            <el-radio-group
                                                                v-else
                                                                v-model="defaultRadioVal"
                                                            >
                                                                <el-radio
                                                                    :value="true"
                                                                    :disabled="scope.row.mirrorSwitch === undefined"
                                                                    >{{ Translate('IDCS_ON') }}</el-radio
                                                                >
                                                                <el-radio
                                                                    :value="false"
                                                                    :disabled="scope.row.mirrorSwitch === undefined"
                                                                    >{{ Translate('IDCS_OFF') }}</el-radio
                                                                >
                                                            </el-radio-group>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_FLIP') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-radio-group
                                                                v-if="scope.row.flipSwitch !== undefined"
                                                                v-model="scope.row.flipSwitch"
                                                                @change="setAZData()"
                                                            >
                                                                <el-radio
                                                                    :value="true"
                                                                    :disabled="scope.row.flipSwitch === undefined"
                                                                    >{{ Translate('IDCS_ON') }}</el-radio
                                                                >
                                                                <el-radio
                                                                    :value="false"
                                                                    :disabled="scope.row.flipSwitch === undefined"
                                                                    >{{ Translate('IDCS_OFF') }}</el-radio
                                                                >
                                                            </el-radio-group>
                                                            <el-radio-group
                                                                v-else
                                                                v-model="defaultRadioVal"
                                                            >
                                                                <el-radio
                                                                    :value="true"
                                                                    :disabled="scope.row.flipSwitch === undefined"
                                                                    >{{ Translate('IDCS_ON') }}</el-radio
                                                                >
                                                                <el-radio
                                                                    :value="false"
                                                                    :disabled="scope.row.flipSwitch === undefined"
                                                                    >{{ Translate('IDCS_OFF') }}</el-radio
                                                                >
                                                            </el-radio-group>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.HFR !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_HFR') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.HFR"
                                                                placeholder=" "
                                                                @change="setAZData()"
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
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DN_MODE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div
                                                                v-if="scope.row.isSupportIRCutMode"
                                                                class="custom_ir_cut_mode"
                                                            >
                                                                <el-select
                                                                    v-if="scope.row.IRCutMode !== undefined"
                                                                    v-model="scope.row.IRCutMode"
                                                                    placeholder=" "
                                                                    :disabled="!scope.row.isSupportIRCutMode"
                                                                    @change="setAZData()"
                                                                >
                                                                    <div v-if="scope.row.IRCutModeArray.length > 0">
                                                                        <div
                                                                            v-for="(item, index) in scope.row.IRCutModeArray"
                                                                            :key="index"
                                                                        >
                                                                            <el-option
                                                                                v-if="DayNightModeMap[item] !== undefined"
                                                                                :value="item"
                                                                                :label="DayNightModeMap[item]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div v-else>
                                                                        <el-option
                                                                            v-for="(item, index) in ['auto', 'day', 'night', 'time']"
                                                                            :key="index"
                                                                            :value="item"
                                                                            :label="DayNightModeMap[item]"
                                                                        />
                                                                    </div>
                                                                </el-select>
                                                                <el-select
                                                                    v-else
                                                                    v-model="defaultIRCutMode"
                                                                    placeholder=" "
                                                                    :disabled="!scope.row.isSupportIRCutMode"
                                                                    @change="handleIRCutModeChange"
                                                                >
                                                                    <div v-if="scope.row.IRCutModeArray.length > 0">
                                                                        <div
                                                                            v-for="(item, index) in scope.row.IRCutModeArray"
                                                                            :key="index"
                                                                        >
                                                                            <el-option
                                                                                v-if="DayNightModeMap[item] !== undefined"
                                                                                :value="item"
                                                                                :label="DayNightModeMap[item]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div v-else>
                                                                        <el-option
                                                                            v-for="(item, index) in ['auto', 'day', 'night', 'time']"
                                                                            :key="index"
                                                                            :value="item"
                                                                            :label="DayNightModeMap[item]"
                                                                        />
                                                                    </div>
                                                                </el-select>
                                                            </div>

                                                            <el-select
                                                                v-else
                                                                placeholder=" "
                                                                disabled
                                                            ></el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'auto' && scope.row.IRCutConvSen2 !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DN_SEN') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.IRCutConvSen"
                                                                placeholder=" "
                                                                :disabled="!scope.row.isSupportIRCutMode"
                                                                @change="setAZData()"
                                                            >
                                                                <div v-if="scope.row.IRCutConvSenArray.length !== 0">
                                                                    <el-option
                                                                        v-for="(item, index) in scope.row.IRCutConvSenArray"
                                                                        :key="index"
                                                                        :value="item"
                                                                        :label="SensortyMap[item]"
                                                                    />
                                                                </div>
                                                                <div v-if="scope.row.IRCutConvSenArray.length === 0">
                                                                    <el-option
                                                                        v-for="(item, index) in ['high', 'mid', 'low']"
                                                                        :key="index"
                                                                        :value="item"
                                                                        :label="SensortyMap[item]"
                                                                    />
                                                                </div>
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'time' && scope.row.IRCutDayTime !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DN_DAY_TIME') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-input />
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'time' && scope.row.IRCutNightTime !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DN_NIGHT_TIME') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-input />
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SMART_IR') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-if="scope.row.smartIrMode"
                                                                v-model="scope.row.smartIrMode"
                                                                placeholder=" "
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.SmartIrArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="SmartIRMap[item]"
                                                                />
                                                            </el-select>
                                                            <el-select
                                                                v-else
                                                                v-model="scope.row.smartIrSwitch"
                                                                placeholder=" "
                                                                @change="setAZData()"
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
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="(scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined) && scope.row.smartIrSwitch">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_GRADE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.smartIrLevel"
                                                                placeholder=" "
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    value="2"
                                                                    :label="Translate('IDCS_DN_SEN_HIGH')"
                                                                />
                                                                <el-option
                                                                    value="1"
                                                                    :label="Translate('IDCS_DN_SEN_MID')"
                                                                />
                                                                <el-option
                                                                    value="0"
                                                                    :label="Translate('IDCS_DN_SEN_LOW')"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="(scope.row.smartIrMode || scope.row.smartIrSwitch !== undefined) && scope.row.smartIrMode === 'manual'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_LIGHT_LEVEL') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.lightLevelValue"
                                                                    :min="isNaN(scope.row.lightLevelMinValue) ? 0 : scope.row.lightLevelMinValue"
                                                                    :max="isNaN(scope.row.lightLevelMaxValue) ? 100 : scope.row.lightLevelMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.lightLevelValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.isSupportIRCutMode && scope.row.IRCutMode === 'auto' && !isNaN(scope.row.delayTimeValue)">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DELAY_TIME_SECOND') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.delayTimeValue"
                                                                    :min="isNaN(scope.row.delayTimeMinValue) ? 0 : scope.row.delayTimeMinValue"
                                                                    :max="isNaN(scope.row.delayTimeMaxValue) ? 100 : scope.row.delayTimeMaxValue"
                                                                    class="slider"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.delayTimeValue"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SHUTTER_MODE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.shutterMode"
                                                                placeholder=" "
                                                                :disabled="scope.row.shutterMode === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.shutterModeEnum"
                                                                    :key="index"
                                                                    :value="index.toString()"
                                                                    :label="exposureModeMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '0'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SHUTTER') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.shutterValue"
                                                                placeholder=" "
                                                                :disabled="scope.row.shutterMode === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.shutterValueEnum"
                                                                    :key="index"
                                                                    :value="index.toString()"
                                                                    :label="item"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '1' && scope.row.shutterUpLimit !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SHUTTER_UPPER_LIMIT') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.shutterUpLimit"
                                                                placeholder=" "
                                                                :disabled="scope.row.shutterMode === undefined"
                                                                @change="handleShutterUpLimitChange"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.shutterValueEnum"
                                                                    :key="index"
                                                                    :value="index.toString()"
                                                                    :label="item"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.shutterMode !== undefined && scope.row.shutterMode !== '1' && scope.row.shutterLowLimit !== undefined">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SHUTTER_LOWER_LIMIT') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.shutterLowLimit"
                                                                placeholder=" "
                                                                :disabled="scope.row.shutterMode === undefined"
                                                                @change="handleShutterLowLimitChange"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.shutterValueEnum"
                                                                    :key="index"
                                                                    :value="index.toString()"
                                                                    :label="item"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_INFRARE_MODE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.InfraredMode"
                                                                placeholder=" "
                                                                :disabled="scope.row.InfraredMode === undefined"
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-for="(item, index) in scope.row.InfraredModeArray"
                                                                    :key="index"
                                                                    :value="item"
                                                                    :label="infraredModeMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whitelightMode">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_WHITE_LIGHT') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.whitelightMode"
                                                                placeholder=" "
                                                                @change="setAZData()"
                                                            >
                                                                <el-option
                                                                    v-if="scope.row.whitelightMode === 'manual'"
                                                                    value="off"
                                                                    :label="Translate('IDCS_OFF')"
                                                                />
                                                                <el-option
                                                                    v-if="scope.row.whitelightMode === 'manual'"
                                                                    value="manual"
                                                                    :label="Translate('IDCS_MANUAL')"
                                                                />
                                                                <el-option
                                                                    v-if="scope.row.whitelightMode === 'manual'"
                                                                    value="auto"
                                                                    :label="Translate('IDCS_AUTO')"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whitelightMode">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_WHITE_STRENGTH') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <div class="slider_wrap">
                                                                <el-slider
                                                                    v-model="scope.row.whitelightStrength"
                                                                    :min="isNaN(scope.row.whitelightStrengthMin) ? 0 : scope.row.whitelightStrengthMin"
                                                                    :max="isNaN(scope.row.whitelightStrengthMax) ? 100 : scope.row.whitelightStrengthMax"
                                                                    class="slider"
                                                                    :disabled="scope.row.whiteLightMode !== 'manual'"
                                                                    @change="setAZData()"
                                                                />
                                                                <div>
                                                                    <el-input
                                                                        v-model="scope.row.whitelightStrength"
                                                                        readonly
                                                                        class="custom_slider_input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whitelightMode">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_START_TIME') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-input :disabled="scope.row.whiteLightMode !== 'manual'" />
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.whitelightMode">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_END_TIME') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-input :disabled="scope.row.whiteLightMode !== 'manual'" />
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                            </el-form>
                                        </div>
                                        <div
                                            v-show="scope.row.activeTab === tabKeys.scheduleCtrl"
                                            class="page_content_item"
                                        >
                                            <el-form :model="scope.row">
                                                <el-row>
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_SCHEDULE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.scheduleInfo.scheduleType"
                                                                placeholder=" "
                                                                :disabled="!scope.row.supportSchedule"
                                                            >
                                                                <el-option
                                                                    value="full"
                                                                    :label="Translate('IDCS_FULL_TIME')"
                                                                />
                                                                <el-option
                                                                    v-for="item in filteredScheduleInfoEnum(scope.row.scheduleInfo.scheduleInfoEnum, false)"
                                                                    :key="item"
                                                                    :value="item"
                                                                    :label="scheduleMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.scheduleInfo.scheduleType !== 'time'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_CONFIG_FILE') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-select
                                                                v-model="scope.row.scheduleInfo.program"
                                                                placeholder=" "
                                                                :disabled="!scope.row.supportSchedule"
                                                                @change="handleProgramChange(scope.row)"
                                                            >
                                                                <el-option
                                                                    v-for="item in filteredScheduleInfoEnum(scope.row.scheduleInfo.scheduleInfoEnum, true)"
                                                                    :key="item"
                                                                    :value="item"
                                                                    :label="scheduleMap[item]"
                                                                />
                                                            </el-select>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.scheduleInfo.scheduleType === 'time'">
                                                    <el-col
                                                        :span="8"
                                                        class="el-col-label"
                                                    >
                                                        {{ Translate('IDCS_DN_DAY_TIME') }}
                                                    </el-col>
                                                    <el-col :span="16">
                                                        <el-form-item>
                                                            <el-row>
                                                                <el-col :span="11">
                                                                    <el-time-picker
                                                                        v-model="scope.row.scheduleInfo.dayTime"
                                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                                        value-format="HH:mm"
                                                                        :clearable="false"
                                                                        @change="handleChangeTime('day')"
                                                                    />
                                                                </el-col>
                                                                <el-col
                                                                    :span="2"
                                                                    class="el-col-flex-center"
                                                                    >--</el-col
                                                                >
                                                                <el-col :span="11">
                                                                    <el-time-picker
                                                                        v-model="scope.row.scheduleInfo.nightTime"
                                                                        :format="timeMode === 24 ? 'HH:mm' : 'hh:mm A'"
                                                                        value-format="HH:mm"
                                                                        :clearable="false"
                                                                        @change="handleChangeTime('night')"
                                                                    />
                                                                </el-col>
                                                            </el-row>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="scope.row.scheduleInfo.scheduleType === 'time'">
                                                    <BaseScheduleLine
                                                        id="scheduleLineId"
                                                        ref="scheduleLine"
                                                        :width="405"
                                                        readonly
                                                        :time-mode="timeMode"
                                                    >
                                                    </BaseScheduleLine>
                                                </el-row>
                                                <el-row class="row_schedule_tip">
                                                    <div class="dayTime_icon"></div>
                                                    <span class="icon_label">{{ Translate('IDCS_DN_DAY') }}</span>
                                                    <div class="nightTime_icon"></div>
                                                    <span class="icon_label">{{ Translate('IDCS_DN_NIGHT') }}</span>
                                                </el-row>
                                            </el-form>
                                            <el-row>
                                                <el-col class="el-col-flex-end">
                                                    <el-button @click="setAZData(true)">{{ Translate('IDCS_SAVE') }}</el-button>
                                                </el-col>
                                            </el-row>
                                        </div>
                                        <div
                                            v-show="scope.row.activeTab === tabKeys.sceneCtrl"
                                            class="page_content_item3"
                                        >
                                            <div>
                                                <el-row class="row_scene_title">{{ Translate('IDCS_SCENE_CONTROL') }}</el-row>
                                                <el-row class="row_scene_control scene_item">
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedSlow"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                            @mousedown="addCmd('ZoomOut', curLensCtrl.id)"
                                                            @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <BaseImgSprite
                                                            file="arr_left"
                                                            :chunk="1"
                                                            :index="0"
                                                        />
                                                    </div>

                                                    <div>{{ Translate('IDCS_ZOOM') }}</div>
                                                    <div>
                                                        <BaseImgSprite
                                                            file="arr_right"
                                                            :chunk="1"
                                                            :index="0"
                                                        />
                                                    </div>
                                                    <div
                                                        class="scene_control_btn_wrap"
                                                        :class="{ disabled: !curLensCtrl.supportAz }"
                                                    >
                                                        <BaseImgSprite
                                                            file="SpeedQuick"
                                                            :chunk="4"
                                                            :index="1"
                                                            :hover-index="0"
                                                            :active-index="0"
                                                            :disabled="!curLensCtrl.supportAz"
                                                            :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                            @mousedown="addCmd('ZoomIn', curLensCtrl.id)"
                                                            @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                        />
                                                    </div>
                                                </el-row>
                                                <div class="scene_item">
                                                    <el-row class="row_scene_item">
                                                        <el-col :span="10">{{ Translate('IDCS_FOCUS_MODE') }}</el-col>
                                                        <el-col :span="14">
                                                            <el-select
                                                                v-if="curLensCtrl.focusTypeList.length"
                                                                v-model="curLensCtrl.focusType"
                                                                placeholder=" "
                                                                :disabled="!curLensCtrl.supportAz"
                                                            >
                                                                <el-option
                                                                    v-for="item in curLensCtrl.focusTypeList"
                                                                    :key="item.value"
                                                                    :value="item.value"
                                                                    :label="item.text"
                                                                />
                                                            </el-select>
                                                            <el-select
                                                                v-else
                                                                v-model="defaultFocusMode"
                                                                disabled
                                                            >
                                                                <el-option
                                                                    value="manual"
                                                                    :label="Translate('IDCS_MANUAL_FOCUS')"
                                                                />
                                                                <el-option
                                                                    value="auto"
                                                                    :label="Translate('IDCS_AUTO_FOCUS')"
                                                                />
                                                            </el-select>
                                                        </el-col>
                                                    </el-row>
                                                    <el-row
                                                        v-if="!curLensCtrl.supportAz || (curLensCtrl.supportAz && curLensCtrl.focusType !== 'auto')"
                                                        class="row_scene_control"
                                                    >
                                                        <div
                                                            class="scene_control_btn_wrap"
                                                            :class="{ disabled: !curLensCtrl.supportAz }"
                                                        >
                                                            <BaseImgSprite
                                                                file="SpeedSlow"
                                                                :chunk="4"
                                                                :index="1"
                                                                :hover-index="0"
                                                                :active-index="0"
                                                                :disabled="!curLensCtrl.supportAz"
                                                                :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                                @mousedown="addCmd('Far', curLensCtrl.id)"
                                                                @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <BaseImgSprite
                                                                file="arr_left"
                                                                :chunk="1"
                                                                :index="0"
                                                            />
                                                        </div>

                                                        <div>{{ Translate('IDCS_FOCUS') }}</div>
                                                        <div>
                                                            <BaseImgSprite
                                                                file="arr_right"
                                                                :chunk="1"
                                                                :index="0"
                                                            />
                                                        </div>
                                                        <div
                                                            class="scene_control_btn_wrap"
                                                            :class="{ disabled: !curLensCtrl.supportAz }"
                                                        >
                                                            <BaseImgSprite
                                                                file="SpeedQuick"
                                                                :chunk="4"
                                                                :index="1"
                                                                :hover-index="0"
                                                                :active-index="0"
                                                                :disabled="!curLensCtrl.supportAz"
                                                                :disabled-index="curLensCtrl.supportAz ? -1 : 1"
                                                                @mousedown="addCmd('Near', curLensCtrl.id)"
                                                                @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                            />
                                                        </div>
                                                        <div
                                                            class="btn_auto_focus text-ellipsis"
                                                            :title="Translate('IDCS_ONE_KEY_FOCUS')"
                                                            :class="{ disabled: !curLensCtrl.supportAz }"
                                                            @mousedown="addCmd('OneKeyFocus', curLensCtrl.id)"
                                                            @mouseup="addCmd('Stop', curLensCtrl.id)"
                                                        >
                                                            {{ Translate('IDCS_ONE_KEY_FOCUS') }}
                                                        </div>
                                                    </el-row>
                                                    <el-row
                                                        v-else-if="curLensCtrl.supportAz || (curLensCtrl.supportAz && curLensCtrl.focusType === 'auto')"
                                                        class="row_scene_item"
                                                    >
                                                        <el-col :span="10">{{ Translate('IDCS_FOCUS_TIME') }}</el-col>
                                                        <el-col :span="14">
                                                            <el-select
                                                                v-model="curLensCtrl.timeInterval"
                                                                placeholder=" "
                                                                :disabled="!curLensCtrl.supportAz"
                                                            >
                                                                <el-option
                                                                    v-for="item in curLensCtrl.timeIntervalList"
                                                                    :key="item.value"
                                                                    :value="item.value"
                                                                    :label="item.text"
                                                                />
                                                            </el-select>
                                                        </el-col>
                                                    </el-row>
                                                    <el-row class="row_scene_item row_focus_model_tip">{{ Translate('IDCS_FOCUS_MODEL_TIP') }}</el-row>
                                                </div>

                                                <el-row class="row_scene_item scene_item">
                                                    <el-checkbox
                                                        v-model="curLensCtrl.IrchangeFocus"
                                                        :label="Translate('IDCS_AUTO_FOCUS_TIP')"
                                                        :disabled="curLensCtrl.IrchangeFocusDisabled"
                                                    ></el-checkbox>
                                                </el-row>
                                            </div>
                                            <el-row>
                                                <el-col
                                                    :span="12"
                                                    class="el-col-tip"
                                                >
                                                    <div id="divLensTip"></div>
                                                </el-col>
                                                <el-col
                                                    :span="12"
                                                    class="el-col-flex-end"
                                                >
                                                    <el-button
                                                        :disabled="!curLensCtrl.supportAz"
                                                        @click="saveLensCtrlData"
                                                        >{{ Translate('IDCS_SAVE') }}</el-button
                                                    >
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-scrollbar>
                                </div>
                                <div class="tab_wrap">
                                    <div
                                        v-for="item in tabs"
                                        :key="item.key"
                                        class="tab_item"
                                        :class="{ active: scope.row.activeTab === item.key }"
                                        @click="scope.row.activeTab = item.key"
                                    >
                                        {{ Translate(item.text) }}
                                    </div>
                                </div>
                            </div>
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
            </div>
        </div>
    </div>
    <BaseFloatError ref="baseFloatErrorRef" />
</template>

<script lang="ts" src="./ChannelImage.v.ts"></script>

<style scoped lang="scss">
#ChannelImage {
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

            .el-form {
                margin-top: 10px;
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

            .expandContent {
                height: 420px;
                overflow: hidden;
                display: flex;
                justify-content: space-around;
                align-items: center;
                flex-direction: column;
                .page_content {
                    width: 100%;

                    .el-scrollbar {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        height: 360px;

                        .page_content_item,
                        .page_content_item3 {
                            width: 435px;
                            height: 360px;
                            padding: 0 15px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;

                            .row_divide {
                                height: 1px;
                                border-bottom: 1px solid var(--content-border);
                                margin-bottom: 18px;
                            }
                        }

                        .page_content_item3 {
                            width: 350px;
                            .scene_item {
                                padding-bottom: 25px;

                                .el-row {
                                    margin-bottom: 10px;

                                    &:last-child {
                                        margin-bottom: 0;
                                    }
                                }
                            }
                        }

                        .custom_ir_cut_mode {
                            width: 100%;
                        }
                    }
                }

                .tab_wrap {
                    display: flex;
                    justify-content: center;
                    padding: 5px;
                    position: relative;
                    .tab_item {
                        font-size: 14px;
                        padding: 4px 15px 4px 15px;
                        border: 1px solid var(--content-border);
                        cursor: pointer;
                        &:hover {
                            color: var(--primary);
                        }
                        &.active {
                            color: var(--primary);
                        }
                    }
                    .tab_item:not(:first-child) {
                        margin-left: -1px;
                    }
                }

                .row_scene_title {
                    font-size: 16px;
                    margin-bottom: 15px;
                }

                .row_scene_item {
                    align-items: center;
                }

                .row_scene_control {
                    align-items: center;

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

                    div {
                        margin: 0 5px;

                        &:first-child {
                            margin: 0;
                        }
                    }

                    .btn_auto_focus {
                        margin: 0 0 0 10px;
                        width: 68px;
                        height: 40px;
                        text-align: center;
                        word-wrap: break-word;
                        border-width: 1px;
                        border-style: solid;
                        border-radius: 4px;
                        border-color: var(--color-black);
                        color: var(--btn-text);
                        background-color: var(--btn-bg);
                        cursor: pointer;

                        &:hover {
                            background-color: var(--btn-bg-hover);
                            border-color: var(--btn-border-hover);
                        }

                        &.disabled {
                            background-color: var(--btn-bg-disabled);
                            border-color: var(--btn-border-disabled);
                            cursor: not-allowed;
                        }
                    }
                }

                .row_focus_model_tip {
                    color: var(--color-error);
                }

                .row_schedule_tip {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .dayTime_icon {
                        width: 20px;
                        height: 20px;
                        background-color: var(--primary);
                    }

                    .nightTime_icon {
                        width: 20px;
                        height: 20px;
                        background-color: var(--content-border);
                    }

                    .icon_label {
                        margin: 0 20px 0 10px;
                    }
                }
            }
        }

        .slider_wrap {
            width: 100%;
            display: flex;
            align-items: center;

            .custom_btn_slider_wrap {
                display: flex;
                width: 48px;
                justify-content: space-between;

                .custom_btn_slider {
                    width: 0;
                    height: 0;
                    border-width: 7px;
                    border-style: solid;
                }

                .custom_btn_slider_decr {
                    border-color: transparent var(--main-border0) transparent transparent;
                    cursor: pointer;

                    &.disabled {
                        border-color: transparent var(--main-border1) transparent transparent;
                        cursor: not-allowed;
                    }
                }

                .custom_btn_slider_incr {
                    border-color: transparent transparent transparent var(--main-border0);
                    cursor: pointer;

                    &.disabled {
                        border-color: transparent transparent transparent var(--main-border1);
                        cursor: not-allowed;
                    }
                }
            }

            .custom_slider_input {
                width: 55px;
                margin-right: 0;

                &.custom_slider_input_sp {
                    margin: 0 0 0 10px;
                }

                :deep(.el-input__inner) {
                    text-align: center;
                }

                .empty_content {
                    width: 55px;
                }
            }

            .slider_opertion {
                display: flex;
                align-items: center;
            }

            .slider {
                flex-grow: 1;
                padding: 0 30px 0 10px;

                &.slider_sp {
                    padding: 0 10px;
                }
            }
        }

        .el-col-tip {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            #divTip,
            #divLensTip {
                margin-left: 15px;
            }
        }

        .el-col-label {
            margin-bottom: 18px;
        }

        :deep(.valueShowText) {
            display: none;
        }
    }
}
</style>
