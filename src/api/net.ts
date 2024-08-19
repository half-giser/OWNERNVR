/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 20:22:27
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 15:40:31
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
export const editEmailCfg = (data: string) => http.fetch('editEmailCfg', getXmlWrapData(data))

/**
 * @description 测试Email配置
 * @param {string} data
 * @returns
 */
export const testEmailCfg = (data: string) => http.fetch('testEmailCfg', getXmlWrapData(data))

/**
 * @description 获取802.1x配重
 * @returns
 */
export const query802xCfg = () => http.fetch('query802xCfg', getXmlWrapData(''))

/**
 * @description 更新802.1x配置
 * @param {string} data
 * @returns
 */
export const edit802xCfg = (data: string) => http.fetch('edit802xCfg', getXmlWrapData(data))

/**
 * @description 获取云更新配置
 * @returns
 */
export const queryCloudUpgradeCfg = () => http.fetch('queryCloudUpgradeCfg', getXmlWrapData(''))

/**
 * @description 获取云更新下载状态
 * @returns
 */
export const getPackageDownloadStatus = () => http.fetch('getPackageDownloadStatus', getXmlWrapData(''))

/**
 * @description 编辑云更新配置
 * @returns
 */
export const editCloudUpgradeCfg = (data: string) => http.fetch('editCloudUpgradeCfg', getXmlWrapData(data))

/**
 * @description 检查版本
 * @returns
 */
export const checkVersion = (data: string) => http.fetch('checkVersion', getXmlWrapData(data))

/**
 * @description 检查版本
 * @returns
 */
export const cloudUpgrade = (data: string) => http.fetch('cloudUpgrade', getXmlWrapData(data))

/**
 * @description 获取P2P配置
 * @returns
 */
export const queryP2PCfg = () => http.fetch('queryP2PCfg', getXmlWrapData(''))

/**
 * @description 更新P2P配置
 * @param {stirng} data
 * @returns
 */
export const editP2PCfg = (data: string) => http.fetch('editP2PCfg', getXmlWrapData(data))

/**
 * @description 获取证书配置
 * @returns
 */
export const queryCert = () => http.fetch('queryCert', getXmlWrapData(''))

/**
 * @description 删除证书
 * @returns
 */
export const delCert = () => http.fetch('delCert', getXmlWrapData(''))

/**
 * @description 创建证书
 * @param {string} data
 * @returns
 */
export const createCert = (data: string) => http.fetch('createCert', getXmlWrapData(data))

/**
 * @description 获取证书请求
 * @returns
 */
export const queryCertReq = () => http.fetch('queryCertReq', getXmlWrapData(''))

/**
 * @description 删除证书请求
 * @returns
 */
export const delCertReq = () => http.fetch('delCertReq', getXmlWrapData(''))

/**
 * @description 创建证书请求
 * @param {string} data
 * @returns
 */
export const createCertReq = (data: string) => http.fetch('createCertReq', getXmlWrapData(data))

/**
 * @description 导入证书
 * @returns
 */
export const importCert = () => http.fetch('importCert', getXmlWrapData(''))

/**
 * @description 获取FTP配置
 * @returns
 */
export const queryFTPCfg = () => http.fetch('queryFTPCfg', getXmlWrapData(''))

/**
 * @description 测试FTP配置
 * @param {string} data
 * @returns
 */
export const testFTPCfg = (data: string) => http.fetch('testFTPCfg', getXmlWrapData(data))

/**
 * @description 更新FTP配置
 * @param {string} data
 * @returns
 */
export const editFTPCfg = (data: string) => http.fetch('editFTPCfg', getXmlWrapData(data))

/**
 * @description 获取SNMP配置
 * @returns
 */
export const querySNMPCfg = () => http.fetch('querySNMPCfg', getXmlWrapData(''))

/**
 * @description 更新SNMP配置
 * @param {string} data
 * @returns
 */
export const editSNMPCfg = (data: string) => http.fetch('editSNMPCfg', getXmlWrapData(data))

/**
 * @description 获取网络节点编码信息
 * @param {string} data
 * @returns
 */
export const queryNetworkNodeEncodeInfo = (data: string) => http.fetch('queryNetworkNodeEncodeInfo', getXmlWrapData(data))

/**
 * @description 更新网络节点编码信息
 * @param {string} data
 * @returns
 */
export const editNetworkNodeEncodeInfo = (data: string) => http.fetch('editNetworkNodeEncodeInfo', getXmlWrapData(data))

/**
 * @description 获取OVNIF配置信息
 * @returns
 */
export const queryOnvifCfg = () => http.fetch('editNetworkNodeEncodeInfo', getXmlWrapData(''))

/**
 * @description 修改OVNIF配置信息
 * @returns
 */
export const editOnvifCfg = (data: string) => http.fetch('editOnvifCfg', getXmlWrapData(data))

/**
 * @description 获取OVNIF用户列表
 * @returns
 */
export const queryOnvifUserList = () => http.fetch('queryOnvifUserList', getXmlWrapData(''))

/**
 * @description 创建OVNIF用户
 * @returns
 */
export const createOnvifUser = (data: string) => http.fetch('createOnvifUser', getXmlWrapData(data))

/**
 * @description 编辑OVNIF用户
 * @returns
 */
export const editOnvifUser = (data: string) => http.fetch('editOnvifUser', getXmlWrapData(data))

/**
 * @description 删除ONVIF用户
 * @param {string} data
 * @returns
 */
export const deleteOnivfUser = (data: string) => http.fetch('deleteOnivfUser', getXmlWrapData(data))

/**
 * @description 获取平台接入配置
 * @returns
 */
export const queryPlatformCfg = () => http.fetch('queryPlatformCfg', getXmlWrapData(''))

/**
 * @description 编辑平台接入配置
 * @param {String} data
 * @returns
 */
export const editPlatformCfg = (data: string) => http.fetch('editPlatformCfg', getXmlWrapData(data), {}, false)
