/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-06-02 11:57:11
 * @Description: 系统API
 */
import fetch from './api'

/**
 * @description 获取服务端能力集
 * @returns
 */
export const querySystemCaps = () => fetch('querySystemCaps', '')

/**
 * @description 获取设备基本信息
 * @returns
 */
export const queryBasicCfg = () => fetch('queryBasicCfg', '')

/**
 * @description 修改设备基本信息
 * @param {string} data
 * @returns
 */
export const editBasicCfg = (data: string) => fetch('editBasicCfg', data)

/**
 * @description 查询活跃状态
 * @returns
 */
export const queryActivationStatus = () => fetch('queryActivationStatus', '')

/**
 * @description 获取时间配置
 * @returns
 */
export const queryTimeCfg = (state = true) => fetch('queryTimeCfg', '', {}, state)

/**
 * @description 编辑时间
 * @param {string} data
 * @returns
 */
export const editTimeCfg = (data: string) => fetch('editTimeCfg', data)

/**
 * @description 恢复出厂配置
 * @param {string} data
 * @returns
 */
export const restoreDefaults = (data: string) => fetch('restoreDefaults', data, {}, false)

/**
 * @description HTTP链接测试
 * @returns
 */
export const httpConnectionTest = () => fetch('httpConnectionTest', '', {}, false)

/**
 * @description 系统重启
 * @param {string} data
 * @returns
 */
export const reboot = (data: string) => fetch('reboot', data, {}, false)

/**
 * @description 获取自动维护数据
 * @returns
 */
export const queryAutoMaintenance = () => fetch('queryAutoMaintenance', '')

/**
 * @description 保存自动维护数据
 * @param {string} data
 * @returns
 */
export const editAutoMaintenance = (data: string) => fetch('editAutoMaintenance', data)

/**
 * @description 获取通道状态数据
 * @returns
 */
export const queryChlStatus = () => fetch('queryChlStatus', '')

/**
 * @description 获取录像状态数据
 * @returns
 */
export const queryRecStatus = () => fetch('queryRecStatus', '')

/**
 * @description
 * @returns
 */
export const queryDwell = () => fetch('queryDwell', '')

/**
 * @description 获取系统工作模式
 * @returns
 */
export const querySystemWorkMode = () => fetch('querySystemWorkMode', '')

/**
 * @description 更新系统工作模式
 * @param data
 * @returns
 */
export const editSystemWorkMode = (data: string) => fetch('querySystemWorkMode', data)

/**
 * @description
 * @param {string} data
 * @returns
 */
export const editDwell = (data: string) => fetch('editDwell', data)

/**
 * @description 新增自定义视图
 * @param {string} data
 * @returns
 */
export const addCustomerView = (data: string) => fetch('addCustomerView', data)

/**
 * @description 获取自定义视图列表
 * @returns
 */
export const queryCustomerView = () => fetch('queryCustomerView', '')

/**
 * @description 获取OSD输出配置
 * @returns
 */
export const queryDevOsdDisplayCfg = () => fetch('queryDevOsdDisplayCfg', '')

/**
 * @description 更新OSD输出配置
 * @param {string} data
 * @returns
 */
export const editDevOsdDisplayCfg = (data: string) => fetch('editDevOsdDisplayCfg', data)

/**
 * @description 获取磁盘信息
 * @param {boolean} status
 * @returns
 */
export const queryStorageDevInfo = (status = true) => fetch('queryStorageDevInfo', '', {}, status)

/**
 * @description 获取系统信息
 * @returns
 */
export const queryDoubleSystemInfo = () => fetch('queryDoubleSystemInfo', '')

/**
 * @description 升级文件校验
 * @param {string} data
 * @returns
 */
export const queryUpgradeFileHead = (data: string) => fetch('queryUpgradeFileHead', data)

/**
 * @description 获取导出配置数据
 * @param {string} data
 * @returns
 */
export const exportConfig = (data: string) => fetch('exportConfig', data, {})

/**
 * @description 获取报警状态数据
 * @returns
 */
export const queryAlarmStatus = () => fetch('queryAlarmStatus', '')

/**
 * @description 获取日志数据
 * @param {string} data
 * @returns
 */
export const queryLog = (data: string) => fetch('queryLog', data)

/**
 * @description 获取日志导出数据
 * @param {string} data
 * @returns
 */
export const exportLog = (data: string) => fetch('exportLog', data)

/**
 * @description 获取POS列表数据
 * @returns
 */
export const queryPosList = () => fetch('queryPosList', '')

/**
 * @description 更新POS列表数据
 * @param {string} data
 * @returns
 */
export const editPosList = (data: string) => fetch('editPosList', data)

/**
 * @description 获取地区列表
 * @returns
 */
export const queryRegionList = () => fetch('queryRegionList', '', {}, false)

/**
 * @description 获取默认配置
 * @param {string} data
 * @returns
 */
export const queryDefaultInitData = (data: string) => fetch('queryDefaultInitData', data, {}, false)

/**
 * @description 激活设备
 * @param {string} data
 * @returns
 */
export const activateDev = (data: string) => fetch('activateDev', data, {}, false)

/**
 * @description 获取Poe电源配置
 * @returns
 */
export const queryPoePower = () => fetch('queryPoePower', '', {}, false)

/**
 * @description 更新Poe电源配置
 * @param {string} data
 * @returns
 */
export const editPoePower = (data: string) => fetch('editPoePower', data, {}, false)

/**
 * @description 获取地标平台参数
 * @returns
 */
export const querySHDBParam = () => fetch('querySHDBParam', '')

/**
 * @description 更新地标平台参数
 * @param {string} data
 * @returns
 */
export const editSHDBParam = (data: string) => fetch('editSHDBParam', data)

/**
 * @description 获取报警图像上传数据
 * @returns
 */
export const querySHDBEventUploadCfg = () => fetch('querySHDBEventUploadCfg', '')

/**
 * @description 更新报警图像上传数据
 * @param {string} data
 * @returns
 */
export const editSHDBEventUploadCfg = (data: string) => fetch('editSHDBEventUploadCfg', data)

/**
 * @description 获取定时上传图像数据
 * @returns
 */
export const querySHDBNormalUploadCfg = () => fetch('querySHDBNormalUploadCfg', '')

/**
 * @description 修改定时上传图像数据
 * @returns
 */
export const editSHDBNormalUploadCfg = (data: string) => fetch('editSHDBNormalUploadCfg', data)

/**
 * @description 修改平台操作管理
 * @returns
 */
export const editSHDBOperationCfg = (data: string) => fetch('editSHDBOperationCfg', data)

/**
 * @description 心跳检测
 * @returns
 */
export const heartBeat = () => fetch('heartBeat', '')
