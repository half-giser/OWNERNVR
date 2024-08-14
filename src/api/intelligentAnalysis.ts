/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 智能分析
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 18:22:16
 */
import http, { getXmlWrapData } from './api'

/**
 * @description 获取报警状态
 * @returns
 */
export const getAlarmOutStatus = () => http.fetch('getAlarmOutStatus', getXmlWrapData(''))

/**
 * @description 设置报警状态
 * @param {string} data
 * @returns
 */
export const setAlarmOutStatus = (data: string) => http.fetch('setAlarmOutStatus', getXmlWrapData(data))

/**
 * @description 手动解锁
 * @param {string} data
 * @returns
 */
export const manualUnlocking = (data: string) => http.fetch('manualUnlocking', getXmlWrapData(data))
