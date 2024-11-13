/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 11:41:37
 * @Description: 磁盘API
 */

import http from './api'

/**
 * @description 查询磁盘模式
 * @returns
 */
export const queryDiskMode = () => http.fetch('queryDiskMode', getXmlWrapData(''))

/**
 * @description 更改磁盘模式
 * @param {string} data
 * @returns
 */
export const editDiskMode = (data: string) => http.fetch('editDiskMode', getXmlWrapData(data))

/**
 * @description 查询S.M.A.R.T信息
 * @param {string} data
 * @returns
 */
export const queryDiskSmartInfo = (data: string) => http.fetch('queryDiskSmartInfo', getXmlWrapData(data))

/**
 * @description 获取所有磁盘的健康状态
 * @returns
 */
export const queryAllDisksHealthStatus = () => http.fetch('queryAllDisksHealthStatus', getXmlWrapData(''))

/**
 * @description 获取指定磁盘的健康状态
 * @param {string} data
 * @returns
 */
export const queryDiskHealthDetailInfo = (data: string) => http.fetch('queryDiskHealthDetailInfo', getXmlWrapData(data))

/**
 * @description 查询磁盘状态
 * @param {boolean} status
 * @returns
 */
export const queryDiskStatus = (status = true) => http.fetch('queryDiskStatus', getXmlWrapData(''), {}, status)

/**
 * @description 查询指定磁盘信息
 * @param {string} data
 * @returns
 */
export const queryDiskDetailInfo = (data: string) => http.fetch('queryDiskDetailInfo', getXmlWrapData(data))

/**
 * @description 格式化磁盘
 * @param {string} data
 * @param {boolean} status
 * @returns
 */
export const formatDisk = (data: string, status = true) => http.fetch('formatDisk', getXmlWrapData(data), {}, status)

/**
 * @description 解锁磁盘
 * @param {string} data
 * @returns
 */
export const unlockDisk = (data: string) => http.fetch('unlockDisk', getXmlWrapData(data))

/**
 * @description 获取磁盘组
 * @param {string} data
 * @returns
 */
export const queryDiskGroupList = (data: string) => http.fetch('queryDiskGroupList', getXmlWrapData(data))

/**
 * @description 获取逻辑磁盘列表
 * @param {stirng} data
 * @returns
 */
export const queryLogicalDiskList = (data: string) => http.fetch('queryLogicalDiskList', getXmlWrapData(data))

/**
 * @description 获取物理磁盘数据
 * @returns
 */
export const queryPhysicalDiskInfo = () => http.fetch('queryPhysicalDiskInfo', getXmlWrapData(''))

/**
 * @description 设置为备用盘
 * @param {string} data
 * @returns
 */
export const setToSpare = (data: string) => http.fetch('setToSpare', getXmlWrapData(data))

/**
 * @description 设置为空闲盘
 * @param {string} data
 * @returns
 */
export const setToFreeDisk = (data: string) => http.fetch('setToFreeDisk', getXmlWrapData(data))

/**
 * @description 获取创建阵列容量
 * @param {string} data
 * @returns
 */
export const queryCreateRaidCapacity = (data: string) => http.fetch('queryCreateRaidCapacity', getXmlWrapData(data))

/**
 * @description 创建阵列
 * @param {string} data
 * @returns
 */
export const createRaid = (data: string) => http.fetch('createRaid', getXmlWrapData(data))

/**
 * @description 查询磁盘阵列信息
 * @returns
 */
export const queryRaidDetailInfo = () => http.fetch('queryRaidDetailInfo', getXmlWrapData(''))

/**
 * @description 删除阵列
 * @param {string} data
 * @returns
 */
export const delRaid = (data: string) => http.fetch('delRaid', getXmlWrapData(data))

/**
 * @description 查询磁盘阵列状态
 * @returns
 */
export const queryRaidStatus = () => http.fetch('queryRaidStatus', getXmlWrapData(''))

/**
 * @description 重建阵列
 * @param {string} data
 * @returns
 */
export const repairRaid = (data: string) => http.fetch('repairRaid', getXmlWrapData(data))

/**
 * @description 查询设备连接的U盘信息
 * @returns
 */
export const queryExternalDisks = () => http.fetch('queryExternalDisks', getXmlWrapData(''))
