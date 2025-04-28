/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 10:33:32
 * @Description: 用户与安全API
 */

import fetch from './api'

/**
 * @description 查询密码安全性
 * @param {boolean} status
 * @returns
 */
export const queryPasswordSecurity = (status = true) => fetch('queryPasswordSecurity', '', {}, status)

/**
 * @description 重置密码
 * @param {string} data
 * @returns
 */
export const editUserPassword = (data: string) => fetch('editUserPassword', data, {}, false)

/**
 * @description 获取权限组列表
 * @param {string} data
 * @returns
 */
export const queryAuthGroupList = (data: string) => fetch('queryAuthGroupList', data)

/**
 * @description 创建用户
 * @param {string} data
 * @returns
 */
export const createUser = (data: string) => fetch('createUser', data, {})

/**
 * @description 查询权限组信息
 * @param {string} data
 * @returns
 */
export const queryAuthGroup = (data: string) => fetch('queryAuthGroup', data, {})

/**
 * @description 获取用户列表
 * @param {string} data
 * @returns
 */
export const queryUserList = (data: string) => fetch('queryUserList', data, {})

/**
 * @description 删除用户
 * @param {string} data
 * @returns
 */
export const delUser = (data: string) => fetch('delUser', data, {}, false)

/**
 * @description 查询用户信息
 * @param {string} data
 * @returns
 */
export const queryUser = (data: string) => fetch('queryUser', data, {})

/**
 * @description 修改用户信息
 * @param {string} data
 * @returns
 */
export const editUser = (data: string) => fetch('editUser', data)

/**
 * @description 修改其他用户的密码
 * @param {string} data
 * @returns
 */
export const editOtherUserPassword = (data: string) => fetch('editOtherUserPassword', data, {}, false)

/**
 * @description 创建权限组
 * @param {string} data
 * @returns
 */
export const createAuthGroup = (data: string) => fetch('createAuthGroup', data)

/**
 * @description 删除权限组
 * @param {string} data
 * @returns
 */
export const delAuthGroup = (data: string) => fetch('delAuthGroup', data)

/**
 * @description 修改权限组
 * @param {string} data
 * @returns
 */
export const editAuthGroup = (data: string) => fetch('editAuthGroup', data)

/**
 * @description 修改密码安全等级要求
 * @param {string} data
 * @returns
 */
export const editPasswordSecurity = (data: string) => fetch('editPasswordSecurity', data)

/**
 * @description 获取在线用户列表
 * @returns
 */
export const queryOnlineUserInfo = () => fetch('queryOnlineUserInfo', '')

/**
 * @description 查询登出后通道预览权限列表
 * @returns
 */
export const queryLogoutChlPreviewAuth = () => fetch('queryLogoutChlPreviewAuth', '')

/**
 * @description 修改登出后预览权限
 * @param {string} data
 * @returns
 */
export const editLogoutChlPreviewAuth = (data: string) => fetch('editLogoutChlPreviewAuth', data)

/**
 * @description 查询黑白名单列表
 * @returns
 */
export const queryBlackAndWhiteList = () => fetch('queryBlackAndWhiteList', '')

/**
 * @description 修改黑白名单
 * @param {string} data
 * @returns
 */
export const editBlackAndWhiteList = (data: string) => fetch('editBlackAndWhiteList', data)

/**
 * @description 查询网关配置列表
 * @returns
 */
export const queryArpCfg = () => fetch('queryArpCfg', '')

/**
 * @description 修改网关配置信息
 * @param {string} data
 * @returns
 */
export const editArpCfg = (data: string) => fetch('editArpCfg', data)

export const querySecureEmailcfg = () => fetch('querySecureEmailcfg', '')

export const editSecureEMailCfg = (data: string) => fetch('editSecureEMailCfg', data)

export const queryPWDProtectQuestion = () => fetch('queryPWDProtectQuestion', '')

export const editPWDProtectQuestion = (data: string) => fetch('editPWDProtectQuestion', data)
