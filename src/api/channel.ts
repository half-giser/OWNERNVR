/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 16:57:18
 * @Description: 通道API
 */

import http from './api'

/**
 * @description 查询设备列表
 * @param {string} data
 * @returns
 */
export const queryDevList = (data: string) => http.fetch('queryDevList', data)

/**
 * @description 查询Rtsp协议列表
 * @returns
 */
export const queryRtspProtocolList = () => http.fetch('queryRtspProtocolList', '')

/**
 * @description 编辑Rtsp协议列表
 * @param {string} data
 * @returns
 */
export const editRtspProtocolList = (data: string) => http.fetch('editRtspProtocolList', data)

/**
 * @description 查询通道信息
 * @param {string} data
 * @returns
 */
export const queryDev = (data: string) => http.fetch('queryDev', data)

/**
 * @description 查询通道信息
 * @param {string} data
 * @returns
 */
export const queryIPChlInfo = (data: string) => http.fetch('queryIPChlInfo', data)

/**
 * @description 查询在线通道列表
 * @returns
 */
export const queryOnlineChlList = () => http.fetch('queryOnlineChlList', '')

/**
 * @description 删除通道
 * @param {string} data
 * @returns
 */
export const delDevList = (data: string) => http.fetch('delDevList', data)

/**
 * @description 查询通道端口
 * @param {string} data
 * @returns
 */
export const queryChlPort = (data: string) => http.fetch('queryChlPort', data)

/**
 * @description 编辑通道
 * @param {string} data
 * @returns
 */
export const editDev = (data: string) => http.fetch('editDev', data)

/**
 * @description 查询局域网内可添加的通道
 * @returns
 */
export const queryLanFreeDeviceList = () => http.fetch('queryLanFreeDeviceList', '')

/**
 * @description 查询通道默认密码
 * @returns
 */
export const queryDevDefaultPwd = () => http.fetch('queryDevDefaultPwd', '')

/**
 * @description 查询可添加的录像机
 * @returns
 */
export const queryLanRecorderList = () => http.fetch('queryLanRecorderList', '')

/**
 * @description 编辑通道密码
 * @param {string} data
 * @returns
 */
export const editIPChlPassword = (data: string) => http.fetch('editIPChlPassword', data)

/**
 * @description 激活IPC
 * @param {string} data
 * @returns
 */
export const activateIPC = (data: string) => http.fetch('activateIPC', data)

/**
 * @description 编辑设备默认密码
 * @param {string} data
 * @returns
 */
export const editDevDefaultPwd = (data: string) => http.fetch('editDevDefaultPwd', data)

/**
 * @description 编辑设备网络配置
 * @param {string} data
 * @returns
 */
export const editDevNetworkList = (data: string) => http.fetch('editDevNetworkList', data)

/**
 * @description 查询录像机
 * @param {string} data
 * @returns
 */
export const queryRecorder = (data: string) => http.fetch('queryRecorder', data, {}, false)

/**
 * @description 测试录像机
 * @param {string} data
 * @returns
 */
export const testRecorder = (data: string) => http.fetch('testRecorder', data, {}, false)

/**
 * @description 查询录像机
 * @param {string} data
 * @returns
 */
export const queryNodeList = (data: string) => http.fetch('queryNodeList', data)

/**
 * @description 新增通道
 * @param {string} data
 * @returns
 */
export const createDevList = (data: string) => http.fetch('createDevList', data)

/**
 * @description 查询当前设备是否多通道设备
 * @param {string} data
 * @returns
 */
export const queryLanDevice = (data: string) => http.fetch('queryLanDevice', data, {}, false)

/**
 * @description 查询通道组列表
 * @param {string} data
 * @returns
 */
export const queryChlGroupList = (data: string) => http.fetch('queryChlGroupList', data)

/**
 * @description 编辑通道组
 * @param {string} data
 * @returns
 */
export const editChlGroup = (data: string) => http.fetch('editChlGroup', data)

/**
 * @description 删除通道组
 * @param {string} data
 * @returns
 */
export const delChlGroup = (data: string) => http.fetch('delChlGroup', data)

/**
 * @description 查询通道组
 * @param {string} data
 * @returns
 */
export const queryChlGroup = (data: string) => http.fetch('queryChlGroup', data)

/**
 * @description 编辑通道组通道
 * @param {string} data
 * @returns
 */
export const editSetAndElementRelation = (data: string) => http.fetch('editSetAndElementRelation', data)

/**
 * @description 新增通道组
 * @param {string} data
 * @returns
 */
export const createChlGroup = (data: string) => http.fetch('createChlGroup', data)

/**
 * @description 查询osd通道配置
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlOSD = (data: string) => http.fetch('queryIPChlORChlOSD', data)

/**
 * @description 编辑osd通道配置
 * @param {string} data
 * @returns
 */
export const editIPChlORChlOSD = (data: string) => http.fetch('editIPChlORChlOSD', data)

/**
 * @description 查询通道水印配置
 * @param {string} data
 * @returns
 */
export const queryChlWaterMark = (data: string) => http.fetch('queryChlWaterMark', data)

/**
 * @description 编辑通道水印配置
 * @param {string} data
 * @returns
 */
export const editChlWaterMark = (data: string) => http.fetch('editChlWaterMark', data)

/**
 * @description 查询通道视频参数
 * @param {string} data
 * @returns
 */
export const queryChlVideoParam = (data: string) => http.fetch('queryChlVideoParam', data)

/**
 * @description 编辑通道视频参数
 * @param {string} data
 * @returns
 */
export const editChlVideoParam = (data: string) => http.fetch('editChlVideoParam', data)

/**
 * @description 查询通道镜头控制参数
 * @param {string} data
 * @returns
 */
export const queryCameraLensCtrlParam = (data: string) => http.fetch('queryCameraLensCtrlParam', data)

/**
 * @description 编辑通道镜头控制参数
 * @param {string} data
 * @returns
 */
export const editCameraLensCtrlParam = (data: string) => http.fetch('editCameraLensCtrlParam', data)

/**
 * @description 下发镜头控制命令
 * @param {string} data
 * @returns
 */
export const cameraLensCtrlCall = (data: string) => http.fetch('cameraLensCtrlCall', data)

/**
 * @description 查询通道遮挡配置
 * @param {string} data
 * @returns
 */
export const queryPrivacyMask = (data: string) => http.fetch('queryPrivacyMask', data)

/**
 * @description 编辑通道遮挡配置
 * @param {string} data
 * @returns
 */
export const editPrivacyMask = (data: string) => http.fetch('editPrivacyMask', data)

/**
 * @description 编辑鱼眼通道配置
 * @param {string} data
 * @returns
 */
export const editIPChlORChlFishEye = (data: string) => http.fetch('editIPChlORChlFishEye', data)

/**
 * @description 查询鱼眼启用状态
 * @param {string} data
 * @returns
 */
export const queryFishEyeEnable = (data: string) => http.fetch('queryFishEyeEnable', data)

/**
 * @description 编辑鱼眼启用状态
 * @param {string} data
 * @returns
 */
export const editFishEyeEnable = (data: string) => http.fetch('editFishEyeEnable', data)

/**
 * @description 查询预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlPresetList = (data: string) => http.fetch('queryChlPresetList', data)

/**
 * @description 下发云台移动
 * @param {string} data
 * @returns
 */
export const ptzMoveCall = (data: string) => http.fetch('ptzMoveCall', data)

/**
 * @description 播放巡航线
 * @param {string} data
 * @returns
 */
export const runPtzCruise = (data: string) => http.fetch('runPtzCruise', data)

/**
 * @description 停止播放巡航线
 * @param {string} data
 * @returns
 */
export const stopPtzCruise = (data: string) => http.fetch('stopPtzCruise', data)

/**
 * @description 查询巡航线列表
 * @param {string} data
 * @returns
 */
export const queryChlCruiseList = (data: string) => http.fetch('queryChlCruiseList', data)

/**
 * @description 删除巡航线
 * @param {string} data
 * @returns
 */
export const delChlCruise = (data: string) => http.fetch('delChlCruise', data)

/**
 * @description 编辑巡航线
 * @param {string} data
 * @returns
 */
export const editChlCruise = (data: string) => http.fetch('editChlCruise', data)

/**
 * @description 获取巡航先的预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlCruise = (data: string) => http.fetch('queryChlCruise', data)

/**
 * @description 创建巡航线
 * @param {string} data
 * @returns
 */
export const createChlCruise = (data: string) => http.fetch('createChlCruise', data)

/**
 * @description 播放巡航线组
 * @param {string} data
 * @returns
 */
export const runChlPtzGroup = (data: string) => http.fetch('runChlPtzGroup', data)

/**
 * @description 停止播放巡航线组
 * @param {string} data
 * @returns
 */
export const stopChlPtzGroup = (data: string) => http.fetch('stopChlPtzGroup', data)

/**
 * @description 查询巡航线组列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzGroup = (data: string) => http.fetch('queryLocalChlPtzGroup', data)

/**
 * @description 修改巡航线组
 * @param {string} data
 * @returns
 */
export const editChlPtzGroup = (data: string) => http.fetch('editChlPtzGroup', data)

/**
 * @description 播放轨迹
 * @param {string} data
 * @returns
 */
export const runChlPtzTrace = (data: string) => http.fetch('runChlPtzTrace', data)

/**
 * @description 停止播放轨迹
 * @param {string} data
 * @returns
 */
export const stopChlPtzTrace = (data: string) => http.fetch('stopChlPtzTrace', data)

/**
 * @description 开始轨迹录像
 * @param {string} data
 * @returns
 */
export const startChlPtzTrace = (data: string) => http.fetch('startChlPtzTrace', data)

/**
 * @description 保存轨迹录像
 * @param {string} data
 * @returns
 */
export const saveChlPtzTrace = (data: string) => http.fetch('saveChlPtzTrace', data)

/**
 * @description 取消轨迹录像
 * @param {string} data
 * @returns
 */
export const cancelChlPtzTrace = (data: string) => http.fetch('cancelChlPtzTrace', data)

/**
 * @description goto云台预置点
 * @param {string} data
 * @returns
 */
export const goToPtzPreset = (data: string) => http.fetch('goToPtzPreset', data)

/**
 * @description 删除预置点
 * @param {string} data
 * @returns
 */
export const delChlPreset = (data: string) => http.fetch('delChlPreset', data)

/**
 * @description 编辑预置点
 * @param {string} data
 * @returns
 */
export const editChlPreset = (data: string) => http.fetch('editChlPreset', data)

/**
 * @description 新增预置点
 * @param {string} data
 * @returns
 */
export const createChlPreset = (data: string) => http.fetch('createChlPreset', data)

/**
 * @description 编辑预置点位置
 * @param {string} data
 * @returns
 */
export const editChlPresetPosition = (data: string) => http.fetch('editChlPresetPosition', data)

/**
 * @description 获取轨迹列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTraceList = (data: string) => http.fetch('queryLocalChlPtzTraceList', data)

/**
 * @description 删除本地轨迹
 * @param {string} data
 * @returns
 */
export const delLocalChlPtzTrace = (data: string) => http.fetch('delLocalChlPtzTrace', data)

/**
 * @description 删除轨迹
 * @param {string} data
 * @returns
 */
export const deleteChlPtzTrace = (data: string) => http.fetch('deleteChlPtzTrace', data)

/**
 * @description 编辑轨迹
 * @param {string} data
 * @returns
 */
export const editChlPtzTrace = (data: string) => http.fetch('editChlPtzTrace', data)

/**
 * @description 创建轨迹
 * @param {string} data
 * @returns
 */
export const createChlPtzTrace = (data: string) => http.fetch('createChlPtzTrace', data)

/**
 * @description 获取云台任务列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTask = (data: string) => http.fetch('queryLocalChlPtzTask', data)

/**
 * @description 编辑云台任务列表
 * @param {string} data
 * @returns
 */
export const editChlPtzTask = (data: string) => http.fetch('editChlPtzTask', data)

/**
 * @description 编辑云台任务状态
 * @param {string} data
 * @returns
 */
export const setChlPtzTaskStatus = (data: string) => http.fetch('setChlPtzTaskStatus', data)

/**
 * @description 查询鱼眼信息
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlFishEye = (data: string) => http.fetch('queryIPChlORChlFishEye', data)

/**
 * @description 查询有录像的通道列表
 * @returns
 */
export const queryChlsExistRec = () => http.fetch('queryChlsExistRec', '')

/**
 * @description 查询POS信息
 * @returns
 */
export const queryPosBillList = (data: string) => http.fetch('queryPosBillList', data)

/**
 * @description 获取云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const queryBallIPCATCfg = (data: string) => http.fetch('queryBallIPCATCfg', data)

/**
 * @description 编辑云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const editBallIPCATCfg = (data: string) => http.fetch('editBallIPCATCfg', data)

/**
 * @description 获取云台协议配置
 * @param {string} data
 * @returns
 */
export const queryPtzProtocol = (data: string) => http.fetch('queryPtzProtocol', data)

/**
 * @description 编辑云台协议配置
 * @param {string} data
 * @returns
 */
export const editPtzProtocol = (data: string) => http.fetch('editPtzProtocol', data)

/**
 * @description 云台3D功能
 * @param {string} data
 * @returns
 */
export const ptz3DControl = (data: string) => http.fetch('ptz3DControl', data)

/**
 * @description 查询LOGO信息
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlLogo = (data: string) => http.fetch('queryIPChlORChlLogo', data)

/**
 * @description 编辑LOGO信息
 * @param {string} data
 * @returns
 */
export const editIPChlORChlLogo = (data: string) => http.fetch('editIPChlORChlLogo', data)
