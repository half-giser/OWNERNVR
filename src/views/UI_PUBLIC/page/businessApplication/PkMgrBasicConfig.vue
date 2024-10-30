<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:13
 * @Description: 业务应用-停车场管理-基础配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-21 17:47:38
-->
<template>
    <div class="manage">
        <el-form
            ref="formRef"
            :rules="rules"
            :model="formData"
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '200px',
            }"
            class="inline-message"
        >
            <div class="limit">{{ Translate('IDCS_PARKING_LOT_MANAGE_TIPS').formatForLang(1) }}</div>

            <div class="base-business-subheading">{{ Translate('IDCS_PARKING_LOT_NAME') }}</div>
            <el-form-item
                prop="parkName"
                :label="Translate('IDCS_NAME')"
            >
                <el-input
                    v-model="formData.parkName"
                    maxlength="256"
                />
            </el-form-item>

            <div class="base-business-subheading">
                <span>{{ Translate('IDCS_VEHICLE_NUM') }}</span>
                <span class="base-business-subheading-tip">{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</span>
            </div>
            <el-form-item
                prop="totalNum"
                :label="Translate('IDCS_TOTAL_VEHICLE_NUM')"
            >
                <BaseNumberInput
                    v-model="formData.totalNum"
                    :min="1"
                    :max="10000"
                />
            </el-form-item>
            <el-form-item
                prop="remainTotalNum"
                :label="Translate('IDCS_REMAIN_VEHICLE_NUM')"
            >
                <BaseNumberInput
                    v-model="formData.remainTotalNum"
                    :min="0"
                    :max="10000"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="apply">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PkMgrBasicConfig.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/businessApplication.scss';
</style>

<style lang="scss" scoped>
.manage {
    padding: 25px 20px;
}

.limit {
    margin: 10px 0 20px 10px;
    font-size: 14px;
}
</style>
