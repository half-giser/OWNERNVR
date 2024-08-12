/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-12 10:28:05
 */

import { type AxiosRequestConfig } from 'axios'
import http from './api'

// 查询报警输出参数
export const queryAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('queryAlarmOutParam', getXmlWrapData(data), config)

// 编辑报警输出参数
export const editAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('editAlarmOutParam', getXmlWrapData(data), config)
