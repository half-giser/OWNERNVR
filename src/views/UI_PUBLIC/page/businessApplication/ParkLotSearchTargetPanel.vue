<!--
 * @Date: 2025-05-24 18:18:56
 * @Description: 停车场进出记录 抓拍图区域
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="box">
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
        <div
            class="left"
            @mouseenter="pageData.isBtnVisible = true"
            @mouseleave="pageData.isBtnVisible = false"
        >
            <div
                v-show="pageData.tabIndex === 0"
                class="panel"
            >
                <div
                    v-show="showEnterLoading"
                    class="panel-loading"
                >
                    {{ Translate('IDCS_LOADING') }}
                </div>
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
                <div
                    v-show="showExitLoading"
                    class="panel-loading"
                >
                    {{ Translate('IDCS_LOADING') }}
                </div>
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
                        disabled: currentIndex === 0,
                    }"
                    @click="handlePrev"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </div>
                <div
                    class="btn"
                    :class="{
                        disabled: currentIndex === total - 1,
                    }"
                    @click="handleNext"
                >
                    {{ Translate('IDCS_NEXT') }}
                </div>
            </div>
        </div>
        <div class="base-btn-box space-between">
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
                :disabled="!current.plateNum"
                :title="Translate('IDCS_ENTRY')"
                @click="addPlate"
            />
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
    </div>
</template>

<script lang="ts" src="./ParkLotSearchTargetPanel.v.ts"></script>

<style lang="scss" scoped>
.box {
    width: 796px;
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
        user-select: none;

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
    background-color: var(--parklog-box-bg);

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

    &-loading {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pano-img {
        position: absolute;
        right: 0;
        top: 0;
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

.bottom-info {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    width: 60%;
}
</style>
