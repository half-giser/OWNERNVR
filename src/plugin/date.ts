/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-23 09:10:50
 * @Description: 日期相关方法
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import jalaliday from 'jalaliday'

export default {
    install: () => {
        dayjs.extend(utc)
        dayjs.extend(jalaliday)
    },
}
