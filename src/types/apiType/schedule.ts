/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 18:04:03
 * @Description: 排程的类型定义，类型命名的前缀统一为Schedule*
 */

/**
 * @description 排程-排程信息
 */
export class ScheduleDto {
    id = '' // id
    name = '' // 名称
}

/**
 * @description 排程-排程信息
 */
export class ScheduleInfo {
    id = '' // id
    name = '' // 名称
    // 排程时间段，第一层数组7个元素，代表天，0代表周日，第二层数组n个元素，代表一天的时间段，第三层数组代表单个时间段[startTime, endTime]
    timespan: [string, string][][] = []
}
