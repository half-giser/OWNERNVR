/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-12-26 19:04:02
 * @Description: 日期相关常量
 */

export const DEFAULT_YMD_FORMAT = 'YYYY-MM-DD'
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
export const DEFAULT_DATE_FORMAT = DEFAULT_YMD_FORMAT + ' ' + DEFAULT_TIME_FORMAT

/**
 * @description 时区及是否支持夏令时
 */
export const DEFAULT_TIME_ZONE = [
    {
        timeZone: 'GMT12',
        enableDst: false,
        langKey: 1,
        sortKey: -12.0,
    }, // GMT-12 （国际日期变更线西）
    {
        timeZone: 'GMT11',
        enableDst: false,
        langKey: 2,
        sortKey: -11.0,
    }, // GMT-11 （协调世界时-11）
    {
        timeZone: 'HST10HDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 3,
        sortKey: -10.0,
    }, // GMT-10 （阿留申群岛）
    {
        timeZone: 'AKST9AKDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 4,
        sortKey: -9.0,
    }, // GMT-09 （阿拉斯加）
    {
        timeZone: 'PST8PDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 5,
        sortKey: -8.0,
    }, // GMT-08 （拉斯维加斯，旧金山，温哥华）
    {
        timeZone: 'MST7MDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 6,
        sortKey: -7.0,
    }, // GMT-07 （卡尔加里，丹佛，盐湖城）
    {
        timeZone: 'CST6CDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 7,
        sortKey: -6.0,
    }, // GMT-06 （芝加哥，达拉斯，新奥尔良）
    {
        timeZone: 'CST6',
        enableDst: false,
        langKey: 8,
        sortKey: -6.0,
    }, // GMT-06 （墨西哥城）
    {
        timeZone: 'CST5CDT,M3.2.0/0,M11.1.0/1',
        enableDst: true,
        langKey: 9,
        sortKey: -5.0,
    }, // GMT-05 （古巴）
    {
        timeZone: 'EST5EDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 10,
        sortKey: -5.0,
    }, // GMT-05 （纽约，多伦多，华盛顿，中大西洋）
    {
        timeZone: 'VET4',
        enableDst: false,
        langKey: 11,
        sortKey: -4.0,
    }, // GMT-04 （委内瑞拉）
    {
        timeZone: 'AST4ADT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 12,
        sortKey: -4.0,
    }, // GMT-04 （大西洋时间）
    {
        timeZone: 'AMT4',
        enableDst: false,
        langKey: 13,
        sortKey: -4.0,
    }, // GMT-04 （库亚巴）
    {
        timeZone: 'AST4',
        enableDst: false,
        langKey: 14,
        sortKey: -4.0,
    }, // GMT-04 （乔治敦，拉巴斯，马瑙斯，圣胡安）
    {
        timeZone: 'PYT3',
        enableDst: false,
        langKey: 15,
        sortKey: -3.0,
    }, // GMT-04 （亚松森）
    {
        timeZone: 'CLT4CLST,M9.2.0/0,M4.1.0/0',
        enableDst: true,
        langKey: 16,
        sortKey: -4.0,
    }, // GMT-04 （圣地亚哥）
    {
        timeZone: 'NST3:30NDT,M3.2.0/2,M11.1.0/2',
        enableDst: true,
        langKey: 17,
        sortKey: -3.5,
    }, // GMT-03:30 （纽芬兰）
    {
        timeZone: 'BRT3',
        enableDst: false,
        langKey: 18,
        sortKey: -3.0,
    }, // GMT-03 （巴西利亚，圣保罗）
    {
        timeZone: 'ART3',
        enableDst: false,
        langKey: 19,
        sortKey: -3.0,
    }, // GMT-03 （布宜诺斯艾利斯，卡宴，福塔雷萨）
    {
        timeZone: 'UYT3',
        enableDst: false,
        langKey: 20,
        sortKey: -3.0,
    }, // GMT-03 （蒙得维的亚）
    {
        timeZone: 'WGT2WGST,M3.5.6/23,M10.4.0/0',
        enableDst: true,
        langKey: 21,
        sortKey: -2.0,
    }, // GMT-02 （格陵兰）
    {
        timeZone: 'FNT2',
        enableDst: false,
        langKey: 22,
        sortKey: -2.0,
    }, // GMT-02 （诺罗尼亚群岛）
    {
        timeZone: 'AZOT1AZOST,M3.5.0/0,M10.4.0/1',
        enableDst: true,
        langKey: 23,
        sortKey: -1.0,
    }, // GMT-01 （亚述尔群岛）
    {
        timeZone: 'GMT0BST,M3.5.0/1,M10.4.0/2',
        enableDst: true,
        langKey: 24,
        sortKey: 0.0,
    }, // GMT （都柏林，里斯本，伦敦）
    {
        timeZone: 'CET-1CEST,M3.5.0/2,M10.4.0/3',
        enableDst: true,
        langKey: 25,
        sortKey: 1.0,
    }, // GMT+01 （阿姆斯特丹，柏林，罗马，斯德哥尔摩，华沙）
    {
        timeZone: 'CAT-2',
        enableDst: false,
        langKey: 26,
        sortKey: 2.0,
    }, // GMT+02 （温得和克）
    {
        timeZone: 'EET-2EEST,M3.5.0/3,M10.4.0/4',
        enableDst: true,
        langKey: 27,
        sortKey: 2.0,
    }, // GMT+02 （雅典，基辅，赫尔辛基，里加）
    {
        timeZone: 'EET-2EEST,M4.4.5/0,M10.5.5/0',
        enableDst: true,
        langKey: 28,
        sortKey: 2.0,
    }, // GMT+02 （埃及）
    {
        timeZone: 'IST-2IDT,M3.5.5/2,M10.4.0/2',
        enableDst: true,
        langKey: 29,
        sortKey: 2.0,
    }, // GMT+02 （以色列）
    {
        timeZone: 'SAST-2',
        enableDst: false,
        langKey: 30,
        sortKey: 2.0,
    }, // GMT+02 （约翰内斯堡）
    {
        timeZone: 'EET-2EEST,M3.5.0/0,M10.4.0/0',
        enableDst: true,
        langKey: 31,
        sortKey: 2.0,
    }, // GMT+02 （黎巴嫩）
    {
        timeZone: 'EEST-3',
        enableDst: false,
        langKey: 32,
        sortKey: 3.0,
    }, // GMT+03 （伊斯坦布尔，安曼，叙利亚）
    {
        timeZone: 'AST-3',
        enableDst: false,
        langKey: 33,
        sortKey: 3.0,
    }, // GMT+03 （巴格达，科威特，利雅得）
    {
        timeZone: 'MSK-3',
        enableDst: false,
        langKey: 34,
        sortKey: 3.0,
    }, // GMT+03 （明斯克）
    {
        timeZone: 'IRST-3:30',
        enableDst: false,
        langKey: 35,
        sortKey: 3.5,
    }, // GMT+03:30 （伊朗）
    {
        timeZone: 'AZT-4',
        enableDst: false,
        langKey: 36,
        sortKey: 4.0,
    }, // GMT+04 （巴库）
    {
        timeZone: 'AMT-4',
        enableDst: false,
        langKey: 37,
        sortKey: 4.0,
    }, // GMT+04 （阿布扎比，马斯喀特，埃里温，第比利斯，路易港）
    {
        timeZone: 'AFT-4:30',
        enableDst: false,
        langKey: 38,
        sortKey: 4.5,
    }, // GMT+04:30 （喀布尔）
    {
        timeZone: 'PKT-5',
        enableDst: false,
        langKey: 39,
        sortKey: 5.0,
    }, // GMT+05 （伊斯兰堡，卡拉奇，塔什干，阿斯塔纳）
    {
        timeZone: 'IST-5:30',
        enableDst: false,
        langKey: 40,
        sortKey: 5.5,
    }, // GMT+05:30 （孟买，加尔各答，新德里）
    {
        timeZone: 'NPT-5:45',
        enableDst: false,
        langKey: 41,
        sortKey: 5.75,
    }, // GMT+05:45 （加德满都）
    {
        timeZone: 'BST-6',
        enableDst: false,
        langKey: 42,
        sortKey: 6.0,
    }, // GMT+06 （达卡）
    {
        timeZone: 'MMT-6:30',
        enableDst: false,
        langKey: 43,
        sortKey: 6.5,
    }, // GMT+06:30 （仰光）
    {
        timeZone: 'ICT-7',
        enableDst: false,
        langKey: 44,
        sortKey: 7.0,
    }, // GMT+07 （曼谷，河内，雅加达，新西伯利亚）
    {
        timeZone: 'CST-8',
        enableDst: false,
        langKey: 45,
        sortKey: 8.0,
    }, // GMT+08 （北京，香港，上海，台北，乌兰巴托）
    {
        timeZone: 'AWST-8',
        enableDst: false,
        langKey: 46,
        sortKey: 8.0,
    }, // GMT+08 （珀斯）
    {
        timeZone: 'JST-9',
        enableDst: false,
        langKey: 47,
        sortKey: 9.0,
    }, // GMT+09 （大阪，札幌，东京，首尔，雅库茨克）
    {
        timeZone: 'ACST-9:30',
        enableDst: false,
        langKey: 48,
        sortKey: 9.5,
    }, // GMT+09:30 （达尔文）
    {
        timeZone: 'ACST-9:30ACDT,M10.1.0/2,M4.1.0/3',
        enableDst: true,
        langKey: 49,
        sortKey: 9.5,
    }, // GMT+09:30 （阿德莱德）
    {
        timeZone: 'AEST-10',
        enableDst: false,
        langKey: 50,
        sortKey: 10.0,
    }, // GMT+10 （布里斯班）
    {
        timeZone: 'AEST-10AEDT,M10.1.0/2,M4.1.0/3',
        enableDst: true,
        langKey: 51,
        sortKey: 10.0,
    }, // GMT+10 （堪培拉，霍巴特，墨尔本，悉尼）
    {
        timeZone: 'SBT-11',
        enableDst: false,
        langKey: 52,
        sortKey: 11.0,
    }, // GMT+11 （所罗门群岛）
    {
        timeZone: 'NFT-11NFDT,M10.1.0/2,M4.1.0/3',
        enableDst: true,
        langKey: 53,
        sortKey: 11.0,
    }, // GMT+11 （诺福克）
    {
        timeZone: 'NZST-12NZDT,M9.5.0/2,M4.1.0/3',
        enableDst: true,
        langKey: 54,
        sortKey: 12.0,
    }, // GMT+12 （奥克兰，惠灵顿）
    {
        timeZone: 'FJT-12',
        enableDst: false,
        langKey: 55,
        sortKey: 12.0,
    }, // GMT+12 （斐济）
    {
        timeZone: 'PETT-12',
        enableDst: false,
        langKey: 56,
        sortKey: 12.0,
    }, // GMT+12 （堪察加半岛）
    {
        timeZone: 'GMT-12',
        enableDst: false,
        langKey: 57,
        sortKey: 12.0,
    }, // GMT+12 （马绍尔群岛）
    {
        timeZone: 'CHAST-12:45CHADT,M9.5.0/2:45,M4.1.0/3:45',
        enableDst: true,
        langKey: 58,
        sortKey: 12.75,
    }, // GMT+12:45 （查塔姆）
    {
        timeZone: 'TOT-13',
        enableDst: false,
        langKey: 59,
        sortKey: 13.0,
    }, // GMT+13 （汤加塔布岛，努库阿洛法）
    {
        timeZone: 'WST-13',
        enableDst: false,
        langKey: 60,
        sortKey: 13.0,
    }, // GMT+13 （萨摩亚群岛）
    // 新增
    {
        timeZone: 'HST10',
        enableDst: false,
        langKey: 61,
        sortKey: -10.0,
    }, // GMT-10 （夏威夷）
    {
        timeZone: 'GMT0',
        enableDst: false,
        langKey: 62,
        sortKey: 0.0,
    }, // GMT (蒙罗维亚，雷克雅未克)
    {
        timeZone: 'MAGT-11',
        enableDst: false,
        langKey: 63,
        sortKey: 11.0,
    }, // GMT+11 （马加丹）
    {
        timeZone: 'EAT-3',
        enableDst: false,
        langKey: 64,
        sortKey: 3.0,
    }, // GMT+03 （内罗毕）
    {
        timeZone: 'CVT1',
        enableDst: false,
        langKey: 65,
        sortKey: -1.0,
    }, // GMT-01（佛得角群岛）
]

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
 * @description 日历类型MAP
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

/**
 * @description 月份翻译
 */
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

/**
 * @description 月份翻译（短）
 */
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

/**
 * @description 星期翻译
 */
export const DEFAULT_WEEK_MAPPING: Record<string, string> = {
    0: 'IDCS_WEEK_DAY_SEVEN',
    1: 'IDCS_WEEK_DAY_ONE',
    2: 'IDCS_WEEK_DAY_TWO',
    3: 'IDCS_WEEK_DAY_THREE',
    4: 'IDCS_WEEK_DAY_FOUR',
    5: 'IDCS_WEEK_DAY_FIVE',
    6: 'IDCS_WEEK_DAY_SIX',
}

/**
 * @description 星期翻译
 */
export const DEFAULT_WEEK_MAPPING2: Record<string, string> = {
    0: 'IDCS_SUNDAY',
    1: 'IDCS_MONDAY',
    2: 'IDCS_TUESDAY',
    3: 'IDCS_WEDNESDAY',
    4: 'IDCS_THURSDAY',
    5: 'IDCS_FRIDAY',
    6: 'IDCS_SATURDAY',
}

/**
 * @description 星期翻译（短）
 */
export const DEFAULT_WEEK_SHORT_MAPPING: Record<string, string> = {
    0: 'IDCS_CALENDAR_SUNDAY',
    1: 'IDCS_CALENDAR_MONDAY',
    2: 'IDCS_CALENDAR_TUESDAY',
    3: 'IDCS_CALENDAR_WEDNESDAY',
    4: 'IDCS_CALENDAR_THURSDAY',
    5: 'IDCS_CALENDAR_FRIDAY',
    6: 'IDCS_CALENDAR_SATURDAY',
}

/**
 * @description 日期格式化翻译
 */
export const DEFAULT_DATE_FORMAT_MAPPING: Record<string, string> = {
    'year-month-day': 'IDCS_DATE_FORMAT_YMD',
    'month-day-year': 'IDCS_DATE_FORMAT_MDY',
    'day-month-year': 'IDCS_DATE_FORMAT_DMY',
}

/**
 * @description 时间格式化翻译
 */
export const DEFAULT_TIME_FORMAT_MAPPING: Record<string, string> = {
    24: 'IDCS_TIME_FORMAT_24',
    12: 'IDCS_TIME_FORMAT_12',
}
