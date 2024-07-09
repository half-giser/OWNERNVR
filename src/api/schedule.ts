/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 18:06:18
 * @Description: 排程
 */

import http from './api'

// 获取排程列表
export const queryScheduleList = () => http.fetch('queryScheduleList', getXmlWrapData(''))
