/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 16:57:18
 * @Description: 通道API
 */

import fetch from './api'

/**
 * @description 查询设备列表
 * @param {string} data
 * @returns
 */
export const queryDevList = (data: string) => fetch('queryDevList', data)

/**
 * @description 查询Rtsp协议列表
 * @returns
 */
export const queryRtspProtocolList = () => fetch('queryRtspProtocolList', '')

/**
 * @description 编辑Rtsp协议列表
 * @param {string} data
 * @returns
 */
export const editRtspProtocolList = (data: string) => fetch('editRtspProtocolList', data)

/**
 * @description 查询通道信息
 * @param {string} data
 * @returns
 */
export const queryDev = (data: string) => fetch('queryDev', data)

/**
 * @description 查询通道信息
 * @param {string} data
 * @returns
 */
export const queryIPChlInfo = (data: string) => fetch('queryIPChlInfo', data)

/**
 * @description 查询在线通道列表
 * @returns
 */
export const queryOnlineChlList = () => fetch('queryOnlineChlList', '')

/**
 * @description 删除通道
 * @param {string} data
 * @returns
 */
export const delDevList = (data: string) => fetch('delDevList', data)

/**
 * @description 查询通道端口
 * @param {string} data
 * @returns
 */
export const queryChlPort = (data: string) => fetch('queryChlPort', data)

/**
 * @description 编辑通道
 * @param {string} data
 * @returns
 */
export const editDev = (data: string) => fetch('editDev', data)

/**
 * @description 查询局域网内可添加的通道
 * @returns
 */
export const queryLanFreeDeviceList = () => fetch('queryLanFreeDeviceList', '')

/**
 * @description 查询通道默认密码
 * @returns
 */
export const queryDevDefaultPwd = () => fetch('queryDevDefaultPwd', '')

/**
 * @description 查询可添加的录像机
 * @returns
 */
export const queryLanRecorderList = () => fetch('queryLanRecorderList', '')

/**
 * @description 编辑通道密码
 * @param {string} data
 * @returns
 */
export const editIPChlPassword = (data: string) => fetch('editIPChlPassword', data)

/**
 * @description 激活IPC
 * @param {string} data
 * @returns
 */
export const activateIPC = (data: string) => fetch('activateIPC', data)

/**
 * @description 编辑设备默认密码
 * @param {string} data
 * @returns
 */
export const editDevDefaultPwd = (data: string) => fetch('editDevDefaultPwd', data)

/**
 * @description 编辑设备网络配置
 * @param {string} data
 * @returns
 */
export const editDevNetworkList = (data: string) => fetch('editDevNetworkList', data)

/**
 * @description 查询录像机
 * @param {string} data
 * @returns
 */
export const queryRecorder = (data: string) => fetch('queryRecorder', data, {}, false)

/**
 * @description 测试录像机
 * @param {string} data
 * @returns
 */
export const testRecorder = (data: string) => fetch('testRecorder', data, {}, false)

/**
 * @description 查询录像机
 * @param {string} data
 * @returns
 */
export const queryNodeList = (data: string) => fetch('queryNodeList', data)

/**
 * @description 新增通道
 * @param {string} data
 * @returns
 */
export const createDevList = (data: string) => fetch('createDevList', data)

/**
 * @description 查询当前设备是否多通道设备
 * @param {string} data
 * @returns
 */
export const queryLanDevice = (data: string) => fetch('queryLanDevice', data, {}, false)

/**
 * @description 查询通道组列表
 * @param {string} data
 * @returns
 */
export const queryChlGroupList = (data: string) => fetch('queryChlGroupList', data)

/**
 * @description 编辑通道组
 * @param {string} data
 * @returns
 */
export const editChlGroup = (data: string) => fetch('editChlGroup', data)

/**
 * @description 删除通道组
 * @param {string} data
 * @returns
 */
export const delChlGroup = (data: string) => fetch('delChlGroup', data)

/**
 * @description 查询通道组
 * @param {string} data
 * @returns
 */
export const queryChlGroup = (data: string) => fetch('queryChlGroup', data)

/**
 * @description 编辑通道组通道
 * @param {string} data
 * @returns
 */
export const editSetAndElementRelation = (data: string) => fetch('editSetAndElementRelation', data)

/**
 * @description 新增通道组
 * @param {string} data
 * @returns
 */
export const createChlGroup = (data: string) => fetch('createChlGroup', data)

/**
 * @description 查询osd通道配置
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlOSD = (data: string) => fetch('queryIPChlORChlOSD', data)

/**
 * @description 编辑osd通道配置
 * @param {string} data
 * @returns
 */
export const editIPChlORChlOSD = (data: string) => fetch('editIPChlORChlOSD', data)

/**
 * @description 查询通道水印配置
 * @param {string} data
 * @returns
 */
export const queryChlWaterMark = (data: string) => fetch('queryChlWaterMark', data)

/**
 * @description 编辑通道水印配置
 * @param {string} data
 * @returns
 */
export const editChlWaterMark = (data: string) => fetch('editChlWaterMark', data)

/**
 * @description 查询通道视频参数
 * @param {string} data
 * @returns
 */
export const queryChlVideoParam = (data: string) => fetch('queryChlVideoParam', data)

/**
 * @description 编辑通道视频参数
 * @param {string} data
 * @returns
 */
export const editChlVideoParam = (data: string) => fetch('editChlVideoParam', data)

/**
 * @description 查询通道镜头控制参数
 * @param {string} data
 * @returns
 */
export const queryCameraLensCtrlParam = (data: string) => fetch('queryCameraLensCtrlParam', data)

/**
 * @description 编辑通道镜头控制参数
 * @param {string} data
 * @returns
 */
export const editCameraLensCtrlParam = (data: string) => fetch('editCameraLensCtrlParam', data)

/**
 * @description 下发镜头控制命令
 * @param {string} data
 * @returns
 */
export const cameraLensCtrlCall = (data: string) => fetch('cameraLensCtrlCall', data)

/**
 * @description 查询通道遮挡配置
 * @param {string} data
 * @returns
 */
export const queryPrivacyMask = (data: string) => fetch('queryPrivacyMask', data)

/**
 * @description 编辑通道遮挡配置
 * @param {string} data
 * @returns
 */
export const editPrivacyMask = (data: string) => fetch('editPrivacyMask', data)

/**
 * @description 编辑鱼眼通道配置
 * @param {string} data
 * @returns
 */
export const editIPChlORChlFishEye = (data: string) => fetch('editIPChlORChlFishEye', data)

/**
 * @description 查询鱼眼启用状态
 * @param {string} data
 * @returns
 */
export const queryFishEyeEnable = (data: string) => fetch('queryFishEyeEnable', data)

/**
 * @description 编辑鱼眼启用状态
 * @param {string} data
 * @returns
 */
export const editFishEyeEnable = (data: string) => fetch('editFishEyeEnable', data)

/**
 * @description 查询预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlPresetList = (data: string) => fetch('queryChlPresetList', data)

/**
 * @description 下发云台移动
 * @param {string} data
 * @returns
 */
export const ptzMoveCall = (data: string) => fetch('ptzMoveCall', data)

/**
 * @description 播放巡航线
 * @param {string} data
 * @returns
 */
export const runPtzCruise = (data: string) => fetch('runPtzCruise', data)

/**
 * @description 停止播放巡航线
 * @param {string} data
 * @returns
 */
export const stopPtzCruise = (data: string) => fetch('stopPtzCruise', data)

/**
 * @description 查询巡航线列表
 * @param {string} data
 * @returns
 */
export const queryChlCruiseList = (data: string) => fetch('queryChlCruiseList', data)

/**
 * @description 删除巡航线
 * @param {string} data
 * @returns
 */
export const delChlCruise = (data: string) => fetch('delChlCruise', data)

/**
 * @description 编辑巡航线
 * @param {string} data
 * @returns
 */
export const editChlCruise = (data: string) => fetch('editChlCruise', data)

/**
 * @description 获取巡航先的预置点列表
 * @param {string} data
 * @returns
 */
export const queryChlCruise = (data: string) => fetch('queryChlCruise', data)

/**
 * @description 创建巡航线
 * @param {string} data
 * @returns
 */
export const createChlCruise = (data: string) => fetch('createChlCruise', data)

/**
 * @description 播放巡航线组
 * @param {string} data
 * @returns
 */
export const runChlPtzGroup = (data: string) => fetch('runChlPtzGroup', data)

/**
 * @description 停止播放巡航线组
 * @param {string} data
 * @returns
 */
export const stopChlPtzGroup = (data: string) => fetch('stopChlPtzGroup', data)

/**
 * @description 查询巡航线组列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzGroup = (data: string) => fetch('queryLocalChlPtzGroup', data)

/**
 * @description 修改巡航线组
 * @param {string} data
 * @returns
 */
export const editChlPtzGroup = (data: string) => fetch('editChlPtzGroup', data)

/**
 * @description 播放轨迹
 * @param {string} data
 * @returns
 */
export const runChlPtzTrace = (data: string) => fetch('runChlPtzTrace', data)

/**
 * @description 停止播放轨迹
 * @param {string} data
 * @returns
 */
export const stopChlPtzTrace = (data: string) => fetch('stopChlPtzTrace', data)

/**
 * @description 开始轨迹录像
 * @param {string} data
 * @returns
 */
export const startChlPtzTrace = (data: string) => fetch('startChlPtzTrace', data)

/**
 * @description 保存轨迹录像
 * @param {string} data
 * @returns
 */
export const saveChlPtzTrace = (data: string) => fetch('saveChlPtzTrace', data)

/**
 * @description 取消轨迹录像
 * @param {string} data
 * @returns
 */
export const cancelChlPtzTrace = (data: string) => fetch('cancelChlPtzTrace', data)

/**
 * @description goto云台预置点
 * @param {string} data
 * @returns
 */
export const goToPtzPreset = (data: string) => fetch('goToPtzPreset', data)

/**
 * @description 删除预置点
 * @param {string} data
 * @returns
 */
export const delChlPreset = (data: string) => fetch('delChlPreset', data)

/**
 * @description 编辑预置点
 * @param {string} data
 * @returns
 */
export const editChlPreset = (data: string) => fetch('editChlPreset', data)

/**
 * @description 新增预置点
 * @param {string} data
 * @returns
 */
export const createChlPreset = (data: string) => fetch('createChlPreset', data)

/**
 * @description 编辑预置点位置
 * @param {string} data
 * @returns
 */
export const editChlPresetPosition = (data: string) => fetch('editChlPresetPosition', data)

/**
 * @description 获取轨迹列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTraceList = (data: string) => fetch('queryLocalChlPtzTraceList', data)

/**
 * @description 删除本地轨迹
 * @param {string} data
 * @returns
 */
export const delLocalChlPtzTrace = (data: string) => fetch('delLocalChlPtzTrace', data)

/**
 * @description 删除轨迹
 * @param {string} data
 * @returns
 */
export const deleteChlPtzTrace = (data: string) => fetch('deleteChlPtzTrace', data)

/**
 * @description 编辑轨迹
 * @param {string} data
 * @returns
 */
export const editChlPtzTrace = (data: string) => fetch('editChlPtzTrace', data)

/**
 * @description 创建轨迹
 * @param {string} data
 * @returns
 */
export const createChlPtzTrace = (data: string) => fetch('createChlPtzTrace', data)

/**
 * @description 获取云台任务列表
 * @param {string} data
 * @returns
 */
export const queryLocalChlPtzTask = (data: string) => fetch('queryLocalChlPtzTask', data)

/**
 * @description 编辑云台任务列表
 * @param {string} data
 * @returns
 */
export const editChlPtzTask = (data: string) => fetch('editChlPtzTask', data)

/**
 * @description 编辑云台任务状态
 * @param {string} data
 * @returns
 */
export const setChlPtzTaskStatus = (data: string) => fetch('setChlPtzTaskStatus', data)

/**
 * @description 查询鱼眼信息
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlFishEye = (data: string) => fetch('queryIPChlORChlFishEye', data)

/**
 * @description 查询有录像的通道列表
 * @returns
 */
export const queryChlsExistRec = () => fetch('queryChlsExistRec', '')

/**
 * @description 查询POS信息
 * @returns
 */
export const queryPosBillList = (data: string) => fetch('queryPosBillList', data)

/**
 * @description 获取云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const queryBallIPCATCfg = (data: string) => fetch('queryBallIPCATCfg', data)

/**
 * @description 编辑云台智能追踪配置
 * @param {string} data
 * @returns
 */
export const editBallIPCATCfg = (data: string) => fetch('editBallIPCATCfg', data)

/**
 * @description 获取云台协议配置
 * @param {string} data
 * @returns
 */
export const queryPtzProtocol = (data: string) => fetch('queryPtzProtocol', data)

/**
 * @description 编辑云台协议配置
 * @param {string} data
 * @returns
 */
export const editPtzProtocol = (data: string) => fetch('editPtzProtocol', data)

/**
 * @description 云台3D功能
 * @param {string} data
 * @returns
 */
export const ptz3DControl = (data: string) => fetch('ptz3DControl', data)

/**
 * @description 查询LOGO信息
 * @param {string} data
 * @returns
 */
export const queryIPChlORChlLogo = (data: string) => fetch('queryIPChlORChlLogo', data)

/**
 * @description 编辑LOGO信息
 * @param {string} data
 * @returns
 */
export const editIPChlORChlLogo = (data: string) => fetch('editIPChlORChlLogo', data)
