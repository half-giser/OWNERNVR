<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 10:02:29
 * @Description: 日期范围
-->
<template>
    <div class="date-range">
        <BaseImgSprite
            file="datePicker-first"
            :hover-index="0"
            @click="handlePrev"
        />
        <div class="date-range-box">
            <span>{{ displayDateValue(props.modelValue[0]) }}</span>
            <span v-show="type === 'custom' || type === 'week' || type === 'quarter'"> -- {{ displayDateValue(props.modelValue[1]) }}</span>
        </div>
        <BaseImgSprite
            file="datePicker-last"
            :hover-index="0"
            @click="handleNext"
        />
    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'

const props = withDefaults(
    defineProps<{
        /**
         * @property date / week / month / custom
         */
        type: string
        /**
         * @property 当前时间 毫秒
         */
        modelValue?: [number, number]
        /**
         * @property 自定义时间类型
         */
        customType?: 'minute' | 'second' | 'day'
    }>(),
    {
        type: 'date',
        modelValue: () => [Date.now(), Date.now()],
        customType: 'second',
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', data: [number, number]): void
    (e: 'change', data: [number, number], type: string): void
}>()

const { Translate } = useLangStore()
const dateTime = useDateTimeStore()

/**
 * @description 上一个日期
 */
const handlePrev = () => {
    const oldValue = [...props.modelValue]
    let current: [number, number] = [0, 0]

    switch (props.type) {
        case 'date':
            current = [dayjs(oldValue[0]).subtract(1, 'day').valueOf(), dayjs(oldValue[1]).subtract(1, 'day').valueOf()]
            break
        case 'month':
            const lastMonth = dayjs(oldValue[0]).subtract(1, 'month')
            const days = lastMonth.daysInMonth()
            current = [lastMonth.date(1).hour(0).minute(0).second(0).valueOf(), lastMonth.date(days).hour(23).minute(59).second(59).valueOf()]
            break
        case 'quarter':
            const daysInLastMonth = dayjs(oldValue[1]).subtract(3, 'month').daysInMonth()
            current = [dayjs(oldValue[0]).subtract(3, 'month').valueOf(), dayjs(oldValue[1]).subtract(3, 'month').date(daysInLastMonth).hour(23).minute(59).second(59).valueOf()]
            break
        case 'week':
            current = [dayjs(oldValue[0]).subtract(7, 'day').valueOf(), dayjs(oldValue[1]).subtract(7, 'day').valueOf()]
            break
        default:
            const diff = dayjs(oldValue[1]).diff(oldValue[0], 'day') + 1
            current = [dayjs(oldValue[0]).subtract(diff, 'day').valueOf(), dayjs(oldValue[1]).subtract(diff, 'day').valueOf()]
            break
    }

    emits('update:modelValue', current)
    emits('change', current, props.type)
}

/**
 * @description 下一个日期
 */
const handleNext = () => {
    const oldValue = [...props.modelValue]
    let current: [number, number] = [0, 0]

    switch (props.type) {
        case 'date':
            current = [dayjs(oldValue[0]).add(1, 'day').valueOf(), dayjs(oldValue[1]).add(1, 'day').valueOf()]
            break
        case 'month':
            const nextMonth = dayjs(oldValue[0]).add(1, 'month')
            const days = nextMonth.daysInMonth()
            current = [nextMonth.date(1).hour(0).minute(0).second(0).valueOf(), nextMonth.date(days).hour(23).minute(59).second(59).valueOf()]
            break
        case 'quarter':
            const daysInLastMonth = dayjs(oldValue[1]).add(3, 'month').daysInMonth()
            current = [dayjs(oldValue[0]).add(3, 'month').valueOf(), dayjs(oldValue[1]).add(3, 'month').date(daysInLastMonth).hour(23).minute(59).second(59).valueOf()]
            break
        case 'week':
            current = [dayjs(oldValue[0]).add(7, 'day').valueOf(), dayjs(oldValue[1]).add(7, 'day').valueOf()]
            break
        default:
            const diff = dayjs(oldValue[1]).diff(oldValue[0], 'day') + 1
            current = [dayjs(oldValue[0]).add(diff, 'day').valueOf(), dayjs(oldValue[1]).add(diff, 'day').valueOf()]
            break
    }

    if (current[0] > dayjs().hour(23).minute(59).second(59).valueOf()) {
        openMessageBox(Translate('IDCS_INVALID_TIME_RANGE'))
        return
    }
    emits('update:modelValue', current)
    emits('change', current, props.type)
}

/**
 * @description 日期的格式化显示
 * @param {Number} timestamp 毫秒
 */
const displayDateValue = (timestamp: number) => {
    if (props.type === 'date') {
        if (dayjs().isSame(timestamp, 'day')) {
            return Translate('IDCS_CALENDAR_TODAY')
        }

        if (dayjs().subtract(1, 'day').isSame(timestamp, 'day')) {
            return Translate('IDCS_CALENDAR_YESTERDAY')
        }
        return formatDate(timestamp, dateTime.dateFormat)
    }

    if (props.type === 'month' || props.type === 'quarter') {
        return formatDate(timestamp, dateTime.yearMonthFormat)
    }

    if (props.type === 'week') {
        return formatDate(timestamp, dateTime.dateFormat)
    }

    if (props.type === 'custom') {
        if (props.customType === 'day') {
            return formatDate(timestamp, dateTime.dateFormat)
        }

        if (props.customType === 'minute') {
            return formatDate(timestamp, dateTime.dateFormat + ' ' + dateTime.hourMinuteFormat)
        }

        if (props.customType === 'second') {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }
    }

    return formatDate(timestamp, dateTime.dateTimeFormat)
}
</script>

<style lang="less">
.date-range {
    display: flex;
    align-items: center;
    font-size: 14px;

    &-box {
        padding: 0 8px;
    }
}
</style>
