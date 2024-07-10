/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 20:22:27
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-10 15:34:47
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

/**
 * @description 获取API服务配置
 * @returns
 */
export const queryApiServer = () => http.fetch('queryApiServer', getXmlWrapData(''))

/**
 * @description 更新API服务配置
 * @param {string} data
 * @returns
 */
export const editApiServer = (data: string) => http.fetch('editApiServer', getXmlWrapData(data))

/**
 * @description 获取RTSP服务配置
 * @returns
 */
export const queryRTSPServer = () => http.fetch('queryRTSPServer', getXmlWrapData(''))

/**
 * @description 更新RTSP服务配置
 * @param {string} data
 * @returns
 */
export const editRTSPServer = (data: string) => http.fetch('editRTSPServer', getXmlWrapData(data))

/**
 * @description 获取PPPoE配置
 * @returns
 */
export const queryPPPoECfg = () => http.fetch('queryPPPoECfg', getXmlWrapData(''))

/**
 * @description 更新PPPoE配置
 * @returns
 */
export const editPPPoECfg = (data: string) => http.fetch('editPPPoECfg', getXmlWrapData(data))

/**
 * @description 更新DDNS配置
 * @returns
 */
export const queryDDNSCfg = () => http.fetch('queryDDNSCfg', getXmlWrapData(''))

/**
 * @description 更新DDNS配置
 * @param {string} data
 * @returns
 */
export const editDDNSCfg = (data: string) => http.fetch('editDDNSCfg', getXmlWrapData(data))

/**
 * @description 测试DDNS
 * @param {string} data
 * @returns
 */
export const testDDNSCfg = (data: string) => http.fetch('testDDNSCfg', getXmlWrapData(data))

/**
 * @description 获取Email配置
 * @param {string} data
 * @returns
 */
export const queryEmailCfg = () => http.fetch('queryEmailCfg', getXmlWrapData(''))

/**
 * @description 更新Email配置
 * @param {string} data
 * @returns
 */
export const editEmailCfg = (data: string) => http.fetch('queryEmailCfg', getXmlWrapData(data))

/**
 * @description 测试Email配置
 * @param {string} data
 * @returns
 */
export const testEmailCfg = (data: string) => http.fetch('queryEmailCfg', getXmlWrapData(data))
