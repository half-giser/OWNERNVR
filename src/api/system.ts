/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-06-02 11:57:11
 * @Description: 系统API
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 09:59:48
 */
import type { AxiosRequestConfig } from 'axios'
import http from './api'

/**
 * @description 获取服务端能力集
 * @param {string} data
 * @param config
 * @returns
 */
export const querySystemCaps = (data: string, config?: AxiosRequestConfig) => http.fetch('querySystemCaps', data, config)

/**
 * @description 获取设备基本信息
 * @param {string} data
 * @param config
 * @returns
 */
export const queryBasicCfg = (data: string, config?: AxiosRequestConfig) => http.fetch('queryBasicCfg', data, config)

/**
 * @description 修改设备基本信息
 * @param {string} data
 * @returns
 */
export const editBasicCfg = (data: string) => http.fetch('editBasicCfg', getXmlWrapData(data))

/**
 * @description 查询活跃状态
 * @param config
 * @returns
 */
export const queryActivationStatus = (config?: AxiosRequestConfig) => http.fetch('queryActivationStatus', getXmlWrapData(''), config)

/**
 * @description 获取时间配置
 * @returns
 */
export const queryTimeCfg = (state = true) => http.fetch('queryTimeCfg', getXmlWrapData(''), {}, state)

/**
 * @description 编辑时间
 * @param data
 * @returns
 */
export const editTimeCfg = (data: string) => http.fetch('editTimeCfg', getXmlWrapData(data))

/**
 * @description 恢复出厂配置
 * @param {string} data
 * @returns
 */
export const restoreDefaults = (data: string) => http.fetch('restoreDefaults', getXmlWrapData(data), {}, false)

/**
 * @description HTTP链接测试
 * @returns
 */
export const httpConnectionTest = () => http.fetch('httpConnectionTest', getXmlWrapData(''), {}, false)

/**
 * @description 系统重启
 * @param {string} data
 * @returns
 */
export const reboot = (data: string) => http.fetch('reboot', getXmlWrapData(data), {}, false)

/**
 * @description 获取自动维护数据
 * @returns
 */
export const queryAutoMaintenance = () => http.fetch('queryAutoMaintenance', getXmlWrapData(''))

/**
 * @description 保存自动维护数据
 * @param {string} data
 * @returns
 */
export const editAutoMaintenance = (data: string) => http.fetch('editAutoMaintenance', getXmlWrapData(data))

/**
 * @description 获取通道状态数据
 * @returns
 */
export const queryChlStatus = () => http.fetch('queryChlStatus', getXmlWrapData(''))

/**
 * @description 获取录像状态数据
 * @returns
 */
export const queryRecStatus = () => http.fetch('queryRecStatus', getXmlWrapData(''))

/**
 * @description
 * @returns
 */
export const queryDwell = () => http.fetch('queryDwell', getXmlWrapData(''))

/**
 * @description 获取系统工作模式
 * @returns
 */
export const querySystemWorkMode = () => http.fetch('querySystemWorkMode', getXmlWrapData(''))

/**
 * @description 更新系统工作模式
 * @param data
 * @returns
 */
export const editSystemWorkMode = (data: string) => http.fetch('querySystemWorkMode', getXmlWrapData(data))

/**
 * @description
 * @param {string} data
 * @returns
 */
export const editDwell = (data: string) => http.fetch('editDwell', getXmlWrapData(data))

/**
 * @description 新增自定义视图
 * @param {string} data
 * @returns
 */
export const addCustomerView = (data: string) => http.fetch('addCustomerView', getXmlWrapData(data))

/**
 * @description 获取自定义视图列表
 * @returns
 */
export const queryCustomerView = () => http.fetch('queryCustomerView', getXmlWrapData(''))

/**
 * @description 获取OSD输出配置
 * @returns
 */
export const queryDevOsdDisplayCfg = () => http.fetch('queryDevOsdDisplayCfg', getXmlWrapData(''))

/**
 * @description 更新OSD输出配置
 * @param {string} data
 * @returns
 */
export const editDevOsdDisplayCfg = (data: string) => http.fetch('editDevOsdDisplayCfg', getXmlWrapData(data))

/**
 * @description 获取磁盘信息
 * @returns
 */
export const queryStorageDevInfo = () => http.fetch('queryStorageDevInfo', getXmlWrapData(''))

/**
 * @description 获取系统信息
 * @returns
 */
export const queryDoubleSystemInfo = () => http.fetch('queryDoubleSystemInfo', getXmlWrapData(''))

/**
 * @description 升级文件校验
 * @param {string} data
 * @returns
 */
export const queryUpgradeFileHead = (data: string) => http.fetch('queryUpgradeFileHead', getXmlWrapData(data))

/**
 * @description 获取导出配置数据
 * @param {string} data
 * @returns
 */
export const exportConfig = (data: string) => http.fetch('exportConfig', getXmlWrapData(data), {}, false)

/**
 * @description 获取报警状态数据
 * @returns
 */
export const queryAlarmStatus = () => http.fetch('queryAlarmStatus', getXmlWrapData(''))

/**
 * @description 获取日志数据
 * @param {string} data
 * @returns
 */
export const queryLog = (data: string) => http.fetch('queryLog', getXmlWrapData(data))

/**
 * @description 获取日志导出数据
 * @param {string} data
 * @returns
 */
export const exportLog = (data: string) => http.fetch('exportLog', getXmlWrapData(data))

/**
 * @description 获取POS列表数据
 * @returns
 */
export const queryPosList = () => http.fetch('queryPosList', getXmlWrapData(''))

/**
 * @description 更新POS列表数据
 * @param {string} data
 * @returns
 */
export const editPosList = (data: string) => http.fetch('editPosList', getXmlWrapData(data))
