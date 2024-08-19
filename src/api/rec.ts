/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 录像与回放
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 14:47:03
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
 * @description 获取节点信息
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
 * @param {string} data
 * @returns
 */
export const ctrlRecBackupTask = (data: string) => http.fetch('ctrlRecBackupTask', getXmlWrapData(data))

/**
 * @description 查询通道录像日志列表
 * @param {string} data
 * @returns
 */
export const queryChlRecLog = (data: string) => http.fetch('queryChlRecLog', getXmlWrapData(data))

/**
 * @description 创建远程备份任务
 * @param {string} data
 * @returns
 */
export const createRecBackupTask = (data: string) => http.fetch('createRecBackupTask', getXmlWrapData(data))

/**
 * @description 获取录像分配信息
 * @param
 * @returns
 */
// export const queryRecordDistributeInfo = () => http.fetch('queryRecordDistributeInfo', getXmlWrapData(''))

/**
 * @description 获取系统宽带容量
 * @param
 * @returns
 * */
// export const querySystemCaps = () => http.fetch('querySystemCaps', getXmlWrapData(''))

/**
 * @description 获取录像剩余时间
 * @param {string} data
 * @returns
 */
export const queryRemainRecTime = (data: string) => http.fetch('queryRemainRecTime', getXmlWrapData(data))

/**
 * @description 搜索图片
 * @param {string} data
 * @returns
 */
export const searchPictures = (data: string) => http.fetch('searchPictures', getXmlWrapData(data))

/**
 * @description 删除图片
 * @param {string} data
 * @returns
 */
export const delPictures = (data: string) => http.fetch('delPictures', getXmlWrapData(data))

/**
 * @description 备份图片
 * @param {string} data
 * @returns
 */
export const backupPicture = (data: string) => http.fetch('backupPicture', getXmlWrapData(data))

/**
 * @description 获取每日分通道录像列表
 * @param {string} data
 * @returns
 */
export const queryDateListRecChl = (data: string) => http.fetch('queryDateListRecChl', getXmlWrapData(data))

/**
 * @description 获取通道实时抓拍缩略图
 * @param {string} data
 * @returns
 */
export const snapChlPicture = (data: string) => http.fetch('snapChlPicture', getXmlWrapData(data))

/**
 * @description 获取回放数据的大小
 * @param {string} data
 * @returns
 */
export const queryRecDataSize = (data: string) => http.fetch('queryRecDataSize', getXmlWrapData(data))
