<!--
 * @Date: 2025-05-15 16:04:38
 * @Description: 智能补光
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <AlarmBaseChannelSelector
            v-model="pageData.currentChl"
            :list="pageData.chlList"
            @change="changeChl"
        />
        <div v-if="pageData.requestType === 'success'">
            <el-tabs
                v-model="pageData.tab"
                class="base-ai-tabs"
            >
                <!-- 参数设置 -->
                <el-tab-pane
                    :label="Translate('IDCS_PARAM_SETTING')"
                    name="param"
                    class="base-ai-param-box"
                >
                    <div class="base-ai-param-box-left">
                        <div class="player">
                            <BaseVideoPlayer
                                ref="playerRef"
                                @ready="handlePlayerReady"
                                @notify="notify"
                            />
                        </div>
                        <div class="base-btn-box space-between">
                            <div>
                                <el-checkbox
                                    v-show="formData.boundary.length > 1"
                                    v-model="pageData.isShowAllArea"
                                    :label="Translate('IDCS_DISPLAY_ALL_AREA')"
                                    @change="toggleShowAllArea"
                                />
                            </div>
                            <div>
                                <el-button @click="clearArea">{{ Translate('IDCS_CLEAR') }}</el-button>
                                <el-button
                                    v-show="formData.boundary.length > 1"
                                    @click="clearAllArea"
                                >
                                    {{ Translate('IDCS_FACE_CLEAR_ALL') }}
                                </el-button>
                            </div>
                        </div>
                        <div class="base-ai-tip">{{ Translate('IDCS_DRAW_AREA_TIP').formatForLang(6) }}</div>
                    </div>
                    <div class="base-ai-param-box-right">
                        <el-form v-title>
                            <div class="base-ai-subheading">{{ Translate('IDCD_RULE') }}</div>
                            <el-form-item :label="Translate('IDCS_DURATION')">
                                <el-select-v2
                                    v-model="formData.duration"
                                    :options="formData.durationList"
                                />
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_WARN_AREA')">
                                <el-radio-group
                                    v-model="pageData.warnArea"
                                    class="small-btn"
                                    @change="changeWarnArea()"
                                >
                                    <el-radio-button
                                        v-for="(_item, index) in formData.boundary"
                                        :key="index"
                                        :value="index"
                                        :label="index + 1"
                                        :class="{
                                            checked: pageData.warnAreaChecked.includes(index),
                                        }"
                                    />
                                </el-radio-group>
                            </el-form-item>
                            <div class="base-ai-subheading">{{ Translate('IDCS_DETECTION_TARGET') }}</div>
                            <el-form-item v-show="formData.objectFilter.supportPerson">
                                <template #label>
                                    <el-checkbox
                                        v-model="formData.objectFilter.personSwitch"
                                        :label="Translate('IDCS_DETECTION_PERSON')"
                                        :disabled="!formData.objectFilter.supportPersonSwitch"
                                    />
                                </template>
                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                <BaseSliderInput
                                    v-model="formData.objectFilter.personSensitivity"
                                    :min="formData.objectFilter.personSensitivityMin"
                                    :max="formData.objectFilter.personSensitivityMax"
                                />
                            </el-form-item>
                            <el-form-item v-show="formData.objectFilter.supportCar">
                                <template #label>
                                    <el-checkbox
                                        v-model="formData.objectFilter.carSwitch"
                                        :label="Translate('IDCS_DETECTION_VEHICLE')"
                                        :disabled="!formData.objectFilter.supportCarSwitch"
                                    />
                                </template>
                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                <BaseSliderInput
                                    v-model="formData.objectFilter.carSensitivity"
                                    :min="formData.objectFilter.carSensitivityMin"
                                    :max="formData.objectFilter.carSensitivityMax"
                                />
                            </el-form-item>
                            <el-form-item v-show="formData.objectFilter.supportMotor">
                                <template #label>
                                    <el-checkbox
                                        v-model="formData.objectFilter.motorSwitch"
                                        :label="Translate('IDCS_NON_VEHICLE')"
                                        :disabled="!formData.objectFilter.supportMotorSwitch"
                                    />
                                </template>
                                <span class="base-ai-slider-label">{{ Translate('IDCS_SENSITIVITY') }}</span>
                                <BaseSliderInput
                                    v-model="formData.objectFilter.motorSensitivity"
                                    :min="formData.objectFilter.motorSensitivityMin"
                                    :max="formData.objectFilter.motorSensitivityMax"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <div class="base-btn-box fixed">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <AlarmBaseErrorPanel
            v-if="pageData.requestType === 'fail' || pageData.requestType === 'not-support'"
            :type="pageData.requestType"
        />
    </div>
</template>

<script lang="ts" src="./ChannelFillLight.v.ts"></script>
