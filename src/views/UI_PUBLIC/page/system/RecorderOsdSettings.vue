<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 09:02:59
 * @Description: 录像机OSD配置
-->
<template>
    <div class="OSDSetting">
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '340px',
            }"
        >
            <el-form-item :label="Translate('IDCS_NAME_ENABLE')">
                <el-select-v2
                    v-model="formData.nameEnable"
                    :options="pageData.options"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ICON_ENABLE')">
                <el-select-v2
                    v-model="formData.iconEnable"
                    :options="pageData.options"
                />
            </el-form-item>
            <el-form-item
                v-show="pageData.isAddress"
                :label="Translate('IDCS_ADDRESS_ENABLE')"
            >
                <el-select-v2
                    v-model="formData.addressEnable"
                    :options="pageData.options"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./RecorderOsdSettings.v.ts"></script>
