/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 16:50:41
 * @Description: 按时间切片 缩略图卡片
 */
export default defineComponent({
    props: {
        /**
         * @property icon | thumbnail
         */
        mode: {
            type: String,
            default: 'icon',
        },
        /**
         * @property 时间字符串
         */
        time: {
            type: String,
            default: '',
        },
        /**
         * @property 通道名称
         */
        chlName: {
            type: String,
            default: '',
        },
        /**
         * @property 缩略图URL
         */
        pic: {
            type: String,
            default: '',
        },
        /**
         * @property 是否选中状态
         */
        active: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 卡片大小 normal | small
         */
        size: {
            type: String,
            default: 'normal',
        },
        showTime: {
            type: Boolean,
            default: true,
        },
    },
})
