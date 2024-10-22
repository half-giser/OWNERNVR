<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 09:02:59
 * @Description: 录像机OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 14:01:54
-->
<template>
    <div class="OSDSetting">
        <el-form
            class="stripe"
            label-position="left"
            :model="formData"
            label-width="150"
            :style="{
                '--form-input-width': '340px',
            }"
            inline-message
        >
            <el-form-item :label="Translate('IDCS_NAME_ENABLE')">
                <el-select v-model="formData.nameEnable">
                    <el-option
                        v-for="item in pageData.options"
                        :key="item.value"
                        :value="item.value"
                        :label="Translate(item.label)"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ICON_ENABLE')">
                <el-select v-model="formData.iconEnable">
                    <el-option
                        v-for="item in pageData.options"
                        :key="item.value"
                        :value="item.value"
                        :label="Translate(item.label)"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                v-show="pageData.isAddress"
                :label="Translate('IDCS_ADDRESS_ENABLE')"
            >
                <el-select v-model="formData.addressEnable">
                    <el-option
                        v-for="item in pageData.options"
                        :key="item.value"
                        :value="item.value"
                        :label="Translate(item.label)"
                    />
                </el-select>
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./RecorderOsdSettings.v.ts"></script>
