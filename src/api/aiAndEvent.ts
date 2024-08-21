/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 16:25:58
 * @Description: AI/事件
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-21 15:17:12
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
