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
// 查询通道视频参数
export const queryChlVideoParam = (data: string, config?: AxiosRequestConfig) => http.fetch('queryChlVideoParam', data, config)
// 编辑通道视频参数
export const editChlVideoParam = (data: string, config?: AxiosRequestConfig) => http.fetch('editChlVideoParam', data, config)
// 查询通道镜头控制参数
export const queryCameraLensCtrlParam = (data: string, config?: AxiosRequestConfig) => http.fetch('queryCameraLensCtrlParam', data, config)
// 编辑通道镜头控制参数
export const editCameraLensCtrlParam = (data: string, config?: AxiosRequestConfig) => http.fetch('editCameraLensCtrlParam', data, config)
// 下发镜头控制命令
export const cameraLensCtrlCall = (data: string, config?: AxiosRequestConfig) => http.fetch('cameraLensCtrlCall', data, config)
// 查询通道遮挡配置
export const queryPrivacyMask = (data: string, config?: AxiosRequestConfig) => http.fetch('queryPrivacyMask', data, config)
// 编辑通道遮挡配置
export const editPrivacyMask = (data: string, config?: AxiosRequestConfig) => http.fetch('editPrivacyMask', data, config)
// 编辑鱼眼通道配置
export const editIPChlORChlFishEye = (data: string, config?: AxiosRequestConfig) => http.fetch('editIPChlORChlFishEye', data, config)
// 查询鱼眼启用状态
export const queryFishEyeEnable = (data: string, config?: AxiosRequestConfig) => http.fetch('queryFishEyeEnable', data, config)
// 编辑鱼眼启用状态
export const editFishEyeEnable = (data: string, config?: AxiosRequestConfig) => http.fetch('editFishEyeEnable', data, config)

/**
 * @description 查询预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlPresetList = (data: string) => http.fetch('queryChlPresetList', getXmlWrapData(data))

/**
 * @description 下发云台移动
 * @param {string} data
 * @returns
 */
export const ptzMoveCall = (data: string) => http.fetch('ptzMoveCall', getXmlWrapData(data))

/**
 * @description 播放巡航线
 * @param {string} data
 * @returns
 */
export const runPtzCruise = (data: string) => http.fetch('runPtzCruise', getXmlWrapData(data))

/**
 * @description 停止播放巡航线
 * @param {string} data
 * @returns
 */
export const stopPtzCruise = (data: string) => http.fetch('stopPtzCruise', getXmlWrapData(data))

/**
 * @description 查询巡航线列表
 * @param {string} data
 * @returns
 */
export const queryChlCruiseList = (data: string) => http.fetch('queryChlCruiseList', getXmlWrapData(data))

/**
 * @description 删除巡航线
 * @param {string} data
 * @returns
 */
export const delChlCruise = (data: string) => http.fetch('delChlCruise', getXmlWrapData(data))

/**
 * @description 编辑巡航线
 * @param {string} data
 * @returns
 */
export const editChlCruise = (data: string) => http.fetch('editChlCruise', getXmlWrapData(data))

/**
 * @description 获取巡航先的预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlCruise = (data: string) => http.fetch('queryChlCruise', getXmlWrapData(data))

/**
 * @description 创建巡航线
 * @param {string} data
 * @returns
 */
export const createChlCruise = (data: string) => http.fetch('createChlCruise', getXmlWrapData(data))

/**
 * @description 播放巡航线组
 * @param {string} data
 * @returns
 */
export const runChlPtzGroup = (data: string) => http.fetch('runChlPtzGroup', getXmlWrapData(data))

/**
 * @description 停止播放巡航线组
 * @param {string} data
 * @returns
 */
export const stopChlPtzGroup = (data: string) => http.fetch('stopChlPtzGroup', getXmlWrapData(data))

/**
 * @description 查询巡航线组列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzGroup = (data: string) => http.fetch('queryLocalChlPtzGroup', getXmlWrapData(data))

/**
 * @description 修改巡航线组
 * @param {string} data
 * @returns
 */
export const editChlPtzGroup = (data: string) => http.fetch('editChlPtzGroup', getXmlWrapData(data))

/**
 * @description 播放轨迹
 * @param {string} data
 * @returns
 */
export const runChlPtzTrace = (data: string) => http.fetch('runChlPtzTrace', getXmlWrapData(data))

/**
 * @description 停止播放轨迹
 * @param {string} data
 * @returns
 */
export const stopChlPtzTrace = (data: string) => http.fetch('stopChlPtzTrace', getXmlWrapData(data))

/**
 * @description 开始轨迹录像
 * @param {string} data
 * @returns
 */
export const startChlPtzTrace = (data: string) => http.fetch('startChlPtzTrace', getXmlWrapData(data))

/**
 * @description 保存轨迹录像
 * @param {string} data
 * @returns
 */
export const saveChlPtzTrace = (data: string) => http.fetch('saveChlPtzTrace', getXmlWrapData(data))

/**
 * @description 取消轨迹录像
 * @param {string} data
 * @returns
 */
export const cancelChlPtzTrace = (data: string) => http.fetch('cancelChlPtzTrace', getXmlWrapData(data))

/**
 * @description goto云台预置点
 * @param {string} data
 * @returns
 */
export const goToPtzPreset = (data: string) => http.fetch('goToPtzPreset', getXmlWrapData(data))

/**
 * @description 删除预置点
 * @param {string} data
 * @returns
 */
export const delChlPreset = (data: string) => http.fetch('delChlPreset', getXmlWrapData(data))

/**
 * @description 编辑预置点
 * @param {string} data
 * @returns
 */
export const editChlPreset = (data: string) => http.fetch('editChlPreset', getXmlWrapData(data))

/**
 * @description 新增预置点
 * @param {string} data
 * @returns
 */
export const createChlPreset = (data: string) => http.fetch('createChlPreset', getXmlWrapData(data))

/**
 * @description 编辑预置点位置
 * @param {string} data
 * @returns
 */
export const editChlPresetPosition = (data: string) => http.fetch('editChlPresetPosition', getXmlWrapData(data))

/**
 * @description 获取轨迹列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTraceList = (data: string) => http.fetch('queryLocalChlPtzTraceList', getXmlWrapData(data))

/**
 * @description 删除本地轨迹
 * @param {string} data
 * @returns
 */
export const delLocalChlPtzTrace = (data: string) => http.fetch('delLocalChlPtzTrace', getXmlWrapData(data))

/**
 * @description 删除轨迹
 * @param {string} data
 * @returns
 */
export const deleteChlPtzTrace = (data: string) => http.fetch('deleteChlPtzTrace', getXmlWrapData(data))

/**
 * @description 编辑轨迹
 * @param {string} data
 * @returns
 */
export const editChlPtzTrace = (data: string) => http.fetch('editChlPtzTrace', getXmlWrapData(data))

/**
 * @description 创建轨迹
 * @param {string} data
 * @returns
 */
export const createChlPtzTrace = (data: string) => http.fetch('createChlPtzTrace', getXmlWrapData(data))

/**
 * @description 获取云台任务列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTask = (data: string) => http.fetch('queryLocalChlPtzTask', getXmlWrapData(data))

/**
 * @description 编辑云台任务列表
 * @param {string} data
 * @returns
 */
export const editChlPtzTask = (data: string) => http.fetch('editChlPtzTask', getXmlWrapData(data))

/**
 * @description 编辑云台任务状态
 * @param {string} data
 * @returns
 */
export const setChlPtzTaskStatus = (data: string) => http.fetch('setChlPtzTaskStatus', getXmlWrapData(data))

/**
 * @description 查询鱼眼信息
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlFishEye = (data: string) => http.fetch('queryIPChlORChlFishEye', getXmlWrapData(data))

/**
 * @description 查询有录像的通道列表
 * @returns
 */
export const queryChlsExistRec = () => http.fetch('queryChlsExistRec', getXmlWrapData(''))

/**
 * @description 查询POS信息
 * @returns
 */
export const queryPosBillList = (data: string) => http.fetch('queryPosBillList', getXmlWrapData(data))

/**
 * @description 获取云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const queryBallIPCATCfg = (data: string) => http.fetch('queryBallIPCATCfg', getXmlWrapData(data))

/**
 * @description 编辑云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const editBallIPCATCfg = (data: string) => http.fetch('editBallIPCATCfg', getXmlWrapData(data))

/**
 * @description 获取云台协议配置
 * @param {string} data
 * @returns
 */
export const queryPtzProtocol = (data: string) => http.fetch('queryPtzProtocol', getXmlWrapData(data))

/**
 * @description 编辑云台协议配置
 * @param {string} data
 * @returns
 */
export const editPtzProtocol = (data: string) => http.fetch('editPtzProtocol', getXmlWrapData(data))
