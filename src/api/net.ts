/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 20:22:27
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 18:13:19
 */
import http, { getXmlWrapData } from './api'

/**
 * @description 获取网络状态
 * @returns
 */
export const queryNetStatus = () => http.fetch('queryNetStatus', getXmlWrapData(''))

// queryNetCfgV2
export const queryNetCfgV2 = () => http.fetch('queryNetCfgV2', getXmlWrapData(''))

/**
 * @description 获取UPnP配置
 * @returns
 */
export const queryUPnPCfg = () => http.fetch('queryUPnPCfg', getXmlWrapData(''))

/**
 * @description 修改UPnP配置
 * @returns
 */
export const editUPnPCfg = (data: string) => http.fetch('editUPnPCfg', getXmlWrapData(data))

/**
 * @description 获取网络端口数据
 * @returns
 */
export const queryNetPortCfg = () => http.fetch('queryNetPortCfg', getXmlWrapData(''))

/**
 * @description 修改网络状态数据
 * @returns
 */
export const editNetPortCfg = (data: string) => http.fetch('editNetPortCfg', getXmlWrapData(data))

/**
 * @description 获取获取网络状态配置
 * @returns
 */
export const queryWirelessNetworkCfg = () => http.fetch('queryWirelessNetworkCfg', getXmlWrapData(''))

export const queryApiServer = () => http.fetch('queryApiServer', getXmlWrapData(''))

export const editApiServer = (data: string) => http.fetch('editApiServer', getXmlWrapData(data))

export const queryRTSPServer = () => http.fetch('queryRTSPServer', getXmlWrapData(''))

export const editRTSPServer = (data: string) => http.fetch('editRTSPServer', getXmlWrapData(data))
