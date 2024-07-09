/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 13:46:55
 * @Description: 日期时间格式
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-01 13:47:10
 */
import dayjs from 'dayjs'

export const useDateTime = () => {
    const userSession = useUserSessionStore()

    // 日期格式
    const dateFormat = ref('YYYY-MM-dd')
    // 时间格式
    const timeFormat = ref('HH:mm:ss')
    // 日期时间格式
    const dateTimeFormat = computed(() => {
        return dateFormat.value + ' ' + timeFormat.value
    })

    /**
     * @description 获取时间格式化配置
     */
    const getTimeConfig = async () => {
        const result = await queryTimeCfg()
        const $ = queryXml(result)
        timeFormat.value = DEFAULT_MOMENT_MAPPING[$('/response/content/formatInfo/time').text()]
        dateFormat.value = DEFAULT_MOMENT_MAPPING[$('/response/content/formatInfo/date').text()]
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
    }
}
