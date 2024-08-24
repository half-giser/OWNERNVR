<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:35
 * @Description: 业务应用-门禁管理-门禁配置
-->

<template>
    <el-form
        id="actConfigView"
        ref="actFormRef"
        :model="pageData"
        label-position="left"
        :style="{
            '--form-input-width': '300px',
            '--form-label-width': '150px',
        }"
        class="inline-message narrow"
    >
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_CHANNEL_SELECT')"
                    truncated
                >
                    {{ Translate('IDCS_CHANNEL_SELECT') }}
                </el-text>
            </template>
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

        <div class="title">
            <div class="lineIcon"></div>
            <div class="titleText">{{ Translate('IDCS_DOOR_LOCK') }}</div>
        </div>
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
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_UNLOCKING_CONDITION')"
                    truncated
                >
                    {{ Translate('IDCS_UNLOCKING_CONDITION') }}
                </el-text>
            </template>
            <el-checkbox
                v-model="pageData.wearMaskOpen"
                :label="Translate('IDCS_MASK_ON')"
                :disabled="!pageData.wearMaskOpenEnable"
            />
        </el-form-item>
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_UNLOCKING_GROUP')"
                    truncated
                >
                    {{ Translate('IDCS_UNLOCKING_GROUP') }}
                </el-text>
            </template>
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
        <el-form-item class="sliderItem">
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_UNLOCKING_DELAY_TIME')"
                    truncated
                >
                    {{ Translate('IDCS_UNLOCKING_DELAY_TIME') }}
                </el-text>
            </template>
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
        <el-form-item class="sliderItem">
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_UNLOCKING_DURATION')"
                    truncated
                >
                    {{ Translate('IDCS_UNLOCKING_DURATION') }}
                </el-text>
            </template>
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
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_DOOR_LOCK_SETTING')"
                    truncated
                >
                    {{ Translate('IDCS_DOOR_LOCK_SETTING') }}
                </el-text>
            </template>
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
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_ALARM_LINKAGE_TYPE')"
                    truncated
                >
                    {{ Translate('IDCS_ALARM_LINKAGE_TYPE') }}
                </el-text>
            </template>
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

        <div class="title">
            <div class="lineIcon"></div>
            <div class="titleText">{{ Translate('IDCS_WIEGAND_CONFIG') }}</div>
        </div>
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_TRANSPORT_DIR')"
                    truncated
                >
                    {{ Translate('IDCS_TRANSPORT_DIR') }}
                </el-text>
            </template>
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
        <el-form-item>
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_WIEGAND_MODE')"
                    truncated
                >
                    {{ Translate('IDCS_WIEGAND_MODE') }}
                </el-text>
            </template>
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
            <el-button
                type="primary"
                @click="apply()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </el-form>
</template>

<script lang="ts" src="./ActConfigs.v.ts"></script>

<style lang="scss" scoped>
#actConfigView {
    display: flex;
    flex-direction: column;
    padding: 25px 20px;
    .title {
        display: flex;
        align-items: center;
        margin: 10px 0 10px 0;
        // &:nth-of-type(2) {
        //     margin-bottom: 10px;
        // }
        .lineIcon {
            width: 5px;
            height: 23px;
            border-left: 2px solid var(--text-dark);
        }
        .titleText {
            color: var(--text-dark);
            font-size: 16px;
            font-weight: bold;
            margin-left: 4px;
        }
        .titleTip {
            color: var(--text-menu-03);
            font-size: 14px;
            margin-left: 40px;
        }
    }
    // :deep(.el-form-item) {
    //     width: 450px;
    //     margin-left: 10px;
    //     align-items: center;
    //     &.sliderItem {
    //         width: 520px;
    //     }
    //     .el-form-item__label {
    //         color: var(--text-dark);
    //         font-size: 15px;
    //     }
    //     .el-form-item__content {
    //         margin-left: 30px;
    //         justify-content: flex-start;
    //     }
    //     &.apply {
    //         .el-form-item__content {
    //             justify-content: flex-end;
    //         }
    //     }
    // }
}
</style>
