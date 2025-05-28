/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-22 16:06:16
 * @Description: 业务应用api
 */

import fetch from './api'

/**
 * @description 获取停车场基础配置（基础配置、车位管理、出入口）
 * @returns
 */
export const queryParkingLotConfig = () => fetch('queryParkingLotConfig', '')

/**
 * @description 编辑停车场基础配置（基础配置、车位管理、出入口）
 * @returns
 */
export const editParkingLotConfig = (data: string) => fetch('editParkingLotConfig', data)

/**
 * @description 获取门禁配置-门锁配置
 * @param data
 * @param config
 * @returns
 */
export const queryAccessControlCfg = (data: string) => fetch('queryAccessControlCfg', data)

/**
 * @description 编辑门禁配置-门锁配置
 * @param data
 * @param config
 * @returns
 */
export const editAccessControlCfg = (data: string) => fetch('editAccessControlCfg', data)

/**
 * @description 获取门禁配置-韦根配置
 * @param data
 * @param config
 * @returns
 */
export const queryAccessDataComCfg = (data: string) => fetch('queryAccessDataComCfg', data)

/**
 * @description 编辑门禁配置-韦根配置
 * @param data
 * @param config
 * @returns
 */
export const editAccessDataComCfg = (data: string) => fetch('editAccessDataComCfg', data)

/**
 * @description 获取个人脸照
 * @param {string} data
 * @returns
 */
export const searchGateSnap = (data: string) => fetch('searchGateSnap', data)

/**
 * @description 开门放闸
 * @param {string} data
 * @returns
 */
export const openGate = (data: string) => fetch('openGate', data)

/**
 * @description 搜索开闸事件关联数据
 * @param {string} data
 * @returns
 */
export const searchOpenGateEventRelevanceData = (data: string) => fetch('searchOpenGateEventRelevanceData', data)

/**
 * @description
 * @returns
 */
export const queryPassengerFlowStatisticsConfig = () => fetch('queryPassengerFlowStatisticsConfig', '')

/**
 * @description
 * @param {string} data
 * @returns
 */
export const editPassengerFlowStatisticsConfig = (data: string) => fetch('editPassengerFlowStatisticsConfig', data)

/**
 * @description
 * @returns
 */
export const resetPassengerFlowStatistics = () => fetch('resetPassengerFlowStatistics', '')

/**
 * @description
 * @returns
 */
export const queryPassengerFlowStatisticsInfo = () => fetch('queryPassengerFlowStatisticsInfo', '')
