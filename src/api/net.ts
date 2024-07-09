/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 20:22:27
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-27 09:37:04
 */
import type { AxiosRequestConfig } from 'axios'
import http, { getXmlWrapData } from './api'

// queryNetStatus
export const queryNetStatus = () => http.fetch('queryNetStatus', getXmlWrapData(''))

// queryNetCfgV2
export const queryNetCfgV2 = () => http.fetch('queryNetCfgV2', getXmlWrapData(''))

// queryUPnPCfg
export const queryUPnPCfg = () => http.fetch('queryUPnPCfg', getXmlWrapData(''))

/**
 * @description 获取网络状态数据
 * @returns
 */
export const queryNetPortCfg = () => http.fetch('queryNetPortCfg', getXmlWrapData(''))
