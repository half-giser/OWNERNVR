/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-18 10:34:31
 */

import { type AxiosRequestConfig } from 'axios'
import http from './api'

// 查询报警输出参数
export const queryAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('queryAlarmOutParam', getXmlWrapData(data), config)

// 编辑报警输出参数
export const editAlarmOutParam = (data: string, config?: AxiosRequestConfig) => http.fetch('editAlarmOutParam', getXmlWrapData(data), config)

// 获取事件通知相关参数
export const queryEventNotifyParam = () => http.fetch('queryEventNotifyParam', getXmlWrapData(''))

// 修改事件通知显示
export const editEventNotifyParam = (data: string) => http.fetch('editEventNotifyParam', getXmlWrapData(data))

// 修改事件通知显示
export const testMobilePush = () => http.fetch('testMobilePush', getXmlWrapData(''))

// 查询灯光报警输出配置
export const queryWhiteLightAlarmOutCfg = (data: string) => http.fetch('queryWhiteLightAlarmOutCfg', getXmlWrapData(data))

// 编辑灯光报警输出配置
export const editWhiteLightAlarmOutCfg = (data: string) => http.fetch('editWhiteLightAlarmOutCfg', getXmlWrapData(data))

// 查询报警服务器配置
export const queryAlarmServerParam = () => http.fetch('queryAlarmServerParam', getXmlWrapData(''))

// 测试报警服务器配置
export const testAlarmServerParam = (data: string) => http.fetch('testAlarmServerParam', getXmlWrapData(data))

// 编辑报警服务器配置
export const editAlarmServerParam = (data: string) => http.fetch('editAlarmServerParam', getXmlWrapData(data))

// 查询移动侦测数据
export const queryMotion = (data: string) => http.fetch('queryMotion', getXmlWrapData(data))

// 编辑移动侦测数据
export const editMotion = (data: string) => http.fetch('editMotion', getXmlWrapData(data))

// 获取语音播报相关参数
export const queryAudioAlarmOutCfg = (data: string) => http.fetch('queryAudioAlarmOutCfg', getXmlWrapData(data))

// 添加语音播报语音信息
export const addCustomizeAudioAlarm = (data: string) => http.fetch('addCustomizeAudioAlarm', getXmlWrapData(data))

// 删除语音播报语音信息
export const deleteCustomizeAudioAlarm = (data: string) => http.fetch('deleteCustomizeAudioAlarm', getXmlWrapData(data))

// 语音播报语音试听
export const auditionCustomizeAudioAlarm = (data: string) => http.fetch('auditionCustomizeAudioAlarm', getXmlWrapData(data))

// 修改语音播报信息
export const editAudioAlarmOutCfg = (data: string) => http.fetch('editAudioAlarmOutCfg', getXmlWrapData(data))

// 获取声音设备相关参数
export const queryAudioStreamConfig = (data: string) => http.fetch('queryAudioStreamConfig', getXmlWrapData(data))

// 修改声音设备信息
export const editAudioStreamConfig = (data: string) => http.fetch('editAudioStreamConfig', getXmlWrapData(data))

// 获取本地声音报警的文件列表数据
export const queryAlarmAudioCfg = () => http.fetch('queryAlarmAudioCfg', getXmlWrapData(''))

// 添加本地声音报警文件
export const addAlarmAudioCfg = (data: string) => http.fetch('addAlarmAudioCfg', getXmlWrapData(data))

// 删除本地声音报警文件
export const deleteAlarmAudio = (data: string) => http.fetch('deleteAlarmAudio', getXmlWrapData(data))

// 获取传感器数据
export const queryAlarmIn = (data: string) => http.fetch('queryAlarmIn', getXmlWrapData(data))

// 修改传感器数据
export const editAlarmIn = (data: string) => http.fetch('editAlarmIn', getXmlWrapData(data))

// 获取前端掉线数据
export const queryFrontEndOfflineTrigger = (data: string) => http.fetch('queryFrontEndOfflineTrigger', getXmlWrapData(data))

// 修改前端掉线数据
export const editFrontEndOfflineTrigger = (data: string) => http.fetch('editFrontEndOfflineTrigger', getXmlWrapData(data))

// 获取异常报警数据
export const queryAbnormalTrigger = () => http.fetch('queryAbnormalTrigger', getXmlWrapData(''))

// 修改异常报警数据
export const editAbnormalTrigger = (data: string) => http.fetch('editAbnormalTrigger', getXmlWrapData(data))

// 获取系统撤防数据
export const querySystemDisArmParam = () => http.fetch('querySystemDisArmParam', getXmlWrapData(''))

// 修改系统撤防数据
export const editSystemDisArmParam = (data: string) => http.fetch('editSystemDisArmParam', getXmlWrapData(data))

// 获取视频丢失数据
export const queryVideoLossTrigger = (data: string) => http.fetch('queryVideoLossTrigger', getXmlWrapData(data))

// 修改视频丢失数据
export const editVideoLossTrigger = (data: string) => http.fetch('editVideoLossTrigger', getXmlWrapData(data))

// 获取AI资源数据
export const queryAIResourceDetail = (data: string) => http.fetch('queryAIResourceDetail', getXmlWrapData(data))

// 释放AI资源
export const freeAIOccupyResource = (data: string) => http.fetch('freeAIOccupyResource', getXmlWrapData(data))

// 获取云台锁定状态
export const queryBallIPCPTZLockCfg = (data: string) => http.fetch('queryBallIPCPTZLockCfg', getXmlWrapData(data))

// 锁定云台
export const editBallIPCPTZLockCfg = (data: string) => http.fetch('editBallIPCPTZLockCfg', getXmlWrapData(data))

// 获取越界侦测数据
export const queryTripwire = (data: string) => http.fetch('queryTripwire', getXmlWrapData(data))

// 修改越界侦测数据
export const editTripwire = (data: string) => http.fetch('editTripwire', getXmlWrapData(data))

// 获取区域入侵侦测数据
export const queryIntelAreaConfig = (data: string) => http.fetch('queryIntelAreaConfig', getXmlWrapData(data))

// 修改区域入侵侦测数据
export const editIntelAreaConfig = (data: string) => http.fetch('editIntelAreaConfig', getXmlWrapData(data))

// 获取组合报警数据
export const queryCombinedAlarm = () => http.fetch('queryCombinedAlarm', getXmlWrapData(''))

// 获取已配置的人脸库分组
export const queryCombinedAlarmFaceMatch = () => http.fetch('queryCombinedAlarmFaceMatch', getXmlWrapData(''))

// 人脸比对中请求后侦测开关
export const queryBackFaceMatch = (data?: string) => http.fetch('queryBackFaceMatch', getXmlWrapData(data || ''))

// 修改组合报警数据
export const editCombinedAlarm = (data: string) => http.fetch('editCombinedAlarm', getXmlWrapData(data))

// 修改组合报警人脸匹配数据
export const editCombinedAlarmFaceMatch = (data: string) => http.fetch('editCombinedAlarmFaceMatch', getXmlWrapData(data))

// 获取火点检测数据
export const querySmartFireConfig = (data: string) => http.fetch('querySmartFireConfig', getXmlWrapData(data))

// 修改火点检测数据
export const editSmartFireConfig = (data: string) => http.fetch('editSmartFireConfig', getXmlWrapData(data))

// 获取人脸侦测数据
export const queryVfd = (data: string) => http.fetch('queryVfd', getXmlWrapData(data))

// 修改人脸侦测数据
export const editVfd = (data: string) => http.fetch('editVfd', getXmlWrapData(data))

// 修改人脸匹配数据
export const editRealFaceMatch = (data: string) => http.fetch('editRealFaceMatch', getXmlWrapData(data))

// 获取人脸匹配配置数据
export const queryFaceMatchConfig = (data: string) => http.fetch('queryFaceMatchConfig', getXmlWrapData(data))

// 修改人脸匹配配置数据
export const editFaceMatchConfig = (data: string) => http.fetch('editFaceMatchConfig', getXmlWrapData(data))

// 获取人脸匹配报警参数
export const queryFaceMatchAlarmParam = (data: string) => http.fetch('queryFaceMatchAlarmParam', getXmlWrapData(data))

// 修改人脸匹配报警参数
export const editFaceMatchAlarmParam = (data: string) => http.fetch('editFaceMatchAlarmParam', getXmlWrapData(data))

// 删除人脸匹配报警参数
export const deleteFaceMatchAlarmParam = (data: string) => http.fetch('deleteFaceMatchAlarmParam', getXmlWrapData(data))

// 获取车辆识别参数
export const queryVehicleConfig = (data: string) => http.fetch('queryVehicleConfig', getXmlWrapData(data))

// 获取车牌匹配报警参数
export const queryVehicleMatchAlarm = (data: string) => http.fetch('queryVehicleMatchAlarm', getXmlWrapData(data))

// 修改车牌匹配报警参数
export const editVehicleMatchAlarm = (data: string) => http.fetch('editVehicleMatchAlarm', getXmlWrapData(data))

// 删除车牌匹配报警参数
export const deleteVehicleMatchAlarm = (data: string) => http.fetch('deleteVehicleMatchAlarm', getXmlWrapData(data))

// 修改车辆侦测数据
export const editVehicleConfig = (data: string) => http.fetch('editVehicleConfig', getXmlWrapData(data))

// 获取温度检测数据
export const queryTemperatureAlarmConfig = (data: string) => http.fetch('queryTemperatureAlarmConfig', getXmlWrapData(data))

// 修改温度检测数据
export const editTemperatureAlarmConfig = (data: string) => http.fetch('editTemperatureAlarmConfig', getXmlWrapData(data))

// 获取物品遗留与看护数据
export const queryOsc = (data: string) => http.fetch('queryOsc', getXmlWrapData(data))

// 修改物品遗留与看护数据
export const editOsc = (data: string) => http.fetch('editOsc', getXmlWrapData(data))
