<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:35
 * @Description: 业务应用-门禁管理-门禁配置
-->

<template>
    <div class="act">
        <el-form
            ref="actFormRef"
            :model="pageData"
            label-position="left"
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '150px',
            }"
            class="inline-message narrow"
        >
            <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                <el-select
                    v-model="pageData.chlId"
                    :disabled="pageData.chlList.length === 0"
                    placeholder=""
                    collapse-tags-tooltip
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
            <div class="title">{{ Translate('IDCS_DOOR_LOCK') }}</div>
            <el-form-item label=" ">
                <el-select
                    v-model="pageData.accessLockCurrentIndex"
                    :disabled="!pageData.accessLockDataEnable"
                    placeholder=""
                    collapse-tags-tooltip
                >
                    <el-option
                        v-for="item in pageData.accessLockIndexList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_CONDITION')">
                <el-checkbox
                    v-model="pageData.wearMaskOpen"
                    :label="Translate('IDCS_MASK_ON')"
                    :disabled="!pageData.wearMaskOpenEnable"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_GROUP')">
                <el-select
                    v-model="pageData.accessListType"
                    :disabled="!pageData.accessListTypeEnable"
                    placeholder=""
                    collapse-tags-tooltip
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
                    v-model="pageData.accessLockData[pageData.accessLockCurrentIndex].delayTimeValue"
                    :min="pageData.accessLockData[pageData.accessLockCurrentIndex].delayTimeMin"
                    :max="pageData.accessLockData[pageData.accessLockCurrentIndex].delayTimeMax"
                    :disabled="!pageData.accessLockData[pageData.accessLockCurrentIndex].delayTimeEnable"
                    size="small"
                    :show-input-controls="false"
                    show-input
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UNLOCKING_DURATION')">
                <el-slider
                    v-model="pageData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeValue"
                    :min="pageData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeMin"
                    :max="pageData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeMax"
                    :disabled="!pageData.accessLockData[pageData.accessLockCurrentIndex].openHoldTimeEnable"
                    size="small"
                    :show-input-controls="false"
                    show-input
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DOOR_LOCK_SETTING')">
                <el-select
                    v-model="pageData.accessLockData[pageData.accessLockCurrentIndex].doorLockConfig"
                    :disabled="!pageData.accessLockData[pageData.accessLockCurrentIndex].doorLockConfigEnable"
                    placeholder=""
                    collapse-tags-tooltip
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
                    v-model="pageData.accessLockData[pageData.accessLockCurrentIndex].alarmAction"
                    :disabled="!pageData.accessLockData[pageData.accessLockCurrentIndex].alarmActionEnable"
                    placeholder=""
                    collapse-tags-tooltip
                >
                    <el-option
                        v-for="item in pageData.doorLockActionEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div class="title">{{ Translate('IDCS_WIEGAND_CONFIG') }}</div>
            <el-form-item :label="Translate('IDCS_TRANSPORT_DIR')">
                <el-select
                    v-model="pageData.wiegandIOType"
                    :disabled="!pageData.wiegandIOTypeEnable"
                    placeholder=""
                    collapse-tags-tooltip
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
                    v-model="pageData.wiegandMode"
                    :disabled="!pageData.wiegandModeEnable"
                    placeholder=""
                    collapse-tags-tooltip
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
                <el-button @click="apply()">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./ActConfigs.v.ts"></script>

<style lang="scss" scoped>
.act {
    display: flex;
    flex-direction: column;
    padding: 25px 20px;
}

.title {
    margin: 10px 0 10px;
    display: flex;
    align-items: center;
    height: 23px;
    border-left: 2px solid var(--text-dark);
    color: var(--text-dark);
    font-size: 16px;
    font-weight: bold;
    padding-left: 10px;
}
</style>
