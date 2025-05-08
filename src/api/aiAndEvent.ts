/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 */

import fetch from './api'

/**
 * @description 查询报警输出参数
 * @param {string} data
 * @returns
 */
export const queryAlarmOutParam = (data: string) => fetch('queryAlarmOutParam', data)

/**
 * @description 编辑报警输出参数
 * @param {string} data
 * @returns
 */
export const editAlarmOutParam = (data: string) => fetch('editAlarmOutParam', data)

/**
 * @description 获取事件通知相关参数
 * @returns
 */
export const queryEventNotifyParam = () => fetch('queryEventNotifyParam', '')

/**
 * @description 修改事件通知显示
 * @param {string} data
 * @returns
 */
export const editEventNotifyParam = (data: string) => fetch('editEventNotifyParam', data)

/**
 * @description 修改事件通知显示
 * @returns
 */
export const testMobilePush = () => fetch('testMobilePush', '')

/**
 * @description 查询灯光报警输出配置
 * @param {string} data
 * @returns
 */
export const queryWhiteLightAlarmOutCfg = (data: string) => fetch('queryWhiteLightAlarmOutCfg', data)

/**
 * @description 编辑灯光报警输出配置
 * @param {string} data
 * @returns
 */
export const editWhiteLightAlarmOutCfg = (data: string) => fetch('editWhiteLightAlarmOutCfg', data)

/**
 * @description 查询报警服务器配置
 * @returns
 */
export const queryAlarmServerParam = () => fetch('queryAlarmServerParam', '')

/**
 * @description 测试报警服务器配置
 * @param {string} data
 * @returns
 */
export const testAlarmServerParam = (data: string) => fetch('testAlarmServerParam', data)

/**
 * @description 编辑报警服务器配置
 * @param {string} data
 * @returns
 */
export const editAlarmServerParam = (data: string) => fetch('editAlarmServerParam', data)

/**
 * @description 查询移动侦测数据
 * @param {string} data
 * @returns
 */
export const queryMotion = (data: string) => fetch('queryMotion', data)

/**
 * @description 编辑移动侦测数据
 * @param {string} data
 * @returns
 */
export const editMotion = (data: string) => fetch('editMotion', data)

/**
 * @description 获取语音播报相关参数
 * @param {string} data
 * @returns
 */
export const queryAudioAlarmOutCfg = (data: string) => fetch('queryAudioAlarmOutCfg', data)

/**
 * @description 添加语音播报语音信息
 * @param {string} data
 * @returns
 */
export const addCustomizeAudioAlarm = (data: string) => fetch('addCustomizeAudioAlarm', data)

/**
 * @description 删除语音播报语音信息
 * @param {string} data
 * @returns
 */
export const deleteCustomizeAudioAlarm = (data: string) => fetch('deleteCustomizeAudioAlarm', data)

/**
 * @description 语音播报语音试听
 * @param {string} data
 * @returns
 */
export const auditionCustomizeAudioAlarm = (data: string) => fetch('auditionCustomizeAudioAlarm', data)

/**
 * @description 修改语音播报信息
 * @param {string} data
 * @returns
 */
export const editAudioAlarmOutCfg = (data: string) => fetch('editAudioAlarmOutCfg', data)

/**
 * @description 获取声音设备相关参数
 * @param {string} data
 * @returns
 */
export const queryAudioStreamConfig = (data: string) => fetch('queryAudioStreamConfig', data)

/**
 * @description 修改声音设备信息
 * @param {string} data
 * @returns
 */
export const editAudioStreamConfig = (data: string) => fetch('editAudioStreamConfig', data)

/**
 * @description 获取本地声音报警的文件列表数据
 * @returns
 */
export const queryAlarmAudioCfg = () => fetch('queryAlarmAudioCfg', '')

/**
 * @description 添加本地声音报警文件
 * @param {string} data
 * @returns
 */
export const addAlarmAudioCfg = (data: string) => fetch('addAlarmAudioCfg', data)

/**
 * @description 删除本地声音报警文件
 * @param {string} data
 * @returns
 */
export const deleteAlarmAudio = (data: string) => fetch('deleteAlarmAudio', data)

/**
 * @description 获取传感器数据
 * @param {string} data
 * @returns
 */
export const queryAlarmIn = (data: string) => fetch('queryAlarmIn', data)

/**
 * @description 修改传感器数据
 * @param {string} data
 * @returns
 */
export const editAlarmIn = (data: string) => fetch('editAlarmIn', data)

/**
 * @description 获取前端掉线数据
 * @param {string} data
 * @returns
 */
export const queryFrontEndOfflineTrigger = (data: string) => fetch('queryFrontEndOfflineTrigger', data)

/**
 * @description 修改前端掉线数据
 * @param {string} data
 * @returns
 */
export const editFrontEndOfflineTrigger = (data: string) => fetch('editFrontEndOfflineTrigger', data)

/**
 * @description 获取异常报警数据
 * @returns
 */
export const queryAbnormalTrigger = () => fetch('queryAbnormalTrigger', '')

/**
 * @description 修改异常报警数据
 * @param {string} data
 * @returns
 */
export const editAbnormalTrigger = (data: string) => fetch('editAbnormalTrigger', data)

/**
 * @description 获取系统撤防数据
 * @returns
 */
export const querySystemDisArmParam = () => fetch('querySystemDisArmParam', '')

/**
 * @description 修改系统撤防数据
 * @param {string} data
 * @returns
 */
export const editSystemDisArmParam = (data: string) => fetch('editSystemDisArmParam', data)

/**
 * @description 获取视频丢失数据
 * @param {string} data
 * @returns
 */
export const queryVideoLossTrigger = (data: string) => fetch('queryVideoLossTrigger', data)

/**
 * @description 修改视频丢失数据
 * @param {string} data
 * @returns
 */
export const editVideoLossTrigger = (data: string) => fetch('editVideoLossTrigger', data)

/**
 * @description 获取AI资源数据
 * @param {string} data
 * @returns
 */
export const queryAIResourceDetail = (data: string) => fetch('queryAIResourceDetail', data)

/**
 * @description 释放AI资源
 * @param {string} data
 * @returns
 */
export const freeAIOccupyResource = (data: string) => fetch('freeAIOccupyResource', data)

/**
 * @description 获取云台锁定状态
 * @param {string} data
 * @returns
 */
export const queryBallIPCPTZLockCfg = (data: string) => fetch('queryBallIPCPTZLockCfg', data)

/**
 * @description 锁定云台
 * @param {string} data
 * @returns
 */
export const editBallIPCPTZLockCfg = (data: string) => fetch('editBallIPCPTZLockCfg', data)

/**
 * @description 获取越界侦测数据
 * @param {string} data
 * @returns
 */
export const queryTripwire = (data: string) => fetch('queryTripwire', data)

/**
 * @description 修改越界侦测数据
 * @param {string} data
 * @returns
 */
export const editTripwire = (data: string) => fetch('editTripwire', data)

/**
 * @description 获取组合报警配置中侦测状况
 * @param {string} data
 * @returns
 */
export const queryIntelAreaConfig = (data: string) => fetch('queryIntelAreaConfig', data, {}, false)

/**
 * @description 获取区域入侵侦测数据
 * @param {string} data
 * @returns
 */
export const queryPerimeter = (data: string) => fetch('queryPerimeter', data)

/**
 * @description 修改区域入侵侦测数据
 * @param {string} data
 * @returns
 */
export const editPerimeter = (data: string) => fetch('editPerimeter', data)

/**
 * @description 获取进入区域侦测数据
 * @param {string} data
 * @returns
 */
export const querySmartAOIEntryConfig = (data: string) => fetch('querySmartAOIEntryConfig', data)

/**
 * @description 修改进入区域侦测数据
 * @param {string} data
 * @returns
 */
export const editSmartAOIEntryConfig = (data: string) => fetch('editSmartAOIEntryConfig', data)

/**
 * @description 获取离开区域侦测数据
 * @param {string} data
 * @returns
 */
export const querySmartAOILeaveConfig = (data: string) => fetch('querySmartAOILeaveConfig', data)

/**
 * @description 修改离开区域侦测数据
 * @param {string} data
 * @returns
 */
export const editSmartAOILeaveConfig = (data: string) => fetch('editSmartAOILeaveConfig', data)

/**
 * @description 获取组合报警数据
 * @returns
 */
export const queryCombinedAlarm = () => fetch('queryCombinedAlarm', '')

/**
 * @description 获取已配置的人脸库分组
 * @returns
 */
export const queryCombinedAlarmFaceMatch = () => fetch('queryCombinedAlarmFaceMatch', '')

/**
 * @description 人脸比对中请求后侦测开关
 * @param {string} data
 * @returns
 */
export const queryBackFaceMatch = (data?: string) => fetch('queryBackFaceMatch', data || '')

/**
 * @description 修改组合报警数据
 * @param {string} data
 * @returns
 */
export const editCombinedAlarm = (data: string) => fetch('editCombinedAlarm', data)

/**
 * @description 修改组合报警人脸匹配数据
 * @param {string} data
 * @returns
 */
export const editCombinedAlarmFaceMatch = (data: string) => fetch('editCombinedAlarmFaceMatch', data)

/**
 * @description 获取火点检测数据
 * @param {string} data
 * @returns
 */
export const querySmartFireConfig = (data: string) => fetch('querySmartFireConfig', data)

/**
 * @description 修改火点检测数据
 * @param {string} data
 * @returns
 */
export const editSmartFireConfig = (data: string) => fetch('editSmartFireConfig', data)

/**
 * @description 获取人脸侦测数据
 * @param {string} data
 * @returns
 */
export const queryVfd = (data: string) => fetch('queryVfd', data)

/**
 * @description 修改人脸侦测数据
 * @param {string} data
 * @returns
 */
export const editVfd = (data: string) => fetch('editVfd', data)

/**
 * @description 修改人脸匹配数据
 * @param {string} data
 * @returns
 */
export const editRealFaceMatch = (data: string) => fetch('editRealFaceMatch', data)

/**
 * @description 获取人脸匹配配置数据
 * @param {string} data
 * @returns
 */
export const queryFaceMatchConfig = (data: string) => fetch('queryFaceMatchConfig', data)

/**
 * @description 修改人脸匹配配置数据
 * @param {string} data
 * @returns
 */
export const editFaceMatchConfig = (data: string) => fetch('editFaceMatchConfig', data)

/**
 * @description 获取人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const queryFaceMatchAlarmParam = (data: string) => fetch('queryFaceMatchAlarmParam', data)

/**
 * @description 修改人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const editFaceMatchAlarmParam = (data: string) => fetch('editFaceMatchAlarmParam', data)

/**
 * @description 删除人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const deleteFaceMatchAlarmParam = (data: string) => fetch('deleteFaceMatchAlarmParam', data)

/**
 * @description 获取车辆识别参数
 * @param {string} data
 * @returns
 */
export const queryVehicleConfig = (data: string) => fetch('queryVehicleConfig', data)

/**
 * @description 获取过线检测数据
 * @param {string} data
 * @returns
 */
export const queryPls = (data: string) => fetch('queryPls', data)

/**
 * @description 修改过线检测数据
 * @param {string} data
 * @returns
 */
export const editPls = (data: string) => fetch('editPls', data)

/**
 * @description 获取定时发送邮件数据
 * @returns
 */
export const queryTimingSendEmail = () => fetch('queryTimingSendEmail', '')

/**
 * @description 修改定时发送邮件数据
 * @param {string} data
 * @returns
 */
export const editTimingSendEmail = (data: string) => fetch('editTimingSendEmail', data)

/**
 * @description 重置cpc信息
 * @param {string} data
 * @returns
 */
export const forceResetCpc = (data: string) => fetch('forceResetCpc', data)

/**
 * @description 获取cpc信息
 * @param {string} data
 * @returns
 */
export const queryCpc = (data: string) => fetch('queryCpc', data)

/**
 * @description 编辑cpc信息
 * @param {string} data
 * @returns
 */
export const editCpc = (data: string) => fetch('editCpc', data)

/**
 * @description 获取车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const queryVehicleMatchAlarm = (data: string) => fetch('queryVehicleMatchAlarm', data)

/**
 * @description 修改车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const editVehicleMatchAlarm = (data: string) => fetch('editVehicleMatchAlarm', data)

/**
 * @description 删除车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const deleteVehicleMatchAlarm = (data: string) => fetch('deleteVehicleMatchAlarm', data)

/**
 * @description 修改车辆侦测数据
 * @param {string} data
 * @returns
 */
export const editVehicleConfig = (data: string) => fetch('editVehicleConfig', data)

/**
 * @description 获取温度检测数据
 * @param {string} data
 * @returns
 */
export const queryTemperatureAlarmConfig = (data: string) => fetch('queryTemperatureAlarmConfig', data)

/**
 * @description 修改温度检测数据
 * @param {string} data
 * @returns
 */
export const editTemperatureAlarmConfig = (data: string) => fetch('editTemperatureAlarmConfig', data)

/**
 * @description 获取物品遗留与看护数据
 * @param {string} data
 * @returns
 */
export const queryOsc = (data: string) => fetch('queryOsc', data)

/**
 * @description 修改物品遗留与看护数据
 * @param {string} data
 * @returns
 */
export const editOsc = (data: string) => fetch('editOsc', data)

/**
 * @description 获取人群密度检测数据
 * @param {string} data
 * @returns
 */
export const queryCdd = (data: string) => fetch('queryCdd', data)

/**
 * @description 修改人群密度检测数据
 * @param {string} data
 * @returns
 */
export const editCdd = (data: string) => fetch('editCdd', data)

/**
 * @description 获取异常侦测数据
 * @param {string} data
 * @returns
 */
export const queryAvd = (data: string) => fetch('queryAvd', data)

/**
 * @description 修改异常侦测数据
 * @param {string} data
 * @returns
 */
export const editAvd = (data: string) => fetch('editAvd', data)

/**
 * @description 获取视频结构化数据
 * @param {string} data
 * @returns
 */
export const queryVideoMetadata = (data: string) => fetch('queryVideoMetadata', data)

/**
 * @description 手动重置数据
 * @param {string} data
 * @returns
 */
export const editVideoMetadata = (data: string) => fetch('editVideoMetadata', data)
