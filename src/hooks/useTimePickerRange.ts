/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 11:30:08
 * @Description: 起止时间范围选择的时间选择器的选项禁用规则
 */
import dayjs from 'dayjs'

export const useTimePickerRange = (currentStartTime: Ref<string> | ComputedRef<string>, currentEndTime: Ref<string> | ComputedRef<string>) => {
    const TIME_FORMAT = 'HH:mm:ss'

    /**
     * @description 禁止开始时间选择部分小时选项
     */
    const disabledStartTimeHours = () => {
        const endTime = dayjs(currentEndTime.value, TIME_FORMAT)
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
        const endTime = dayjs(currentEndTime.value, TIME_FORMAT)
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
        const endTime = dayjs(currentEndTime.value, TIME_FORMAT)
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
        const startTime = dayjs(currentStartTime.value, TIME_FORMAT)
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
        const startTime = dayjs(currentStartTime.value, TIME_FORMAT)
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
        const startTime = dayjs(currentStartTime.value, TIME_FORMAT)
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
        disabledStartTimeHours,
        disabledStartTimeMinutes,
        disabledStartTimeSeconds,
        disabledEndTimeHours,
        disabledEndTimeMinutes,
        disabledEndTimeSeconds,
    }
}
