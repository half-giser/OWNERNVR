<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 10:02:29
 * @Description: 日期范围
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-26 14:25:02
-->
<template>
    <div class="date-range">
        <BaseImgSprite
            file="datePicker"
            :index="0"
            :hover-index="0"
            :chunk="7"
            @click="handlePrev"
        />
        <div class="date-range-box">
            <span>{{ displayDateValue(props.modelValue[0]) }}</span>
            <span v-show="type === 'custom' || type === 'week'"> -- {{ displayDateValue(props.modelValue[1]) }}</span>
        </div>
        <BaseImgSprite
            file="datePicker"
            :index="3"
            :hover-index="3"
            :chunk="7"
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
         * @property 日期格式
         */
        dateFormat?: string
        /**
         * @property 日期时间格式
         */
        dateTimeFormat?: string
        /**
         * @property 年月格式
         */
        ymFormat?: string
        /**
         * @property 当前时间 毫秒
         */
        modelValue?: [number, number]
    }>(),
    {
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
        ymFormat: 'YYYY-MM',
        modelValue: () => [Date.now(), Date.now()],
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', data: [number, number]): void
    (e: 'change', data: [number, number], type: string): void
}>()

const { openMessageTipBox } = useMessageBox()
const { Translate } = useLangStore()

const handlePrev = () => {
    const oldValue = [...props.modelValue]
    let current: [number, number] = [0, 0]

    if (props.type === 'date') {
        current = [dayjs(oldValue[0]).subtract(1, 'day').valueOf(), dayjs(oldValue[1]).subtract(1, 'day').valueOf()]
    } else if (props.type === 'month') {
        const lastMonth = dayjs(oldValue[0]).subtract(1, 'month')
        const days = lastMonth.daysInMonth()
        console.log(days)
        current = [lastMonth.date(1).hour(0).minute(0).second(0).valueOf(), lastMonth.date(days).hour(23).minute(59).second(59).valueOf()]
    } else if (props.type === 'week') {
        current = [dayjs(oldValue[0]).subtract(7, 'day').valueOf(), dayjs(oldValue[1]).subtract(7, 'day').valueOf()]
    } else {
        const diff = dayjs(oldValue[1]).diff(oldValue[0], 'day')
        current = [dayjs(oldValue[0]).subtract(diff, 'day').valueOf(), dayjs(oldValue[1]).subtract(diff, 'day').valueOf()]
    }
    console.log(formatDate(current[0]), formatDate(current[1]))
    emits('update:modelValue', current)
    emits('change', current, props.type)
}

const handleNext = () => {
    const oldValue = [...props.modelValue]
    let current: [number, number] = [0, 0]

    if (props.type === 'date') {
        current = [dayjs(oldValue[0]).add(1, 'day').valueOf(), dayjs(oldValue[1]).add(1, 'day').valueOf()]
    } else if (props.type === 'month') {
        const nextMonth = dayjs(oldValue[0]).add(1, 'month')
        const days = nextMonth.daysInMonth()
        current = [nextMonth.date(1).hour(0).minute(0).second(0).valueOf(), nextMonth.date(days).hour(23).minute(59).second(59).valueOf()]
        console.log(nextMonth.date(1).hour(0).minute(0).second(0), nextMonth.date(days).hour(23).minute(59).second(59))
    } else if (props.type === 'week') {
        current = [dayjs(oldValue[0]).add(7, 'day').valueOf(), dayjs(oldValue[1]).add(7, 'day').valueOf()]
    } else {
        const diff = dayjs(oldValue[1]).diff(oldValue[0], 'day')
        current = [dayjs(oldValue[0]).add(diff, 'day').valueOf(), dayjs(oldValue[1]).subtract(diff, 'day').valueOf()]
    }
    if (current[0] > dayjs().hour(23).minute(59).second(59).valueOf()) {
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_INVALID_TIME_RANGE'),
        })
        return
    }
    console.log(formatDate(current[0]), formatDate(current[1]))
    emits('update:modelValue', current)
    emits('change', current, props.type)
}

const displayDateValue = (timestamp: number) => {
    if (props.type === 'date') {
        if (dayjs().isSame(timestamp, 'day')) {
            return Translate('IDCS_CALENDAR_TODAY')
        }
        if (dayjs().subtract(1, 'day').isSame(timestamp, 'day')) {
            return Translate('IDCS_CALENDAR_YESTERDAY')
        }
        return formatDate(timestamp, props.dateFormat)
    }
    if (props.type === 'month') {
        return formatDate(timestamp, props.ymFormat)
    }
    if (props.type === 'week') {
        return formatDate(timestamp, props.dateFormat)
    }
    return formatDate(timestamp, props.dateTimeFormat)
}
</script>

<style lang="less">
.date-range {
    display: flex;
    align-items: center;

    &-box {
        padding: 0 15px;
    }
}
</style>
