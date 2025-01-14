/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 常量定义
 */
import { type UserPermissionChannelAuthList } from '@/types/apiType/userAndSecurity'

export * as ErrorCode from './const/errorcode'
export * as LocalCacheKey from './const/localCacheKey'
export * from './const/date'
export * from './const/lang'

export const DEFAULT_EMPTY_ID = '{00000000-0000-0000-0000-000000000000}'

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

export const REC_MODE_TYPE = {
    INTENSIVE: 'INTENSIVE',
    EVENT: 'EVENT',
    INTENSIVE_EVENT: 'INTENSIVE_EVENT',
    MOTION: 'MOTION',
    ALARM: 'ALARM',
    INTELLIGENT: 'INTELLIGENT',
    POS: 'POS',
}
