<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 09:02:59
 * @Description: 录像机OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 20:38:08
-->
<template>
    <div class="OSDSetting">
        <el-form
            class="form"
            label-position="left"
            :model="formData"
            hide-required-asterisk
            label-width="150px"
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
        </el-form>
        <div class="btns">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./RecorderOsdSettings.v.ts"></script>

<style lang="scss" scoped>
.OSDSetting {
    .form {
        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__content) {
            // justify-content: flex-start;
            flex-wrap: nowrap;
        }

        .el-select {
            width: 340px;
        }
    }

    .btns {
        width: 510px;
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>
