/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 15:10:50
 * @Description: 改写原型方法
 */
// import { parseDateToPersianCalendar } from '@/utils/tools'
// import { useUserSessionStore } from '@/stores/userSession'

export default {
    install: () => {
        // const userSessionStore = useUserSessionStore()

        /**
         * @description: 字符串格式化变量
         * @param {string[]} args 替换的字符
         * @return {string}
         * 示例: "Should be between %1 and %2!".formatForLang('10', '100') => "Should be between 10 and 100!"
         */
        String.prototype.formatForLang = function (...args: string[]): string {
            let str = <string>this
            if (args.length === 0) return str
            for (let i = 0; i < args.length; i++) {
                const reg = new RegExp('(%' + (i + 1) + ')', 'g')
                str = args[i] !== undefined ? str.replace(reg, args[i]) : str.replace(reg, '')
            }
            return str
        }

        /*
         * 调用方式
         * let template1 = "apple is {0}，banana is {1}";
         * let result1 = template1.format("red","yellow");
         */
        String.prototype.format = function (...args: string[]) {
            let str = <string>this
            if (args.length > 0) {
                for (let i = 0; i < args.length; i++) {
                    if (args[i] !== undefined) {
                        const reg = new RegExp('({[' + i + ']})', 'g')
                        str = str.replace(reg, args[i])
                    }
                }
            }
            return str
        }

        String.prototype.toBoolean = function () {
            return (this as string).toLowerCase() === 'true'
        }

        String.prototype.bool = function () {
            return (this as string).toLowerCase() === 'true'
        }

        String.prototype.num = function () {
            return Number(this as string)
        }

        Boolean.prototype.toString = function (): string {
            return this ? 'true' : 'false'
        }

        /**
         * @deprecated 统一使用dayjs. 原因：element-plus依赖dayjs，即本项目必须依赖dayjs. 使用dayjs来处理日期格式化，可以更方便地和element-plus的日期组件交互
         * @description: 格式化日期格式
         * @param {string} template yyyy-MM-dd HH:mm:ss tt
         * @return {string} 2024-06-14 10:40:54 AM
         */
        // Date.prototype.format = function (template: string): string {
        //     const year = this.getFullYear()
        //     const month = this.getMonth()
        //     const day = this.getDate()
        //     const hours = this.getHours()
        //     const minutes = this.getMinutes()
        //     const seconds = this.getSeconds()
        //     const milliseconds = this.getMilliseconds()
        //     type dateType = { year: number; month: number; day: number } | null
        //     const dateObj: dateType = userSessionStore.calendarType === 'Persian' ? parseDateToPersianCalendar(this) : { year: year, month: month, day: day }
        //     if (!dateObj) return 'yyyy-MM-dd HH:mm:ss tt'
        //     // yyyy-MM-dd HH:mm:ss tt
        //     const formatDateObj: Record<string, any> = {
        //         'M+': dateObj.month + 1, // month
        //         'd+': dateObj.day, // day
        //         'H+': hours, // hour（24小时制）
        //         'h+': (function () {
        //             if (hours === 0) {
        //                 return 12
        //             } else if (hours > 12) {
        //                 return hours - 12
        //             } else {
        //                 return hours
        //             }
        //         })(), // hour（12小时制）
        //         'm+': minutes, // minute
        //         's+': seconds, // second
        //         'q+': Math.floor((dateObj.month + 3) / 3), // quarter
        //         S: milliseconds, // millisecond
        //         tt: (function () {
        //             if (hours < 12) {
        //                 return 'AM'
        //             } else {
        //                 return 'PM'
        //             }
        //         })(),
        //     }
        //     // year
        //     if (/(y+)/.test(template)) {
        //         template = template.replace(RegExp.$1, (dateObj.year + '').substr(4 - RegExp.$1.length))
        //     }

        //     // template
        //     for (const k in formatDateObj) {
        //         if (new RegExp('(' + k + ')').test(template)) {
        //             template = template.replace(RegExp.$1, RegExp.$1.length === 1 ? formatDateObj[k] : ('00' + formatDateObj[k]).substr(('' + formatDateObj[k]).length))
        //         }
        //     }
        //     return template
        // }
    },
}
