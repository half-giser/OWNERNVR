<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 11:22:10
 * @Description: 地标平台参数
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="formRule"
        >
            <div class="base-head-box">{{ Translate('IDCS_ACCESS_PLATFORM_SET') }}</div>
            <!-- 启用 -->
            <el-form-item>
                <el-checkbox
                    v-model="formData.enable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <!-- 代理id -->
            <el-form-item :label="Translate('IDCS_AGENT_ID')">
                <el-input
                    v-model="formData.proxyId"
                    :disabled="!formData.enable"
                />
            </el-form-item>
            <!-- 服务器地址 -->
            <el-form-item
                prop="ip"
                :label="Translate('IDCS_SERVER_ADDRESS')"
            >
                <BaseIpInput
                    v-if="!formData.isDomain"
                    :disabled="!formData.enable"
                    :model-value="formData.ip"
                    @update:model-value="changeIp"
                />
                <el-input
                    v-else
                    v-model="formData.domain"
                    :disabled="!formData.enable"
                    :placeholder="Translate('IDCS_DOMAIN_TIP')"
                />
                <el-checkbox
                    v-model="formData.isDomain"
                    :disabled="!formData.enable"
                    :label="Translate('IDCS_DOMAIN_NAME')"
                />
            </el-form-item>
            <!-- 端口 -->
            <el-form-item :label="Translate('IDCS_PORT')">
                <BaseNumberInput
                    v-model="formData.port"
                    :disabled="!formData.enable"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <div class="base-head-box">{{ Translate('IDCS_SNAP_SETTING') }}</div>
            <!-- 分辨率 -->
            <el-form-item :label="Translate('IDCS_RESOLUTION_RATE')">
                <BaseSelect
                    v-model="formData.resolution"
                    :disabled="!formData.enable"
                    :options="pageData.resolutionList"
                />
            </el-form-item>
            <!-- 画质 -->
            <el-form-item :label="Translate('IDCS_SNAP_QUALITY')">
                <BaseSelect
                    v-model="formData.level"
                    :disabled="!formData.enable"
                    :options="pageData.levelList"
                />
            </el-form-item>
            <!-- 间隔时间 -->
            <el-form-item :label="Translate('IDCS_SNAP_TIMEINTERVAL')">
                <BaseSelect
                    v-model="formData.holdTime"
                    :disabled="!formData.enable"
                    :options="pageData.holdTimeList"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!formData.enable"
                    @click="setDefault"
                >
                    {{ Translate('IDCS_DEFAULT') }}
                </el-button>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PlatformParameter.v.ts"></script>
