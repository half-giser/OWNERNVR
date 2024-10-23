<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 09:19:04
 * @Description: 基本配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 20:14:17
-->
<template>
    <div class="Setting">
        <el-form
            ref="formRef"
            class="stripe narrow"
            label-position="left"
            :rules
            :model="formData"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
            hide-required-asterisk
            inline-message
        >
            <el-form-item
                prop="deviceName"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <el-input
                    v-model="formData.deviceName"
                    type="text"
                    :maxlength="nameByteMaxLen"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
                    :placeholder="Translate('IDCS_DEVICE_NAME')"
                />
            </el-form-item>
            <el-form-item
                prop="deviceNumber"
                :label="Translate('IDCS_DEVICE_NUMBER')"
            >
                <BaseNumberInput
                    v-model="formData.deviceNumber"
                    :min="0"
                    :max="99999"
                />
            </el-form-item>
            <el-form-item
                prop="videoFormat"
                :label="Translate('IDCS_VIDEO_FORMAT')"
            >
                <el-select
                    v-model="formData.videoFormat"
                    @change="hanelChangeVideoFormat"
                >
                    <el-option
                        v-for="value in pageData.videoFormatOption"
                        :key="value"
                        :value
                        :label="value"
                    >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item
                prop="outputAdapt"
                :label="Translate('IDCS_OUTPUT_ADAPT')"
            >
                <el-checkbox v-model="formData.outputAdapt"></el-checkbox>
            </el-form-item>
            <!-- <el-form-item :label="Translate('IDCS_LOCAL')"></el-form-item> -->
            <!-- 主副屏选项 -->
            <template
                v-for="(item, key) in pageData.resolutionOptions"
                :key
            >
                <el-form-item :label="displayResolutionLabel(key)">
                    <el-select
                        v-model="formData.resolution[key]"
                        :disabled="getResolutionDisabled(key)"
                    >
                        <el-option
                            v-for="(value, optionKey) in getResolutionOptions(key, item)"
                            :key="optionKey"
                            :value
                            :label="value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="key === 0 && pageData.resolutionTip">{{ pageData.resolutionTip }}</el-form-item>
            </template>
            <!-- 解码卡选项 -->
            <template
                v-for="(item, key) in pageData.decoderOptions"
                :key
            >
                <el-form-item
                    v-for="(item2, key2) in item"
                    :key="key2"
                    :label="displayDecoderLabel(key, key2)"
                >
                    <el-select v-model="formData.decoder[key][key2]">
                        <el-option
                            v-for="(value, optionKey) in item2"
                            :key="optionKey"
                            :value
                            :label="value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </template>
            <el-form-item
                v-if="pageData.isOutputConfig"
                prop="outputConfig"
                :label="Translate('IDCS_OUTPUT_CONFIG')"
            >
                <el-select
                    v-model="formData.outputConfig"
                    @change="handleChangeOutputConfig"
                >
                    <el-option
                        v-for="item in pageData.outputConfigOption"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="formData.enableGuide">{{ Translate('IDCS_ENABLE_GUIDE') }}</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="formData.mobileStreamAdaption">{{ Translate('IDCS_MOBILE_STREAM_ADAPTION') }}</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="formData.enableAutoDwell">{{ Translate('IDCS_ENABLE_AUTO_DWELL') }}</el-checkbox>
            </el-form-item>
            <el-form-item
                prop="waitTime"
                :label="Translate('IDCS_WAIT_TIME')"
            >
                <el-select
                    v-model="formData.waitTime"
                    :disabled="!formData.enableAutoDwell"
                >
                    <el-option
                        v-for="value in pageData.waitTimeOption"
                        :key="value"
                        :value="value"
                        :label="displayWaitTimeOption(value)"
                    >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="pageData.isZeroOrAddIpc">
                <el-checkbox v-model="formData.zeroOrAddIpc">{{ Translate('IDCS_ZERO_OP_ADD_IPC') }}</el-checkbox>
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./GeneralSettings.v.ts"></script>
