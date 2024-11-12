/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 */

import http from './api'

/**
 * @description 查询报警输出参数
 * @param {string} data
 * @returns
 */
export const queryAlarmOutParam = (data: string) => http.fetch('queryAlarmOutParam', getXmlWrapData(data))

/**
 * @description 编辑报警输出参数
 * @param {string} data
 * @returns
 */
export const editAlarmOutParam = (data: string) => http.fetch('editAlarmOutParam', getXmlWrapData(data))

/**
 * @description 获取事件通知相关参数
 * @returns
 */
export const queryEventNotifyParam = () => http.fetch('queryEventNotifyParam', getXmlWrapData(''))

/**
 * @description 修改事件通知显示
 * @param {string} data
 * @returns
 */
export const editEventNotifyParam = (data: string) => http.fetch('editEventNotifyParam', getXmlWrapData(data))

/**
 * @description 修改事件通知显示
 * @returns
 */
export const testMobilePush = () => http.fetch('testMobilePush', getXmlWrapData(''))

/**
 * @description 查询灯光报警输出配置
 * @param {string} data
 * @returns
 */
export const queryWhiteLightAlarmOutCfg = (data: string) => http.fetch('queryWhiteLightAlarmOutCfg', getXmlWrapData(data))

/**
 * @description 编辑灯光报警输出配置
 * @param {string} data
 * @returns
 */
export const editWhiteLightAlarmOutCfg = (data: string) => http.fetch('editWhiteLightAlarmOutCfg', getXmlWrapData(data))

/**
 * @description 查询报警服务器配置
 * @returns
 */
export const queryAlarmServerParam = () => http.fetch('queryAlarmServerParam', getXmlWrapData(''))

/**
 * @description 测试报警服务器配置
 * @param {string} data
 * @returns
 */
export const testAlarmServerParam = (data: string) => http.fetch('testAlarmServerParam', getXmlWrapData(data))

/**
 * @description 编辑报警服务器配置
 * @param {string} data
 * @returns
 */
export const editAlarmServerParam = (data: string) => http.fetch('editAlarmServerParam', getXmlWrapData(data))

/**
 * @description 查询移动侦测数据
 * @param {string} data
 * @returns
 */
export const queryMotion = (data: string) => http.fetch('queryMotion', getXmlWrapData(data))

/**
 * @description 编辑移动侦测数据
 * @param {string} data
 * @returns
 */
export const editMotion = (data: string) => http.fetch('editMotion', getXmlWrapData(data))

/**
 * @description 获取语音播报相关参数
 * @param {string} data
 * @returns
 */
export const queryAudioAlarmOutCfg = (data: string) => http.fetch('queryAudioAlarmOutCfg', getXmlWrapData(data))

/**
 * @description 添加语音播报语音信息
 * @param {string} data
 * @returns
 */
export const addCustomizeAudioAlarm = (data: string) => http.fetch('addCustomizeAudioAlarm', getXmlWrapData(data))

/**
 * @description 删除语音播报语音信息
 * @param {string} data
 * @returns
 */
export const deleteCustomizeAudioAlarm = (data: string) => http.fetch('deleteCustomizeAudioAlarm', getXmlWrapData(data))

/**
 * @description 语音播报语音试听
 * @param {string} data
 * @returns
 */
export const auditionCustomizeAudioAlarm = (data: string) => http.fetch('auditionCustomizeAudioAlarm', getXmlWrapData(data))

/**
 * @description 修改语音播报信息
 * @param {string} data
 * @returns
 */
export const editAudioAlarmOutCfg = (data: string) => http.fetch('editAudioAlarmOutCfg', getXmlWrapData(data))

/**
 * @description 获取声音设备相关参数
 * @param {string} data
 * @returns
 */
export const queryAudioStreamConfig = (data: string) => http.fetch('queryAudioStreamConfig', getXmlWrapData(data))

/**
 * @description 修改声音设备信息
 * @param {string} data
 * @returns
 */
export const editAudioStreamConfig = (data: string) => http.fetch('editAudioStreamConfig', getXmlWrapData(data))

/**
 * @description 获取本地声音报警的文件列表数据
 * @returns
 */
export const queryAlarmAudioCfg = () => http.fetch('queryAlarmAudioCfg', getXmlWrapData(''))

/**
 * @description 添加本地声音报警文件
 * @param {string} data
 * @returns
 */
export const addAlarmAudioCfg = (data: string) => http.fetch('addAlarmAudioCfg', getXmlWrapData(data))

/**
 * @description 删除本地声音报警文件
 * @param {string} data
 * @returns
 */
export const deleteAlarmAudio = (data: string) => http.fetch('deleteAlarmAudio', getXmlWrapData(data))

/**
 * @description 获取传感器数据
 * @param {string} data
 * @returns
 */
export const queryAlarmIn = (data: string) => http.fetch('queryAlarmIn', getXmlWrapData(data))

/**
 * @description 修改传感器数据
 * @param {string} data
 * @returns
 */
export const editAlarmIn = (data: string) => http.fetch('editAlarmIn', getXmlWrapData(data))

/**
 * @description 获取前端掉线数据
 * @param {string} data
 * @returns
 */
export const queryFrontEndOfflineTrigger = (data: string) => http.fetch('queryFrontEndOfflineTrigger', getXmlWrapData(data))

/**
 * @description 修改前端掉线数据
 * @param {string} data
 * @returns
 */
export const editFrontEndOfflineTrigger = (data: string) => http.fetch('editFrontEndOfflineTrigger', getXmlWrapData(data))

/**
 * @description 获取异常报警数据
 * @returns
 */
export const queryAbnormalTrigger = () => http.fetch('queryAbnormalTrigger', getXmlWrapData(''))

/**
 * @description 修改异常报警数据
 * @param {string} data
 * @returns
 */
export const editAbnormalTrigger = (data: string) => http.fetch('editAbnormalTrigger', getXmlWrapData(data))

/**
 * @description 获取系统撤防数据
 * @returns
 */
export const querySystemDisArmParam = () => http.fetch('querySystemDisArmParam', getXmlWrapData(''))

/**
 * @description 修改系统撤防数据
 * @param {string} data
 * @returns
 */
export const editSystemDisArmParam = (data: string) => http.fetch('editSystemDisArmParam', getXmlWrapData(data))

/**
 * @description 获取视频丢失数据
 * @param {string} data
 * @returns
 */
export const queryVideoLossTrigger = (data: string) => http.fetch('queryVideoLossTrigger', getXmlWrapData(data))

/**
 * @description 修改视频丢失数据
 * @param {string} data
 * @returns
 */
export const editVideoLossTrigger = (data: string) => http.fetch('editVideoLossTrigger', getXmlWrapData(data))

/**
 * @description 获取AI资源数据
 * @param {string} data
 * @returns
 */
export const queryAIResourceDetail = (data: string) => http.fetch('queryAIResourceDetail', getXmlWrapData(data))

/**
 * @description 释放AI资源
 * @param {string} data
 * @returns
 */
export const freeAIOccupyResource = (data: string) => http.fetch('freeAIOccupyResource', getXmlWrapData(data))

/**
 * @description 获取云台锁定状态
 * @param {string} data
 * @returns
 */
export const queryBallIPCPTZLockCfg = (data: string) => http.fetch('queryBallIPCPTZLockCfg', getXmlWrapData(data))

/**
 * @description 锁定云台
 * @param {string} data
 * @returns
 */
export const editBallIPCPTZLockCfg = (data: string) => http.fetch('editBallIPCPTZLockCfg', getXmlWrapData(data))

/**
 * @description 获取越界侦测数据
 * @param {string} data
 * @returns
 */
export const queryTripwire = (data: string) => http.fetch('queryTripwire', getXmlWrapData(data))

/**
 * @description 修改越界侦测数据
 * @param {string} data
 * @returns
 */
export const editTripwire = (data: string) => http.fetch('editTripwire', getXmlWrapData(data))

/**
 * @description 获取区域入侵侦测数据
 * @param {string} data
 * @returns
 */
export const queryIntelAreaConfig = (data: string) => http.fetch('queryIntelAreaConfig', getXmlWrapData(data), {}, false)

/**
 * @description 修改区域入侵侦测数据
 * @param {string} data
 * @returns
 */
export const editIntelAreaConfig = (data: string) => http.fetch('editIntelAreaConfig', getXmlWrapData(data))

/**
 * @description 获取组合报警数据
 * @returns
 */
export const queryCombinedAlarm = () => http.fetch('queryCombinedAlarm', getXmlWrapData(''))

/**
 * @description 获取已配置的人脸库分组
 * @returns
 */
export const queryCombinedAlarmFaceMatch = () => http.fetch('queryCombinedAlarmFaceMatch', getXmlWrapData(''))

/**
 * @description 人脸比对中请求后侦测开关
 * @param {string} data
 * @returns
 */
export const queryBackFaceMatch = (data?: string) => http.fetch('queryBackFaceMatch', getXmlWrapData(data || ''))

/**
 * @description 修改组合报警数据
 * @param {string} data
 * @returns
 */
export const editCombinedAlarm = (data: string) => http.fetch('editCombinedAlarm', getXmlWrapData(data))

/**
 * @description 修改组合报警人脸匹配数据
 * @param {string} data
 * @returns
 */
export const editCombinedAlarmFaceMatch = (data: string) => http.fetch('editCombinedAlarmFaceMatch', getXmlWrapData(data))

/**
 * @description 获取火点检测数据
 * @param {string} data
 * @returns
 */
export const querySmartFireConfig = (data: string) => http.fetch('querySmartFireConfig', getXmlWrapData(data))

/**
 * @description 修改火点检测数据
 * @param {string} data
 * @returns
 */
export const editSmartFireConfig = (data: string) => http.fetch('editSmartFireConfig', getXmlWrapData(data))

/**
 * @description 获取人脸侦测数据
 * @param {string} data
 * @returns
 */
export const queryVfd = (data: string) => http.fetch('queryVfd', getXmlWrapData(data))

/**
 * @description 修改人脸侦测数据
 * @param {string} data
 * @returns
 */
export const editVfd = (data: string) => http.fetch('editVfd', getXmlWrapData(data))

/**
 * @description 修改人脸匹配数据
 * @param {string} data
 * @returns
 */
export const editRealFaceMatch = (data: string) => http.fetch('editRealFaceMatch', getXmlWrapData(data))

/**
 * @description 获取人脸匹配配置数据
 * @param {string} data
 * @returns
 */
export const queryFaceMatchConfig = (data: string) => http.fetch('queryFaceMatchConfig', getXmlWrapData(data))

/**
 * @description 修改人脸匹配配置数据
 * @param {string} data
 * @returns
 */
export const editFaceMatchConfig = (data: string) => http.fetch('editFaceMatchConfig', getXmlWrapData(data))

/**
 * @description 获取人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const queryFaceMatchAlarmParam = (data: string) => http.fetch('queryFaceMatchAlarmParam', getXmlWrapData(data))

/**
 * @description 修改人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const editFaceMatchAlarmParam = (data: string) => http.fetch('editFaceMatchAlarmParam', getXmlWrapData(data))

/**
 * @description 删除人脸匹配报警参数
 * @param {string} data
 * @returns
 */
export const deleteFaceMatchAlarmParam = (data: string) => http.fetch('deleteFaceMatchAlarmParam', getXmlWrapData(data))

/**
 * @description 获取车辆识别参数
 * @param {string} data
 * @returns
 */
export const queryVehicleConfig = (data: string) => http.fetch('queryVehicleConfig', getXmlWrapData(data))

/**
 * @description 获取过线检测数据
 * @param {string} data
 * @returns
 */
export const queryPls = (data: string) => http.fetch('queryPls', getXmlWrapData(data))

/**
 * @description 修改过线检测数据
 * @param {string} data
 * @returns
 */
export const editPls = (data: string) => http.fetch('editPls', getXmlWrapData(data))

/**
 * @description 获取定时发送邮件数据
 * @returns
 */
export const queryTimingSendEmail = () => http.fetch('queryTimingSendEmail', getXmlWrapData(''))

/**
 * @description 修改定时发送邮件数据
 * @param {string} data
 * @returns
 */
export const editTimingSendEmail = (data: string) => http.fetch('editTimingSendEmail', getXmlWrapData(data))

/**
 * @description 重置cpc信息
 * @param {string} data
 * @returns
 */
export const forceResetCpc = (data: string) => http.fetch('forceResetCpc', getXmlWrapData(data))

/**
 * @description 获取cpc信息
 * @param {string} data
 * @returns
 */
export const queryCpc = (data: string) => http.fetch('queryCpc', getXmlWrapData(data))

/**
 * @description 编辑cpc信息
 * @param {string} data
 * @returns
 */
export const editCpc = (data: string) => http.fetch('editCpc', getXmlWrapData(data))

/**
 * @description 获取车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const queryVehicleMatchAlarm = (data: string) => http.fetch('queryVehicleMatchAlarm', getXmlWrapData(data))

/**
 * @description 修改车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const editVehicleMatchAlarm = (data: string) => http.fetch('editVehicleMatchAlarm', getXmlWrapData(data))

/**
 * @description 删除车牌匹配报警参数
 * @param {string} data
 * @returns
 */
export const deleteVehicleMatchAlarm = (data: string) => http.fetch('deleteVehicleMatchAlarm', getXmlWrapData(data))

/**
 * @description 修改车辆侦测数据
 * @param {string} data
 * @returns
 */
export const editVehicleConfig = (data: string) => http.fetch('editVehicleConfig', getXmlWrapData(data))

/**
 * @description 获取温度检测数据
 * @param {string} data
 * @returns
 */
export const queryTemperatureAlarmConfig = (data: string) => http.fetch('queryTemperatureAlarmConfig', getXmlWrapData(data))

/**
 * @description 修改温度检测数据
 * @param {string} data
 * @returns
 */
export const editTemperatureAlarmConfig = (data: string) => http.fetch('editTemperatureAlarmConfig', getXmlWrapData(data))

/**
 * @description 获取物品遗留与看护数据
 * @param {string} data
 * @returns
 */
export const queryOsc = (data: string) => http.fetch('queryOsc', getXmlWrapData(data))

/**
 * @description 修改物品遗留与看护数据
 * @param {string} data
 * @returns
 */
export const editOsc = (data: string) => http.fetch('editOsc', getXmlWrapData(data))

/**
 * @description 获取人群密度检测数据
 * @param {string} data
 * @returns
 */
export const queryCdd = (data: string) => http.fetch('queryCdd', getXmlWrapData(data))

/**
 * @description 修改人群密度检测数据
 * @param {string} data
 * @returns
 */
export const editCdd = (data: string) => http.fetch('editCdd', getXmlWrapData(data))

/**
 * @description 获取异常侦测数据
 * @param {string} data
 * @returns
 */
export const queryAvd = (data: string) => http.fetch('queryAvd', getXmlWrapData(data))

/**
 * @description 修改异常侦测数据
 * @param {string} data
 * @returns
 */
export const editAvd = (data: string) => http.fetch('editAvd', getXmlWrapData(data))

/**
 * @description 获取视频结构化数据
 * @param {string} data
 * @returns
 */
export const queryVideoMetadata = (data: string) => http.fetch('queryVideoMetadata', getXmlWrapData(data))

/**
 * @description 手动重置数据
 * @param {string} data
 * @returns
 */
export const editVideoMetadata = (data: string) => http.fetch('editVideoMetadata', getXmlWrapData(data))
