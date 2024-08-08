/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 09:40:06
 * @Description: 日期模块
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-06 10:31:45
 */
import dayjs from 'dayjs'

/**
 * @see https://day.js.org/
 */

/**
 * @description: 格式化日期.
 * 如果useUserSessionStore().calenderType === 'Persian'，执行本方法会自动将公历日期转换为波斯历日期
 * @param {string | number | Date | dayjs.Dayjs} date 日期值
 * @param {string} format 格式类型, 24小时制 YYYY-MM-DD HH:mm:ss, 12小时制 YYYY-MM-DD hh:mm:ss A(a)
 * @param {string} fromFormat 如果传入date的值是字符创，指定当前date的格式化类型
 * @return {string} 返回的格式化日期
 */
export const formatDate = (date: string | number | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss', fromFormat: string = ''): string => {
    if (date === '') {
        return date
    }
    if (typeof date === 'string' && fromFormat) {
        return dayjs(date, fromFormat).format(format)
    }
    return dayjs(date).format(format)
}

/**
 * @description 根据时间戳（单位秒）返回格式化时间
 * @param {number} seconds 秒
 * @returns {string}
 */
export const formatSeconds = (seconds: number) => {
    return dayjs.utc(seconds * 1000).format('HH:mm:ss')
}

/**
 * @description 根据时间戳（单位秒）返回对应的UTC时间字符串
 * @param {number} timestamp 秒
 * @returns {string}
 */
export const getUTCDateByMilliseconds = (timestamp: number) => {
    return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * @description UTC时间转本地时间
 * @param { string | number | Date | dayjs.Dayjs } date UTC时间
 * @param { string } format 本地时间的日期格式
 * @returns {string} 格式化后的本地时间
 */
export const utcToLocal = (date: string | number | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (date === 'string') {
        return dayjs.utc(date, 'YYYY-MM-DD HH:mm:ss').local().format(format)
    }
    return dayjs.utc(date).local().format(format)
}

/**
 * @description 本地时间转UTC时间
 * @param { string | number | Date | dayjs.Dayjs } date 本地时间
 * @param format 本地时间的日期格式
 * @returns {string} 格式化后的UTC时间（YYYY-MM-DD HH:mm:ss）
 */
export const localToUtc = (date: string | number | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (typeof date === 'string') {
        return dayjs(date, format).utc().calendar('gregory').format('YYYY-MM-DD HH:mm:ss')
    }
    return dayjs(date).utc().calendar('gregory').format('YYYY-MM-DD HH:mm:ss')
}

/**
 * @description 波斯日历转公历
 * @param {string} date 波斯历日期
 * @param {string} format 日期格式
 * @returns {string} 公历格式化后的日期
 */
export const persianToGregory = (date: string, format: string) => {
    return dayjs(date, { jalali: true, format }).calendar('gregory').format(format)
}

/**
 * @description 公历转波斯日历
 * @param {string} date 公历日期
 * @param {string} format 日期格式
 * @returns {string} 波斯日历格式化后的日期
 */
export const gregoryToPersian = (date: string, format: string) => {
    return dayjs(date, { format, jalali: false }).calendar('jalali').format(format)
}

// UTC时间转当地时间
// export const UTCTime2LocalTime = (dateObj: Date) => {
//     var t_offset = dateObj.getTimezoneOffset();
//     var utcTime = dateObj.getTime() - t_offset * 60 * 1000;
//     dateObj.setTime(utcTime);
//     return dateObj;
// }

/**
 * @description 当地时间转UTC时间
 * @param dateObj
 * @returns {Date}
 */
// export const LocalTime2UTCTime = (dateObj: Date) => {
//     const t_offset = dateObj.getTimezoneOffset()
//     const utcTime = dateObj.getTime() + t_offset * 60 * 1000
//     dateObj.setTime(utcTime)
//     return dateObj
// }

/**
 * @description 判断是否夏令时
 * 夏令时: 夏令时开始时, 时间往前拨快一小时, 夏令时结束时, 则往回拨一小时（大约是每年3月份至10月份, 具体日期各个地区国家不一致）
 * 此处用夏至日和冬至日的UTC偏移量做判断. 若夏至日和冬至日UTC偏移量相等，则此地区没有冬夏令时
 */
export const isDST = (str: string, format = 'YYYY-MM-DD hh:mm:ss') => {
    const winterSolstice = dayjs('12-22', 'MM-DD').utcOffset()
    const summerSolstice = dayjs('06-22', 'MM-DD').utcOffset()
    if (winterSolstice === summerSolstice) return false
    if (dayjs(str, format).utcOffset() === summerSolstice) return true
    return false
}
