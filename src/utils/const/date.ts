/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-12-26 19:04:02
 * @Description: 日期相关常量
 */

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'

const TIME_ZONE = [
    'GMT+12',
    'GMT+11',
    'HAST10HADT,M3.2.0,M11.1.0',
    'AKST9AKDT,M3.2.0,M11.1.0',
    'PST8PDT,M3.2.0,M11.1.0',
    'MST7MDT,M3.2.0,M11.1.0',
    'CST6CDT,M3.2.0,M11.1.0',
    'CST6CDT,M4.1.0,M10.5.0',
    'CST5CDT,M3.2.0/0,M11.1.0/1',
    'EST5EDT,M3.2.0,M11.1.0',
    'VET4:30',
    'CST4CDT,M3.2.0,M11.1.0',
    'AMT4AMST,M10.3.0/0,M2.3.0/0',
    'AST4',
    'PYT4PYST,M10.1.0/0,M4.2.0/0',
    'CLT4CLST,M10.2.0/0,M3.2.0/0',
    'NST3:30NDT,M3.2.0,M11.1.0',
    'BRT3BRST,M10.3.0/0,M2.3.0/0',
    'ART3',
    'WGT3WGST,M3.5.6/22,M10.5.6/23',
    'UYT3UYST,M10.1.0,M3.2.0',
    'FNT2',
    'AZOT1AZOST,M3.5.0/0,M10.5.0/1',
    'GMT0BST,M3.5.0/1,M10.5.0',
    'CET-1CEST,M3.5.0,M10.5.0/3',
    'WAT-1WAST,M9.1.0,M4.1.0',
    'EET-2EEST,M3.5.0/3,M10.5.0/4',
    'EET-2',
    'IST-2IDT,M3.5.5/2,M10.5.0/2',
    'SAST-2',
    'EET-2EEST,M3.5.0/0,M10.5.0/0',
    'EET-2EEST,M3.5.5/0,M10.5.5/0',
    'AST-3',
    'MSK-3',
    'IRST-3:30IRDT-4:30,J80/0,J264/0',
    'AZT-4AZST,M3.5.0/4,M10.5.0/5',
    'GST-4',
    'AFT-4:30',
    'PKT-5',
    'IST-5:30',
    'NPT-5:45',
    'ALMT-6',
    'MMT-6:30',
    'WIT-7',
    'CST-8',
    'WST-8',
    'JST-9',
    'CST-9:30',
    'CST-9:30CST,M10.1.0,M4.1.0/3',
    'YAKT-10',
    'EST-10EST,M10.1.0,M4.1.0/3',
    'SBT-11',
    'NFT-11:30',
    'NZST-12NZDT,M9.5.0,M4.1.0/3',
    'FJT-12FJST,M10.5.0,M1.3.0/3',
    'PETT-12PETST,M3.5.0,M10.5.0/3',
    'MHT-12',
    'CHAST-12:45CHADT,M9.5.0/2:45,M4.1.0/3:45',
    'TOT-13',
    'SST-13SDT,M9.5.0/3,M4.1.0/4',
]

/**
 * @description 时区及是否支持夏令时
 */
export const DEFAULT_TIME_ZONE = TIME_ZONE.map((timeZone) => {
    return {
        timeZone: timeZone,
        enableDst: getIsEnableDST(timeZone),
    }
})

/**
 * @description 默认的Moment格式化映射
 */
export const DEFAULT_MOMENT_MAPPING: Record<string, string> = {
    'year-month-day': 'YYYY/MM/DD',
    'month-day-year': 'MM/DD/YYYY',
    'day-month-year': 'DD/MM/YYYY',
    '24': 'HH:mm:ss',
    '12': 'hh:mm:ss A',
}

/**
 * 日历类型MAP
 */
export const CALENDAR_TYPE_MAPPING: Record<string, { value: string; text: string; isDefault?: boolean }[]> = {
    fa: [
        {
            value: 'Gregorian',
            text: 'IDCS_GREGORIAN_CALENDAR',
        },
        {
            value: 'Persian',
            text: 'IDCS_PERSIAN_CANENDAR',
            isDefault: true,
        },
    ],
}

export const DEFAULT_MONTH_MAPPING: Record<string, string> = {
    0: 'IDCS_Month_ONE',
    1: 'IDCS_Month_TWO',
    2: 'IDCS_Month_THREE',
    3: 'IDCS_Month_FOUR',
    4: 'IDCS_Month_FIVE',
    5: 'IDCS_Month_SIX',
    6: 'IDCS_Month_SEVEN',
    7: 'IDCS_Month_EIGHT',
    8: 'IDCS_Month_NINE',
    9: 'IDCS_Month_TEM',
    10: 'IDCS_Month_ELEVEN',
    11: 'IDCS_Month_TWELVE',
}

export const DEFAULT_MONTH_SHORT_MAPPING: Record<string, string> = {
    0: 'IDCS_CALENDAR_JANUARY',
    1: 'IDCS_CALENDAR_FEBRUARY',
    2: 'IDCS_CALENDAR_MARCH',
    3: 'IDCS_CALENDAR_APRIL',
    4: 'IDCS_CALENDAR_MAY',
    5: 'IDCS_CALENDAR_JUNE',
    6: 'IDCS_CALENDAR_JULY',
    7: 'IDCS_CALENDAR_AUGUST',
    8: 'IDCS_CALENDAR_SEPTEMBER',
    9: 'IDCS_CALENDAR_OCTOBER',
    10: 'IDCS_CALENDAR_NOVEMBER',
    11: 'IDCS_CALENDAR_DECEMBER',
}

export const DEFAULT_WEEK_MAPPING: Record<string, string> = {
    0: 'IDCS_WEEK_DAY_SEVEN',
    1: 'IDCS_WEEK_DAY_ONE',
    2: 'IDCS_WEEK_DAY_TWO',
    3: 'IDCS_WEEK_DAY_THREE',
    4: 'IDCS_WEEK_DAY_FOUR',
    5: 'IDCS_WEEK_DAY_FIVE',
    6: 'IDCS_WEEK_DAY_SIX',
    7: 'IDCS_WEEK_DAY_SEVEN',
}

export const DEFAULT_WEEK_MAPPING2: Record<string, string> = {
    0: 'IDCS_SUNDAY',
    1: 'IDCS_MONDAY',
    2: 'IDCS_TUESDAY',
    3: 'IDCS_WEDNESDAY',
    4: 'IDCS_THURSDAY',
    5: 'IDCS_FRIDAY',
    6: 'IDCS_SATURDAY',
    7: 'IDCS_SUNDAY',
}

export const DEFAULT_WEEK_SHORT_MAPPING: Record<string, string> = {
    0: 'IDCS_CALENDAR_SUNDAY',
    1: 'IDCS_CALENDAR_MONDAY',
    2: 'IDCS_CALENDAR_TUESDAY',
    3: 'IDCS_CALENDAR_WEDNESDAY',
    4: 'IDCS_CALENDAR_THURSDAY',
    5: 'IDCS_CALENDAR_FRIDAY',
    6: 'IDCS_CALENDAR_SATURDAY',
    7: 'IDCS_CALENDAR_SUNDAY',
}

export const DEFAULT_DATE_FORMAT_MAPPING: Record<string, string> = {
    'year-month-day': 'IDCS_DATE_FORMAT_YMD',
    'month-day-year': 'IDCS_DATE_FORMAT_MDY',
    'day-month-year': 'IDCS_DATE_FORMAT_DMY',
}

export const DEFAULT_TIME_FORMAT_MAPPING: Record<string, string> = {
    24: 'IDCS_TIME_FORMAT_24',
    12: 'IDCS_TIME_FORMAT_12',
}
