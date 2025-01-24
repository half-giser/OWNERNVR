/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-26 11:23:41
 * @Description: 录像模块API
 */
import fetch from './api'

/**
 * @description 查询录像模式配置信息
 * @returns
 */
export const queryRecordDistributeInfo = () => fetch('queryRecordDistributeInfo', '')

/**
 * @description 设置录像模式配置信息
 * @param {string} data
 * @returns
 */
export const editRecordDistributeInfo = (data: string) => fetch('editRecordDistributeInfo', data)

/**
 * @description 获取通道的录像排程配置
 * @returns
 */
export const queryRecordScheduleList = () => fetch('queryRecordScheduleList', '')

/**
 * @description 设置通道的录像排程配置
 * @param {string} data
 * @returns
 */
export const editRecordScheduleList = (data: string) => fetch('editRecordScheduleList', data)
