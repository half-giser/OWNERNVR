/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 16:37:01
 * @Description: 时间日期格式化
 */
import dayjs from 'dayjs'

export const useDateTimeStore = defineStore('dateTime', () => {
    const YMD_MAPPING: Record<string, string> = {
        'year-month-day': 'YYYY/MM/DD',
        'month-day-year': 'MM/DD/YYYY',
        'day-month-year': 'DD/MM/YYYY',
    }

    const YMD_INDEX_MAPPING: Record<string, number[]> = {
        'year-month-day': [0, 1, 2],
        'month-day-year': [2, 0, 1],
        'day-month-year': [2, 1, 0],
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

    const MD_MAPPING: Record<string, string> = {
        'year-month-day': 'MM/DD',
        'month-day-year': 'MM/DD',
        'day-month-year': 'DD/MM',
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
    // 年月时间格式
    const yearMonthFormat = ref('YYYY/MM')
    // 时分时间格式
    const hourMinuteFormat = ref('HH:mm')
    // 月日时间格式
    const monthDateFormat = ref('MM/DD')

    const timeMode = ref(24)

    // 设备时间
    let systemTime = dayjs()
    // 本地时间
    let localTime = performance.now()

    /**
     * @description 获取时间格式化配置
     * @param {boolean} force 是否强制刷新日期格式化配置
     */
    const getTimeConfig = async () => {
        const result = await queryTimeCfg()
        const $ = queryXml(result)
        if ($('status').text() === 'success') {
            const time = $('content/formatInfo/time').text().num()
            const date = $('content/formatInfo/date').text()
            dateFormat.value = YMD_MAPPING[date]
            yearMonthFormat.value = YM_MAPPING[date]
            timeFormat.value = HMS_MAPPING[time]
            hourMinuteFormat.value = HM_MAPPIMG[time]
            dateTimeFormat.value = dateFormat.value + ' ' + timeFormat.value
            monthDateFormat.value = MD_MAPPING[date]
            timeMode.value = time

            // 由于波斯日历插件不支持DD/MM/YYYY格式，这里手动转换为YYYY/MM/DD格式
            const currentTime = $('content/synchronizeInfo/currentTime').text()
            const splitCurrentTime = currentTime.split(' ')
            const ymd = splitCurrentTime.shift()!.split('/')
            const yearMatch = ymd[YMD_INDEX_MAPPING[date][0]]
            const monthMatch = ymd[YMD_INDEX_MAPPING[date][1]]
            const dateMatch = ymd[YMD_INDEX_MAPPING[date][2]]
            systemTime = dayjs(`${yearMatch}/${monthMatch}/${dateMatch} ${splitCurrentTime.join(' ')}`, { format: `${DEFAULT_YMD_FORMAT} ${timeFormat.value}`, jalali: false })
            localTime = performance.now()
        }
        return $
    }

    /**
     * @description 获取设备时间
     * @returns {dayjs}
     */
    const getSystemTime = () => {
        return systemTime.add(Math.round(performance.now() - localTime), 'ms')
    }

    return {
        dateFormat,
        timeFormat,
        dateTimeFormat,
        yearMonthFormat,
        hourMinuteFormat,
        monthDateFormat,
        getTimeConfig,
        getSystemTime,
        timeMode,
    }
})
