/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:09:44
 * @Description: 现场预览-目标检测视图-人脸比对项组件
 */
import { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据
         */
        data: {
            type: Object as PropType<WebsocketSnapOnSuccessSnap>,
            required: true,
        },
        /**
         * @property 边框类型
         */
        border: {
            type: Number,
            default: 0,
        },
    },
    emits: {
        add() {
            return true
        },
        detail() {
            return true
        },
        search(src: string) {
            return typeof src === 'string'
        },
        playRec() {
            return true
        },
        faceDetail() {
            return true
        },
    },
    setup() {
        const dateTime = useDateTimeStore()

        /**
         * @description 显示Base64图片
         * @param {string} src
         * @returns {string}
         */
        const displayBase64Img = (src?: null | string) => {
            return 'data:image/png;base64,' + String(src)
        }

        /**
         * @description 格式化时间
         * @param {number} time
         * @returns {string}
         */
        const displayTime = (time: number) => {
            return formatDate(time, dateTime.timeFormat)
        }

        return {
            displayBase64Img,
            displayTime,
        }
    },
})
