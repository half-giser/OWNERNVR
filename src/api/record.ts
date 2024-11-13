/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-26 11:23:41
 * @Description: 录像模块API
 */
import http from './api'

/**
 * @description 查询录像模式配置信息
 * @returns
 */
export const queryRecordDistributeInfo = () => http.fetch('queryRecordDistributeInfo', getXmlWrapData(''))

/**
 * @description 设置录像模式配置信息
 * @param {string} data
 * @returns
 */
export const editRecordDistributeInfo = (data: string) => http.fetch('editRecordDistributeInfo', getXmlWrapData(data))

/**
 * @description 获取通道的录像排程配置
 * @returns
 */
export const queryRecordScheduleList = () => http.fetch('queryRecordScheduleList', getXmlWrapData(''))

/**
 * @description 设置通道的录像排程配置
 * @param {string} data
 * @returns
 */
export const editRecordScheduleList = (data: string) => http.fetch('editRecordScheduleList', getXmlWrapData(data))
