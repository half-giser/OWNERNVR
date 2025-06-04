<!--
 * @Date: 2025-05-28 19:33:42
 * @Description: 播放条（基于element-plus的el-slider, 但el-slider不支持当前项目高度自定义的播放条样式,故开发此组件）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="PlayerControl">
        <div class="PlayerControl-text">{{ displayTime(startTime) }}</div>
        <div
            class="PlayerControl-slider"
            :class="{ highlight: enableHighlight }"
        >
            <div
                v-if="enableHighlight"
                ref="div"
                class="PlayerControl-runaway"
                @click="handleClick"
            >
                <div
                    class="PlayerControl-highlight"
                    :style="{
                        left: `${hightlightLeft}%`,
                        width: `${highlightWidth}%`,
                    }"
                ></div>
                <div class="PlayerControl-events">
                    <div
                        v-for="item in marks"
                        :key="item.value"
                        :title="item.label"
                        :style="{ left: calculateEventLeft(item.value) }"
                    ></div>
                </div>
            </div>
            <el-slider
                :model-value="modelValue"
                :min="startTime"
                :max="endTime"
                :disabled
                placement="bottom"
                :show-tooltip="false"
                @change="emits('change', $event as number)"
                @update:model-value="emits('update:modelValue', $event as number)"
                @mousedown="emits('mousedown', $event)"
                @mouseup="emits('mousedown', $event)"
            />
        </div>
        <div class="PlayerControl-text">{{ displayTime(endTime) }}</div>
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        modelValue: number
        /**
         * @property 秒
         */
        startTime: number
        /**
         * @property 秒
         */
        endTime: number
        /**
         * @property 显示时分秒/年月日时分秒 h / Y
         */
        format?: string
        /**
         * @property 标记点（如事件标记点）
         */
        marks?: SelectOption<number, string>[]
        /**
         * @property 高亮显示的段
         */
        highlight?: [number, number]
        disabled?: boolean
        enableHighlight?: boolean
        enableCurrentTime?: boolean
    }>(),
    {
        format: 'h',
        marks: () => [],
        highlight: () => [0, 0],
        disabled: false,
        enableHighlight: false,
        enableCurrentTime: false,
    },
)

const emits = defineEmits<{
    (e: 'change', value: number): void
    (e: 'update:modelValue', value: number): void
    (e: 'mousedown', event: any): void
    (e: 'mouseup', event: any): void
}>()

const dateTime = useDateTimeStore()

const displayTime = (timestamp: number) => {
    if (timestamp === 0) {
        return ''
    }

    if (props.format === 'h') {
        return formatDate(timestamp * 1000, dateTime.timeFormat)
    } else {
        return formatDate(timestamp * 1000, dateTime.dateTimeFormat)
    }
}

const hightlightLeft = computed(() => {
    const length = props.endTime - props.startTime

    if (length > 0) {
        return clamp(Math.floor(((props.highlight[0] - props.startTime) / (props.endTime - props.startTime)) * 100), 0, 100)
    }
    return 0
})

const highlightWidth = computed(() => {
    const length = props.endTime - props.startTime
    if (length > 0) {
        const right = Math.floor(((props.highlight[1] - props.startTime) / (props.endTime - props.startTime)) * 100)
        return clamp(right - hightlightLeft.value, 0, 100 - hightlightLeft.value)
    }
    return 0
})

const calculateEventLeft = (timestamp: number) => {
    const length = props.endTime - props.startTime
    if (length > 0) {
        return clamp(Math.floor(((timestamp - props.startTime) / (props.endTime - props.startTime)) * 100), 0, 100) + '%'
    }
    return '0%'
}

const div = ref<HTMLDivElement>()
const handleClick = (e: MouseEvent) => {
    if (props.disabled) {
        return
    }

    const length = props.endTime - props.startTime
    const rect = div.value!.getBoundingClientRect()
    if (length > 0) {
        const time = Math.floor(((e.clientX - rect.x) / rect.width) * (props.endTime - props.startTime) + props.startTime)
        emits('update:modelValue', time)
        emits('change', time)
    }
}
</script>

<style lang="scss">
.PlayerControl {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 32px;

    &-text {
        flex-shrink: 0;
        line-height: 32px;

        &:first-child {
            padding-right: 12px;
            text-align: left;
            width: 90px;
        }

        &:last-child {
            padding-left: 12px;
            text-align: right;
            width: 90px;
        }
    }

    &-slider {
        position: relative;
        width: 100%;
        height: 32px;

        #n9web &.highlight {
            .el-slider {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;

                &__runway {
                    background-color: transparent;
                    // pointer-events: none;

                    &::before {
                        background-color: transparent;
                    }

                    &::after {
                        background-color: transparent;
                    }
                }

                &__bar {
                    background-color: transparent;
                }

                &__button {
                    pointer-events: auto;
                }
            }
        }
    }

    &-runaway {
        position: absolute;
        left: -8px;
        top: 13px;
        width: calc(100% + 16px);
        height: 4px;
        background-color: var(--primary);
        cursor: pointer;
    }

    &-highlight {
        position: absolute;
        top: 0;
        height: 100%;
        background-color: var(--slider-bar-event-bg);
    }

    &-events {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        & > div {
            position: absolute;
            top: 0;
            width: 4px;
            height: 4px;
            background-color: var(--slider-bar-mark-bg);
        }
    }

    &.disabled {
        .PlayerControl-runaway {
            background-color: var(--slider-btn-border-disabled);
        }
    }
}
</style>
