/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 录像与回放
 */
import fetch from './api'

/**
 * @description 更新手动录像状态
 * @param {string} data
 * @returns
 */
export const editManualRecord = (data: string) => fetch('editManualRecord', data)

/**
 * @description 查询手动录像状态
 * @param {string} data
 * @returns
 */
export const queryManualRecord = (data: string) => fetch('queryManualRecord', data)

/**
 * @description 获取节点信息
 * @param {string} data
 * @returns
 */
export const queryNodeEncodeInfo = (data: string) => fetch('queryNodeEncodeInfo', data)

/**
 * @description 修改节点码流信息
 * @param {string} data
 * @returns
 */
export const editNodeEncodeInfo = (data: string) => fetch('editNodeEncodeInfo', data)

/**
 * @description 获取录像分段（录像日期）
 * @param {string} data
 * @returns
 */
export const queryRecSection = (data: string) => fetch('queryRecSection', data)

/**
 * @description 获取备份列表
 * @returns
 */
export const queryRecBackupTaskList = () => fetch('queryRecBackupTaskList', '')

/**
 * @description 修改备份任务
 * @param {string} data
 * @returns
 */
export const ctrlRecBackupTask = (data: string) => fetch('ctrlRecBackupTask', data)

/**
 * @description 查询通道录像日志列表（1.4.13新增，代替了queryChlRecLog）
 * @param {string} data
 * @returns
 */
export const queryRecLog = (data: string) => fetch('queryRecLog', data)

/**
 * @description 查询通道录像日志列表
 * @param {string} data
 * @returns
 */
export const queryChlRecLog = (data: string) => fetch('queryChlRecLog', data)

/**
 * @description 创建远程备份任务
 * @param {string} data
 * @returns
 */
export const createRecBackupTask = (data: string) => fetch('createRecBackupTask', data)

/**
 * @description 获取录像剩余时间
 * @param {string} data
 * @returns
 */
export const queryRemainRecTime = (data: string) => fetch('queryRemainRecTime', data)

/**
 * @description 搜索图片
 * @param {string} data
 * @returns
 */
export const searchPictures = (data: string) => fetch('searchPictures', data)

/**
 * @description 删除图片
 * @param {string} data
 * @returns
 */
export const delPictures = (data: string) => fetch('delPictures', data)

/**
 * @description 备份图片
 * @param {string} data
 * @returns
 */
export const backupPicture = (data: string) => fetch('backupPicture', data)

/**
 * @description 获取每日分通道录像列表
 * @param {string} data
 * @returns
 */
export const queryDateListRecChl = (data: string) => fetch('queryDateListRecChl', data)

/**
 * @description 获取通道实时抓拍缩略图
 * @param {string} data
 * @returns
 */
export const snapChlPicture = (data: string) => fetch('snapChlPicture', data)

/**
 * @description 获取回放数据的大小
 * @param {string} data
 * @returns
 */
export const queryRecDataSize = (data: string) => fetch('queryRecDataSize', data)

/**
 * @description 查询设备硬盘中已存在的所有事件类型列表
 * @returns
 */
export const queryRecTypeList = () => fetch('queryRecTypeList', '')

/**
 * @description
 * @param data
 * @returns
 */
export const queryDatesExistRec = (data: string) => fetch('queryDatesExistRec', data)

/**
 * @description
 * @param data
 * @returns
 */
export const queryChlSnapPicture = (data: string) => fetch('queryDatesExistRec', data)
