/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 16:59:08
 * @Description: 设置时间范围弹窗
 */
import dayjs from 'dayjs'

export default defineComponent({
    props: {
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
        const dateTime = useDateTimeStore()

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
            formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(dateTime.timeFormat)
            formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(dateTime.timeFormat)
        }

        /**
         * @property 确认表单 关闭弹窗
         */
        const confirm = () => {
            const date = dayjs(prop.date)
            const startTime = dayjs(formData.value.startTime, dateTime.timeFormat)
            const endTime = dayjs(formData.value.endTime, dateTime.timeFormat)
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

        return {
            confirm,
            close,
            formData,
            open,
        }
    },
})
