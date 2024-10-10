<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:35
 * @Description: 业务应用-门禁管理-门禁配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-10 11:10:02
-->
<template>
    <div class="act">
        <el-form
            :model="pageData"
            label-position="left"
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '200px',
            }"
            class="inline-message narrow"
        >
            <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                <el-select
                    v-model="pageData.chlId"
                    :disabled="!pageData.chlList.length"
                    placeholder=""
                    @change="handleChlChange"
                >
                    <el-option
                        v-for="item in pageData.chlList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-business-subheading">{{ Translate('IDCS_DOOR_LOCK') }}</div>
            <el-form-item label=" ">
                <el-select
                    v-model="pageData.accessLockCurrentIndex"
                    :disabled="!pageData.accessLockEnabled"
                    placeholder=""
                >
                    <el-option
                        v-for="item in formData.accessLockData"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_CONDITION')">
                <el-checkbox
                    v-model="formData.wearMaskOpen"
                    :label="Translate('IDCS_MASK_ON')"
                    :disabled="!pageData.wearMaskOpenEnable"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_GROUP')">
                <el-select
                    v-model="formData.accessListType"
                    :disabled="!formData.accessListType"
                    placeholder=""
                >
                    <el-option
                        v-for="item in pageData.accessListTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_DELAY_TIME')">
                <el-slider
                    v-model="formData.accessLockData[pageData.accessLockCurrentIndex].openDelayTime"
                    :min="formData.accessLockData[pageData.accessLockCurrentIndex].openDelayTimeMin"
                    :max="formData.accessLockData[pageData.accessLockCurrentIndex].openDelayTimeMax"
                    :disabled="!formData.accessLockData[pageData.accessLockCurrentIndex].openDelayTimeEnabled"
                    size="small"
                    :show-input-controls="false"
                    show-input
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_DURATION')">
                <el-slider
                    v-model="formData.accessLockData[pageData.accessLockCurrentIndex].openHoldTime"
                    :min="formData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeMin"
                    :max="formData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeMax"
                    :disabled="!formData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeEnabled"
                    size="small"
                    :show-input-controls="false"
                    show-input
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DOOR_LOCK_SETTING')">
                <el-select
                    v-model="formData.accessLockData[pageData.accessLockCurrentIndex].doorLockConfig"
                    :disabled="!formData.accessLockData[pageData.accessLockCurrentIndex].doorLockConfig"
                    placeholder=""
                >
                    <el-option
                        v-for="item in pageData.doorLockTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALARM_LINKAGE_TYPE')">
                <el-select
                    v-model="formData.accessLockData[pageData.accessLockCurrentIndex].alarmAction"
                    :disabled="!formData.accessLockData[pageData.accessLockCurrentIndex].alarmAction"
                    placeholder=""
                >
                    <el-option
                        v-for="item in pageData.doorLockActionEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-business-subheading">{{ Translate('IDCS_WIEGAND_CONFIG') }}</div>
            <el-form-item :label="Translate('IDCS_TRANSPORT_DIR')">
                <el-select
                    v-model="formData.wiegandIOType"
                    :disabled="!formData.wiegandIOType"
                    placeholder=""
                >
                    <el-option
                        v-for="item in pageData.wiegandIOTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WIEGAND_MODE')">
                <el-select
                    v-model="formData.wiegandMode"
                    :disabled="!formData.wiegandMode"
                    placeholder=""
                >
                    <el-option
                        v-for="item in pageData.wiegandModeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!pageData.chlId"
                    @click="apply()"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./ActConfigs.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/businessApplication.scss';
</style>

<style lang="scss" scoped>
.act {
    padding: 25px 20px;
}
</style>
