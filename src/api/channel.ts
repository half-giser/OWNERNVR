/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 16:57:18
 * @Description:
 */

import type { AxiosRequestConfig } from 'axios'
import http from './api'

// 查询设备列表
export const queryDevList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryDevList', data, config)
// 查询Rtsp协议列表
export const queryRtspProtocolList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryRtspProtocolList', data, config)
// 编辑Rtsp协议列表
export const editRtspProtocolList = (data: string, config?: AxiosRequestConfig) => http.fetch('editRtspProtocolList', data, config)
// 查询通道信息
export const queryDev = (data: string, config?: AxiosRequestConfig) => http.fetch('queryDev', data, config)
// 查询通道信息
export const queryIPChlInfo = (data: string, config?: AxiosRequestConfig) => http.fetch('queryIPChlInfo', data, config)
// 查询在线通道列表
export const queryOnlineChlList = () => http.fetch('queryOnlineChlList', getXmlWrapData(''))
// 查询录像机分配信息
export const queryRecordDistributeInfo = (data: string, config?: AxiosRequestConfig) => http.fetch('queryRecordDistributeInfo', data, config)
// 删除通道
export const delDevList = (data: string, config?: AxiosRequestConfig) => http.fetch('delDevList', data, config)
// 查询通道端口
export const queryChlPort = (data: string, config?: AxiosRequestConfig) => http.fetch('queryChlPort', data, config)
// 编辑通道
export const editDev = (data: string, config?: AxiosRequestConfig) => http.fetch('editDev', data, config)
// 查询局域网内可添加的通道
export const queryLanFreeDeviceList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryLanFreeDeviceList', data, config)
// 查询通道默认密码
export const queryDevDefaultPwd = (data: string, config?: AxiosRequestConfig) => http.fetch('queryDevDefaultPwd', data, config)
// 查询可添加的录像机
export const queryLanRecorderList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryLanRecorderList', data, config)
// 编辑通道密码
export const editIPChlPassword = (data: string, config?: AxiosRequestConfig) => http.fetch('editIPChlPassword', data, config)
// 激活IPC
export const activateIPC = (data: string, config?: AxiosRequestConfig) => http.fetch('activateIPC', data, config)
// 编辑设备默认密码
export const editDevDefaultPwd = (data: string, config?: AxiosRequestConfig) => http.fetch('editDevDefaultPwd', data, config)
// 编辑设备网络配置
export const editDevNetworkList = (data: string, config?: AxiosRequestConfig) => http.fetch('editDevNetworkList', data, config)
// 查询录像机
export const queryRecorder = (data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch?: boolean) => http.fetch('queryRecorder', data, config, checkCommonErrorSwitch)
// 测试录像机
export const testRecorder = (data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch?: boolean) => http.fetch('testRecorder', data, config, checkCommonErrorSwitch)
// 查询录像机
export const queryNodeList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryNodeList', data, config)
// 新增通道
export const createDevList = (data: string, config?: AxiosRequestConfig) => http.fetch('createDevList', data, config)
// 查询当前设备是否多通道设备
export const queryLanDevice = (data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch?: boolean) => http.fetch('queryLanDevice', data, config, checkCommonErrorSwitch)
// 查询通道组列表
export const queryChlGroupList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryChlGroupList', data, config)
// 编辑通道组
export const editChlGroup = (data: string, config?: AxiosRequestConfig) => http.fetch('editChlGroup', data, config)
// 删除通道组
export const delChlGroup = (data: string, config?: AxiosRequestConfig) => http.fetch('delChlGroup', data, config)
// 查询通道组
export const queryChlGroup = (data: string, config?: AxiosRequestConfig) => http.fetch('queryChlGroup', data, config)
// 编辑通道组通道
export const editSetAndElementRelation = (data: string, config?: AxiosRequestConfig) => http.fetch('editSetAndElementRelation', data, config)
// 新增通道组
export const createChlGroup = (data: string, config?: AxiosRequestConfig) => http.fetch('createChlGroup', data, config)
// 查询osd通道配置
export const queryIPChlORChlOSD = (data: string, config?: AxiosRequestConfig) => http.fetch('queryIPChlORChlOSD', data, config)
// 编辑osd通道配置
export const editIPChlORChlOSD = (data: string, config?: AxiosRequestConfig) => http.fetch('editIPChlORChlOSD', data, config)
// 查询通道水印配置
export const queryChlWaterMark = (data: string, config?: AxiosRequestConfig) => http.fetch('queryChlWaterMark', data, config)
// 编辑通道水印配置
export const editChlWaterMark = (data: string, config?: AxiosRequestConfig) => http.fetch('editChlWaterMark', data, config)
