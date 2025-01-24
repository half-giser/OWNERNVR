/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 20:03:07
 * @Description: 用户权限相关常量
 */
import { type UserPermissionAuthKey } from '@/types/apiType/userAndSecurity'

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
export const DEFAULT_CHANNEL_AUTH_LIST: UserPermissionAuthKey[] = ['_lp', '_spr', '_bk', '_ad', '_ptz', '@lp', '@spr', '@bk', '@ad', '@ptz']

// 通道权限Tabs
export const DEFAULT_CHANNEL_AUTH_TABS = ['IDCS_LOCAL_RIGHT', 'IDCS_REMOTE_RIGHT']

/**
 * @description 默认本地通道权限列表
 */
export const DEFAULT_LOCAL_CHANNEL_AUTH_LIST: SelectOption<UserPermissionAuthKey, string>[] = [
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
export const DEFAULT_REMOTE_CHANNEL_AUTH_LIST: SelectOption<UserPermissionAuthKey, string>[] = [
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
