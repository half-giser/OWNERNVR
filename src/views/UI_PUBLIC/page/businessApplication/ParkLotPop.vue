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
        <div>
            <div class="tab">
                <div
                    class="tab-item"
                    :class="{ active: pageData.tabIndex === 0 }"
                    @click="pageData.tabIndex = 0"
                >
                    {{ current.type === 'nonEnter-nonExit' ? Translate('IDCS_NOT_HAVE_IN') : Translate('IDCS_VEHICLE_IN') }}
                </div>
                <div
                    class="tab-item"
                    :class="{ active: pageData.tabIndex === 1 }"
                    @click="pageData.tabIndex = 1"
                >
                    {{ current.type === 'out-nonEnter-nonExit' ? Translate('IDCS_VEHICLE_NOT_OUT_TIPS') : Translate('IDCS_VEHICLE_OUT') }}
                </div>
            </div>
        </div>
        <div class="dialog">
            <div
                class="left"
                @mouseenter="pageData.isBtnVisible = true"
                @mouseleave="pageData.isBtnVisible = false"
            >
                <div
                    v-show="pageData.tabIndex === 0"
                    class="panel"
                >
                    <img
                        :src="current.enterImg"
                        class="pano-img"
                    />
                    <canvas
                        ref="$enterCanvas"
                        :width="pageData.canvasWidth"
                        :height="pageData.canvasHeight"
                    ></canvas>
                    <img
                        v-show="pageData.isBtnVisible && current.enterSnapImg"
                        :src="current.enterSnapImg"
                        class="snap-img"
                    />
                    <div
                        v-show="!(current.isEnter && current.enterImg) && current.type === 'nonEnter-exit'"
                        class="panel-wrap"
                    >
                        {{ Translate('IDCS_NONE_VEHICLE_IN_TIPS') }}
                    </div>
                </div>
                <div
                    v-show="pageData.tabIndex === 1"
                    class="panel"
                >
                    <img
                        :src="current.exitImg"
                        class="pano-img"
                    />
                    <canvas
                        ref="$exitCanvas"
                        :width="pageData.canvasWidth"
                        :height="pageData.canvasHeight"
                    ></canvas>
                    <img
                        v-show="pageData.isBtnVisible && current.exitSnapImg"
                        :src="current.exitSnapImg"
                        class="snap-img"
                    />
                    <div
                        v-show="!(current.isExit && current.exitImg) && current.type === 'enter-nonExit'"
                        class="panel-wrap"
                    >
                        {{ Translate('IDCS_NONE_VEHICLE_OUT_TIPS') }}
                    </div>
                </div>
                <div
                    v-show="pageData.isBtnVisible"
                    class="btns"
                >
                    <div
                        class="btn"
                        :class="{
                            disabled: pageData.index === 0,
                        }"
                        @click="handlePrev"
                    >
                        {{ Translate('IDCS_PREVIOUS') }}
                    </div>
                    <div
                        class="btn"
                        :class="{
                            disabled: pageData.index === pageData.list.length - 1,
                        }"
                        @click="handleNext"
                    >
                        {{ Translate('IDCS_NEXT') }}
                    </div>
                </div>
            </div>
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
                        <span>{{ current.remark }}</span>
                    </div>
                </div>
                <div
                    v-if="type === 'edit'"
                    class="base-btn-box"
                >
                    <el-button @click="commit">{{ Translate('IDCS_EDIT_SUBMIT_AND_OPEN') }}</el-button>
                </div>
            </div>
        </div>
        <div class="base-btn-box space-between">
            <div class="bottom-left">
                <div
                    v-show="pageData.tabIndex === 0"
                    class="bottom-info"
                >
                    <div>{{ current.enterChl }}</div>
                    <div>{{ displayOpenGateType(current.enterType) }}</div>
                </div>
                <div
                    v-show="pageData.tabIndex === 1"
                    class="bottom-info"
                >
                    <div>{{ current.exitChl }}</div>
                    <div>{{ displayOpenGateType(current.exitType) }}</div>
                </div>
                <BaseImgSpriteBtn
                    file="register"
                    :disabled="!formData.plateNum"
                    :title="Translate('IDCS_ENTRY')"
                    @click="addPlate"
                />
            </div>
            <div class="bottom-right">
                <BaseImgSpriteBtn
                    file="snap_exit"
                    :title="Translate('IDCS_EXIT')"
                    @click="close"
                />
            </div>
        </div>
        <IntelLicencePlateDBAddPlatePop
            v-model="pageData.isAddPlatePop"
            type="register"
            :data="{
                plateNumber: pageData.plateNum,
            }"
            append-to-body
            @close="pageData.isAddPlatePop = false"
            @confirm="pageData.isAddPlatePop = false"
        />
        <ParkLotRemarkPop
            v-model="pageData.isRemarkPop"
            @confirm="commitOpenGate"
            @close="pageData.isRemarkPop = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./ParkLotPop.v.ts"></script>

<style lang="scss" scoped>
.dialog {
    width: 100%;
    display: flex;
}

.tab {
    display: flex;
    height: 32px;
    margin-bottom: 5px;

    &-item {
        min-width: 130px;
        border: 1px solid var(--table-border);
        height: 100%;
        margin-right: 5px;
        line-height: 32px;
        text-align: center;
        cursor: pointer;

        &:hover,
        &.active {
            color: var(--main-text-active);
            background-color: var(--primary);
        }
    }
}

.left {
    display: flex;
    flex-direction: column;
    width: 796px;
    flex-shrink: 0;
    position: relative;
}

.panel {
    width: 100%;
    height: 538px;
    border: 1px solid var(--subheading-bg);
    position: relative;

    &-wrap {
        background-color: var(--parklog-box-bg);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .pano-img {
        width: 100%;
        height: 100%;

        &[src=''] {
            opacity: 0;
        }
    }

    .snap-img {
        position: absolute;
        width: 30%;
        right: 0;
        top: 0;

        &[src=''] {
            opacity: 0;
        }
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}

.data {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    margin-left: 10px;
    background-color: var(--parklog-bg);

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
