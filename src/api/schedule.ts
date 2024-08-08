/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 18:06:18
 * @Description: 排程
 */

import http from './api'

// 获取排程列表
export const queryScheduleList = () => http.fetch('queryScheduleList', getXmlWrapData(''))

// 获取排程详情
export const querySchedule = (data: string) => http.fetch('querySchedule', getXmlWrapData(data))

// 创建排程
export const createSchedule = (data: string) => http.fetch('createSchedule', getXmlWrapData(data))

// 编辑排程
export const editSchedule = (data: string) => http.fetch('editSchedule', getXmlWrapData(data))

// 删除排程
export const delSchedule = (data: string) => http.fetch('delSchedule', getXmlWrapData(data))
