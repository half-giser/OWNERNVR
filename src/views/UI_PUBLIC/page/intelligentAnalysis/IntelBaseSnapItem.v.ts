/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-21 10:30:00
 * @Description: 智能分析-人、车
 */

export default defineComponent({
    props: {
        /**
         * @property 视频结构化属性
         */
        targetData: {
            type: Object as PropType<IntelTargetDataItem>,
            default: () => new IntelTargetDataItem(),
            require: true,
        },
    },
    setup() {
        const dateTime = useDateTimeStore()

        /**
         * @description 图片按规则自适应父容器
         * 显示规则：
         * 1、如果图片实际尺寸高>=宽，在高>=宽的区域铺满显示；在高<宽的区域按真实比例显示，左右留白
         * 2、如果图片实际尺寸高<宽，在高<=宽的区域铺满显示；在高>宽的区域按真实比例显示，上下留白
         * @param {Event} e
         */
        const loadImg = (e: Event) => {
            const img = e.currentTarget as HTMLImageElement
            // 图片实际尺寸高>=宽
            if (img.naturalHeight >= img.naturalWidth) {
                // 在高>=宽的区域铺满显示
                if (img.height >= img.width) {
                    img.style.objectFit = 'fill'
                }
                // 在高<宽的区域按真实比例显示，左右留白
                else {
                    img.style.objectFit = 'contain'
                }
            }
            // 图片实际尺寸高<宽
            else {
                // 高<=宽的区域铺满显示
                if (img.height <= img.width) {
                    img.style.objectFit = 'fill'
                }
                // 在高>宽的区域按真实比例显示，上下留白
                else {
                    img.style.objectFit = 'contain'
                }
            }
        }

        /**
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        return {
            loadImg,
            displayDateTime,
        }
    },
})
