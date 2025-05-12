/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 20:22:27
 * @Description: 网络相关API
 */
import fetch from './api'

/**
 * @description 获取网络状态
 * @returns
 */
export const queryNetStatus = () => fetch('queryNetStatus', '')

/**
 * @description 获取网络配置
 * @returns
 */
export const queryNetCfgV2 = () => fetch('queryNetCfgV2', '')

/**
 * @description
 * @param data
 * @returns
 */
export const editNetCfgV2 = (data: string) => fetch('editNetCfgV2', data)

/**
 * @description 获取网络配置
 * @returns
 */
export const queryNetCfgV3 = () => fetch('queryNetCfgV3', '')

/**
 * @description 更新网络配置
 * @param {string} data
 * @returns
 */
export const editNetCfgV3 = (data: string) => fetch('editNetCfgV3', data)

/**
 * @description 获取UPnP配置
 * @returns
 */
export const queryUPnPCfg = () => fetch('queryUPnPCfg', '')

/**
 * @description 修改UPnP配置
 * @returns
 */
export const editUPnPCfg = (data: string) => fetch('editUPnPCfg', data)

/**
 * @description 获取网络端口数据
 * @returns
 */
export const queryNetPortCfg = () => fetch('queryNetPortCfg', '')

/**
 * @description 修改网络状态数据
 * @returns
 */
export const editNetPortCfg = (data: string) => fetch('editNetPortCfg', data)

/**
 * @description 获取获取网络状态配置
 * @returns
 */
export const queryWirelessNetworkCfg = () => fetch('queryWirelessNetworkCfg', '')

/**
 * @description 获取API服务配置
 * @returns
 */
export const queryApiServer = () => fetch('queryApiServer', '')

/**
 * @description 更新API服务配置
 * @param {string} data
 * @returns
 */
export const editApiServer = (data: string) => fetch('editApiServer', data)

/**
 * @description 获取RTSP服务配置
 * @returns
 */
export const queryRTSPServer = () => fetch('queryRTSPServer', '')

/**
 * @description 更新RTSP服务配置
 * @param {string} data
 * @returns
 */
export const editRTSPServer = (data: string) => fetch('editRTSPServer', data)

/**
 * @description 获取PPPoE配置
 * @returns
 */
export const queryPPPoECfg = () => fetch('queryPPPoECfg', '')

/**
 * @description 更新PPPoE配置
 * @returns
 */
export const editPPPoECfg = (data: string) => fetch('editPPPoECfg', data)

/**
 * @description 更新DDNS配置
 * @returns
 */
export const queryDDNSCfg = () => fetch('queryDDNSCfg', '')

/**
 * @description 更新DDNS配置
 * @param {string} data
 * @returns
 */
export const editDDNSCfg = (data: string) => fetch('editDDNSCfg', data)

/**
 * @description 测试DDNS
 * @param {string} data
 * @returns
 */
export const testDDNSCfg = (data: string) => fetch('testDDNSCfg', data)

/**
 * @description 获取Email配置
 * @param {string} data
 * @returns
 */
export const queryEmailCfg = () => fetch('queryEmailCfg', '')

/**
 * @description 更新Email配置
 * @param {string} data
 * @returns
 */
export const editEmailCfg = (data: string) => fetch('editEmailCfg', data)

/**
 * @description 测试Email配置
 * @param {string} data
 * @returns
 */
export const testEmailCfg = (data: string) => fetch('testEmailCfg', data)

/**
 * @description 获取802.1x配重
 * @returns
 */
export const query802xCfg = () => fetch('query802xCfg', '')

/**
 * @description 更新802.1x配置
 * @param {string} data
 * @returns
 */
export const edit802xCfg = (data: string) => fetch('edit802xCfg', data)

/**
 * @description 获取云更新配置
 * @returns
 */
export const queryCloudUpgradeCfg = () => fetch('queryCloudUpgradeCfg', '')

/**
 * @description 获取云更新下载状态
 * @returns
 */
export const getPackageDownloadStatus = () => fetch('getPackageDownloadStatus', '')

/**
 * @description 编辑云更新配置
 * @param {string} data
 * @returns
 */
export const editCloudUpgradeCfg = (data: string) => fetch('editCloudUpgradeCfg', data)

/**
 * @description 检查版本
 * @param {string} data
 * @returns
 */
export const checkVersion = (data: string) => fetch('checkVersion', data)

/**
 * @description 检查版本
 * @param {string} data
 * @returns
 */
export const cloudUpgrade = (data: string) => fetch('cloudUpgrade', data)

/**
 * @description 获取P2P配置
 * @param {string} data
 * @returns
 */
export const queryP2PCfg = () => fetch('queryP2PCfg', '')

/**
 * @description 更新P2P配置
 * @param {stirng} data
 * @returns
 */
export const editP2PCfg = (data: string) => fetch('editP2PCfg', data)

/**
 * @description
 * @returns
 */
export const querySecurityAccess = () => fetch('querySecurityAccess', '')

/**
 * @description
 * @param data
 * @returns
 */
export const editSecurityAccess = (data: string) => fetch('editSecurityAccess', data)

/**
 * @description 获取证书配置
 * @param {string} data
 * @returns
 */
export const queryCert = () => fetch('queryCert', '')

/**
 * @description 删除证书
 * @returns
 */
export const delCert = () => fetch('delCert', '')

/**
 * @description 创建证书
 * @param {string} data
 * @returns
 */
export const createCert = (data: string) => fetch('createCert', data)

/**
 * @description 获取证书请求
 * @returns
 */
export const queryCertReq = () => fetch('queryCertReq', '')

/**
 * @description 删除证书请求
 * @returns
 */
export const delCertReq = () => fetch('delCertReq', '')

/**
 * @description 创建证书请求
 * @param {string} data
 * @returns
 */
export const createCertReq = (data: string) => fetch('createCertReq', data)

/**
 * @description 导入证书
 * @returns
 */
export const importCert = () => fetch('importCert', '')

/**
 * @description 获取FTP配置
 * @returns
 */
export const queryFTPCfg = () => fetch('queryFTPCfg', '')

/**
 * @description 测试FTP配置
 * @param {string} data
 * @returns
 */
export const testFTPCfg = (data: string) => fetch('testFTPCfg', data)

/**
 * @description 更新FTP配置
 * @param {string} data
 * @returns
 */
export const editFTPCfg = (data: string) => fetch('editFTPCfg', data)

/**
 * @description 获取SNMP配置
 * @returns
 */
export const querySNMPCfg = () => fetch('querySNMPCfg', '')

/**
 * @description 更新SNMP配置
 * @param {string} data
 * @returns
 */
export const editSNMPCfg = (data: string) => fetch('editSNMPCfg', data)

/**
 * @description 获取网络节点编码信息
 * @param {string} data
 * @returns
 */
export const queryNetworkNodeEncodeInfo = (data: string) => fetch('queryNetworkNodeEncodeInfo', data)

/**
 * @description 更新网络节点编码信息
 * @param {string} data
 * @returns
 */
export const editNetworkNodeEncodeInfo = (data: string) => fetch('editNetworkNodeEncodeInfo', data)

/**
 * @description 获取OVNIF配置信息
 * @returns
 */
export const queryOnvifCfg = () => fetch('queryOnvifCfg', '')

/**
 * @description 修改OVNIF配置信息
 * @param {string} data
 * @returns
 */
export const editOnvifCfg = (data: string) => fetch('editOnvifCfg', data)

/**
 * @description 获取OVNIF用户列表
 * @returns
 */
export const queryOnvifUserList = () => fetch('queryOnvifUserList', '')

/**
 * @description 创建OVNIF用户
 * @param {string} data
 * @returns
 */
export const createOnvifUser = (data: string) => fetch('createOnvifUser', data)

/**
 * @description 编辑OVNIF用户
 * @param {string} data
 * @returns
 */
export const editOnvifUser = (data: string) => fetch('editOnvifUser', data)

/**
 * @description 删除ONVIF用户
 * @param {string} data
 * @returns
 */
export const deleteOnivfUser = (data: string) => fetch('deleteOnivfUser', data)

/**
 * @description 获取平台接入配置
 * @returns
 */
export const queryPlatformCfg = () => fetch('queryPlatformCfg', '')

/**
 * @description 编辑平台接入配置
 * @param {String} data
 * @returns
 */
export const editPlatformCfg = (data: string) => fetch('editPlatformCfg', data, {}, false)

/**
 * @description 检查网络
 * @param {string} data
 * @returns
 */
export const queryPingCmdResult = (data: string) => fetch('queryPingCmdResult', data)
