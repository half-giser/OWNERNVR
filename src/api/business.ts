/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-22 16:06:16
 * @Description: 业务应用api
 */

import http from './api'

/**
 * @description 获取停车场基础配置（基础配置、车位管理、出入口）
 * @returns
 */
export const queryParkingLotConfig = () => http.fetch('queryParkingLotConfig', '')

/**
 * @description 编辑停车场基础配置（基础配置、车位管理、出入口）
 * @returns
 */
export const editParkingLotConfig = (data: string) => http.fetch('editParkingLotConfig', data)

/**
 * @description 获取门禁配置-门锁配置
 * @param data
 * @param config
 * @returns
 */
export const queryAccessControlCfg = (data: string) => http.fetch('queryAccessControlCfg', data)

/**
 * @description 编辑门禁配置-门锁配置
 * @param data
 * @param config
 * @returns
 */
export const editAccessControlCfg = (data: string) => http.fetch('editAccessControlCfg', data)

/**
 * @description 获取门禁配置-韦根配置
 * @param data
 * @param config
 * @returns
 */
export const queryAccessDataComCfg = (data: string) => http.fetch('queryAccessDataComCfg', data)

/**
 * @description 编辑门禁配置-韦根配置
 * @param data
 * @param config
 * @returns
 */
export const editAccessDataComCfg = (data: string) => http.fetch('editAccessDataComCfg', data)

/**
 * @description 获取个人脸照
 * @param {string} data
 * @returns
 */
export const searchGateSnap = (data: string) => http.fetch('searchGateSnap', data)

/**
 * @description 开门放闸
 * @param {string} data
 * @returns
 */
export const openGate = (data: string) => http.fetch('openGate', data)

/**
 * @description 搜索开闸事件关联数据
 * @param {string} data
 * @returns
 */
export const searchOpenGateEventRelevanceData = (data: string) => http.fetch('searchOpenGateEventRelevanceData', data)
