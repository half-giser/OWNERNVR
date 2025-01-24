/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 11:33:23
 * @Description: 统计界面的一些通用方法
 */
import dayjs from 'dayjs'
import { type BarChartXValueOptionItem } from '@/components/chart/BaseBarChart.vue'

export const useStatsAxis = (dateRangeType: Ref<string> | ComputedRef<string>, dateRange: Ref<[number, number]> | ComputedRef<[number, number]>) => {
    const { Translate } = useLangStore()
    const dateTime = useDateTimeStore()

    const MONTH_MAPPING = getTranslateMapping(DEFAULT_MONTH_MAPPING)
    const WEEK_MAPPING = getTranslateMapping(DEFAULT_WEEK_MAPPING)

    const dateArray = Array(24).fill(0)
    const weekArray = Array(7).fill(0)
    const quarterArray = Array(3).fill(0)

    /**
     * @description 获取X轴刻度数量
     * @param {string} dateRangeType
     * @param {[number, number]} dateRange
     * @returns {number}
     */
    const getTimeQuantum = () => {
        switch (dateRangeType.value) {
            case 'date':
            case 'today':
                return 24
            case 'week':
                return 7
            case 'month':
                return dayjs(dateRange.value[0]).daysInMonth()
            case 'quarter':
                return 3
            case 'custom':
                if (dayjs(dateRange.value[0]).isSame(dayjs(dateRange.value[1]), 'day')) {
                    return formatDate(dateRange.value[0], dateTime.dateFormat)
                }
                return Math.ceil((dateRange.value[1] - dateRange.value[0]) / (1000 * 24 * 3600))
            default:
                return 1
        }
    }

    /**
     * @description 获取格式化的时间范围
     * @param {string} dateRangeType
     * @param {[number, number]} dateRange
     * @returns {string}
     */
    const getTimeRange = () => {
        if (dateRangeType.value === 'date') {
            return formatDate(dateRange.value[0], dateTime.dateFormat)
        }

        if (dateRangeType.value === 'month') {
            return formatDate(dateRange.value[0], dateTime.yearMonthFormat)
        }

        if (dateRangeType.value === 'quarter') {
            return formatDate(dateRange.value[0], dateTime.yearMonthFormat) + ' - ' + formatDate(dateRange.value[0], dateTime.yearMonthFormat)
        }

        if (dateRangeType.value === 'week') {
            return formatDate(dateRange.value[0], dateTime.dateFormat) + ' ' + formatDate(dateRange.value[1], dateTime.dateFormat)
        }

        if (dateRangeType.value === 'custom') {
            if (dayjs(dateRange.value[0]).isSame(dayjs(dateRange.value[1]), 'day')) {
                return formatDate(dateRange.value[0], dateTime.dateFormat)
            }
            return formatDate(dateRange.value[0], dateTime.dateFormat) + ' ' + formatDate(dateRange.value[1], dateTime.dateFormat)
        }
        return ''
    }

    /**
     * @description 获取图表的单位值
     * @param {string} dateRangeType
     * @param {[number, number]} dateRange
     * @returns {string}
     */
    const getUnit = () => {
        if (dateRangeType.value === 'date') {
            return Translate('IDCS_HOUR')
        } else if (dateRangeType.value === 'custom') {
            if (formatDate(dateRange.value[0], 'YYYY-MM-DD') === formatDate(dateRange.value[1], 'YYYY-MM-DD')) {
                return Translate('IDCS_HOUR')
            }
            return ''
        } else {
            return ''
        }
    }

    /**
     * @description 获取图表Y轴的最大刻度
     * @param {number} num
     * @returns {number}
     */
    const calY = (num: number) => {
        let n = num - (num % 5) + 5
        while ((n / 5) % 5 !== 0) {
            n++
        }
        return n
    }

    /**
     * @description 获取表格列
     * @param {string} dateRangeType
     * @param {[number, number]} dateRange
     * @returns {number}
     */
    const calLabel = () => {
        if (dateRangeType.value === 'date') {
            return dateArray.map((_, index) => {
                return index + 1 + Translate('IDCS_HOUR')
            })
        }

        if (dateRangeType.value === 'month') {
            const date = dayjs(dateRange.value[0])
            const days = date.daysInMonth()
            return Array(days)
                .fill(0)
                .map((_, index) => {
                    const day = date.date(index + 1)
                    return day.format(dateTime.monthDateFormat)
                })
        }

        if (dateRangeType.value === 'week') {
            const date = dayjs(dateRange.value[0])
            return weekArray.map((_, index) => {
                return WEEK_MAPPING[date.add(index, 'day').day()]
            })
        }

        if (dateRangeType.value === 'quarter') {
            const date = dayjs(dateRange.value[0])
            return quarterArray.map((_, index) => {
                return MONTH_MAPPING[date.add(index, 'month').month()]
            })
        }

        if (dateRangeType.value === 'custom') {
            if (formatDate(dateRange.value[0], 'YYYY-MM-DD') === formatDate(dateRange.value[1], 'YYYY-MM-DD')) {
                return dateArray.map((_, index) => {
                    return index + 1 + Translate('IDCS_HOUR')
                })
            }
            const quatum = Math.ceil((dateRange.value[1] - dateRange.value[0]) / (1000 * 24 * 3600))
            const date = dayjs(dateRange.value[0])
            return Array(quatum)
                .fill(0)
                .map((_, index) => {
                    return date.add(index, 'month').format(dateTime.monthDateFormat)
                })
        }
        return []
    }

    /**
     * @description 获取图表的X轴刻度
     * @param {string} dateRangeType
     * @param {[number, number]} dateRange
     * @returns {BarChartXValueOptionItem[]}
     */
    const calX = (): BarChartXValueOptionItem[] => {
        if (dateRangeType.value === 'date') {
            return dateArray.map((_, index) => {
                return {
                    value: index + 1,
                    showBig: (index + 1) % 3 === 0,
                }
            })
        }

        if (dateRangeType.value === 'month') {
            const date = dayjs(dateRange.value[0])
            const days = date.daysInMonth()
            return Array(days)
                .fill(0)
                .map((_, index) => {
                    const day = date.date(index + 1)
                    return {
                        value: day.format(dateTime.monthDateFormat),
                        showBig: day.day() === 1,
                    }
                })
        }

        if (dateRangeType.value === 'week') {
            const date = dayjs(dateRange.value[0])
            return weekArray.map((_, index) => {
                return {
                    value: WEEK_MAPPING[date.add(index, 'day').day()],
                    showBig: true,
                }
            })
        }

        if (dateRangeType.value === 'quarter') {
            const date = dayjs(dateRange.value[0])
            return quarterArray.map((_, index) => {
                return {
                    value: MONTH_MAPPING[date.add(index, 'month').month()],
                    showBig: true,
                }
            })
        }

        if (dateRangeType.value === 'custom') {
            if (dayjs(dateRange.value[0]).isSame(dayjs(dateRange.value[1]), 'day')) {
                return dateArray.map((_, index) => {
                    return {
                        value: index + 1,
                        showBig: (index + 1) % 3 === 0,
                    }
                })
            } else {
                const quatum = Math.ceil((dateRange.value[1] - dateRange.value[0]) / (1000 * 24 * 3600))
                const date = dayjs(dateRange.value[0])
                return Array(quatum)
                    .fill(0)
                    .map((_, index) => {
                        return {
                            value: date.add(index, 'month').format(dateTime.monthDateFormat),
                            showBig: quatum <= 10 || index % 2 === 0,
                        }
                    })
            }
        }
        return []
    }

    return {
        calX,
        calY,
        calLabel,
        getUnit,
        getTimeRange,
        getTimeQuantum,
    }
}
