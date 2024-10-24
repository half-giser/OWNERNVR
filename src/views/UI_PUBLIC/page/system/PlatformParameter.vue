<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 11:22:10
 * @Description: 地标平台参数
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-23 15:47:07
-->
<template>
    <div>
        <el-form
            class="stripe"
            label-position="left"
            :model="formData"
            inline-message
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <div class="base-subheading-box">{{ Translate('IDCS_ACCESS_PLATFORM_SET') }}</div>
            <!-- 启用 -->
            <el-form-item>
                <el-checkbox v-model="formData.enable">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <!-- 代理id -->
            <el-form-item :label="Translate('IDCS_AGENT_ID')">
                <el-input
                    v-model="formData.proxyId"
                    :disabled="!formData.enable"
                />
            </el-form-item>
            <!-- 服务器地址 -->
            <el-form-item :label="Translate('IDCS_SERVER_ADDRESS')">
                <BaseIpInput
                    v-if="!formData.isDomain"
                    :disabled="!formData.enable"
                    :model-value="formData.ip"
                    @update:model-value="handleIpChange"
                />
                <el-input
                    v-else
                    v-model="formData.domain"
                    :disabled="!formData.enable"
                />
                <el-checkbox
                    v-model="formData.isDomain"
                    :disabled="!formData.enable"
                    >{{ Translate('IDCS_DOMAIN_NAME') }}</el-checkbox
                >
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
            <div class="base-subheading-box">{{ Translate('IDCS_SNAP_SETTING') }}</div>
            <!-- 分辨率 -->
            <el-form-item :label="Translate('IDCS_RESOLUTION_RATE')">
                <el-select
                    v-model="formData.resolution"
                    :disabled="!formData.enable"
                    value-key="value"
                    :options="pageData.resolutionList"
                >
                    <el-option
                        v-for="item in pageData.resolutionList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <!-- 画质 -->
            <el-form-item :label="Translate('IDCS_SNAP_QUALITY')">
                <el-select
                    v-model="formData.level"
                    :disabled="!formData.enable"
                    value-key="value"
                    :options="pageData.levelList"
                >
                    <el-option
                        v-for="item in pageData.levelList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <!-- 间隔时间 -->
            <el-form-item :label="Translate('IDCS_SNAP_TIMEINTERVAL')">
                <el-select
                    v-model="formData.holdTime"
                    :disabled="!formData.enable"
                    value-key="value"
                    :options="pageData.holdTimeList"
                >
                    <el-option
                        v-for="item in pageData.holdTimeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!formData.enable"
                    @click="setDefault"
                    >{{ Translate('IDCS_DEFAULT') }}</el-button
                >
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PlatformParameter.v.ts"></script>
