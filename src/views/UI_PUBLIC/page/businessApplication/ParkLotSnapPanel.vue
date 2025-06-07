<!--
 * @Date: 2025-05-24 18:18:56
 * @Description: 停车场进出记录 抓拍图区域
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div
        class="box"
        :class="{ 'search-box': layout === 'search' }"
    >
        <div class="tab">
            <el-radio-group
                v-model="pageData.tabIndex"
                :style="{
                    '--form-radio-button-width': '160px',
                }"
            >
                <el-radio-button
                    :value="0"
                    :label="current.type === 'nonEnter-nonExit' ? Translate('IDCS_NOT_HAVE_IN') : Translate('IDCS_VEHICLE_IN')"
                />
                <el-radio-button
                    :value="1"
                    :label="current.type === 'out-nonEnter-nonExit' ? Translate('IDCS_VEHICLE_NOT_OUT_TIPS') : Translate('IDCS_VEHICLE_OUT')"
                />
            </el-radio-group>
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
                    :class="pageData.enterSnapPosition"
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
                    :class="pageData.exitSnapPosition"
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
                class="base-intel-target-btns"
            >
                <div
                    class="base-intel-target-btn"
                    :class="{
                        disabled: !total || currentIndex === 0,
                    }"
                    @click="handlePrev"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </div>
                <div
                    class="base-intel-target-btn"
                    :class="{
                        disabled: !total || currentIndex === total - 1,
                    }"
                    @click="handleNext"
                >
                    {{ Translate('IDCS_NEXT') }}
                </div>
            </div>
        </div>
        <div class="base-btn-box space-between">
            <div
                v-if="pageData.tabIndex === 0"
                class="bottom-info"
            >
                <div>{{ current.enterChl }}</div>
                <div>{{ displayOpenGateType(current.enterType) }}</div>
            </div>
            <div
                v-if="pageData.tabIndex === 1"
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

<script lang="ts" src="./ParkLotSnapPanel.v.ts"></script>

<style lang="scss" scoped>
.box {
    width: 796px;
}

.tab {
    display: flex;
    height: 27px;
    margin-bottom: 2px;

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

        &[src=''] {
            opacity: 0;
        }

        &.top-right {
            right: 0;
            top: 0;
        }

        &.top-left {
            left: 0;
            top: 0;
        }
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .search-box & {
        height: 430px;
    }
}

.bottom-info {
    display: flex;
    justify-content: space-between !important;
    font-size: 20px;
    width: 60%;

    .search-box & {
        font-weight: bolder;
    }
}
</style>
