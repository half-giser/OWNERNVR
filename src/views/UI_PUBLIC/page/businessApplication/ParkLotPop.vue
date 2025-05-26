<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:40
 * @Description:  实时过车记录 - 详情弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_VEHICLE_IN_OUT_DETAIL')"
        width="1200"
        @open="open"
    >
        <div class="dialog">
            <ParkLotSearchTargetPanel
                :current="current"
                :current-index="pageData.index"
                :total="pageData.list.length"
                :show-enter-loading="pageData.isEnterImgLoading"
                :show-exit-loading="pageData.isExitImgLoading"
                @prev="handlePrev"
                @next="handleNext"
            />
            <div class="right">
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
                </div>
                <div class="base-btn-box no-padding">
                    <BaseImgSpriteBtn
                        file="snap_exit"
                        :title="Translate('IDCS_EXIT')"
                        @click="close"
                    />
                </div>
            </div>
        </div>
        <ParkLotRemarkPop
            v-model="pageData.isRemarkPop"
            @confirm="commitOpenGate"
            @close="pageData.isRemarkPop = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./ParkLotPop.v.ts"></script>

<style lang="scss" scoped>
.wrap {
    width: 100%;
    display: flex;
}

.dialog {
    width: 100%;
    display: flex;
}

.right {
    margin-top: 38px;
    margin-left: 10px;
}

.data {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    background-color: var(--parklog-bg);
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

.bottom {
    &-left {
        width: 796px;
        flex-shrink: 0;
        justify-content: space-between;
    }

    &-info {
        display: flex;
        font-size: 20px;
        width: 100%;

        & > div {
            width: 50%;
        }
    }

    &-right {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}

.btns {
    display: flex;
    position: absolute;
    left: 0;
    bottom: 30px;
    z-index: 5;

    .btn {
        min-width: 65px;
        height: 48px;
        line-height: 48px;
        text-align: center;
        cursor: pointer;
        background-color: var(--color-white);
        user-select: none;

        &:hover:not(.disabled) {
            background-color: var(--primary-light);
        }

        &.disabled {
            color: var(--main-text-light);
            cursor: not-allowed;
        }
    }
}
</style>
