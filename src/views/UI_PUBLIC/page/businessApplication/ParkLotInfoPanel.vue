<!--
 * @Date: 2025-05-26 14:28:29
 * @Description: 停车场进出记录 - 详情信息
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="data">
        <div class="data-box">
            <div class="data-item">
                <label>{{ Translate('IDCS_LICENSE_PLATE_NUM') }}</label>
                <span v-if="type === 'edit'">
                    <el-input
                        v-model="formData.plateNum"
                        maxlength="31"
                    />
                </span>
                <span v-else>{{ formData.plateNum }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_DIRECTION') }}</label>
                <span class="bold">{{ displayDirection(current.direction) }}</span>
            </div>
        </div>
        <div class="data-box">
            <div class="data-item">
                <label>{{ Translate('IDCS_VEHICLE_IN_TIME') }}</label>
                <span>{{ current.type !== 'nonEnter-nonExit' ? displayDateTime(current.enterTime) : '--' }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_VEHICLE_OUT_TIME') }}</label>
                <span>{{ current.type !== 'nonEnter-nonExit' ? displayDateTime(current.exitTime) : '--' }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_VEHICLE_PARKING_TIME') }}</label>
                <span class="bold">{{ displayDuration(current) }}</span>
            </div>
        </div>
        <div class="data-box">
            <div class="data-item">
                <label>{{ Translate('IDCS_VEHICLE_OWNER') }}</label>
                <span>{{ current.master || '--' }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_PHONE_NUMBER') }}</label>
                <span>{{ current.phoneNum || '--' }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_VEHICLE_IN_OUT_RESULT') }}</label>
                <span>{{ displayType(current.type) }}</span>
            </div>
        </div>
        <div class="data-box">
            <div class="data-item">
                <label>{{ Translate('IDCS_EFFECTIVE_ENTERING_TIM') }}</label>
                <span :class="{ 'text-error': getPlateStartTimeState() }">{{ displayDateTime(current.plateStartTime) }}</span>
            </div>
            <div class="data-item">
                <label>{{ Translate('IDCS_EFFECTIVE_EXITING_TIME') }}</label>
                <span :class="{ 'text-error': getPlateEndTimeState() }">{{ displayDateTime(current.plateEndTime) }}</span>
            </div>
        </div>
        <div class="data-box">
            <!-- 超出有效出场时间的提示信息 -->
            <div class="data-item">
                <label>{{ Translate('IDCS_REMARK') }}</label>
                <span>{{ current.remark || '--' }}</span>
            </div>
        </div>
        <div
            v-if="type === 'edit'"
            class="base-btn-box"
        >
            <el-button @click="commit">{{ Translate('IDCS_EDIT_SUBMIT_AND_OPEN') }}</el-button>
        </div>
        <ParkLotRemarkPop
            v-model="pageData.isRemarkPop"
            @confirm="commitOpenGate"
            @close="pageData.isRemarkPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ParkLotInfoPanel.v.ts"></script>

<style lang="scss" scoped>
.data {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    height: 538px;

    &-box {
        padding: 5px 0;

        &:not(:last-child) {
            border-bottom: 1px solid var(--content-border);
        }
    }

    &-item {
        line-height: 38px;
        height: 38px;
        display: flex;

        label {
            width: 150px;
            flex-shrink: 0;
            color: var(--parklog-label-text);
        }

        span {
            width: 100%;

            &.bold {
                font-weight: bolder;
            }
        }
    }
}
</style>
