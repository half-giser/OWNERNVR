/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 18:06:18
 * @Description: 排程
 */

import http from './api'

/**
 * @description 获取排程列表
 * @returns
 */
export const queryScheduleList = () => http.fetch('queryScheduleList', '')

/**
 * @description 获取排程详情
 * @param {string} data
 * @returns
 */
export const querySchedule = (data: string) => http.fetch('querySchedule', data)

/**
 * @description 创建排程
 * @param {string} data
 * @returns
 */
export const createSchedule = (data: string) => http.fetch('createSchedule', data)

/**
 * @description 编辑排程
 * @param {string} data
 * @returns
 */
export const editSchedule = (data: string) => http.fetch('editSchedule', data)

/**
 * @description 删除排程
 * @param {string} data
 * @returns
 */
export const delSchedule = (data: string) => http.fetch('delSchedule', data)
