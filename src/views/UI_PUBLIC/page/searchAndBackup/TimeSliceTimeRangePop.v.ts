/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 16:59:08
 * @Description: 设置时间范围弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 17:01:52
 */
import dayjs from 'dayjs'

export default defineComponent({
    props: {
        /**
         * @property 时间格式
         */
        timeFormat: {
            type: String,
            required: true,
        },
        /**
         * @property 当前时间
         */
        date: {
            type: Number,
            required: true,
        },
    },
    emits: {
        confirm(startTime: number, endTime: number) {
            return typeof startTime === 'number' && typeof endTime === 'number'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const formData = ref({
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: '',
        })

        /**
         * @property 打开表单时 重置表单数据
         */
        const open = () => {
            formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(prop.timeFormat)
            formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(prop.timeFormat)
        }

        /**
         * @property 确认表单 关闭弹窗
         */
        const confirm = () => {
            const date = dayjs(prop.date)
            const startTime = dayjs(formData.value.startTime, prop.timeFormat)
            const endTime = dayjs(formData.value.endTime, prop.timeFormat)
            ctx.emit(
                'confirm',
                date.hour(startTime.hour()).minute(startTime.minute()).second(startTime.second()).valueOf(),
                date.hour(endTime.hour()).minute(endTime.minute()).second(endTime.second()).valueOf(),
            )
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 禁止开始时间选择部分小时选项
         */
        const disabledStartTimeHours = () => {
            const endTime = dayjs(formData.value.endTime, prop.timeFormat)
            const hours = []
            for (let i = endTime.hour() + 1; i <= 23; i++) {
                hours.push(i)
            }
            return hours
        }

        /**
         * @description 禁止开始时间选择部分分钟选项
         * @param {Number} hour
         */
        const disabledStartTimeMinutes = (hour: number) => {
            const endTime = dayjs(formData.value.endTime, prop.timeFormat)
            if (hour < endTime.hour()) {
                return []
            }
            const minutes = []
            for (let i = endTime.minute() + 1; i <= 59; i++) {
                minutes.push(i)
            }
            return minutes
        }

        /**
         * @description 禁止开始时间选择部分秒选项
         * @param {Number} hour
         * @param {Number} minute
         */
        const disabledStartTimeSeconds = (hour: number, minute: number) => {
            const endTime = dayjs(formData.value.endTime, prop.timeFormat)
            if (hour === endTime.hour() && minute === endTime.minute()) {
                const seconds = []
                for (let i = endTime.second(); i <= 59; i++) {
                    seconds.push(i)
                }
                return seconds
            }
            return []
        }

        /**
         * @description 禁止结束时间选择部分小时选项
         */
        const disabledEndTimeHours = () => {
            const startTime = dayjs(formData.value.startTime, prop.timeFormat)
            const hours = []
            for (let i = 0; i < startTime.hour(); i++) {
                hours.push(i)
            }
            return hours
        }

        /**
         * @description 禁止结束时间选择部分分钟选项
         * @param {Number} hour
         */
        const disabledEndTimeMinutes = (hour: number) => {
            const startTime = dayjs(formData.value.startTime, prop.timeFormat)
            const minutes = []
            if (hour > startTime.hour()) {
                return []
            }
            for (let i = 0; i < startTime.minute(); i++) {
                minutes.push(i)
            }
            return minutes
        }

        /**
         * @description 禁止结束时间选择部分秒选项
         * @param {Number} hour
         * @param {Number} minute
         */
        const disabledEndTimeSeconds = (hour: number, minute: number) => {
            const startTime = dayjs(formData.value.startTime, prop.timeFormat)
            const seconds = []
            if (hour === startTime.hour() && minute === startTime.minute()) {
                for (let i = 0; i <= startTime.second(); i++) {
                    seconds.push(i)
                }
                return seconds
            }
            return []
        }

        return {
            confirm,
            close,
            formData,
            open,
            disabledStartTimeHours,
            disabledStartTimeMinutes,
            disabledStartTimeSeconds,
            disabledEndTimeHours,
            disabledEndTimeMinutes,
            disabledEndTimeSeconds,
        }
    },
})
