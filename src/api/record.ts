/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-26 11:23:41
 * @Description: 录像模块API
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-03 09:37:49
 */
import http from './api'

// 查询录像模式配置信息
export const queryRecordDistributeInfo = () => http.fetch('queryRecordDistributeInfo', getXmlWrapData(''))

// 设置录像模式配置信息
export const editRecordDistributeInfo = (data: string) => http.fetch('editRecordDistributeInfo', getXmlWrapData(data))

// 获取通道的录像排程配置
export const queryRecordScheduleList = () => http.fetch('queryRecordScheduleList', getXmlWrapData(''))

// 设置通道的录像排程配置
export const editRecordScheduleList = (data: string) => http.fetch('editRecordScheduleList', getXmlWrapData(data))
