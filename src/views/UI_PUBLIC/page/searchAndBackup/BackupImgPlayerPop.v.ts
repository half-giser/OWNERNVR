/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:46:14
 * @Description: 图片浏览器
 */
import { type PlaybackSearchImgList } from '@/types/apiType/playback'

export default defineComponent({
    props: {
        /**
         * @property 列表项数据
         */
        item: {
            type: Object as PropType<PlaybackSearchImgList>,
            required: true,
        },
        /**
         * @description 列表总数量
         */
        total: {
            type: Number,
            required: true,
        },
    },
    emits: {
        prev() {
            return true
        },
        next() {
            return true
        },
        export() {
            return true
        },
        delete() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const dateTime = useDateTimeStore()

        const pageData = ref({
            visible: false,
            paused: true,
        })

        /**
         * @description 获取图像URL
         * @returns {String}
         */
        const getImg = () => {
            if (!pageData.value.visible) return ''
            if (!prop.item.chlId) return ''
            const data = {
                chlId: prop.item.chlId,
                captureMode: prop.item.captureMode,
                captureTime: prop.item.captureTime,
            }
            const url = `${import.meta.env.VITE_BASE_URL}viewPicture?${Object.entries(data)
                .map((item) => item.join('='))
                .join(',')}`
            return url
        }

        /**
         * @description 打开弹窗时才请求图像
         */
        const open = () => {
            pageData.value.visible = true
        }

        /**
         * @description 关闭弹窗时停止自动播放
         */
        const close = () => {
            pause()
            pageData.value.visible = false
            ctx.emit('close')
        }

        const timer = useRefreshTimer(() => {
            if (prop.item.index >= prop.total) {
                pause()
                return
            }
            ctx.emit('next')
            play()
        }, 3000)

        /**
         * @description 自动播放图像
         */
        const play = () => {
            pageData.value.paused = false
            timer.repeat()
        }

        /**
         * @description 停止自动播放
         */
        const pause = () => {
            pageData.value.paused = true
            timer.stop()
        }

        /**
         * @description 显示日期时间格式
         * @param {Number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            if (!timestamp) return ''
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        return {
            pageData,
            open,
            close,
            getImg,
            play,
            pause,
            displayDateTime,
        }
    },
})
