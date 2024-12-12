/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 10:33:32
 * @Description: 用户与安全API
 */

import http from './api'

/**
 * @description 查询密码安全性
 * @param {boolean} status
 * @returns
 */
export const queryPasswordSecurity = (status = true) => http.fetch('queryPasswordSecurity', '', {}, status)

/**
 * @description 重置密码
 * @param {string} data
 * @returns
 */
export const editUserPassword = (data: string) => http.fetch('editUserPassword', data, {}, false)

/**
 * @description 获取权限组列表
 * @param {string} data
 * @returns
 */
export const queryAuthGroupList = (data: string) => http.fetch('queryAuthGroupList', data)

/**
 * @description 创建用户
 * @param {string} data
 * @returns
 */
export const createUser = (data: string) => http.fetch('createUser', data, {}, false)

/**
 * @description 查询权限组信息
 * @param {string} data
 * @returns
 */
export const queryAuthGroup = (data: string) => http.fetch('queryAuthGroup', data, {})

/**
 * @description 获取用户列表
 * @param {string} data
 * @returns
 */
export const queryUserList = (data: string) => http.fetch('queryUserList', data, {})

/**
 * @description 删除用户
 * @param {string} data
 * @returns
 */
export const delUser = (data: string) => http.fetch('delUser', data, {})

/**
 * @description 查询用户信息
 * @param {string} data
 * @returns
 */
export const queryUser = (data: string) => http.fetch('queryUser', data, {})

/**
 * @description 修改用户信息
 * @param {string} data
 * @returns
 */
export const editUser = (data: string) => http.fetch('editUser', data)

/**
 * @description 修改其他用户的密码
 * @param {string} data
 * @returns
 */
export const editOtherUserPassword = (data: string) => http.fetch('editOtherUserPassword', data, {}, false)

/**
 * @description 创建权限组
 * @param {string} data
 * @returns
 */
export const createAuthGroup = (data: string) => http.fetch('createAuthGroup', data)

/**
 * @description 删除权限组
 * @param {string} data
 * @returns
 */
export const delAuthGroup = (data: string) => http.fetch('delAuthGroup', data)

/**
 * @description 修改权限组
 * @param {string} data
 * @returns
 */
export const editAuthGroup = (data: string) => http.fetch('editAuthGroup', data)

/**
 * @description 修改密码安全等级要求
 * @param {string} data
 * @returns
 */
export const editPasswordSecurity = (data: string) => http.fetch('editPasswordSecurity', data)

/**
 * @description 获取在线用户列表
 * @returns
 */
export const queryOnlineUserInfo = () => http.fetch('queryOnlineUserInfo', '')

/**
 * @description 查询登出后通道预览权限列表
 * @returns
 */
export const queryLogoutChlPreviewAuth = () => http.fetch('queryLogoutChlPreviewAuth', '')

/**
 * @description 修改登出后预览权限
 * @param {string} data
 * @returns
 */
export const editLogoutChlPreviewAuth = (data: string) => http.fetch('editLogoutChlPreviewAuth', data)

/**
 * @description 查询黑白名单列表
 * @returns
 */
export const queryBlackAndWhiteList = () => http.fetch('queryBlackAndWhiteList', '')

/**
 * @description 修改黑白名单
 * @param {string} data
 * @returns
 */
export const editBlackAndWhiteList = (data: string) => http.fetch('editBlackAndWhiteList', data)

/**
 * @description 查询网关配置列表
 * @returns
 */
export const queryArpCfg = () => http.fetch('queryArpCfg', '')

/**
 * @description 修改网关配置信息
 * @param {string} data
 * @returns
 */
export const editArpCfg = (data: string) => http.fetch('editArpCfg', data)
