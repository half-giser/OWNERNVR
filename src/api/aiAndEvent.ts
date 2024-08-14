/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-14 15:02:00
 */

import { type AxiosRequestConfig } from 'axios'
import http from './api'

// 查询报警输出参数
export const queryAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('queryAlarmOutParam', getXmlWrapData(data), config)

// 编辑报警输出参数
export const editAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('editAlarmOutParam', getXmlWrapData(data), config)

// 获取事件通知相关参数
export const queryEventNotifyParam = () => http.fetch('queryEventNotifyParam', getXmlWrapData(''))

// 修改事件通知显示
export const editEventNotifyParam = (data: string) => http.fetch('editEventNotifyParam', getXmlWrapData(data))

// 修改事件通知显示
export const testMobilePush = () => http.fetch('testMobilePush', getXmlWrapData(''))

// 查询灯光报警输出配置
export const queryWhiteLightAlarmOutCfg = (data: string) => http.fetch('queryWhiteLightAlarmOutCfg', getXmlWrapData(data))

// 编辑灯光报警输出配置
export const editWhiteLightAlarmOutCfg = (data: string) => http.fetch('editWhiteLightAlarmOutCfg', getXmlWrapData(data))
