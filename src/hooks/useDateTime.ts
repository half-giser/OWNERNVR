/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 13:46:55
 * @Description: 日期时间格式
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:11:49
 */
import dayjs from 'dayjs'

export const useDateTime = () => {
    const userSession = useUserSessionStore()

    const YMD_MAPPING: Record<string, string> = {
        'year-month-day': 'YYYY/MM/DD',
        'month-day-year': 'MM/DD/YYYY',
        'day-month-year': 'DD/MM/YYYY',
    }

    const HMS_MAPPING: Record<string, string> = {
        '24': 'HH:mm:ss',
        '12': 'hh:mm:ss A',
    }

    const YM_MAPPING: Record<string, string> = {
        'year-month-day': 'YYYY/MM',
        'month-day-year': 'MM/YYYY',
        'day-month-year': 'MM/YYYY',
    }

    const HM_MAPPIMG: Record<string, string> = {
        '24': 'HH:mm',
        '12': 'hh:mm A',
    }

    // 日期格式
    const dateFormat = ref('YYYY/MM/DD')
    // 时间格式
    const timeFormat = ref('HH:mm:ss')
    // 日期时间格式
    const dateTimeFormat = ref('YYYY/MM/DD HH:mm:ss')

    const yearMonthFormat = ref('YYYY/MM')
    const hourMinuteFormat = ref('HH:mm')

    /**
     * @description 获取时间格式化配置
     */
    const getTimeConfig = async () => {
        const result = await queryTimeCfg()
        const $ = queryXml(result)
        const time = $('/response/content/formatInfo/time').text()
        const date = $('/response/content/formatInfo/date').text()
        dateFormat.value = YMD_MAPPING[date]
        yearMonthFormat.value = YM_MAPPING[date]
        timeFormat.value = HMS_MAPPING[time]
        hourMinuteFormat.value = HM_MAPPIMG[time]
        dateTimeFormat.value = dateFormat.value + ' ' + timeFormat.value
        return $
    }

    /**
     * @description 日历周末高亮
     * @param {Date} date
     * @returns
     */
    const highlightWeekend = (date: Date) => {
        if (userSession.calendarType === 'Persian') {
            return ''
        }
        const day = dayjs(date).day()
        if (day === 0 || day === 6) {
            return 'highlight'
        }
        return ''
    }

    return {
        dateFormat,
        timeFormat,
        dateTimeFormat,
        getTimeConfig,
        highlightWeekend,
        yearMonthFormat,
        hourMinuteFormat,
    }
}
