<!--
 * @Date: 2025-04-17 20:24:14
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Description: 时间选择器
-->
<template>
    <el-time-picker
        ref="$picker"
        :model-value="modelValue"
        :value-format="unit === 'second' ? 'HH:mm:ss' : 'HH:mm'"
        :format="unit === 'second' ? dateTime.timeFormat : dateTime.hourMinuteFormat"
        :disabled-hours="disabledHours"
        :disabled-minutes="disabledMinutes"
        :disabled-seconds="disabledSeconds"
        :disabled
        :teleported
        @update:model-value="update"
        @change="change"
        @visible-change="handleVisibleChange"
    />
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        /**
         * @property 绑定值，如果它是数组，长度应该是 2
         */
        modelValue?: string
        /**
         * @property 最小颗粒度 second
         */
        unit?: 'second' | 'minute'
        /**
         * @property 是否为时间范围选择
         */
        // isRange?: boolean
        /**
         * @property 可选时间区间(不包含) HH:mm/HH:mm:ss
         */
        range?: [string | null, string | null]
        /**
         * @property
         */
        disabled?: boolean
        /**
         * @property
         */
        teleported?: boolean
    }>(),
    {
        unit: 'second',
        // isRange: false,
        disabled: false,
        range: () => [null, null],
        teleported: true,
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'visibleChange', bool: boolean): void
    (e: 'change', value: string): void
}>()

const dateTime = useDateTimeStore()
const popperObserver = usePopperObserver()
const $picker = ref()

/**
 * @description 时间值改变
 */
const update = (e: string) => {
    emits('update:modelValue', e)
}

/**
 * @description 时间值改变
 */
const change = (e: string) => {
    emits('change', e)
}

/**
 * @description 有效的时间范围
 */
const timeRange = computed(() => {
    const startTime = props.range[0] ? props.range[0].split(':').map((item) => Number(item)) : [-1, 59, 59]
    if (startTime.length === 2) startTime.push(0)
    const endTime = props.range[1] ? props.range[1].split(':').map((item) => Number(item)) : [24, 0, 0]
    if (endTime.length === 2) endTime.push(59)
    return [startTime, endTime]
})

/**
 * @description 禁止的小时选项
 */
const disabledHours = () => {
    const arr = Array(24)
        .fill(0)
        .map((_, key) => key)
        .filter((i) => i < timeRange.value[0][0] || i > timeRange.value[1][0])

    if (timeRange.value[0][1] === 59 && timeRange.value[0][2] === 59) {
        arr.push(timeRange.value[0][0])
    }

    if (timeRange.value[1][1] === 0 && timeRange.value[1][2] === 0) {
        arr.push(timeRange.value[1][0])
    }

    return arr
}

/**
 * @description 禁止的分钟选项
 */
const disabledMinutes = (hour: number) => {
    if (hour === timeRange.value[0][0]) {
        const arr = Array(timeRange.value[0][1])
            .fill(0)
            .map((_, key) => {
                return key
            })

        if (timeRange.value[0][2] === 59) {
            arr.push(timeRange.value[0][1])
        }

        return arr
    }

    if (hour === timeRange.value[1][0]) {
        const arr = Array(60 - timeRange.value[1][1] - 1)
            .fill(0)
            .map((_, key) => {
                return key + timeRange.value[1][1] + 1
            })

        if (timeRange.value[1][2] === 0) {
            arr.push(timeRange.value[1][1])
        }

        return arr
    }

    return []
}

/**
 * @description 禁止的秒选项
 */
const disabledSeconds = (hour: number, minute: number) => {
    if (hour === timeRange.value[0][0] && minute === timeRange.value[0][1]) {
        return Array(timeRange.value[0][2] + 1)
            .fill(0)
            .map((_, key) => {
                return key
            })
    }

    if (hour === timeRange.value[1][0] && minute === timeRange.value[1][1]) {
        return Array(60 - timeRange.value[1][2])
            .fill(0)
            .map((_, key) => {
                return key + timeRange.value[1][2]
            })
    }

    return []
}

const handleOpen = () => {
    $picker.value?.handleOpen()
}

const handleClose = () => {
    $picker.value?.handleClose()
}

const hide = popperObserver.observe(handleClose, 'el-time-pane')

const expose = {
    handleOpen,
    handleClose,
}

export type BaseTimePickerReturnsType = typeof expose

defineExpose(expose)

const handleVisibleChange = (bool: boolean) => {
    if (bool) {
        popperObserver.addListener(hide)
    } else {
        popperObserver.removeListener(hide)
    }

    emits('visibleChange', bool)
}

onBeforeUnmount(() => {
    popperObserver.removeListener(hide)
})
</script>
