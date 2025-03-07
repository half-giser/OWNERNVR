<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 09:19:04
 * @Description: 基本配置
-->
<template>
    <div class="Setting">
        <el-form
            ref="formRef"
            class="stripe"
            :rules
            :model="formData"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
        >
            <el-form-item
                prop="deviceName"
                :label="Translate('IDCS_DEVICE_NAME')"
            >
                <el-input
                    v-model="formData.deviceName"
                    type="text"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
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
                <el-form-item v-if="key === 0 && pageData.resolutionTip">{{ pageData.resolutionTip }}</el-form-item>
            </template>
            <!-- 解码卡选项 -->
            <template
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
            </template>
            <el-form-item
                v-if="pageData.isOutputConfig"
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
            <el-form-item v-if="pageData.isZeroOrAddIpc">
                <el-checkbox
                    v-model="formData.zeroOrAddIpc"
                    :label="Translate('IDCS_ZERO_OP_ADD_IPC')"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./GeneralSettings.v.ts"></script>
