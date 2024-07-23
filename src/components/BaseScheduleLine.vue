<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:10:16
 * @Description: 排程单时间条
-->
<template>
    <div
        class="border"
        :style="{ width: `${width}px` }"
    >
        <div class="timeline-border">
            <canvas
                ref="scaleRef"
                class="scale"
                :width="canvasWidth"
                height="20"
            ></canvas>
            <canvas
                ref="timeSelectorRef"
                class="time-selector"
                :width="canvasWidth"
                height="20"
                :style="{ backgroundColor: `${timeSpanBgColor}` }"
                @mousedown="selectStart"
                @mousemove="selecting"
                @mouseup="selectEnd"
                @mouseleave="selectEnd"
            ></canvas>
        </div>
        <div class="toolbar-border">
            <div
                class="valueShowText"
                :title="valueShowText"
                v-text="valueShowText"
            ></div>
            <div
                v-show="isSelecting"
                class="selectTip"
                v-text="selectTip"
            ></div>
            <div class="btn-panel">
                <slot name="customerControlPanel"></slot>
                <a
                    @click="manualTimeInputOpen"
                    v-text="Translate('IDCS_MANUAL_INPUT')"
                ></a>
                <a
                    @click="resetValue([['00:00', '23:59']])"
                    v-text="Translate('IDCS_SELECT_ALL')"
                ></a>
                <a
                    @click="invert"
                    v-text="Translate('IDCS_REVERSE_SELECT')"
                ></a>
                <a
                    @click="resetValue([])"
                    v-text="Translate('IDCS_CLEAR')"
                ></a>
                <div
                    v-show="manualTimeInputShow"
                    class="menaulTimeInputPL"
                    @click.stop
                >
                    <el-time-picker
                        v-model="menaulTimeSpan"
                        is-range
                        range-separator="-"
                        :clearable="false"
                        format="HH:mm"
                    />
                    <el-button @click="manualTimeInputOk">{{ Translate('IDCS_OK') }}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./BaseScheduleLine.v.ts"></script>

<style lang="scss" scoped>
.timeline-border {
    border: solid 1px var(--border-color1);

    canvas {
        display: block;
    }

    .time-selector {
        cursor: text;
    }
}

.toolbar-border {
    display: flex;
    height: 22px;
    // background-color: aquamarine;

    .valueShowText {
        font-size: 12px;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 auto;
    }

    .selectTip {
        flex: 0 0 auto;
        font-size: 12px;
        padding: 0px 2px;
        height: 16px;
        background-color: var(--primary--01);
    }

    .btn-panel {
        position: relative;
        flex: 0 0 auto;
        font-size: 13px;

        :deep(a) {
            margin-left: 15px;
            text-decoration: none;
            cursor: pointer;
            color: var(--text-timeline-button);

            &:hover {
                text-decoration: underline;
                color: var(--primary--04);
            }

            &.disabled {
                cursor: default;
                color: var(--text-disabled);
                text-decoration: none;
            }
        }
    }
}

.menaulTimeInputPL {
    display: flex;
    position: absolute;
    width: 230px;
    top: 20px;
    right: 0px;
    padding: 2px;
    border-radius: 5px;
    border: solid 1px var(--border-color1);
    background-color: var(--bg-color5);
}
</style>
