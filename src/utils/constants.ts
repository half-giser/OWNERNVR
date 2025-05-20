/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 常量定义
 */

export * as ErrorCode from './const/errorcode'
export * as LocalCacheKey from './const/localCacheKey'
export * from './const/date'
export * from './const/lang'
export * from './const/record'
export * from './const/auth'

export const DEFAULT_EMPTY_ID = '{00000000-0000-0000-0000-000000000000}'
export const DEFAULT_EMPTY_IP = '0.0.0.0'
export const DEFAULT_EMPTY_TIME = '00:00:00'
export const DEFAULT_EMPTY_MAC = '00:00:00:00:00:00'
export const DEFAULT_EMPTY_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// 由于XSS安全问题，限制如下字符下发协议（与设备端保持一致）
export const XSS_LIMIT_REG = /[&|;$`]/g
// 备份文件名称限制的特殊字符（与设备端保持一致，创建文件时，把文件名的特殊字符<>:"|?*转换为#后再创建）
export const FILE_LIMIT_REG = /[<>:"|?*]/g

// 设备名称限制输入的特殊字符（与设备端保持一致）
export const DEVICE_LIMIT_CHAR = '/\\'
// 通道名称限制输入的特殊字符（与设备端保持一致）
export const CHANNEL_LIMIT_CHAR = '/\\'
// 预置点名称限制输入的特殊字符（与设备端保持一致）
export const PRESET_LIMIT_CHAR = '<>&'

/**
 * API返回状态
 */
export const ApiStatus = {
    success: 'success',
    fail: 'fail',
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
    'businessCfg',
    'businessMgr',
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

export const DecoderDefaultPwdNEU = '123456'

export const DecoderDefaultPwdTYCO = 'admin'

export const nameByteMaxLen = 64 - 1 //名字的最大字节长度（不包含结束字符）;

export const DEFAULT_PASSWORD_STREMGTH_MAPPING: Record<string, number> = {
    none: 0,
    weak: 1,
    medium: 2,
    strong: 3,
    stronger: 4,
}

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

export const DEFAULT_BOOL_SWITCH_OPTIONS: SelectOption<boolean, string>[] = [
    {
        label: 'IDCS_ON',
        value: true,
    },
    {
        label: 'IDCS_OFF',
        value: false,
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

export const REC_MODE_TYPE = {
    INTENSIVE: 'INTENSIVE',
    EVENT: 'EVENT',
    INTENSIVE_EVENT: 'INTENSIVE_EVENT',
    MOTION: 'MOTION',
    ALARM: 'ALARM',
    INTELLIGENT: 'INTELLIGENT',
    POS: 'POS',
}
