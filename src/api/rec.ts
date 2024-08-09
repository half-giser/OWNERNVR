/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 录像与回放
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 18:24:19
 */
import http, { getXmlWrapData } from './api'

/**
 * @description 更新手动录像状态
 * @param {string} data
 * @returns
 */
export const editManualRecord = (data: string) => http.fetch('editManualRecord', getXmlWrapData(data))

/**
 * @description 查询手动录像状态
 * @param {string} data
 * @returns
 */
export const queryManualRecord = (data: string) => http.fetch('queryManualRecord', getXmlWrapData(data))

/**
 * @description 获取节点码流信息
 * @param {string} data
 * @returns
 */
export const queryNodeEncodeInfo = (data: string) => http.fetch('queryNodeEncodeInfo', getXmlWrapData(data))

/**
 * @description 修改节点码流信息
 * @param {string} data
 * @returns
 */
export const editNodeEncodeInfo = (data: string) => http.fetch('editNodeEncodeInfo', getXmlWrapData(data))

/**
 * @description 获取录像分段（录像日期）
 * @param {string} data
 * @returns
 */
export const queryRecSection = (data: string) => http.fetch('queryRecSection', getXmlWrapData(data))

/**
 * @description 获取备份列表
 * @returns
 */
export const queryRecBackupTaskList = () => http.fetch('queryRecBackupTaskList', getXmlWrapData(''))

/**
 * @description 修改备份任务
 * @returns
 */
export const ctrlRecBackupTask = (data: string) => http.fetch('ctrlRecBackupTask', getXmlWrapData(data))

/**
 * @description 查询通道录像日志列表
 * @param data
 * @returns
 */
export const queryChlRecLog = (data: string) => http.fetch('queryChlRecLog', getXmlWrapData(data))

/**
 * @description 创建远程备份任务
 * @param data
 * @returns
 */
export const createRecBackupTask = (data: string) => http.fetch('createRecBackupTask', getXmlWrapData(data))
