<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 09:19:04
 * @Description: 基本配置
-->
<template>
    <div class="Setting">
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :rules
            :model="formData"
        >
            <el-form-item
                prop="deviceName"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <BaseTextInput
                    v-model="formData.deviceName"
                    :maxlength="formData.deviceNameMaxByteLen"
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
                    :value-on-clear="null"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_VIDEO_FORMAT')">
                <el-select-v2
                    v-model="formData.videoFormat"
                    :options="pageData.videoFormatOption"
                    @change="hanelChangeVideoFormat"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.outputAdapt"
                    :label="Translate('IDCS_OUTPUT_ADAPT')"
                />
            </el-form-item>
            <!-- <el-form-item :label="Translate('IDCS_LOCAL')"></el-form-item> -->
            <!-- 主副屏选项 -->
            <template
                v-for="(item, key) in pageData.resolutionOptions"
                :key
            >
                <el-form-item :label="displayResolutionLabel(key)">
                    <el-select-v2
                        v-model="formData.resolution[key]"
                        :disabled="getResolutionDisabled(key)"
                        :options="getResolutionOptions(key, item)"
                    />
                </el-form-item>
                <el-form-item v-if="key === 0 && systemCaps.supportSuperResolution">
                    <el-checkbox
                        v-model="formData.superResolution"
                        :title="Translate('IDCS_DISABLE_SUPER_RESOLUTION_TIP')"
                        :label="Translate('IDCS_SUPER_RESOLUTION')"
                        :disabled="!pageData.supportAI"
                    />
                </el-form-item>
            </template>
            <!-- 解码卡选项 -->
            <!-- <template
                v-for="item in formData.decoderResolution"
                :key="item.id"
            >
                <template v-if="item.onlineStatus">
                    <el-form-item
                        v-for="decoder in item.decoder"
                        :key="decoder.index"
                        :label="displayDecoderLabel(item.id, decoder.index)"
                    >
                        <el-select-v2
                            v-model="decoder.value"
                            :options="pageData.decoderOptions[item.id][decoder.index]"
                        />
                    </el-form-item>
                </template>
            </template> -->
            <el-form-item
                v-if="systemCaps.supportHdmiVgaSeparate"
                :label="Translate('IDCS_OUTPUT_CONFIG')"
            >
                <el-select-v2
                    v-model="formData.outputConfig"
                    :options="pageData.outputConfigOption"
                    @change="handleChangeOutputConfig"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.enableGuide"
                    :label="Translate('IDCS_ENABLE_GUIDE')"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.mobileStreamAdaption"
                    :label="Translate('IDCS_MOBILE_STREAM_ADAPTION')"
                />
            </el-form-item>
            <el-form-item v-if="systemCaps.supportZeroOprAdd">
                <el-checkbox
                    v-model="formData.zeroOrAddIpc"
                    :label="Translate('IDCS_ENABLE_ZERO_CFG_ADD')"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.enableAutoDwell"
                    :label="Translate('IDCS_ENABLE_AUTO_DWELL')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WAIT_TIME')">
                <el-select-v2
                    v-model="formData.waitTime"
                    :disabled="!formData.enableAutoDwell"
                    :options="pageData.waitTimeOption"
                />
            </el-form-item>
            <!-- <el-form-item v-if="pageData.isZeroOrAddIpc">
                <el-checkbox
                    v-model="formData.zeroOrAddIpc"
                    :label="Translate('IDCS_ZERO_OP_ADD_IPC')"
                />
            </el-form-item> -->
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./GeneralSettings.v.ts"></script>
