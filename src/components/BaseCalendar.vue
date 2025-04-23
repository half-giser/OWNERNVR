<!--
 * @Date: 2025-04-01 16:33:52
 * @Description: 日历组件 （Element-Plus无法适配波斯日历，故自行实现适用于本项目的日历组件）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="Calendar">
        <div class="Calendar-header">
            <span @click="prevMonth">&lt;</span>
            <span>{{ currentYearMonth }}</span>
            <span @click="nextMonth">&gt;</span>
        </div>
        <div class="Calendar-week">
            <div
                v-for="(item, key) in displayWeekDay"
                :key
                class="text-ellipsis"
            >
                {{ item }}
            </div>
        </div>
        <div class="Calendar-body">
            <div
                v-for="row in dateList"
                :key="row.format"
                :style="{
                    gridTemplateRows: `repeat(${dateList.length / 7}, 1fr)`,
                }"
                :class="{
                    none: row.inMonth !== 0,
                    today: row.format === today,
                    active: row.format === selectedValue,
                    badge: highlight(row.timestamp),
                }"
                @click="changeDate(row.timestamp, row.inMonth)"
            >
                {{ row.date }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'

const props = withDefaults(
    defineProps<{
        /**
         * @property 绑定值 *传入公历日期
         */
        modelValue: string
        /**
         * @property 绑定值的格式
         */
        valueFormat?: string
        /**
         * @property 徽标（传入毫秒时间戳数组）
         */
        badge?: number[]
    }>(),
    {
        badge: () => [],
        valueFormat: DEFAULT_DATE_FORMAT,
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}>()

const userSession = useUserSessionStore()
const { Translate } = useLangStore()
const dateTime = useDateTimeStore()

// 输入框显示值
const selectedValue = computed(() => {
    return props.modelValue ? dayjs(props.modelValue, props.valueFormat).format(DEFAULT_DATE_FORMAT) : ''
})

// 今天
const today = ref(formatDate(new Date(), DEFAULT_DATE_FORMAT))

// 当前日期
const currentValue = ref(dayjs())

// 当前年月
const currentYearMonth = computed(() => {
    return currentValue.value.format(dateTime.yearMonthFormat)
})

type DateDto = {
    format: string
    date: number
    inMonth: number
    timestamp: number
}

const GREGORIAN_WEEK_DAY = [0, 1, 2, 3, 4, 5, 6]
const JALALI_WEEK_DAY = [6, 0, 1, 2, 3, 4, 5]

// 周翻译数组
const displayWeekDay = computed(() => {
    if (userSession.calendarType === 'Persian') {
        return JALALI_WEEK_DAY.map((item) => Translate(DEFAULT_WEEK_SHORT_MAPPING[item]))
    }
    return GREGORIAN_WEEK_DAY.map((item) => Translate(DEFAULT_WEEK_SHORT_MAPPING[item]))
})

// 日期Date数组
const dateList = computed(() => {
    const date1 = currentValue.value.date(1)
    const date1Day = date1.day()
    const month = currentValue.value.month()
    const currentDateList: DateDto[] = []
    const prefixDays = userSession.calendarType === 'Persian' ? JALALI_WEEK_DAY.indexOf(date1Day) : GREGORIAN_WEEK_DAY.indexOf(date1Day)

    for (let i = prefixDays; i > 0; i--) {
        const currentDate = date1.subtract(i, 'day')
        currentDateList.push({
            format: formatDate(currentDate, DEFAULT_DATE_FORMAT),
            date: currentDate.format('DD').num(),
            inMonth: -1,
            timestamp: currentDate.valueOf(),
        })
    }

    let currentDate = date1
    while (currentDate.month() === month) {
        currentDateList.push({
            format: formatDate(currentDate, DEFAULT_DATE_FORMAT),
            date: currentDate.format('DD').num(),
            inMonth: 0,
            timestamp: currentDate.valueOf(),
        })
        currentDate = currentDate.add(1, 'day')
    }

    const suffixDays = currentDateList.length % 7 === 0 ? 0 : Math.abs((currentDateList.length % 7) - 7)
    for (let i = 0; i < suffixDays; i++) {
        currentDateList.push({
            format: formatDate(currentDate, DEFAULT_DATE_FORMAT),
            date: currentDate.format('DD').num(),
            inMonth: 1,
            timestamp: currentDate.valueOf(),
        })
        currentDate = currentDate.add(1, 'day')
    }

    return currentDateList
})

/**
 * @description 切换上一月
 */
const prevMonth = () => {
    currentValue.value = currentValue.value.subtract(1, 'month')
}

/**
 * @description 切换下一月
 */
const nextMonth = () => {
    currentValue.value = currentValue.value.add(1, 'month')
}

/**
 * @description 判断当前日期是否显示徽标
 * @param {number} timestamp 毫秒时间戳
 */
const highlight = (timestamp: number) => {
    return props.badge.some((item) => {
        return item <= timestamp && item + 60 * 60 * 24 * 1000 > timestamp
    })
}

/**
 * @description 点击日期
 * @param {number} timestamp
 * @param {number} inMonth
 */
const changeDate = (timestamp: number, inMonth: number) => {
    const date = formatGregoryDate(timestamp, props.valueFormat)
    emits('update:modelValue', date)
    emits('change', date)
    if (inMonth < 0) {
        prevMonth()
    } else if (inMonth > 0) {
        nextMonth()
    }
}
</script>

<style lang="less">
.Calendar {
    background-color: var(--calendar-bg);
    width: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--calendar-border);
    border-left: 1px solid var(--calendar-border);
    font-size: 12px;
    color: var(--main-text);
    flex-shrink: 0;

    &-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--calendar-header-text);
        font-weight: bolder;
        background-color: var(--calendar-header-bg);
        border-right: 1px solid var(--calendar-border);
        height: 28px;
        flex-shrink: 0;

        span:first-child {
            margin-left: 30px;
        }

        span:last-child {
            margin-right: 30px;
        }

        span:first-child,
        span:last-child {
            font-size: 24px;
            font-weight: normal;
            cursor: pointer;
            font-family: consolas, sans-serif;
            user-select: none;
        }

        span:nth-child(2) {
            font-size: 12px;
        }
    }

    &-week {
        width: 100%;
        height: 20px;
        line-height: 20px;
        display: flex;
        border-right: 1px solid var(--calendar-border);
        flex-shrink: 0;
        background-color: var(--calendar-thead-bg);
        box-sizing: border-box;

        div {
            width: 20%;
            font-weight: bolder;
            text-align: center;
        }
    }

    &-body {
        height: 100%;
        display: grid;
        grid-template-columns: repeat(7, 1fr);

        div {
            border-right: 1px solid var(--calendar-border);
            border-bottom: 1px solid var(--calendar-border);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;

            &.none {
                color: var(--calendar-text-disabled);
            }

            &.today {
                color: var(--main-text);
                background-color: var(--calendar-bg-today);
            }

            &:hover,
            &.active {
                background-color: var(--primary);
                color: var(--color-white);
            }

            &.badge {
                &::after {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 100%;
                    background-color: var(--color-error);
                    content: '';
                    top: 2px;
                    right: 2px;
                }
            }
        }
    }
}
</style>
