/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 常量定义
 */
import { type UserPermissionChannelAuthList } from '@/types/apiType/userAndSecurity'

export * as ErrorCode from './const/errorcode'

export * as LocalCacheKey from './const/localCacheKey'

/** 用户错误都需要这个位为1 */
// const USER_ERROR_FLAG = 0x20000000

/**
 * @deprecated 统一使用ErrorCode
 */
// export const errorCodeMap = {
//     nodeExist: 536870913, //0x20000000+0x01 // 节点已存在（目前用于判断ip 端口重复）
//     resourceNotExist: 536870923, //0x20000000+0x0B // 资源不存在
//     nameExist: 536870970, //0x20000000+0x3a // 名称已存在
//     ipError: 536870992, //0x20000000+0x50 // IP地址格式错误
//     outOfRange: 536871004, //0x20000000+0x5C // 超出范围
//     noConfigData: 536870962, //没有产生任何配置数据（当做是成功的）
// }

export const DEFAULT_EMPTY_ID = '{00000000-0000-0000-0000-000000000000}'

/**
 * API返回状态
 */
export const ApiStatus = {
    success: 'success',
    fail: 'fail',
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

/**
 * 系统权限列表
 */
export const SYSTEM_AUTH_LIST = [
    'localChlMgr',
    'remoteChlMgr',
    'remoteLogin',
    'diskMgr',
    'talk',
    'alarmMgr',
    'net',
    'scheduleMgr',
    'rec',
    'localSysCfgAndMaintain',
    'remoteSysCfgAndMaintain',
    'securityMgr',
    'facePersonnalInfoMgr',
    'parkingLotMgr',
    'AccessControlMgr',
]

export const USER_TYPE_DEFAULT_ADMIN = 'default_admin'

export const USER_TYPE_NORMAL = 'normal'

/**
 * 协议名称映射
 * PS：因为queryDevDefaultPwd和queryDevList中返回的协议名称不是同一套，需要客户端自己映射
 */
export const PROTOCAL_NAME_MAPPING: Record<string, string> = {
    Standard: 'ABSTRACT_DEVICE',
    Hikvision: 'HIKVISION_DVR',
    Dahua: 'DAHUA_DVR',
    ONVIF: 'ONVIF',
    HuaAn: 'HUAAN_IPC',
    'TVT-ATM': 'TVT-ATM',
}

/**
 * @description 错误代码和语言资源映射
 */
// export const ErrorCodeMapping: Record<string, string> = {
//     unknownError: 'IDCS_UNKNOWN_ERROR',
//     netError: 'IDCS_NET_ERROR',
//     paramError: 'IDCS_PARAM_ERROR',

//     536870913: 'IDCS_USER_ERROR_NODE_ID_EXISTS',
//     536870914: 'IDCS_USER_ERROR_UNKNOWN',
//     536870915: 'IDCS_USER_ERROR_DISK_SPACE_NO_ENOUGH',
//     536870916: 'IDCS_USER_ERROR_NETNODE_ID_CONFLICT',
//     536870917: 'IDCS_USER_ERROR_NETNODE_INITIAL_ERROR',
//     536870918: 'IDCS_USER_ERROR__CREATE_MSU_CHAL_TABLE_ERROR',
//     536870919: 'IDCS_USER_ERROR__DELETE_MSU_CHAL_TABLE_ERROR',
//     536870920: 'IDCS_USER_ERROR__CREATE_MDU_DEVICE_TABLE_ERROR',
//     536870921: 'IDCS_USER_ERROR__DELETE_MDU_DEVICE_TABLE_ERROR',
//     536870922: 'IDCS_USER_ERROR__GET_INFO_ITEMID_ERROR',
//     536870923: 'IDCS_USER_ERROR__CANNOT_FIND_NODE_ERROR',
//     536870924: 'IDCS_USER_ERROR__NO_CHILD_NODE_ERROR',
//     536870925: 'IDCS_USER_ERROR__NO_PARENT_NODE_ERROR',
//     536870926: 'IDCS_USER_ERROR_ADD_FRAME_TYPE_INEXISTENT',
//     536870927: 'IDCS_USER_ERROR_SEND_OVERTIME',
//     536870928: 'IDCS_USER_ERROR_MODULE_NO_INITIAL',
//     536870929: 'IDCS_USER_ERROR_INVALID_POINT',
//     536870930: 'IDCS_USER_ERROR_CANNOT_FIND_CHMDU',
//     536870931: 'IDCS_USER_ERROR_NODE_NET_DISCONNECT',
//     536870932: 'IDCS_USER_ERROR_CHANNEL_NO_OPEN_VIDEO',
//     536870933: 'IDCS_USER_ERROR_STREAM_PENDING',
//     536870934: 'IDCS_USER_ERROR_FAIL',
//     536870935: 'IDCS_USER_ERROR_NODE_NET_OFFLINE',
//     536870936: 'IDCS_USER_ERROR_UNSUPPORTED_NODE',
//     536870937: 'IDCS_USER_ERROR_ROUTE_ERROR',
//     536870938: 'IDCS_USER_ERROR_INVLID_NODE',
//     536870939: '',
//     536870940: 'IDCS_USER_ERROR_NO_READY',
//     536870941: 'IDCS_USER_ERROR_TASK_NO_EXISTS',
//     536870942: 'IDCS_USER_ERROR_NO_RECORDDATA',
//     536870943: 'IDCS_USER_ERROR_INVALID_PARAM',
//     536870944: 'IDCS_USER_ERROR_UNSUPPORTED_CMD',
//     536870945: 'IDCS_USER_ERROR_DEVICE_BUSY',
//     536870946: 'IDCS_USER_ERROR_LISTEN_FAIL',
//     536870947: 'IDCS_USER_ERROR_NO_USER',
//     536870948: 'IDCS_USER_ERROR_PWD_ERR',
//     536870949: 'IDCS_USER_ERROR_USER_ALREDAY_LOGIN',
//     536870950: 'IDCS_USER_ERROR_USER_LIMITED',
//     536870951: 'IDCS_USER_ERROR_USER_LOCKED',
//     536870952: 'IDCS_USER_ERROR_LOGIN_SELF',
//     536870953: 'IDCS_USER_ERROR_NO_AUTH',
//     536870954: '',
//     536870955: '',
//     536870956: '',
//     536870957: '',
//     536870958: '',
//     536870959: '',
//     536870960: 'IDCS_USER_ERROR_SYSTEM_BUSY',
//     536870961: 'IDCS_USER_ERROR_FILE_STREAM_COMPLETED',
//     536870962: 'IDCS_USER_ERROR_GET_CONFIG_INFO_FAIL',
//     536870963: 'IDCS_USER_ERROR_ANOTHER_USER_HASENTER',
//     536870964: 'IDCS_USER_ERROR_LOGIN_OVERTIME',
//     536870965: 'IDCS_USER_ERROR_CHANNEL_AUDIO_OPEN_FAIL',
//     536870966: 'IDCS_USER_ERROR_NOLOGIN',
//     536870967: 'IDCS_USER_ERROR_CANNOT_FIND_MAP_ERROR',
//     536870968: 'IDCS_USER_ERROR_NO_PARENT_MAP_ERROR',
//     536870969: 'IDCS_USER_ERROR_NO_CHILD_MAP_ERROR',
//     536870970: 'IDCS_USER_ERROR_NAME_EXISTED',
//     536870971: 'IDCS_USER_ERROR_MAP_SAVE_ERROR',
//     536870972: 'IDCS_USER_ERROR_EMAP_NO_INFO',
//     536870973: 'IDCS_USER_ERROR_NOSUPPORT_DEV_VERSION',
//     536870974: 'IDCS_USER_ERROR_STREAM_WAITING',
//     536870975: 'IDCS_USER_ERROR_UNSUPPORTED_FUNC',
//     536870976: 'IDCS_USER_ERROR_DEVICE_TYPE_ERROR',
//     536870977: 'IDCS_USER_ERROR_FILE_TYPE_ERROR',
//     536870978: 'IDCS_USER_ERROR_FILE_EXISTED',
//     536870979: 'IDCS_USER_ERROR_FILE_NO_EXISTED',
//     536870980: 'IDCS_USER_ERROR_OPEN_FILE_ERROR',
//     536870981: 'IDCS_USER_ERROR_EXISTED_CHILD_NODE',
//     536870982: 'IDCS_USER_ERROR_DEV_RESOURCE_LIMITED',
//     536870983: 'IDCS_USER_ERROR_DECODE_RESOURCE_LACK',
//     536870984: 'IDCS_USER_ERROR_DECODE_RESOURCE_LIMITED',
//     536870985: 'IDCS_USER_ERROR_NO_RECORD_LOG',
//     536870986: 'IDCS_USER_ERROR_READ_TASK_TOO_MUCH',
//     536870987: '',
//     536870988: '',
//     536870989: '',
//     536870990: '',
//     536870991: '',
//     536870992: 'IDCS_USER_ERROR_INVALID_IP',
//     536870993: 'IDCS_USER_ERROR_INVALID_SUBMASK',
//     536870994: 'IDCS_USER_ERROR_IP_MASK_ALL1',
//     536870995: 'IDCS_USER_ERROR_IP_MASK_ALL0',
//     536870996: 'IDCS_USER_ERROR_ROUTE_MASK_ALL1',
//     536870997: 'IDCS_USER_ERROR_ROUTE_MASK_ALL0',
//     536870998: 'IDCS_USER_ERROR_USE_LOOPBACK',
//     536870999: 'IDCS_USER_ERROR_IP_ROUTE_INVALID',
//     536871000: 'IDCS_USER_ERROR_MASK_NOT_CONTINE',
//     536871001: 'IDCS_USER_ERROR_DIFFERENT_SEGMENT',
//     536871002: 'IDCS_USER_ERROR_INVALID_GATEWAY',
//     536871003: 'IDCS_USER_ERROR_INVALID_DOMAIN_NAME',
//     536871004: 'IDCS_USER_ERROR_OVER_LIMIT',
//     536871005: 'IDCS_USER_ERROR_OVER_BANDWIDTH_LIMIT',
//     536871006: 'IDCS_USER_ERROR_AREA_EXISTED_CHILD_NODE',
//     536871007: 'IDCS_USER_ERROR_SPECIAL_CHAR',
//     536871008: 'IDCS_USER_ERROR_SPECIAL_CHAR_2',
//     536871009: 'IDCS_USER_ERROR_CHECK_FILE_ERROR',
//     536871010: 'IDCS_USER_ERROR_SERVER_OFF_LINE',
//     536871011: 'IDCS_USER_ERROR_SERVER_NO_EXISTS',
//     536871012: 'IDCS_USER_ERROR_KEYBOARDINDEX_EXISTS',
//     536871013: 'IDCS_USER_ERROR_KEYBOARDINDEX_ERROR',
//     536871014: 'IDCS_USER_ERROR_EXISTED_USER_NODE',
//     536871015: 'IDCS_USER_ERROR_USERGOURP_NO_EXISTS',
//     536871016: 'IDCS_USER_ERROR_ONLY_ADMIN_CAN_ADDROOTAREA',
//     536871017: 'IDCS_USER_ERROR_NO_PARENT_AREA_AUTH',
//     536871018: 'IDCS_USER_ERROR_MUST_SAVE_ONE_AREA',
//     536871019: 'IDCS_USER_ERROR_NO_CUR_AREA_AUTH',
//     536871020: 'IDCS_USER_ERROR_IP_SEGMENT_TO_LONG',
//     536871021: 'IDCS_USER_ERROR_SERIAL_NOTNULL',
//     536871022: 'IDCS_USER_ERROR_SERIAL_EXISTS',
//     536871023: 'IDCS_USER_ERROR_IP_SEGMENT_NO_PROTOCAL',
//     536871024: 'IDCS_USER_ERROR_NO_AUTH_EDIT_SAMERIGHT',
//     536871025: 'IDCS_USER_ERROR_MDU_HAVEDEVICE',
//     536871026: 'IDCS_USER_ERROR_WALL_HAVEDECODER',
//     536871027: 'IDCS_USER_ERROR_JSU_HAVEALARMHOST',
//     536871028: 'IDCS_USER_ERROR_HOT_POINT_EXISTS',
//     536871029: 'IDCS_USER_ERROR_IMPORTCONFIG_OVER_LIMIT',
//     536871030: 'IDCS_USER_ERROR_FILE_MISMATCHING',
//     536871031: 'IDCS_USER_ERROR_CANNOT_DEL_ADMIN',
//     536871032: 'IDCS_USER_ERROR_CANNOT_DEL_CUR_USER',
//     536871033: 'IDCS_USER_ERROR_MSU_HAVEDEVICE',
//     536871034: 'IDCS_USER_ERROR_ONLY_ONE_ADU_EXISTED',
//     536871035: 'IDCS_USER_ERROR_IP_PORT_SERVER_EXISTS',
//     536871036: 'IDCS_USER_ERROR_TVWALLSERVER_HAVEWALL',
//     536871037: 'IDCS_USER_ERROR_LIMIT_MAX_SUBSYSTEM_NUM',
//     536871038: 'IDCS_USER_ERROR_LIMIT_MAX_ZONE_NUM',
//     536871039: 'IDCS_USER_ERROR_JSU_HAVEACSSYSTEM',
//     536871040: 'IDCS_USER_ERROR_CONNECT_RSU_FAILED',
//     536871041: 'IDCS_USER_ERROR_HOT_AREA_EXISTS',
//     536871042: 'IDCS_USER_ERROR_TIME_RANGE_ERROR',
//     536871043: 'IDCS_USER_ERROR_LIVE_RECONNECT',
//     536871044: 'IDCS_USER_ERROR_LICENSEPLATE_EXISTS',
//     536871045: 'IDCS_USER_ERROR_GBID_EXISTS',
//     536871046: 'IDCS_USER_ERROR_CGU_HAVEDEVICE',
//     536871047: 'IDCS_USER_ERROR_PLAYBACK_BACKUP_OVER_LIMIT',
//     536871048: 'IDCS_USER_ERROR_CLIENT_LIMITED_BY_LITE_TYPE',
//     536871049: 'IDCS_USER_ERROR_CLIENT_LIMITED_PLATFORM_TYPE_MISMATCH',
//     536871050: 'IDCS_USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH',
//     536871051: 'IDCS_USER_ERROR_LIMITED_PLATFORM_VERSION_MISMATCH',
//     536871052: 'IDCS_USER_ERROR_PC_LICENSE_MISMATCH',
//     536871062: 'IDCS_USER_ERROR_LOG_QUERY_BE_IN_A_MONTH',
//     536871074: 'IDCS_USER_ERROR_LOGIN_OVERTIME',
//     536871066: 'IDCS_INPORT_EXPORT_CLIENT_PASSWORD_ERROR', // 导入导出密码不一致
//     536871075: 'IDCS_USER_SESSION_NOTFOUND',
//     536871084: 'IDCS_HTTPS_CERT_NOT_FOUND',
//     536871085: 'IDCS_HTTPS_CERT_EXIST',
//     536871086: 'IDCS_HTTPS_ACTIVED',
//     536871087: 'IDCS_HTTPS_PKCS12_CREATE_FAILED',
//     536871088: 'IDCS_HTTPS_HTTPS_PKCS12_LOAD_FAILED',
// }

/**
 * @description 语言类型与语言id映射
 */
export const LANG_MAPPING: Record<string, string> = {
    'en-us': '0x0409',
    'zh-cn': '0x0804',
    'zh-tw': '0x0404',
    zh: '0x0804',
    hr: '0x041a',
    cs: '0x0405',
    fa: '0x0429',
    de: '0x0407',
    el: '0x0408',
    he: '0x040d',
    hu: '0x040e',
    it: '0x0410',
    mk: '0x042f',
    pl: '0x0415',
    pt: '0x0816',
    ro: '0x0418',
    ru: '0x0419',
    sk: '0x041b',
    sl: '0x0424',
    'es-es': '0x0c0a',
    'es-mx': '0x080a',
    th: '0x041e',
    tr: '0x041f',
    af: '0x0436',
    nl: '0x0013',
    bg: '0x0402',
    fr: '0x040c',
    ja: '0x0411',
    kor: '0x0412',
    id: '0x0421',
    vi: '0x042a',
    kk: '0x043f',
    ar: '0x0c01',
    'sr-cyrl-cs': '0x0c1a',
    lt: '0x0427',
    lo: '0x0454',
    nb: '0x0414',
}

export const LANG_TYPE_MAPPING: Record<string, string> = {}
Object.entries(LANG_MAPPING).forEach((item) => {
    LANG_TYPE_MAPPING[item[1]] = item[0]
})

/**
 * @description 语言id映射与ElementPlus语言包映射
 */
// export const ELEMENT_LANG_MAPPING: Record<string, string> = {
//     '0x0c0a': 'es',
//     '0x0c01': 'ar',
//     '0x0c1a': 'sr',
//     '0x0013': 'nl',
//     '0x040c': 'fr',
//     '0x040d': 'he',
//     '0x040e': 'hu',
//     '0x041a': 'hr',
//     '0x041b': 'sk',
//     '0x041e': 'th',
//     '0x041f': 'tr',
//     '0x042a': 'vi',
//     // '0x042f': 'mk',
//     '0x043f': 'kk',
//     '0x080a': 'es',
//     '0x0402': 'bg',
//     '0x0404': 'zhTw',
//     '0x0405': 'cs',
//     '0x0407': 'de',
//     '0x0408': 'el',
//     '0x0409': 'en',
//     '0x0410': 'it',
//     '0x0411': 'ja',
//     '0x0412': 'ko',
//     // '0x0414': 'nb',
//     '0x0415': 'pl',
//     '0x0418': 'ro',
//     '0x0419': 'ru',
//     '0x0421': 'id',
//     '0x0424': 'sl',
//     '0x0427': 'lt',
//     '0x0429': 'fa',
//     '0x0436': 'af',
//     // '0x0454': 'lo',
//     '0x0804': 'zhCn',
//     '0x0816': 'pt',
// }

// 现场预览通道状态
export const LiveChlStatus = {
    chlOffline: 0,
    chlOnline: 1,
    chlPlay: 2,
}

// 码流映射
export const streamTypeMap = {
    main: 1,
    sub: 2,
}

export const BrowserType = {
    ie: 'ie',
    opera: 'opera',
    lowEdge: 'lowEdge',
    edge: 'edge',
    firefox: 'firefox',
    chrome: 'chrome',
    safari: 'safari',
    unknow: 'unknow',
}

// export const DefaultPagerSizeOptions = [10, 20, 30]

// export const DefaultPagerLayout = 'total, sizes, prev, pager, next, jumper'

export const protocolTrasMap: Record<string, string> = {
    DEFAULT: '默认探测器',
}

// export const formatMapping: Record<string, string> = {
//     'year-month-day': 'yyyy/MM/dd',
//     'month-day-year': 'MM/dd/yyyy',
//     'day-month-year': 'dd/MM/yyyy',
//     '24': 'HH:mm:ss',
//     '12': 'hh:mm:ss A',
// }

export const DecoderDefaultPwdNEU = '123456'

export const DecoderDefaultPwdTYCO = 'admin'

// emap图标转换map
// export const indexTrasMap: Record<string, string> = {
//     channel: '1',
//     sensor: '2',
//     subsystem: '3',
//     zone: '4',
//     hot_area: '5',
//     door: '6',
//     WifiProbe: '7',
//     DomeCamera: '8',
//     BoxCamera: '9',
//     SpeedDomeCamera: '10',
//     zone_0: '11',
//     zone_1: '12',
//     zone_2: '13',
//     zone_3: '14',
//     zone_4: '15',
//     zone_5: '16',
//     zone_6: '17',
//     zone_7: '18',
//     face_guard: '19',
// }
// export const mapTrasIndex: Record<string, string> = {
//     '1': 'channel',
//     '2': 'sensor',
//     '3': 'subsystem',
//     '4': 'zone',
//     '5': 'hot_area',
//     '6': 'door',
//     '7': 'WifiProbe',
//     '8': 'DomeCamera',
//     '9': 'BoxCamera',
//     '10': 'SpeedDomeCamera',
//     '11': 'zone_0',
//     '12': 'zone_1',
//     '13': 'zone_2',
//     '14': 'zone_3',
//     '15': 'zone_4',
//     '16': 'zone_5',
//     '17': 'zone_6',
//     '18': 'zone_7',
//     '19': 'face_guard',
// }

/**
 * UI名称常量
 */
export const UiName = {
    UI1: 'UI1',
    UI2: 'UI2',
    UI3: 'UI3',
    UI4: 'UI4',
    UI5: 'UI5',
} as Readonly<Record<string, UiName>>

/**
 * 路由组名称常量
 */
export const RouteGroupName = {
    monitor: 'monitor',
    config: 'config',
    common: 'common',
} as Readonly<Record<string, RouteGroupName>>

/**
 * UI目录常量
 */
export const UiDir = {
    ...UiName,
    UI_PUBLIC: 'UI_PUBLIC',
} as Readonly<Record<string, string>>

export const nameByteMaxLen = 64 - 1 //名字的最大字节长度（不包含结束字符）;

export const DEFAULT_PASSWORD_STREMGTH_MAPPING: Record<string, number> = {
    none: 0,
    weak: 1,
    medium: 2,
    strong: 3,
    stronger: 4,
}

/**
 * @description 默认权限组的名字映射
 */
export const DEFAULT_AUTH_GROUP_MAPPING: Record<string, string> = {
    Administrator: 'IDCS_DEFAULT_AUTHGROUP_SUPER',
    Advanced: 'IDCS_DEFAULT_ADVANCES',
    Ordinary: 'IDCS_DEFAULT_ORDINARY',
}

/**
 * @description 默认通道权限列表
 */
export const DEFAULT_CHANNEL_AUTH_LIST: ('_lp' | '_spr' | '_bk' | '_ad' | '_ptz' | '@lp' | '@spr' | '@bk' | '@ad' | '@ptz')[] = [
    '_lp',
    '_spr',
    '_bk',
    '_ad',
    '_ptz',
    '@lp',
    '@spr',
    '@bk',
    '@ad',
    '@ptz',
]

/**
 * @description 默认开关选项
 */
export const DEFAULT_SWITCH_OPTIONS: SelectOption<string, string>[] = [
    {
        label: 'IDCS_ON',
        value: 'true',
    },
    {
        label: 'IDCS_OFF',
        value: 'false',
    },
]

/**
 * @description 默认常开常闭选项
 */
export const DEFAULT_ALWAYS_OPTIONS: SelectOption<string, string>[] = [
    {
        label: 'IDCS_ALWAYS_CLOSE',
        value: 'NC',
    },
    {
        label: 'IDCS_ALWAYS_OPEN',
        value: 'NO',
    },
]

// 通道权限Tabs
export const DEFAULT_CHANNEL_AUTH_TABS = ['IDCS_LOCAL_RIGHT', 'IDCS_REMOTE_RIGHT']

/**
 * @description 默认本地通道权限列表
 */
export const DEFAULT_LOCAL_CHANNEL_AUTH_LIST: SelectOption<keyof UserPermissionChannelAuthList, string>[] = [
    {
        value: '_lp',
        label: 'IDCS_PREVIEW',
    },
    {
        value: '_spr',
        label: 'IDCS_SEARCH_AND_PLAYBACK',
    },
    {
        value: '_bk',
        label: 'IDCS_SEARCH_AND_BACKUP',
    },
    {
        value: '_ad',
        label: 'IDCS_AUDIO_FREQUENCY',
    },
    {
        value: '_ptz',
        label: 'IDCS_PTZ_CONTROL',
    },
]

/**
 * @description 默认远程通道权限列表
 */
export const DEFAULT_REMOTE_CHANNEL_AUTH_LIST: SelectOption<keyof UserPermissionChannelAuthList, string>[] = [
    {
        value: '@lp',
        label: 'IDCS_PREVIEW',
    },
    {
        value: '@spr',
        label: 'IDCS_SEARCH_AND_PLAYBACK',
    },
    {
        value: '@bk',
        label: 'IDCS_SEARCH_AND_BACKUP',
    },
    {
        value: '@ad',
        label: 'IDCS_AUDIO_FREQUENCY',
    },
    {
        value: '@ptz',
        label: 'IDCS_PTZ_CONTROL',
    },
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

    // "year-month-day": "yyyy/MM/dd",
    // "month-day-year": "MM/dd/yyyy",
    // "day-month-year": "dd/MM/yyyy",
    // "24": "HH:mm",
    // "12": "hh:mm tt"
}

export const REC_MODE_TYPE = {
    INTENSIVE: 'INTENSIVE',
    EVENT: 'EVENT',
    INTENSIVE_EVENT: 'INTENSIVE_EVENT',
    MOTION: 'MOTION',
    ALARM: 'ALARM',
    INTELLIGENT: 'INTELLIGENT',
    POS: 'POS',
}

/**
 * @description 时区及是否支持夏令时
 */
export const DEFAULT_TIME_ZONE = [
    { timeZone: 'GMT+12', enableDst: false },
    { timeZone: 'GMT+11', enableDst: false },
    { timeZone: 'HAST10HADT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'AKST9AKDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'PST8PDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'MST7MDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'CST6CDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'CST6CDT,M4.1.0,M10.5.0', enableDst: true },
    { timeZone: 'CST5CDT,M3.2.0/0,M11.1.0/1', enableDst: true },
    { timeZone: 'EST5EDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'VET4:30', enableDst: false },
    { timeZone: 'CST4CDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'AMT4AMST,M10.3.0/0,M2.3.0/0', enableDst: true },
    { timeZone: 'AST4', enableDst: false },
    { timeZone: 'PYT4PYST,M10.1.0/0,M4.2.0/0', enableDst: true },
    { timeZone: 'CLT4CLST,M10.2.0/0,M3.2.0/0', enableDst: true },
    { timeZone: 'NST3:30NDT,M3.2.0,M11.1.0', enableDst: true },
    { timeZone: 'BRT3BRST,M10.3.0/0,M2.3.0/0', enableDst: true },
    { timeZone: 'ART3', enableDst: false },
    { timeZone: 'WGT3WGST,M3.5.6/22,M10.5.6/23', enableDst: true },
    { timeZone: 'UYT3UYST,M10.1.0,M3.2.0', enableDst: true },
    { timeZone: 'FNT2', enableDst: false },
    { timeZone: 'AZOT1AZOST,M3.5.0/0,M10.5.0/1', enableDst: true },
    { timeZone: 'GMT0BST,M3.5.0/1,M10.5.0', enableDst: true },
    { timeZone: 'CET-1CEST,M3.5.0,M10.5.0/3', enableDst: true },
    { timeZone: 'WAT-1WAST,M9.1.0,M4.1.0', enableDst: true },
    { timeZone: 'EET-2EEST,M3.5.0/3,M10.5.0/4', enableDst: true },
    { timeZone: 'EET-2', enableDst: false },
    { timeZone: 'IST-2IDT,M3.5.5/2,M10.5.0/2', enableDst: true },
    { timeZone: 'SAST-2', enableDst: false },
    { timeZone: 'EET-2EEST,M3.5.0/0,M10.5.0/0', enableDst: true },
    { timeZone: 'EET-2EEST,M3.5.5/0,M10.5.5/0', enableDst: true },
    { timeZone: 'AST-3', enableDst: false },
    { timeZone: 'MSK-3', enableDst: false },
    { timeZone: 'IRST-3:30IRDT-4:30,J80/0,J264/0', enableDst: true },
    { timeZone: 'AZT-4AZST,M3.5.0/4,M10.5.0/5', enableDst: true },
    { timeZone: 'GST-4', enableDst: false },
    { timeZone: 'AFT-4:30', enableDst: false },
    { timeZone: 'PKT-5', enableDst: false },
    { timeZone: 'IST-5:30', enableDst: false },
    { timeZone: 'NPT-5:45', enableDst: false },
    { timeZone: 'ALMT-6', enableDst: false },
    { timeZone: 'MMT-6:30', enableDst: false },
    { timeZone: 'WIT-7', enableDst: false },
    { timeZone: 'CST-8', enableDst: false },
    { timeZone: 'WST-8', enableDst: false },
    { timeZone: 'JST-9', enableDst: false },
    { timeZone: 'CST-9:30', enableDst: false },
    { timeZone: 'CST-9:30CST,M10.1.0,M4.1.0/3', enableDst: true },
    { timeZone: 'YAKT-10', enableDst: false },
    { timeZone: 'EST-10EST,M10.1.0,M4.1.0/3', enableDst: true },
    { timeZone: 'SBT-11', enableDst: false },
    { timeZone: 'NFT-11:30', enableDst: false },
    { timeZone: 'NZST-12NZDT,M9.5.0,M4.1.0/3', enableDst: true },
    { timeZone: 'FJT-12FJST,M10.5.0,M1.3.0/3', enableDst: true },
    { timeZone: 'PETT-12PETST,M3.5.0,M10.5.0/3', enableDst: true },
    { timeZone: 'MHT-12', enableDst: false },
    { timeZone: 'CHAST-12:45CHADT,M9.5.0/2:45,M4.1.0/3:45', enableDst: true },
    { timeZone: 'TOT-13', enableDst: false },
    { timeZone: 'SST-13SDT,M9.5.0/3,M4.1.0/4', enableDst: true },
]

export const DEFAULT_ALARM_EVENT: Record<string, string> = {
    cdd: 'IDCS_CROWD_DENSITY_DETECTION',
    cpc: 'IDCS_PASS_LINE_COUNT_DETECTION',
    ipd: 'IDCS_INVADE_DETECTION',
    tripwire: 'IDCS_BEYOND_DETECTION',
    osc: 'IDCS_WATCH_DETECTION',
    avd: 'IDCS_ABNORMAL_DETECTION',
    perimeter: 'IDCS_INVADE_DETECTION',
    vfd: 'IDCS_FACE_DETECTION',
    aoientry: 'IDCS_INVADE_DETECTION',
    aoileave: 'IDCS_INVADE_DETECTION',
    passlinecount: 'IDCS_PASS_LINE_COUNT_DETECTION',
    vehicle: 'IDCS_PLATE_DETECTION',
    fire: 'IDCS_FIRE_POINT_DETECTION',
    vsd: 'IDCS_VSD_DETECTION',
}
