<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:35
 * @Description: 业务应用-门禁管理-门禁配置
-->
<template>
    <div class="act">
        <el-form
            v-title
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                <BaseSelect
                    v-model="pageData.chlId"
                    :options="pageData.chlList"
                    :disabled="!pageData.chlList.length"
                    @change="handleChlChange"
                />
            </el-form-item>
            <div class="base-business-subheading">{{ Translate('IDCS_DOOR_LOCK') }}</div>
            <el-form-item label=" ">
                <BaseSelect
                    v-model="pageData.accessLockCurrentIndex"
                    :disabled="!pageData.accessLockEnabled"
                    :props="{
                        value: 'index',
                        label: 'name',
                    }"
                    :options="accessLockformData.doorLock"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_CONDITION')">
                <el-checkbox
                    v-model="accessLockformData.wearMaskOpen"
                    :label="Translate('IDCS_MASK_ON')"
                    :disabled="!pageData.wearMaskOpenEnable"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_GROUP')">
                <BaseSelect
                    v-model="accessLockformData.accessListType"
                    :disabled="!accessLockformData.accessListType"
                    :options="pageData.accessListTypeEnum"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_DELAY_TIME')">
                <BaseSliderInput
                    v-model="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openDelayTime"
                    :min="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openDelayTimeMin"
                    :max="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openDelayTimeMax"
                    :disabled="!accessLockformData.doorLock[pageData.accessLockCurrentIndex].openDelayTimeEnabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_DURATION')">
                <BaseSliderInput
                    v-model="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openHoldTime"
                    :min="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openHoldTimeMin"
                    :max="accessLockformData.doorLock[pageData.accessLockCurrentIndex].openHoldTimeMax"
                    :disabled="!accessLockformData.doorLock[pageData.accessLockCurrentIndex].openHoldTimeEnabled"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DOOR_LOCK_SETTING')">
                <BaseSelect
                    v-model="accessLockformData.doorLock[pageData.accessLockCurrentIndex].doorLockConfig"
                    :disabled="!accessLockformData.doorLock[pageData.accessLockCurrentIndex].doorLockConfig"
                    :options="pageData.doorLockTypeEnum"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ALARM_LINKAGE_TYPE')">
                <BaseSelect
                    v-model="accessLockformData.doorLock[pageData.accessLockCurrentIndex].alarmAction"
                    :disabled="!accessLockformData.doorLock[pageData.accessLockCurrentIndex].alarmAction"
                    :options="pageData.doorLockActionEnum"
                />
            </el-form-item>
            <div class="base-business-subheading">{{ Translate('IDCS_WIEGAND_CONFIG') }}</div>
            <el-form-item :label="Translate('IDCS_TRANSPORT_DIR')">
                <BaseSelect
                    v-model="wiegandFormData.IOType"
                    :disabled="!wiegandFormData.IOType"
                    :options="pageData.wiegandIOTypeEnum"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_WIEGAND_MODE')">
                <BaseSelect
                    v-model="wiegandFormData.mode"
                    :disabled="!wiegandFormData.mode"
                    :options="pageData.wiegandModeEnum"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!pageData.chlId || (editAccessLock.disabled.value && editWiegand.disabled.value)"
                    @click="apply()"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./AccessLock.v.ts"></script>

<style lang="scss" scoped>
.act {
    padding: 25px 20px;
}
</style>
