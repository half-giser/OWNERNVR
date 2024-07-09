/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-23 09:10:50
 * @Description: 日期相关方法
 */
// import type { App } from "vue"
// import moment from "moment" // moment可参考: https://blog.csdn.net/qq_60976312/article/details/127512468
// import type { Moment, unitOfTime } from "moment"

// export default {
//     install: (app: App<Element>) => {
//         app.config.globalProperties.FormatDate = formatDate
//     }
// }
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import jalaliday from 'jalaliday'

export default {
    install: () => {
        dayjs.extend(utc)
        dayjs.extend(jalaliday)
    },
}
