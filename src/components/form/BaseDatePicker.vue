<!--
 * @Date: 2025-04-01 09:08:45
 * @Description: 时间日期选择器 （Element-Plus无法适配波斯日历，故自行实现适用于本项目的时间日期选择器）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="DatePicker-input">
        <el-popover
            v-model:visible="visible"
            width="252"
            popper-class="no-padding"
            :disabled
            :teleported
            @before-enter="open"
        >
            <template #reference>
                <el-input
                    :model-value="selectedValue"
                    readonly
                    :disabled
                    :placeholder
                >
                    <template #suffix>
                        <BaseImgSprite file="calendar" />
                    </template>
                </el-input>
            </template>
            <div class="DatePicker">
                <div
                    v-show="tab === 'date'"
                    class="DatePicker-date"
                >
                    <div class="DatePicker-date-title">
                        <div class="left">
                            <BaseImgSprite
                                file="datePicker-first"
                                :hover-index="0"
                                :disabled-index="0"
                                class="prev"
                                :disabled="getYearDisabled(currentYear - 1)"
                                @click="preYear"
                            />
                            <BaseImgSprite
                                file="datePicker-prev"
                                :hover-index="0"
                                :disabled-index="0"
                                class="prev"
                                :disabled="getMonthDisabled(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth === 1 ? 12 : currentMonth - 1)"
                                @click="preMonth"
                            />
                        </div>
                        <div
                            class="date"
                            @click="showYearList"
                        >
                            {{ currentYear }}
                        </div>
                        <div
                            class="date"
                            @click="showMonthList"
                        >
                            {{ currentMonth }}
                        </div>
                        <div class="right">
                            <BaseImgSprite
                                file="datePicker-next"
                                :hover-index="0"
                                :disabled="getMonthDisabled(currentMonth === 12 ? currentYear + 1 : currentYear, currentMonth === 12 ? 1 : currentMonth + 1)"
                                class="next"
                                @click="nextMonth"
                            />
                            <BaseImgSprite
                                file="datePicker-last"
                                :hover-index="0"
                                :disabled="getYearDisabled(currentYear + 1)"
                                class="next"
                                @click="nextYear"
                            />
                        </div>
                    </div>
                    <div class="DatePicker-date-week">
                        <div
                            v-for="(item, key) in displayWeekDay"
                            :key
                            class="text-ellipsis"
                        >
                            {{ item }}
                        </div>
                    </div>
                    <div class="DatePicker-date-body">
                        <div
                            v-for="(item, key) in dateList"
                            :key="item.gregorianFormat"
                            :class="{
                                none: item.inMonth !== 0,
                                weekend: userSession.calendarType !== 'Persian' && (key % 7 === 0 || key % 7 === 6),
                                active: item.gregorianFormat === currentDateGregory,
                                disabled: item.disabled,
                            }"
                            @click="changeDate(item.date, item.inMonth, item.disabled)"
                        >
                            {{ item.date }}
                        </div>
                    </div>
                    <div class="DatePicker-date-footer">
                        <BaseTimePicker
                            v-if="visible && type === 'datetime'"
                            v-model="currentTime"
                            :teleported="false"
                            @change="changeTime"
                        />
                        <el-button @click="setToday">{{ Translate('IDCS_CALENDAR_TODAY') }}</el-button>
                        <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                    </div>
                </div>
                <div
                    v-show="tab === 'month'"
                    class="DatePicker-month"
                >
                    <div class="DatePicker-date-title">
                        <BaseImgSprite
                            file="datePicker-prev"
                            :hover-index="0"
                            :disabled-index="0"
                            class="prev"
                            :disabled="getYearDisabled(currentYear - 1)"
                            @click="preYear"
                        />
                        <div @click="showYearList">{{ currentYear }}</div>
                        <BaseImgSprite
                            file="datePicker-next"
                            :hover-index="0"
                            :disabled-index="0"
                            class="next"
                            :disabled="getYearDisabled(currentYear + 1)"
                            @click="nextYear"
                        />
                    </div>
                    <div class="DatePicker-month-body">
                        <div
                            v-for="(item, key) in monthList"
                            :key="item"
                            :class="{
                                active: currentMonth === key + 1,
                                disabled: getMonthDisabled(currentYear, key + 1),
                            }"
                            @click="changeMonth(key)"
                        >
                            {{ item }}
                        </div>
                    </div>
                </div>
                <div
                    v-show="tab === 'year'"
                    class="DatePicker-year"
                >
                    <div class="DatePicker-date-title">
                        <BaseImgSprite
                            file="datePicker-prev"
                            :hover-index="0"
                            :disabled-index="0"
                            :disabled="getYearDisabled(yearRange - 1)"
                            class="prev"
                            @click="prevDecade"
                        />
                        <div
                            class="range"
                            @click="showYearList"
                        >
                            {{ yearRange }} ~ {{ yearRange + 9 }}
                        </div>
                        <BaseImgSprite
                            file="datePicker-next"
                            :hover-index="0"
                            :disabled-index="0"
                            class="next"
                            :disabled="getYearDisabled(yearRange + 10)"
                            @click="nextDecade"
                        />
                    </div>
                    <div class="DatePicker-month-body">
                        <div
                            v-for="(_, key) in 10"
                            :key="key"
                            :class="{
                                active: currentYear === yearRange + key,
                                disabled: getYearDisabled(yearRange + key),
                            }"
                            @click="changeYear(yearRange + key)"
                        >
                            {{ yearRange + key }}
                        </div>
                    </div>
                </div>
            </div>
        </el-popover>
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
         * @property 显示在输入框中的格式
         */
        format?: string
        /**
         * @property 显示类型
         */
        type?: 'datetime' | 'date'
        /**
         * @property 见element-plus el-popover的teleported
         */
        teleported?: boolean
        /**
         * @property 是否禁用
         */
        disabled?: boolean
        /**
         * @property input placeholder
         */
        placeholder?: string
        /**
         * @property 日期可选范围(包含) YYYY-MM-DD
         */
        range?: [string, string]
    }>(),
    {
        teleported: true,
        disabled: false,
        placeholder: '',
        type: 'date',
        range: () => ['2010-01-01', '2037-12-31'],
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
    (e: 'visibleChange', value: boolean): void
}>()

const dateTime = useDateTimeStore()
const userSession = useUserSessionStore()
const { Translate } = useLangStore()

const visible = ref(false)

// 输入框显示值
const selectedValue = computed(() => {
    if (!props.modelValue) {
        return ''
    }

    if (props.type === 'datetime') {
        return dayjs(props.modelValue, props.valueFormat || dateTime.dateTimeFormat).format(props.format || dateTime.dateTimeFormat)
    } else {
        return dayjs(props.modelValue, props.valueFormat || dateTime.dateFormat).format(props.format || dateTime.dateFormat)
    }
})

// 当前显示日历/月历/年历 year month date
const tab = ref('date')

// 当前日期
const currentValue = ref(dayjs())
// 当前时间
const currentTime = ref('00:00:00')

// 当前日期的公历表示
const currentDateGregory = computed(() => {
    return currentValue.value.calendar('gregory').format(dateTime.dateFormat)
})

// 当前年
const currentYear = computed(() => {
    return currentValue.value.format('YYYY').num()
})

// 当前月
const currentMonth = computed(() => {
    return currentValue.value.format('MM').num()
})

// 可选范围开始时间戳
const rangeStart = computed(() => {
    return dayjs(props.range[0], { format: DEFAULT_YMD_FORMAT, jalali: false }).valueOf()
})

// 可选范围结束时间戳
const rangeEnd = computed(() => {
    return dayjs(props.range[1], { format: DEFAULT_YMD_FORMAT, jalali: false }).valueOf()
})

/**
 * @description 获取该年份是否禁用
 * @param {number} year
 */
const getYearDisabled = (year: number) => {
    const rangeStartYear = dayjs(rangeStart.value).calendar('gregory').year()
    const rangeEndYear = dayjs(rangeEnd.value).calendar('gregory').year()
    return year < rangeStartYear || year > rangeEndYear
}

/**
 * @description 获取该月份是否禁用
 * @param {number} year
 * @param {number} month 从1开始，1-12
 */
const getMonthDisabled = (year: number, month: number) => {
    const rangeStartMonth = dayjs(rangeStart.value).calendar('gregory').date(1).valueOf()
    const rangeEndMonth = dayjs(rangeEnd.value).calendar('gregory').valueOf()
    const rangeEndDate = dayjs(rangeEnd.value).calendar('gregory').date()
    const firstDate = dayjs(`${year}-${month}-01`, { format: DEFAULT_YMD_FORMAT, jalali: false }).valueOf()
    const daysInMonth = padStart(Math.min(dayjs(firstDate).daysInMonth(), rangeEndDate), 2)
    const lastDate = dayjs(`${year}-${month}-${daysInMonth}`, { format: DEFAULT_YMD_FORMAT, jalali: false }).valueOf()
    return firstDate < rangeStartMonth || lastDate > rangeEndMonth
}

/**
 * @description 获取该日期是否禁用
 * @param {number} year
 * @param {number} month 从1开始，1-12
 * @param {number} date
 */
const getDateDisabled = (currentDate: dayjs.Dayjs) => {
    const date = currentDate.hour(0).minute(0).second(0).valueOf()
    return date < rangeStart.value || date > rangeEnd.value
}

type DateDto = {
    gregorianFormat: string
    date: number
    inMonth: number
    disabled: boolean
}

/**
 * @description 打开日期选择器时初始化
 */
const open = () => {
    let flag = false
    currentValue.value = dayjs(props.modelValue, props.valueFormat || (props.type === 'datetime' ? dateTime.dateTimeFormat : dateTime.dateFormat))

    if (!currentValue.value.isValid()) {
        currentValue.value = dayjs(Date.now())
        flag = true
    }

    const current = currentValue.value.hour(0).minute(0).second(0)
    if (current.isBefore(rangeStart.value)) {
        currentValue.value = dayjs(rangeStart.value)
        flag = true
    } else if (current.isAfter(rangeEnd.value)) {
        currentValue.value = dayjs(rangeEnd.value)
        flag = true
    }

    if (flag) {
        changeValue()
    }

    tab.value = 'date'

    if (props.type === 'datetime') {
        currentTime.value = currentValue.value.format(DEFAULT_TIME_FORMAT)
    }
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
            gregorianFormat: currentDate.calendar('gregory').format(dateTime.dateFormat),
            date: currentDate.format('DD').num(),
            inMonth: -1,
            disabled: getDateDisabled(currentDate),
        })
    }

    let currentDate = date1
    while (currentDate.month() === month) {
        currentDateList.push({
            gregorianFormat: currentDate.calendar('gregory').format(dateTime.dateFormat),
            date: currentDate.format('DD').num(),
            inMonth: 0,
            disabled: getDateDisabled(currentDate),
        })
        currentDate = currentDate.add(1, 'day')
    }

    const suffixDays = currentDateList.length % 7 === 0 ? 0 : Math.abs((currentDateList.length % 7) - 7)
    for (let i = 0; i < suffixDays; i++) {
        currentDateList.push({
            gregorianFormat: currentDate.calendar('gregory').format(dateTime.dateFormat),
            date: currentDate.format('DD').num(),
            inMonth: 1,
            disabled: getDateDisabled(currentDate),
        })
        currentDate = currentDate.add(1, 'day')
    }

    return currentDateList
})

// 月数组
const monthList = ref(
    Array(12)
        .fill(0)
        .map((_, index) => Translate(DEFAULT_MONTH_SHORT_MAPPING[index])),
)

/**
 * @description 更改日期
 * @param {number} date
 * @param {number} month
 */
const changeDate = (date: number, month: number, disabled: boolean) => {
    if (disabled) {
        return
    }
    currentValue.value = currentValue.value.add(month, 'month').date(date)
    changeValue()
}

/**
 * @description 切换上一年
 */
const preYear = () => {
    currentValue.value = currentValue.value.subtract(1, 'year')
    changeValue()
}

/**
 * @description 切换下一年
 */
const nextYear = () => {
    currentValue.value = currentValue.value.add(1, 'year')
    changeValue()
}

/**
 * @description 更改年
 * @param {number} year
 */
const changeYear = (year: number) => {
    if (getYearDisabled(year)) {
        return
    }
    currentValue.value = currentValue.value.year(year)
    changeValue()
    tab.value = 'month'
}

/**
 * @description 切换上一月
 */
const preMonth = () => {
    currentValue.value = currentValue.value.subtract(1, 'month')
    changeValue()
}

/**
 * @description 切换下一月
 */
const nextMonth = () => {
    currentValue.value = currentValue.value.add(1, 'month')
    changeValue()
}

/**
 * @description 更改月
 * @param {number} month
 */
const changeMonth = (month: number) => {
    if (getMonthDisabled(currentYear.value, month + 1)) {
        return
    }
    currentValue.value = currentValue.value.month(month)
    changeValue()
    tab.value = 'date'
}

// 当前年历的
const yearRange = ref(0)

/**
 * @description 切换年历
 */
const showYearList = () => {
    tab.value = 'year'
    yearRange.value = Math.floor(currentYear.value / 10) * 10
}

/**
 * @description 上个十年
 */
const prevDecade = () => {
    yearRange.value -= 10
}

/**
 * @description 下个十年
 */
const nextDecade = () => {
    yearRange.value += 10
}

/**
 * @description 切换月历
 */
const showMonthList = () => {
    tab.value = 'month'
}

/**
 * @description 更改时间
 */
const changeTime = () => {
    changeValue()
}

/**
 * @description 设置今天
 */
const setToday = () => {
    currentValue.value = dayjs()
    currentTime.value = dayjs().format(DEFAULT_TIME_FORMAT)
}

/**
 * @description 点击确定
 */
const confirm = () => {
    changeValue()
    emits('change', props.modelValue)
    visible.value = false
}

/**
 * @description 更新数据
 */
const changeValue = () => {
    if (props.type === 'datetime') {
        const currentTimeInstance = dayjs(currentTime.value, DEFAULT_TIME_FORMAT)
        currentValue.value = currentValue.value.hour(currentTimeInstance.hour()).minute(currentTimeInstance.minute()).second(currentTimeInstance.second())
    }

    emits('update:modelValue', currentValue.value.calendar('gregory').format(props.format || (props.type === 'datetime' ? dateTime.dateTimeFormat : dateTime.dateFormat)))
}

watch(visible, (val) => {
    emits('visibleChange', val)
})
</script>

<style lang="less">
.DatePicker {
    color: var(--datepicker-text);
    font-size: 12px;
    width: 250px;
    background-color: var(--color-white);

    &-input {
        width: var(--form-input-width);
        display: inline-block;
    }

    &-date {
        &-title {
            width: 100%;
            display: flex;
            height: 32px;
            line-height: 32px;
            align-items: center;
            border-bottom: 1px solid var(--datepicker-border);

            div {
                width: 100%;
                text-align: center;

                &:hover {
                    color: var(--primary);
                    cursor: pointer;
                }

                &.date {
                    width: 50px;
                }

                &.left {
                    display: flex;
                    justify-content: flex-start;
                }

                &.right {
                    display: flex;
                    justify-content: flex-end;
                }
            }

            .prev {
                margin-left: 5px;
                flex-shrink: 0;

                &.disabled {
                    opacity: 0.6;
                }
            }

            .next {
                margin-right: 5px;
                flex-shrink: 0;

                &.disabled {
                    opacity: 0.6;
                }
            }
        }

        &-week {
            width: 100%;
            height: 20px;
            display: flex;

            border-bottom: 1px solid var(--datepicker-border);
            background-color: var(--datepicker-header-bg);
            box-sizing: border-box;

            div {
                flex: 1;
                font-weight: bolder;
                text-align: center;
            }
        }

        &-body {
            width: 100%;
            height: fit-content;
            display: grid;
            grid-template-columns: repeat(7, 1fr);

            div {
                border: 1px solid transparent;
                box-sizing: border-box;
                text-align: center;
                cursor: pointer;

                &.weekend {
                    color: var(--color-error);
                }

                &.none {
                    color: var(--color-grey);
                }

                &.active,
                &:hover {
                    color: var(--datepicker-text-hover);
                    border-color: currentColor;
                    background-color: var(--datepicker-bg-hover);
                }

                &.disabled,
                &.disabled:hover {
                    color: var(--color-grey);
                    border-color: transparent;
                    background-color: transparent;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
            }
        }

        &-footer {
            display: flex;
            padding: 5px;
            border-top: 1px solid var(--datepicker-border);
            justify-content: flex-end;

            #n9web & .el-button {
                --el-button-bg-color: var(--datepicker-btn-bg);
                --el-button-border-color: var(--datepicker-btn-border);
                --el-button-text-color: var(--datepicker-btn-text);
                --el-button-hover-bg-color: var(--datepicker-btn-bg);
                --el-button-hover-border-color: var(--datepicker-btn-border);
                --el-button-hover-text-color: var(--datepicker-btn-text);

                min-width: 55px;
                height: 20px;
                line-height: 20px;
                margin-left: 5px;
            }

            #n9web & .el-input {
                --el-input-border-color: var(--datepicker-input-border);

                &__wrapper {
                    background-color: var(--datepicker-input-bg);
                }

                &__inner {
                    color: var(--datepicker-input-text);
                }

                height: 20px;
                line-height: 20px;
            }
        }
    }

    &-month {
        &-body {
            width: 100%;
            height: fit-content;
            display: flex;
            flex-wrap: wrap;
            box-sizing: border-box;
            padding: 5px;

            div {
                width: 25%;
                height: 30px;
                line-height: 30px;
                text-align: center;
                border: 1px solid transparent;
                box-sizing: border-box;
                cursor: pointer;

                &.active,
                &:hover {
                    color: var(--datepicker-text-hover);
                    border-color: currentColor;
                    background-color: var(--datepicker-bg-hover);
                }

                &.disabled,
                &.disabled:hover {
                    color: var(--color-grey);
                    border-color: transparent;
                    background-color: transparent;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
            }
        }
    }
}
</style>
