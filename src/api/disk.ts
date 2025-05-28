/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 11:41:37
 * @Description: 磁盘API
 */

import fetch from './api'

/**
 * @description 查询磁盘模式
 * @returns
 */
export const queryDiskMode = () => fetch('queryDiskMode', '')

/**
 * @description 更改磁盘模式
 * @param {string} data
 * @returns
 */
export const editDiskMode = (data: string) => fetch('editDiskMode', data)

/**
 * @description 查询S.M.A.R.T信息
 * @param {string} data
 * @returns
 */
export const queryDiskSmartInfo = (data: string) => fetch('queryDiskSmartInfo', data)

/**
 * @description 获取所有磁盘的健康状态
 * @returns
 */
export const queryAllDisksHealthStatus = () => fetch('queryAllDisksHealthStatus', '')

/**
 * @description 获取指定磁盘的健康状态
 * @param {string} data
 * @returns
 */
export const queryDiskHealthDetailInfo = (data: string) => fetch('queryDiskHealthDetailInfo', data)

/**
 * @description 查询磁盘状态
 * @param {boolean} status
 * @returns
 */
export const queryDiskStatus = (status = true) => fetch('queryDiskStatus', '', {}, status)

/**
 * @description 查询指定磁盘信息
 * @param {string} data
 * @returns
 */
export const queryDiskDetailInfo = (data: string) => fetch('queryDiskDetailInfo', data)

/**
 * @description 格式化磁盘
 * @param {string} data
 * @param {boolean} status
 * @returns
 */
export const formatDisk = (data: string, status = true) => fetch('formatDisk', data, {}, status)

/**
 * @description 解锁磁盘
 * @param {string} data
 * @returns
 */
export const unlockDisk = (data: string) => fetch('unlockDisk', data)

/**
 * @description 获取磁盘组
 * @param {string} data
 * @returns
 */
export const queryDiskGroupList = (data: string) => fetch('queryDiskGroupList', data)

/**
 * @description 获取逻辑磁盘列表
 * @param {stirng} data
 * @returns
 */
export const queryLogicalDiskList = (data: string) => fetch('queryLogicalDiskList', data)

/**
 * @description 获取物理磁盘数据
 * @returns
 */
export const queryPhysicalDiskInfo = () => fetch('queryPhysicalDiskInfo', '')

/**
 * @description 设置为备用盘
 * @param {string} data
 * @returns
 */
export const setToSpare = (data: string) => fetch('setToSpare', data)

/**
 * @description 设置为空闲盘
 * @param {string} data
 * @returns
 */
export const setToFreeDisk = (data: string) => fetch('setToFreeDisk', data)

/**
 * @description 获取创建阵列容量
 * @param {string} data
 * @returns
 */
export const queryCreateRaidCapacity = (data: string) => fetch('queryCreateRaidCapacity', data)

/**
 * @description 创建阵列
 * @param {string} data
 * @returns
 */
export const createRaid = (data: string) => fetch('createRaid', data)

/**
 * @description 查询磁盘阵列信息
 * @returns
 */
export const queryRaidDetailInfo = () => fetch('queryRaidDetailInfo', '')

/**
 * @description 删除阵列
 * @param {string} data
 * @returns
 */
export const delRaid = (data: string) => fetch('delRaid', data)

/**
 * @description 查询磁盘阵列状态
 * @returns
 */
export const queryRaidStatus = () => fetch('queryRaidStatus', '')

/**
 * @description 重建阵列
 * @param {string} data
 * @returns
 */
export const repairRaid = (data: string) => fetch('repairRaid', data)

/**
 * @description 查询设备连接的U盘信息
 * @returns
 */
export const queryExternalDisks = () => fetch('queryExternalDisks', '')
