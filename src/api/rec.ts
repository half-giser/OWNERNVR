/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 录像与回放
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-06 17:09:41
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
 * @description 获取录像分配信息
 * @param
 * @returns
 */
export const queryRecordDistributeInfo = () => http.fetch('queryRecordDistributeInfo', getXmlWrapData(''))

/**
 * @description 获取系统宽带容量
 * @param
 * @returns
 * */
export const querySystemCaps = () => http.fetch('querySystemCaps', getXmlWrapData(''))

/**
 * @description 获取录像剩余时间
 * @param {string} data
 * @returns
 */
export const queryRemainRecTime = (data: string) => http.fetch('queryRemainRecTime', getXmlWrapData(data))
