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

    const ready = ref(false)

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
    const getTimeConfig = async (force = false) => {
        if (!force && ready.value) {
            return
        }
        // try {
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
            systemTime = dayjs($('content/synchronizeInfo/currentTime').text(), dateTimeFormat.value)
            localTime = performance.now()
            ready.value = true
        }
        // } catch(e) {}
        return $
    }

    /**
     * @description 获取设备时间
     * @returns {dayjs}
     */
    const getSystemTime = () => {
        return systemTime.add(Math.round((performance.now() - localTime) / 1000), 's')
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
